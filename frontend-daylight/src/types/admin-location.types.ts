// COUNTRY TYPES

export interface AdminCountry {
  id: string;
  code: string;
  name: string;
  currency: string;
  phoneCode: string;
  createdAt: string;
  updatedAt: string;
  _count?: {
    cities: number;
  };
}

export enum CountrySortField {
  CREATED_AT = 'createdAt',
  UPDATED_AT = 'updatedAt',
  NAME = 'name',
  CODE = 'code',
}

export enum SortOrder {
  ASC = 'asc',
  DESC = 'desc',
}

export enum CountryBulkActionType {
  DELETE = 'delete',
}

export interface QueryAdminCountryParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: CountrySortField;
  sortOrder?: SortOrder;
}

export interface QueryAdminCountryResponse {
  data: AdminCountry[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
  sorting: {
    sortBy: string;
    sortOrder: string;
  };
}

export interface CreateCountryPayload {
  code: string;
  name: string;
  currency: string;
  phoneCode: string;
}

export interface UpdateCountryPayload {
  code?: string;
  name?: string;
  currency?: string;
  phoneCode?: string;
}

export interface BulkActionCountryPayload {
  countryIds: string[];
  action: CountryBulkActionType;
}

export interface CountryOption {
  id: string;
  code: string;
  name: string;
  currency: string;
}

// CITY TYPES

export interface AdminCity {
  id: string;
  slug: string;
  name: string;
  timezone: string;
  countryId: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  country?: {
    id: string;
    code: string;
    name: string;
  };
  _count?: {
    users: number;
    events: number;
  };
}

export enum CitySortField {
  CREATED_AT = 'createdAt',
  UPDATED_AT = 'updatedAt',
  NAME = 'name',
  SLUG = 'slug',
}

export enum CityBulkActionType {
  ACTIVATE = 'activate',
  DEACTIVATE = 'deactivate',
  DELETE = 'delete',
}

export interface QueryAdminCityParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: CitySortField;
  sortOrder?: SortOrder;
  countryId?: string;
  isActive?: boolean;
}

export interface QueryAdminCityResponse {
  data: AdminCity[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
  filters: {
    countryId?: string;
    isActive?: boolean;
  };
  sorting: {
    sortBy: string;
    sortOrder: string;
  };
}

export interface CreateCityPayload {
  slug: string;
  name: string;
  timezone: string;
  countryId: string;
  isActive?: boolean;
}

export interface UpdateCityPayload {
  slug?: string;
  name?: string;
  timezone?: string;
  countryId?: string;
  isActive?: boolean;
}

export interface BulkActionCityPayload {
  cityIds: string[];
  action: CityBulkActionType;
}

export interface CityOption {
  id: string;
  slug: string;
  name: string;
  timezone: string;
  country?: {
    id: string;
    code: string;
    name: string;
  };
}

// COMMON TYPES

export interface BulkActionResponse {
  message: string;
  affectedCount: number;
}