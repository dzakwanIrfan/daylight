import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { xenditService } from "@/services/xendit.service";
import type {
  CreateXenditPaymentDto,
  QueryXenditTransactionsParams,
} from "@/types/xendit.types";

// QUERY KEYS
export const xenditKeys = {
  all: ["xendit"] as const,
  paymentMethods: () => [...xenditKeys.all, "payment-methods"] as const,
  transactions: () => [...xenditKeys.all, "transactions"] as const,
  transaction: (id: string) => [...xenditKeys.all, "transaction", id] as const,
  transactionsList: (params: QueryXenditTransactionsParams) =>
    [...xenditKeys.transactions(), params] as const,
  feePreview: (amount: number, paymentMethodId: string) =>
    [...xenditKeys.all, "fee-preview", amount, paymentMethodId] as const,
};

// GET PAYMENT METHODS
export function useXenditPaymentMethods() {
  return useQuery({
    queryKey: xenditKeys.paymentMethods(),
    queryFn: () => xenditService.getPaymentMethods(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });
}

// CALCULATE FEE
export function useXenditFeeCalculation(
  amount: number,
  paymentMethodId: string | null
) {
  return useQuery({
    queryKey: xenditKeys.feePreview(amount, paymentMethodId || ""),
    queryFn: () => xenditService.calculateFee(amount, paymentMethodId!),
    enabled: amount > 0 && !!paymentMethodId,
    staleTime: 60 * 1000, // 1 minute
  });
}

// CREATE PAYMENT (for both EVENT and SUBSCRIPTION)
export function useXenditCreatePayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateXenditPaymentDto) =>
      xenditService.createPayment(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: xenditKeys.transactions() });
    },
  });
}

// GET TRANSACTION DETAIL
export function useXenditTransaction(externalId: string) {
  return useQuery({
    queryKey: xenditKeys.transaction(externalId),
    queryFn: () => xenditService.getTransactionDetail(externalId),
    enabled: !!externalId,
    refetchInterval: (query) => {
      const data = query.state.data;
      if (!data?.success || !data?.data) return false;

      const status = data.data.status;
      // Stop refetching if payment is completed
      if (
        status === "PAID" ||
        status === "FAILED" ||
        status === "EXPIRED" ||
        status === "REFUNDED"
      ) {
        return false;
      }
      return 10000; // 10 seconds for pending payments
    },
  });
}

// GET USER TRANSACTIONS
export function useXenditTransactions(
  params: QueryXenditTransactionsParams = {}
) {
  return useQuery({
    queryKey: xenditKeys.transactionsList(params),
    queryFn: () => xenditService.getUserTransactions(params),
    staleTime: 30 * 1000, // 30 seconds
  });
}

// INVALIDATE TRANSACTION
export function useInvalidateXenditTransaction() {
  const queryClient = useQueryClient();

  return (transactionId: string) => {
    queryClient.invalidateQueries({
      queryKey: xenditKeys.transaction(transactionId),
    });
    queryClient.invalidateQueries({
      queryKey: xenditKeys.transactions(),
    });
  };
}
