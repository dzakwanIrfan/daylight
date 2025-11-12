'use client';

import { useAuth } from '@/hooks/use-auth';
import { DashboardLayout } from '@/components/dashboard/dashboard-layout';

export default function ConnectionsPage() {
  useAuth();

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Connections</h1>
        <p className="text-muted-foreground">Manage your connections</p>
        {/* Connections list will go here */}
      </div>
    </DashboardLayout>
  );
}