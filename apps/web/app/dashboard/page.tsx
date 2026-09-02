import Link from 'next/link';

// ponytail: stats are static until Jobs/Brands BE is ready
const STAT_CARDS = [
  {
    label: 'Tổng jobs',
    value: '—',
    icon: '💼',
    color: 'bg-primary/10 text-primary',
    note: 'Chưa có dữ liệu',
  },
  {
    label: 'Đang thực hiện',
    value: '—',
    icon: '🔄',
    color: 'bg-secondary/20 text-secondary-foreground',
    note: 'Chưa có dữ liệu',
  },
  {
    label: 'Việc đến hạn hôm nay',
    value: '—',
    icon: '⏰',
    color: 'bg-warning/60 text-warning-foreground',
    note: 'Chưa có dữ liệu',
  },
  {
    label: 'Doanh thu tháng này',
    value: '—',
    icon: '💰',
    color: 'bg-soft-sage/60 text-soft-sage-foreground',
    note: 'Chưa có dữ liệu',
  },
];

const QUICK_ACTIONS = [
  { href: '/jobs/new', label: '+ Tạo job mới', primary: true },
  { href: '/brands', label: '🏷️ Quản lý nhãn hàng', primary: false },
  { href: '/templates', label: '📋 Mẫu việc', primary: false },
  { href: '/payments', label: '💰 Thanh toán', primary: false },
];

export default function DashboardPage() {
  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Welcome banner */}
      <div className="rounded-2xl bg-gradient-to-r from-primary/10 via-pale-pink/20 to-secondary/10 border border-card-border px-6 py-5 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">Tổng quan công việc</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Theo dõi tất cả jobs, nhiệm vụ và doanh thu của bạn tại đây.
          </p>
        </div>
        <Link
          href="/jobs/new"
          className="px-4 py-2.5 bg-primary text-primary-foreground text-sm font-semibold rounded-xl shadow-sm shadow-primary/20 hover:bg-primary-hover active:bg-primary-active transition-colors"
        >
          + Tạo job mới
        </Link>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {STAT_CARDS.map((s) => (
          <div
            key={s.label}
            className="bg-card border border-card-border rounded-2xl p-5 flex flex-col gap-3"
          >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl ${s.color}`}>
              {s.icon}
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{s.value}</p>
              <p className="text-sm font-medium text-foreground mt-0.5">{s.label}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{s.note}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Quick actions + Empty state */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick actions */}
        <div className="bg-card border border-card-border rounded-2xl p-5">
          <h2 className="text-sm font-semibold text-foreground mb-3">Thao tác nhanh</h2>
          <div className="flex flex-col gap-2">
            {QUICK_ACTIONS.map((a) => (
              <Link
                key={a.href}
                href={a.href}
                className={`block w-full text-center px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  a.primary
                    ? 'bg-primary text-primary-foreground hover:bg-primary-hover shadow-sm shadow-primary/15'
                    : 'bg-muted text-foreground hover:bg-card-border'
                }`}
              >
                {a.label}
              </Link>
            ))}
          </div>
        </div>

        {/* Recent jobs placeholder */}
        <div className="lg:col-span-2 bg-card border border-card-border rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-foreground">Jobs gần đây</h2>
            <Link href="/jobs" className="text-xs text-primary hover:text-primary-hover font-medium transition-colors">
              Xem tất cả →
            </Link>
          </div>

          {/* Empty state */}
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center text-2xl mb-3">
              📋
            </div>
            <p className="text-sm font-medium text-foreground">Chưa có job nào</p>
            <p className="text-xs text-muted-foreground mt-1 max-w-xs">
              Tạo nhãn hàng và job đầu tiên để bắt đầu theo dõi công việc KOC của bạn.
            </p>
            <Link
              href="/jobs/new"
              className="mt-4 px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-xl hover:bg-primary-hover transition-colors"
            >
              + Tạo job đầu tiên
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
