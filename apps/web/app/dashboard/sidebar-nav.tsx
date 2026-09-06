'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Tổng quan', icon: '🏠' },
  { href: '/jobs', label: 'Công việc', icon: '💼' },
  { href: '/brands', label: 'Nhãn hàng', icon: '🏷️' },
  { href: '/templates', label: 'Mẫu việc', icon: '📋' },
  { href: '/payments', label: 'Thanh toán', icon: '💰' },
  { href: '/settings', label: 'Cài đặt', icon: '⚙️' },
];

export function SidebarNav({ onItemClick }: { onItemClick?: () => void }) {
  const pathname = usePathname();

  return (
    <nav className="flex-1 py-4 px-3 space-y-0.5">
      {NAV_ITEMS.map((item) => {
        const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onItemClick}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
              isActive
                ? 'bg-primary/10 text-primary font-semibold'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
            }`}
          >
            <span className="text-base">{item.icon}</span>
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
