'use client';

import { useState, useEffect, useRef } from 'react';
import { brandsApi, Brand, CreateBrandPayload } from '../../lib/api';

// ─────────────────────────────────────────────────────────────────
// Brand Form (create / edit) — uses native <dialog>
// ─────────────────────────────────────────────────────────────────

function BrandDialog({
  editing,
  onClose,
  onSaved,
}: {
  editing: Brand | null;
  onClose: () => void;
  onSaved: (brand: Brand) => void;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [form, setForm] = useState<CreateBrandPayload>({
    name: '',
    contactName: '',
    contactPhone: '',
    contactEmail: '',
    note: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    dialogRef.current?.showModal();
    if (editing) {
      setForm({
        name: editing.name,
        contactName: editing.contactName ?? '',
        contactPhone: editing.contactPhone ?? '',
        contactEmail: editing.contactEmail ?? '',
        note: editing.note ?? '',
      });
    }
    return () => dialogRef.current?.close();
  }, [editing]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const payload: CreateBrandPayload = {
        name: form.name.trim(),
        contactName: form.contactName?.trim() || undefined,
        contactPhone: form.contactPhone?.trim() || undefined,
        contactEmail: form.contactEmail?.trim() || undefined,
        note: form.note?.trim() || undefined,
      };
      const res = editing
        ? await brandsApi.update(editing.id, payload)
        : await brandsApi.create(payload);
      onSaved(res.data);
    } catch (err: any) {
      setError(err.message || 'Đã có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  };

  const field = (
    label: string,
    key: keyof CreateBrandPayload,
    type = 'text',
    required = false,
  ) => (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
        {label} {required && <span className="text-destructive">*</span>}
      </label>
      <input
        type={type}
        required={required}
        value={(form[key] as string) ?? ''}
        onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
        className="px-3 py-2.5 bg-input border border-input-border rounded-xl text-sm text-foreground placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
      />
    </div>
  );

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      className="backdrop:bg-black/50 backdrop:backdrop-blur-sm bg-card border border-card-border rounded-2xl p-0 w-full max-w-lg shadow-2xl"
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-5 p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-foreground">
            {editing ? 'Sửa nhãn hàng' : 'Thêm nhãn hàng'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-muted-foreground hover:bg-muted transition-colors text-lg"
          >
            ✕
          </button>
        </div>

        {field('Tên nhãn hàng', 'name', 'text', true)}
        {field('Người liên hệ', 'contactName')}
        {field('Số điện thoại', 'contactPhone', 'tel')}
        {field('Email', 'contactEmail', 'email')}

        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            Ghi chú
          </label>
          <textarea
            rows={3}
            value={form.note ?? ''}
            onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))}
            className="px-3 py-2.5 bg-input border border-input-border rounded-xl text-sm text-foreground placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all resize-none"
          />
        </div>

        {error && (
          <p className="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-lg">
            {error}
          </p>
        )}

        <div className="flex gap-3 pt-1">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 bg-muted text-foreground text-sm font-medium rounded-xl hover:bg-card-border transition-colors"
          >
            Huỷ
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 py-2.5 bg-primary text-primary-foreground text-sm font-semibold rounded-xl shadow-sm shadow-primary/20 hover:bg-primary-hover transition-colors disabled:opacity-50"
          >
            {loading ? 'Đang lưu...' : editing ? 'Cập nhật' : 'Tạo nhãn hàng'}
          </button>
        </div>
      </form>
    </dialog>
  );
}

// ─────────────────────────────────────────────────────────────────
// Main page
// ─────────────────────────────────────────────────────────────────

