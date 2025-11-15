'use client';

import { DashboardLayout } from '@/components/main/dashboard-layout';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { EventsList } from '@/components/events/events-list';
import { usePublicEvents } from '@/hooks/use-public-events';
import { EventCategory, EventStatus } from '@/types/event.types';

const categoryInfo = {
  DAYBREAK: {
    title: 'DayBreak Events',
    description: 'Start fresh. Meet new people over meals and conversations.',
    color: 'bg-linear-to-br from-brand/15 via-white to-brand/20 border border-brand/20',
  },
  DAYTRIP: {
    title: 'DayTrip Events',
    description: 'Go out. Connect through adventure and exploration.',
    color: 'bg-linear-to-br from-blue-500/15 via-white to-blue-500/20 border border-blue-500/20',
  },
  DAYCARE: {
    title: 'DayCare Events',
    description: 'A safe space to support each other and share experiences.',
    color: 'bg-linear-to-br from-green-500/15 via-white to-green-500/20 border border-green-500/20',
  },
  DAYDREAM: {
    title: 'DayDream Events',
    description: 'Share ideas. Inspire together through creativity.',
    color: 'bg-linear-to-br from-purple-500/15 via-white to-purple-500/20 border border-purple-500/20',
  },
};

export default function CategoryPage() {
  const params = useParams();
  const router = useRouter();
  const category = params.category as EventCategory;

  const { data, isLoading } = usePublicEvents({
    category,
    status: EventStatus.PUBLISHED,
    isActive: true,
    sortBy: 'eventDate',
    sortOrder: 'asc',
    limit: 50,
  });

  const info = categoryInfo[category];

  if (!info) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <h3 className="text-lg font-semibold mb-2">Invalid Category</h3>
          <button
            onClick={() => router.back()}
            className="text-brand hover:underline"
          >
            Go back
          </button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-600 hover:text-brand transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm font-medium">Back</span>
        </button>

        {/* Header */}
        <div
          className={`${info.color} rounded-xl p-6 space-y-2`}
        >
          <h1 className="text-2xl md:text-3xl font-bold">{info.title}</h1>
          <p>{info.description}</p>
        </div>

        {/* Events List */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Available Events</h2>
            {data && data.pagination.total > 0 && (
              <span className="text-sm text-muted-foreground">
                {data.pagination.total} events found
              </span>
            )}
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-brand" />
            </div>
          ) : (
            <EventsList
              events={data?.data || []}
              emptyMessage={`No ${category} events available at the moment`}
            />
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}