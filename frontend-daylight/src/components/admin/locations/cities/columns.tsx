'use client';

import { ColumnDef } from '@tanstack/react-table';
import { DataTableColumnHeader } from '@/components/data-table/data-table-column-header';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { AdminCity } from '@/types/admin-location.types';
import { CityTableRowActions } from './city-row-actions';
import { formatDistanceToNow } from 'date-fns';

export const cityColumns: ColumnDef<AdminCity>[] = [
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
        onCheckedChange={(value) => row. toggleSelected(!!value)}
        aria-label="Select row"
        className="translate-y-0.5"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'name',
    header: ({ column }) => <DataTableColumnHeader title="City" column={column} />,
    cell: ({ row }) => {
      return (
        <div className="flex flex-col">
          <span className="font-medium text-gray-900">{row.original.name}</span>
          <span className="text-xs text-gray-500 font-mono">{row.original.slug}</span>
        </div>
      );
    },
  },
  {
    accessorKey: 'country. name',
    header: ({ column }) => <DataTableColumnHeader title="Country" column={column} />,
    cell: ({ row }) => {
      const country = row.original.country;
      return country ? (
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="font-mono text-xs">
            {country. code}
          </Badge>
          <span className="text-gray-700">{country.name}</span>
        </div>
      ) : (
        <span className="text-gray-400">-</span>
      );
    },
  },
  {
    accessorKey: 'timezone',
    header: 'Timezone',
    cell: ({ row }) => {
      return (
        <Badge variant="secondary" className="font-mono text-xs">
          {row. original.timezone}
        </Badge>
      );
    },
  },
  {
    accessorKey: 'isActive',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
    cell: ({ row }) => {
      const isActive = row. getValue('isActive') as boolean;
      return (
        <Badge variant={isActive ?  'default' : 'secondary'}>
          {isActive ? 'Active' : 'Inactive'}
        </Badge>
      );
    },
    filterFn: (row, id, value) => {
      return Array.isArray(value) && value.includes(String(row.getValue(id)));
    },
  },
  {
    accessorKey: '_count',
    header: 'Usage',
    cell: ({ row }) => {
      const usersCount = row.original._count?.users || 0;
      const eventsCount = row. original._count?.events || 0;
      return (
        <div className="flex gap-2">
          <Badge variant="outline" className="text-xs">
            {usersCount} users
          </Badge>
          <Badge variant="outline" className="text-xs">
            {eventsCount} events
          </Badge>
        </div>
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
    cell: ({ row }) => <CityTableRowActions row={row} />,
  },
];