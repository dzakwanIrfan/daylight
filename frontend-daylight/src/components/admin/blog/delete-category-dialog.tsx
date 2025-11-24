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
import { BlogCategory } from '@/types/blog.types';
import { Loader2, AlertTriangle } from 'lucide-react';
import { useBlogMutations } from '@/hooks/use-blog';
import { useEffect } from 'react';

interface DeleteCategoryDialogProps {
  category: BlogCategory;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DeleteCategoryDialog({
  category,
  open,
  onOpenChange,
}: DeleteCategoryDialogProps) {
  const { deleteCategory } = useBlogMutations();

  useEffect(() => {
    if (deleteCategory.isSuccess) {
      onOpenChange(false);
    }
  }, [deleteCategory.isSuccess, onOpenChange]);

  const handleDelete = () => {
    deleteCategory.mutate(category.id);
  };

  const hasExistingPosts = (category._count?.posts || 0) > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] bg-white">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="h-5 w-5" />
            Delete Category
          </DialogTitle>
          <DialogDescription>
            {hasExistingPosts
              ? 'This category has existing posts and cannot be deleted.'
              : 'This action will permanently delete this category and cannot be undone.'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="p-4 bg-red-50 rounded-lg border border-red-200">
            <p className="text-sm font-medium text-gray-900">{category.name}</p>
            {category.description && (
              <p className="text-xs text-gray-600 mt-1">{category.description}</p>
            )}
            <p className="text-xs text-gray-500 mt-2">
              {category._count?.posts || 0} post(s) in this category
            </p>
          </div>

          {hasExistingPosts && (
            <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
              <p className="text-sm text-yellow-800">
                Please remove or reassign all posts from this category before deleting it.
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={deleteCategory.isPending}
          >
            {hasExistingPosts ? 'Close' : 'Cancel'}
          </Button>
          {!hasExistingPosts && (
            <Button
              type="button"
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteCategory.isPending}
            >
              {deleteCategory.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete Category
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}