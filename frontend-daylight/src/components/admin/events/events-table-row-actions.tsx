'use client';

import { Row } from '@tanstack/react-table';
import { MoreHorizontal, Pencil, Trash2, Eye, Copy, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Event } from '@/types/event.types';
import { useState } from 'react';
import { EventDetailsDialog } from './event-details-dialog';
import { DeleteEventDialog } from './delete-event-dialog';
import { useRouter } from 'next/navigation';

interface EventsTableRowActionsProps {
  row: Row<Event>;
}

export function EventsTableRowActions({ row }: EventsTableRowActionsProps) {
  const event = row.original;
  const router = useRouter();
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const handleEdit = () => {
    router.push(`/admin/events/${event.id}/edit`);
  };

  const handleCopyLink = () => {
    const link = `${window.location.origin}/events/${event.slug}`;
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
            Edit Event
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
            Delete Event
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <EventDetailsDialog
        event={event}
        open={showDetailsDialog}
        onOpenChange={setShowDetailsDialog}
      />
      
      <DeleteEventDialog
        event={event}
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
      />
    </>
  );
}