'use client';

import { useAuth } from '@/hooks/use-auth';
import { DashboardLayout } from '@/components/main/dashboard-layout';

export default function MyEventsPage() {
  useAuth();

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-2xl md:text-3xl font-bold">My Events</h1>
        <p className="text-muted-foreground">Manage your registered events</p>
        {/* My events list will go here */}
      </div>
    </DashboardLayout>
  );
}