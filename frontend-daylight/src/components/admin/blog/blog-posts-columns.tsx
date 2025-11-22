'use client';

import { ColumnDef } from '@tanstack/react-table';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { DataTableColumnHeader } from '@/components/data-table/data-table-column-header';
import { BlogPost, BlogPostStatus } from '@/types/blog.types';
import { BlogPostsTableRowActions } from './blog-posts-table-row-actions';
import { Eye, Calendar } from 'lucide-react';
import { format } from 'date-fns';

const statusColors: Record<BlogPostStatus, string> = {
  DRAFT: 'bg-gray-100 text-gray-800 border-gray-200',
  PUBLISHED: 'bg-green-100 text-green-800 border-green-200',
  ARCHIVED: 'bg-orange-100 text-orange-800 border-orange-200',
};

export const blogPostsColumns: ColumnDef<BlogPost>[] = [
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
    header: ({ column }) => <DataTableColumnHeader column={column} title="Title" />,
    cell: ({ row }) => {
      const post = row.original;
      return (
        <div className="flex flex-col max-w-[400px]">
          <span className="font-medium text-gray-900 truncate">{post.title}</span>
          {post.excerpt && (
            <span className="text-xs text-gray-500 truncate mt-1">{post.excerpt}</span>
          )}
        </div>
      );
    },
    enableSorting: true,
    enableHiding: false,
  },
  {
    accessorKey: 'categoryId',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Category" />,
    cell: ({ row }) => {
      const category = row.original.category;
      return category ? (
        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
          {category.name}
        </Badge>
      ) : (
        <span className="text-xs text-gray-400">No category</span>
      );
    },
  },
  {
    accessorKey: 'author',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Author" />,
    cell: ({ row }) => {
      const author = row.original.author;
      const name = `${author.firstName || ''} ${author.lastName || ''}`.trim() || 'Unknown';
      return <span className="text-sm text-gray-900">{name}</span>;
    },
  },
  {
    accessorKey: 'status',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
    cell: ({ row }) => {
      const status = row.getValue('status') as BlogPostStatus;
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
    accessorKey: 'viewCount',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Views" />,
    cell: ({ row }) => {
      const views = row.getValue('viewCount') as number;
      return (
        <div className="flex items-center gap-2">
          <Eye className="h-4 w-4 text-gray-400" />
          <span className="text-sm text-gray-900">{views.toLocaleString()}</span>
        </div>
      );
    },
    enableSorting: true,
  },
  {
    accessorKey: 'publishedAt',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Published" />,
    cell: ({ row }) => {
      const publishedAt = row.getValue('publishedAt') as string | undefined;
      return publishedAt ? (
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-gray-400" />
          <span className="text-sm text-gray-900">
            {format(new Date(publishedAt), 'dd MMM yyyy')}
          </span>
        </div>
      ) : (
        <span className="text-xs text-gray-400">Not published</span>
      );
    },
    enableSorting: true,
  },
  {
    id: 'actions',
    cell: ({ row }) => <BlogPostsTableRowActions row={row} />,
  },
];