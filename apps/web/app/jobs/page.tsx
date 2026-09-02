import Link from 'next/link';

// ponytail: status badge colors follow design tokens
const STATUS_STYLES: Record<string, { label: string; className: string }> = {
  DRAFT:           { label: 'Nháp',             className: 'bg-muted text-muted-foreground' },
  NEW:             { label: 'Mới',              className: 'bg-info/30 text-info-foreground' },
  WAITING_PRODUCT: { label: 'Chờ sản phẩm',    className: 'bg-warning/50 text-warning-foreground' },
  PRODUCT_RECEIVED:{ label: 'Đã nhận SP',       className: 'bg-secondary/30 text-secondary-foreground' },
  CREATING:        { label: 'Đang tạo ND',      className: 'bg-pale-pink/50 text-pale-pink-foreground' },
  DEMO:            { label: 'Demo',             className: 'bg-pale-pink/50 text-pale-pink-foreground' },
  REVISION:        { label: 'Chỉnh sửa',        className: 'bg-warning/50 text-warning-foreground' },
  READY_TO_POST:   { label: 'Sẵn sàng đăng',   className: 'bg-soft-sage/60 text-soft-sage-foreground' },
  POSTED:          { label: 'Đã đăng',          className: 'bg-soft-sage/60 text-soft-sage-foreground' },
  WAITING_PAYMENT: { label: 'Chờ thanh toán',  className: 'bg-warning/50 text-warning-foreground' },
  PAID:            { label: 'Đã thanh toán',    className: 'bg-success text-success-foreground' },
  COMPLETED:       { label: 'Hoàn thành',       className: 'bg-success text-success-foreground' },
  CANCELLED:       { label: 'Huỷ',             className: 'bg-destructive/20 text-destructive-foreground' },
};

const FILTER_STATUSES = [
  { value: '', label: 'Tất cả' },
  { value: 'NEW', label: 'Mới' },
  { value: 'CREATING', label: 'Đang làm' },
  { value: 'DEMO', label: 'Demo' },
  { value: 'POSTED', label: 'Đã đăng' },
  { value: 'WAITING_PAYMENT', label: 'Chờ TT' },
  { value: 'COMPLETED', label: 'Hoàn thành' },
];

export default function JobsPage() {
  // ponytail: real data wired in when Jobs BE is ready
  const jobs: any[] = [];

  return (
    <div className="max-w-5xl mx-auto space-y-5">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">Công việc</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Quản lý tất cả các jobs KOC của bạn
          </p>
        </div>
        <Link
          href="/jobs/new"
          className="px-4 py-2.5 bg-primary text-primary-foreground text-sm font-semibold rounded-xl shadow-sm shadow-primary/20 hover:bg-primary-hover active:bg-primary-active transition-colors"
        >
          + Tạo job mới
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-card border border-card-border rounded-2xl p-4 flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="flex-1">
          <input
            type="text"
            placeholder="Tìm kiếm theo tên job, nhãn hàng..."
            className="w-full px-4 py-2.5 bg-input border border-input-border rounded-xl text-sm text-foreground placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
          />
        </div>

        {/* Status filter */}
        <div className="flex gap-1.5 flex-wrap">
          {FILTER_STATUSES.map((s) => (
            <button
              key={s.value}
              className={`px-3 py-2 rounded-xl text-xs font-medium transition-colors border ${
                s.value === ''
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-muted text-muted-foreground border-transparent hover:bg-card-border'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Jobs list */}
      <div className="bg-card border border-card-border rounded-2xl overflow-hidden">
        {jobs.length === 0 ? (
          /* Empty state */
          <div className="flex flex-col items-center justify-center py-16 text-center px-6">
            <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center text-3xl mb-4">
              💼
            </div>
            <p className="text-base font-semibold text-foreground">Chưa có job nào</p>
            <p className="text-sm text-muted-foreground mt-1.5 max-w-sm">
              Bắt đầu bằng cách tạo nhãn hàng và job đầu tiên. Hệ thống sẽ tự động tạo danh sách
              nhiệm vụ và nhắc nhở cho bạn.
            </p>
            <div className="flex gap-3 mt-5">
              <Link
                href="/brands"
                className="px-4 py-2 bg-muted text-foreground text-sm font-medium rounded-xl hover:bg-card-border transition-colors"
              >
                🏷️ Tạo nhãn hàng trước
              </Link>
              <Link
                href="/jobs/new"
                className="px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-xl hover:bg-primary-hover transition-colors"
              >
                + Tạo job đầu tiên
              </Link>
            </div>
          </div>
        ) : (
          /* Table header – rendered when there are jobs */
          <table className="w-full text-sm">
            <thead className="border-b border-card-border bg-muted/50">
              <tr>
                <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Tên job</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Nhãn hàng</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Trạng thái</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Ngày đăng</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-card-border">
              {jobs.map((job: any) => {
                const status = STATUS_STYLES[job.status] ?? { label: job.status, className: 'bg-muted text-muted-foreground' };
                return (
                  <tr key={job.id} className="hover:bg-muted/40 transition-colors">
                    <td className="px-5 py-4 font-medium text-foreground">{job.name}</td>
                    <td className="px-5 py-4 text-muted-foreground">{job.brand?.name ?? '—'}</td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex px-2.5 py-1 rounded-lg text-xs font-medium ${status.className}`}>
                        {status.label}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-muted-foreground">{job.postDate ?? '—'}</td>
                    <td className="px-5 py-4 text-right">
                      <Link href={`/jobs/${job.id}`} className="text-primary hover:text-primary-hover text-xs font-medium transition-colors">
                        Xem →
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
