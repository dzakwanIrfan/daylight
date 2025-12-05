import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { myEventsService } from "@/services/my-events.service";
import type { QueryXenditTransactionsParams } from "@/types/xendit.types";

// Query Keys
export const myEventsKeys = {
  all: ["my-events"] as const,
  myEvents: () => [...myEventsKeys.all, "upcoming"] as const,
  pastEvents: () => [...myEventsKeys.all, "past"] as const,
  transactions: (params?: QueryXenditTransactionsParams) =>
    [...myEventsKeys.all, "transactions", params] as const,
  matchingGroup: (eventId: string) =>
    [...myEventsKeys.all, "matching-group", eventId] as const,
};

// Get My Events
export function useMyEvents() {
  return useQuery({
    queryKey: myEventsKeys.myEvents(),
    queryFn: () => myEventsService.getMyEvents(),
    staleTime: 30000, // 30 seconds
  });
}

// Get Past Events
export function usePastEvents() {
  return useQuery({
    queryKey: myEventsKeys.pastEvents(),
    queryFn: () => myEventsService.getPastEvents(),
    staleTime: 60000, // 1 minute
  });
}

// Get My Transactions (Xendit)
export function useMyTransactions(params?: QueryXenditTransactionsParams) {
  return useQuery({
    queryKey: myEventsKeys.transactions(params),
    queryFn: () => myEventsService.getMyTransactions(params),
    staleTime: 30000, // 30 seconds
  });
}

// Get My Matching Group for specific event
export function useMyMatchingGroup(eventId: string, enabled: boolean = true) {
  return useQuery({
    queryKey: myEventsKeys.matchingGroup(eventId),
    queryFn: () => myEventsService.getMyMatchingGroup(eventId),
    enabled: enabled && !!eventId,
    retry: 1, // Only retry once if fails
    staleTime: 60000, // 1 minute
  });
}

// Register Free Event Mutation
export function useRegisterFreeEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      eventId: string;
      customerName: string;
      customerEmail: string;
      customerPhone?: string;
    }) => myEventsService.registerFreeEvent(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: myEventsKeys.myEvents() });
      queryClient.invalidateQueries({ queryKey: myEventsKeys.transactions() });
    },
  });
}
