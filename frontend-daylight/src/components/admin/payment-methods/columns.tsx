'use client';

import { ColumnDef } from '@tanstack/react-table';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { DataTableColumnHeader } from '@/components/data-table/data-table-column-header';
import { PaymentMethod, PaymentMethodType, PaymentMethodTypeLabels } from '@/types/payment-method.types';
import { formatDistanceToNow } from 'date-fns';
import { PaymentMethodsTableRowActions } from './payment-methods-table-row-actions';
import { formatCurrency } from '@/lib/utils';
import Image from 'next/image';
import { Globe, CreditCard } from 'lucide-react';

// Type badge color mapping
const typeBadgeColors: Record<PaymentMethodType, string> = {
  [PaymentMethodType.BANK_TRANSFER]: 'bg-blue-100 text-blue-800 border-blue-200',
  [PaymentMethodType.CARDS]: 'bg-purple-100 text-purple-800 border-purple-200',
  [PaymentMethodType.EWALLET]: 'bg-green-100 text-green-800 border-green-200',
  [PaymentMethodType.ONLINE_BANKING]: 'bg-indigo-100 text-indigo-800 border-indigo-200',
  [PaymentMethodType.OVER_THE_COUNTER]: 'bg-orange-100 text-orange-800 border-orange-200',
  [PaymentMethodType.PAYLATER]: 'bg-pink-100 text-pink-800 border-pink-200',
  [PaymentMethodType.QR_CODE]: 'bg-cyan-100 text-cyan-800 border-cyan-200',
  [PaymentMethodType.SUBSCRIPTION]: 'bg-yellow-100 text-yellow-800 border-yellow-200',
};

export const columns: ColumnDef<PaymentMethod>[] = [
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
    accessorKey: 'name',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Payment Method" />
    ),
    cell: ({ row }) => {
      const method = row.original;

      return (
        <div className="flex items-center gap-3">
          <div className="relative w-10 h-10 rounded-lg overflow-hidden border border-gray-200 shrink-0 bg-white">
            {method.logoUrl ? (
              <Image
                src={method.logoUrl}
                alt={method.name}
                fill
                className="object-contain p-1"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-100">
                <CreditCard className="w-5 h-5 text-gray-400" />
              </div>
            )}
          </div>
          <div className="flex flex-col min-w-0">
            <span className="font-medium text-gray-900 truncate">
              {method.name}
            </span>
            <span className="text-sm text-gray-500 truncate">{method.code}</span>
          </div>
        </div>
      );
    },
    enableSorting: true,
    enableHiding: false,
  },
  {
    accessorKey: 'countryCode',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Country" />
    ),
    cell: ({ row }) => {
      const method = row.original;
      return (
        <div className="flex items-center gap-2">
          <Globe className="w-4 h-4 text-gray-400" />
          <div className="flex flex-col">
            <span className="font-medium text-gray-900">
              {method.countryCode}
            </span>
            {method.country && (
              <span className="text-xs text-gray-500">{method.country.name}</span>
            )}
          </div>
        </div>
      );
    },
    filterFn: (row, id, value) => {
      return Array.isArray(value) && value.includes(row.getValue(id));
    },
  },
  {
    accessorKey: 'currency',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Currency" />
    ),
    cell: ({ row }) => {
      const currency = row.getValue('currency') as string;
      return (
        <Badge variant="outline" className="font-mono font-medium">
          {currency}
        </Badge>
      );
    },
    filterFn: (row, id, value) => {
      return Array.isArray(value) && value.includes(row.getValue(id));
    },
  },
  {
    accessorKey: 'type',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Type" />
    ),
    cell: ({ row }) => {
      const type = row.getValue('type') as PaymentMethodType;
      const label = PaymentMethodTypeLabels[type] || type;
      const colorClass = typeBadgeColors[type] || 'bg-gray-100 text-gray-800';

      return (
        <Badge variant="outline" className={`font-medium ${colorClass}`}>
          {label}
        </Badge>
      );
    },
    filterFn: (row, id, value) => {
      return Array.isArray(value) && value.includes(row.getValue(id));
    },
  },
  {
    accessorKey: 'fees',
    header: 'Admin Fee',
    cell: ({ row }) => {
      const method = row.original;
      const hasPercentFee = method.adminFeeRate > 0;
      const hasFixedFee = method.adminFeeFixed > 0;

      return (
        <div className="flex flex-col text-sm">
          {hasPercentFee && (
            <span className="text-gray-900">
              {method.adminFeeRatePercent.toFixed(2)}%
            </span>
          )}
          {hasFixedFee && (
            <span className="text-gray-600">
              + {formatCurrency(method.adminFeeFixed, method.currency)}
            </span>
          )}
          {!hasPercentFee && !hasFixedFee && (
            <span className="text-gray-400">No fee</span>
          )}
        </div>
      );
    },
    enableSorting: false,
  },
  {
    accessorKey: 'limits',
    header: 'Limits',
    cell: ({ row }) => {
      const method = row.original;
      return (
        <div className="flex flex-col text-sm">
          <span className="text-gray-900">
            Min: {formatCurrency(method.minAmount, method.currency)}
          </span>
          <span className="text-gray-600">
            Max: {formatCurrency(method.maxAmount, method.currency)}
          </span>
        </div>
      );
    },
    enableSorting: false,
  },
  {
    accessorKey: 'isActive',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status" />
    ),
    cell: ({ row }) => {
      const isActive = row.getValue('isActive') as boolean;
      return (
        <Badge
          variant={isActive ? 'default' : 'secondary'}
          className={`font-medium ${isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}
        >
          {isActive ? 'Active' : 'Inactive'}
        </Badge>
      );
    },
    filterFn: (row, id, value) => {
      return Array.isArray(value) && value.includes(String(row.getValue(id)));
    },
  },
  {
    accessorKey: 'updatedAt',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Updated" />
    ),
    cell: ({ row }) => {
      const date = new Date(row.getValue('updatedAt'));
      return (
        <div className="flex flex-col">
          <span className="text-sm font-medium text-gray-900">
            {date.toLocaleDateString('id-ID', {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
            })}
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
    cell: ({ row }) => <PaymentMethodsTableRowActions row={row} />,
  },
];