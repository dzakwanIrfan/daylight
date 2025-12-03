"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import type { SubscriptionPlan } from "@/types/subscription.types";
import { SubscriptionPlanType } from "@/types/subscription.types";
import { formatDistanceToNow } from "date-fns";
import { PlansTableRowActions } from "./plans-table-row-actions";
import { DollarSign } from "lucide-react";

export const columns: ColumnDef<SubscriptionPlan>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
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
    accessorKey: "name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Plan Name" />
    ),
    cell: ({ row }) => {
      const plan = row.original;
      return (
        <div className="flex flex-col">
          <span className="font-medium text-gray-900">{plan.name}</span>
          {plan.description && (
            <span className="text-sm text-gray-500 line-clamp-1">
              {plan.description}
            </span>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "type",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Type" />
    ),
    cell: ({ row }) => {
      const type = row.getValue("type") as SubscriptionPlanType;
      return (
        <Badge variant="outline" className="font-medium">
          {type}
        </Badge>
      );
    },
    filterFn: (row, id, value) => {
      return Array.isArray(value) && value.includes(row.getValue(id));
    },
  },
  {
    id: "pricing",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Pricing" />
    ),
    cell: ({ row }) => {
      const plan = row.original;
      const prices = plan.prices || [];
      const activePrices = prices.filter((p) => p.isActive);

      return (
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-1">
            <DollarSign className="h-3 w-3 text-gray-400" />
            <span className="text-xs text-gray-600">
              {activePrices.length} active price(s)
            </span>
          </div>
          <div className="flex flex-wrap gap-1">
            {activePrices.slice(0, 3).map((price) => (
              <Badge
                key={price.id}
                variant="secondary"
                className="text-xs font-mono"
              >
                {price.currency} {price.amount.toLocaleString()}
              </Badge>
            ))}
            {activePrices.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{activePrices.length - 3}
              </Badge>
            )}
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "durationInMonths",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Duration" />
    ),
    cell: ({ row }) => {
      const duration = row.getValue("durationInMonths") as number;
      return (
        <span className="font-medium text-gray-900">
          {duration} month{duration > 1 ? "s" : ""}
        </span>
      );
    },
  },
  {
    accessorKey: "features",
    header: "Features",
    cell: ({ row }) => {
      const features = row.getValue("features") as string[];
      return (
        <div className="flex flex-wrap gap-1">
          {features.slice(0, 2).map((feature, idx) => (
            <Badge key={idx} variant="secondary" className="text-xs">
              {feature}
            </Badge>
          ))}
          {features.length > 2 && (
            <Badge variant="secondary" className="text-xs">
              +{features.length - 2} more
            </Badge>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "isActive",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status" />
    ),
    cell: ({ row }) => {
      const isActive = row.getValue("isActive") as boolean;
      return (
        <Badge
          variant={isActive ? "default" : "secondary"}
          className="font-medium"
        >
          {isActive ? "Active" : "Inactive"}
        </Badge>
      );
    },
    filterFn: (row, id, value) => {
      return Array.isArray(value) && value.includes(row.getValue(id));
    },
  },
  {
    accessorKey: "sortOrder",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Order" />
    ),
    cell: ({ row }) => {
      return (
        <span className="text-sm font-medium text-gray-600">
          {row.getValue("sortOrder")}
        </span>
      );
    },
  },
  {
    accessorKey: "createdAt",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Created" />
    ),
    cell: ({ row }) => {
      const date = new Date(row.getValue("createdAt"));
      return (
        <div className="flex flex-col">
          <span className="text-sm font-medium text-gray-900">
            {date.toLocaleDateString("id-ID", {
              day: "2-digit",
              month: "short",
              year: "numeric",
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
    id: "actions",
    cell: ({ row }) => <PlansTableRowActions row={row} />,
  },
];
