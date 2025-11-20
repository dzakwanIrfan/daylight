'use client';

import { ColumnDef } from '@tanstack/react-table';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { DataTableColumnHeader } from '@/components/data-table/data-table-column-header';
import { PaymentMethod, PaymentChannelType } from '@/types/payment-method.types';
import { formatDistanceToNow } from 'date-fns';
import { PaymentMethodsTableRowActions } from './payment-methods-table-row-actions';
import Image from 'next/image';

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
          <div className="relative w-10 h-10 rounded-lg overflow-hidden border border-gray-200 shrink-0">
            <Image
              src={method.iconUrl}
              alt={method.name}
              fill
              className="object-contain p-1"
            />
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
    accessorKey: 'group',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Group" />
    ),
    cell: ({ row }) => {
      const group = row.getValue('group') as string;
      return (
        <Badge variant="outline" className="font-medium">
          {group}
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
      const type = row.getValue('type') as PaymentChannelType;
      return (
        <Badge 
          variant={type === PaymentChannelType.DIRECT ? 'default' : 'secondary'}
          className="font-medium"
        >
          {type}
        </Badge>
      );
    },
    filterFn: (row, id, value) => {
      return Array.isArray(value) && value.includes(row.getValue(id));
    },
  },
  {
    accessorKey: 'fees',
    header: 'Fees',
    cell: ({ row }) => {
      const method = row.original;
      return (
        <div className="flex flex-col text-sm">
          <span className="text-gray-900">
            M: {method.feeMerchantFlat.toLocaleString('id-ID')} + {method.feeMerchantPercent}%
          </span>
          <span className="text-gray-600">
            C: {method.feeCustomerFlat.toLocaleString('id-ID')} + {method.feeCustomerPercent}%
          </span>
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
            Min: Rp {method.minimumAmount.toLocaleString('id-ID')}
          </span>
          <span className="text-gray-600">
            Max: Rp {method.maximumAmount.toLocaleString('id-ID')}
          </span>
        </div>
      );
    },
    enableSorting: false,
  },
  {
    accessorKey: 'sortOrder',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Order" />
    ),
    cell: ({ row }) => {
      return (
        <span className="text-sm font-medium text-gray-900">
          {row.getValue('sortOrder')}
        </span>
      );
    },
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
          className="font-medium"
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