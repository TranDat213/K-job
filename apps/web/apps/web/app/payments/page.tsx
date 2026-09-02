export default function PaymentsPage() {
  return (
    <div className="max-w-5xl mx-auto space-y-5">
      <div>
        <h1 className="text-xl font-bold text-foreground">Thanh toán</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Theo dõi tình trạng thanh toán từ nhãn hàng</p>
      </div>
      <div className="bg-card border border-card-border rounded-2xl flex flex-col items-center justify-center py-16 text-center px-6">
        <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center text-3xl mb-4">💰</div>
        <p className="text-base font-semibold text-foreground">Chưa có khoản thanh toán nào</p>
        <p className="text-sm text-muted-foreground mt-1.5 max-w-sm">Thanh toán sẽ hiển thị ở đây sau khi bạn tạo jobs và thêm thông tin payment.</p>
        <p className="text-xs text-muted-foreground mt-3 bg-muted px-3 py-1.5 rounded-lg">🚧 Tính năng đang phát triển</p>
      </div>
    </div>
  );
}
