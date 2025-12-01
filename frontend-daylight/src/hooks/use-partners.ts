import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { partnerService } from '@/services/partner.service';
import { toast } from 'sonner';
import type {
  QueryPartnersParams,
  CreatePartnerInput,
  UpdatePartnerInput,
  BulkActionPartnerPayload,
} from '@/types/partner.types';

// Query Keys
export const partnerKeys = {
  all: ['partners'] as const,
  lists: () => [...partnerKeys.all, 'list'] as const,
  list: (params: QueryPartnersParams) => [...partnerKeys.lists(), params] as const,
  details: () => [...partnerKeys.all, 'detail'] as const,
  detail: (id: string) => [...partnerKeys.details(), id] as const,
  publicDetail: (slug: string) => [...partnerKeys.all, 'public', slug] as const,
  stats: () => [...partnerKeys.all, 'stats'] as const,
  available: () => [...partnerKeys.all, 'available'] as const,
  byCity: (cityId: string) => [...partnerKeys.all, 'by-city', cityId] as const,
};

// PUBLIC HOOKS

export function usePublicPartners(params: QueryPartnersParams = {}) {
  return useQuery({
    queryKey: partnerKeys.list(params),
    queryFn: () => partnerService.getPublicPartners(params),
    staleTime: 60000, // 1 minute
  });
}

export function usePublicPartner(slug: string) {
  return useQuery({
    queryKey: partnerKeys.publicDetail(slug),
    queryFn: () => partnerService.getPublicPartnerBySlug(slug),
    enabled: !!slug,
  });
}

// ADMIN HOOKS

export function useAdminPartners(params: QueryPartnersParams = {}) {
  return useQuery({
    queryKey: partnerKeys.list(params),
    queryFn: () => partnerService.getPartners(params),
    staleTime: 30000, // 30 seconds
  });
}

export function useAdminPartner(id: string) {
  return useQuery({
    queryKey: partnerKeys.detail(id),
    queryFn: () => partnerService.getPartnerById(id),
    enabled: !!id,
  });
}

export function useAvailablePartners() {
  return useQuery({
    queryKey: partnerKeys.available(),
    queryFn: () => partnerService.getAvailablePartnersForEvent(),
    staleTime: 60000, // 1 minute
  });
}

/**
 * Get partners filtered by city (for Event Form)
 * Used when admin selects a city in event creation/edit form
 */
export function usePartnersByCity(cityId: string | null | undefined) {
  return useQuery({
    queryKey: partnerKeys.byCity(cityId || ''),
    queryFn: () => partnerService.getPartnersByCity(cityId! ),
    enabled: !!cityId, // Only fetch when cityId is provided
    staleTime: 60000, // 1 minute
  });
}

export function usePartnerDashboardStats() {
  return useQuery({
    queryKey: partnerKeys.stats(),
    queryFn: () => partnerService.getDashboardStats(),
    staleTime: 60000, // 1 minute
  });
}

// MUTATIONS

export function useAdminPartnerMutations() {
  const queryClient = useQueryClient();

  const createPartner = useMutation({
    mutationFn: (data: CreatePartnerInput) => partnerService.createPartner(data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: partnerKeys.lists() });
      queryClient.invalidateQueries({ queryKey: partnerKeys.stats() });
      queryClient.invalidateQueries({ queryKey: partnerKeys.available() });
      // Invalidate all by-city queries
      queryClient.invalidateQueries({ queryKey: [...partnerKeys.all, 'by-city'] });
      toast.success(data.message || 'Partner created successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create partner');
    },
  });

  const updatePartner = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdatePartnerInput }) =>
      partnerService.updatePartner(id, data),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: partnerKeys.lists() });
      queryClient.invalidateQueries({ queryKey: partnerKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: partnerKeys.stats() });
      queryClient.invalidateQueries({ queryKey: partnerKeys.available() });
      // Invalidate all by-city queries
      queryClient.invalidateQueries({ queryKey: [...partnerKeys.all, 'by-city'] });
      toast.success(data.message || 'Partner updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update partner');
    },
  });

  const deletePartner = useMutation({
    mutationFn: ({ id, hardDelete }: { id: string; hardDelete?: boolean }) =>
      partnerService.deletePartner(id, hardDelete),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: partnerKeys.lists() });
      queryClient.invalidateQueries({ queryKey: partnerKeys.stats() });
      queryClient.invalidateQueries({ queryKey: partnerKeys.available() });
      queryClient.invalidateQueries({ queryKey: [...partnerKeys.all, 'by-city'] });
      toast.success(data.message || 'Partner deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete partner');
    },
  });

  const bulkAction = useMutation({
    mutationFn: (payload: BulkActionPartnerPayload) => partnerService.bulkAction(payload),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: partnerKeys.lists() });
      queryClient.invalidateQueries({ queryKey: partnerKeys.stats() });
      queryClient.invalidateQueries({ queryKey: [...partnerKeys.all, 'by-city'] });
      toast.success(data.message || 'Bulk action completed successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to perform bulk action');
    },
  });

  const uploadLogo = useMutation({
    mutationFn: ({ partnerId, file }: { partnerId: string; file: File }) =>
      partnerService.uploadLogo(partnerId, file),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: partnerKeys.detail(variables.partnerId) });
      toast.success('Logo uploaded successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to upload logo');
    },
  });

  const uploadCover = useMutation({
    mutationFn: ({ partnerId, file }: { partnerId: string; file: File }) =>
      partnerService.uploadCover(partnerId, file),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: partnerKeys.detail(variables.partnerId) });
      toast.success('Cover image uploaded successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to upload cover');
    },
  });

  const uploadGalleryImage = useMutation({
    mutationFn: ({ partnerId, file }: { partnerId: string; file: File }) =>
      partnerService.uploadGalleryImage(partnerId, file),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: partnerKeys.detail(variables.partnerId) });
      toast.success('Gallery image uploaded successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to upload image');
    },
  });

  const removeGalleryImage = useMutation({
    mutationFn: ({ partnerId, imageUrl }: { partnerId: string; imageUrl: string }) =>
      partnerService.removeGalleryImage(partnerId, imageUrl),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: partnerKeys.detail(variables.partnerId) });
      toast.success('Image removed from gallery');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to remove image');
    },
  });

  return {
    createPartner,
    updatePartner,
    deletePartner,
    bulkAction,
    uploadLogo,
    uploadCover,
    uploadGalleryImage,
    removeGalleryImage,
  };
}