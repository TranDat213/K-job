'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const JOB_TYPES = [
  { value: 'PRODUCT_REVIEW', label: 'Review sản phẩm' },
  { value: 'EVENT', label: 'Sự kiện' },
  { value: 'SELF_PURCHASE', label: 'Tự mua' },
  { value: 'CONTENT_CREATION', label: 'Tạo nội dung' },
  { value: 'AFFILIATE', label: 'Affiliate' },
  { value: 'OTHER', label: 'Khác' },
];

export default function NewJobPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ponytail: form controlled simply with a FormData on submit, not react-hook-form yet
  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const form = new FormData(e.currentTarget);
    const body = Object.fromEntries(
      [...form.entries()].filter(([, v]) => v !== ''),
    );

    try {
      const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002';
      const res = await fetch(`${API_BASE}/api/jobs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Tạo job thất bại');
      router.push('/jobs');
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/jobs" className="text-muted-foreground hover:text-foreground transition-colors text-sm">
          ← Quay lại
        </Link>
        <div>
          <h1 className="text-xl font-bold text-foreground">Tạo job mới</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Điền thông tin job KOC</p>
        </div>
      </div>

      {/* Notice: BE not ready yet */}
      <div className="bg-warning/30 border border-warning-foreground/20 rounded-xl px-4 py-3 text-sm text-warning-foreground flex items-center gap-2">
        <span>⚠️</span>
        <span>Tính năng tạo job sẽ hoạt động sau khi hoàn thiện phần Nhãn hàng. Hiện tại form đang ở chế độ xem trước.</span>
      </div>

      {error && (
        <div className="bg-destructive/15 border border-destructive/30 rounded-xl px-4 py-3 text-sm text-destructive-foreground flex items-center gap-2">
          <span>⚠️</span><span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-card border border-card-border rounded-2xl p-6 space-y-5">
        {/* Tên job */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-foreground mb-1.5">
            Tên job <span className="text-primary">*</span>
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            placeholder="VD: Review son Revive tháng 9"
            className="w-full px-4 py-2.5 bg-input border border-input-border rounded-xl text-sm text-foreground placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
          />
        </div>

        {/* Nhãn hàng */}
        <div>
          <label htmlFor="brandId" className="block text-sm font-medium text-foreground mb-1.5">
            Nhãn hàng <span className="text-primary">*</span>
          </label>
          <select
            id="brandId"
            name="brandId"
            required
            disabled
            className="w-full px-4 py-2.5 bg-input border border-input-border rounded-xl text-sm text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all disabled:opacity-60 cursor-not-allowed"
          >
            <option value="">— Chưa có nhãn hàng nào —</option>
          </select>
          <p className="text-xs text-muted-foreground mt-1">
            <Link href="/brands" className="text-primary hover:text-primary-hover">Tạo nhãn hàng</Link> trước rồi quay lại.
          </p>
        </div>

        {/* Loại job */}
        <div>
          <label htmlFor="jobType" className="block text-sm font-medium text-foreground mb-1.5">
            Loại job
          </label>
          <select
            id="jobType"
            name="jobType"
            className="w-full px-4 py-2.5 bg-input border border-input-border rounded-xl text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all"
          >
            {JOB_TYPES.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        </div>

        {/* Mô tả */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-foreground mb-1.5">
            Mô tả
          </label>
          <textarea
            id="description"
            name="description"
            rows={3}
            placeholder="Mô tả nội dung job..."
            className="w-full px-4 py-2.5 bg-input border border-input-border rounded-xl text-sm text-foreground placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all resize-none"
          />
        </div>

        {/* Dates */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="postDate" className="block text-sm font-medium text-foreground mb-1.5">
              Ngày đăng
            </label>
            <input
              id="postDate"
              name="postDate"
              type="date"
              className="w-full px-4 py-2.5 bg-input border border-input-border rounded-xl text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all"
            />
          </div>
          <div>
            <label htmlFor="paymentExpectedDate" className="block text-sm font-medium text-foreground mb-1.5">
              Ngày nhận tiền dự kiến
            </label>
            <input
              id="paymentExpectedDate"
              name="paymentExpectedDate"
              type="date"
              className="w-full px-4 py-2.5 bg-input border border-input-border rounded-xl text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all"
            />
          </div>
        </div>

        {/* Brief + Requirement */}
        <div>
          <label htmlFor="brief" className="block text-sm font-medium text-foreground mb-1.5">
            Brief / yêu cầu từ nhãn hàng
          </label>
          <textarea
            id="brief"
            name="brief"
            rows={3}
            placeholder="Dán link brief hoặc tóm tắt yêu cầu..."
            className="w-full px-4 py-2.5 bg-input border border-input-border rounded-xl text-sm text-foreground placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all resize-none"
          />
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <Link
            href="/jobs"
            className="flex-1 text-center px-4 py-2.5 bg-muted text-foreground text-sm font-medium rounded-xl hover:bg-card-border transition-colors"
          >
            Huỷ
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 px-4 py-2.5 bg-primary text-primary-foreground text-sm font-semibold rounded-xl shadow-sm shadow-primary/20 hover:bg-primary-hover active:bg-primary-active transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Đang tạo...' : 'Tạo job'}
          </button>
        </div>
      </form>
    </div>
  );
}
