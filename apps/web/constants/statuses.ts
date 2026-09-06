/**
 * Định nghĩa chuẩn hóa các trạng thái và nhãn tiếng Việt thuần
 * dùng chung cho toàn bộ ứng dụng Frontend
 */

export interface StatusStyle {
  label: string;
  className: string;
}

export const JOB_STATUS_STYLES: Record<string, StatusStyle> = {
  DRAFT:            { label: 'Bản nháp',             className: 'bg-muted text-muted-foreground' },
  NEW:              { label: 'Mới nhận',             className: 'bg-info/30 text-info-foreground' },
  WAITING_PRODUCT:  { label: 'Chờ nhận sản phẩm',    className: 'bg-warning/50 text-warning-foreground' },
  PRODUCT_RECEIVED: { label: 'Đã nhận sản phẩm',     className: 'bg-secondary/30 text-secondary-foreground' },
  CREATING:         { label: 'Đang sản xuất nội dung', className: 'bg-pale-pink/50 text-pale-pink-foreground' },
  DEMO:             { label: 'Chờ duyệt bản nháp',   className: 'bg-pale-pink/50 text-pale-pink-foreground' },
  REVISION:         { label: 'Cần chỉnh sửa',        className: 'bg-warning/50 text-warning-foreground' },
  READY_TO_POST:    { label: 'Sẵn sàng đăng bài',    className: 'bg-soft-sage/60 text-soft-sage-foreground' },
  POSTED:           { label: 'Đã đăng bài',          className: 'bg-soft-sage/60 text-soft-sage-foreground' },
  WAITING_PAYMENT:  { label: 'Chờ thanh toán',      className: 'bg-warning/50 text-warning-foreground' },
  PAID:             { label: 'Đã thanh toán',        className: 'bg-success text-success-foreground' },
  COMPLETED:        { label: 'Hoàn thành',           className: 'bg-success text-success-foreground' },
  CANCELLED:        { label: 'Đã hủy',               className: 'bg-destructive/20 text-destructive-foreground' },
};

export const JOB_STATUS_OPTIONS = [
  { value: 'DRAFT', label: 'Bản nháp' },
  { value: 'NEW', label: 'Mới nhận' },
  { value: 'WAITING_PRODUCT', label: 'Chờ nhận sản phẩm' },
  { value: 'PRODUCT_RECEIVED', label: 'Đã nhận sản phẩm' },
  { value: 'CREATING', label: 'Đang sản xuất nội dung' },
  { value: 'DEMO', label: 'Chờ duyệt bản nháp' },
  { value: 'REVISION', label: 'Cần chỉnh sửa' },
  { value: 'READY_TO_POST', label: 'Sẵn sàng đăng bài' },
  { value: 'POSTED', label: 'Đã đăng bài' },
  { value: 'WAITING_PAYMENT', label: 'Chờ thanh toán' },
  { value: 'PAID', label: 'Đã thanh toán' },
  { value: 'COMPLETED', label: 'Hoàn thành' },
  { value: 'CANCELLED', label: 'Đã hủy' },
];

export const JOB_FILTER_STATUSES = [
  { value: '', label: 'Tất cả' },
  { value: 'NEW', label: 'Mới nhận' },
  { value: 'WAITING_PRODUCT', label: 'Chờ nhận SP' },
  { value: 'CREATING', label: 'Đang sản xuất' },
  { value: 'DEMO', label: 'Chờ duyệt nháp' },
  { value: 'POSTED', label: 'Đã đăng bài' },
  { value: 'WAITING_PAYMENT', label: 'Chờ thanh toán' },
  { value: 'COMPLETED', label: 'Hoàn thành' },
];

export const JOB_TYPE_OPTIONS = [
  { value: 'PRODUCT_REVIEW', label: 'Đánh giá sản phẩm (Review)' },
  { value: 'EVENT', label: 'Tham gia sự kiện' },
  { value: 'SELF_PURCHASE', label: 'Tự mua trải nghiệm' },
  { value: 'CONTENT_CREATION', label: 'Sản xuất nội dung' },
  { value: 'AFFILIATE', label: 'Tiếp thị liên kết (Affiliate)' },
  { value: 'OTHER', label: 'Khác' },
];

export const JOB_TYPE_LABELS: Record<string, string> = {
  PRODUCT_REVIEW: 'Đánh giá sản phẩm',
  EVENT: 'Tham gia sự kiện',
  SELF_PURCHASE: 'Tự mua trải nghiệm',
  CONTENT_CREATION: 'Sản xuất nội dung',
  AFFILIATE: 'Tiếp thị liên kết',
  OTHER: 'Khác',
};

export const PAYMENT_STATUS_LABELS: Record<string, string> = {
  PENDING: 'Chờ thanh toán',
  REQUESTED: 'Đã gửi yêu cầu',
  PAID: 'Đã thanh toán',
  OVERDUE: 'Quá hạn thanh toán',
  CANCELLED: 'Đã hủy',
};

export const PAYMENT_METHOD_LABELS: Record<string, string> = {
  BANK_TRANSFER: 'Chuyển khoản ngân hàng',
  CASH: 'Tiền mặt',
  E_WALLET: 'Ví điện tử',
  OTHER: 'Khác',
};

export const TASK_STATUS_LABELS: Record<string, string> = {
  TODO: 'Cần làm',
  IN_PROGRESS: 'Đang thực hiện',
  COMPLETED: 'Đã hoàn thành',
  SKIPPED: 'Bỏ qua',
};
