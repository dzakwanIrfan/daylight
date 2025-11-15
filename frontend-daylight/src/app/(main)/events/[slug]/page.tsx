'use client';

import { DashboardLayout } from '@/components/main/dashboard-layout';
import { usePublicEvent } from '@/hooks/use-public-events';
import { useParams, useRouter } from 'next/navigation';
import {
  Loader2,
  Calendar,
  Clock,
  MapPin,
  Users,
  ArrowLeft,
  ExternalLink,
  Check,
} from 'lucide-react';
import { format } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';

export default function EventDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  const { data: event, isLoading } = usePublicEvent(slug);

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-brand" />
        </div>
      </DashboardLayout>
    );
  }

  if (!event) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <h3 className="text-lg font-semibold mb-2">Event not found</h3>
          <p className="text-sm text-gray-600 mb-4">
            The event you're looking for doesn't exist
          </p>
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

  const formatDate = (date: string) => {
    return format(new Date(date), 'EEEE, dd MMMM yyyy', { locale: idLocale });
  };

  const formatTime = (time: string) => {
    return format(new Date(time), 'HH:mm', { locale: idLocale });
  };

  const spotsLeft = event.maxParticipants - event.currentParticipants;
  const isFull = spotsLeft <= 0;
  const isAlmostFull = spotsLeft <= 5 && spotsLeft > 0;

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-3xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-600 hover:text-brand transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm font-medium">Back</span>
        </button>

        {/* Hero Section - RESPONSIVE */}
        <div className={`bg-brand rounded-xl p-5 md:p-6 text-white space-y-4`}>
          {/* Title & Category */}
          <div className="space-y-3">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold leading-tight">
              {event.title}
            </h1>
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-block px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs sm:text-sm font-medium">
                {event.category}
              </span>
              {isFull && (
                <span className="inline-block px-3 py-1 bg-red-500 rounded-full text-xs sm:text-sm font-medium">
                  Event Full
                </span>
              )}
              {isAlmostFull && (
                <span className="inline-block px-3 py-1 bg-yellow-500 rounded-full text-xs sm:text-sm font-medium">
                  Only {spotsLeft} spots left!
                </span>
              )}
            </div>
          </div>

          {/* Price - Moved below title on mobile */}
          <div className="pt-2 border-t border-white/20">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-bold">
                {event.price === 0 ? (
                  'Free'
                ) : (
                  <>
                    {event.currency === 'IDR' ? 'Rp ' : '$'}
                    {new Intl.NumberFormat('id-ID').format(event.price)}
                  </>
                )}
              </span>
              <span className="text-sm text-white/80">per person</span>
            </div>
          </div>

          {/* Short Description */}
          {event.shortDescription && (
            <p className="text-white/90 text-sm sm:text-base leading-relaxed pt-2">
              {event.shortDescription}
            </p>
          )}
        </div>

        {/* Quick Info Cards - Stacked on Mobile */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          {/* Date & Time */}
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-brand/10 flex items-center justify-center shrink-0">
                <Calendar className="w-5 h-5 text-brand" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs sm:text-sm text-gray-600 mb-1">Date & Time</p>
                <p className="font-semibold text-sm sm:text-base text-gray-900 leading-snug">
                  {formatDate(event.eventDate)}
                </p>
                <div className="flex items-center gap-1 mt-1">
                  <Clock className="w-3.5 h-3.5 text-gray-400" />
                  <p className="text-xs sm:text-sm text-gray-600">
                    {formatTime(event.startTime)} - {formatTime(event.endTime)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Location */}
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-brand/10 flex items-center justify-center shrink-0">
                <MapPin className="w-5 h-5 text-brand" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs sm:text-sm text-gray-600 mb-1">Location</p>
                <p className="font-semibold text-sm sm:text-base text-gray-900 line-clamp-1">
                  {event.venue}
                </p>
                <p className="text-xs sm:text-sm text-gray-600 truncate">
                  {event.city}
                </p>
                {event.googleMapsUrl && (
                  <a
                    href={event.googleMapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-brand text-xs sm:text-sm hover:underline inline-flex items-center gap-1 mt-1"
                  >
                    Open Maps
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Participants Progress */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4 mb-3">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-brand" />
              <span className="font-semibold text-base sm:text-lg">
                {event.currentParticipants} / {event.maxParticipants}
              </span>
              <span className="text-sm text-gray-600">participants</span>
            </div>
            <span className="text-sm text-gray-600">
              {spotsLeft > 0 ? `${spotsLeft} spots left` : 'Full'}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5 sm:h-3">
            <div
              className="bg-brand h-2.5 sm:h-3 rounded-full transition-all"
              style={{
                width: `${
                  (event.currentParticipants / event.maxParticipants) * 100
                }%`,
              }}
            />
          </div>
        </div>

        {/* Description */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 sm:p-6">
          <h2 className="text-lg font-semibold mb-3">About This Event</h2>
          <p className="text-gray-700 text-sm sm:text-base whitespace-pre-line leading-relaxed">
            {event.description}
          </p>
        </div>

        {/* Highlights */}
        {event.highlights && event.highlights.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-200 p-5 sm:p-6">
            <h2 className="text-lg font-semibold mb-3">Event Highlights</h2>
            <ul className="space-y-2.5">
              {event.highlights.map((highlight, index) => (
                <li key={index} className="flex items-start gap-3">
                  <Check className="w-4 h-4 sm:w-5 sm:h-5 text-brand shrink-0 mt-0.5" />
                  <span className="text-gray-700 text-sm sm:text-base">{highlight}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Requirements */}
        {event.requirements && event.requirements.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-200 p-5 sm:p-6">
            <h2 className="text-lg font-semibold mb-3">What to Bring</h2>
            <ul className="space-y-2.5">
              {event.requirements.map((requirement, index) => (
                <li key={index} className="flex items-start gap-3">
                  <Check className="w-4 h-4 sm:w-5 sm:h-5 text-brand shrink-0 mt-0.5" />
                  <span className="text-gray-700 text-sm sm:text-base">{requirement}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Organizer */}
        {event.organizerName && (
          <div className="bg-white rounded-xl border border-gray-200 p-5 sm:p-6">
            <h2 className="text-lg font-semibold mb-3">Organizer</h2>
            <div>
              <p className="font-medium text-base sm:text-lg text-gray-900">
                {event.organizerName}
              </p>
              {event.organizerContact && (
                <p className="text-sm text-gray-600 mt-1">
                  {event.organizerContact}
                </p>
              )}
            </div>
          </div>
        )}

        {/* CTA Button - Fixed at bottom on mobile */}
        <div className="sticky bottom-16 sm:bottom-6 bg-white rounded-xl border border-gray-200 p-4 shadow-lg">
          <button
            disabled={isFull}
            className={`w-full px-6 py-3.5 sm:py-4 rounded-xl font-semibold text-base sm:text-lg transition-all ${
              isFull
                ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                : 'bg-brand text-white hover:bg-brand/90 hover:shadow-xl active:scale-[0.98]'
            }`}
          >
            {isFull ? 'Event Full' : 'Join Event'}
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
}