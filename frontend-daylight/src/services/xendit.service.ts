import apiClient from "@/lib/axios";
import type {
  XenditPaymentMethod,
  XenditPaymentMethodGroup,
  XenditFeeCalculation,
  CreateXenditPaymentDto,
  CreateXenditPaymentResponse,
  XenditTransaction,
  QueryXenditTransactionsParams,
  QueryXenditTransactionsResponse,
  TransactionAction,
} from "@/types/xendit.types";

class XenditService {
  private readonly baseURL = "/xendit";

  /**
   * Get available payment methods for current user's country
   */
  async getPaymentMethods(): Promise<{
    success: boolean;
    data: XenditPaymentMethod[];
    grouped: XenditPaymentMethodGroup;
    message?: string;
  }> {
    try {
      const response = await apiClient.get<XenditPaymentMethod[]>(
        `${this.baseURL}/payment-methods`
      );

      const methods = response.data;
      const grouped = this.groupPaymentMethods(methods);

      return {
        success: true,
        data: methods,
        grouped,
      };
    } catch (error: any) {
      console.error("Failed to fetch payment methods:", error);
      return {
        success: false,
        data: [],
        grouped: {},
        message:
          error?.response?.data?.message || "Failed to load payment methods",
      };
    }
  }

  /**
   * Group payment methods by type with labels
   */
  private groupPaymentMethods(
    methods: XenditPaymentMethod[]
  ): XenditPaymentMethodGroup {
    const grouped: XenditPaymentMethodGroup = {};

    const typeLabels: Record<string, string> = {
      EWALLET: "E-Wallet",
      QR_CODE: "QR Code",
      BANK_TRANSFER: "Virtual Account",
      OVER_THE_COUNTER: "Retail Outlet",
      CARDS: "Credit/Debit Card",
      ONLINE_BANKING: "Online Banking",
      PAYLATER: "Pay Later",
    };

    const typeOrder = [
      "E-Wallet",
      "QR Code",
      "Virtual Account",
      "Retail Outlet",
      "Credit/Debit Card",
      "Online Banking",
      "Pay Later",
    ];

    methods.forEach((method) => {
      const label = typeLabels[method.type] || method.type;
      if (!grouped[label]) {
        grouped[label] = [];
      }
      grouped[label].push(method);
    });

    const sortedGrouped: XenditPaymentMethodGroup = {};
    typeOrder.forEach((type) => {
      if (grouped[type]) {
        sortedGrouped[type] = grouped[type];
      }
    });

    Object.keys(grouped).forEach((key) => {
      if (!sortedGrouped[key]) {
        sortedGrouped[key] = grouped[key];
      }
    });

    return sortedGrouped;
  }

  /**
   * Calculate fee for a payment
   */
  async calculateFee(
    amount: number,
    paymentMethodId: string
  ): Promise<{
    success: boolean;
    data?: XenditFeeCalculation;
    error?: string;
  }> {
    try {
      const response = await apiClient.get<XenditFeeCalculation>(
        `${this.baseURL}/fee-preview`,
        {
          params: { amount, paymentMethodId },
        }
      );

      return {
        success: true,
        data: response.data,
      };
    } catch (error: any) {
      console.error("Failed to calculate fee:", error);
      return {
        success: false,
        error: error?.response?.data?.message || "Failed to calculate fee",
      };
    }
  }

  /**
   * Create payment transaction
   */
  async createPayment(data: CreateXenditPaymentDto): Promise<{
    success: boolean;
    data?: CreateXenditPaymentResponse;
    error?: string;
  }> {
    try {
      const response = await apiClient.post<CreateXenditPaymentResponse>(
        `${this.baseURL}/create`,
        data
      );

      return {
        success: true,
        data: response.data,
      };
    } catch (error: any) {
      console.error("Failed to create payment:", error);
      return {
        success: false,
        error: error?.response?.data?.message || "Failed to create payment",
      };
    }
  }

  /**
   * Get transaction detail
   */
  async getTransactionDetail(externalId: string): Promise<{
    success: boolean;
    data?: XenditTransaction;
    error?: string;
  }> {
    try {
      const response = await apiClient.get<XenditTransaction>(
        `${this.baseURL}/transaction/${externalId}`
      );

      return {
        success: true,
        data: response.data,
      };
    } catch (error: any) {
      console.error("Failed to fetch transaction:", error);
      return {
        success: false,
        error: error?.response?.data?.message || "Transaction not found",
      };
    }
  }

  /**
   * Get user's transactions
   */
  async getUserTransactions(
    params: QueryXenditTransactionsParams = {}
  ): Promise<QueryXenditTransactionsResponse> {
    try {
      const response = await apiClient.get<QueryXenditTransactionsResponse>(
        `${this.baseURL}/my-transactions`,
        { params }
      );
      return response.data;
    } catch (error) {
      console.error("Failed to fetch transactions:", error);
      return {
        data: [],
        meta: {
          total: 0,
          page: 1,
          lastPage: 0,
        },
      };
    }
  }

  /**
   * Helper: Parse actions to get payment info
   */
  parsePaymentActions(actions: TransactionAction[]): {
    paymentUrl?: string;
    paymentCode?: string;
    qrString?: string;
    virtualAccountNumber?: string;
    deepLink?: string;
  } {
    if (!actions || actions.length === 0) return {};

    const result: Record<string, string> = {};

    actions.forEach((action) => {
      switch (action.descriptor) {
        case "WEB_URL":
          result.paymentUrl = action.value;
          break;
        case "DEEPLINK_URL":
          result.deepLink = action.value;
          break;
        case "PAYMENT_CODE":
          result.paymentCode = action.value;
          break;
        case "QR_STRING":
          result.qrString = action.value;
          break;
        case "VIRTUAL_ACCOUNT_NUMBER":
          result.virtualAccountNumber = action.value;
          break;
      }
    });

    return result;
  }
}

export const xenditService = new XenditService();
