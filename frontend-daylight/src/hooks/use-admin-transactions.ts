import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { transactionService } from '@/services/transaction.service';
import { toast } from 'sonner';
import type {
  QueryTransactionsParams,
  BulkActionTransactionPayload,
} from '@/types/transaction.types';

// Query Keys
export const transactionKeys = {
  all: ['transactions'] as const,
  lists: () => [...transactionKeys.all, 'list'] as const,
  list: (params: QueryTransactionsParams) => [...transactionKeys.lists(), params] as const,
  details: () => [...transactionKeys.all, 'detail'] as const,
  detail: (id: string) => [...transactionKeys.details(), id] as const,
  stats: () => [...transactionKeys.all, 'stats'] as const,
};

// Get Transactions Query
export function useAdminTransactions(params: QueryTransactionsParams = {}) {
  return useQuery({
    queryKey: transactionKeys.list(params),
    queryFn: () => transactionService.getTransactions(params),
    staleTime: 30000, // 30 seconds
  });
}

// Get Transaction by ID Query
export function useAdminTransaction(id: string) {
  return useQuery({
    queryKey: transactionKeys.detail(id),
    queryFn: () => transactionService.getTransactionById(id),
    enabled: !!id,
  });
}

// Get Dashboard Stats Query
export function useTransactionDashboardStats() {
  return useQuery({
    queryKey: transactionKeys.stats(),
    queryFn: () => transactionService.getDashboardStats(),
    staleTime: 60000, // 1 minute
  });
}

// Mutations Hook
export function useAdminTransactionMutations() {
  const queryClient = useQueryClient();

  const updateTransaction = useMutation({
    mutationFn: ({ id, data }: { id: string; data: { status?: string } }) =>
      transactionService.updateTransaction(id, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: transactionKeys.lists() });
      queryClient.invalidateQueries({ queryKey: transactionKeys.stats() });
      queryClient.invalidateQueries({ queryKey: transactionKeys.detail(data.id) });
      toast.success('Transaction updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update transaction');
    },
  });

  const deleteTransaction = useMutation({
    mutationFn: ({ id, hardDelete }: { id: string; hardDelete?: boolean }) =>
      transactionService.deleteTransaction(id, hardDelete),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: transactionKeys.lists() });
      queryClient.invalidateQueries({ queryKey: transactionKeys.stats() });
      toast.success(data.message || 'Transaction deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete transaction');
    },
  });

  const bulkAction = useMutation({
    mutationFn: (payload: BulkActionTransactionPayload) => transactionService.bulkAction(payload),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: transactionKeys.lists() });
      queryClient.invalidateQueries({ queryKey: transactionKeys.stats() });
      toast.success(data.message || 'Bulk action completed successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to perform bulk action');
    },
  });

  return {
    updateTransaction,
    deleteTransaction,
    bulkAction,
  };
}