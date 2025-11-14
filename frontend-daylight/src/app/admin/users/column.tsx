'use client';

import { ColumnDef } from '@tanstack/react-table';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { DataTableColumnHeader } from '@/components/data-table/data-table-column-header';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, Pencil, Trash } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export type User = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'USER' | 'ADMIN';
  isEmailVerified: boolean;
  createdAt: string;
};

export const columns: ColumnDef<User>[] = [
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
    accessorKey: 'email',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Email" />
    ),
    cell: ({ row }) => <div className="w-80">{row.getValue('email')}</div>,
    enableSorting: true,
    enableHiding: true,
  },
  {
    accessorKey: 'firstName',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="First Name" />
    ),
    cell: ({ row }) => {
      return (
        <div className="flex space-x-2">
          <span className="max-w-125 truncate font-medium">
            {row.getValue('firstName')}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: 'lastName',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Last Name" />
    ),
    cell: ({ row }) => {
      return (
        <div className="flex space-x-2">
          <span className="max-w-125 truncate font-medium">
            {row.getValue('lastName')}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: 'role',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Role" />
    ),
    cell: ({ row }) => {
      const role = row.getValue('role') as string;
      return (
        <Badge variant={role === 'ADMIN' ? 'default' : 'secondary'}>
          {role}
        </Badge>
      );
    },
    filterFn: (row, id, value) => {
      return Array.isArray(value) && value.includes(row.getValue(id));
    },
  },
  {
    accessorKey: 'isEmailVerified',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Verified" />
    ),
    cell: ({ row }) => {
      const isVerified = row.getValue('isEmailVerified') as boolean;
      return (
        <Badge variant={isVerified ? 'default' : 'destructive'}>
          {isVerified ? 'Yes' : 'No'}
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
      return (
        <div className="flex items-center">
          <span>
            {new Date(row.getValue('createdAt')).toLocaleDateString()}
          </span>
        </div>
      );
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const user = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              aria-label="Open menu"
              variant="ghost"
              className="flex size-8 p-0 data-[state=open]:bg-muted"
            >
              <MoreHorizontal className="size-4" aria-hidden="true" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem>
              <Pencil className="mr-2 size-4" aria-hidden="true" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Trash className="mr-2 size-4" aria-hidden="true" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];