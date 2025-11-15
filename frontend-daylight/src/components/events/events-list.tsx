'use client';

import { EventCard } from './event-card';
import { Event } from '@/types/event.types';
import { Loader2, Calendar } from 'lucide-react';

interface EventsListProps {
  events: Event[];
  isLoading?: boolean;
  emptyMessage?: string;
}

export function EventsList({
  events,
  isLoading,
  emptyMessage = 'No events found',
}: EventsListProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-brand" />
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
          <Calendar className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-semibold mb-2 text-gray-900">
          {emptyMessage}
        </h3>
        <p className="text-sm text-gray-600">
          Check back later for new events
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {events.map((event) => (
        <EventCard key={event.id} event={event} />
      ))}
    </div>
  );
}