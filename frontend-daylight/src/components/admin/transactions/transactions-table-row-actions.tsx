'use client';

import { Row } from '@tanstack/react-table';
import { MoreHorizontal, Eye, Trash2, Copy, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Transaction, TransactionStatus } from '@/types/transaction.types';
import { useState } from 'react';
import { TransactionDetailsDialog } from './transaction-details-dialog';
import { DeleteTransactionDialog } from './delete-transaction-dialog';
import { toast } from 'sonner';

interface TransactionsTableRowActionsProps {
  row: Row<Transaction>;
}

export function TransactionsTableRowActions({ row }: TransactionsTableRowActionsProps) {
  const transaction = row.original;
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const handleCopyExternalId = () => {
    navigator.clipboard.writeText(transaction.externalId);
    toast.success('Transaction ID copied to clipboard');
  };

  const handleOpenPaymentUrl = () => {
    if (transaction.paymentUrl) {
      window.open(transaction.paymentUrl, '_blank');
    } else if (transaction.actions && transaction.actions.length > 0) {
      const webUrlAction = transaction.actions.find(a => a.descriptor === 'WEB_URL');
      if (webUrlAction) {
        window.open(webUrlAction.value, '_blank');
      }
    }
  };

  const hasPaymentUrl = transaction.paymentUrl ||
    (transaction.actions && transaction.actions.some(a => a.descriptor === 'WEB_URL'));

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
        <DropdownMenuContent align="end" className="w-[200px] bg-white">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuSeparator />

          <DropdownMenuItem onClick={() => setShowDetailsDialog(true)}>
            <Eye className="mr-2 h-4 w-4" />
            View Details
          </DropdownMenuItem>

          <DropdownMenuItem onClick={handleCopyExternalId}>
            <Copy className="mr-2 h-4 w-4" />
            Copy Transaction ID
          </DropdownMenuItem>

          {transaction.status === TransactionStatus.PENDING && hasPaymentUrl && (
            <DropdownMenuItem onClick={handleOpenPaymentUrl}>
              <ExternalLink className="mr-2 h-4 w-4" />
              Open Payment Link
            </DropdownMenuItem>
          )}

          <DropdownMenuSeparator />

          <DropdownMenuItem
            onClick={() => setShowDeleteDialog(true)}
            className="text-red-600 focus:text-red-600"
            disabled={transaction.status === TransactionStatus.PAID}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete Transaction
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <TransactionDetailsDialog
        transaction={transaction}
        open={showDetailsDialog}
        onOpenChange={setShowDetailsDialog}
      />

      <DeleteTransactionDialog
        transaction={transaction}
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
      />
    </>
  );
}