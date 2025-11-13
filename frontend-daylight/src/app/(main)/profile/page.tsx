'use client';

import { useAuth } from '@/hooks/use-auth';
import { DashboardLayout } from '@/components/main/dashboard-layout';
import { ProfileHeader } from '@/components/profile/profile-header';
import { ProfileSettings } from '@/components/profile/profile-settings';
import { Loader2 } from 'lucide-react';

export default function ProfilePage() {
  const { isLoading } = useAuth();

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-brand" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <ProfileHeader />
        <ProfileSettings />
      </div>
    </DashboardLayout>
  );
}