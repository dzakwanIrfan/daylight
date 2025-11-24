'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { BlogTag } from '@/types/blog.types';
import { Loader2, AlertTriangle } from 'lucide-react';
import { useBlogMutations } from '@/hooks/use-blog';
import { useEffect } from 'react';

interface DeleteTagDialogProps {
  tag: BlogTag;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DeleteTagDialog({
  tag,
  open,
  onOpenChange,
}: DeleteTagDialogProps) {
  const { deleteTag } = useBlogMutations();

  useEffect(() => {
    if (deleteTag.isSuccess) {
      onOpenChange(false);
    }
  }, [deleteTag.isSuccess, onOpenChange]);

  const handleDelete = () => {
    deleteTag.mutate(tag.id);
  };

  const hasExistingPosts = (tag._count?.posts || 0) > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] bg-white">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="h-5 w-5" />
            Delete Tag
          </DialogTitle>
          <DialogDescription>
            {hasExistingPosts
              ? 'This tag is used in existing posts and cannot be deleted.'
              : 'This action will permanently delete this tag and cannot be undone.'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="p-4 bg-red-50 rounded-lg border border-red-200">
            <p className="text-sm font-medium text-gray-900">{tag.name}</p>
            <p className="text-xs text-gray-500 mt-2">
              {tag._count?.posts || 0} post(s) with this tag
            </p>
          </div>

          {hasExistingPosts && (
            <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
              <p className="text-sm text-yellow-800">
                Please remove this tag from all posts before deleting it.
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={deleteTag.isPending}
          >
            {hasExistingPosts ? 'Close' : 'Cancel'}
          </Button>
          {!hasExistingPosts && (
            <Button
              type="button"
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteTag.isPending}
            >
              {deleteTag.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete Tag
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}