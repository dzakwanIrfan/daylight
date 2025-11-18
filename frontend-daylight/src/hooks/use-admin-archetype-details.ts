import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { archetypeDetailService } from "@/services/archetype-detail.service";
import { 
    QueryAdminArchetypeDetailParams,
    UpdateArchetypeDetailPayload,
} from "@/types/admin-archetype-detail.types";
import { toast } from "sonner";

// query keys
export const archetypeDetailKeys = {
    all: ['archetype-details'] as const,
    lists: () => [...archetypeDetailKeys.all, 'list'] as const,
    list: (params: QueryAdminArchetypeDetailParams) => [...archetypeDetailKeys.lists(), params] as const,
    details: () => [...archetypeDetailKeys.all, 'detail'] as const,
    detail: (id: string) => [...archetypeDetailKeys.details(), id] as const,
}

// get archetype details query
export function useAdminArchetypeDetails(params: QueryAdminArchetypeDetailParams = {}) {
    return useQuery({
        queryKey: archetypeDetailKeys.list(params),
        queryFn: () => archetypeDetailService.getArchetypeDetailAll(params),
        staleTime: 30000, // 30 seconds
    });
}

// get single archetype detail
export function useAdminArchetypeDetail(id: string) {
    return useQuery({
        queryKey: archetypeDetailKeys.detail(id),
        queryFn: () => archetypeDetailService.getArchetypeDetailById(id),
        staleTime: 30000,
    });
}

// mutations
export function useAdminArchetypeDetailMutations() {
    const queryClient = useQueryClient();

    const updateArchetypeDetail = useMutation({
        mutationFn: ({ id, data }: { id: string; data: UpdateArchetypeDetailPayload }) =>
            archetypeDetailService.updateArchetypeDetail(id, data),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: archetypeDetailKeys.all });
            toast.success(data.message || 'Archetype detail updated successfully');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Failed to update archetype detail');
        },
    });

    const seedArchetypeDetails = useMutation({
        mutationFn: () => archetypeDetailService.seedArchetypeDetails(),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: archetypeDetailKeys.lists() });
            toast.success(data.message || 'Archetype details seeded successfully');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Failed to seed archetype details');
        },
    });

    return {
        updateArchetypeDetail,
        seedArchetypeDetails,
    };
}