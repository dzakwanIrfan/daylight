'use client';

import { useState } from 'react';
import { Loader2, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
import { useAdminTransactionMutations } from '@/hooks/use-admin-transactions';
import { Transaction, TransactionBulkActionType, TransactionStatus } from '@/types/transaction.types';

interface TransactionsBulkActionsProps {
  selectedTransactions: Transaction[];
  onClearSelection: () => void;
}

export function TransactionsBulkActions({
  selectedTransactions,
  onClearSelection,
}: TransactionsBulkActionsProps) {
  const { bulkAction } = useAdminTransactionMutations();
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [pendingAction, setPendingAction] = useState<TransactionBulkActionType | null>(null);

  const transactionIds = selectedTransactions.map((t) => t.id);
  const hasPaidTransactions = selectedTransactions.some(
    (t) => t.status === TransactionStatus.PAID
  );

  const handleBulkAction = (action: TransactionBulkActionType) => {
    // Check if action is allowed
    if (action === TransactionBulkActionType.DELETE && hasPaidTransactions) {
      alert('Cannot delete paid transactions.Please deselect paid transactions first.');
      return;
    }

    if (action === TransactionBulkActionType.REFUND) {
      const allPaid = selectedTransactions.every(
        (t) => t.status === TransactionStatus.PAID
      );
      if (!allPaid) {
        alert('Can only refund paid transactions.Please select only paid transactions.');
        return;
      }
    }

    setPendingAction(action);
    setShowConfirmDialog(true);
  };

  const executeAction = () => {
    if (!pendingAction) return;

    bulkAction.mutate(
      {
        transactionIds,
        action: pendingAction,
      },
      {
        onSuccess: () => {
          setShowConfirmDialog(false);
          setPendingAction(null);
          onClearSelection();
        },
      }
    );
  };

  const getActionLabel = (action: TransactionBulkActionType): string => {
    const labels: Record<TransactionBulkActionType, string> = {
      [TransactionBulkActionType.MARK_PAID]: 'Mark as Paid',
      [TransactionBulkActionType.MARK_FAILED]: 'Mark as Failed',
      [TransactionBulkActionType.MARK_EXPIRED]: 'Mark as Expired',
      [TransactionBulkActionType.REFUND]: 'Refund',
      [TransactionBulkActionType.DELETE]: 'Delete',
    };
    return labels[action];
  };

  const getActionDescription = (action: TransactionBulkActionType): string => {
    const descriptions: Record<TransactionBulkActionType, string> = {
      [TransactionBulkActionType.MARK_PAID]: `Mark ${selectedTransactions.length} transaction(s) as PAID? `,
      [TransactionBulkActionType.MARK_FAILED]: `Mark ${selectedTransactions.length} transaction(s) as FAILED?`,
      [TransactionBulkActionType.MARK_EXPIRED]: `Mark ${selectedTransactions.length} transaction(s) as EXPIRED?`,
      [TransactionBulkActionType.REFUND]: `Refund ${selectedTransactions.length} paid transaction(s)?`,
      [TransactionBulkActionType.DELETE]: `Permanently delete ${selectedTransactions.length} transaction(s)?`,
    };
    return descriptions[action];
  };

  if (selectedTransactions.length === 0) {
    return null;
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm">
            Bulk Actions ({selectedTransactions.length})
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-[200px] bg-white">
          <DropdownMenuLabel>Status Actions</DropdownMenuLabel>
          <DropdownMenuSeparator />

          <DropdownMenuItem onClick={() => handleBulkAction(TransactionBulkActionType.MARK_PAID)}>
            Mark as Paid
          </DropdownMenuItem>

          <DropdownMenuItem onClick={() => handleBulkAction(TransactionBulkActionType.MARK_FAILED)}>
            Mark as Failed
          </DropdownMenuItem>

          <DropdownMenuItem onClick={() => handleBulkAction(TransactionBulkActionType.MARK_EXPIRED)}>
            Mark as Expired
          </DropdownMenuItem>

          <DropdownMenuItem
            onClick={() => handleBulkAction(TransactionBulkActionType.REFUND)}
            disabled={!selectedTransactions.every((t) => t.status === TransactionStatus.PAID)}
          >
            Refund
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuItem
            onClick={() => handleBulkAction(TransactionBulkActionType.DELETE)}
            className="text-red-600 focus:text-red-600"
            disabled={hasPaidTransactions}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent className="bg-white">
          <AlertDialogHeader>
            <AlertDialogTitle>
              {pendingAction && getActionLabel(pendingAction)}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {pendingAction && getActionDescription(pendingAction)}
              <br />
              <br />
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={bulkAction.isPending}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={executeAction}
              disabled={bulkAction.isPending}
              className={
                pendingAction === TransactionBulkActionType.DELETE
                  ? 'bg-red-600 hover:bg-red-700'
                  : ''
              }
            >
              {bulkAction.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}