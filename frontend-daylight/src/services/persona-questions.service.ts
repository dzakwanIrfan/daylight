import apiClient from "@/lib/axios";
import { 
    QueryAdminPersonaQuestionParams, 
    QueryAdminPersonaQuestionResponse,
    AdminPersonaQuestion,
    CreatePersonaQuestionPayload,
    UpdatePersonaQuestionPayload,
    BulkActionPersonaQuestionPayload,
    BulkActionPersonaQuestionResponse,
} from "@/types/admin-persona-question.types";

class PersonaQuestionService {
    private readonly baseURL = '/persona-question';

    async getPersonaQuestionAll(params?: QueryAdminPersonaQuestionParams): Promise<QueryAdminPersonaQuestionResponse> {
        const response = await apiClient.get(this.baseURL, { params });
        return response.data;
    }

    async getPersonaQuestionById(id: string): Promise<AdminPersonaQuestion> {
        const response = await apiClient.get(`${this.baseURL}/${id}`);
        return response.data;
    }

    async createPersonaQuestion(payload: CreatePersonaQuestionPayload): Promise<{ message: string; data: AdminPersonaQuestion }> {
        const response = await apiClient.post(this.baseURL, payload);
        return response.data;
    }

    async updatePersonaQuestion(id: string, payload: UpdatePersonaQuestionPayload): Promise<{ message: string; data: AdminPersonaQuestion }> {
        const response = await apiClient.put(`${this.baseURL}/${id}`, payload);
        return response.data;
    }

    async deletePersonaQuestion(id: string): Promise<{ message: string }> {
        const response = await apiClient.delete(`${this.baseURL}/${id}`);
        return response.data;
    }

    async bulkAction(payload: BulkActionPersonaQuestionPayload): Promise<BulkActionPersonaQuestionResponse> {
        const response = await apiClient.post(`${this.baseURL}/bulk`, payload);
        return response.data;
    }

    async exportPersonaQuestions(params?: QueryAdminPersonaQuestionParams): Promise<AdminPersonaQuestion[]> {
        const response = await apiClient.get(`${this.baseURL}/export`, { params });
        return response.data;
    }
}

export const personaQuestionService = new PersonaQuestionService();