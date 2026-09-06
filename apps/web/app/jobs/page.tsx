'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { jobsApi, Job, JobsListParams } from '../../lib/api';

import { JOB_STATUS_STYLES, JOB_FILTER_STATUSES } from '../../constants';

const STATUS_STYLES = JOB_STATUS_STYLES;
const FILTER_STATUSES = JOB_FILTER_STATUSES;

function fmt(dateStr: string | null) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

export default function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [meta, setMeta] = useState({ total: 0, page: 1, limit: 20 });

  const fetchJobs = useCallback(async (params: JobsListParams = {}) => {
    setLoading(true);
    setError('');
    try {
      const res = await jobsApi.getAll(params);
      // jobsApi.getAll returns paginated response shape
      const body = res as any;
      setJobs(body.data ?? []);
      if (body.meta) setMeta(body.meta);
    } catch (err: any) {
      setError(err.message || 'Không thể tải danh sách jobs');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchJobs({ status: status || undefined, search: search || undefined });
  }, [status, search, fetchJobs]);

  // Debounce search input
  const [searchInput, setSearchInput] = useState('');
  useEffect(() => {
    const t = setTimeout(() => setSearch(searchInput), 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  return (
    <div className="max-w-5xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">Công việc</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Quản lý tất cả các jobs KOC của bạn
            {!loading && meta.total > 0 && (
              <span className="ml-1 text-xs bg-muted px-2 py-0.5 rounded-full">
                {meta.total}
              </span>
            )}
          </p>
        </div>
        <Link
          href="/jobs/new"
          className="px-4 py-2.5 bg-primary text-primary-foreground text-sm font-semibold rounded-xl shadow-sm shadow-primary/20 hover:bg-primary-hover active:bg-primary-active transition-colors"
        >
          + Tạo job mới
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-card border border-card-border rounded-2xl p-4 flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="flex-1">
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Tìm kiếm theo tên job, nhãn hàng..."
            className="w-full px-4 py-2.5 bg-input border border-input-border rounded-xl text-sm text-foreground placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
          />
        </div>

        {/* Status filter */}
        <div className="flex gap-1.5 flex-wrap">
          {FILTER_STATUSES.map((s) => (
            <button
              key={s.value}
              onClick={() => setStatus(s.value)}
              className={`px-3 py-2 rounded-xl text-xs font-medium transition-colors border ${
                status === s.value
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-muted text-muted-foreground border-transparent hover:bg-card-border'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
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
            <button
              onClick={() => fetchJobs({ status: status || undefined })}
              className="mt-3 text-xs text-primary hover:underline"
            >
              Thử lại
            </button>
          </div>
        ) : jobs.length === 0 ? (
          /* Empty state */
          <div className="flex flex-col items-center justify-center py-16 text-center px-6">
            <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center text-3xl mb-4">
              💼
            </div>
            <p className="text-base font-semibold text-foreground">
              {search || status ? 'Không tìm thấy job nào' : 'Chưa có job nào'}
            </p>
            <p className="text-sm text-muted-foreground mt-1.5 max-w-sm">
              {search || status
                ? 'Thử thay đổi bộ lọc hoặc từ khoá tìm kiếm.'
                : 'Bắt đầu bằng cách tạo nhãn hàng và job đầu tiên. Hệ thống sẽ tự động tạo danh sách nhiệm vụ và nhắc nhở cho bạn.'}
            </p>
            {!search && !status && (
              <div className="flex gap-3 mt-5">
                <Link
                  href="/brands"
                  className="px-4 py-2 bg-muted text-foreground text-sm font-medium rounded-xl hover:bg-card-border transition-colors"
                >
                  🏷️ Tạo nhãn hàng trước
                </Link>
                <Link
                  href="/jobs/new"
                  className="px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-xl hover:bg-primary-hover transition-colors"
                >
                  + Tạo job đầu tiên
                </Link>
              </div>
            )}
          </div>
        ) : (
          /* Jobs table */
          <table className="w-full text-sm">
            <thead className="border-b border-card-border bg-muted/50">
              <tr>
                <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Tên job</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Nhãn hàng</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Trạng thái</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Ngày đăng</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Tasks</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-card-border">
              {jobs.map((job) => {
                const st = STATUS_STYLES[job.status] ?? { label: job.status, className: 'bg-muted text-muted-foreground' };
                return (
                  <tr key={job.id} className="hover:bg-muted/40 transition-colors">
                    <td className="px-5 py-4 font-medium text-foreground">{job.name}</td>
                    <td className="px-5 py-4 text-muted-foreground">{job.brand?.name ?? '—'}</td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex px-2.5 py-1 rounded-lg text-xs font-medium ${st.className}`}>
                        {st.label}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-muted-foreground">{fmt(job.postDate)}</td>
                    <td className="px-5 py-4 text-muted-foreground text-xs">
                      {job._count?.tasks ?? 0} task{(job._count?.tasks ?? 0) !== 1 ? 's' : ''}
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

      {/* Pagination */}
      {!loading && !error && meta.total > meta.limit && (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>Hiển thị {jobs.length} / {meta.total} jobs</span>
          <div className="flex gap-2">
            <button
              disabled={meta.page <= 1}
              onClick={() => fetchJobs({ page: meta.page - 1, status: status || undefined, search: search || undefined })}
              className="px-3 py-1.5 bg-muted rounded-lg text-xs font-medium disabled:opacity-40 hover:bg-card-border transition-colors"
            >
              ← Trước
            </button>
            <span className="px-3 py-1.5 text-xs">Trang {meta.page}</span>
            <button
              disabled={meta.page * meta.limit >= meta.total}
              onClick={() => fetchJobs({ page: meta.page + 1, status: status || undefined, search: search || undefined })}
              className="px-3 py-1.5 bg-muted rounded-lg text-xs font-medium disabled:opacity-40 hover:bg-card-border transition-colors"
            >
              Tiếp →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
