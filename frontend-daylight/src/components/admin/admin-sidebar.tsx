'use client';

import { usePathname, useRouter } from 'next/navigation';
import { X, LayoutDashboard, Users, Calendar, Settings, FileText, Crown } from 'lucide-react';
import { cn } from '@/lib/utils';
import Image from 'next/image';

interface AdminSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const menuItems = [
  {
    title: 'Dashboard',
    href: '/admin',
    icon: LayoutDashboard,
  },
  {
    title: 'Users',
    href: '/admin/users',
    icon: Users,
  },
  {
    title: 'Events',
    href: '/admin/events',
    icon: Calendar,
  },
  {
    title: 'Subscriptions',
    href: '/admin/subscriptions',
    icon: Crown, 
  },
  {
    title: 'Subscription Plans',
    href: '/admin/subscription-plans',
    icon: Settings,
  },
  { 
    title: 'Transactions', 
    href: '/admin/transactions', 
    icon: FileText 
  },
];

export function AdminSidebar({ isOpen, onClose }: AdminSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const handleNavigation = (href: string) => {
    router.push(href);
    onClose();
  };

  const isActive = (href: string) => {
    // Exact match for dashboard
    if (href === '/admin') {
      return pathname === '/admin';
    }
    
    // For other routes, check if pathname starts with the href
    return pathname === href || pathname.startsWith(href + '/');
  };

  return (
    <>
      {/* Sidebar */}
      <aside
        className={cn(
          'fixed top-0 left-0 z-50 h-screen w-64 bg-white border-r border-gray-200 transition-transform duration-300 ease-in-out',
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        {/* Logo & Close Button */}
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <Image src="/daylight.png" alt="DayLight Logo" width={32} height={32} className="rounded-lg" />
            <div>
              <h1 className="font-headline text-lg font-bold text-gray-900">DayLight</h1>
              <p className="text-xs text-gray-500">Admin Panel</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden p-1 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const itemIsActive = isActive(item.href);

            return (
              <button
                key={item.href}
                onClick={() => handleNavigation(item.href)}
                className={cn(
                  'w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200',
                  itemIsActive
                    ? 'bg-brand text-white shadow-sm'
                    : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                )}
              >
                <Icon className="w-5 h-5" />
                <span>{item.title}</span>
              </button>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200">
          <div className="px-4 py-3 bg-brand/5 rounded-lg">
            <p className="text-xs font-medium text-gray-900">Admin Access</p>
            <p className="text-xs text-gray-600 mt-1">
              You have full system privileges
            </p>
          </div>
        </div>
      </aside>
    </>
  );
}