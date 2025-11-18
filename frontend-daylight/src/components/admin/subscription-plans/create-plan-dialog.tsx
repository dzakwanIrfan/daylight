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
import { SubscriptionPlanType } from '@/types/subscription.types';
import { useForm, Controller } from 'react-hook-form';
import { Loader2, Plus, X } from 'lucide-react';
import { useAdminPlanMutations } from '@/hooks/use-admin-subscriptions';
import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';

interface CreatePlanDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface CreatePlanFormData {
  name: string;
  type: SubscriptionPlanType;
  description: string;
  price: number;
  currency: string;
  durationInMonths: number;
  features: string[];
  isActive: boolean;
  sortOrder: number;
}

export function CreatePlanDialog({ open, onOpenChange }: CreatePlanDialogProps) {
  const { createPlan } = useAdminPlanMutations();
  const [featureInput, setFeatureInput] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
    watch,
    setValue,
    reset,
  } = useForm<CreatePlanFormData>({
    defaultValues: {
      name: '',
      type: SubscriptionPlanType.MONTHLY_1,
      description: '',
      price: 0,
      currency: 'IDR',
      durationInMonths: 1,
      features: [],
      isActive: true,
      sortOrder: 0,
    },
  });

  const features = watch('features');

  // Reset form when dialog closes
  useEffect(() => {
    if (!open) {
      reset();
      setFeatureInput('');
    }
  }, [open, reset]);

  // Close dialog on success
  useEffect(() => {
    if (createPlan.isSuccess) {
      onOpenChange(false);
    }
  }, [createPlan.isSuccess, onOpenChange]);

  const onSubmit = async (data: CreatePlanFormData) => {
    createPlan.mutate(data);
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
          <DialogTitle>Create Subscription Plan</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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

          {/* Plan Type */}
          <div className="space-y-2">
            <Label htmlFor="type">Plan Type *</Label>
            <Controller
              name="type"
              control={control}
              rules={{ required: 'Plan type is required' }}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    <SelectItem value={SubscriptionPlanType.MONTHLY_1}>
                      1 Month Plan
                    </SelectItem>
                    <SelectItem value={SubscriptionPlanType.MONTHLY_3}>
                      3 Months Plan
                    </SelectItem>
                    {/* <SelectItem value={SubscriptionPlanType.MONTHLY_6}>
                      6 Months Plan
                    </SelectItem> */}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.type && (
              <p className="text-xs text-red-600">{errors.type.message}</p>
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

          {/* Price and Currency */}
          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-2 space-y-2">
              <Label htmlFor="price">Price *</Label>
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
              {errors.price && (
                <p className="text-xs text-red-600">{errors.price.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="currency">Currency</Label>
              <Input
                id="currency"
                placeholder="IDR"
                {...register('currency')}
                disabled
              />
            </div>
          </div>

          {/* Duration and Sort Order */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="durationInMonths">Duration (Months) *</Label>
              <Input
                id="durationInMonths"
                type="number"
                min="1"
                placeholder="1"
                {...register('durationInMonths', {
                  required: 'Duration is required',
                  min: { value: 1, message: 'Duration must be at least 1' },
                  valueAsNumber: true,
                })}
              />
              {errors.durationInMonths && (
                <p className="text-xs text-red-600">
                  {errors.durationInMonths.message}
                </p>
              )}
            </div>

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
              disabled={createPlan.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createPlan.isPending}
              className="bg-brand hover:bg-brand-dark border border-black text-white font-bold"
            >
              {createPlan.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Create Plan
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}