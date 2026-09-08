'use client';

import { DashboardShell } from '@/app/_components/dashboard-shell';
import { AuthGate } from '@/app/_components/auth-gate';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGate>
      {(user) => <DashboardShell user={user}>{children}</DashboardShell>}
    </AuthGate>
  );
}