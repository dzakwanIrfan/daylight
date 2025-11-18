import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { personaQuestionService } from "@/services/persona-questions.service";
import { 
    QueryAdminPersonaQuestionParams,
    CreatePersonaQuestionPayload,
    UpdatePersonaQuestionPayload,
    BulkActionPersonaQuestionPayload,
} from "@/types/admin-persona-question.types";
import { toast } from "sonner";

// query keys
export const personaQuestionKeys = {
    all: ['persona-questions'] as const,
    lists: () => [...personaQuestionKeys.all, 'list'] as const,
    list: (params: QueryAdminPersonaQuestionParams) => [...personaQuestionKeys.lists(), params] as const,
    details: () => [...personaQuestionKeys.all, 'detail'] as const,
    detail: (id: string) => [...personaQuestionKeys.details(), id] as const,
}

// get persona questions query
export function useAdminPersonaQuestions(params: QueryAdminPersonaQuestionParams = {}) {
    return useQuery({
        queryKey: personaQuestionKeys.list(params),
        queryFn: () => personaQuestionService.getPersonaQuestionAll(params),
        staleTime: 30000, // 30 seconds
    });
}

// get single persona question
export function useAdminPersonaQuestion(id: string) {
    return useQuery({
        queryKey: personaQuestionKeys.detail(id),
        queryFn: () => personaQuestionService.getPersonaQuestionById(id),
        staleTime: 30000,
    });
}

// mutations
export function useAdminPersonaQuestionMutations() {
    const queryClient = useQueryClient();

    const createQuestion = useMutation({
        mutationFn: (payload: CreatePersonaQuestionPayload) =>
            personaQuestionService.createPersonaQuestion(payload),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: personaQuestionKeys.lists() });
            toast.success(data.message || 'Question created successfully');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Failed to create question');
        },
    });

    const updateQuestion = useMutation({
        mutationFn: ({ id, data }: { id: string; data: UpdatePersonaQuestionPayload }) =>
            personaQuestionService.updatePersonaQuestion(id, data),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: personaQuestionKeys.all });
            toast.success(data.message || 'Question updated successfully');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Failed to update question');
        },
    });

    const deleteQuestion = useMutation({
        mutationFn: (id: string) => personaQuestionService.deletePersonaQuestion(id),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: personaQuestionKeys.lists() });
            toast.success(data.message || 'Question deleted successfully');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Failed to delete question');
        },
    });

    const bulkAction = useMutation({
        mutationFn: (payload: BulkActionPersonaQuestionPayload) =>
            personaQuestionService.bulkAction(payload),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: personaQuestionKeys.lists() });
            toast.success(data.message);
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Bulk action failed');
        },
    });

    return {
        createQuestion,
        updateQuestion,
        deleteQuestion,
        bulkAction,
    };
}