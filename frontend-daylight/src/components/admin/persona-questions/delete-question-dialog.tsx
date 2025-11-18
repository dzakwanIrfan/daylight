'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AdminPersonaQuestion } from '@/types/admin-persona-question.types';
import { Loader2, AlertTriangle } from 'lucide-react';
import { useAdminPersonaQuestionMutations } from '@/hooks/use-admin-persona-questions';
import { useEffect } from 'react';

interface DeleteQuestionDialogProps {
  question: AdminPersonaQuestion;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DeleteQuestionDialog({ question, open, onOpenChange }: DeleteQuestionDialogProps) {
  const { deleteQuestion } = useAdminPersonaQuestionMutations();

  useEffect(() => {
    if (deleteQuestion.isSuccess) {
      onOpenChange(false);
    }
  }, [deleteQuestion.isSuccess, onOpenChange]);

  const handleDelete = () => {
    deleteQuestion.mutate(question.id);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] bg-white">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="h-5 w-5" />
            Delete Question
          </DialogTitle>
          <DialogDescription>
            This action will permanently delete this question and all its options.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="p-4 bg-red-50 rounded-lg border border-red-200">
            <p className="text-sm font-medium text-gray-900">
              Question #{question.questionNumber}
            </p>
            <p className="text-xs text-gray-600 mt-1">{question.prompt}</p>
            <p className="text-xs text-gray-500 mt-2">
              {question.options.length} option(s) will be deleted
            </p>
          </div>

          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-xs text-yellow-800">
              ⚠️ Warning: This action cannot be undone.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={deleteQuestion.isPending}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={deleteQuestion.isPending}
          >
            {deleteQuestion.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Delete Question
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}