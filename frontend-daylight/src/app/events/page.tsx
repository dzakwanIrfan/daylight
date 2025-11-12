'use client';

import { useAuth } from '@/hooks/use-auth';
import { DashboardLayout } from '@/components/dashboard/dashboard-layout';

export default function EventsPage() {
  useAuth();

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Events</h1>
        <p className="text-muted-foreground">Find and join events near you</p>
        {/* Event list will go here */}
      </div>
    </DashboardLayout>
  );
}