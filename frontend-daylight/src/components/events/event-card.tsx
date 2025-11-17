'use client';

import Link from 'next/link';
import { Calendar, MapPin } from 'lucide-react';
import { Event } from '@/types/event.types';
import { format } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';
import {
  UtensilsCrossed,
  Bus,
  HeartHandshake,
  Cloud,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface EventCardProps {
  event: Event;
}

const categoryConfig = {
  DAYBREAK: {
    color: 'bg-orange-50 text-orange-600 border-orange-200',
    icon: UtensilsCrossed,
  },
  DAYTRIP: {
    color: 'bg-blue-50 text-blue-600 border-blue-200',
    icon: Bus,
  },
  DAYCARE: {
    color: 'bg-green-50 text-green-600 border-green-200',
    icon: HeartHandshake,
  },
  DAYDREAM: {
    color: 'bg-purple-50 text-purple-600 border-purple-200',
    icon: Cloud,
  },
};

export function EventCard({ event }: EventCardProps) {
  const formatDate = (date: string) => {
    return format(new Date(date), 'EEE, dd MMM', { locale: idLocale });
  };

  const formatTime = (time: string) => {
    return format(new Date(time), 'HH:mm', { locale: idLocale });
  };

  const spotsLeft = event.maxParticipants - event.currentParticipants;
  const isFull = spotsLeft <= 0;

  const categoryInfo = categoryConfig[event.category];
  const CategoryIcon = categoryInfo.icon;

  return (
    <Link href={`/events/${event.slug}`} className="block">
      <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-5 hover:border-brand hover:shadow-md transition-all duration-200 cursor-pointer group h-full">
        <div className="space-y-3">
          {/* Title */}
          <div>
            <h3 className="font-semibold text-base sm:text-lg text-gray-900 mb-2 line-clamp-2 group-hover:text-brand transition-colors leading-snug">
              {event.title}
            </h3>
          </div>

          {/* Category & Status */}
          <div className="flex items-center gap-2 flex-wrap">
            <Badge
              variant="outline"
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium ${categoryInfo.color}`}
            >
              <CategoryIcon className="w-3 h-3" />
              {event.category}
            </Badge>
            
            {isFull && (
              <Badge 
                variant="outline"
                className="bg-red-50 text-red-600 border-red-200"
              >
                Full
              </Badge>
            )}
          </div>

          {/* Date, Time & Location */}
          <div className="space-y-2 text-sm text-gray-600">
            {/* Date & Time */}
            <div className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-gray-400 shrink-0" />
              <span className="truncate">
                {formatDate(event.eventDate)} • {formatTime(event.startTime)}
              </span>
            </div>

            {/* Location */}
            <div className="flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-gray-400 shrink-0" />
              <span className="truncate">{event.city}</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}