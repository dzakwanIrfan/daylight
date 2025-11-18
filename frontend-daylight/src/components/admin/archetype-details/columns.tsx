'use client';

import { ColumnDef } from '@tanstack/react-table';
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { Badge } from "@/components/ui/badge";
import { AdminArchetypeDetail } from "@/types/admin-archetype-detail.types";
import { ArchetypeDetailsTableRowActions } from "./archetype-details-row-actions";
import { formatDistanceToNow } from 'date-fns';

export const columns: ColumnDef<AdminArchetypeDetail>[] = [
    {
        accessorKey: 'symbol',
        header: 'Symbol',
        cell: ({ row }) => {
            return (
                <span className="text-3xl">{row.original.symbol}</span>
            );
        },
        enableSorting: false,
    },
    {
        accessorKey: 'archetype',
        header: ({ column }) => (
            <DataTableColumnHeader title="Archetype" column={column} />
        ),
        cell: ({ row }) => {
            return (
                <Badge variant="outline" className="font-medium">
                    {row.original.archetype.replace(/_/g, ' ')}
                </Badge>
            );
        },
    },
    {
        accessorKey: 'name',
        header: ({ column }) => (
            <DataTableColumnHeader title="Name" column={column} />
        ),
        cell: ({ row }) => {
            return (
                <div className="flex flex-col max-w-md">
                    <span className="font-medium text-gray-900">
                        {row.original.name}
                    </span>
                    <span className="text-xs text-gray-500">
                        {row.original.imageKey}
                    </span>
                </div>
            );
        },
    },
    {
        accessorKey: 'traits',
        header: 'Traits',
        cell: ({ row }) => {
            const traits = row.original.traits;
            return (
                <div className="flex flex-wrap gap-1">
                    {traits.slice(0, 3).map((trait, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                            {trait}
                        </Badge>
                    ))}
                    {traits.length > 3 && (
                        <Badge variant="secondary" className="text-xs">
                            +{traits.length - 3}
                        </Badge>
                    )}
                </div>
            );
        },
        enableSorting: false,
    },
    {
        accessorKey: 'description',
        header: 'Description',
        cell: ({ row }) => {
            const description = row.original.description;
            return (
                <span className="text-sm text-gray-600 line-clamp-2 max-w-md">
                    {description}
                </span>
            );
        },
        enableSorting: false,
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
        cell: ({ row }) => <ArchetypeDetailsTableRowActions row={row} />,
    },
];