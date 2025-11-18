'use client';

import { useForm, useFieldArray } from 'react-hook-form';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Plus, X } from 'lucide-react';
import { AdminArchetypeDetail, UpdateArchetypeDetailPayload } from '@/types/admin-archetype-detail.types';
import { useAdminArchetypeDetailMutations } from '@/hooks/use-admin-archetype-details';
import { useEffect } from 'react';

interface EditArchetypeDetailDialogProps {
  archetypeDetail: AdminArchetypeDetail;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditArchetypeDetailDialog({ archetypeDetail, open, onOpenChange }: EditArchetypeDetailDialogProps) {
  const { updateArchetypeDetail } = useAdminArchetypeDetailMutations();

  const { register, handleSubmit, formState: { errors }, control, reset } = useForm<UpdateArchetypeDetailPayload>({
    defaultValues: {
      symbol: archetypeDetail.symbol,
      name: archetypeDetail.name,
      traits: archetypeDetail.traits,
      description: archetypeDetail.description,
      imageKey: archetypeDetail.imageKey,
    },
  });

  const { fields, append, remove } = useFieldArray<UpdateArchetypeDetailPayload, 'traits'>({
    control,
    name: 'traits' as 'traits',
  });

  useEffect(() => {
    if (updateArchetypeDetail.isSuccess) {
      onOpenChange(false);
    }
  }, [updateArchetypeDetail.isSuccess, onOpenChange]);

  useEffect(() => {
    if (open) {
      reset({
        symbol: archetypeDetail.symbol,
        name: archetypeDetail.name,
        traits: archetypeDetail.traits,
        description: archetypeDetail.description,
        imageKey: archetypeDetail.imageKey,
      });
    }
  }, [open, archetypeDetail, reset]);

  const onSubmit = (data: UpdateArchetypeDetailPayload) => {
    updateArchetypeDetail.mutate({
      id: archetypeDetail.id,
      data: data,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] bg-white max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Archetype Detail</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Symbol */}
          <div className="space-y-2">
            <Label htmlFor="symbol">Symbol (Emoji) *</Label>
            <Input
              id="symbol"
              placeholder="☀️"
              {...register('symbol', { required: 'Symbol is required' })}
            />
            {errors.symbol && (
              <p className="text-xs text-red-600">{errors.symbol.message}</p>
            )}
          </div>

          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Name *</Label>
            <Input
              id="name"
              placeholder="Bright Morning"
              {...register('name', { required: 'Name is required' })}
            />
            {errors.name && (
              <p className="text-xs text-red-600">{errors.name.message}</p>
            )}
          </div>

          {/* Traits */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Traits *</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => append('')}
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Trait
              </Button>
            </div>
            <div className="space-y-2">
              {fields.map((field, index) => (
                <div key={field.id} className="flex items-center gap-2">
                  <Input
                    {...register(`traits.${index}` as const, { required: 'Required' })}
                    placeholder="e.g., Optimistic"
                  />
                  {fields.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => remove(index)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              placeholder="Enter archetype description..."
              rows={4}
              {...register('description', { required: 'Description is required' })}
            />
            {errors.description && (
              <p className="text-xs text-red-600">{errors.description.message}</p>
            )}
          </div>

          {/* Image Key */}
          <div className="space-y-2">
            <Label htmlFor="imageKey">Image Key *</Label>
            <Input
              id="imageKey"
              placeholder="bright-morning"
              {...register('imageKey', { required: 'Image key is required' })}
            />
            {errors.imageKey && (
              <p className="text-xs text-red-600">{errors.imageKey.message}</p>
            )}
            <p className="text-xs text-gray-500">
              Use kebab-case format (e.g., bright-morning)
            </p>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={updateArchetypeDetail.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={updateArchetypeDetail.isPending}
              className="bg-brand hover:bg-brand-dark border border-black text-white font-bold"
            >
              {updateArchetypeDetail.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}