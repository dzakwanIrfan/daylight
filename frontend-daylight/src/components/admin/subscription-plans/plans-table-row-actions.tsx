"use client";

import { Row } from "@tanstack/react-table";
import { MoreHorizontal, Pencil, Trash2, Eye, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { SubscriptionPlan } from "@/types/subscription.types";
import { useState } from "react";
import { EditPlanDialog } from "./edit-plan-dialog";
import { DeletePlanDialog } from "./delete-plan-dialog";
import { PlanDetailsDialog } from "./plan-details-dialog";
import { ManagePricesDialog } from "./manage-prices-dialog";

interface PlansTableRowActionsProps {
  row: Row<SubscriptionPlan>;
}

export function PlansTableRowActions({ row }: PlansTableRowActionsProps) {
  const plan = row.original;
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showPricesDialog, setShowPricesDialog] = useState(false);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            aria-label="Open menu"
            variant="ghost"
            className="flex h-8 w-8 p-0 data-[state=open]:bg-muted"
          >
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-[200px] glass-card">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuSeparator />

          <DropdownMenuItem onClick={() => setShowDetailsDialog(true)}>
            <Eye className="mr-2 h-4 w-4" />
            View Details
          </DropdownMenuItem>

          <DropdownMenuItem onClick={() => setShowEditDialog(true)}>
            <Pencil className="mr-2 h-4 w-4" />
            Edit Plan
          </DropdownMenuItem>

          <DropdownMenuItem onClick={() => setShowPricesDialog(true)}>
            <DollarSign className="mr-2 h-4 w-4" />
            Manage Prices
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuItem
            onClick={() => setShowDeleteDialog(true)}
            className="text-red-600 focus:text-red-600"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete Plan
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <PlanDetailsDialog
        plan={plan}
        open={showDetailsDialog}
        onOpenChange={setShowDetailsDialog}
      />

      <EditPlanDialog
        plan={plan}
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
      />

      <ManagePricesDialog
        plan={plan}
        open={showPricesDialog}
        onOpenChange={setShowPricesDialog}
      />

      <DeletePlanDialog
        plan={plan}
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
      />
    </>
  );
}
