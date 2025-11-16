import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { paymentService } from '@/services/payment.service';
import type {
  CreatePaymentDto,
  QueryTransactionsParams,
  Transaction,
} from '@/types/payment.types';

// Query Keys
export const paymentKeys = {
  all: ['payments'] as const,
  channels: () => [...paymentKeys.all, 'channels'] as const,
  transactions: () => [...paymentKeys.all, 'transactions'] as const,
  transaction: (id: string) => [...paymentKeys.all, 'transaction', id] as const,
  transactionsList: (params: QueryTransactionsParams) =>
    [...paymentKeys.transactions(), params] as const,
};

// Get Payment Channels
export function usePaymentChannels() {
  return useQuery({
    queryKey: paymentKeys.channels(),
    queryFn: () => paymentService.getPaymentChannels(),
    staleTime: 300000, // 5 minutes
  });
}

// Calculate Fee
export function useCalculateFee(amount: number, code?: string) {
  return useQuery({
    queryKey: [...paymentKeys.all, 'calculate-fee', amount, code],
    queryFn: () => paymentService.calculateFee(amount, code),
    enabled: amount > 0,
    staleTime: 60000, // 1 minute
  });
}

// Create Payment
export function useCreatePayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreatePaymentDto) => paymentService.createPayment(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: paymentKeys.transactions() });
    },
  });
}

// Get User Transactions
export function useUserTransactions(params: QueryTransactionsParams = {}) {
  return useQuery({
    queryKey: paymentKeys.transactionsList(params),
    queryFn: () => paymentService.getUserTransactions(params),
    staleTime: 30000, // 30 seconds
  });
}

// Get Transaction Detail
export function useTransactionDetail(id: string) {
  return useQuery({
    queryKey: paymentKeys.transaction(id),
    queryFn: () => paymentService.getTransactionDetail(id),
    enabled: !!id,
    refetchInterval: (query) => {
      // Stop refetching if payment is completed or failed
      if (!query.state.data?.data) {
        return false;
      }
      
      const transaction = query.state.data.data as Transaction;
      const status = transaction.paymentStatus;
      
      if (status === 'PAID' || status === 'FAILED' || status === 'EXPIRED') {
        return false;
      }
      return 10000; // 10 seconds for pending payments
    },
  });
}

// Check Payment Status
export function useCheckPaymentStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => paymentService.checkPaymentStatus(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: paymentKeys.transaction(id) });
      queryClient.invalidateQueries({ queryKey: paymentKeys.transactions() });
    },
  });
}