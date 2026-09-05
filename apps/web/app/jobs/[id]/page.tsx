'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  jobsApi,
  tasksApi,
  paymentsApi,
  JobDetail,
  JobTask,
  JobNote,
  JobAttachment,
  PaymentFull,
  CreatePaymentPayload,
} from '../../../lib/api';


// ─────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────
const STATUS_STYLES: Record<string, { label: string; className: string }> = {
  DRAFT:            { label: 'Nháp',            className: 'bg-muted text-muted-foreground' },
  NEW:              { label: 'Mới',             className: 'bg-info/30 text-info-foreground' },
  WAITING_PRODUCT:  { label: 'Chờ sản phẩm',   className: 'bg-warning/50 text-warning-foreground' },
  PRODUCT_RECEIVED: { label: 'Đã nhận SP',      className: 'bg-secondary/30 text-secondary-foreground' },
  CREATING:         { label: 'Đang tạo ND',     className: 'bg-pale-pink/50 text-pale-pink-foreground' },
  DEMO:             { label: 'Demo',            className: 'bg-pale-pink/50 text-pale-pink-foreground' },
  REVISION:         { label: 'Chỉnh sửa',       className: 'bg-warning/50 text-warning-foreground' },
  READY_TO_POST:    { label: 'Sẵn sàng đăng',  className: 'bg-soft-sage/60 text-soft-sage-foreground' },
  POSTED:           { label: 'Đã đăng',         className: 'bg-soft-sage/60 text-soft-sage-foreground' },
  WAITING_PAYMENT:  { label: 'Chờ thanh toán', className: 'bg-warning/50 text-warning-foreground' },
  PAID:             { label: 'Đã thanh toán',   className: 'bg-success text-success-foreground' },
  COMPLETED:        { label: 'Hoàn thành',      className: 'bg-success text-success-foreground' },
  CANCELLED:        { label: 'Huỷ',            className: 'bg-destructive/20 text-destructive-foreground' },
};

const PAYMENT_STATUS_LABELS: Record<string, string> = {
  PENDING: 'Chờ xử lý', REQUESTED: 'Đã yêu cầu', PAID: 'Đã thanh toán',
  OVERDUE: 'Quá hạn', CANCELLED: 'Huỷ',
};

const PAYMENT_METHOD_LABELS: Record<string, string> = {
  BANK_TRANSFER: 'Chuyển khoản', CASH: 'Tiền mặt', E_WALLET: 'Ví điện tử', OTHER: 'Khác',
};

function fmt(d: string | null) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function fmtMoney(amount: string, currency = 'VND') {
  const n = parseFloat(amount);
  if (isNaN(n)) return amount;
  return n.toLocaleString('vi-VN') + ' ' + currency;
}

