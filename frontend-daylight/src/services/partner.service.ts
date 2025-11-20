import apiClient from '@/lib/axios';
import type {
  Partner,
  QueryPartnersResponse,
  CreatePartnerInput,
  UpdatePartnerInput,
  QueryPartnersParams,
  PartnerDashboardStats,
  BulkActionPartnerPayload,
  BulkActionPartnerResponse,
  AvailablePartner,
} from '@/types/partner.types';

class PartnerService {
  private readonly baseURL = '/partners';

  /**
   * PUBLIC: Get all public partners
   */
  async getPublicPartners(params?: QueryPartnersParams): Promise<QueryPartnersResponse> {
    const response = await apiClient.get(`${this.baseURL}/public`, { params });
    return response.data;
  }

  /**
   * PUBLIC: Get partner by slug
   */
  async getPublicPartnerBySlug(slug: string): Promise<Partner> {
    const response = await apiClient.get(`${this.baseURL}/public/${slug}`);
    return response.data;
  }

  /**
   * ADMIN: Get partners with filters
   */
  async getPartners(params?: QueryPartnersParams): Promise<QueryPartnersResponse> {
    const response = await apiClient.get(this.baseURL, { params });
    return response.data;
  }

  /**
   * ADMIN: Get partner by ID
   */
  async getPartnerById(id: string): Promise<Partner> {
    const response = await apiClient.get(`${this.baseURL}/${id}`);
    return response.data;
  }

  /**
   * ADMIN: Get available partners for event selection
   */
  async getAvailablePartnersForEvent(): Promise<AvailablePartner[]> {
    const response = await apiClient.get(`${this.baseURL}/available`);
    return response.data;
  }

  /**
   * ADMIN: Create partner
   */
  async createPartner(data: CreatePartnerInput): Promise<{ message: string; partner: Partner }> {
    const response = await apiClient.post(this.baseURL, data);
    return response.data;
  }

  /**
   * ADMIN: Update partner
   */
  async updatePartner(
    id: string,
    data: UpdatePartnerInput
  ): Promise<{ message: string; partner: Partner }> {
    const response = await apiClient.put(`${this.baseURL}/${id}`, data);
    return response.data;
  }

  /**
   * ADMIN: Delete partner
   */
  async deletePartner(id: string, hardDelete = false): Promise<{ message: string }> {
    const response = await apiClient.delete(`${this.baseURL}/${id}`, {
      params: { hard: hardDelete },
    });
    return response.data;
  }

  /**
   * ADMIN: Bulk actions
   */
  async bulkAction(payload: BulkActionPartnerPayload): Promise<BulkActionPartnerResponse> {
    const response = await apiClient.post(`${this.baseURL}/bulk`, payload);
    return response.data;
  }

  /**
   * ADMIN: Get dashboard stats
   */
  async getDashboardStats(): Promise<PartnerDashboardStats> {
    const response = await apiClient.get(`${this.baseURL}/dashboard/stats`);
    return response.data;
  }

  /**
   * ADMIN: Export partners
   */
  async exportPartners(params?: QueryPartnersParams): Promise<Partner[]> {
    const response = await apiClient.get(`${this.baseURL}/export`, { params });
    return response.data;
  }

  /**
   * ADMIN: Upload partner logo
   */
  async uploadLogo(partnerId: string, file: File): Promise<{ message: string; partner: Partner }> {
    const formData = new FormData();
    formData.append('logo', file);

    const response = await apiClient.post(`${this.baseURL}/${partnerId}/upload/logo`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  }

  /**
   * ADMIN: Upload partner cover
   */
  async uploadCover(partnerId: string, file: File): Promise<{ message: string; partner: Partner }> {
    const formData = new FormData();
    formData.append('cover', file);

    const response = await apiClient.post(`${this.baseURL}/${partnerId}/upload/cover`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  }

  /**
   * ADMIN: Upload gallery image
   */
  async uploadGalleryImage(
    partnerId: string,
    file: File
  ): Promise<{ message: string; partner: Partner }> {
    const formData = new FormData();
    formData.append('image', file);

    const response = await apiClient.post(`${this.baseURL}/${partnerId}/upload/gallery`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  }

  /**
   * ADMIN: Remove gallery image
   */
  async removeGalleryImage(partnerId: string, imageUrl: string): Promise<{ message: string }> {
    const response = await apiClient.delete(`${this.baseURL}/${partnerId}/gallery/image`, {
      data: { imageUrl },
    });
    return response.data;
  }
}

export const partnerService = new PartnerService();