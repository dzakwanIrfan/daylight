'use client';

import { useState } from 'react';
import { DashboardLayout } from '@/components/main/dashboard-layout';
import { useAuth } from '@/hooks/use-auth';
import { usePlanById, useCreateSubscriptionPayment } from '@/hooks/use-subscriptions';
import { usePaymentChannels, useCalculateFee } from '@/hooks/use-payment';
import { useParams, useRouter } from 'next/navigation';
import {
  Loader2,
  ArrowLeft,
  Crown,
  Check,
  AlertCircle,
  CreditCard,
  User,
  Mail,
  Phone,
} from 'lucide-react';
import { PaymentMethodSelector } from '@/components/payment/payment-method-selector';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { formatCurrency } from '@/lib/utils';
import { toast } from 'sonner';
import { ApiError, getUserFriendlyErrorMessage } from '@/lib/api-error';

export default function SubscriptionCheckoutPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const planId = params.planId as string;

  const { data: planResponse, isLoading: isLoadingPlan } = usePlanById(planId);
  const { data: paymentChannels, isLoading: isLoadingChannels } = usePaymentChannels();

  const plan = planResponse?.data;

  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string | null>(null);
  const [customerName, setCustomerName] = useState(
    user ? `${user.firstName} ${user.lastName}` : ''
  );
  const [customerPhone, setCustomerPhone] = useState(user?.phoneNumber || '');

  // Calculate fee
  const { data: feeCalculation } = useCalculateFee(
    plan?.price || 0,
    selectedPaymentMethod || undefined
  );

  const createPaymentMutation = useCreateSubscriptionPayment();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!plan || !selectedPaymentMethod || !user) {
      toast.error('Please complete all required fields');
      return;
    }

    if (!customerName.trim()) {
      toast.error('Please enter your name');
      return;
    }

    try {
      const result = await createPaymentMutation.mutateAsync({
        planId: plan.id,
        paymentMethod: selectedPaymentMethod,
        customerName: customerName.trim(),
        customerEmail: user.email,
        customerPhone: customerPhone.trim() || undefined,
      });

      if (result.success) {
        toast.success('Payment created! Redirecting...');
        router.push(`/payment/${result.data.transaction.id}`);
      }
    } catch (error: any) {
      console.error('Payment creation error:', error);
      if (error instanceof ApiError) {
        const friendlyMessage = getUserFriendlyErrorMessage(error);
        toast.error(friendlyMessage);
      } else {
        toast.error('Failed to create payment. Please try again.');
      }
    }
  };

  const isLoading = isLoadingPlan || isLoadingChannels;

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-brand" />
        </div>
      </DashboardLayout>
    );
  }

  if (!plan) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <h3 className="text-lg font-semibold mb-2">Plan not found</h3>
          <button
            onClick={() => router.push('/subscriptions')}
            className="text-brand hover:underline"
          >
            Back to Plans
          </button>
        </div>
      </DashboardLayout>
    );
  }

  const monthlyPrice = plan.price / plan.durationInMonths;

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-5xl mx-auto py-4 px-4 sm:px-6">
        {/* Back Button */}
        <button
          onClick={() => router.push('/subscriptions')}
          className="inline-flex items-center gap-2 text-gray-600 hover:text-brand transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm font-medium">Back to Plans</span>
        </button>

        {/* Header */}
        <div className="bg-white border-2 border-brand/20 rounded-lg p-5">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-lg bg-linear-to-br from-brand to-orange-600 flex items-center justify-center shrink-0">
              <Crown className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-xl font-bold text-gray-900 mb-1">
                Complete Your Subscription
              </h1>
              <p className="text-sm text-gray-600">
                You're upgrading to <span className="font-semibold">{plan.name}</span>
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Plan Summary */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h2 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Crown className="w-5 h-5 text-brand" />
                Plan Details
              </h2>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-lg text-gray-900 mb-1">
                    {plan.name}
                  </h3>
                  {plan.description && (
                    <p className="text-sm text-gray-600">{plan.description}</p>
                  )}
                </div>

                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-gray-900">
                    {formatCurrency(plan.price, plan.currency)}
                  </span>
                  <span className="text-sm text-gray-600">
                    / {plan.durationInMonths} month{plan.durationInMonths > 1 ? 's' : ''}
                  </span>
                </div>

                <p className="text-sm text-gray-600">
                  Only {formatCurrency(monthlyPrice, plan.currency)}/month
                </p>

                <div className="pt-4 border-t border-gray-200">
                  <p className="font-medium text-sm text-gray-900 mb-3">
                    What's included:
                  </p>
                  <div className="space-y-2.5">
                    {plan.features.map((feature, index) => (
                      <div key={index} className="flex items-start gap-2.5">
                        <Check className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
                        <span className="text-sm text-gray-700">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Customer Information */}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h2 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <User className="w-5 h-5 text-brand" />
                  Customer Information
                </h2>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="customerName" className="text-sm font-medium">
                      Full Name <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="customerName"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="John Doe"
                      required
                      disabled={createPaymentMutation.isPending}
                      className="mt-1.5"
                    />
                  </div>

                  <div>
                    <Label htmlFor="customerEmail" className="text-sm font-medium">
                      Email Address
                    </Label>
                    <div className="relative mt-1.5">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        id="customerEmail"
                        type="email"
                        value={user?.email || ''}
                        disabled
                        className="pl-10 bg-gray-50"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="customerPhone" className="text-sm font-medium">
                      Phone Number <span className="text-gray-500">(Optional)</span>
                    </Label>
                    <div className="relative mt-1.5">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        id="customerPhone"
                        type="tel"
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                        placeholder="+62 812 3456 7890"
                        disabled={createPaymentMutation.isPending}
                        className="pl-10"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h2 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-brand" />
                  Payment Method
                </h2>
                {paymentChannels?.success && (
                  <PaymentMethodSelector
                    methods={paymentChannels.data}
                    flatMethods={paymentChannels.flat}
                    selectedMethod={selectedPaymentMethod}
                    onSelect={(method) => setSelectedPaymentMethod(method.code)}
                    disabled={createPaymentMutation.isPending}
                  />
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={
                  !selectedPaymentMethod ||
                  !customerName.trim() ||
                  createPaymentMutation.isPending
                }
                className="w-full bg-linear-to-r from-brand to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-lg px-6 py-3.5 font-semibold text-base transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
              >
                {createPaymentMutation.isPending ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Crown className="w-5 h-5" />
                    Complete Subscription
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Right Column - Summary */}
          <div className="space-y-6">
            {/* Payment Summary */}
            {selectedPaymentMethod && feeCalculation?.success && (
              <div className="bg-white border border-gray-200 rounded-lg p-5 sticky top-6">
                <h3 className="font-semibold text-gray-900 mb-4 text-sm">
                  Payment Summary
                </h3>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Subscription Price</span>
                    <span className="font-medium text-gray-900">
                      {formatCurrency(plan.price, plan.currency)}
                    </span>
                  </div>

                  {(feeCalculation.data as any).fee.customer.total > 0 && (
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Payment Fee</span>
                      <span className="font-medium text-brand">
                        + {formatCurrency(
                          (feeCalculation.data as any).fee.customer.total,
                          plan.currency
                        )}
                      </span>
                    </div>
                  )}

                  <div className="border-t border-gray-200 pt-3 mt-3"></div>

                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-gray-900">Total Payment</span>
                    <span className="font-bold text-lg text-brand">
                      {formatCurrency(
                        (feeCalculation.data as any).finalAmount,
                        plan.currency
                      )}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Security Notice */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-blue-900 mb-1">
                    Secure Payment
                  </p>
                  <p className="text-blue-700 leading-relaxed">
                    Your payment is processed securely through our trusted payment
                    gateway. Your subscription will activate immediately after payment
                    confirmation.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}