import { formatDate } from '@/lib/utils';
import { LogoutButton } from '@/app/dashboard/logout-button';
import { SidebarNav } from '@/app/dashboard/sidebar-nav';
import type { AuthUser } from '@/lib/auth-server';

/**
 * Shared shell layout for all protected pages (dashboard, jobs, brands…).
 * Renders the sidebar + top header around the page content.
 */
export function DashboardShell({
  user,
  children,
}: {
  user: AuthUser;
  children: React.ReactNode;
}) {
  const today = formatDate(new Date());
  const initials = user.name
    .split(' ')
    .map((w) => w[0])
    .slice(-2)
    .join('')
    .toUpperCase();

  return (
    <div className="min-h-screen bg-background flex">
      {/* ── Sidebar ── */}
      <aside className="w-60 shrink-0 bg-card border-r border-card-border flex flex-col">
        {/* Logo */}
        <div className="h-16 flex items-center gap-2.5 px-5 border-b border-card-border">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-primary to-primary-soft flex items-center justify-center font-bold text-white text-base shadow-sm shadow-primary/25">
            K
          </div>
          <span className="text-lg font-extrabold tracking-tight text-foreground">
            KOC Manager
          </span>
        </div>

        {/* Nav */}
        <SidebarNav />

        {/* User block */}
        <div className="p-3 border-t border-card-border">
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-muted">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-primary to-primary-soft flex items-center justify-center text-white text-xs font-bold shrink-0">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground truncate">{user.name}</p>
              <p className="text-xs text-muted-foreground truncate">{user.email}</p>
            </div>
            <LogoutButton />
          </div>
        </div>
      </aside>

      {/* ── Main ── */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-card border-b border-card-border flex items-center justify-between px-6 shrink-0">
          <p className="text-sm text-muted-foreground">{today}</p>
          <p className="text-sm font-medium text-foreground">
            Xin chào, {user.name.split(' ').pop()} 👋
          </p>
        </header>
        <main className="flex-1 overflow-auto p-6">{children}</main>
      </div>
    </div>
  );
}
