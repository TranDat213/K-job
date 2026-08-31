import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin', 'vietnamese'] });

export const metadata: Metadata = {
  title: 'KOC Job Management System',
  description: 'Hệ thống quản lý công việc, chiến dịch và thanh toán tự động dành cho Key Opinion Consumers',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi" className="dark h-full">
      <body className={`${inter.className} bg-slate-950 text-slate-100 antialiased min-h-full flex flex-col`}>
        {children}
      </body>
    </html>
  );
}
