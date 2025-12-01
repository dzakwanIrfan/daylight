'use client';

import { ColumnDef } from '@tanstack/react-table';
import { DataTableColumnHeader } from '@/components/data-table/data-table-column-header';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { AdminCountry } from '@/types/admin-location.types';
import { CountryTableRowActions } from './country-row-actions';
import { formatDistanceToNow } from 'date-fns';

export const countryColumns: ColumnDef<AdminCountry>[] = [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table. getIsSomePageRowsSelected() && 'indeterminate')
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!! value)}
        aria-label="Select all"
        className="translate-y-0. 5"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row. toggleSelected(!! value)}
        aria-label="Select row"
        className="translate-y-0.5"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'code',
    header: ({ column }) => <DataTableColumnHeader title="Code" column={column} />,
    cell: ({ row }) => {
      return (
        <Badge variant="outline" className="font-mono font-bold text-brand">
          {row.original.code}
        </Badge>
      );
    },
  },
  {
    accessorKey: 'name',
    header: ({ column }) => <DataTableColumnHeader title="Name" column={column} />,
    cell: ({ row }) => {
      return <span className="font-medium text-gray-900">{row.original.name}</span>;
    },
  },
  {
    accessorKey: 'currency',
    header: ({ column }) => <DataTableColumnHeader title="Currency" column={column} />,
    cell: ({ row }) => {
      return (
        <Badge variant="secondary" className="font-mono">
          {row. original.currency}
        </Badge>
      );
    },
  },
  {
    accessorKey: 'phoneCode',
    header: 'Phone Code',
    cell: ({ row }) => {
      return <span className="text-gray-600">{row.original.phoneCode}</span>;
    },
  },
  {
    accessorKey: '_count. cities',
    header: 'Cities',
    cell: ({ row }) => {
      const citiesCount = row. original._count?. cities || 0;
      return (
        <Badge variant="outline" className="font-medium">
          {citiesCount} {citiesCount === 1 ? 'city' : 'cities'}
        </Badge>
      );
    },
    enableSorting: false,
  },
  {
    accessorKey: 'createdAt',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Created" />,
    cell: ({ row }) => {
      const date = new Date(row.getValue('createdAt'));
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
    cell: ({ row }) => <CountryTableRowActions row={row} />,
  },
];