'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import type { AdminSubscription } from '@/types/admin-subscription.types';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { format } from 'date-fns';
import { SubscriptionStatus } from '@/types/subscription.types';

interface SubscriptionDetailsDialogProps {
  subscription: AdminSubscription;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const getStatusVariant = (status: SubscriptionStatus) => {
  switch (status) {
    case SubscriptionStatus.ACTIVE:
      return 'default';
    case SubscriptionStatus.PENDING:
      return 'secondary';
    case SubscriptionStatus.EXPIRED:
      return 'outline';
    case SubscriptionStatus.CANCELLED:
      return 'destructive';
    default:
      return 'secondary';
  }
};

export function SubscriptionDetailsDialog({
  subscription,
  open,
  onOpenChange,
}: SubscriptionDetailsDialogProps) {
  const user = subscription.user;
  const plan = subscription.plan;
  const transaction = subscription.transaction;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-auto bg-white">
        <DialogHeader>
          <DialogTitle>Subscription Details</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Status Badge */}
          <div className="flex items-center gap-2">
            <Badge
              variant={getStatusVariant(subscription.status)}
              className="font-medium"
            >
              {subscription.status}
            </Badge>
            {subscription.autoRenew && (
              <Badge variant="outline">Auto-Renew</Badge>
            )}
          </div>

          <Separator />

          {/* User Info */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">User Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Name</p>
                <p className="text-sm text-gray-900 mt-1">
                  {user.firstName && user.lastName
                    ? `${user.firstName} ${user.lastName}`
                    : 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Email</p>
                <p className="text-sm text-gray-900 mt-1">{user.email}</p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Plan Info */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">Plan Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Plan Name</p>
                <p className="text-sm text-gray-900 mt-1">{plan.name}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Duration</p>
                <p className="text-sm text-gray-900 mt-1">
                  {plan.durationInMonths} month{plan.durationInMonths > 1 ? 's' : ''}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Price</p>
                <p className="text-sm text-gray-900 mt-1">
                  Rp {plan.price.toLocaleString('id-ID')}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Plan Type</p>
                <p className="text-sm text-gray-900 mt-1">
                  <Badge variant="outline">{plan.type}</Badge>
                </p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Subscription Dates */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">Subscription Period</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Start Date</p>
                <p className="text-sm text-gray-900 mt-1">
                  {subscription.startDate
                    ? format(new Date(subscription.startDate), 'PPP')
                    : 'Not started'}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">End Date</p>
                <p className="text-sm text-gray-900 mt-1">
                  {subscription.endDate
                    ? format(new Date(subscription.endDate), 'PPP')
                    : 'Not set'}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Created At</p>
                <p className="text-sm text-gray-900 mt-1">
                  {format(new Date(subscription.createdAt), 'PPP')}
                </p>
              </div>
              {subscription.cancelledAt && (
                <div>
                  <p className="text-sm font-medium text-gray-500">Cancelled At</p>
                  <p className="text-sm text-red-600 mt-1">
                    {format(new Date(subscription.cancelledAt), 'PPP')}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Transaction Info */}
          {transaction && (
            <>
              <Separator />
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">
                  Payment Information
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">
                      Transaction ID
                    </p>
                    <p className="text-sm text-gray-900 mt-1 font-mono">
                      {transaction.merchantRef}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Amount</p>
                    <p className="text-sm text-gray-900 mt-1">
                      Rp {transaction.amount.toLocaleString('id-ID')}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">
                      Payment Status
                    </p>
                    <p className="text-sm text-gray-900 mt-1">
                      <Badge variant="outline">{transaction.paymentStatus}</Badge>
                    </p>
                  </div>
                  {transaction.paidAt && (
                    <div>
                      <p className="text-sm font-medium text-gray-500">Paid At</p>
                      <p className="text-sm text-gray-900 mt-1">
                        {format(new Date(transaction.paidAt), 'PPP')}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}