'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import type { AdminSubscriptionPlan } from '@/types/admin-subscription.types';
import { Loader2, AlertTriangle } from 'lucide-react';
import { useAdminPlanMutations } from '@/hooks/use-admin-subscriptions';
import { useEffect } from 'react';

interface DeletePlanDialogProps {
  plan: AdminSubscriptionPlan;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DeletePlanDialog({
  plan,
  open,
  onOpenChange,
}: DeletePlanDialogProps) {
  const { deletePlan } = useAdminPlanMutations();

  // Close dialog on success
  useEffect(() => {
    if (deletePlan.isSuccess) {
      onOpenChange(false);
    }
  }, [deletePlan.isSuccess, onOpenChange]);

  const handleDelete = () => {
    deletePlan.mutate(plan.id);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] bg-white">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="h-5 w-5" />
            Delete Subscription Plan
          </DialogTitle>
          <DialogDescription>
            This action will permanently delete this subscription plan.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="p-4 bg-red-50 rounded-lg border border-red-200">
            <p className="text-sm font-medium text-gray-900">{plan.name}</p>
            <p className="text-xs text-gray-600 mt-1">
              {plan.type} • {plan.durationInMonths} month
              {plan.durationInMonths > 1 ? 's' : ''} • {plan.currency}{' '}
              {plan.price.toLocaleString('id-ID')}
            </p>
          </div>

          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-xs text-yellow-800">
              ⚠️ Warning: This plan cannot be deleted if there are active
              subscriptions using it.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={deletePlan.isPending}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={deletePlan.isPending}
          >
            {deletePlan.isPending && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Delete Plan
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}