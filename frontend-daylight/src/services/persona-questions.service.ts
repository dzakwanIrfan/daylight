import apiClient from "@/lib/axios";
import { QueryAdminPersonaQuestionParams, QueryAdminPersonaQuestionResponse } from "@/types/admin-persona-question.types";

class PersonaQuestionService {
    private readonly baseURL = '/persona-question';

    async getPersonaQuestionAll(params?: QueryAdminPersonaQuestionParams): Promise<QueryAdminPersonaQuestionResponse> {
        const response = await apiClient.get(this.baseURL, { params });
        return response.data;
    }
}

export const personaQuestionService = new PersonaQuestionService();