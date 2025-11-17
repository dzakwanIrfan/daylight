'use client';

import { Row } from '@tanstack/react-table';
import { MoreHorizontal, Eye, Ban, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { AdminSubscription } from '@/types/admin-subscription.types';
import { SubscriptionStatus } from '@/types/subscription.types';
import { useState } from 'react';
import { SubscriptionDetailsDialog } from './subscription-details-dialog';

interface SubscriptionsTableRowActionsProps {
  row: Row<AdminSubscription>;
}

export function SubscriptionsTableRowActions({
  row,
}: SubscriptionsTableRowActionsProps) {
  const subscription = row.original;
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);

  const canActivate = subscription.status === SubscriptionStatus.PENDING;
  const canCancel =
    subscription.status === SubscriptionStatus.ACTIVE ||
    subscription.status === SubscriptionStatus.PENDING;

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            aria-label="Open menu"
            variant="ghost"
            className="flex h-8 w-8 p-0 data-[state=open]:bg-muted"
          >
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-[200px] glass-card">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuSeparator />

          <DropdownMenuItem onClick={() => setShowDetailsDialog(true)}>
            <Eye className="mr-2 h-4 w-4" />
            View Details
          </DropdownMenuItem>

          {canActivate && (
            <DropdownMenuItem className="text-green-600 focus:text-green-600">
              <Check className="mr-2 h-4 w-4" />
              Activate
            </DropdownMenuItem>
          )}

          {canCancel && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-red-600 focus:text-red-600">
                <Ban className="mr-2 h-4 w-4" />
                Cancel Subscription
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <SubscriptionDetailsDialog
        subscription={subscription}
        open={showDetailsDialog}
        onOpenChange={setShowDetailsDialog}
      />
    </>
  );
}