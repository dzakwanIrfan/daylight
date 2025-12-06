'use client';

import { ColumnDef } from '@tanstack/react-table';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { DataTableColumnHeader } from '@/components/data-table/data-table-column-header';
import { Transaction, TransactionStatus, TransactionType } from '@/types/transaction.types';
import { format } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';
import { TransactionsTableRowActions } from './transactions-table-row-actions';
import { formatCurrency } from '@/lib/utils';

const statusColors: Record<TransactionStatus, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  PAID: 'bg-green-100 text-green-800 border-green-200',
  FAILED: 'bg-red-100 text-red-800 border-red-200',
  EXPIRED: 'bg-gray-100 text-gray-800 border-gray-200',
  REFUNDED: 'bg-purple-100 text-purple-800 border-purple-200',
};

const typeColors: Record<TransactionType, string> = {
  EVENT: 'bg-blue-100 text-blue-800 border-blue-200',
  SUBSCRIPTION: 'bg-orange-100 text-orange-800 border-orange-200',
};

export const columns: ColumnDef<Transaction>[] = [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && 'indeterminate')
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
        className="translate-y-0.5"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
        className="translate-y-0.5"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'externalId',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Transaction ID" />
    ),
    cell: ({ row }) => {
      return (
        <div className="flex flex-col max-w-[200px]">
          <span className="font-mono text-xs font-medium text-gray-900 truncate">
            {row.original.externalId}
          </span>
          {row.original.paymentMethod && (
            <div className="flex items-center gap-1 mt-1">
              <span className="text-[10px] px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded font-mono">
                {row.original.paymentMethod.countryCode}
              </span>
              <span className="text-[10px] text-gray-500">
                {row.original.paymentMethod.currency}
              </span>
            </div>
          )}
        </div>
      );
    },
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'transactionType',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Type" />
    ),
    cell: ({ row }) => {
      const type = row.getValue('transactionType') as TransactionType;
      return (
        <Badge variant="outline" className={typeColors[type]}>
          {type}
        </Badge>
      );
    },
    filterFn: (row, id, value) => {
      return Array.isArray(value) && value.includes(row.getValue(id));
    },
  },
  {
    accessorKey: 'customer',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Customer" />
    ),
    cell: ({ row }) => {
      const transaction = row.original;
      const user = transaction.user;

      if (!user) return <span className="text-gray-400">-</span>;

      const fullName = [user.firstName, user.lastName].filter(Boolean).join(' ') || user.email;

      return (
        <div className="flex flex-col max-w-[200px]">
          <span className="font-medium text-gray-900 truncate">
            {fullName}
          </span>
          <span className="text-xs text-gray-500 truncate">
            {user.email}
          </span>
          {user.currentCity && (
            <span className="text-[10px] text-gray-400 truncate">
              {user.currentCity.name}, {user.currentCity.country.name}
            </span>
          )}
        </div>
      );
    },
    enableSorting: false,
  },
  {
    accessorKey: 'item',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Item" />
    ),
    cell: ({ row }) => {
      const transaction = row.original;

      if (transaction.transactionType === TransactionType.EVENT) {
        const event = transaction.event;
        return (
          <div className="flex flex-col max-w-[250px]">
            <span className="font-medium text-gray-900 truncate">
              {event?.title || 'N/A'}
            </span>
            {event?.eventDate && (
              <span className="text-xs text-gray-500">
                {format(new Date(event.eventDate), 'dd MMM yyyy', { locale: idLocale })}
              </span>
            )}
            {event?.cityRelation && (
              <span className="text-[10px] text-gray-400 truncate">
                {event.cityRelation.name}, {event.cityRelation.country.name}
              </span>
            )}
          </div>
        );
      }

      if (transaction.transactionType === TransactionType.SUBSCRIPTION) {
        const subscription = transaction.userSubscription;
        return (
          <div className="flex flex-col max-w-[250px]">
            <span className="font-medium text-gray-900 truncate">
              {subscription?.plan.name || 'Subscription'}
            </span>
            <span className="text-xs text-gray-500">
              {subscription?.plan.durationInMonths} month(s)
            </span>
          </div>
        );
      }

      return <span className="text-gray-500">-</span>;
    },
    enableSorting: false,
  },
  {
    accessorKey: 'paymentMethod',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Payment Method" />
    ),
    cell: ({ row }) => {
      const paymentMethod = row.original.paymentMethod;

      return (
        <div className="flex flex-col">
          <span className="text-sm font-medium text-gray-900">
            {paymentMethod?.name || row.original.paymentMethodName}
          </span>
          {paymentMethod && (
            <>
              <span className="text-xs text-gray-500">
                {paymentMethod.type.replace(/_/g, ' ')}
              </span>
              <span className="text-[10px] text-gray-400">
                {paymentMethod.country.name}
              </span>
            </>
          )}
        </div>
      );
    },
    filterFn: (row, id, value) => {
      return Array.isArray(value) && value.includes(row.getValue(id));
    },
  },
  {
    accessorKey: 'finalAmount',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Amount" />
    ),
    cell: ({ row }) => {
      const amount = row.original.amount;
      const totalFee = row.original.totalFee;
      const finalAmount = row.original.finalAmount;
      const currency = row.original.paymentMethod?.currency || 'IDR';

      return (
        <div className="flex flex-col">
          <span className="font-medium text-gray-900">
            {formatCurrency(Number(amount), currency)}
          </span>
          {Number(totalFee) > 0 && (
            <span className="text-xs text-gray-500">
              Fee: {formatCurrency(Number(totalFee), currency)}
            </span>
          )}
          <span className="text-xs font-medium text-green-600">
            Final: {formatCurrency(Number(finalAmount), currency)}
          </span>
        </div>
      );
    },
    enableSorting: true,
  },
  {
    accessorKey: 'status',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status" />
    ),
    cell: ({ row }) => {
      const status = row.getValue('status') as TransactionStatus;
      return (
        <Badge variant="outline" className={statusColors[status]}>
          {status}
        </Badge>
      );
    },
    filterFn: (row, id, value) => {
      return Array.isArray(value) && value.includes(row.getValue(id));
    },
  },
  {
    accessorKey: 'createdAt',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Created At" />
    ),
    cell: ({ row }) => {
      const date = new Date(row.getValue('createdAt'));

      return (
        <div className="flex flex-col">
          <span className="text-sm text-gray-900">
            {format(date, 'dd MMM yyyy', { locale: idLocale })}
          </span>
          <span className="text-xs text-gray-500">
            {format(date, 'HH:mm')}
          </span>
        </div>
      );
    },
    enableSorting: true,
  },
  {
    accessorKey: 'paidAt',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Paid At" />
    ),
    cell: ({ row }) => {
      const paidAt = row.original.paidAt;

      if (!paidAt) {
        return <span className="text-xs text-gray-400">-</span>;
      }

      const date = new Date(paidAt);

      return (
        <div className="flex flex-col">
          <span className="text-sm text-gray-900">
            {format(date, 'dd MMM yyyy', { locale: idLocale })}
          </span>
          <span className="text-xs text-gray-500">
            {format(date, 'HH:mm')}
          </span>
        </div>
      );
    },
    enableSorting: true,
  },
  {
    id: 'actions',
    cell: ({ row }) => <TransactionsTableRowActions row={row} />,
  },
];