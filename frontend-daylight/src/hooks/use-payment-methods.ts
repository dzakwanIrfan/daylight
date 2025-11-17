'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { paymentMethodService } from '@/services/payment-method.service';
import { BulkActionPayload, QueryPaymentMethodsParams, UpdatePaymentMethodPayload } from '@/types/payment-method.types';
import { toast } from 'sonner';

export function usePaymentMethods(params: QueryPaymentMethodsParams = {}) {
  return useQuery({
    queryKey: ['payment-methods', params],
    queryFn: () => paymentMethodService.getPaymentMethods(params),
    staleTime: 30 * 1000, // 30 seconds
    refetchOnWindowFocus: false,
  });
}

export function usePaymentMethodGroups() {
  return useQuery({
    queryKey: ['payment-method-groups'],
    queryFn: () => paymentMethodService.getUniqueGroups(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });
}

export function usePaymentMethodMutations() {
  const queryClient = useQueryClient();

  const updatePaymentMethod = useMutation({
    mutationFn: ({ code, data }: { code: string; data: UpdatePaymentMethodPayload }) =>
      paymentMethodService.updatePaymentMethod(code, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['payment-methods'] });
      toast.success(data.message || 'Payment method updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update payment method');
    },
  });

  const togglePaymentMethod = useMutation({
    mutationFn: (code: string) => paymentMethodService.togglePaymentMethod(code),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['payment-methods'] });
      toast.success(data.message || 'Payment method status updated');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update payment method status');
    },
  });

  const bulkAction = useMutation({
    mutationFn: (payload: BulkActionPayload) => paymentMethodService.bulkAction(payload),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['payment-methods'] });
      toast.success(data.message || 'Bulk action completed successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to perform bulk action');
    },
  });

  const syncWithTripay = useMutation({
    mutationFn: (data: any[]) => paymentMethodService.syncWithTripay(data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['payment-methods'] });
      toast.success(data.message || 'Sync completed successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to sync with Tripay');
    },
  });

  return {
    updatePaymentMethod,
    togglePaymentMethod,
    bulkAction,
    syncWithTripay,
  };
}