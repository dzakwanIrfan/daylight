'use client';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Transaction, PaymentStatus } from '@/types/transaction.types';
import { useAdminTransactionMutations } from '@/hooks/use-admin-transactions';
import { Loader2 } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { useState } from 'react';

interface DeleteTransactionDialogProps {
  transaction: Transaction;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DeleteTransactionDialog({
  transaction,
  open,
  onOpenChange,
}: DeleteTransactionDialogProps) {
  const { deleteTransaction } = useAdminTransactionMutations();
  const [hardDelete, setHardDelete] = useState(false);

  const handleDelete = () => {
    deleteTransaction.mutate(
      { id: transaction.id, hardDelete },
      {
        onSuccess: () => {
          onOpenChange(false);
          setHardDelete(false);
        },
      }
    );
  };

  const isPaidTransaction = transaction.paymentStatus === PaymentStatus.PAID;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="bg-white">
        <AlertDialogHeader>
          <AlertDialogTitle>
            {isPaidTransaction ? 'Delete Paid Transaction?' : 'Delete Transaction?'}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {isPaidTransaction ? (
              <div className="space-y-3">
                <p className="text-red-600 font-medium">
                  ⚠️ Warning: This is a PAID transaction!
                </p>
                <p>
                  Deleting a paid transaction is generally not recommended as it may cause
                  accounting discrepancies. Are you absolutely sure you want to proceed?
                </p>
                <p className="text-sm text-gray-600">
                  <strong>Transaction:</strong> {transaction.merchantRef}
                  <br />
                  <strong>Customer:</strong> {transaction.customerName}
                  <br />
                  <strong>Amount:</strong> IDR {transaction.amountReceived.toLocaleString('id-ID')}
                </p>
                <div className="flex items-center space-x-2 pt-2">
                  <Checkbox
                    id="hard-delete"
                    checked={hardDelete}
                    onCheckedChange={(checked) => setHardDelete(checked as boolean)}
                  />
                  <Label
                    htmlFor="hard-delete"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    I understand the risks and want to delete this paid transaction
                  </Label>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <p>
                  This action cannot be undone. This will permanently delete the transaction
                  from the database.
                </p>
                <p className="text-sm text-gray-600">
                  <strong>Transaction:</strong> {transaction.merchantRef}
                  <br />
                  <strong>Customer:</strong> {transaction.customerName}
                  <br />
                  <strong>Status:</strong> {transaction.paymentStatus}
                </p>
              </div>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={deleteTransaction.isPending}>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={deleteTransaction.isPending || (isPaidTransaction && !hardDelete)}
            className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
          >
            {deleteTransaction.isPending && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Delete Transaction
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}