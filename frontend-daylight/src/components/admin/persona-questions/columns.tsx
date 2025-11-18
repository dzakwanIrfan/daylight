import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { AdminPersonaQuestion } from "@/types/admin-persona-question.types";
import { ColumnDef } from "@tanstack/react-table";
import { PersonaQuestionsTableRowActions } from "./persona-questions-row-actions";

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
        accessorKey: 'order',
        header: ({ column }) => (
            <DataTableColumnHeader title="Order" column={column} />
        ),
        cell: ({ row }) => {
            row.original.order;
            return (
                <span className="font-medium text-gray-900">{row.original.order}</span>
            )
        },
    },
    {
        accessorKey: 'prompt',
        header: ({ column }) => (
            <DataTableColumnHeader title="Question" column={column} />
        ),
        cell: ({ row }) => {
            return (
                <span className="font-medium text-gray-900">{row.original.prompt}</span>
            )
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
        cell: ({ row }) => <PersonaQuestionsTableRowActions row={row} />,
      },
]