// ─────────────────────────────────────────────────────────────────
// Payment Dialog
// ─────────────────────────────────────────────────────────────────
function PaymentDialog({
  jobId,
  onClose,
  onSaved,
}: {
  jobId: string;
  onClose: () => void;
  onSaved: (p: PaymentFull) => void;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [form, setForm] = useState<CreatePaymentPayload>({ amount: 0, currency: 'VND', status: 'PENDING', paymentMethod: 'BANK_TRANSFER' });
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');

  useEffect(() => { dialogRef.current?.showModal(); return () => dialogRef.current?.close(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true); setErr('');
    try {
      const res = await paymentsApi.create(jobId, form);
      onSaved(res.data);
    } catch (ex: any) { setErr(ex.message || 'Lỗi'); }
    finally { setSaving(false); }
  };

  return (
    <dialog ref={dialogRef} onClose={onClose}
      className="backdrop:bg-black/50 backdrop:backdrop-blur-sm bg-card border border-card-border rounded-2xl p-0 w-full max-w-md shadow-2xl">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-foreground">Thêm khoản thanh toán</h2>
          <button type="button" onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg text-muted-foreground hover:bg-muted transition-colors">✕</button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Số tiền (VND) *</label>
            <input type="number" required min="1" step="1000"
              value={form.amount || ''}
              onChange={(e) => setForm((f) => ({ ...f, amount: Number(e.target.value) }))}
              className="mt-1 w-full px-3 py-2.5 bg-input border border-input-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary transition-all"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Trạng thái</label>
            <select value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
              className="mt-1 w-full px-3 py-2.5 bg-input border border-input-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary transition-all">
              {Object.entries(PAYMENT_STATUS_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Hình thức</label>
            <select value={form.paymentMethod} onChange={(e) => setForm((f) => ({ ...f, paymentMethod: e.target.value }))}
              className="mt-1 w-full px-3 py-2.5 bg-input border border-input-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary transition-all">
              {Object.entries(PAYMENT_METHOD_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
          </div>
          <div className="col-span-2">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Ngày nhận tiền dự kiến</label>
            <input type="date" value={form.expectedDate ?? ''}
              onChange={(e) => setForm((f) => ({ ...f, expectedDate: e.target.value || undefined }))}
              className="mt-1 w-full px-3 py-2.5 bg-input border border-input-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary transition-all"
            />
          </div>
          <div className="col-span-2">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Ghi chú</label>
            <input type="text" value={form.note ?? ''}
              onChange={(e) => setForm((f) => ({ ...f, note: e.target.value || undefined }))}
              className="mt-1 w-full px-3 py-2.5 bg-input border border-input-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary transition-all"
            />
          </div>
        </div>

        {err && <p className="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-lg">{err}</p>}

        <div className="flex gap-3 pt-1">
          <button type="button" onClick={onClose} className="flex-1 py-2.5 bg-muted text-foreground text-sm font-medium rounded-xl hover:bg-card-border transition-colors">Huỷ</button>
          <button type="submit" disabled={saving} className="flex-1 py-2.5 bg-primary text-primary-foreground text-sm font-semibold rounded-xl hover:bg-primary-hover transition-colors disabled:opacity-50">
            {saving ? 'Đang lưu...' : 'Thêm'}
          </button>
        </div>
      </form>
    </dialog>
  );
}

// ─────────────────────────────────────────────────────────────────
// Main page
// ─────────────────────────────────────────────────────────────────
export default function JobDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [job, setJob] = useState<JobDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Tasks state
  const [tasks, setTasks] = useState<JobTask[]>([]);
  const [quickTitle, setQuickTitle] = useState('');
  const [quickDue, setQuickDue] = useState('');
  const [addingTask, setAddingTask] = useState(false);

  // Payments state
  const [payments, setPayments] = useState<PaymentFull[]>([]);
  const [paymentDialog, setPaymentDialog] = useState(false);

  // Notes state
  const [notes, setNotes] = useState<JobNote[]>([]);
  const [newNoteContent, setNewNoteContent] = useState('');
  const [addingNote, setAddingNote] = useState(false);

  // Attachments state
  const [attachments, setAttachments] = useState<JobAttachment[]>([]);
  const [newAttFileName, setNewAttFileName] = useState('');
  const [newAttFileUrl, setNewAttFileUrl] = useState('');
  const [addingAttachment, setAddingAttachment] = useState(false);

  // Status update
  const [updatingStatus, setUpdatingStatus] = useState(false);

  // Delete job
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    try {
      setError('');
      const res = await jobsApi.getOne(id);
      setJob(res.data);
      setTasks(res.data.tasks ?? []);
      setPayments(res.data.payments ?? []);
      setNotes(res.data.notes ?? []);
      setAttachments(res.data.attachments ?? []);
    } catch (e: any) {
      setError(e.message || 'Không thể tải job');
    } finally {
      setLoading(false);
    }
  }, [id]);


  useEffect(() => { load(); }, [load]);

  // ── Status change ────────────────────────────────────────────────
  const handleStatusChange = async (newStatus: string) => {
    if (!job || updatingStatus) return;
    setUpdatingStatus(true);
    try {
      await jobsApi.update(id, { status: newStatus });
      setJob((j) => j ? { ...j, status: newStatus } : j);
    } catch { /* ignore */ }
    finally { setUpdatingStatus(false); }
  };

  // ── Task toggle ──────────────────────────────────────────────────
  const toggleTask = async (task: JobTask) => {
    const next = task.status === 'COMPLETED' ? 'TODO' : 'COMPLETED';
    setTasks((prev) => prev.map((t) => t.id === task.id ? { ...t, status: next } : t));
    try {
      await tasksApi.update(task.id, { status: next });
    } catch {
      setTasks((prev) => prev.map((t) => t.id === task.id ? { ...t, status: task.status } : t));
    }
  };

  // ── Add task ─────────────────────────────────────────────────────
  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickTitle.trim()) return;
    setAddingTask(true);
    try {
      const res = await tasksApi.create(id, {
        title: quickTitle.trim(),
        dueDate: quickDue || undefined,
        order: tasks.length,
      });
      setTasks((prev) => [...prev, res.data]);
      setQuickTitle(''); setQuickDue('');
    } catch { /* ignore */ }
    finally { setAddingTask(false); }
  };

  // ── Delete task ──────────────────────────────────────────────────
  const removeTask = async (taskId: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
    try { await tasksApi.remove(taskId); }
    catch { load(); } // revert on error
  };

  // ── Payment status update ────────────────────────────────────────
  const updatePaymentStatus = async (paymentId: string, newStatus: string) => {
    try {
      const res = await paymentsApi.update(paymentId, { status: newStatus });
      setPayments((prev) => prev.map((p) => p.id === paymentId ? res.data : p));
    } catch { /* ignore */ }
  };

  // ── Delete job ───────────────────────────────────────────────────
  const handleDelete = async () => {
    if (!confirm('Xoá job này? Thao tác không thể hoàn tác.')) return;
    setDeleting(true);
    try {
      await jobsApi.remove(id);
      router.push('/jobs');
    } catch { setDeleting(false); }
  };

  // ── Notes ────────────────────────────────────────────────────────
  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteContent.trim()) return;
    setAddingNote(true);
    try {
      const res = await jobsApi.addNote(id, newNoteContent.trim());
      setNotes((prev) => [res.data, ...prev]);
      setNewNoteContent('');
    } catch { /* ignore */ }
    finally { setAddingNote(false); }
  };

  const removeNote = async (noteId: string) => {
    if (!confirm('Xoá ghi chú này?')) return;
    setNotes((prev) => prev.filter((n) => n.id !== noteId));
    try { await jobsApi.removeNote(id, noteId); }
    catch { load(); }
  };

  // ── Attachments ──────────────────────────────────────────────────
  const handleAddAttachment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAttFileUrl.trim()) return;
    const fileName = newAttFileName.trim() || newAttFileUrl.trim().split('/').pop() || 'Tài liệu';
    setAddingAttachment(true);
    try {
      const res = await jobsApi.addAttachment(id, {
        fileName,
        fileUrl: newAttFileUrl.trim(),
        fileType: 'LINK',
      });
      setAttachments((prev) => [res.data, ...prev]);
      setNewAttFileName('');
      setNewAttFileUrl('');
    } catch { /* ignore */ }
    finally { setAddingAttachment(false); }
  };

  const removeAttachment = async (attachmentId: string) => {
    if (!confirm('Xoá tệp đính kèm này?')) return;
    setAttachments((prev) => prev.filter((a) => a.id !== attachmentId));
    try { await jobsApi.removeAttachment(id, attachmentId); }
    catch { load(); }
  };

  // ─── Render ───────────────────────────────────────────────────────

  if (loading) return (
    <div className="flex items-center justify-center py-24">
      <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (error || !job) return (
    <div className="max-w-2xl mx-auto py-16 text-center">
      <p className="text-destructive text-sm">{error || 'Không tìm thấy job'}</p>
      <Link href="/jobs" className="mt-4 inline-block text-sm text-primary hover:underline">← Quay lại danh sách</Link>
    </div>
  );

  const st = STATUS_STYLES[job.status] ?? { label: job.status, className: 'bg-muted text-muted-foreground' };
  const completedCount = tasks.filter((t) => t.status === 'COMPLETED').length;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* ── Header ── */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link href="/jobs" className="text-muted-foreground hover:text-foreground transition-colors text-sm">← Quay lại</Link>
          <div>
            <h1 className="text-xl font-bold text-foreground">{job.name}</h1>
            <p className="text-sm text-muted-foreground mt-0.5">{job.brand?.name ?? ''}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <select
            value={job.status}
            disabled={updatingStatus}
            onChange={(e) => handleStatusChange(e.target.value)}
            className="px-3 py-1.5 bg-input border border-input-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary transition-all disabled:opacity-60"
          >
            {Object.entries(STATUS_STYLES).map(([v, s]) => (
              <option key={v} value={v}>{s.label}</option>
            ))}
          </select>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="p-2 rounded-xl text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors text-sm disabled:opacity-50"
            title="Xoá job"
          >
            🗑️
          </button>
        </div>
      </div>

      {/* ── Section A: Thông tin ── */}
      <section className="bg-card border border-card-border rounded-2xl p-5 space-y-4">
        <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <span>📋</span> Thông tin job
        </h2>

        <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
          <div>
            <p className="text-xs text-muted-foreground mb-0.5">Loại job</p>
            <p className="text-foreground">{job.jobType ?? '—'}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-0.5">Trạng thái</p>
            <span className={`inline-flex px-2.5 py-1 rounded-lg text-xs font-medium ${st.className}`}>{st.label}</span>
          </div>
          {job.template && (
            <div>
              <p className="text-xs text-muted-foreground mb-0.5">Mẫu việc</p>
              <Link href={`/templates/${job.template.id}`} className="text-primary hover:underline text-sm">
                {job.template.name}
              </Link>
            </div>
          )}
          {job.quantity && (
            <div>
              <p className="text-xs text-muted-foreground mb-0.5">Số lượng</p>
              <p className="text-foreground">{job.quantity}</p>
            </div>
          )}
          <div>
            <p className="text-xs text-muted-foreground mb-0.5">Ngày đăng</p>
            <p className="text-foreground">{fmt(job.postDate)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-0.5">Ngày nhận tiền DK</p>
            <p className="text-foreground">{fmt(job.paymentExpectedDate)}</p>
          </div>
          {job.receivedDate && (
            <div>
              <p className="text-xs text-muted-foreground mb-0.5">Nhận sản phẩm</p>
              <p className="text-foreground">{fmt(job.receivedDate)}</p>
            </div>
          )}
          {job.demoDate && (
            <div>
              <p className="text-xs text-muted-foreground mb-0.5">Ngày demo</p>
              <p className="text-foreground">{fmt(job.demoDate)}</p>
            </div>
          )}
        </div>

        {job.description && (
          <div className="pt-1 border-t border-card-border">
            <p className="text-xs text-muted-foreground mb-1">Mô tả</p>
            <p className="text-sm text-foreground whitespace-pre-wrap">{job.description}</p>
          </div>
        )}

        {job.brief && (
          <div className="pt-1 border-t border-card-border">
            <p className="text-xs text-muted-foreground mb-1">Brief</p>
            <p className="text-sm text-foreground whitespace-pre-wrap">{job.brief}</p>
          </div>
        )}
      </section>

      {/* ── Section B: Tasks ── */}
      <section className="bg-card border border-card-border rounded-2xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <span>✅</span> Tasks
            <span className="text-xs font-normal text-muted-foreground ml-1">
              {completedCount}/{tasks.length} hoàn thành
            </span>
          </h2>
          {tasks.length > 0 && (
            <div className="w-24 h-1.5 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all"
                style={{ width: `${tasks.length ? (completedCount / tasks.length) * 100 : 0}%` }}
              />
            </div>
          )}
        </div>

        {/* Task list */}
        <ul className="space-y-1.5">
          {tasks.map((task) => {
            const done = task.status === 'COMPLETED';
            const overdue = task.dueDate && !done && new Date(task.dueDate) < new Date();
            return (
              <li key={task.id}
                className="flex items-start gap-3 p-3 rounded-xl hover:bg-muted/40 transition-colors group">
                <button
                  onClick={() => toggleTask(task)}
                  className={`mt-0.5 w-5 h-5 flex-shrink-0 rounded-full border-2 flex items-center justify-center transition-all ${
                    done
                      ? 'bg-primary border-primary text-white'
                      : 'border-card-border hover:border-primary'
                  }`}
                >
                  {done && <span className="text-xs">✓</span>}
                </button>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm ${done ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                    {task.title}
                  </p>
                  {task.dueDate && (
                    <p className={`text-xs mt-0.5 ${overdue ? 'text-destructive font-medium' : 'text-muted-foreground'}`}>
                      {overdue ? '⚠️ ' : '📅 '}{fmt(task.dueDate)}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => removeTask(task.id)}
                  className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all text-xs"
                  title="Xoá task"
                >
                  ✕
                </button>
              </li>
            );
          })}
        </ul>

        {/* Quick add task */}
        <form onSubmit={handleAddTask} className="flex gap-2 pt-1 border-t border-card-border">
          <input
            type="text"
            value={quickTitle}
            onChange={(e) => setQuickTitle(e.target.value)}
            placeholder="Thêm task mới..."
            className="flex-1 px-3 py-2 bg-input border border-input-border rounded-xl text-sm text-foreground placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary transition-all"
          />
          <input
            type="date"
            value={quickDue}
            onChange={(e) => setQuickDue(e.target.value)}
            className="px-3 py-2 bg-input border border-input-border rounded-xl text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all"
          />
          <button
            type="submit"
            disabled={addingTask || !quickTitle.trim()}
            className="px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-xl hover:bg-primary-hover transition-colors disabled:opacity-50"
          >
            {addingTask ? '...' : '+ Thêm'}
          </button>
        </form>
      </section>

      {/* ── Section C: Payments ── */}
      <section className="bg-card border border-card-border rounded-2xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <span>💰</span> Thanh toán
          </h2>
          <button
            onClick={() => setPaymentDialog(true)}
            className="px-3 py-1.5 bg-primary text-primary-foreground text-xs font-semibold rounded-xl hover:bg-primary-hover transition-colors"
          >
            + Thêm
          </button>
        </div>

        {payments.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-sm text-muted-foreground">Chưa có khoản thanh toán nào.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-card-border">
                  <th className="text-left py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Số tiền</th>
                  <th className="text-left py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Trạng thái</th>
                  <th className="text-left py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Ngày DK</th>
                  <th className="text-left py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Ngày TT</th>
                  <th className="text-left py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Hình thức</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-card-border">
                {payments.map((p) => (
                  <tr key={p.id} className="hover:bg-muted/30 transition-colors">
                    <td className="py-3 font-medium text-foreground">{fmtMoney(p.amount, p.currency)}</td>
                    <td className="py-3">
                      <select
                        value={p.status}
                        onChange={(e) => updatePaymentStatus(p.id, e.target.value)}
                        className="px-2.5 py-1 bg-input border border-input-border rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                      >
                        {Object.entries(PAYMENT_STATUS_LABELS).map(([v, l]) => (
                          <option key={v} value={v}>{l}</option>
                        ))}
                      </select>
                    </td>
                    <td className="py-3 text-muted-foreground text-xs">{fmt(p.expectedDate)}</td>
                    <td className="py-3 text-muted-foreground text-xs">{p.paidDate ? fmt(p.paidDate) : '—'}</td>
                    <td className="py-3 text-muted-foreground text-xs">{PAYMENT_METHOD_LABELS[p.paymentMethod] ?? p.paymentMethod}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {paymentDialog && (
          <PaymentDialog
            jobId={id}
            onClose={() => setPaymentDialog(false)}
            onSaved={(p) => { setPayments((prev) => [p, ...prev]); setPaymentDialog(false); }}
          />
        )}
      </section>

      {/* ── Section D: Notes ── */}
      <section className="bg-card border border-card-border rounded-2xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <span>📝</span> Ghi chú công việc
            <span className="text-xs font-normal text-muted-foreground ml-1">
              ({notes.length})
            </span>
          </h2>
        </div>

        {/* Add note form */}
        <form onSubmit={handleAddNote} className="space-y-2">
          <textarea
            rows={2}
            value={newNoteContent}
            onChange={(e) => setNewNoteContent(e.target.value)}
            placeholder="Thêm ghi chú mới cho job này (lưu ý trao đổi với brand, feedback, v.v.)..."
            className="w-full px-3 py-2 bg-input border border-input-border rounded-xl text-sm text-foreground placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary resize-none"
          />
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={addingNote || !newNoteContent.trim()}
              className="px-4 py-1.5 bg-primary text-primary-foreground text-xs font-semibold rounded-xl hover:bg-primary-hover transition-colors disabled:opacity-50"
            >
              {addingNote ? 'Đang lưu...' : '+ Thêm ghi chú'}
            </button>
          </div>
        </form>

        {/* Notes list */}
        {notes.length === 0 ? (
          <p className="text-xs text-muted-foreground text-center py-4">Chưa có ghi chú nào.</p>
        ) : (
          <ul className="space-y-2.5 pt-1 border-t border-card-border">
            {notes.map((n) => (
              <li
                key={n.id}
                className="p-3 bg-muted/30 border border-card-border rounded-xl space-y-1 group"
              >
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-foreground">
                      {n.user?.name || 'Tôi'}
                    </span>
                    <span>•</span>
                    <span>{new Date(n.createdAt).toLocaleString('vi-VN')}</span>
                  </div>
                  <button
                    onClick={() => removeNote(n.id)}
                    className="opacity-0 group-hover:opacity-100 text-destructive hover:bg-destructive/10 px-1.5 py-0.5 rounded text-xs transition-all"
                  >
                    Xoá
                  </button>
                </div>
                <p className="text-sm text-foreground whitespace-pre-wrap">{n.content}</p>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* ── Section E: Attachments ── */}
      <section className="bg-card border border-card-border rounded-2xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <span>📎</span> Tệp & Đường dẫn đính kèm
            <span className="text-xs font-normal text-muted-foreground ml-1">
              ({attachments.length})
            </span>
          </h2>
        </div>

        {/* Add attachment form */}
        <form onSubmit={handleAddAttachment} className="flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            placeholder="Tên tệp / mô tả (VD: Video_cut_final)"
            value={newAttFileName}
            onChange={(e) => setNewAttFileName(e.target.value)}
            className="sm:w-1/3 px-3 py-2 bg-input border border-input-border rounded-xl text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <input
            type="url"
            placeholder="https://drive.google.com/... hoặc link tệp"
            value={newAttFileUrl}
            onChange={(e) => setNewAttFileUrl(e.target.value)}
            className="flex-1 px-3 py-2 bg-input border border-input-border rounded-xl text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <button
            type="submit"
            disabled={addingAttachment || !newAttFileUrl.trim()}
            className="px-4 py-2 bg-primary text-primary-foreground text-xs font-semibold rounded-xl hover:bg-primary-hover transition-colors disabled:opacity-50 whitespace-nowrap"
          >
            {addingAttachment ? '...' : '+ Đính kèm'}
          </button>
        </form>

        {/* Attachments list */}
        {attachments.length === 0 ? (
          <p className="text-xs text-muted-foreground text-center py-4">Chưa có tệp đính kèm nào.</p>
        ) : (
          <ul className="space-y-2 pt-1 border-t border-card-border">
            {attachments.map((att) => (
              <li
                key={att.id}
                className="flex items-center justify-between p-3 bg-muted/30 border border-card-border rounded-xl hover:bg-muted/50 transition-colors group"
              >
                <div className="flex items-center gap-3 truncate">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center flex-shrink-0 text-base">
                    📎
                  </div>
                  <div className="truncate">
                    <a
                      href={att.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-medium text-foreground hover:text-primary transition-colors truncate block"
                    >
                      {att.fileName} ↗
                    </a>
                    <span className="text-xs text-muted-foreground truncate block">
                      {att.fileUrl}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <a
                    href={att.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-2.5 py-1 bg-muted hover:bg-card-border text-foreground text-xs font-medium rounded-lg transition-colors"
                  >
                    Mở link
                  </a>
                  <button
                    onClick={() => removeAttachment(att.id)}
                    className="opacity-0 group-hover:opacity-100 text-destructive hover:bg-destructive/10 p-1.5 rounded-lg text-xs transition-all"
                    title="Xoá tệp"
                  >
                    🗑️
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

