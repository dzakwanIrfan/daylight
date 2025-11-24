'use client';

import { ColumnDef } from '@tanstack/react-table';
import { Checkbox } from '@/components/ui/checkbox';
import { DataTableColumnHeader } from '@/components/data-table/data-table-column-header';
import { BlogTag } from '@/types/blog.types';
import { TagsTableRowActions } from './tags-table-row-actions';
import { FileText } from 'lucide-react';

export const tagsColumns: ColumnDef<BlogTag>[] = [
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
    header: ({ column }) => <DataTableColumnHeader column={column} title="Name" />,
    cell: ({ row }) => {
      const tag = row.original;
      return (
        <div className="flex flex-col max-w-[300px]">
          <span className="font-medium text-gray-900">{tag.name}</span>
          <span className="text-xs text-gray-500">{tag.slug}</span>
        </div>
      );
    },
    enableSorting: true,
    enableHiding: false,
  },
  {
    accessorKey: '_count',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Posts" />,
    cell: ({ row }) => {
      const count = row.original._count?.posts || 0;
      return (
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-gray-400" />
          <span className="text-sm text-gray-900">{count}</span>
        </div>
      );
    },
    enableSorting: true,
  },
  {
    id: 'actions',
    cell: ({ row }) => <TagsTableRowActions row={row} />,
  },
];