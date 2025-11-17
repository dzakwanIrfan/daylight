'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PaymentMethod, PaymentChannelType } from '@/types/payment-method.types';
import { useForm } from 'react-hook-form';
import { Loader2 } from 'lucide-react';
import { useEffect } from 'react';
import { Separator } from '@/components/ui/separator';
import { usePaymentMethodMutations } from '@/hooks/use-payment-methods';

interface EditPaymentMethodDialogProps {
  method: PaymentMethod;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface EditPaymentMethodFormData {
  name: string;
  group: string;
  type: PaymentChannelType;
  feeMerchantFlat: number;
  feeMerchantPercent: number;
  feeCustomerFlat: number;
  feeCustomerPercent: number;
  minimumFee: number;
  maximumFee: number;
  minimumAmount: number;
  maximumAmount: number;
  iconUrl: string;
  isActive: boolean;
  sortOrder: number;
}

export function EditPaymentMethodDialog({ method, open, onOpenChange }: EditPaymentMethodDialogProps) {
  const { updatePaymentMethod } = usePaymentMethodMutations();
  
  const { register, handleSubmit, formState: { errors }, setValue, watch, reset } = useForm<EditPaymentMethodFormData>({
    defaultValues: {
      name: method.name,
      group: method.group,
      type: method.type,
      feeMerchantFlat: method.feeMerchantFlat,
      feeMerchantPercent: method.feeMerchantPercent,
      feeCustomerFlat: method.feeCustomerFlat,
      feeCustomerPercent: method.feeCustomerPercent,
      minimumFee: method.minimumFee || 0,
      maximumFee: method.maximumFee || 0,
      minimumAmount: method.minimumAmount,
      maximumAmount: method.maximumAmount,
      iconUrl: method.iconUrl,
      isActive: method.isActive,
      sortOrder: method.sortOrder,
    },
  });

  // Reset form when method changes or dialog opens
  useEffect(() => {
    if (open) {
      reset({
        name: method.name,
        group: method.group,
        type: method.type,
        feeMerchantFlat: method.feeMerchantFlat,
        feeMerchantPercent: method.feeMerchantPercent,
        feeCustomerFlat: method.feeCustomerFlat,
        feeCustomerPercent: method.feeCustomerPercent,
        minimumFee: method.minimumFee || 0,
        maximumFee: method.maximumFee || 0,
        minimumAmount: method.minimumAmount,
        maximumAmount: method.maximumAmount,
        iconUrl: method.iconUrl,
        isActive: method.isActive,
        sortOrder: method.sortOrder,
      });
    }
  }, [method, open, reset]);

  // Close dialog on success
  useEffect(() => {
    if (updatePaymentMethod.isSuccess) {
      onOpenChange(false);
    }
  }, [updatePaymentMethod.isSuccess, onOpenChange]);

  const onSubmit = async (data: EditPaymentMethodFormData) => {
    updatePaymentMethod.mutate({
      code: method.code,
      data: {
        name: data.name,
        group: data.group,
        type: data.type,
        feeMerchantFlat: Number(data.feeMerchantFlat),
        feeMerchantPercent: Number(data.feeMerchantPercent),
        feeCustomerFlat: Number(data.feeCustomerFlat),
        feeCustomerPercent: Number(data.feeCustomerPercent),
        minimumFee: data.minimumFee ? Number(data.minimumFee) : undefined,
        maximumFee: data.maximumFee ? Number(data.maximumFee) : undefined,
        minimumAmount: Number(data.minimumAmount),
        maximumAmount: Number(data.maximumAmount),
        iconUrl: data.iconUrl,
        isActive: data.isActive,
        sortOrder: Number(data.sortOrder),
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] bg-white max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Payment Method</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                {...register('name', { required: 'Name is required' })}
              />
              {errors.name && (
                <p className="text-xs text-red-600">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="group">Group</Label>
              <Input
                id="group"
                {...register('group', { required: 'Group is required' })}
              />
              {errors.group && (
                <p className="text-xs text-red-600">{errors.group.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="type">Type</Label>
              <Select
                value={watch('type')}
                onValueChange={(value) => setValue('type', value as PaymentChannelType)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className='bg-white'>
                  <SelectItem value={PaymentChannelType.DIRECT}>DIRECT</SelectItem>
                  <SelectItem value={PaymentChannelType.REDIRECT}>REDIRECT</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="sortOrder">Sort Order</Label>
              <Input
                id="sortOrder"
                type="number"
                {...register('sortOrder', { 
                  required: 'Sort order is required',
                  min: { value: 0, message: 'Must be 0 or greater' }
                })}
              />
              {errors.sortOrder && (
                <p className="text-xs text-red-600">{errors.sortOrder.message}</p>
              )}
            </div>
          </div>

          <Separator className="my-4" />

          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-gray-900">Merchant Fees</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="feeMerchantFlat">Flat (Rp)</Label>
                <Input
                  id="feeMerchantFlat"
                  type="number"
                  step="0.01"
                  {...register('feeMerchantFlat', { 
                    required: 'Required',
                    min: { value: 0, message: 'Must be 0 or greater' }
                  })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="feeMerchantPercent">Percent (%)</Label>
                <Input
                  id="feeMerchantPercent"
                  type="number"
                  step="0.01"
                  {...register('feeMerchantPercent', { 
                    required: 'Required',
                    min: { value: 0, message: 'Must be 0 or greater' }
                  })}
                />
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-gray-900">Customer Fees</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="feeCustomerFlat">Flat (Rp)</Label>
                <Input
                  id="feeCustomerFlat"
                  type="number"
                  step="0.01"
                  {...register('feeCustomerFlat', { 
                    required: 'Required',
                    min: { value: 0, message: 'Must be 0 or greater' }
                  })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="feeCustomerPercent">Percent (%)</Label>
                <Input
                  id="feeCustomerPercent"
                  type="number"
                  step="0.01"
                  {...register('feeCustomerPercent', { 
                    required: 'Required',
                    min: { value: 0, message: 'Must be 0 or greater' }
                  })}
                />
              </div>
            </div>
          </div>

          <Separator className="my-4" />

          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-gray-900">Fee Limits</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="minimumFee">Minimum Fee (Rp)</Label>
                <Input
                  id="minimumFee"
                  type="number"
                  step="0.01"
                  {...register('minimumFee')}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="maximumFee">Maximum Fee (Rp)</Label>
                <Input
                  id="maximumFee"
                  type="number"
                  step="0.01"
                  {...register('maximumFee')}
                />
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-gray-900">Transaction Limits</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="minimumAmount">Minimum Amount (Rp)</Label>
                <Input
                  id="minimumAmount"
                  type="number"
                  step="0.01"
                  {...register('minimumAmount', { 
                    required: 'Required',
                    min: { value: 0, message: 'Must be 0 or greater' }
                  })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="maximumAmount">Maximum Amount (Rp)</Label>
                <Input
                  id="maximumAmount"
                  type="number"
                  step="0.01"
                  {...register('maximumAmount', { 
                    required: 'Required',
                    min: { value: 0, message: 'Must be 0 or greater' }
                  })}
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="iconUrl">Icon URL</Label>
            <Input
              id="iconUrl"
              type="url"
              {...register('iconUrl', { required: 'Icon URL is required' })}
            />
            {errors.iconUrl && (
              <p className="text-xs text-red-600">{errors.iconUrl.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="isActive">Status</Label>
            <Select
              value={watch('isActive') ? 'active' : 'inactive'}
              onValueChange={(value) => setValue('isActive', value === 'active')}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent className='bg-white'>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={updatePaymentMethod.isPending}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={updatePaymentMethod.isPending}
              className='bg-brand hover:bg-brand-dark border border-black text-white font-bold'
            >
              {updatePaymentMethod.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}