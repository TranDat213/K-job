'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { jobsApi, Job } from '../../lib/api';

// ─────────────────────────────────────────────────────────────────
// Payments page — aggregates jobs with payment-related statuses
// ponytail: no separate /payments API endpoint exists; filter jobs client-side
// ─────────────────────────────────────────────────────────────────

const PAYMENT_FILTER = [
  { value: '', label: 'Tất cả' },
  { value: 'WAITING_PAYMENT', label: 'Chờ thanh toán' },
  { value: 'PAID', label: 'Đã thanh toán' },
  { value: 'POSTED', label: 'Đã đăng' },
  { value: 'COMPLETED', label: 'Hoàn thành' },
];

const STATUS_STYLES: Record<string, { label: string; className: string }> = {
  WAITING_PAYMENT: { label: 'Chờ thanh toán', className: 'bg-warning/50 text-warning-foreground' },
  PAID:            { label: 'Đã thanh toán',  className: 'bg-success text-success-foreground' },
  POSTED:          { label: 'Đã đăng',        className: 'bg-soft-sage/60 text-soft-sage-foreground' },
  COMPLETED:       { label: 'Hoàn thành',     className: 'bg-success text-success-foreground' },
};

function fmt(d: string | null) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function isOverdue(d: string | null) {
  return d && new Date(d) < new Date();
}

export default function PaymentsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('WAITING_PAYMENT');

  const load = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const res = await jobsApi.getAll({ status: statusFilter || undefined, limit: 100 });
      const body = res as any;
      setJobs(body.data ?? []);
    } catch (e: any) { setError(e.message || 'Không thể tải dữ liệu'); }
    finally { setLoading(false); }
  }, [statusFilter]);

  useEffect(() => { load(); }, [load]);

  const overdueCount = jobs.filter((j) => isOverdue(j.paymentExpectedDate) && j.status === 'WAITING_PAYMENT').length;

  return (
    <div className="max-w-5xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">Thanh toán</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Theo dõi tình trạng thanh toán từ nhãn hàng</p>
        </div>
        {overdueCount > 0 && (
          <div className="flex items-center gap-2 bg-destructive/10 border border-destructive/20 text-destructive text-sm px-4 py-2 rounded-xl">
            <span>⚠️</span>
            <span><strong>{overdueCount}</strong> job quá hạn thanh toán</span>
          </div>
        )}
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1.5 flex-wrap">
        {PAYMENT_FILTER.map((f) => (
          <button
            key={f.value}
            onClick={() => setStatusFilter(f.value)}
            className={`px-3 py-2 rounded-xl text-xs font-medium transition-colors border ${
              statusFilter === f.value
                ? 'bg-primary text-primary-foreground border-primary'
                : 'bg-muted text-muted-foreground border-transparent hover:bg-card-border'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="bg-card border border-card-border rounded-2xl overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-muted-foreground">Đang tải...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-16 text-center px-6">
            <p className="text-sm text-destructive">{error}</p>
            <button onClick={load} className="mt-3 text-xs text-primary hover:underline">Thử lại</button>
          </div>
        ) : jobs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center px-6">
            <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center text-3xl mb-4">💰</div>
            <p className="text-base font-semibold text-foreground">Không có job nào</p>
            <p className="text-sm text-muted-foreground mt-1.5 max-w-sm">
              {statusFilter ? 'Không có job nào ở trạng thái này.' : 'Chưa có job nào có thông tin thanh toán.'}
            </p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b border-card-border bg-muted/50">
              <tr>
                <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Job</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Nhãn hàng</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Trạng thái</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Ngày đăng</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Hạn TT</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-card-border">
              {jobs.map((job) => {
                const st = STATUS_STYLES[job.status] ?? { label: job.status, className: 'bg-muted text-muted-foreground' };
                const overdue = isOverdue(job.paymentExpectedDate) && job.status === 'WAITING_PAYMENT';
                return (
                  <tr key={job.id} className={`hover:bg-muted/40 transition-colors ${overdue ? 'bg-destructive/5' : ''}`}>
                    <td className="px-5 py-4 font-medium text-foreground">{job.name}</td>
                    <td className="px-5 py-4 text-muted-foreground">{job.brand?.name ?? '—'}</td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex px-2.5 py-1 rounded-lg text-xs font-medium ${st.className}`}>
                        {st.label}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-muted-foreground">{fmt(job.postDate)}</td>
                    <td className="px-5 py-4">
                      <span className={overdue ? 'text-destructive font-semibold' : 'text-muted-foreground'}>
                        {overdue && '⚠️ '}{fmt(job.paymentExpectedDate)}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <Link href={`/jobs/${job.id}`} className="text-primary hover:text-primary-hover text-xs font-medium transition-colors">
                        Xem →
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
