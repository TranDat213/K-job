'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { templatesApi, JobTemplate, CreateTemplatePayload } from '../../lib/api';

const JOB_TYPE_LABELS: Record<string, string> = {
  PRODUCT_REVIEW: 'Review sản phẩm',
  EVENT: 'Sự kiện',
  SELF_PURCHASE: 'Tự mua',
  CONTENT_CREATION: 'Tạo nội dung',
  AFFILIATE: 'Affiliate',
  OTHER: 'Khác',
};

function TemplateDialog({
  editing,
  onClose,
  onSaved,
}: {
  editing: JobTemplate | null;
  onClose: () => void;
  onSaved: (t: JobTemplate) => void;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [form, setForm] = useState<CreateTemplatePayload>({ name: '', description: '', jobType: '' });
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');

  useEffect(() => {
    dialogRef.current?.showModal();
    if (editing) {
      setForm({ name: editing.name, description: editing.description ?? '', jobType: editing.jobType ?? '' });
    }
    return () => dialogRef.current?.close();
  }, [editing]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true); setErr('');
    try {
      const payload: CreateTemplatePayload = {
        name: form.name.trim(),
        description: form.description?.trim() || undefined,
        jobType: form.jobType?.trim() || undefined,
      };
      const res = editing
        ? await templatesApi.update(editing.id, payload)
        : await templatesApi.create(payload);
      onSaved(res.data);
    } catch (ex: any) { setErr(ex.message || 'Lỗi'); }
    finally { setSaving(false); }
  };

  return (
    <dialog ref={dialogRef} onClose={onClose}
      className="backdrop:bg-black/50 backdrop:backdrop-blur-sm bg-card border border-card-border rounded-2xl p-0 w-full max-w-md shadow-2xl">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-foreground">
            {editing ? 'Sửa mẫu việc' : 'Tạo mẫu việc mới'}
          </h2>
          <button type="button" onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-muted-foreground hover:bg-muted transition-colors">✕</button>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            Tên mẫu <span className="text-destructive">*</span>
          </label>
          <input required value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            placeholder="VD: Review mỹ phẩm tiêu chuẩn"
            className="px-3 py-2.5 bg-input border border-input-border rounded-xl text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Loại job</label>
          <select value={form.jobType ?? ''} onChange={(e) => setForm((f) => ({ ...f, jobType: e.target.value }))}
            className="px-3 py-2.5 bg-input border border-input-border rounded-xl text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all">
            <option value="">— Không phân loại —</option>
            {Object.entries(JOB_TYPE_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Mô tả</label>
          <textarea rows={3} value={form.description ?? ''}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            placeholder="Mô tả các bước thực hiện của mẫu này..."
            className="px-3 py-2.5 bg-input border border-input-border rounded-xl text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all resize-none"
          />
        </div>

        {err && <p className="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-lg">{err}</p>}

        <div className="flex gap-3 pt-1">
          <button type="button" onClick={onClose}
            className="flex-1 py-2.5 bg-muted text-foreground text-sm font-medium rounded-xl hover:bg-card-border transition-colors">Huỷ</button>
          <button type="submit" disabled={saving}
            className="flex-1 py-2.5 bg-primary text-primary-foreground text-sm font-semibold rounded-xl hover:bg-primary-hover transition-colors disabled:opacity-50">
            {saving ? 'Đang lưu...' : editing ? 'Cập nhật' : 'Tạo mẫu'}
          </button>
        </div>
      </form>
    </dialog>
  );
}

// ─────────────────────────────────────────────────────────────────
// Main page
// ─────────────────────────────────────────────────────────────────
export default function TemplatesPage() {
  const router = useRouter();
  const [templates, setTemplates] = useState<JobTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<JobTemplate | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [copying, setCopying] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'ALL' | 'SYSTEM' | 'USER'>('ALL');

  const load = async () => {
    try {
      setError('');
      const res = await templatesApi.getAll();
      setTemplates(res.data);
    } catch (e: any) { setError(e.message || 'Không thể tải danh sách mẫu'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => { setEditing(null); setDialogOpen(true); };
  const openEdit = (t: JobTemplate) => { setEditing(t); setDialogOpen(true); };
  const closeDialog = () => { setDialogOpen(false); setEditing(null); };

  const handleSaved = (t: JobTemplate) => {
    setTemplates((prev) => {
      const exists = prev.find((x) => x.id === t.id);
      return exists ? prev.map((x) => x.id === t.id ? t : x) : [t, ...prev];
    });
    closeDialog();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Xoá mẫu việc này?')) return;
    setDeleting(id);
    try {
      await templatesApi.remove(id);
      setTemplates((prev) => prev.filter((t) => t.id !== id));
    } catch (e: any) { alert(e.message || 'Xoá thất bại'); }
    finally { setDeleting(null); }
  };

  const handleCopy = async (id: string) => {
    setCopying(id);
    try {
      const res = await templatesApi.copy(id);
      setTemplates((prev) => [res.data, ...prev]);
      router.push(`/templates/${res.data.id}`);
    } catch (e: any) {
      alert(e.message || 'Sao chép thất bại');
    } finally {
      setCopying(null);
    }
  };

  const systemTemplates = templates.filter((t) => t.scope === 'SYSTEM');
  const userTemplates = templates.filter((t) => t.scope === 'USER');

  const filteredTemplates = activeTab === 'ALL'
    ? templates
    : activeTab === 'SYSTEM'
      ? systemTemplates
      : userTemplates;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-foreground">Mẫu công việc (Job Templates)</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Sử dụng các quy trình chuẩn hoặc tự tạo mẫu việc riêng để tự động hóa sinh tasks cho Job
          </p>
        </div>
        <button onClick={openCreate}
          className="px-4 py-2.5 bg-primary text-primary-foreground text-sm font-semibold rounded-xl shadow-sm shadow-primary/20 hover:bg-primary-hover transition-colors whitespace-nowrap self-start sm:self-auto">
          + Tạo mẫu việc riêng
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-card-border pb-2 text-sm font-medium">
        <button
          onClick={() => setActiveTab('ALL')}
          className={`px-3 py-1.5 rounded-lg transition-colors ${activeTab === 'ALL' ? 'bg-primary text-primary-foreground font-semibold' : 'text-muted-foreground hover:text-foreground'
            }`}
        >
          Tất cả ({templates.length})
        </button>
        <button
          onClick={() => setActiveTab('SYSTEM')}
          className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${activeTab === 'SYSTEM' ? 'bg-primary text-primary-foreground font-semibold' : 'text-muted-foreground hover:text-foreground'
            }`}
        >
          <span>🏢</span> Mẫu hệ thống ({systemTemplates.length})
        </button>
        <button
          onClick={() => setActiveTab('USER')}
          className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${activeTab === 'USER' ? 'bg-primary text-primary-foreground font-semibold' : 'text-muted-foreground hover:text-foreground'
            }`}
        >
          <span>👤</span> Mẫu của tôi ({userTemplates.length})
        </button>
      </div>

      {/* Loading */}
      {loading && (
        <div className="bg-card border border-card-border rounded-2xl flex items-center justify-center py-16">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-muted-foreground">Đang tải...</p>
          </div>
        </div>
      )}

      {/* Error */}
      {!loading && error && (
        <div className="bg-destructive/10 border border-destructive/20 rounded-2xl flex items-center justify-center py-10 text-center px-6">
          <div>
            <p className="text-sm font-medium text-destructive">{error}</p>
            <button onClick={load} className="mt-3 text-xs text-primary hover:underline">Thử lại</button>
          </div>
        </div>
      )}

      {/* Empty */}
      {!loading && !error && filteredTemplates.length === 0 && (
        <div className="bg-card border border-card-border rounded-2xl flex flex-col items-center justify-center py-16 text-center px-6">
          <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center text-3xl mb-4">📋</div>
          <p className="text-base font-semibold text-foreground">Không có mẫu việc nào</p>
          <p className="text-sm text-muted-foreground mt-1.5 max-w-sm">
            {activeTab === 'USER'
              ? 'Bạn chưa tạo mẫu việc riêng nào. Bạn có thể tự tạo hoặc sao chép từ Mẫu hệ thống.'
              : 'Chưa có mẫu nào trong danh mục này.'}
          </p>
          <button onClick={openCreate}
            className="mt-5 px-4 py-2.5 bg-primary text-primary-foreground text-sm font-semibold rounded-xl shadow-sm shadow-primary/20 hover:bg-primary-hover transition-colors">
            + Tạo mẫu mới
          </button>
        </div>
      )}

      {/* Grid */}
      {!loading && !error && filteredTemplates.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredTemplates.map((t) => {
            const isSystem = t.scope === 'SYSTEM';
            return (
              <div
                key={t.id}
                className={`bg-card border rounded-2xl p-5 flex flex-col gap-3 transition-all hover:shadow-md ${isSystem ? 'border-primary/20 hover:border-primary/50' : 'border-card-border hover:border-primary/30'
                  }`}
              >
                {/* Header card */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-xl flex-shrink-0">
                      {isSystem ? '🏢' : '👤'}
                    </div>
                    <div>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full font-semibold ${isSystem
                            ? 'bg-soft-sage/40 text-soft-sage-foreground border border-soft-sage/60'
                            : 'bg-muted text-muted-foreground border border-card-border'
                          }`}
                      >
                        {isSystem ? 'Hệ thống' : 'Mẫu của tôi'}
                      </span>
                    </div>
                  </div>

                  {!isSystem && (
                    <div className="flex gap-1">
                      <button
                        onClick={() => openEdit(t)}
                        className="p-1.5 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors text-sm"
                        title="Sửa tên / mô tả"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => handleDelete(t.id)}
                        disabled={deleting === t.id}
                        className="p-1.5 rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors text-sm disabled:opacity-50"
                        title="Xoá mẫu này"
                      >
                        🗑️
                      </button>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div>
                  <h3 className="font-semibold text-foreground text-base line-clamp-1">{t.name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    {t.jobType && (
                      <span className="text-xs bg-pale-pink/40 text-pale-pink-foreground px-2 py-0.5 rounded-lg">
                        {JOB_TYPE_LABELS[t.jobType] ?? t.jobType}
                      </span>
                    )}
                    <span className="text-xs text-muted-foreground">
                      {t._count?.templateTasks ?? 0} task{t._count?.templateTasks !== 1 ? 's' : ''}
                    </span>
                  </div>
                </div>

                {t.description ? (
                  <p className="text-xs text-muted-foreground bg-muted/50 rounded-lg px-2.5 py-1.5 line-clamp-2">
                    {t.description}
                  </p>
                ) : (
                  <p className="text-xs text-muted-foreground/60 italic">Chưa có mô tả</p>
                )}

                {/* Actions */}
                <div className="mt-auto pt-3 border-t border-card-border flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/jobs/new?templateId=${t.id}`}
                      className="flex-1 text-center py-2 bg-primary text-primary-foreground text-xs font-semibold rounded-xl hover:bg-primary-hover transition-colors shadow-sm"
                    >
                      🚀 Dùng mẫu này
                    </Link>

                    {isSystem ? (
                      <button
                        onClick={() => handleCopy(t.id)}
                        disabled={copying === t.id}
                        className="px-3 py-2 bg-muted text-foreground hover:bg-card-border text-xs font-medium rounded-xl transition-colors disabled:opacity-50 whitespace-nowrap"
                        title="Sao chép thành mẫu riêng để chỉnh sửa"
                      >
                        {copying === t.id ? 'Đang sao chép...' : 'Tùy chỉnh (Copy)'}
                      </button>
                    ) : null}
                  </div>

                  <div className="text-right">
                    <Link
                      href={`/templates/${t.id}`}
                      className="text-xs text-primary hover:underline font-medium inline-flex items-center gap-1"
                    >
                      {isSystem ? 'Xem danh sách tasks →' : 'Quản lý & sửa tasks →'}
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {dialogOpen && (
        <TemplateDialog editing={editing} onClose={closeDialog} onSaved={handleSaved} />
      )}
    </div>
  );
}

