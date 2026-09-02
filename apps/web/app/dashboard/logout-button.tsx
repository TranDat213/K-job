'use client';

export function LogoutButton() {
  async function handleLogout() {
    const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002';
    await fetch(`${API_BASE}/api/auth/logout`, {
      method: 'POST',
      credentials: 'include',
    });
    window.location.href = '/login';
  }

  return (
    <button
      type="button"
      title="Đăng xuất"
      onClick={handleLogout}
      className="text-muted-foreground hover:text-destructive-foreground transition-colors text-base leading-none"
    >
      🚪
    </button>
  );
}
