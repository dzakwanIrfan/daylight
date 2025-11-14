'use client';

import { Menu } from 'lucide-react';
import { UserMenu } from '@/components/main/user-menu';

interface AdminHeaderProps {
  onMenuClick: () => void;
}

export function AdminHeader({ onMenuClick }: AdminHeaderProps) {
  return (
    <header className="sticky top-0 z-30 h-16 bg-white border-b border-gray-200">
      <div className="flex items-center justify-between h-full px-4 md:px-6 lg:px-8">
        {/* Mobile Menu Button */}
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <Menu className="w-6 h-6 text-gray-700" />
        </button>

        {/* Desktop Title */}
        <div className="hidden lg:block">
          <h2 className="text-lg font-semibold text-gray-900">Admin Dashboard</h2>
        </div>

        {/* Mobile Title */}
        <div className="lg:hidden">
          <h2 className="text-base font-semibold text-gray-900">Admin</h2>
        </div>

        {/* User Menu */}
        <UserMenu />
      </div>
    </header>
  );
}