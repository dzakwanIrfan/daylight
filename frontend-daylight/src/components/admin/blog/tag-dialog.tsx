'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { useBlogMutations } from '@/hooks/use-blog';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { BlogTag, CreateTagInput } from '@/types/blog.types';

interface TagDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tag?: BlogTag | null;
}

export function TagDialog({ open, onOpenChange, tag }: TagDialogProps) {
  const { createTag, updateTag } = useBlogMutations();
  const isEdit = !!tag;

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CreateTagInput>({
    defaultValues: {
      name: tag?.name || '',
    },
  });

  useEffect(() => {
    if (tag) {
      reset({
        name: tag.name,
      });
    } else {
      reset({
        name: '',
      });
    }
  }, [tag, reset]);

  useEffect(() => {
    if (createTag.isSuccess || updateTag.isSuccess) {
      onOpenChange(false);
      reset();
    }
  }, [createTag.isSuccess, updateTag.isSuccess, onOpenChange, reset]);

  const onSubmit = (data: CreateTagInput) => {
    if (isEdit && tag) {
      updateTag.mutate({ id: tag.id, data });
    } else {
      createTag.mutate(data);
    }
  };

  const isPending = createTag.isPending || updateTag.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] bg-white">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit Tag' : 'Create Tag'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Tag Name *</Label>
            <Input
              id="name"
              placeholder="e.g., Technology"
              {...register('name', { required: 'Name is required', minLength: 2 })}
            />
            {errors.name && <p className="text-xs text-red-600">{errors.name.message}</p>}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isPending}
              className="bg-brand hover:bg-brand-dark text-white"
            >
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEdit ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}