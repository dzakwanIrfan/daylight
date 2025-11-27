'use client';

import { ColumnDef } from '@tanstack/react-table';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { DataTableColumnHeader } from '@/components/data-table/data-table-column-header';
import { Event, EventCategory, EventStatus } from '@/types/event.types';
import { EventsTableRowActions } from './events-table-row-actions';
import { Users, MapPin } from 'lucide-react';
import { formatDisplayDate, formatDisplayTime } from '@/lib/timezone';
import { FaCircleCheck } from 'react-icons/fa6';
import { cn } from '@/lib/utils';

const categoryColors: Record<EventCategory, string> = {
  DAYBREAK: 'bg-orange-100 text-orange-800 border-orange-200',
  DAYTRIP: 'bg-blue-100 text-blue-800 border-blue-200',
  DAYCARE: 'bg-green-100 text-green-800 border-green-200',
  // DAYDREAM: 'bg-purple-100 text-purple-800 border-purple-200',
};

const statusColors: Record<EventStatus, string> = {
  DRAFT: 'bg-gray-100 text-gray-800 border-gray-200',
  PUBLISHED: 'bg-green-100 text-green-800 border-green-200',
  CANCELLED: 'bg-red-100 text-red-800 border-red-200',
  COMPLETED: 'bg-blue-100 text-blue-800 border-blue-200',
};

export const columns: ColumnDef<Event>[] = [
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
    accessorKey: 'title',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Event" />
    ),
    cell: ({ row }) => {
      const event = row.original;
      return (
        <div className="flex flex-col max-w-[300px]">
          <span className="font-medium text-gray-900 truncate">{event.title}</span>
          <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
            <MapPin className="h-3 w-3" />
            <div className="flex gap-1 items-center">
              <span className="truncate">{event.venue}</span>
              {event.partner?.isPreferred && (
                <FaCircleCheck className={cn("size-3",
                  event.partner?.type === 'BRAND' ? "text-amber-400"
                  : "text-green-600"
                )} />
              )}
            </div>
          </div>
        </div>
      );
    },
    enableSorting: true,
    enableHiding: false,
  },
  {
    accessorKey: 'category',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Category" />
    ),
    cell: ({ row }) => {
      const category = row.getValue('category') as EventCategory;
      return (
        <Badge variant="outline" className={categoryColors[category]}>
          {category}
        </Badge>
      );
    },
    filterFn: (row, id, value) => {
      return Array.isArray(value) && value.includes(row.getValue(id));
    },
  },
  {
    accessorKey: 'eventDate',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Date & Time" />
    ),
    cell: ({ row }) => {
      const eventDate = row.getValue('eventDate') as string;
      const startTime = row.original.startTime;
      const endTime = row.original.endTime;
      
      return (
        <div className="flex flex-col">
          <span className="font-medium text-gray-900">
            {formatDisplayDate(eventDate, 'dd MMM yyyy')}
          </span>
          <span className="text-xs text-gray-500">
            {formatDisplayTime(startTime)} - {formatDisplayTime(endTime)} WIB
          </span>
        </div>
      );
    },
    enableSorting: true,
  },
  {
    accessorKey: 'city',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="City" />
    ),
    cell: ({ row }) => {
      return (
        <span className="text-sm text-gray-900">{row.getValue('city')}</span>
      );
    },
  },
  {
    accessorKey: 'currentParticipants',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Participants" />
    ),
    cell: ({ row }) => {
      const current = row.original.currentParticipants;
      
      let colorClass = 'text-gray-600';

      return (
        <div className="flex items-center gap-2">
          <Users className={`h-4 w-4 ${colorClass}`} />
          <div className="flex flex-col">
            <span className="font-medium text-gray-900">
              {current}
            </span>
          </div>
        </div>
      );
    },
    enableSorting: true,
  },
  {
    accessorKey: 'price',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Price" />
    ),
    cell: ({ row }) => {
      const price = row.original.price;
      const currency = row.original.currency;
      
      if (price === 0) {
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">FREE</Badge>;
      }

      return (
        <span className="font-medium text-gray-900">
          {currency} {price.toLocaleString('id-ID')}
        </span>
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
      const status = row.getValue('status') as EventStatus;
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
    accessorKey: 'isActive',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Active" />
    ),
    cell: ({ row }) => {
      const isActive = row.getValue('isActive') as boolean;
      return (
        <Badge variant={isActive ? 'default' : 'secondary'}>
          {isActive ? 'Active' : 'Inactive'}
        </Badge>
      );
    },
    filterFn: (row, id, value) => {
      return Array.isArray(value) && value.includes(String(row.getValue(id)));
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => <EventsTableRowActions row={row} />,
  },
];