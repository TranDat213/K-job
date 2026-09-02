import { cookies } from 'next/headers';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002';

export type AuthUser = {
  id: string;
  email: string;
  name: string;
  avatarUrl: string | null;
  phone: string | null;
  createdAt: string;
  updatedAt: string;
};

/**
 * Server-only: reads the httpOnly cookie and fetches the current user.
 * Returns null if unauthenticated or token is invalid.
 */
export async function getMe(): Promise<AuthUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get('koc_token')?.value;
  if (!token) return null;

  try {
    const res = await fetch(`${API_BASE}/api/auth/me`, {
      headers: { Cookie: `koc_token=${token}` },
      cache: 'no-store',
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json.data?.user ?? null;
  } catch {
    return null;
  }
}
