'use client';

import { useState } from 'react';
import { DashboardLayout } from '@/components/main/dashboard-layout';
import { useAuth } from '@/hooks/use-auth';
import { usePublicEvent, useEventPurchaseStatus } from '@/hooks/use-public-events';
import { useParams, useRouter } from 'next/navigation';
import {
  Loader2,
  ArrowLeft,
  Crown,
  Check,
  AlertCircle,
  Calendar,
  MapPin,
  User,
  Mail,
  Phone,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { format } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';
import { toast } from 'sonner';
import apiClient from '@/lib/axios';
import { ApiError, getUserFriendlyErrorMessage } from '@/lib/api-error';

export default function FreeEventRegistrationPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const slug = params.slug as string;

  const { data: event, isLoading: isLoadingEvent } = usePublicEvent(slug);
  const { 
    data: purchaseStatus, 
    isLoading: isLoadingStatus 
  } = useEventPurchaseStatus(slug);

  const [customerName, setCustomerName] = useState(
    user ? `${user.firstName} ${user.lastName}` : ''
  );
  const [customerPhone, setCustomerPhone] = useState(user?.phoneNumber || '');
  const [isRegistering, setIsRegistering] = useState(false);

  const isLoading = isLoadingEvent || isLoadingStatus;
  const subscriptionAccess = purchaseStatus?.subscriptionAccess ?? false;

  // Redirect if no subscription access
  if (!isLoading && !subscriptionAccess) {
    router.push(`/events/${slug}`);
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!event || !user) {
      toast.error('Please complete all required fields');
      return;
    }

    if (!customerName.trim()) {
      toast.error('Please enter your name');
      return;
    }

    setIsRegistering(true);

    try {
      const response = await apiClient.post('/user-events/register-free', {
        eventId: event.id,
        customerName: customerName.trim(),
        customerEmail: user.email,
        customerPhone: customerPhone.trim() || undefined,
      });

      if (response.data.success) {
        toast.success('Successfully registered for this event!');
        router.push('/my-events');
      }
    } catch (error: any) {
      console.error('Registration error:', error);
      if (error instanceof ApiError) {
        const friendlyMessage = getUserFriendlyErrorMessage(error);
        toast.error(friendlyMessage);
      } else {
        toast.error('Failed to register. Please try again.');
      }
    } finally {
      setIsRegistering(false);
    }
  };

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
          <button
            onClick={() => router.push('/events')}
            className="text-brand hover:underline"
          >
            Back to Events
          </button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-4xl mx-auto py-4 px-4 sm:px-6">
        {/* Back Button */}
        <button
          onClick={() => router.push(`/events/${slug}`)}
          className="inline-flex items-center gap-2 text-gray-600 hover:text-brand transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm font-medium">Back to Event</span>
        </button>

        {/* Header - Clean & Subtle */}
        <div className="bg-white border border-orange-200 rounded-lg p-5">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-lg bg-orange-50 flex items-center justify-center shrink-0">
              <Crown className="w-6 h-6 text-brand" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <h1 className="text-xl font-bold text-gray-900">
                  Free Registration
                </h1>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-50 text-green-700 border border-green-200 rounded text-xs font-semibold">
                  <Check className="w-3 h-3" />
                  FREE
                </span>
              </div>
              <p className="text-sm text-gray-600 leading-relaxed">
                As a premium member, you can register for this event at no cost
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Event Summary */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h2 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-brand" />
                Event Details
              </h2>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-lg text-gray-900 mb-1">
                    {event.title}
                  </h3>
                  <span className="inline-block px-2.5 py-1 bg-orange-50 text-brand border border-orange-200 text-xs font-medium rounded-full">
                    {event.category}
                  </span>
                </div>

                <div className="flex items-start gap-2 text-sm text-gray-700">
                  <Calendar className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                  <span>
                    {format(new Date(event.eventDate), 'EEEE, dd MMMM yyyy', {
                      locale: idLocale,
                    })}
                  </span>
                </div>

                <div className="flex items-start gap-2 text-sm text-gray-700">
                  <MapPin className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                  <span>
                    {event.venue}, {event.city}
                  </span>
                </div>

                <div className="pt-4 border-t border-gray-200">
                  <div className="flex items-baseline gap-2">
                    <span className="text-lg text-gray-400 line-through">
                      {event.currency === 'IDR' ? 'Rp ' : '$'}
                      {new Intl.NumberFormat('id-ID').format(event.price)}
                    </span>
                    <span className="text-2xl font-bold text-green-600">
                      FREE
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    Included in your premium subscription
                  </p>
                </div>
              </div>
            </div>

            {/* Customer Information Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h2 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <User className="w-5 h-5 text-brand" />
                  Your Information
                </h2>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="customerName" className="text-sm font-medium text-gray-900">
                      Full Name <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="customerName"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="John Doe"
                      required
                      disabled={isRegistering}
                      className="w-full"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="customerEmail" className="text-sm font-medium text-gray-900">
                      Email Address
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        id="customerEmail"
                        type="email"
                        value={user?.email || ''}
                        disabled
                        className="w-full pl-10 bg-gray-50 text-gray-600"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="customerPhone" className="text-sm font-medium text-gray-900">
                      Phone Number <span className="text-gray-500 font-normal">(Optional)</span>
                    </Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        id="customerPhone"
                        type="tel"
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                        placeholder="+62 812 3456 7890"
                        disabled={isRegistering}
                        className="w-full pl-10"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={!customerName.trim() || isRegistering}
                className="w-full bg-brand hover:bg-brand/90 text-white rounded-lg px-6 py-3.5 font-semibold text-base transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-sm hover:shadow-md active:scale-[0.98]"
              >
                {isRegistering ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Registering...
                  </>
                ) : (
                  <>
                    <Check className="w-5 h-5" />
                    Complete Free Registration
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Right Column - Benefits */}
          <div className="space-y-6">
            {/* Premium Benefits */}
            <div className="bg-white border border-gray-200 rounded-lg p-5 sticky top-20">
              <h3 className="font-semibold text-gray-900 mb-4 text-sm flex items-center gap-2">
                <Crown className="w-4 h-4 text-brand" />
                Premium Benefits
              </h3>
              <div className="space-y-3">
                <div className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-700">
                    Free access to this event
                  </span>
                </div>
                <div className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-700">
                    No payment required
                  </span>
                </div>
                <div className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-700">
                    Instant confirmation
                  </span>
                </div>
                <div className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-700">
                    Access to unlimited events
                  </span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200">
                <button
                  onClick={() => router.push('/my-subscriptions')}
                  className="w-full text-sm text-brand hover:text-brand/80 font-medium inline-flex items-center justify-center gap-1.5 transition-colors"
                >
                  View Subscription
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}