// src/components/admin/admin-layout.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth-store';
import { AdminSidebar } from './admin-sidebar';
import { AdminHeader } from './admin-header';
import { PageLoader } from '@/components/ui/page-loader';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const router = useRouter();
  const { user, isAuthenticated, isHydrated } = useAuthStore();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // Wait for store to hydrate
    if (!isHydrated) {
      return;
    }

    const checkAccess = () => {
      const authenticated = isAuthenticated();
      
      // Not authenticated at all
      if (!authenticated || !user) {
        router.replace('/auth/login');
        return;
      }

      // Not admin
      if (user.role !== 'ADMIN') {
        router.replace('/');
        return;
      }

      // All good
      setIsChecking(false);
    };

    // Small delay to ensure everything is ready
    const timer = setTimeout(checkAccess, 50);
    return () => clearTimeout(timer);
  }, [isHydrated, user?.id, user?.role, isAuthenticated, router]);

  // Show loader while checking
  if (!isHydrated || isChecking) {
    return <PageLoader />;
  }

  // Double check before rendering
  if (!user || user.role !== 'ADMIN') {
    return <PageLoader />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <AdminSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      <div className="lg:pl-64">
        <AdminHeader onMenuClick={() => setIsSidebarOpen(true)} />
        <main className="p-4 md:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}