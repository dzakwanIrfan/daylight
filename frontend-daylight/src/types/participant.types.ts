import { TransactionStatus } from './event.types';

export interface EventParticipant {
  id: string;
  userId: string;
  tripayReference: string;
  merchantRef: string;
  paymentMethodCode: string;
  paymentMethodId: string;
  paymentMethodName: string;
  status: TransactionStatus;
  amount: number;
  feeMerchant: number;
  feeCustomer: number;
  totalFee: number;
  finalAmount: number;
  customerName: string;
  customerEmail: string;
  customerPhone: string | null;
  expiredAt: string | null;
  paidAt: string | null;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
    phoneNumber: string | null;
    profilePicture: string | null;
    isEmailVerified: boolean;
    createdAt: string;
    personalityResult: {
      archetype: string;
      profileScore: number;
    } | null;
  };
}

export interface ParticipantDetail extends EventParticipant {
  user: {
    id: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
    phoneNumber: string | null;
    profilePicture: string | null;
    provider: string;
    isEmailVerified: boolean;
    isActive: boolean;
    role: string;
    createdAt: string;
    updatedAt: string;
    personalityResult: {
      archetype: string;
      profileScore: number;
      energyScore: number;
      opennessScore: number;
      structureScore: number;
      affectScore: number;
      comfortScore: number;
      lifestyleScore: number;
      relationshipStatus: string | null;
      intentOnDaylight: string[];
      genderMixComfort: string | null;
    } | null;
  };
  event: {
    id: string;
    title: string;
    slug: string;
    category: string;
    eventDate: string;
    startTime: string;
    endTime: string;
    venue: string;
    address: string;
    city: string;
    price: number;
  };
}

export interface QueryParticipantsParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: 'paidAt' | 'createdAt' | 'customerName' | 'amount';
  sortOrder?: 'asc' | 'desc';
  status?: TransactionStatus;
}

export interface QueryParticipantsResponse {
  event: {
    id: string;
    title: string;
  };
  data: EventParticipant[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
  statistics: {
    totalTransactions: number;
    paidTransactions: number;
    pendingTransactions: number;
    totalRevenue: number;
  };
  filters: QueryParticipantsParams;
  sorting: {
    sortBy: string;
    sortOrder: string;
  };
}