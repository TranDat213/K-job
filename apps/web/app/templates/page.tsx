export default function TemplatesPage() {
  return (
    <div className="max-w-5xl mx-auto space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">Mẫu việc</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Tạo mẫu công việc để dùng lại cho nhiều jobs</p>
        </div>
        <button className="px-4 py-2.5 bg-primary text-primary-foreground text-sm font-semibold rounded-xl shadow-sm shadow-primary/20 hover:bg-primary-hover transition-colors">
          + Tạo mẫu
        </button>
      </div>
      <div className="bg-card border border-card-border rounded-2xl flex flex-col items-center justify-center py-16 text-center px-6">
        <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center text-3xl mb-4">📋</div>
        <p className="text-base font-semibold text-foreground">Chưa có mẫu việc nào</p>
        <p className="text-sm text-muted-foreground mt-1.5 max-w-sm">
          Tạo mẫu việc để hệ thống tự động sinh task khi tạo job mới.
        </p>
        <p className="text-xs text-muted-foreground mt-3 bg-muted px-3 py-1.5 rounded-lg inline-block">
          🚧 Tính năng đang phát triển
        </p>
      </div>
    </div>
  );
}
