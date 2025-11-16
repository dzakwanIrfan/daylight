'use client';

import Link from 'next/link';
import { Calendar, MapPin, CheckCircle2 } from 'lucide-react';
import { MyEvent } from '@/types/my-events.types';
import { format } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';
import { formatCurrency } from '@/lib/utils';

interface MyEventCardProps {
  event: MyEvent;
  isPast?: boolean;
}

export function MyEventCard({ event, isPast = false }: MyEventCardProps) {
  const formatDate = (date: string) => {
    return format(new Date(date), 'EEE, dd MMM yyyy', { locale: idLocale });
  };

  const formatTime = (time: string) => {
    return format(new Date(time), 'HH:mm', { locale: idLocale });
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 hover:border-brand hover:shadow-md transition-all">
      <div className="flex items-start justify-between gap-4 mb-4">
        {/* Event Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start gap-3 mb-2">
            <h3 className="font-semibold text-lg text-gray-900 line-clamp-1 flex-1">
              {event.title}
            </h3>
            {!isPast && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-green-50 text-green-700 text-xs font-medium rounded-full border border-green-200 shrink-0">
                <CheckCircle2 className="w-3 h-3" />
                Confirmed
              </span>
            )}
          </div>

          <div className="flex flex-col gap-2 text-sm text-gray-600">
            {/* Date & Time */}
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gray-400" />
              <span>
                {formatDate(event.eventDate)} • {formatTime(event.startTime)}
              </span>
            </div>

            {/* Location */}
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-gray-400" />
              <span className="truncate">
                {event.venue}, {event.city}
              </span>
            </div>
          </div>
        </div>

        {/* Category Badge */}
        <span className="inline-block px-3 py-1 bg-brand/10 text-brand text-xs font-medium rounded-full shrink-0">
          {event.category}
        </span>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
        <div className="text-sm text-gray-600">
          <span className="font-medium">Paid: </span>
          <span className="text-brand font-semibold">
            {formatCurrency(event.transaction.amount, event.currency)}
          </span>
        </div>

        <Link
          href={`/events/${event.slug}`}
          className="text-sm font-medium text-brand hover:text-brand/80 transition-colors"
        >
          View Details →
        </Link>
      </div>
    </div>
  );
}