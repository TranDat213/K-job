'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  brandsApi,
  jobsApi,
  templatesApi,
  Brand,
  JobTemplate,
  JobTemplateDetail,
  CreateJobPayload,
  CreateBrandPayload,
} from '../../../lib/api';
import { JOB_TYPE_OPTIONS, JOB_STATUS_OPTIONS, JOB_TYPE_LABELS } from '../../../constants';

const JOB_TYPES = JOB_TYPE_OPTIONS;
const JOB_STATUSES = JOB_STATUS_OPTIONS;

// ─────────────────────────────────────────────────────────────────
// Inline Brand Creation Modal
// ─────────────────────────────────────────────────────────────────
function InlineBrandModal({
  isOpen,
  onClose,
  onCreated,
}: {
  isOpen: boolean;
  onClose: () => void;
  onCreated: (brand: Brand) => void;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [form, setForm] = useState<CreateBrandPayload>({
    name: '',
    contactName: '',
    contactPhone: '',
    contactEmail: '',
    note: '',
  });
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');

  useEffect(() => {
    if (isOpen) {
      dialogRef.current?.showModal();
    } else {
      dialogRef.current?.close();
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    setSaving(true);
    setErr('');
    try {
      const res = await brandsApi.create({
        name: form.name.trim(),
        contactName: form.contactName?.trim() || undefined,
        contactPhone: form.contactPhone?.trim() || undefined,
        contactEmail: form.contactEmail?.trim() || undefined,
        note: form.note?.trim() || undefined,
      });
      onCreated(res.data);
      setForm({ name: '', contactName: '', contactPhone: '', contactEmail: '', note: '' });
      onClose();
    } catch (ex: any) {
      setErr(ex.message || 'Lỗi khi tạo nhãn hàng');
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      className="backdrop:bg-black/50 backdrop:backdrop-blur-sm bg-card border border-card-border rounded-2xl p-0 w-full max-w-lg shadow-2xl z-50 fixed inset-0 m-auto"
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">🏢</span>
            <h2 className="text-base font-bold text-foreground">Thêm nhãn hàng mới</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-muted-foreground hover:bg-muted transition-colors"
          >
            ✕
          </button>
        </div>

        {err && (
          <p className="text-xs text-destructive bg-destructive/10 px-3 py-2 rounded-lg">
            {err}
          </p>
        )}

        <div className="space-y-3">
          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Tên nhãn hàng <span className="text-primary">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="VD: Shopee, L'Oreal, Revive..."
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              className="mt-1 w-full px-3 py-2 bg-input border border-input-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Người liên hệ
              </label>
              <input
                type="text"
                placeholder="VD: Ms. Linh"
                value={form.contactName || ''}
                onChange={(e) => setForm((f) => ({ ...f, contactName: e.target.value }))}
                className="mt-1 w-full px-3 py-2 bg-input border border-input-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Số điện thoại / Zalo
              </label>
              <input
                type="tel"
                placeholder="VD: 0912345678"
                value={form.contactPhone || ''}
                onChange={(e) => setForm((f) => ({ ...f, contactPhone: e.target.value }))}
                className="mt-1 w-full px-3 py-2 bg-input border border-input-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Email
            </label>
            <input
              type="email"
              placeholder="contact@brand.com"
              value={form.contactEmail || ''}
              onChange={(e) => setForm((f) => ({ ...f, contactEmail: e.target.value }))}
              className="mt-1 w-full px-3 py-2 bg-input border border-input-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Ghi chú nhãn hàng
            </label>
            <textarea
              rows={2}
              placeholder="Ghi chú thêm về nhãn hàng này..."
              value={form.note || ''}
              onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))}
              className="mt-1 w-full px-3 py-2 bg-input border border-input-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none"
            />
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2 bg-muted text-foreground text-sm font-medium rounded-xl hover:bg-card-border transition-colors"
          >
            Huỷ
          </button>
          <button
            type="submit"
            disabled={saving || !form.name.trim()}
            className="flex-1 py-2 bg-primary text-primary-foreground text-sm font-semibold rounded-xl hover:bg-primary-hover transition-colors disabled:opacity-50"
          >
            {saving ? 'Đang tạo...' : 'Tạo & Chọn ngay'}
          </button>
        </div>
      </form>
    </dialog>
  );
}

// ─────────────────────────────────────────────────────────────────
// Main Form Content
// ─────────────────────────────────────────────────────────────────
function NewJobForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedTemplateId = searchParams.get('templateId') || '';

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Brands
  const [brands, setBrands] = useState<Brand[]>([]);
  const [brandsLoading, setBrandsLoading] = useState(true);
  const [selectedBrandId, setSelectedBrandId] = useState('');
  const [showBrandModal, setShowBrandModal] = useState(false);

  // Templates & Tasks
  const [templates, setTemplates] = useState<JobTemplate[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState(preselectedTemplateId);
  const [templateDetail, setTemplateDetail] = useState<JobTemplateDetail | null>(null);
  const [loadingTemplateDetail, setLoadingTemplateDetail] = useState(false);
  const [jobTasks, setJobTasks] = useState<
    Array<{ title: string; daysBeforePost: number; description?: string }>
  >([]);

  const systemTemplates = templates.filter((t) => t.scope === 'SYSTEM');
  const customTemplates = templates.filter((t) => t.scope !== 'SYSTEM');

  // Form fields
  const [name, setName] = useState('');
  const [jobType, setJobType] = useState('PRODUCT_REVIEW');
  const [status, setStatus] = useState('NEW');
  const [quantity, setQuantity] = useState<number | ''>('');
  const [requirement, setRequirement] = useState('');
  const [brief, setBrief] = useState('');
  const [description, setDescription] = useState('');

  // Dates & Payment
  const [receivedDate, setReceivedDate] = useState('');
  const [demoDate, setDemoDate] = useState('');
  const [postDate, setPostDate] = useState('');
  const [paymentExpectedDate, setPaymentExpectedDate] = useState('');
  const [paymentAmount, setPaymentAmount] = useState<number | ''>('');

  // Initial Note & Attachments
  const [initialNote, setInitialNote] = useState('');
  const [attachments, setAttachments] = useState<
    Array<{ fileName: string; fileUrl: string; fileType?: string; fileSize?: number }>
  >([]);
  const [newAttName, setNewAttName] = useState('');
  const [newAttUrl, setNewAttUrl] = useState('');
  const [newAttType, setNewAttType] = useState('LINK');

  useEffect(() => {
    brandsApi
      .getAll()
      .then((r) => setBrands(r.data))
      .finally(() => setBrandsLoading(false));

    templatesApi
      .getAll()
      .then((r) => {
        setTemplates(r.data);
        if (preselectedTemplateId) {
          setSelectedTemplateId(preselectedTemplateId);
        }
      })
      .catch(() => {});
  }, [preselectedTemplateId]);

  // When template selection changes, fetch detail to load tasks into editable list
  useEffect(() => {
    if (!selectedTemplateId) {
      setTemplateDetail(null);
      setJobTasks([]);
      return;
    }
    setLoadingTemplateDetail(true);
    templatesApi
      .getOne(selectedTemplateId)
      .then((r) => {
        setTemplateDetail(r.data);
        if (r.data?.templateTasks && r.data.templateTasks.length > 0) {
          setJobTasks(
            r.data.templateTasks.map((tt) => ({
              title: tt.title,
              daysBeforePost: tt.daysBeforePost ?? 0,
              description: tt.description ?? '',
            }))
          );
        } else {
          setJobTasks([]);
        }
      })
      .catch(() => {
        setTemplateDetail(null);
        setJobTasks([]);
      })
      .finally(() => setLoadingTemplateDetail(false));
  }, [selectedTemplateId]);

  const updateJobTask = (
    index: number,
    patch: Partial<{ title: string; daysBeforePost: number; description?: string }>
  ) => {
    setJobTasks((prev) => prev.map((t, i) => (i === index ? { ...t, ...patch } : t)));
  };

  const removeJobTask = (index: number) => {
    setJobTasks((prev) => prev.filter((_, i) => i !== index));
  };

  const moveJobTask = (index: number, dir: -1 | 1) => {
    setJobTasks((prev) => {
      const nextIndex = index + dir;
      if (nextIndex < 0 || nextIndex >= prev.length) return prev;
      const copy = [...prev];
      const temp = copy[index];
      copy[index] = copy[nextIndex];
      copy[nextIndex] = temp;
      return copy;
    });
  };

  const addEmptyJobTask = () => {
    setJobTasks((prev) => [...prev, { title: '', daysBeforePost: 0 }]);
  };

  const getCalculatedDueDate = (postDateStr: string, daysBeforePost: number) => {
    if (!postDateStr) return null;
    const d = new Date(postDateStr);
    if (isNaN(d.getTime())) return null;
    d.setDate(d.getDate() - daysBeforePost);
    return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const handleBrandCreated = (newBrand: Brand) => {
    setBrands((prev) => [newBrand, ...prev]);
    setSelectedBrandId(newBrand.id);
  };

  const addAttachmentItem = () => {
    if (!newAttUrl.trim()) return;
    const name = newAttName.trim() || newAttUrl.trim().split('/').pop() || 'Tài liệu';
    setAttachments((prev) => [
      ...prev,
      {
        fileName: name,
        fileUrl: newAttUrl.trim(),
        fileType: newAttType,
      },
    ]);
    setNewAttName('');
    setNewAttUrl('');
  };

  const removeAttachmentItem = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedBrandId) {
      setError('Vui lòng chọn nhãn hàng');
      return;
    }
    if (!name.trim()) {
      setError('Vui lòng nhập tên công việc');
      return;
    }

    setError(null);
    setLoading(true);

    const payload: CreateJobPayload = {
      brandId: selectedBrandId,
      name: name.trim(),
      description: description.trim() || undefined,
      jobType,
      status,
      templateId: selectedTemplateId || undefined,
      quantity: quantity ? Number(quantity) : undefined,
      requirement: requirement.trim() || undefined,
      brief: brief.trim() || undefined,
      receivedDate: receivedDate || undefined,
      demoDate: demoDate || undefined,
      postDate: postDate || undefined,
      paymentExpectedDate: paymentExpectedDate || undefined,
      paymentAmount: paymentAmount ? Number(paymentAmount) : undefined,
      initialNote: initialNote.trim() || undefined,
      attachments: attachments.length > 0 ? attachments : undefined,
      tasks:
        jobTasks.length > 0
          ? jobTasks
              .filter((t) => t.title.trim())
              .map((t, idx) => ({
                title: t.title.trim(),
                description: t.description?.trim() || undefined,
                order: idx,
                daysBeforePost: t.daysBeforePost,
              }))
          : undefined,
    };

    try {
      const res = await jobsApi.create(payload);
      router.push(`/jobs/${res.data.id}`);
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Đã có lỗi xảy ra khi tạo job');
      setLoading(false);
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/jobs"
          className="text-muted-foreground hover:text-foreground transition-colors text-sm"
        >
          ← Quay lại danh sách
        </Link>
        <div>
          <h1 className="text-xl font-bold text-foreground">Tạo job mới</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Điền đầy đủ thông tin, mẫu việc và tài liệu cho chiến dịch KOC
          </p>
        </div>
      </div>

      {error && (
        <div className="bg-destructive/15 border border-destructive/30 rounded-xl px-4 py-3 text-sm text-destructive flex items-center gap-2">
          <span>⚠️</span>
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* ── BƯỚC 1: Chọn Nhãn hàng ── */}
        <div className="bg-card border border-card-border rounded-2xl p-6 space-y-4 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-foreground flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold">
                1
              </span>
              Nhãn hàng đối tác <span className="text-primary">*</span>
            </h2>
            <button
              type="button"
              onClick={() => setShowBrandModal(true)}
              className="px-3 py-1.5 bg-primary/10 text-primary border border-primary/20 rounded-xl text-xs font-semibold hover:bg-primary/20 transition-colors flex items-center gap-1.5"
            >
              <span>+</span> Thêm nhãn hàng mới
            </button>
          </div>

          <div>
            <select
              id="brandId"
              required
              disabled={brandsLoading}
              value={selectedBrandId}
              onChange={(e) => setSelectedBrandId(e.target.value)}
              className="w-full px-4 py-2.5 bg-input border border-input-border rounded-xl text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all disabled:opacity-60"
            >
              <option value="">
                {brandsLoading
                  ? 'Đang tải danh sách nhãn hàng...'
                  : brands.length === 0
                  ? '— Chưa có nhãn hàng (bấm nút bên trên để thêm) —'
                  : '— Chọn nhãn hàng hợp tác —'}
              </option>
              {brands.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name} {b.contactName ? `(${b.contactName})` : ''}
                </option>
              ))}
            </select>
            {selectedBrandId && (
              <p className="text-xs text-soft-sage-foreground mt-1.5 flex items-center gap-1">
                <span>✓</span> Đã chọn nhãn hàng: {brands.find((b) => b.id === selectedBrandId)?.name}
              </p>
            )}
          </div>
        </div>

        {/* ── BƯỚC 2: Chọn Mẫu công việc (Job Template) ── */}
        <div className="bg-card border border-card-border rounded-2xl p-6 space-y-4 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-foreground flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold">
                2
              </span>
              Mẫu công việc (Job Template)
              <span className="text-xs font-normal text-muted-foreground">(tuỳ chọn)</span>
            </h2>
            <Link
              href="/templates"
              target="_blank"
              className="text-xs text-primary hover:underline"
            >
              Quản lý mẫu việc ↗
            </Link>
          </div>

          <div>
            <select
              id="templateId"
              value={selectedTemplateId}
              onChange={(e) => setSelectedTemplateId(e.target.value)}
              className="w-full px-4 py-2.5 bg-input border border-input-border rounded-xl text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all"
            >
              <option value="">— Không dùng mẫu (tạo tasks thủ công) —</option>

              {systemTemplates.length > 0 && (
                <optgroup label="📋 Mẫu có sẵn của hệ thống">
                  {systemTemplates.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} {t.jobType ? `(${JOB_TYPE_LABELS[t.jobType] ?? t.jobType})` : ''}
                    </option>
                  ))}
                </optgroup>
              )}

              {customTemplates.length > 0 && (
                <optgroup label="✨ Mẫu tùy chỉnh của bạn">
                  {customTemplates.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} {t.jobType ? `(${JOB_TYPE_LABELS[t.jobType] ?? t.jobType})` : ''}
                    </option>
                  ))}
                </optgroup>
              )}
            </select>
          </div>

          {/* Interactive task editor from selected template or custom */}
          {(selectedTemplateId || jobTasks.length > 0) && (
            <div className="bg-muted/30 border border-card-border rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span className="font-semibold text-foreground flex items-center gap-1.5">
                  <span>⚡</span> Danh sách nhiệm vụ sẽ tự động tạo ({jobTasks.length}):
                </span>
                <div className="flex items-center gap-2">
                  {loadingTemplateDetail && <span className="text-xs">Đang tải...</span>}
                  <button
                    type="button"
                    onClick={addEmptyJobTask}
                    className="px-2.5 py-1 bg-card border border-card-border hover:border-primary text-foreground rounded-lg text-xs font-medium transition-colors"
                  >
                    + Thêm nhiệm vụ
                  </button>
                </div>
              </div>

              {jobTasks.length > 0 ? (
                <ul className="space-y-2 mt-2">
                  {jobTasks.map((t, idx) => {
                    const calculatedDue = getCalculatedDueDate(postDate, t.daysBeforePost);
                    return (
                      <li
                        key={idx}
                        className="flex flex-col sm:flex-row sm:items-center gap-2 bg-card p-2.5 rounded-xl border border-card-border shadow-sm group"
                      >
                        {/* Order & Move buttons */}
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <span className="w-5 text-center text-xs font-bold text-muted-foreground font-mono">
                            {idx + 1}
                          </span>
                          <div className="flex flex-col">
                            <button
                              type="button"
                              disabled={idx === 0}
                              onClick={() => moveJobTask(idx, -1)}
                              className="text-[10px] text-muted-foreground hover:text-foreground disabled:opacity-20 leading-none p-0.5"
                              title="Di chuyển lên"
                            >
                              ▲
                            </button>
                            <button
                              type="button"
                              disabled={idx === jobTasks.length - 1}
                              onClick={() => moveJobTask(idx, 1)}
                              className="text-[10px] text-muted-foreground hover:text-foreground disabled:opacity-20 leading-none p-0.5"
                              title="Di chuyển xuống"
                            >
                              ▼
                            </button>
                          </div>
                        </div>

                        {/* Title input */}
                        <input
                          type="text"
                          required
                          value={t.title}
                          onChange={(e) => updateJobTask(idx, { title: e.target.value })}
                          placeholder="Tiêu đề nhiệm vụ..."
                          className="flex-1 px-3 py-1.5 bg-input border border-input-border rounded-lg text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                        />

                        {/* Days before post input */}
                        <div className="flex items-center gap-1.5 flex-shrink-0 text-xs text-muted-foreground">
                          <input
                            type="number"
                            min="0"
                            max="365"
                            value={t.daysBeforePost}
                            onChange={(e) => updateJobTask(idx, { daysBeforePost: Number(e.target.value) })}
                            className="w-14 px-2 py-1.5 bg-input border border-input-border rounded-lg text-xs text-center focus:outline-none focus:ring-1 focus:ring-primary"
                          />
                          <span className="whitespace-nowrap">ngày trước</span>
                        </div>

                        {/* Calculated due date preview */}
                        {calculatedDue && (
                          <span className="text-[11px] bg-soft-sage/40 text-soft-sage-foreground px-2 py-1 rounded-md font-medium whitespace-nowrap flex-shrink-0">
                            Hạn: {calculatedDue}
                          </span>
                        )}

                        {/* Delete button */}
                        <button
                          type="button"
                          onClick={() => removeJobTask(idx)}
                          className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 p-1.5 rounded-lg text-xs transition-colors flex-shrink-0"
                          title="Xóa nhiệm vụ này"
                        >
                          ✕
                        </button>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                !loadingTemplateDetail && (
                  <p className="text-xs text-muted-foreground py-2 text-center">
                    Chưa có nhiệm vụ nào. Nhấn "+ Thêm nhiệm vụ" để thêm vào job này.
                  </p>
                )
              )}

              <p className="text-xs text-muted-foreground pt-1">
                💡 Bạn có thể trực tiếp sửa tiêu đề, đổi số ngày trước hoặc thêm/xóa nhiệm vụ. Khi nhập{' '}
                <strong>Ngày đăng</strong> ở Bước 3, hệ thống sẽ tự tính hạn chót tương ứng cho từng task!
              </p>
            </div>
          )}

          {!selectedTemplateId && jobTasks.length === 0 && (
            <div className="pt-1">
              <button
                type="button"
                onClick={addEmptyJobTask}
                className="text-xs text-primary hover:underline font-medium flex items-center gap-1"
              >
                + Tự tạo danh sách nhiệm vụ ban đầu cho Job này (tùy chọn)
              </button>
            </div>
          )}
        </div>

        {/* ── BƯỚC 3: Thông tin chi tiết Job ── */}
        <div className="bg-card border border-card-border rounded-2xl p-6 space-y-5 shadow-sm">
          <h2 className="text-base font-bold text-foreground flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold">
              3
            </span>
            Thông tin chi tiết công việc
          </h2>

          {/* Tên job */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-foreground mb-1.5">
              Tên chiến dịch / Job <span className="text-primary">*</span>
            </label>
            <input
              id="name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="VD: Review bộ mỹ phẩm Revive Hè 2026 trên TikTok"
              className="w-full px-4 py-2.5 bg-input border border-input-border rounded-xl text-sm text-foreground placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary transition-all"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Loại job */}
            <div>
              <label htmlFor="jobType" className="block text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">
                Loại job
              </label>
              <select
                id="jobType"
                value={jobType}
                onChange={(e) => setJobType(e.target.value)}
                className="w-full px-3 py-2.5 bg-input border border-input-border rounded-xl text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all"
              >
                {JOB_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Trạng thái */}
            <div>
              <label htmlFor="status" className="block text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">
                Trạng thái ban đầu
              </label>
              <select
                id="status"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-3 py-2.5 bg-input border border-input-border rounded-xl text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all"
              >
                {JOB_STATUSES.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Số lượng */}
            <div>
              <label htmlFor="quantity" className="block text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">
                Số lượng SP / Bài
              </label>
              <input
                id="quantity"
                type="number"
                min="1"
                placeholder="VD: 1 video, 2 SP"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value ? Number(e.target.value) : '')}
                className="w-full px-3 py-2.5 bg-input border border-input-border rounded-xl text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all"
              />
            </div>
          </div>

          {/* Tiến độ & Ngày tháng */}
          <div className="pt-2 border-t border-card-border">
            <h3 className="text-xs font-bold text-foreground uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <span>📅</span> Kế hoạch thời gian & Thù lao
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label htmlFor="receivedDate" className="block text-xs text-muted-foreground mb-1">
                  Ngày nhận sản phẩm / việc
                </label>
                <input
                  id="receivedDate"
                  type="date"
                  value={receivedDate}
                  onChange={(e) => setReceivedDate(e.target.value)}
                  className="w-full px-3 py-2 bg-input border border-input-border rounded-xl text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label htmlFor="demoDate" className="block text-xs text-muted-foreground mb-1">
                  Hạn gửi duyệt demo
                </label>
                <input
                  id="demoDate"
                  type="date"
                  value={demoDate}
                  onChange={(e) => setDemoDate(e.target.value)}
                  className="w-full px-3 py-2 bg-input border border-input-border rounded-xl text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label htmlFor="postDate" className="block text-xs text-muted-foreground mb-1 font-semibold text-primary">
                  Ngày đăng bài dự kiến ★
                </label>
                <input
                  id="postDate"
                  type="date"
                  value={postDate}
                  onChange={(e) => setPostDate(e.target.value)}
                  className="w-full px-3 py-2 bg-input border border-primary/50 rounded-xl text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label htmlFor="paymentExpectedDate" className="block text-xs text-muted-foreground mb-1">
                  Ngày nhận tiền dự kiến
                </label>
                <input
                  id="paymentExpectedDate"
                  type="date"
                  value={paymentExpectedDate}
                  onChange={(e) => setPaymentExpectedDate(e.target.value)}
                  className="w-full px-3 py-2 bg-input border border-input-border rounded-xl text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="sm:col-span-2">
                <label htmlFor="paymentAmount" className="block text-xs text-muted-foreground mb-1 font-semibold">
                  Thù lao dự kiến (VND)
                </label>
                <input
                  id="paymentAmount"
                  type="number"
                  step="1000"
                  min="0"
                  placeholder="VD: 5000000 (tự tạo bản ghi thanh toán)"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value ? Number(e.target.value) : '')}
                  className="w-full px-3 py-2 bg-input border border-input-border rounded-xl text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>
          </div>

          {/* Yêu cầu, Brief, Mô tả */}
          <div className="space-y-4 pt-2 border-t border-card-border">
            <div>
              <label htmlFor="brief" className="block text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">
                Brief / Tóm tắt kịch bản từ Brand
              </label>
              <textarea
                id="brief"
                rows={2}
                value={brief}
                onChange={(e) => setBrief(e.target.value)}
                placeholder="Dán link brief Google Docs/Drive hoặc tóm tắt thông điệp truyền thông..."
                className="w-full px-3 py-2.5 bg-input border border-input-border rounded-xl text-sm text-foreground placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary resize-none"
              />
            </div>

            <div>
              <label htmlFor="requirement" className="block text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">
                Yêu cầu kỹ thuật & cam kết (KPIs, Hashtags, Âm thanh...)
              </label>
              <textarea
                id="requirement"
                rows={2}
                value={requirement}
                onChange={(e) => setRequirement(e.target.value)}
                placeholder="Gắn link bio 7 ngày, kèm hashtag #review #beauty, thời lượng 45-60s..."
                className="w-full px-3 py-2.5 bg-input border border-input-border rounded-xl text-sm text-foreground placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary resize-none"
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">
                Mô tả chi tiết nội dung job
              </label>
              <textarea
                id="description"
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Chi tiết công việc cần làm, phân cảnh quay hoặc lưu ý riêng..."
                className="w-full px-3 py-2.5 bg-input border border-input-border rounded-xl text-sm text-foreground placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary resize-none"
              />
            </div>
          </div>
        </div>

        {/* ── BƯỚC 4: Ghi chú & Tệp đính kèm ── */}
        <div className="bg-card border border-card-border rounded-2xl p-6 space-y-5 shadow-sm">
          <h2 className="text-base font-bold text-foreground flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold">
              4
            </span>
            Ghi chú & Tệp đính kèm ban đầu
          </h2>

          {/* Ghi chú ban đầu */}
          <div>
            <label htmlFor="initialNote" className="block text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">
              Ghi chú nhanh (Job Note)
            </label>
            <textarea
              id="initialNote"
              rows={2}
              value={initialNote}
              onChange={(e) => setInitialNote(e.target.value)}
              placeholder="Nhập ghi chú quan trọng lúc nhận job (có thể thêm ghi chú mới bất kỳ lúc nào sau này)..."
              className="w-full px-3 py-2.5 bg-input border border-input-border rounded-xl text-sm text-foreground placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary resize-none"
            />
          </div>

          {/* Tệp đính kèm ban đầu */}
          <div className="space-y-3 pt-2 border-t border-card-border">
            <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Tệp & Đường dẫn đính kèm (Job Attachments)
            </label>

            {/* List already added */}
            {attachments.length > 0 && (
              <ul className="space-y-2">
                {attachments.map((att, idx) => (
                  <li
                    key={idx}
                    className="flex items-center justify-between p-2.5 bg-muted/40 border border-card-border rounded-xl text-xs"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <span className="text-base">📎</span>
                      <span className="font-medium text-foreground truncate">{att.fileName}</span>
                      <span className="text-muted-foreground truncate max-w-xs">({att.fileUrl})</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeAttachmentItem(idx)}
                      className="text-destructive hover:bg-destructive/10 px-2 py-1 rounded transition-colors text-xs ml-2"
                    >
                      Xoá
                    </button>
                  </li>
                ))}
              </ul>
            )}

            {/* Input to add attachment */}
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                placeholder="Tên tệp (VD: Brief_PDF, Link Drive...)"
                value={newAttName}
                onChange={(e) => setNewAttName(e.target.value)}
                className="sm:w-1/3 px-3 py-2 bg-input border border-input-border rounded-xl text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <input
                type="url"
                placeholder="https://drive.google.com/... hoặc link file"
                value={newAttUrl}
                onChange={(e) => setNewAttUrl(e.target.value)}
                className="flex-1 px-3 py-2 bg-input border border-input-border rounded-xl text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <button
                type="button"
                onClick={addAttachmentItem}
                disabled={!newAttUrl.trim()}
                className="px-4 py-2 bg-secondary text-secondary-foreground text-xs font-semibold rounded-xl hover:bg-secondary/80 transition-colors disabled:opacity-50 whitespace-nowrap"
              >
                + Thêm tệp
              </button>
            </div>
            <p className="text-xs text-muted-foreground">
              Hỗ trợ link Google Drive, OneDrive, Figma, Canva, hợp đồng hoặc file online.
            </p>
          </div>
        </div>

        {/* ── Submit actions ── */}
        <div className="flex gap-4 pt-2">
          <Link
            href="/jobs"
            className="flex-1 text-center px-4 py-3 bg-muted text-foreground text-sm font-medium rounded-xl hover:bg-card-border transition-colors"
          >
            Huỷ bỏ
          </Link>
          <button
            type="submit"
            disabled={loading || brandsLoading}
            className="flex-1 px-4 py-3 bg-primary text-primary-foreground text-sm font-semibold rounded-xl shadow-md shadow-primary/20 hover:bg-primary-hover active:bg-primary-active transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Đang tạo job...' : '🚀 Tạo job ngay'}
          </button>
        </div>
      </form>

      {/* Modal tạo nhãn hàng inline */}
      <InlineBrandModal
        isOpen={showBrandModal}
        onClose={() => setShowBrandModal(false)}
        onCreated={handleBrandCreated}
      />
    </div>
  );
}

export default function NewJobPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <NewJobForm />
    </Suspense>
  );
}

