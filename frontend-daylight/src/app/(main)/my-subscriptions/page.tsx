'use client';

import { DashboardLayout } from '@/components/main/dashboard-layout';
import { useAuth } from '@/hooks/use-auth';
import {
  useMyActiveSubscription,
  useMySubscriptions,
  useCancelSubscription,
} from '@/hooks/use-subscriptions';
import { useRouter } from 'next/navigation';
import {
  Crown,
  Loader2,
  Calendar,
  CreditCard,
  AlertCircle,
  Check,
  X,
  ArrowRight,
  XCircle,
} from 'lucide-react';
import { format } from 'date-fns';
import { SubscriptionStatus } from '@/types/subscription.types';
import { formatCurrency } from '@/lib/utils';
import { toast } from 'sonner';
import { useState } from 'react';
import { Label } from '@/components/ui/label';

export default function MySubscriptionsPage() {
  useAuth();
  const router = useRouter();
  const { data: activeResponse, isLoading: isLoadingActive } =
    useMyActiveSubscription();
  const { data: historyResponse, isLoading: isLoadingHistory } =
    useMySubscriptions({ limit: 20 });

  const cancelMutation = useCancelSubscription();
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [cancelReason, setCancelReason] = useState('');

  const hasActive = activeResponse?.hasActiveSubscription ?? false;
  const activeSubscription = activeResponse?.data;
  const history = historyResponse?.data || [];

  const handleCancelSubscription = async () => {
    if (!activeSubscription) return;

    try {
      await cancelMutation.mutateAsync({
        subscriptionId: activeSubscription.id,
        reason: cancelReason.trim() || undefined,
      });

      toast.success('Subscription cancelled successfully');
      setShowCancelDialog(false);
      setCancelReason('');
    } catch (error) {
      toast.error('Failed to cancel subscription');
    }
  };

  const getStatusBadge = (status: SubscriptionStatus) => {
    const config = {
      ACTIVE: {
        color: 'bg-green-50 text-green-700 border-green-200',
        icon: Check,
        label: 'Active',
      },
      PENDING: {
        color: 'bg-yellow-50 text-yellow-700 border-yellow-200',
        icon: AlertCircle,
        label: 'Pending',
      },
      EXPIRED: {
        color: 'bg-gray-50 text-gray-700 border-gray-200',
        icon: X,
        label: 'Expired',
      },
      CANCELLED: {
        color: 'bg-red-50 text-red-700 border-red-200',
        icon: X,
        label: 'Cancelled',
      },
    };

    const statusConfig = config[status] || config.PENDING;
    const StatusIcon = statusConfig.icon;

    return (
      <span
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-medium ${statusConfig.color}`}
      >
        <StatusIcon className="w-3.5 h-3.5" />
        {statusConfig.label}
      </span>
    );
  };

  if (isLoadingActive || isLoadingHistory) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-brand" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-4xl mx-auto py-4 px-4 sm:px-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-orange-50 flex items-center justify-center">
            <Crown className="w-5 h-5 text-brand" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Subscription</h1>
            <p className="text-sm text-gray-600">
              Manage your premium membership
            </p>
          </div>
        </div>

        {/* Active Subscription */}
        {hasActive && activeSubscription ? (
          <div className="bg-white border-2 border-brand rounded-lg p-6 space-y-5">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div className="flex items-start gap-4 flex-1 min-w-0">
                <div className="w-12 h-12 rounded-lg bg-linear-to-br from-brand to-orange-600 flex items-center justify-center shrink-0">
                  <Crown className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <h2 className="text-lg font-bold text-gray-900">
                      {activeSubscription.plan.name}
                    </h2>
                    {getStatusBadge(activeSubscription.status)}
                  </div>
                  {activeSubscription.plan.description && (
                    <p className="text-sm text-gray-600">
                      {activeSubscription.plan.description}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-gray-200">
              <div className="space-y-1">
                <p className="text-xs font-medium text-gray-600">Started On</p>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <span className="text-sm font-semibold text-gray-900">
                    {activeSubscription.startDate
                      ? format(new Date(activeSubscription.startDate), 'dd MMM yyyy')
                      : '-'}
                  </span>
                </div>
              </div>

              <div className="space-y-1">
                <p className="text-xs font-medium text-gray-600">Valid Until</p>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <span className="text-sm font-semibold text-gray-900">
                    {activeSubscription.endDate
                      ? format(new Date(activeSubscription.endDate), 'dd MMM yyyy')
                      : '-'}
                  </span>
                </div>
              </div>
            </div>

            {/* Features */}
            <div className="pt-4 border-t border-gray-200">
              <p className="text-sm font-semibold text-gray-900 mb-3">
                Your Benefits
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {activeSubscription.plan.features.map((feature, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
                    <span className="text-sm text-gray-700">{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200">
              <button
                onClick={() => setShowCancelDialog(true)}
                disabled={activeSubscription.status === SubscriptionStatus.CANCELLED}
                className="px-4 py-2.5 border border-red-300 text-red-700 rounded-lg text-sm font-semibold hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel Subscription
              </button>
              {activeSubscription.transaction && (
                <button
                  onClick={() =>
                    router.push(`/payment/${activeSubscription.transaction?.id}`)
                  }
                  className="px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                >
                  <CreditCard className="w-4 h-4" />
                  View Payment
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="bg-white border border-gray-200 rounded-lg p-8 text-center space-y-4">
            <div className="w-16 h-16 rounded-lg bg-gray-50 flex items-center justify-center mx-auto">
              <Crown className="w-8 h-8 text-gray-400" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                No Active Subscription
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Upgrade to premium to enjoy unlimited events
              </p>
              <button
                onClick={() => router.push('/subscriptions')}
                className="inline-flex items-center gap-2 bg-linear-to-r from-brand to-orange-600 text-white px-6 py-2.5 rounded-lg text-sm font-semibold hover:shadow-lg transition-all"
              >
                View Plans
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Subscription History */}
        {history.length > 0 && (
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h2 className="text-base font-semibold text-gray-900 mb-4">
              Subscription History
            </h2>
            <div className="space-y-3">
              {history.map((subscription) => (
                <div
                  key={subscription.id}
                  className="border border-gray-200 rounded-lg p-4 hover:border-brand/30 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <h3 className="text-sm font-semibold text-gray-900">
                          {subscription.plan.name}
                        </h3>
                        {getStatusBadge(subscription.status)}
                      </div>
                      <p className="text-sm text-gray-600">
                        {formatCurrency(subscription.plan.price, subscription.plan.currency)}{' '}
                        for {subscription.plan.durationInMonths} month
                        {subscription.plan.durationInMonths > 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-600">
                    <span>
                      Created: {format(new Date(subscription.createdAt), 'dd MMM yyyy')}
                    </span>
                    {subscription.startDate && (
                      <span>
                        Started: {format(new Date(subscription.startDate), 'dd MMM yyyy')}
                      </span>
                    )}
                    {subscription.endDate && (
                      <span>
                        Expires: {format(new Date(subscription.endDate), 'dd MMM yyyy')}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Cancel Confirmation Dialog */}
        {showCancelDialog && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 max-w-md w-full space-y-5">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center shrink-0">
                  <XCircle className="w-5 h-5 text-red-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-lg text-gray-900 mb-2">
                    Cancel Subscription?
                  </h3>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    You'll continue to have access until{' '}
                    {activeSubscription?.endDate &&
                      format(new Date(activeSubscription.endDate), 'dd MMM yyyy')}
                    . After that, you'll need to purchase a new subscription.
                  </p>
                </div>
              </div>

              <div>
                <Label htmlFor="cancelReason" className="text-sm font-medium text-gray-900">
                  Reason for cancelling (optional)
                </Label>
                <textarea
                  id="cancelReason"
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  placeholder="Help us improve by telling us why..."
                  className="w-full mt-1.5 border border-gray-300 rounded-lg p-3 text-sm resize-none focus:ring-2 focus:ring-brand/20 focus:border-brand"
                  rows={3}
                  disabled={cancelMutation.isPending}
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowCancelDialog(false)}
                  disabled={cancelMutation.isPending}
                  className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Keep Subscription
                </button>
                <button
                  onClick={handleCancelSubscription}
                  disabled={cancelMutation.isPending}
                  className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg text-sm font-semibold hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {cancelMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Cancelling...
                    </>
                  ) : (
                    'Yes, Cancel'
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}