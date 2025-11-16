'use client';

import { ColumnDef } from '@tanstack/react-table';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DataTableColumnHeader } from '@/components/data-table/data-table-column-header';
import { EventParticipant } from '@/types/participant.types';
import { PaymentStatus } from '@/types/event.types';
import { format } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';
import { ParticipantTableRowActions } from './participant-table-row-actions';
import { CheckCircle2, XCircle, Clock, Ban } from 'lucide-react';

const statusConfig: Record<
  PaymentStatus,
  { color: string; icon: React.ComponentType<any> }
> = {
  PAID: { color: 'bg-green-100 text-green-800 border-green-200', icon: CheckCircle2 },
  PENDING: { color: 'bg-orange-100 text-orange-800 border-orange-200', icon: Clock },
  FAILED: { color: 'bg-red-100 text-red-800 border-red-200', icon: XCircle },
  EXPIRED: { color: 'bg-gray-100 text-gray-800 border-gray-200', icon: Ban },
  REFUNDED: { color: 'bg-blue-100 text-blue-800 border-blue-200', icon: XCircle },
};

export const participantsColumns: ColumnDef<EventParticipant>[] = [
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
    accessorKey: 'customerName',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Participant" />
    ),
    cell: ({ row }) => {
      const user = row.original.user;
      const profilePicture = user.profilePicture;
      const initials =
        `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`.toUpperCase() ||
        user.email[0].toUpperCase();

      return (
        <div className="flex items-center gap-3 min-w-0">
          <Avatar className="h-9 w-9 shrink-0">
            {profilePicture ? (
              <AvatarImage 
                src={profilePicture} 
                alt={user.email}
                crossOrigin='anonymous'
                referrerPolicy='no-referrer'
                onError={(e) => {
                  // Hide image if failed to load
                  e.currentTarget.style.display = 'none';
                }}
              />
            ) : null}
            <AvatarFallback className="bg-brand/10 text-brand text-xs font-medium">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col min-w-0 flex-1">
            <span className="font-medium text-gray-900 truncate">
              {user.firstName && user.lastName
                ? `${user.firstName} ${user.lastName}`
                : row.original.customerName}
            </span>
            <span className="text-xs text-gray-500 truncate">{user.email}</span>
          </div>
        </div>
      );
    },
    enableSorting: true,
    enableHiding: false,
  },
  {
    accessorKey: 'customerPhone',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Phone" />
    ),
    cell: ({ row }) => {
      const phone = row.original.customerPhone || row.original.user.phoneNumber;
      return (
        <span className="text-sm text-gray-900">{phone || '-'}</span>
      );
    },
  },
  {
    accessorKey: 'quantity',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Qty" />
    ),
    cell: ({ row }) => {
      return (
        <span className="font-medium text-gray-900">{row.original.quantity}</span>
      );
    },
  },
  {
    accessorKey: 'amount',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Amount" />
    ),
    cell: ({ row }) => {
      return (
        <div className="flex flex-col">
          <span className="font-medium text-gray-900">
            IDR {row.original.amountReceived.toLocaleString('id-ID')}
          </span>
          <span className="text-xs text-gray-500">
            Base: IDR {row.original.amount.toLocaleString('id-ID')}
          </span>
        </div>
      );
    },
    enableSorting: true,
  },
  {
    accessorKey: 'paymentMethod',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Payment" />
    ),
    cell: ({ row }) => {
      return (
        <div className="flex flex-col">
          <span className="text-sm font-medium text-gray-900">
            {row.original.paymentName}
          </span>
          <span className="text-xs text-gray-500">{row.original.paymentMethod}</span>
        </div>
      );
    },
  },
  {
    accessorKey: 'paymentStatus',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status" />
    ),
    cell: ({ row }) => {
      const status = row.getValue('paymentStatus') as PaymentStatus;
      const config = statusConfig[status];
      const Icon = config.icon;

      return (
        <Badge variant="outline" className={config.color}>
          <Icon className="mr-1 h-3 w-3" />
          {status}
        </Badge>
      );
    },
    filterFn: (row, id, value) => {
      return Array.isArray(value) && value.includes(row.getValue(id));
    },
  },
  {
    accessorKey: 'paidAt',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Paid At" />
    ),
    cell: ({ row }) => {
      const paidAt = row.original.paidAt;
      if (!paidAt) return <span className="text-xs text-gray-400">-</span>;

      return (
        <span className="text-sm text-gray-900">
          {format(new Date(paidAt), 'dd MMM yyyy HH:mm', { locale: idLocale })}
        </span>
      );
    },
    enableSorting: true,
  },
  {
    id: 'actions',
    cell: ({ row }) => <ParticipantTableRowActions row={row} />,
  },
];