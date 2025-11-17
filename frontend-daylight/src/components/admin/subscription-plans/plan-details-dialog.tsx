'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import type { AdminSubscriptionPlan } from '@/types/admin-subscription.types';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { format } from 'date-fns';
import { Check } from 'lucide-react';

interface PlanDetailsDialogProps {
  plan: AdminSubscriptionPlan;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PlanDetailsDialog({
  plan,
  open,
  onOpenChange,
}: PlanDetailsDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] bg-white">
        <DialogHeader>
          <DialogTitle>Plan Details</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Status Badge */}
          <div className="flex items-center gap-2">
            <Badge variant={plan.isActive ? 'default' : 'secondary'}>
              {plan.isActive ? 'Active' : 'Inactive'}
            </Badge>
            <Badge variant="outline">{plan.type}</Badge>
          </div>

          <Separator />

          {/* Basic Info */}
          <div>
            <h3 className="font-semibold text-lg text-gray-900 mb-1">
              {plan.name}
            </h3>
            {plan.description && (
              <p className="text-sm text-gray-600">{plan.description}</p>
            )}
          </div>

          <Separator />

          {/* Pricing Info */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-gray-500">Price</p>
              <p className="text-xl font-bold text-gray-900 mt-1">
                {plan.currency} {plan.price.toLocaleString('id-ID')}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Duration</p>
              <p className="text-xl font-bold text-gray-900 mt-1">
                {plan.durationInMonths} month{plan.durationInMonths > 1 ? 's' : ''}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Sort Order</p>
              <p className="text-sm text-gray-900 mt-1">{plan.sortOrder}</p>
            </div>
          </div>

          {/* Features */}
          {plan.features.length > 0 && (
            <>
              <Separator />
              <div>
                <p className="text-sm font-medium text-gray-500 mb-3">
                  Features
                </p>
                <div className="space-y-2">
                  {plan.features.map((feature, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <Check className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
                      <span className="text-sm text-gray-900">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          <Separator />

          {/* Metadata */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-gray-500">Created At</p>
              <p className="text-sm text-gray-900 mt-1">
                {format(new Date(plan.createdAt), 'PPP')}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Updated At</p>
              <p className="text-sm text-gray-900 mt-1">
                {format(new Date(plan.updatedAt), 'PPP')}
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}