'use client';

import { Row } from '@tanstack/react-table';
import { MoreHorizontal, Pencil, Trash2, Eye, Copy, Award, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Partner } from '@/types/partner.types';
import { useState } from 'react';
import { PartnerDetailsDialog } from './partner-details-dialog';
import { DeletePartnerDialog } from './delete-partner-dialog';
import { useRouter } from 'next/navigation';

interface PartnersTableRowActionsProps {
  row: Row<Partner>;
}

export function PartnersTableRowActions({ row }: PartnersTableRowActionsProps) {
  const partner = row.original;
  const router = useRouter();
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const handleEdit = () => {
    router.push(`/admin/partners/${partner.id}/edit`);
  };

  const handleCopyLink = () => {
    const link = `${window.location.origin}/partners/${partner.slug}`;
    navigator.clipboard.writeText(link);
  };

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
          
          <DropdownMenuItem onClick={handleEdit}>
            <Pencil className="mr-2 h-4 w-4" />
            Edit Partner
          </DropdownMenuItem>
          
          <DropdownMenuItem onClick={handleCopyLink}>
            <Copy className="mr-2 h-4 w-4" />
            Copy Link
          </DropdownMenuItem>
          
          <DropdownMenuSeparator />
          
          <DropdownMenuItem 
            onClick={() => setShowDeleteDialog(true)}
            className="text-red-600 focus:text-red-600"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete Partner
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <PartnerDetailsDialog
        partner={partner}
        open={showDetailsDialog}
        onOpenChange={setShowDetailsDialog}
      />
      
      <DeletePartnerDialog
        partner={partner}
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
      />
    </>
  );
}