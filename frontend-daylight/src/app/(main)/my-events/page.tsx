'use client';

import { useAuth } from '@/hooks/use-auth';
import { DashboardLayout } from '@/components/main/dashboard-layout';
import { Calendar, Heart } from 'lucide-react';

export default function MyEventsPage() {
  useAuth();

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-brand/10 flex items-center justify-center">
              <Calendar className="w-5 h-5 text-brand" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">My Events</h1>
              <p className="text-sm text-muted-foreground">
                Your next events at a glance
              </p>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-linear-to-br from-brand/5 via-white to-brand/10 rounded-lg border border-brand/20 p-6">
          <h2 className="text-lg font-semibold mb-4">My Next Events</h2>
          <div className="text-center py-12">
            <div className="w-16 h-16 rounded-full bg-brand/10 flex items-center justify-center mx-auto mb-4">
              <Heart className="w-8 h-8 text-brand" />
            </div>
            <h3 className="text-xl md:text-2xl font-bold mb-2">No Events Yet</h3>
            <p className="text-muted-foreground text-sm md:text-base max-w-xl mx-auto">
              Start connecting with people and attending events to see your activity here!
            </p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}