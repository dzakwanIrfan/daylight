'use client';

import { ColumnDef } from '@tanstack/react-table';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { DataTableColumnHeader } from '@/components/data-table/data-table-column-header';
import { Partner, PartnerType, PartnerStatus } from '@/types/partner.types';
import { PartnersTableRowActions } from './partners-table-row-actions';
import { MapPin, CheckCircle2, Verified } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const typeColors: Record<PartnerType, string> = {
  RESTAURANT: 'bg-orange-100 text-orange-800 border-orange-200',
  ART_GALLERY: 'bg-purple-100 text-purple-800 border-purple-200',
  CAFE: 'bg-amber-100 text-amber-800 border-amber-200',
  BRAND: 'bg-blue-100 text-blue-800 border-blue-200',
  COMMUNITY: 'bg-green-100 text-green-800 border-green-200',
  VENUE: 'bg-pink-100 text-pink-800 border-pink-200',
  SHOP: 'bg-cyan-100 text-cyan-800 border-cyan-200',
};

const statusColors: Record<PartnerStatus, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  ACTIVE: 'bg-green-100 text-green-800 border-green-200',
  INACTIVE: 'bg-gray-100 text-gray-800 border-gray-200',
  REJECTED: 'bg-red-100 text-red-800 border-red-200',
};

export const columns: ColumnDef<Partner>[] = [
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
    header: ({ column }) => <DataTableColumnHeader column={column} title="Partner" />,
    cell: ({ row }) => {
      const partner = row.original;
      return (
        <div className="flex items-center gap-3 max-w-[300px]">
          {partner.logo && (
            // <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-gray-100 shrink-0">
            //   {/* <Image
            //     src={partner.logo}
            //     alt={partner.name}
            //     fill
            //     className="object-cover"
            //     crossOrigin="anonymous"
            //     referrerPolicy="no-referrer"
            //   /> */}
            // </div>
              <Avatar className="relative w-10 h-10 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                <AvatarImage 
                  src={partner.logo}
                  alt={partner.name} 
                  crossOrigin='anonymous'
                  referrerPolicy='no-referrer'
                />
                <AvatarFallback className="bg-brand/10 text-brand text-sm font-medium">
                  {partner.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
          )}
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-medium text-gray-900 truncate">{partner.name}</span>
              {partner.isPreferred && (
                <Verified className="h-4 w-4 text-green-600 shrink-0" />
              )}
            </div>
            <div className="flex items-center gap-1 text-xs text-gray-500 mt-0.5">
              <MapPin className="h-3 w-3" />
              <span className="truncate">{partner.city}</span>
            </div>
          </div>
        </div>
      );
    },
    enableSorting: true,
    enableHiding: false,
  },
  {
    accessorKey: 'type',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Type" />,
    cell: ({ row }) => {
      const type = row.getValue('type') as PartnerType;
      return (
        <Badge variant="outline" className={typeColors[type]}>
          {type.replace('_', ' ')}
        </Badge>
      );
    },
    filterFn: (row, id, value) => {
      return Array.isArray(value) && value.includes(row.getValue(id));
    },
  },
  {
    accessorKey: 'city',
    header: ({ column }) => <DataTableColumnHeader column={column} title="City" />,
    cell: ({ row }) => {
      return <span className="text-sm text-gray-900">{row.getValue('city')}</span>;
    },
  },
  {
    accessorKey: 'totalEvents',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Events" />,
    cell: ({ row }) => {
      const total = row.original.totalEvents;
      return (
        <span className="text-sm font-medium text-gray-900">
          {total}
        </span>
      );
    },
    enableSorting: true,
  },
  {
    accessorKey: 'status',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
    cell: ({ row }) => {
      const status = row.getValue('status') as PartnerStatus;
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
    accessorKey: 'isPreferred',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Preferred" />,
    cell: ({ row }) => {
      const isPreferred = row.getValue('isPreferred') as boolean;
      return isPreferred ? (
        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
          <CheckCircle2 className="h-3 w-3 mr-1" />
          Yes
        </Badge>
      ) : (
        <span className="text-sm text-gray-500">No</span>
      );
    },
    filterFn: (row, id, value) => {
      return Array.isArray(value) && value.includes(String(row.getValue(id)));
    },
  },
  {
    accessorKey: 'isActive',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Active" />,
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
    cell: ({ row }) => <PartnersTableRowActions row={row} />,
  },
];