import { useQuery } from '@tanstack/react-query';
import apiClient from '@/lib/axios';

export interface City {
  id: string;
  slug: string;
  name: string;
  timezone: string;
  countryId: string;
  isActive: boolean;
  country?: {
    id: string;
    code: string;
    name: string;
    currency: string;
    phoneCode: string;
  };
}

export interface QueryCitiesParams {
  page?: number;
  limit?: number;
  search?: string;
  countryId?: string;
  isActive?: boolean;
}

export interface QueryCitiesResponse {
  data: City[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

const cityService = {
  async getCities(params?: QueryCitiesParams): Promise<QueryCitiesResponse> {
    const response = await apiClient.get('/cities', { params });
    return response.data;
  },

  async getCityById(id: string): Promise<City> {
    const response = await apiClient.get(`/cities/${id}`);
    return response.data;
  },

  async getPublicCities(params?: QueryCitiesParams): Promise<QueryCitiesResponse> {
    const response = await apiClient.get('/cities/public', { params });
    return response. data;
  },
};

// Query Keys
export const cityKeys = {
  all: ['cities'] as const,
  lists: () => [...cityKeys.all, 'list'] as const,
  list: (params: QueryCitiesParams) => [...cityKeys.lists(), params] as const,
  details: () => [... cityKeys.all, 'detail'] as const,
  detail: (id: string) => [...cityKeys.details(), id] as const,
};

/**
 * Hook to get all cities (for admin)
 */
export function useCities(params: QueryCitiesParams = { isActive: true, limit: 1000 }) {
  return useQuery({
    queryKey: cityKeys.list(params),
    queryFn: () => cityService.getCities(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook to get single city by ID
 */
export function useCity(id: string) {
  return useQuery({
    queryKey: cityKeys.detail(id),
    queryFn: () => cityService.getCityById(id),
    enabled: !! id,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Hook to get public cities (for users)
 */
export function usePublicCities(params: QueryCitiesParams = { isActive: true, limit: 1000 }) {
  return useQuery({
    queryKey: [... cityKeys.all, 'public', params],
    queryFn: () => cityService.getPublicCities(params),
    staleTime: 5 * 60 * 1000,
  });
}