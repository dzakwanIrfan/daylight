import apiClient from "@/lib/axios";
import { 
    QueryAdminArchetypeDetailParams, 
    QueryAdminArchetypeDetailResponse,
    AdminArchetypeDetail,
    UpdateArchetypeDetailPayload,
} from "@/types/admin-archetype-detail.types";

class ArchetypeDetailService {
    private readonly baseURL = '/archetype-detail';

    async getArchetypeDetailAll(params?: QueryAdminArchetypeDetailParams): Promise<QueryAdminArchetypeDetailResponse> {
        const response = await apiClient.get(this.baseURL, { params });
        return response.data;
    }

    async getArchetypeDetailById(id: string): Promise<AdminArchetypeDetail> {
        const response = await apiClient.get(`${this.baseURL}/${id}`);
        return response.data;
    }

    async updateArchetypeDetail(id: string, payload: UpdateArchetypeDetailPayload): Promise<{ message: string; data: AdminArchetypeDetail }> {
        const response = await apiClient.put(`${this.baseURL}/${id}`, payload);
        return response.data;
    }

    async seedArchetypeDetails(): Promise<{ message: string; count: number }> {
        const response = await apiClient.post(`${this.baseURL}/seed`);
        return response.data;
    }
}

export const archetypeDetailService = new ArchetypeDetailService();