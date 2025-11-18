'use client';

import { Row } from '@tanstack/react-table';
import { MoreHorizontal, Pencil, Trash2, Eye, Copy } from 'lucide-react';
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
import { useState } from 'react';
import { QuestionDetailsDialog } from './question-details-dialog';
import { DeleteQuestionDialog } from './delete-question-dialog';

interface PersonaQuestionsTableRowActionsProps {
  row: Row<AdminPersonaQuestion>;
}

export function PersonaQuestionsTableRowActions({ row }: PersonaQuestionsTableRowActionsProps) {
  const question = row.original;
  const router = useRouter();
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

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
          
          <DropdownMenuItem onClick={() => router.push(`/admin/persona-questions/${question.id}/edit`)}>
            <Pencil className="mr-2 h-4 w-4" />
            Edit Question
          </DropdownMenuItem>

          <DropdownMenuItem onClick={() => router.push(`/admin/persona-questions/new?duplicate=${question.id}`)}>
            <Copy className="mr-2 h-4 w-4" />
            Duplicate
          </DropdownMenuItem>
          
          <DropdownMenuSeparator />
          
          <DropdownMenuItem 
            onClick={() => setShowDeleteDialog(true)}
            className="text-red-600 focus:text-red-600"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <QuestionDetailsDialog
        question={question}
        open={showDetailsDialog}
        onOpenChange={setShowDetailsDialog}
      />

      <DeleteQuestionDialog
        question={question}
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
      />
    </>
  );
}