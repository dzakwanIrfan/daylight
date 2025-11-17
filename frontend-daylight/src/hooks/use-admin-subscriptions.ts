'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { subscriptionService } from '@/services/subscription.service';
import type {
  QuerySubscriptionsParams,
  BulkSubscriptionActionPayload,
} from '@/types/admin-subscription.types';
import { toast } from 'sonner';

// Query Keys
export const adminSubscriptionKeys = {
  all: ['admin-subscriptions'] as const,
  list: (params: QuerySubscriptionsParams) =>
    [...adminSubscriptionKeys.all, 'list', params] as const,
  stats: () => [...adminSubscriptionKeys.all, 'stats'] as const,
  plans: () => [...adminSubscriptionKeys.all, 'plans'] as const,
};

// Get Admin Subscriptions
export function useAdminSubscriptions(params: QuerySubscriptionsParams = {}) {
  return useQuery({
    queryKey: adminSubscriptionKeys.list(params),
    queryFn: () => subscriptionService.getAdminSubscriptions(params),
    staleTime: 30 * 1000, // 30 seconds
    refetchOnWindowFocus: false,
  });
}

// Get Subscription Stats
export function useSubscriptionStats() {
  return useQuery({
    queryKey: adminSubscriptionKeys.stats(),
    queryFn: () => subscriptionService.getSubscriptionStats(),
    staleTime: 60 * 1000, // 1 minute
    refetchOnWindowFocus: false,
  });
}

// Get All Plans (Admin)
export function useAdminPlans(isActive?: boolean) {
  return useQuery({
    queryKey: [...adminSubscriptionKeys.plans(), isActive],
    queryFn: () => subscriptionService.getAllPlans(isActive),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Bulk Actions
export function useSubscriptionBulkActions() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: BulkSubscriptionActionPayload) =>
      subscriptionService.bulkSubscriptionAction(payload),
    onSuccess: (data) => {
      toast.success(data.message);
      queryClient.invalidateQueries({ queryKey: adminSubscriptionKeys.all });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to perform bulk action');
    },
  });
}

export function useAdminPlanMutations() {
  const queryClient = useQueryClient();

  const createPlan = useMutation({
    mutationFn: (dto: any) => subscriptionService.createPlan(dto),
    onSuccess: (data) => {
      toast.success(data.message);
      queryClient.invalidateQueries({ queryKey: adminSubscriptionKeys.plans() });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to create plan');
    },
  });

  const updatePlan = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      subscriptionService.updatePlan(id, data),
    onSuccess: (data) => {
      toast.success(data.message);
      queryClient.invalidateQueries({ queryKey: adminSubscriptionKeys.plans() });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update plan');
    },
  });

  const deletePlan = useMutation({
    mutationFn: (id: string) => subscriptionService.deletePlan(id),
    onSuccess: (data) => {
      toast.success(data.message);
      queryClient.invalidateQueries({ queryKey: adminSubscriptionKeys.plans() });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to delete plan');
    },
  });

  return { createPlan, updatePlan, deletePlan };
}