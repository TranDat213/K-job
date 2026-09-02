import { redirect } from 'next/navigation';
import { getMe } from '@/lib/auth-server';
import { DashboardShell } from '@/app/_components/dashboard-shell';

export default async function SettingsLayout({ children }: { children: React.ReactNode }) {
  const user = await getMe();
  if (!user) redirect('/login');
  return <DashboardShell user={user}>{children}</DashboardShell>;
}
