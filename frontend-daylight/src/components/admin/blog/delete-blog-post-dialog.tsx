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
import { BlogPost } from '@/types/blog.types';
import { Loader2, AlertTriangle } from 'lucide-react';
import { useBlogMutations } from '@/hooks/use-blog';
import { useEffect } from 'react';

interface DeleteBlogPostDialogProps {
  post: BlogPost;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DeleteBlogPostDialog({ post, open, onOpenChange }: DeleteBlogPostDialogProps) {
  const { deletePost } = useBlogMutations();

  useEffect(() => {
    if (deletePost.isSuccess) {
      onOpenChange(false);
    }
  }, [deletePost.isSuccess, onOpenChange]);

  const handleDelete = () => {
    deletePost.mutate(post.id);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] bg-white">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="h-5 w-5" />
            Delete Blog Post
          </DialogTitle>
          <DialogDescription>
            This action will permanently delete this blog post and cannot be undone.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="p-4 bg-red-50 rounded-lg border border-red-200">
            <p className="text-sm font-medium text-gray-900">{post.title}</p>
            {post.excerpt && <p className="text-xs text-gray-600 mt-1">{post.excerpt}</p>}
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={deletePost.isPending}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={deletePost.isPending}
          >
            {deletePost.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Delete Post
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}