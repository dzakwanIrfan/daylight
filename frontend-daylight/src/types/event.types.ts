export enum EventCategory {
  DAYBREAK = 'DAYBREAK',
  DAYTRIP = 'DAYTRIP',
  DAYCARE = 'DAYCARE',
  DAYDREAM = 'DAYDREAM',
}

export enum EventStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  CANCELLED = 'CANCELLED',
  COMPLETED = 'COMPLETED',
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  FAILED = 'FAILED',
  EXPIRED = 'EXPIRED',
  REFUNDED = 'REFUNDED',
}

export interface Event {
  id: string;
  title: string;
  slug: string;
  category: EventCategory;
  description: string;
  shortDescription?: string;
  eventDate: string;
  startTime: string;
  endTime: string;
  venue: string;
  address: string;
  city: string;
  googleMapsUrl?: string;
  latitude?: number;
  longitude?: number;
  price: number;
  currency: string;
  currentParticipants: number;
  status: EventStatus;
  isActive: boolean;
  isFeatured: boolean;
  tags: string[];
  requirements: string[];
  highlights: string[];
  organizerName?: string;
  organizerContact?: string;
  createdAt: string;
  updatedAt: string;
}

export interface EventPurchaseStatus {
  hasPurchased: boolean;
  canPurchase: boolean;
  status: PaymentStatus | null;
  transaction: {
    id: string;
    merchantRef: string;
    paidAt: string | null;
    createdAt: string;
  } | null;
  hasSubscription: boolean;
  subscriptionAccess: boolean;
  message?: string;
}

export interface CreateEventInput {
  title: string;
  category: EventCategory;
  description: string;
  shortDescription?: string;
  eventDate: string;
  startTime: string;
  endTime: string;
  venue: string;
  address: string;
  city: string;
  googleMapsUrl?: string;
  latitude?: number;
  longitude?: number;
  price: number;
  currency?: string;
  status?: EventStatus;
  isActive?: boolean;
  isFeatured?: boolean;
  tags?: string[];
  requirements?: string[];
  highlights?: string[];
  organizerName?: string;
  organizerContact?: string;
}

export interface UpdateEventInput extends Partial<CreateEventInput> {}

export interface QueryEventsParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: 'createdAt' | 'updatedAt' | 'eventDate' | 'title' | 'price' | 'currentParticipants';
  sortOrder?: 'asc' | 'desc';
  category?: EventCategory;
  status?: EventStatus;
  isActive?: boolean;
  isFeatured?: boolean;
  city?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface QueryEventsResponse {
  data: Event[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
  filters: QueryEventsParams;
  sorting: {
    sortBy: string;
    sortOrder: string;
  };
}

export interface EventDashboardStats {
  overview: {
    totalEvents: number;
    activeEvents: number;
    upcomingEvents: number;
    completedEvents: number;
  };
  breakdown: {
    byCategory: Array<{
      category: EventCategory;
      count: number;
    }>;
    byStatus: Array<{
      status: EventStatus;
      count: number;
    }>;
  };
  recentEvents: Array<{
    id: string;
    title: string;
    category: EventCategory;
    eventDate: string;
    status: EventStatus;
    currentParticipants: number;
    createdAt: string;
  }>;
}

export enum EventBulkActionType {
  ACTIVATE = 'activate',
  DEACTIVATE = 'deactivate',
  DELETE = 'delete',
  PUBLISH = 'publish',
  DRAFT = 'draft',
  CANCEL = 'cancel',
}

export interface BulkActionEventPayload {
  eventIds: string[];
  action: EventBulkActionType;
}

export interface BulkActionEventResponse {
  message: string;
  affectedCount: number;
}