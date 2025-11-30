'use client';

import Link from 'next/link';
import { UserMenu } from './user-menu';
import { BottomNav } from './bottom-nav';
import { EmailVerificationBanner } from './email-verification-banner';
import { NotificationBell } from './notification-bell';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Top Header */}
      <header className="border-b bg-white sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="flex justify-between items-center h-16">
            <Link href="/">
              <h1 className="text-2xl logo-text font-bold text-brand cursor-pointer hover:opacity-80 transition">
                DayLight
              </h1>
            </Link>

            <div className="flex items-center gap-2">
              <NotificationBell />
              <UserMenu />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
        <EmailVerificationBanner />
        {children}
      </main>

      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  );
}