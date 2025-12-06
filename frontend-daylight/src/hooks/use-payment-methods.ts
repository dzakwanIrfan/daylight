'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { paymentMethodService } from '@/services/payment-method.service';
import {
  BulkActionPayload,
  CreatePaymentMethodPayload,
  QueryPaymentMethodsParams,
  UpdatePaymentMethodPayload,
} from '@/types/payment-method.types';
import { toast } from 'sonner';

// QUERY HOOKS

export function usePaymentMethods(params: QueryPaymentMethodsParams = {}) {
  return useQuery({
    queryKey: ['payment-methods', params],
    queryFn: () => paymentMethodService.getPaymentMethods(params),
    staleTime: 30 * 1000, // 30 seconds
    refetchOnWindowFocus: false,
  });
}

export function usePaymentMethodStatistics() {
  return useQuery({
    queryKey: ['payment-methods-statistics'],
    queryFn: () => paymentMethodService.getStatistics(),
    staleTime: 60 * 1000, // 1 minute
    refetchOnWindowFocus: false,
  });
}

export function useAvailableCountries() {
  return useQuery({
    queryKey: ['payment-method-countries'],
    queryFn: () => paymentMethodService.getAvailableCountries(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });
}

export function useAvailableCurrencies() {
  return useQuery({
    queryKey: ['payment-method-currencies'],
    queryFn: () => paymentMethodService.getAvailableCurrencies(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });
}

export function usePaymentMethodTypes() {
  return useQuery({
    queryKey: ['payment-method-types'],
    queryFn: () => paymentMethodService.getPaymentMethodTypes(),
    staleTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
  });
}

export function usePaymentMethodsByCountry(countryCode: string) {
  return useQuery({
    queryKey: ['payment-methods-country', countryCode],
    queryFn: () => paymentMethodService.getPaymentMethodsByCountry(countryCode),
    enabled: !!countryCode,
    staleTime: 60 * 1000, // 1 minute
    refetchOnWindowFocus: false,
  });
}

export function useActivePaymentMethods(countryCode?: string, currency?: string) {
  return useQuery({
    queryKey: ['payment-methods-active', countryCode, currency],
    queryFn: () => paymentMethodService.getActivePaymentMethods(countryCode, currency),
    staleTime: 60 * 1000, // 1 minute
    refetchOnWindowFocus: false,
  });
}

export function useCalculateFee(code: string, amount: number) {
  return useQuery({
    queryKey: ['payment-method-fee', code, amount],
    queryFn: () => paymentMethodService.calculateFee(code, amount),
    enabled: !!code && amount > 0,
    staleTime: 30 * 1000, // 30 seconds
    refetchOnWindowFocus: false,
  });
}

// MUTATION HOOKS

export function usePaymentMethodMutations() {
  const queryClient = useQueryClient();

  const createPaymentMethod = useMutation({
    mutationFn: (data: CreatePaymentMethodPayload) =>
      paymentMethodService.createPaymentMethod(data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['payment-methods'] });
      queryClient.invalidateQueries({ queryKey: ['payment-methods-statistics'] });
      queryClient.invalidateQueries({ queryKey: ['payment-method-countries'] });
      queryClient.invalidateQueries({ queryKey: ['payment-method-currencies'] });
      toast.success(data.message || 'Payment method created successfully');
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message || 'Failed to create payment method'
      );
    },
  });

  const updatePaymentMethod = useMutation({
    mutationFn: ({ code, data }: { code: string; data: UpdatePaymentMethodPayload }) =>
      paymentMethodService.updatePaymentMethod(code, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['payment-methods'] });
      queryClient.invalidateQueries({ queryKey: ['payment-methods-statistics'] });
      toast.success(data.message || 'Payment method updated successfully');
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message || 'Failed to update payment method'
      );
    },
  });

  const togglePaymentMethod = useMutation({
    mutationFn: (code: string) => paymentMethodService.togglePaymentMethod(code),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['payment-methods'] });
      queryClient.invalidateQueries({ queryKey: ['payment-methods-statistics'] });
      queryClient.invalidateQueries({ queryKey: ['payment-methods-active'] });
      toast.success(data.message || 'Payment method status updated');
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message || 'Failed to update payment method status'
      );
    },
  });

  const deletePaymentMethod = useMutation({
    mutationFn: (code: string) => paymentMethodService.deletePaymentMethod(code),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['payment-methods'] });
      queryClient.invalidateQueries({ queryKey: ['payment-methods-statistics'] });
      queryClient.invalidateQueries({ queryKey: ['payment-method-countries'] });
      queryClient.invalidateQueries({ queryKey: ['payment-method-currencies'] });
      toast.success(data.message || 'Payment method deleted successfully');
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message || 'Failed to delete payment method'
      );
    },
  });

  const bulkAction = useMutation({
    mutationFn: (payload: BulkActionPayload) =>
      paymentMethodService.bulkAction(payload),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['payment-methods'] });
      queryClient.invalidateQueries({ queryKey: ['payment-methods-statistics'] });
      queryClient.invalidateQueries({ queryKey: ['payment-methods-active'] });
      toast.success(data.message || 'Bulk action completed successfully');
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message || 'Failed to perform bulk action'
      );
    },
  });

  return {
    createPaymentMethod,
    updatePaymentMethod,
    togglePaymentMethod,
    deletePaymentMethod,
    bulkAction,
  };
}