'use client';

import { useState } from 'react';
import { formatDate } from '@/lib/utils';
import { LogoutButton } from '@/app/dashboard/logout-button';
import { SidebarNav } from '@/app/dashboard/sidebar-nav';
import type { AuthUser } from '@/lib/auth-server';
import { Menu, X } from 'lucide-react';

function SidebarContent({
  user,
  onClose,
}: {
  user: AuthUser;
  onClose?: () => void;
}) {
  const initials = user.name
    .split(' ')
    .map((w) => w[0])
    .slice(-2)
    .join('')
    .toUpperCase();

  return (
    <div className="h-full flex flex-col justify-between">
      <div>
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-5 border-b border-card-border">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-primary to-primary-soft flex items-center justify-center font-bold text-white text-base shadow-sm shadow-primary/25">
              K
            </div>
            <span className="text-lg font-extrabold tracking-tight text-foreground">
              KOC Manager
            </span>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors md:hidden"
              aria-label="Đóng menu"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Nav */}
        <SidebarNav onItemClick={onClose} />
      </div>

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
    </div>
  );
}

/**
 * Shared shell layout for all protected pages (dashboard, jobs, brands…).
 * Renders the responsive sidebar + top header around the page content.
 */
export function DashboardShell({
  user,
  children,
}: {
  user: AuthUser;
  children: React.ReactNode;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const today = formatDate(new Date());

  return (
    <div className="min-h-screen bg-background flex">
      {/* ── Desktop Sidebar ── */}
      <aside className="hidden md:flex md:w-60 shrink-0 bg-card border-r border-card-border flex-col">
        <SidebarContent user={user} />
      </aside>

      {/* ── Mobile Drawer ── */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileOpen(false)}
          />

          {/* Drawer Panel */}
          <aside className="relative w-72 max-w-[85vw] bg-card border-r border-card-border flex flex-col shadow-2xl z-50">
            <SidebarContent user={user} onClose={() => setMobileOpen(false)} />
          </aside>
        </div>
      )}

      {/* ── Main Area ── */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-card border-b border-card-border flex items-center justify-between px-4 sm:px-6 shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileOpen(true)}
              className="p-2 -ml-2 rounded-xl text-foreground hover:bg-muted md:hidden transition-colors"
              aria-label="Mở menu"
            >
              <Menu className="w-5 h-5" />
            </button>
            <p className="text-xs sm:text-sm text-muted-foreground">{today}</p>
          </div>
          <p className="text-xs sm:text-sm font-medium text-foreground truncate ml-2">
            Xin chào, {user.name.split(' ').pop()} 👋
          </p>
        </header>
        <main className="flex-1 overflow-auto p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}
