'use client';

import { useState, useRef } from 'react';
import { jobsApi } from '../../lib/api';
import { Upload, FileSpreadsheet, Download, AlertCircle, CheckCircle2, X } from 'lucide-react';

interface RowError {
  row: number;
  column?: string;
  message: string;
}

export function ImportJobDialog({
  isOpen,
  onClose,
  onSuccess,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [downloadingTemplate, setDownloadingTemplate] = useState(false);
  const [generalError, setGeneralError] = useState('');
  const [rowErrors, setRowErrors] = useState<RowError[]>([]);
  const [successMessage, setSuccessMessage] = useState('');

  if (!isOpen) return null;

  const handleDownloadTemplate = async () => {
    setDownloadingTemplate(true);
    try {
      await jobsApi.downloadTemplate();
    } catch (err: any) {
      alert(err.message || 'Không thể tải file mẫu');
    } finally {
      setDownloadingTemplate(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setGeneralError('');
    setRowErrors([]);
    setSuccessMessage('');
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      if (!selected.name.endsWith('.xlsx') && !selected.name.endsWith('.xls')) {
        setGeneralError('Vui lòng chọn file định dạng Excel (.xlsx hoặc .xls)');
        return;
      }
      setFile(selected);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setGeneralError('');
    setRowErrors([]);
    setSuccessMessage('');
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const selected = e.dataTransfer.files[0];
      if (!selected.name.endsWith('.xlsx') && !selected.name.endsWith('.xls')) {
        setGeneralError('Vui lòng chọn file định dạng Excel (.xlsx hoặc .xls)');
        return;
      }
      setFile(selected);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setGeneralError('Vui lòng chọn file Excel để nhập');
      return;
    }

    setLoading(true);
    setGeneralError('');
    setRowErrors([]);
    setSuccessMessage('');

    try {
      const res = await jobsApi.importExcel(file);
      setSuccessMessage(res.message || 'Đã nhập dữ liệu thành công!');
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1200);
    } catch (err: any) {
      if (err.errors && Array.isArray(err.errors) && err.errors.length > 0) {
        setRowErrors(err.errors);
        setGeneralError(`Phát hiện ${err.errors.length} lỗi trong file Excel. Vui lòng kiểm tra lại.`);
      } else {
        setGeneralError(err.message || 'Đã có lỗi xảy ra khi nhập dữ liệu');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (loading) return;
    setFile(null);
    setGeneralError('');
    setRowErrors([]);
    setSuccessMessage('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-2xl bg-card border border-card-border rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-card-border">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-foreground">Nhập công việc từ Excel</h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Thêm hàng loạt công việc bằng file bảng tính (.xlsx)
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            disabled={loading}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {/* Template Download Banner */}
          <div className="bg-primary/5 border border-primary/15 rounded-xl p-4 flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-foreground">Bạn chưa có file mẫu?</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Tải file mẫu để điền thông tin đúng cấu trúc và các cột quy định
              </p>
            </div>
            <button
              type="button"
              onClick={handleDownloadTemplate}
              disabled={downloadingTemplate}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-card border border-card-border hover:bg-muted text-xs font-semibold text-foreground rounded-lg transition-colors shrink-0 shadow-xs"
            >
              <Download className="w-3.5 h-3.5 text-primary" />
              {downloadingTemplate ? 'Đang tải...' : 'Tải file mẫu (.xlsx)'}
            </button>
          </div>

          {/* Upload Area */}
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-3 ${
              file
                ? 'border-primary bg-primary/5'
                : 'border-card-border hover:border-primary/50 hover:bg-muted/50'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileChange}
              className="hidden"
            />
            <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center text-primary">
              <Upload className="w-6 h-6" />
            </div>
            <div>
              {file ? (
                <div>
                  <p className="text-sm font-semibold text-foreground">{file.name}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {(file.size / 1024).toFixed(1)} KB — Nhấp để đổi file khác
                  </p>
                </div>
              ) : (
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    Kéo thả file Excel vào đây hoặc <span className="text-primary underline">chọn từ máy tính</span>
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Hỗ trợ định dạng .xlsx hoặc .xls (Tối đa 10MB)
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Success Message */}
          {successMessage && (
            <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center gap-3 text-emerald-600 dark:text-emerald-400 text-sm font-medium">
              <CheckCircle2 className="w-5 h-5 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* General Error Banner */}
          {generalError && !successMessage && (
            <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-xl flex items-start gap-3 text-destructive text-sm font-medium">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <div>
                <p>{generalError}</p>
              </div>
            </div>
          )}

          {/* Detailed Row Errors List */}
          {rowErrors.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-bold text-destructive uppercase tracking-wider">
                Chi tiết lỗi theo từng dòng ({rowErrors.length})
              </p>
              <div className="border border-destructive/20 bg-destructive/5 rounded-xl max-h-48 overflow-y-auto divide-y divide-destructive/10 text-xs">
                {rowErrors.map((err, i) => (
                  <div key={i} className="px-4 py-2.5 flex items-start gap-3">
                    <span className="font-bold text-destructive shrink-0">
                      Dòng {err.row}:
                    </span>
                    <span className="text-foreground">
                      {err.column ? <strong className="text-foreground font-semibold">[{err.column}] </strong> : ''}
                      {err.message}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-card-border bg-muted/30">
          <button
            type="button"
            onClick={handleClose}
            disabled={loading}
            className="px-4 py-2 bg-muted text-foreground text-sm font-medium rounded-xl hover:bg-card-border transition-colors disabled:opacity-50"
          >
            Hủy
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!file || loading}
            className="px-5 py-2 bg-primary text-primary-foreground text-sm font-semibold rounded-xl hover:bg-primary-hover active:bg-primary-active transition-colors disabled:opacity-50 flex items-center gap-2 shadow-sm shadow-primary/25"
          >
            {loading && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
            {loading ? 'Đang xử lý...' : 'Tiến hành nhập'}
          </button>
        </div>
      </div>
    </div>
  );
}
