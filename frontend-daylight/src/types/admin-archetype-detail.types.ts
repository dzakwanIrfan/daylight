import { FieldValues } from "react-hook-form";

export interface AdminArchetypeDetail {
    id: string;
    archetype: string;
    symbol: string;
    name: string;
    traits: string[];
    description: string;
    imageKey: string;
    createdAt: string;
    updatedAt: string;
}

export enum SortOrder {
    ASC = 'asc',
    DESC = 'desc',
}

export interface QueryAdminArchetypeDetailParams {
    page?: number;
    limit?: number;
    search?: string;
    sortOrder?: SortOrder;
    archetype?: string;
}

export interface QueryAdminArchetypeDetailResponse {
    data: AdminArchetypeDetail[];
    pagination: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
        hasNextPage: boolean;
        hasPrevPage: boolean;
    };
    filters: QueryAdminArchetypeDetailParams;
    sorting: {
        sortOrder: string;
    };
}

export interface UpdateArchetypeDetailPayload extends FieldValues {
    symbol?: string;
    name?: string;
    traits?: string[];
    description?: string;
    imageKey?: string;
}