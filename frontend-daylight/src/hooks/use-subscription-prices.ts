"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { subscriptionService } from "@/services/subscription.service";
import { toast } from "sonner";
import { adminSubscriptionKeys } from "./use-admin-subscriptions";

export function usePlanPricesMutations() {
  const queryClient = useQueryClient();

  const addPrice = useMutation({
    mutationFn: ({
      planId,
      price,
    }: {
      planId: string;
      price: {
        countryId: string;
        amount: number;
        isActive?: boolean;
      };
    }) => subscriptionService.addPriceToPlan(planId, price),
    onSuccess: (data) => {
      toast.success(data.message);
      queryClient.invalidateQueries({
        queryKey: adminSubscriptionKeys.plans(),
      });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to add price");
    },
  });

  const updatePrice = useMutation({
    mutationFn: ({
      priceId,
      data,
    }: {
      priceId: string;
      data: { amount?: number; isActive?: boolean };
    }) => subscriptionService.updatePrice(priceId, data),
    onSuccess: (data) => {
      toast.success(data.message);
      queryClient.invalidateQueries({
        queryKey: adminSubscriptionKeys.plans(),
      });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to update price");
    },
  });

  const deletePrice = useMutation({
    mutationFn: (priceId: string) => subscriptionService.deletePrice(priceId),
    onSuccess: (data) => {
      toast.success(data.message);
      queryClient.invalidateQueries({
        queryKey: adminSubscriptionKeys.plans(),
      });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to delete price");
    },
  });

  return { addPrice, updatePrice, deletePrice };
}
