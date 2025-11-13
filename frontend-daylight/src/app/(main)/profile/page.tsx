'use client';

import { useAuth } from '@/hooks/use-auth';
import { DashboardLayout } from '@/components/main/dashboard-layout';

export default function ProfilePage() {
  const { user } = useAuth();

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-2xl md:text-3xl font-bold">Profile</h1>
        <p className="text-muted-foreground">Manage your profile settings</p>
        {/* Profile form will go here */}
      </div>
    </DashboardLayout>
  );
}