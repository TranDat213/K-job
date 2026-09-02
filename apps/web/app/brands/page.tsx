export default function BrandsPage() {
  return (
    <div className="max-w-5xl mx-auto space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">Nhãn hàng</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Quản lý danh sách nhãn hàng hợp tác</p>
        </div>
        <button className="px-4 py-2.5 bg-primary text-primary-foreground text-sm font-semibold rounded-xl shadow-sm shadow-primary/20 hover:bg-primary-hover transition-colors">
          + Thêm nhãn hàng
        </button>
      </div>
      <div className="bg-card border border-card-border rounded-2xl flex flex-col items-center justify-center py-16 text-center px-6">
        <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center text-3xl mb-4">🏷️</div>
        <p className="text-base font-semibold text-foreground">Chưa có nhãn hàng nào</p>
        <p className="text-sm text-muted-foreground mt-1.5 max-w-sm">
          Thêm nhãn hàng đầu tiên để bắt đầu tạo jobs.
        </p>
        <p className="text-xs text-muted-foreground mt-3 bg-muted px-3 py-1.5 rounded-lg inline-block">
          🚧 Tính năng đang phát triển
        </p>
      </div>
    </div>
  );
}
