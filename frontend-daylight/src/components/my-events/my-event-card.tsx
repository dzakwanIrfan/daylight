'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Calendar, MapPin, CheckCircle2, Users, ChevronDown, ChevronUp } from 'lucide-react';
import { MyEvent } from '@/types/my-events.types';
import { format } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';
import { cn, formatCurrency } from '@/lib/utils';
import { useMyMatchingGroup } from '@/hooks/use-my-events';
import { MatchingGroupCard } from './matching-group-card';
import { FaCircleCheck } from 'react-icons/fa6';

interface MyEventCardProps {
  event: MyEvent;
  isPast?: boolean;
}

export function MyEventCard({ event, isPast = false }: MyEventCardProps) {
  const [showGroup, setShowGroup] = useState(false);

  // Fetch matching group (only if not past event)
  const { data: matchingGroup, isLoading: isLoadingGroup } = useMyMatchingGroup(
    event.id,
    !isPast // Only fetch for upcoming events
  );

  const formatDate = (date: string) => {
    return format(new Date(date), 'EEE, dd MMM yyyy', { locale: idLocale });
  };

  const formatTime = (time: string) => {
    return format(new Date(time), 'HH:mm', { locale: idLocale });
  };

  const hasMatchingGroup = matchingGroup && matchingGroup.groupSize > 0;

  return (
    <div className="bg-white rounded-xl border border-gray-200 hover:border-brand/30 hover:shadow-md transition-all">
      <div className="p-5 space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
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
                <div className="flex items-center gap-1">
                  <span className="truncate">
                    {event.venue}, {event.city}
                  </span>
                  {event.partner?.isPreferred && (
                    <FaCircleCheck className={cn("size-3",
                      event.partner?.type === 'BRAND' ? "text-green-600"
                      : "text-amber-400"
                    )} />
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Category Badge */}
          <span className="inline-block px-3 py-1 bg-brand/10 text-brand text-xs font-medium rounded-full shrink-0">
            {event.category}
          </span>
        </div>

        {/* Matching Group Preview */}
        {!isPast && hasMatchingGroup && (
          <div className="pt-3 border-t border-gray-200">
            <button
              onClick={() => setShowGroup(!showGroup)}
              className="w-full flex items-center justify-between p-3 rounded-lg bg-linear-to-br from-brand/5 to-transparent border border-brand/20 hover:bg-brand/10 transition-colors"
            >
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-brand" />
                <div className="text-left">
                  <p className="text-sm font-semibold text-gray-900">
                    Your Table Group
                  </p>
                  <p className="text-xs text-gray-600">
                    Table {matchingGroup.groupNumber} • {matchingGroup.groupSize} members
                  </p>
                </div>
              </div>
              {showGroup ? (
                <ChevronUp className="w-4 h-4 text-brand" />
              ) : (
                <ChevronDown className="w-4 h-4 text-brand" />
              )}
            </button>

            {showGroup && (
              <div className="mt-3">
                <MatchingGroupCard group={matchingGroup} compact />
              </div>
            )}
          </div>
        )}

        {/* Loading state for matching group */}
        {!isPast && isLoadingGroup && (
          <div className="pt-3 border-t border-gray-200">
            <div className="p-3 rounded-lg bg-gray-50 animate-pulse">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-gray-200" />
                <div className="h-4 bg-gray-200 rounded w-32" />
              </div>
            </div>
          </div>
        )}

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
    </div>
  );
}