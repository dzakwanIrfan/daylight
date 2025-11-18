'use client';

import { Row } from '@tanstack/react-table';
import { MoreHorizontal, Pencil, Trash2, Eye, Copy, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useRouter } from 'next/navigation';
import { AdminPersonaQuestion } from '@/types/admin-persona-question.types';

interface PersonaQuestionsTableRowActionsProps {
  row: Row<AdminPersonaQuestion>;
}

export function PersonaQuestionsTableRowActions({ row }: PersonaQuestionsTableRowActionsProps) {
  const event = row.original;
  const router = useRouter();

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
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}