'use client';

import { DashboardLayout } from '@/components/main/dashboard-layout';
import { useParams, useRouter } from 'next/navigation';
import { usePublicEvent } from '@/hooks/use-public-events';
import {
  usePaymentChannels,
  useCalculateFee,
  useCreatePayment,
} from '@/hooks/use-payment';
import { useState } from 'react';
import { useAuthStore } from '@/store/auth-store';
import {
  Loader2,
  ArrowLeft,
  Calendar,
  MapPin,
  User,
  Mail,
  Phone,
  AlertCircle,
} from 'lucide-react';
import { PaymentMethodSelector } from '@/components/payment/payment-method-selector';
import { FeeBreakdown } from '@/components/payment/fee-breakdown';
import { PaymentMethod } from '@/types/payment.types';
import { format } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';
import { toast } from 'sonner';

export default function CreatePaymentPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  const { user } = useAuthStore();

  const { data: event, isLoading: isLoadingEvent } = usePublicEvent(slug);
  const { 
    data: channelsData, 
    isLoading: isLoadingChannels,
    error: channelsError 
  } = usePaymentChannels();
  const createPaymentMutation = useCreatePayment();

  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(
    null
  );
  const [customerName, setCustomerName] = useState(
    user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() : ''
  );
  const [customerEmail, setCustomerEmail] = useState(user?.email || '');
  const [customerPhone, setCustomerPhone] = useState(user?.phoneNumber || '');

  const { data: feeData, isLoading: isCalculatingFee } = useCalculateFee(
    event?.price || 0,
    selectedMethod?.code
  );

  const isLoading = isLoadingEvent || isLoadingChannels;

  // Debug log
  console.log('Channels Data:', channelsData);

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
            onClick={() => router.back()}
            className="text-brand hover:underline"
          >
            Go back
          </button>
        </div>
      </DashboardLayout>
    );
  }

  const handlePayment = async () => {
    if (!selectedMethod) {
      toast.error('Please select a payment method');
      return;
    }

    if (!customerName || !customerEmail) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      const result = await createPaymentMutation.mutateAsync({
        eventId: event.id,
        paymentMethod: selectedMethod.code,
        customerName,
        customerEmail,
        customerPhone: customerPhone || undefined,
        quantity: 1,
      });

      toast.success('Payment created successfully!');
      router.push(`/payment/${result.data.id}`);
    } catch (error: any) {
      console.error('Payment creation error:', error);
      toast.error(error?.message || 'Failed to create payment');
    }
  };

  const spotsLeft = event.maxParticipants - event.currentParticipants;
  const isFull = spotsLeft <= 0;

  // Check if we have valid channels data
  const hasValidChannels = channelsData?.success && 
    channelsData.flat && 
    Array.isArray(channelsData.flat) && 
    channelsData.flat.length > 0;

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-4xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-600 hover:text-brand transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm font-medium">Back to Event</span>
        </button>

        {/* Header */}
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h1 className="text-2xl md:text-3xl font-bold mb-2">
            Complete Your Payment
          </h1>
          <p className="text-muted-foreground">
            You're one step away from joining this event!
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Event Summary */}
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <h2 className="text-lg font-semibold mb-4">Event Details</h2>
              <div className="space-y-3">
                <div>
                  <h3 className="font-semibold text-xl">{event.title}</h3>
                  <span className="inline-block mt-2 px-3 py-1 bg-brand/10 text-brand text-xs font-medium rounded-full">
                    {event.category}
                  </span>
                </div>

                <div className="flex items-start gap-2 text-sm">
                  <Calendar className="w-4 h-4 text-gray-400 mt-0.5" />
                  <span>
                    {format(new Date(event.eventDate), 'EEEE, dd MMMM yyyy', {
                      locale: idLocale,
                    })}
                  </span>
                </div>

                <div className="flex items-start gap-2 text-sm">
                  <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
                  <span>
                    {event.venue}, {event.city}
                  </span>
                </div>
              </div>
            </div>

            {/* Customer Information */}
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <h2 className="text-lg font-semibold mb-4">
                Your Information
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <span className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      Full Name <span className="text-red-500">*</span>
                    </span>
                  </label>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand focus:border-transparent"
                    placeholder="Enter your full name"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <span className="flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      Email <span className="text-red-500">*</span>
                    </span>
                  </label>
                  <input
                    type="email"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand focus:border-transparent"
                    placeholder="Enter your email"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <span className="flex items-center gap-2">
                      <Phone className="w-4 h-4" />
                      Phone Number (Optional)
                    </span>
                  </label>
                  <input
                    type="tel"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand focus:border-transparent"
                    placeholder="Enter your phone number"
                  />
                </div>
              </div>
            </div>

            {/* Payment Method Selection */}
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <h2 className="text-lg font-semibold mb-4">
                Select Payment Method
              </h2>

              {channelsError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-red-900 mb-1">
                        Failed to load payment methods
                      </h4>
                      <p className="text-sm text-red-700">
                        Please refresh the page or try again later
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {isLoadingChannels ? (
                <div className="text-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-brand mx-auto mb-2" />
                  <p className="text-sm text-gray-600">Loading payment methods...</p>
                </div>
              ) : hasValidChannels ? (
                <PaymentMethodSelector
                  methods={channelsData.data}
                  flatMethods={channelsData.flat}
                  selectedMethod={selectedMethod?.code || null}
                  onSelect={setSelectedMethod}
                  disabled={isFull || createPaymentMutation.isPending}
                />
              ) : (
                <div className="text-center py-8 text-gray-600">
                  <AlertCircle className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p>No payment methods available</p>
                  <button
                    onClick={() => window.location.reload()}
                    className="mt-3 text-brand hover:underline text-sm"
                  >
                    Refresh page
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar - Fee Summary */}
          <div className="lg:col-span-1">
            <div className="sticky top-20 space-y-4">
              {selectedMethod && feeData?.success && !isCalculatingFee ? (
                <FeeBreakdown
                  calculation={feeData.data as any}
                  currency={event.currency}
                />
              ) : (
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-3">
                    Payment Summary
                  </h3>
                  <p className="text-sm text-gray-600">
                    Select a payment method to see the fee breakdown
                  </p>
                </div>
              )}

              {/* CTA Button */}
              <button
                onClick={handlePayment}
                disabled={
                  !selectedMethod ||
                  !customerName ||
                  !customerEmail ||
                  isFull ||
                  createPaymentMutation.isPending ||
                  !hasValidChannels
                }
                className={`w-full px-6 py-4 rounded-xl font-semibold text-lg transition-all ${
                  !selectedMethod ||
                  !customerName ||
                  !customerEmail ||
                  isFull ||
                  createPaymentMutation.isPending ||
                  !hasValidChannels
                    ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                    : 'bg-brand text-white hover:bg-brand/90 hover:shadow-xl active:scale-[0.98]'
                }`}
              >
                {createPaymentMutation.isPending ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Processing...
                  </span>
                ) : isFull ? (
                  'Event Full'
                ) : !hasValidChannels ? (
                  'No Payment Methods'
                ) : (
                  'Proceed to Payment'
                )}
              </button>

              <p className="text-xs text-center text-gray-600">
                By proceeding, you agree to our terms and conditions
              </p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}