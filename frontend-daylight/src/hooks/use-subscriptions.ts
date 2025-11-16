import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { subscriptionService } from '@/services/subscription.service';
import type {
  QueryUserSubscriptionsParams,
  CreateSubscriptionPaymentDto,
} from '@/types/subscription.types';

// Query Keys
export const subscriptionKeys = {
  all: ['subscriptions'] as const,
  plans: () => [...subscriptionKeys.all, 'plans'] as const,
  plan: (id: string) => [...subscriptionKeys.all, 'plan', id] as const,
  myActive: () => [...subscriptionKeys.all, 'my-active'] as const,
  mySubscriptions: (params?: QueryUserSubscriptionsParams) =>
    [...subscriptionKeys.all, 'my-subscriptions', params] as const,
  mySubscription: (id: string) =>
    [...subscriptionKeys.all, 'my-subscription', id] as const,
};

// Get Active Plans
export function useActivePlans() {
  return useQuery({
    queryKey: subscriptionKeys.plans(),
    queryFn: () => subscriptionService.getActivePlans(),
    staleTime: 300000, // 5 minutes
  });
}

// Get Plan by ID
export function usePlanById(planId: string) {
  return useQuery({
    queryKey: subscriptionKeys.plan(planId),
    queryFn: () => subscriptionService.getPlanById(planId),
    enabled: !!planId,
    staleTime: 300000,
  });
}

// Get My Active Subscription
export function useMyActiveSubscription() {
  return useQuery({
    queryKey: subscriptionKeys.myActive(),
    queryFn: () => subscriptionService.getMyActiveSubscription(),
    staleTime: 30000, // 30 seconds
  });
}

// Get My Subscriptions
export function useMySubscriptions(params?: QueryUserSubscriptionsParams) {
  return useQuery({
    queryKey: subscriptionKeys.mySubscriptions(params),
    queryFn: () => subscriptionService.getMySubscriptions(params),
    staleTime: 30000,
  });
}

// Get My Subscription by ID
export function useMySubscriptionById(subscriptionId: string) {
  return useQuery({
    queryKey: subscriptionKeys.mySubscription(subscriptionId),
    queryFn: () => subscriptionService.getMySubscriptionById(subscriptionId),
    enabled: !!subscriptionId,
    staleTime: 30000,
  });
}

// Cancel Subscription
export function useCancelSubscription() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      subscriptionId,
      reason,
    }: {
      subscriptionId: string;
      reason?: string;
    }) => subscriptionService.cancelSubscription(subscriptionId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: subscriptionKeys.myActive() });
      queryClient.invalidateQueries({
        queryKey: subscriptionKeys.mySubscriptions(),
      });
    },
  });
}

// Create Subscription Payment
export function useCreateSubscriptionPayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dto: CreateSubscriptionPaymentDto) =>
      subscriptionService.createSubscriptionPayment(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: subscriptionKeys.myActive() });
      queryClient.invalidateQueries({
        queryKey: subscriptionKeys.mySubscriptions(),
      });
    },
  });
}