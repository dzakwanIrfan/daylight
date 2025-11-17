export enum PaymentChannelType {
  DIRECT = 'DIRECT',
  REDIRECT = 'REDIRECT',
}

export enum BulkActionType {
  ACTIVATE = 'activate',
  DEACTIVATE = 'deactivate',
}

export interface PaymentMethod {
  id: string;
  code: string;
  name: string;
  group: string;
  type: PaymentChannelType;
  feeMerchantFlat: number;
  feeMerchantPercent: number;
  feeCustomerFlat: number;
  feeCustomerPercent: number;
  minimumFee: number | null;
  maximumFee: number | null;
  minimumAmount: number;
  maximumAmount: number;
  iconUrl: string;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface QueryPaymentMethodsParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: 'createdAt' | 'updatedAt' | 'name' | 'code' | 'group' | 'sortOrder';
  sortOrder?: 'asc' | 'desc';
  group?: string;
  type?: PaymentChannelType;
  isActive?: boolean;
}

export interface QueryPaymentMethodsResponse {
  data: PaymentMethod[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
  filters: {
    search?: string;
    group?: string;
    type?: PaymentChannelType;
    isActive?: boolean;
  };
  sorting: {
    sortBy: string;
    sortOrder: string;
  };
}

export interface UpdatePaymentMethodPayload {
  name?: string;
  group?: string;
  type?: PaymentChannelType;
  feeMerchantFlat?: number;
  feeMerchantPercent?: number;
  feeCustomerFlat?: number;
  feeCustomerPercent?: number;
  minimumFee?: number;
  maximumFee?: number;
  minimumAmount?: number;
  maximumAmount?: number;
  iconUrl?: string;
  isActive?: boolean;
  sortOrder?: number;
}

export interface BulkActionPayload {
  codes: string[];
  action: BulkActionType;
}

export interface BulkActionResponse {
  message: string;
  affectedCount: number;
}