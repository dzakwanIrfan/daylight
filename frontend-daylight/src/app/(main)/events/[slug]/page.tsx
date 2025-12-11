'use client';

import { useState } from 'react';
import { DashboardLayout } from '@/components/main/dashboard-layout';
import { usePublicEvent, useEventPurchaseStatus } from '@/hooks/use-public-events';
import { useAuth } from '@/hooks/use-auth';
import { useParams, useRouter } from 'next/navigation';
import {
  Loader2,
  Calendar,
  Clock,
  MapPin,
  ArrowLeft,
  ExternalLink,
  Check,
  AlertCircle,
  CheckCircle2,
  Crown,
  Gift,
  Building2,
} from 'lucide-react';
import { FaCircleCheck } from "react-icons/fa6";
import { format } from 'date-fns';
import { TransactionStatus } from '@/types/event.types';
import { toast } from 'sonner';
import { SubscriptionUpsellModal } from '@/components/subscriptions/subscription-upsell-modal';
import Image from 'next/image';
import Link from 'next/link';
import { PartnerType } from '@/types/partner.types';
import { cn } from '@/lib/utils';

export default function EventDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const slug = params.slug as string;
  
  const { data: event, isLoading, error } = usePublicEvent(slug);

  // Tambahkan error handling
  if (error) {
    const apiError = error as any;
    if (apiError?.response?.status === 403) {
      return (
        <DashboardLayout>
          <div className="space-y-6 max-w-4xl mx-auto py-4 px-4 sm:px-6">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 text-gray-600 hover:text-brand transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm font-medium">Back</span>
            </button>

            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-8 text-center">
              <div className="w-16 h-16 rounded-full bg-yellow-100 flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-8 h-8 text-yellow-600" />
              </div>
              <h3 className="text-xl font-bold mb-2 text-gray-900">
                Event No Longer Available
              </h3>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                This event is no longer available for viewing. Registration closes 24 hours before the event starts.
              </p>
              <button
                onClick={() => router.push('/events')}
                className="inline-flex items-center gap-2 px-6 py-3 bg-brand text-white rounded-lg font-semibold hover:bg-brand/90 transition-colors"
              >
                Browse Other Events
              </button>
            </div>
          </div>
        </DashboardLayout>
      );
    }
  }
  const { 
    data: purchaseStatus, 
    isLoading: isPurchaseStatusLoading 
  } = useEventPurchaseStatus(slug);

  // State for Subscription Upsell Modal
  const [showUpsellModal, setShowUpsellModal] = useState(false);

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
    return format(new Date(date), 'EEEE, dd MMMM yyyy');
  };

  const formatTime = (time: string) => {
    return format(new Date(time), 'hh:mm a');
  };

  // Purchase Status
  const hasPurchased = purchaseStatus?.hasPurchased ?? false;
  const canPurchase = purchaseStatus?.canPurchase ?? true;
  const purchaseStatusValue = purchaseStatus?.status;
  const subscriptionAccess = purchaseStatus?.subscriptionAccess ?? false;

  // Determine button state
  const isButtonDisabled = (hasPurchased && !canPurchase && !subscriptionAccess);

  const getButtonText = () => {
    if (isPurchaseStatusLoading) return 'Checking...';
    
    if (hasPurchased) {
      if (purchaseStatusValue === TransactionStatus.PAID) {
        return 'Already Registered';
      }
      if (purchaseStatusValue === TransactionStatus.PENDING) {
        return 'Payment Pending';
      }
      if (canPurchase) {
        return 'Try Again';
      }
    }

    // If has subscription access
    if (subscriptionAccess) {
      return 'Register for Free';
    }
    
    return 'Join Event';
  };

  const handleJoinEvent = () => {
    // If not logged in, redirect to login
    if (!user) {
      toast.error('Please login to join this event');
      router.push(`/auth/login?redirect=/events/${event.slug}`);
      return;
    }

    // If has subscription access - REGISTER FREE
    if (subscriptionAccess) {
      router.push(`/events/${event.slug}/register-free`);
      return;
    }

    // If already purchased and can't purchase again
    if (hasPurchased && !canPurchase) {
      if (purchaseStatusValue === TransactionStatus.PAID) {
        toast.info('You have already joined this event');
        router.push('/my-events');
      } else if (purchaseStatusValue === TransactionStatus.PENDING) {
        toast.info('Your payment is still pending. Please check your transactions.');
        router.push('/my-events?tab=transactions');
      }
      return;
    }

    // SHOW UPSELL MODAL FOR NON-SUBSCRIBERS
    if (!subscriptionAccess && event.price > 0) {
      setShowUpsellModal(true);
      return;
    }

    // For free events, proceed directly
    router.push(`/events/${event.slug}/payment`);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-4xl mx-auto py-4 px-4 sm:px-6">
        {/* Subscription Upsell Modal */}
        <SubscriptionUpsellModal
          isOpen={showUpsellModal}
          onClose={() => setShowUpsellModal(false)}
          eventPrice={event.price}
          eventTitle={event.title}
          eventSlug={event.slug}
          currency={event.currency}
        />

        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-600 hover:text-brand transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm font-medium">Back</span>
        </button>

        {!subscriptionAccess && hasPurchased && purchaseStatusValue === TransactionStatus.PENDING && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-yellow-600 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-semibold text-yellow-900 mb-1 text-sm">
                  Payment Pending
                </p>
                <p className="text-sm text-yellow-700">
                  Your payment is being processed. Check{' '}
                  <button
                    onClick={() => router.push('/my-events?tab=transactions')}
                    className="underline hover:text-yellow-900 font-medium"
                  >
                    transaction status
                  </button>
                </p>
              </div>
            </div>
          </div>
        )}

        {!subscriptionAccess && hasPurchased && canPurchase && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-semibold text-blue-900 mb-1 text-sm">
                  Previous Payment {purchaseStatusValue}
                </p>
                <p className="text-sm text-blue-700">
                  You can try purchasing this event again.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Hero Section - CLEAN */}
        <div className="bg-brand rounded-lg p-5 md:p-6 text-white space-y-4">
          <div className="space-y-3">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold leading-tight">
              {event.title}
            </h1>
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-block px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs sm:text-sm font-medium">
                {event.category}
              </span>
              {subscriptionAccess && !hasPurchased && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-white/90 text-brand rounded-full text-xs font-semibold">
                  <Crown className="w-3 h-3" />
                  FREE ACCESS
                </span>
              )}
            </div>
          </div>

          <div className="pt-2 border-t border-white/20">
            <div className="flex items-baseline gap-2">
              {subscriptionAccess && !hasPurchased ? (
                <>
                  <span className="text-lg sm:text-xl text-white/60 line-through">
                    {event.currency === 'IDR' ? 'Rp ' : '$'}
                    {new Intl.NumberFormat('id-ID').format(event.price)}
                  </span>
                  <span className="text-2xl sm:text-3xl font-bold text-white">
                    FREE
                  </span>
                </>
              ) : (
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
              )}
              {!subscriptionAccess && <span className="text-sm text-white/80">per person</span>}
            </div>
            {subscriptionAccess && !hasPurchased && (
              <p className="text-xs text-white/70 mt-1">
                Included in your premium subscription
              </p>
            )}
          </div>

          {event.shortDescription && (
            <p className="text-white/90 text-sm sm:text-base leading-relaxed pt-2">
              {event.shortDescription}
            </p>
          )}
        </div>

        {/* Quick Info Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-orange-50 flex items-center justify-center shrink-0">
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

          {/* Partner Info Card (if partner exists) */}
          {event.partner ? (
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex items-start gap-3">
                {event.partner.logo && (
                  <div className="relative w-14 h-14 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                    <Image
                      src={event.partner.logo}
                      alt={event.partner.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Building2 className="w-4 h-4 text-brand shrink-0" />
                    <p className="text-xs sm:text-sm text-gray-600">Event Partner</p>
                    {event.partner.isPreferred && (
                      <FaCircleCheck className={cn("w-3 h-3",
                        event.partner.type === PartnerType.BRAND ? "text-amber-400" : "text-green-600"
                      )} />
                    )}
                  </div>
                  <p className="font-semibold text-sm sm:text-base text-gray-900 leading-snug">
                    {event.partner.name}
                  </p>
                  {event.partner.shortDescription && (
                    <p className="text-xs sm:text-sm text-gray-600 truncate">
                      {event.partner.city}
                    </p>
                  )}
                  <Link
                    href={`/partners/${event.partner.slug}`}
                    className="text-brand text-xs sm:text-sm hover:underline inline-flex items-center gap-1 mt-1"
                  >
                    View Partner Profile
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            </div>
          ) : 
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-orange-50 flex items-center justify-center shrink-0">
                  <MapPin className="w-5 h-5 text-brand" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm text-gray-600 mb-1">Location</p>
                  <p className="font-semibold text-sm sm:text-base text-gray-900 leading-snug">
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
          }
        </div>

        {/* Description */}
        <div className="bg-white rounded-lg border border-gray-200 p-5 sm:p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">About This Event</h2>
          <p className="text-gray-700 text-sm sm:text-base whitespace-pre-line leading-relaxed">
            {event.description}
          </p>
        </div>

        {/* Highlights */}
        {event.highlights && event.highlights.length > 0 && (
          <div className="bg-white rounded-lg border border-gray-200 p-5 sm:p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Event Highlights</h2>
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
          <div className="bg-white rounded-lg border border-gray-200 p-5 sm:p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">What to Bring</h2>
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
          <div className="bg-white rounded-lg border border-gray-200 p-5 sm:p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Organizer</h2>
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

        {/* CTA Button */}
        <div className="sticky bottom-4 sm:bottom-6 z-10">
          <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-lg">
            <button
              onClick={handleJoinEvent}
              disabled={isButtonDisabled || isPurchaseStatusLoading || hasPurchased}
              className={`w-full px-6 py-3.5 sm:py-4 rounded-lg font-semibold text-base sm:text-lg transition-all flex items-center justify-center gap-2 ${
                isButtonDisabled || isPurchaseStatusLoading || hasPurchased
                  ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                  : subscriptionAccess && !hasPurchased
                  ? 'bg-brand text-white hover:bg-brand/90 hover:shadow-md active:scale-[0.98]'
                  : 'bg-brand text-white hover:bg-brand/90 hover:shadow-md active:scale-[0.98]'
              }`}
            >
              {subscriptionAccess && !isPurchaseStatusLoading && (
                <Gift className="w-5 h-5" />
              )}
              {getButtonText()}
            </button>
            
            {/* Helper text */}
            {subscriptionAccess && !hasPurchased && (
              <p className="text-xs text-center text-gray-600 mt-2">
                Premium members can join for free
              </p>
            )}
            {hasPurchased && purchaseStatusValue === TransactionStatus.PAID && (
              <p className="text-xs text-center text-gray-600 mt-2">
                View your ticket in <Link href="/my-events" className="text-brand">My Events</Link>
              </p>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}