'use client';

import { Row } from '@tanstack/react-table';
import { MoreHorizontal, Eye, Copy, Mail, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { EventParticipant } from '@/types/participant.types';
import { useState } from 'react';
import { ParticipantDetailsDialog } from './participant-details-dialog';
import { toast } from 'sonner';

interface ParticipantTableRowActionsProps {
  row: Row<EventParticipant>;
}

export function ParticipantTableRowActions({ row }: ParticipantTableRowActionsProps) {
  const participant = row.original;
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(participant.user.email);
    toast.success('Email copied to clipboard');
  };

  const handleCopyPhone = () => {
    const phone = participant.customerPhone || participant.user.phoneNumber;
    if (phone) {
      navigator.clipboard.writeText(phone);
      toast.success('Phone number copied to clipboard');
    }
  };

  const handleSendEmail = () => {
    window.location.href = `mailto:${participant.user.email}`;
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

          <DropdownMenuItem onClick={handleCopyEmail}>
            <Copy className="mr-2 h-4 w-4" />
            Copy Email
          </DropdownMenuItem>

          {(participant.customerPhone || participant.user.phoneNumber) && (
            <DropdownMenuItem onClick={handleCopyPhone}>
              <Phone className="mr-2 h-4 w-4" />
              Copy Phone
            </DropdownMenuItem>
          )}

          <DropdownMenuSeparator />

          <DropdownMenuItem onClick={handleSendEmail}>
            <Mail className="mr-2 h-4 w-4" />
            Send Email
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <ParticipantDetailsDialog
        participant={participant}
        open={showDetailsDialog}
        onOpenChange={setShowDetailsDialog}
      />
    </>
  );
}