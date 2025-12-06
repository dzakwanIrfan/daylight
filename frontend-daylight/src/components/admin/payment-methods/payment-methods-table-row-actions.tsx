'use client';

import { Row } from '@tanstack/react-table';
import { MoreHorizontal, Pencil, Eye, Power, PowerOff, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { PaymentMethod } from '@/types/payment-method.types';
import { useState } from 'react';
import { PaymentMethodDetailsDialog } from './payment-method-details-dialog';
import { EditPaymentMethodDialog } from './edit-payment-method-dialog';
import { DeletePaymentMethodDialog } from './delete-payment-method-dialog';
import { usePaymentMethodMutations } from '@/hooks/use-payment-methods';

interface PaymentMethodsTableRowActionsProps {
  row: Row<PaymentMethod>;
}

export function PaymentMethodsTableRowActions({ row }: PaymentMethodsTableRowActionsProps) {
  const method = row.original;
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const { togglePaymentMethod } = usePaymentMethodMutations();

  const handleToggle = () => {
    if (
      confirm(
        `Are you sure you want to ${method.isActive ? 'deactivate' : 'activate'} this payment method?`
      )
    ) {
      togglePaymentMethod.mutate(method.code);
    }
  };

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

          <DropdownMenuItem onClick={() => setShowEditDialog(true)}>
            <Pencil className="mr-2 h-4 w-4" />
            Edit Method
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuItem
            onClick={handleToggle}
            className={
              method.isActive
                ? 'text-orange-600 focus:text-orange-600'
                : 'text-green-600 focus:text-green-600'
            }
          >
            {method.isActive ? (
              <>
                <PowerOff className="mr-2 h-4 w-4" />
                Deactivate
              </>
            ) : (
              <>
                <Power className="mr-2 h-4 w-4" />
                Activate
              </>
            )}
          </DropdownMenuItem>

          <DropdownMenuItem
            onClick={() => setShowDeleteDialog(true)}
            className="text-red-600 focus:text-red-600"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <PaymentMethodDetailsDialog
        method={method}
        open={showDetailsDialog}
        onOpenChange={setShowDetailsDialog}
      />

      <EditPaymentMethodDialog
        method={method}
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
      />

      <DeletePaymentMethodDialog
        method={method}
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
      />
    </>
  );
}