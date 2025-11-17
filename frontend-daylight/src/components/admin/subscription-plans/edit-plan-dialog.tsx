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
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { AdminSubscriptionPlan } from '@/types/admin-subscription.types';
import { useForm, Controller } from 'react-hook-form';
import { Loader2, Plus, X } from 'lucide-react';
import { useAdminPlanMutations } from '@/hooks/use-admin-subscriptions';
import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';

interface EditPlanDialogProps {
  plan: AdminSubscriptionPlan;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface EditPlanFormData {
  name: string;
  description: string;
  price: number;
  features: string[];
  isActive: boolean;
  sortOrder: number;
}

export function EditPlanDialog({
  plan,
  open,
  onOpenChange,
}: EditPlanDialogProps) {
  const { updatePlan } = useAdminPlanMutations();
  const [featureInput, setFeatureInput] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
    watch,
    setValue,
    reset,
  } = useForm<EditPlanFormData>({
    defaultValues: {
      name: plan.name,
      description: plan.description || '',
      price: plan.price,
      features: plan.features || [],
      isActive: plan.isActive,
      sortOrder: plan.sortOrder,
    },
  });

  const features = watch('features');

  // Reset form when plan changes or dialog opens
  useEffect(() => {
    if (open) {
      reset({
        name: plan.name,
        description: plan.description || '',
        price: plan.price,
        features: plan.features || [],
        isActive: plan.isActive,
        sortOrder: plan.sortOrder,
      });
      setFeatureInput('');
    }
  }, [plan, open, reset]);

  // Close dialog on success
  useEffect(() => {
    if (updatePlan.isSuccess) {
      onOpenChange(false);
    }
  }, [updatePlan.isSuccess, onOpenChange]);

  const onSubmit = async (data: EditPlanFormData) => {
    updatePlan.mutate({ id: plan.id, data });
  };

  const addFeature = () => {
    if (featureInput.trim()) {
      setValue('features', [...features, featureInput.trim()]);
      setFeatureInput('');
    }
  };

  const removeFeature = (index: number) => {
    setValue(
      'features',
      features.filter((_, i) => i !== index)
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] bg-white max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Subscription Plan</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Plan Info (Read-only) */}
          <div className="p-3 bg-gray-50 rounded-lg space-y-1">
            <p className="text-sm font-medium text-gray-600">Plan Type</p>
            <p className="text-sm text-gray-900">
              <Badge variant="outline">{plan.type}</Badge>
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {plan.durationInMonths} month{plan.durationInMonths > 1 ? 's' : ''}{' '}
              duration
            </p>
          </div>

          {/* Plan Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Plan Name *</Label>
            <Input
              id="name"
              placeholder="e.g., 1 Month Premium"
              {...register('name', { required: 'Plan name is required' })}
            />
            {errors.name && (
              <p className="text-xs text-red-600">{errors.name.message}</p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Describe the plan benefits..."
              rows={3}
              {...register('description')}
            />
          </div>

          {/* Price */}
          <div className="space-y-2">
            <Label htmlFor="price">Price *</Label>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-600">
                {plan.currency}
              </span>
              <Input
                id="price"
                type="number"
                min="0"
                step="1000"
                placeholder="150000"
                {...register('price', {
                  required: 'Price is required',
                  min: { value: 0, message: 'Price must be positive' },
                  valueAsNumber: true,
                })}
              />
            </div>
            {errors.price && (
              <p className="text-xs text-red-600">{errors.price.message}</p>
            )}
          </div>

          {/* Sort Order */}
          <div className="space-y-2">
            <Label htmlFor="sortOrder">Sort Order</Label>
            <Input
              id="sortOrder"
              type="number"
              min="0"
              placeholder="0"
              {...register('sortOrder', { valueAsNumber: true })}
            />
          </div>

          {/* Features */}
          <div className="space-y-2">
            <Label>Features</Label>
            <div className="flex gap-2">
              <Input
                placeholder="Add a feature..."
                value={featureInput}
                onChange={(e) => setFeatureInput(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addFeature();
                  }
                }}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addFeature}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            {features.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {features.map((feature, index) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="flex items-center gap-1"
                  >
                    {feature}
                    <button
                      type="button"
                      onClick={() => removeFeature(index)}
                      className="ml-1 hover:text-red-600"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Status */}
          <div className="space-y-2">
            <Label htmlFor="isActive">Status</Label>
            <Controller
              name="isActive"
              control={control}
              render={({ field }) => (
                <Select
                  value={field.value ? 'active' : 'inactive'}
                  onValueChange={(value) => field.onChange(value === 'active')}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={updatePlan.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={updatePlan.isPending}
              className="bg-brand hover:bg-brand-dark border border-black text-white font-bold"
            >
              {updatePlan.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Save Changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}