export default function BrandsPage() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Brand | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  const loadBrands = async () => {
    try {
      setError('');
      const res = await brandsApi.getAll();
      setBrands(res.data);
    } catch (err: any) {
      setError(err.message || 'Không thể tải danh sách nhãn hàng');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadBrands(); }, []);

  const openCreate = () => { setEditing(null); setDialogOpen(true); };
  const openEdit = (b: Brand) => { setEditing(b); setDialogOpen(true); };
  const closeDialog = () => { setDialogOpen(false); setEditing(null); };

  const handleSaved = (brand: Brand) => {
    setBrands((prev) => {
      const exists = prev.find((b) => b.id === brand.id);
      return exists
        ? prev.map((b) => (b.id === brand.id ? brand : b))
        : [brand, ...prev];
    });
    closeDialog();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Xoá nhãn hàng này? Thao tác không thể hoàn tác.')) return;
    setDeleting(id);
    try {
      await brandsApi.remove(id);
      setBrands((prev) => prev.filter((b) => b.id !== id));
    } catch (err: any) {
      alert(err.message || 'Xoá thất bại');
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">Nhãn hàng</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Quản lý danh sách nhãn hàng hợp tác
          </p>
        </div>
        <button
          onClick={openCreate}
          className="px-4 py-2.5 bg-primary text-primary-foreground text-sm font-semibold rounded-xl shadow-sm shadow-primary/20 hover:bg-primary-hover transition-colors"
        >
          + Thêm nhãn hàng
        </button>
      </div>

      {/* States */}
      {loading && (
        <div className="bg-card border border-card-border rounded-2xl flex items-center justify-center py-16">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-muted-foreground">Đang tải...</p>
          </div>
        </div>
      )}

      {!loading && error && (
        <div className="bg-destructive/10 border border-destructive/20 rounded-2xl flex items-center justify-center py-10 text-center px-6">
          <div>
            <p className="text-sm font-medium text-destructive">{error}</p>
            <button
              onClick={loadBrands}
              className="mt-3 text-xs text-primary hover:underline"
            >
              Thử lại
            </button>
          </div>
        </div>
      )}

      {!loading && !error && brands.length === 0 && (
        <div className="bg-card border border-card-border rounded-2xl flex flex-col items-center justify-center py-16 text-center px-6">
          <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center text-3xl mb-4">
            🏷️
          </div>
          <p className="text-base font-semibold text-foreground">Chưa có nhãn hàng nào</p>
          <p className="text-sm text-muted-foreground mt-1.5 max-w-sm">
            Thêm nhãn hàng đầu tiên để bắt đầu tạo jobs.
          </p>
          <button
            onClick={openCreate}
            className="mt-5 px-4 py-2.5 bg-primary text-primary-foreground text-sm font-semibold rounded-xl shadow-sm shadow-primary/20 hover:bg-primary-hover transition-colors"
          >
            + Thêm nhãn hàng đầu tiên
          </button>
        </div>
      )}

      {/* Brands grid */}
      {!loading && !error && brands.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {brands.map((brand) => (
            <div
              key={brand.id}
              className="bg-card border border-card-border rounded-2xl p-5 flex flex-col gap-3 hover:border-primary/30 transition-colors"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-xl flex-shrink-0">
                  🏷️
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => openEdit(brand)}
                    className="p-1.5 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors text-sm"
                    title="Sửa"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => handleDelete(brand.id)}
                    disabled={deleting === brand.id}
                    className="p-1.5 rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors text-sm disabled:opacity-50"
                    title="Xoá"
                  >
                    🗑️
                  </button>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-foreground">{brand.name}</h3>
                {brand._count !== undefined && (
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {brand._count.jobs} job{brand._count.jobs !== 1 ? 's' : ''}
                  </p>
                )}
              </div>

              {(brand.contactName || brand.contactPhone || brand.contactEmail) && (
                <div className="border-t border-card-border pt-3 space-y-1">
                  {brand.contactName && (
                    <p className="text-xs text-muted-foreground">
                      👤 {brand.contactName}
                    </p>
                  )}
                  {brand.contactPhone && (
                    <p className="text-xs text-muted-foreground">
                      📞 {brand.contactPhone}
                    </p>
                  )}
                  {brand.contactEmail && (
                    <p className="text-xs text-muted-foreground truncate">
                      ✉️ {brand.contactEmail}
                    </p>
                  )}
                </div>
              )}

              {brand.note && (
                <p className="text-xs text-muted-foreground bg-muted rounded-lg px-2.5 py-1.5 line-clamp-2">
                  {brand.note}
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Dialog */}
      {dialogOpen && (
        <BrandDialog editing={editing} onClose={closeDialog} onSaved={handleSaved} />
      )}
    </div>
  );
}
