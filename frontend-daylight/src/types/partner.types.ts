export enum PartnerType {
  BRAND = 'BRAND',
  COMMUNITY = 'COMMUNITY',
}

export enum PartnerStatus {
  PENDING = 'PENDING',
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  REJECTED = 'REJECTED',
}

export interface Partner {
  id: string;
  name: string;
  slug: string;
  type: PartnerType;
  description?: string;
  shortDescription?: string;
  address: string;
  city: string;
  phoneNumber?: string;
  email?: string;
  website?: string;
  googleMapsUrl?: string;
  latitude?: number;
  longitude?: number;
  logo?: string;
  coverImage?: string;
  gallery: string[];
  status: PartnerStatus;
  isActive: boolean;
  isPreferred: boolean;
  isFeatured: boolean;
  operatingHours?: any;
  instagram?: string;
  facebook?: string;
  twitter?: string;
  tags: string[];
  amenities: string[];
  totalEvents: number;
  viewCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePartnerInput {
  name: string;
  type: PartnerType;
  description?: string;
  shortDescription?: string;
  address: string;
  city: string;
  phoneNumber?: string;
  email?: string;
  website?: string;
  googleMapsUrl?: string;
  latitude?: number;
  longitude?: number;
  logo?: string;
  coverImage?: string;
  gallery?: string[];
  status?: PartnerStatus;
  isActive?: boolean;
  isPreferred?: boolean;
  isFeatured?: boolean;
  operatingHours?: any;
  instagram?: string;
  facebook?: string;
  twitter?: string;
  tags?: string[];
  amenities?: string[];
}

export interface UpdatePartnerInput extends Partial<CreatePartnerInput> {}

export interface QueryPartnersParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: 'createdAt' | 'updatedAt' | 'name' | 'totalEvents' | 'viewCount';
  sortOrder?: 'asc' | 'desc';
  type?: PartnerType;
  status?: PartnerStatus;
  isActive?: boolean;
  isPreferred?: boolean;
  isFeatured?: boolean;
  city?: string;
}

export interface QueryPartnersResponse {
  data: Partner[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
  filters: QueryPartnersParams;
  sorting: {
    sortBy: string;
    sortOrder: string;
  };
}

export interface PartnerDashboardStats {
  overview: {
    totalPartners: number;
    activePartners: number;
    preferredPartners: number;
    pendingPartners: number;
  };
  breakdown: {
    byType: Array<{
      type: PartnerType;
      count: number;
    }>;
    byStatus: Array<{
      status: PartnerStatus;
      count: number;
    }>;
  };
  topPartners: Array<{
    id: string;
    name: string;
    type: PartnerType;
    city: string;
    totalEvents: number;
    viewCount: number;
    isPreferred: boolean;
    logo?: string;
  }>;
}

export enum PartnerBulkActionType {
  ACTIVATE = 'activate',
  DEACTIVATE = 'deactivate',
  DELETE = 'delete',
  MARK_PREFERRED = 'mark_preferred',
  UNMARK_PREFERRED = 'unmark_preferred',
  APPROVE = 'approve',
  REJECT = 'reject',
}

export interface BulkActionPartnerPayload {
  partnerIds: string[];
  action: PartnerBulkActionType;
}

export interface BulkActionPartnerResponse {
  message: string;
  affectedCount: number;
}

export interface AvailablePartner {
  id: string;
  name: string;
  type: PartnerType;
  city: string;
  address: string;
  logo?: string;
  isPreferred: boolean;
}