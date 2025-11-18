import { personaQuestionService } from "@/services/persona-questions.service";
import { QueryAdminPersonaQuestionParams } from "@/types/admin-persona-question.types";
import { useQuery } from "@tanstack/react-query";

// query keys
export const personaQuestionKeys = {
    all: ['persona-questions'] as const,
    lists: () => [...personaQuestionKeys.all, 'list'] as const,
    list: (params: QueryAdminPersonaQuestionParams) => [...personaQuestionKeys.lists(), params] as const,
}

// get persona questions query
export function useAdminPersonaQuestions(params: QueryAdminPersonaQuestionParams = {}) {
    return useQuery({
        queryKey: personaQuestionKeys.list(params),
        queryFn: () => personaQuestionService.getPersonaQuestionAll(params),
        staleTime: 30000, // 30 seconds
    });
}

