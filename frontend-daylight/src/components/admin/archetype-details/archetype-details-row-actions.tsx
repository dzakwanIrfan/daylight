'use client';

import { Row } from '@tanstack/react-table';
import { MoreHorizontal, Pencil, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { AdminArchetypeDetail } from '@/types/admin-archetype-detail.types';
import { useState } from 'react';
import { ArchetypeDetailDetailsDialog } from './archetype-detail-details-dialog';
import { EditArchetypeDetailDialog } from './edit-archetype-detail-dialog';

interface ArchetypeDetailsTableRowActionsProps {
  row: Row<AdminArchetypeDetail>;
}

export function ArchetypeDetailsTableRowActions({ row }: ArchetypeDetailsTableRowActionsProps) {
  const archetypeDetail = row.original;
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);

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
        <DropdownMenuContent align="end" className="w-[200px] bg-white">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuSeparator />
          
          <DropdownMenuItem onClick={() => setShowDetailsDialog(true)}>
            <Eye className="mr-2 h-4 w-4" />
            View Details
          </DropdownMenuItem>
          
          <DropdownMenuItem onClick={() => setShowEditDialog(true)}>
            <Pencil className="mr-2 h-4 w-4" />
            Edit
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <ArchetypeDetailDetailsDialog
        archetypeDetail={archetypeDetail}
        open={showDetailsDialog}
        onOpenChange={setShowDetailsDialog}
      />

      <EditArchetypeDetailDialog
        archetypeDetail={archetypeDetail}
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
      />
    </>
  );
}