import { useQuery } from '@tanstack/react-query';
import { myEventsService } from '@/services/my-events.service';
import type { QueryTransactionsParams } from '@/types/payment.types';

// Query Keys
export const myEventsKeys = {
  all: ['my-events'] as const,
  myEvents: () => [...myEventsKeys.all, 'upcoming'] as const,
  pastEvents: () => [...myEventsKeys.all, 'past'] as const,
  transactions: (params?: QueryTransactionsParams) => 
    [...myEventsKeys.all, 'transactions', params] as const,
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

// Get My Transactions
export function useMyTransactions(params?: QueryTransactionsParams) {
  return useQuery({
    queryKey: myEventsKeys.transactions(params),
    queryFn: () => myEventsService.getMyTransactions(params),
    staleTime: 30000, // 30 seconds
  });
}