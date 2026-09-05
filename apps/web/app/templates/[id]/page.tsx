'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  templatesApi,
  JobTemplateDetail,
  TemplateTask,
  CreateTemplateTaskPayload,
} from '../../../lib/api';

const JOB_TYPE_LABELS: Record<string, string> = {
  PRODUCT_REVIEW: 'Review sản phẩm',
  EVENT: 'Sự kiện',
  SELF_PURCHASE: 'Tự mua',
  CONTENT_CREATION: 'Tạo nội dung',
  AFFILIATE: 'Affiliate',
  OTHER: 'Khác',
};

// ─────────────────────────────────────────────────────────────────
// Inline editable task row
// ─────────────────────────────────────────────────────────────────
function TaskRow({
  task,
  isReadOnly,
  onUpdate,
  onDelete,
}: {
  task: TemplateTask;
  isReadOnly?: boolean;
  onUpdate: (id: string, data: Partial<CreateTemplateTaskPayload>) => Promise<void>;
  onDelete: (id: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(task.title);
  const [days, setDays] = useState(task.daysBeforePost);
  const [saving, setSaving] = useState(false);

  const save = async () => {
    if (!title.trim()) return;
    setSaving(true);
    await onUpdate(task.id, { title: title.trim(), daysBeforePost: days });
    setSaving(false);
    setEditing(false);
  };

  const cancel = () => {
    setTitle(task.title);
    setDays(task.daysBeforePost);
    setEditing(false);
  };

  if (editing && !isReadOnly) {
    return (
      <li className="flex items-center gap-3 p-3 bg-muted/40 rounded-xl border border-input-border">
        <span className="w-6 text-center text-xs text-muted-foreground font-mono flex-shrink-0">{task.order + 1}</span>
        <input
          autoFocus
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={(e) => e.key === 'Escape' && cancel()}
          className="flex-1 px-3 py-1.5 bg-input border border-input-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary transition-all"
        />
        <div className="flex items-center gap-1 flex-shrink-0">
          <input
            type="number" min="0" max="365"
            value={days}
            onChange={(e) => setDays(Number(e.target.value))}
            className="w-16 px-2 py-1.5 bg-input border border-input-border rounded-lg text-sm text-center focus:outline-none focus:ring-2 focus:ring-primary transition-all"
          />
          <span className="text-xs text-muted-foreground whitespace-nowrap">ngày trước</span>
        </div>
        <div className="flex gap-1">
          <button onClick={save} disabled={saving}
            className="px-3 py-1.5 bg-primary text-primary-foreground text-xs font-medium rounded-lg hover:bg-primary-hover transition-colors disabled:opacity-50">
            {saving ? '...' : 'Lưu'}
          </button>
          <button onClick={cancel}
            className="px-3 py-1.5 bg-muted text-foreground text-xs font-medium rounded-lg hover:bg-card-border transition-colors">
            Huỷ
          </button>
        </div>
      </li>
    );
  }

  return (
    <li className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted/30 transition-colors group">
      <span className="w-6 text-center text-xs text-muted-foreground font-mono flex-shrink-0">{task.order + 1}</span>
      <p className="flex-1 text-sm text-foreground truncate">{task.title}</p>
      <div className="flex items-center gap-2 text-xs text-muted-foreground flex-shrink-0">
        {task.daysBeforePost > 0 && (
          <span className="bg-warning/30 text-warning-foreground px-2 py-0.5 rounded-lg">
            {task.daysBeforePost}d trước
          </span>
        )}
        {task.isRequired && (
          <span className="bg-pale-pink/30 text-pale-pink-foreground px-2 py-0.5 rounded-lg">Bắt buộc</span>
        )}
      </div>
      {!isReadOnly && (
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={() => setEditing(true)}
            className="p-1.5 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors text-sm" title="Sửa">✏️</button>
          <button onClick={() => onDelete(task.id)}
            className="p-1.5 rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors text-sm" title="Xoá">🗑️</button>
        </div>
      )}
    </li>
  );
}

// ─────────────────────────────────────────────────────────────────
// Main page
// ─────────────────────────────────────────────────────────────────
export default function TemplateDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [template, setTemplate] = useState<JobTemplateDetail | null>(null);
  const [tasks, setTasks] = useState<TemplateTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copying, setCopying] = useState(false);

  // Quick add
  const [newTitle, setNewTitle] = useState('');
  const [newDays, setNewDays] = useState(0);
  const [adding, setAdding] = useState(false);

  const load = useCallback(async () => {
    try {
      setError('');
      const res = await templatesApi.getOne(id);
      setTemplate(res.data);
      setTasks(res.data.templateTasks ?? []);
    } catch (e: any) { setError(e.message || 'Không thể tải mẫu'); }
    finally { setLoading(false); }
  }, [id]);

  useEffect(() => { load(); }, [load]);

  // ── Add task ─────────────────────────────────────────────────────
  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    setAdding(true);
    try {
      const res = await templatesApi.createTask(id, {
        title: newTitle.trim(),
        order: tasks.length,
        daysBeforePost: newDays,
        isRequired: true,
      });
      setTasks((prev) => [...prev, res.data]);
      setNewTitle(''); setNewDays(0);
    } catch { /* ignore */ }
    finally { setAdding(false); }
  };

  // ── Update task ───────────────────────────────────────────────────
  const handleUpdate = async (taskId: string, data: Partial<CreateTemplateTaskPayload>) => {
    try {
      const res = await templatesApi.updateTask(taskId, data);
      setTasks((prev) => prev.map((t) => t.id === taskId ? res.data : t));
    } catch { /* ignore */ }
  };

  // ── Delete task ───────────────────────────────────────────────────
  const handleDelete = async (taskId: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
    try { await templatesApi.removeTask(taskId); }
    catch { load(); }
  };

  // ── Copy system template ─────────────────────────────────────────
  const handleCopy = async () => {
    setCopying(true);
    try {
      const res = await templatesApi.copy(id);
      router.push(`/templates/${res.data.id}`);
    } catch (e: any) {
      alert(e.message || 'Sao chép thất bại');
    } finally {
      setCopying(false);
    }
  };

  // ── Render ────────────────────────────────────────────────────────
  if (loading) return (
    <div className="flex items-center justify-center py-24">
      <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (error || !template) return (
    <div className="max-w-2xl mx-auto py-16 text-center">
      <p className="text-destructive text-sm">{error || 'Không tìm thấy mẫu'}</p>
      <Link href="/templates" className="mt-4 inline-block text-sm text-primary hover:underline">← Quay lại</Link>
    </div>
  );

  const isReadOnly = template.scope === 'SYSTEM';

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <Link href="/templates" className="text-muted-foreground hover:text-foreground transition-colors text-sm mt-1">
            ← Mẫu việc
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-foreground">{template.name}</h1>
              <span
                className={`text-xs px-2.5 py-0.5 rounded-full font-semibold ${
                  isReadOnly
                    ? 'bg-soft-sage/50 text-soft-sage-foreground border border-soft-sage/70'
                    : 'bg-muted text-muted-foreground border border-card-border'
                }`}
              >
                {isReadOnly ? '🏢 Mẫu hệ thống' : '👤 Mẫu của tôi'}
              </span>
            </div>
            <div className="flex items-center gap-2 mt-1">
              {template.jobType && (
                <span className="text-xs text-muted-foreground">
                  {JOB_TYPE_LABELS[template.jobType] ?? template.jobType}
                </span>
              )}
              <span className="text-xs text-muted-foreground">· {tasks.length} tasks</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Link
            href={`/jobs/new?templateId=${template.id}`}
            className="px-3.5 py-2 bg-primary text-primary-foreground text-xs font-semibold rounded-xl hover:bg-primary-hover transition-colors shadow-sm"
          >
            🚀 Dùng tạo Job
          </Link>
          {isReadOnly && (
            <button
              onClick={handleCopy}
              disabled={copying}
              className="px-3.5 py-2 bg-secondary text-secondary-foreground text-xs font-semibold rounded-xl hover:bg-secondary/80 transition-colors disabled:opacity-50"
            >
              {copying ? 'Đang sao chép...' : 'Tùy chỉnh (Tạo bản sao)'}
            </button>
          )}
        </div>
      </div>

      {isReadOnly && (
        <div className="bg-primary/10 border border-primary/20 rounded-xl px-4 py-3 text-xs text-foreground flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-base">ℹ️</span>
            <span>
              Đây là mẫu chuẩn của hệ thống (chế độ chỉ xem). Để tùy biến danh sách task theo nhu cầu riêng, hãy tạo bản sao.
            </span>
          </div>
          <button
            onClick={handleCopy}
            disabled={copying}
            className="text-primary hover:underline font-semibold whitespace-nowrap text-xs"
          >
            Tạo bản sao ↗
          </button>
        </div>
      )}

      {template.description && (
        <p className="text-sm text-muted-foreground bg-muted px-4 py-3 rounded-xl">{template.description}</p>
      )}

      {/* Info box */}
      <div className="bg-soft-sage/30 border border-soft-sage/60 rounded-xl px-4 py-3 text-xs text-soft-sage-foreground">
        <strong>💡 Cách hoạt động:</strong> Khi tạo job với mẫu này, mỗi task sẽ có ngày hạn =
        Ngày đăng − số ngày trước. Ví dụ: "3 ngày trước" + ngày đăng 10/9 → hạn 7/9.
      </div>

      {/* Task list */}
      <section className="bg-card border border-card-border rounded-2xl p-5 space-y-3">
        <h2 className="text-sm font-semibold text-foreground">Danh sách tasks trong mẫu</h2>

        {tasks.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-sm text-muted-foreground">
              {isReadOnly ? 'Mẫu này chưa có task nào.' : 'Chưa có task nào. Thêm task đầu tiên bên dưới.'}
            </p>
          </div>
        ) : (
          <ul className="space-y-1">
            {tasks.map((task) => (
              <TaskRow
                key={task.id}
                task={task}
                isReadOnly={isReadOnly}
                onUpdate={handleUpdate}
                onDelete={handleDelete}
              />
            ))}
          </ul>
        )}

        {/* Quick add for non-system templates */}
        {!isReadOnly ? (
          <form onSubmit={handleAdd} className="flex gap-2 pt-2 border-t border-card-border">
            <input
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="Tên task mới..."
              className="flex-1 px-3 py-2 bg-input border border-input-border rounded-xl text-sm text-foreground placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary transition-all"
            />
            <div className="flex items-center gap-1 flex-shrink-0">
              <input
                type="number" min="0" max="365"
                value={newDays}
                onChange={(e) => setNewDays(Number(e.target.value))}
                title="Số ngày trước ngày đăng"
                className="w-16 px-2 py-2 bg-input border border-input-border rounded-xl text-sm text-center focus:outline-none focus:ring-2 focus:ring-primary transition-all"
              />
              <span className="text-xs text-muted-foreground whitespace-nowrap">ngày trước</span>
            </div>
            <button
              type="submit"
              disabled={adding || !newTitle.trim()}
              className="px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-xl hover:bg-primary-hover transition-colors disabled:opacity-50"
            >
              {adding ? '...' : '+ Thêm'}
            </button>
          </form>
        ) : (
          <p className="text-xs text-muted-foreground text-center pt-2 border-t border-card-border italic">
            🔒 Mẫu hệ thống được khóa chỉnh sửa trực tiếp. Bấm "Tùy chỉnh (Tạo bản sao)" ở trên để sửa.
          </p>
        )}
      </section>
    </div>
  );
}

