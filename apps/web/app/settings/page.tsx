export default function SettingsPage() {
  return (
    <div className="max-w-2xl mx-auto space-y-5">
      <div>
        <h1 className="text-xl font-bold text-foreground">Cài đặt</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Quản lý thông tin tài khoản</p>
      </div>
      <div className="bg-card border border-card-border rounded-2xl p-6">
        <h2 className="text-sm font-semibold text-foreground mb-3">Thông tin cá nhân</h2>
        <p className="text-xs text-muted-foreground bg-muted px-3 py-1.5 rounded-lg inline-block">
          🚧 Tính năng đang phát triển
        </p>
      </div>
      <div className="bg-card border border-card-border rounded-2xl p-6">
        <h2 className="text-sm font-semibold text-foreground mb-3">Bảo mật</h2>
        <p className="text-xs text-muted-foreground bg-muted px-3 py-1.5 rounded-lg inline-block">
          🚧 Tính năng đang phát triển
        </p>
      </div>
    </div>
  );
}
