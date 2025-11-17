'use client';

import { ColumnDef } from '@tanstack/react-table';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { DataTableColumnHeader } from '@/components/data-table/data-table-column-header';
import type { AdminSubscription } from '@/types/admin-subscription.types';
import { SubscriptionStatus } from '@/types/subscription.types';
import { formatDistanceToNow, format } from 'date-fns';
import { SubscriptionsTableRowActions } from './subscriptions-table-row-actions';

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

export const columns: ColumnDef<AdminSubscription>[] = [
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
    accessorKey: 'user.email',
    id: 'user',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="User" />
    ),
    cell: ({ row }) => {
      const user = row.original.user;
      const fullName =
        user.firstName && user.lastName
          ? `${user.firstName} ${user.lastName}`
          : null;

      return (
        <div className="flex flex-col">
          <span className="font-medium text-gray-900">
            {fullName || user.email}
          </span>
          {fullName && <span className="text-sm text-gray-500">{user.email}</span>}
        </div>
      );
    },
    enableSorting: false,
  },
  {
    accessorKey: 'plan.name',
    id: 'plan',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Plan" />
    ),
    cell: ({ row }) => {
      const plan = row.original.plan;
      return (
        <div className="flex flex-col">
          <span className="font-medium text-gray-900">{plan.name}</span>
          <span className="text-sm text-gray-500">
            {plan.durationInMonths} month{plan.durationInMonths > 1 ? 's' : ''}
          </span>
        </div>
      );
    },
    enableSorting: false,
  },
  {
    accessorKey: 'status',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status" />
    ),
    cell: ({ row }) => {
      const status = row.getValue('status') as SubscriptionStatus;
      return (
        <Badge variant={getStatusVariant(status)} className="font-medium">
          {status}
        </Badge>
      );
    },
    filterFn: (row, id, value) => {
      return Array.isArray(value) && value.includes(row.getValue(id));
    },
  },
  {
    accessorKey: 'plan.price',
    id: 'amount',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Amount" />
    ),
    cell: ({ row }) => {
      const amount = row.original.plan.price;
      return (
        <span className="font-medium text-gray-900">
          Rp {amount.toLocaleString('id-ID')}
        </span>
      );
    },
  },
  {
    accessorKey: 'startDate',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Start Date" />
    ),
    cell: ({ row }) => {
      const date = row.getValue('startDate') as string | null;
      if (!date) return <span className="text-gray-400">-</span>;

      return (
        <div className="flex flex-col">
          <span className="text-sm font-medium text-gray-900">
            {format(new Date(date), 'dd MMM yyyy')}
          </span>
          <span className="text-xs text-gray-500">
            {formatDistanceToNow(new Date(date), { addSuffix: true })}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: 'endDate',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="End Date" />
    ),
    cell: ({ row }) => {
      const date = row.getValue('endDate') as string | null;
      if (!date) return <span className="text-gray-400">-</span>;

      const isExpired = new Date(date) < new Date();

      return (
        <div className="flex flex-col">
          <span
            className={`text-sm font-medium ${
              isExpired ? 'text-red-600' : 'text-gray-900'
            }`}
          >
            {format(new Date(date), 'dd MMM yyyy')}
          </span>
          <span className="text-xs text-gray-500">
            {formatDistanceToNow(new Date(date), { addSuffix: true })}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: 'createdAt',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Created" />
    ),
    cell: ({ row }) => {
      const date = new Date(row.getValue('createdAt'));
      return (
        <div className="flex flex-col">
          <span className="text-sm font-medium text-gray-900">
            {format(date, 'dd MMM yyyy')}
          </span>
          <span className="text-xs text-gray-500">
            {formatDistanceToNow(date, { addSuffix: true })}
          </span>
        </div>
      );
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => <SubscriptionsTableRowActions row={row} />,
  },
];