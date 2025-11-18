'use client';

import { ColumnDef } from '@tanstack/react-table';
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { AdminPersonaQuestion } from "@/types/admin-persona-question.types";
import { PersonaQuestionsTableRowActions } from "./persona-questions-row-actions";
import { formatDistanceToNow } from 'date-fns';

export const columns: ColumnDef<AdminPersonaQuestion>[] = [
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
        accessorKey: 'questionNumber',
        header: ({ column }) => (
            <DataTableColumnHeader title="No." column={column} />
        ),
        cell: ({ row }) => {
            return (
                <span className="font-bold text-brand">{row.original.questionNumber}</span>
            );
        },
    },
    {
        accessorKey: 'order',
        header: ({ column }) => (
            <DataTableColumnHeader title="Order" column={column} />
        ),
        cell: ({ row }) => {
            return (
                <span className="font-medium text-gray-900">{row.original.order}</span>
            );
        },
    },
    {
        accessorKey: 'prompt',
        header: ({ column }) => (
            <DataTableColumnHeader title="Question" column={column} />
        ),
        cell: ({ row }) => {
            return (
                <div className="flex flex-col max-w-md">
                    <span className="font-medium text-gray-900 truncate">
                        {row.original.prompt}
                    </span>
                    <span className="text-xs text-gray-500">
                        {row.original.section} • {row.original.type}
                    </span>
                </div>
            );
        },
    },
    {
        accessorKey: 'options',
        header: 'Options',
        cell: ({ row }) => {
            const optionsCount = row.original.options.length;
            return (
                <Badge variant="outline" className="font-medium">
                    {optionsCount} option{optionsCount !== 1 ? 's' : ''}
                </Badge>
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
        accessorKey: 'createdAt',
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Created" />
        ),
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
        cell: ({ row }) => <PersonaQuestionsTableRowActions row={row} />,
    },
];