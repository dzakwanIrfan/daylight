import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { locationService } from '@/services/location.service';
import {
  QueryAdminCountryParams,
  QueryAdminCityParams,
  CreateCountryPayload,
  UpdateCountryPayload,
  BulkActionCountryPayload,
  CreateCityPayload,
  UpdateCityPayload,
  BulkActionCityPayload,
} from '@/types/admin-location.types';
import { toast } from 'sonner';

// QUERY KEYS

export const countryKeys = {
  all: ['countries'] as const,
  lists: () => [... countryKeys.all, 'list'] as const,
  list: (params: QueryAdminCountryParams) => [...countryKeys.lists(), params] as const,
  details: () => [...countryKeys.all, 'detail'] as const,
  detail: (id: string) => [... countryKeys.details(), id] as const,
  options: () => [...countryKeys.all, 'options'] as const,
};

export const cityKeys = {
  all: ['cities'] as const,
  lists: () => [...cityKeys.all, 'list'] as const,
  list: (params: QueryAdminCityParams) => [...cityKeys. lists(), params] as const,
  details: () => [...cityKeys.all, 'detail'] as const,
  detail: (id: string) => [...cityKeys. details(), id] as const,
  options: (countryId?: string) => [...cityKeys.all, 'options', countryId] as const,
};

// COUNTRY HOOKS

export function useAdminCountries(params: QueryAdminCountryParams = {}) {
  return useQuery({
    queryKey: countryKeys.list(params),
    queryFn: () => locationService.getCountryAll(params),
    staleTime: 30000,
  });
}

export function useAdminCountry(id: string) {
  return useQuery({
    queryKey: countryKeys.detail(id),
    queryFn: () => locationService.getCountryById(id),
    staleTime: 30000,
    enabled: !!id,
  });
}

export function useCountryOptions() {
  return useQuery({
    queryKey: countryKeys.options(),
    queryFn: () => locationService.getCountryOptions(),
    staleTime: 60000, // 1 minute
  });
}

export function useAdminCountryMutations() {
  const queryClient = useQueryClient();

  const createCountry = useMutation({
    mutationFn: (payload: CreateCountryPayload) => locationService.createCountry(payload),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: countryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: countryKeys.options() });
      toast.success(data.message || 'Country created successfully');
    },
    onError: (error: any) => {
      toast.error(error. primaryMessage || 'Failed to create country');
    },
  });

  const updateCountry = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateCountryPayload }) =>
      locationService.updateCountry(id, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: countryKeys.all });
      toast.success(data. message || 'Country updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.primaryMessage || 'Failed to update country');
    },
  });

  const deleteCountry = useMutation({
    mutationFn: (id: string) => locationService.deleteCountry(id),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: countryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: countryKeys.options() });
      toast.success(data. message || 'Country deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error.primaryMessage || 'Failed to delete country');
    },
  });

  const bulkAction = useMutation({
    mutationFn: (payload: BulkActionCountryPayload) => locationService. bulkActionCountry(payload),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: countryKeys. lists() });
      queryClient.invalidateQueries({ queryKey: countryKeys. options() });
      toast.success(data.message);
    },
    onError: (error: any) => {
      toast.error(error.primaryMessage || 'Bulk action failed');
    },
  });

  return {
    createCountry,
    updateCountry,
    deleteCountry,
    bulkAction,
  };
}

// CITY HOOKS

export function useAdminCities(params: QueryAdminCityParams = {}) {
  return useQuery({
    queryKey: cityKeys. list(params),
    queryFn: () => locationService. getCityAll(params),
    staleTime: 30000,
  });
}

export function useAdminCity(id: string) {
  return useQuery({
    queryKey: cityKeys.detail(id),
    queryFn: () => locationService.getCityById(id),
    staleTime: 30000,
    enabled: !! id,
  });
}

export function useCityOptions(countryId?: string) {
  return useQuery({
    queryKey: cityKeys. options(countryId),
    queryFn: () => locationService.getCityOptions(countryId),
    staleTime: 60000,
  });
}

export function useAdminCityMutations() {
  const queryClient = useQueryClient();

  const createCity = useMutation({
    mutationFn: (payload: CreateCityPayload) => locationService.createCity(payload),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: cityKeys.lists() });
      queryClient.invalidateQueries({ queryKey: cityKeys.options() });
      queryClient.invalidateQueries({ queryKey: countryKeys.all }); // Invalidate country counts
      toast.success(data.message || 'City created successfully');
    },
    onError: (error: any) => {
      toast. error(error.primaryMessage || 'Failed to create city');
    },
  });

  const updateCity = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateCityPayload }) =>
      locationService.updateCity(id, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: cityKeys. all });
      toast.success(data. message || 'City updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.primaryMessage || 'Failed to update city');
    },
  });

  const deleteCity = useMutation({
    mutationFn: (id: string) => locationService.deleteCity(id),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: cityKeys.lists() });
      queryClient.invalidateQueries({ queryKey: cityKeys.options() });
      queryClient.invalidateQueries({ queryKey: countryKeys.all }); // Invalidate country counts
      toast.success(data. message || 'City deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error.primaryMessage || 'Failed to delete city');
    },
  });

  const bulkAction = useMutation({
    mutationFn: (payload: BulkActionCityPayload) => locationService.bulkActionCity(payload),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: cityKeys.lists() });
      queryClient.invalidateQueries({ queryKey: cityKeys.options() });
      queryClient.invalidateQueries({ queryKey: countryKeys.all });
      toast.success(data.message);
    },
    onError: (error: any) => {
      toast.error(error.primaryMessage || 'Bulk action failed');
    },
  });

  return {
    createCity,
    updateCity,
    deleteCity,
    bulkAction,
  };
}