export interface AdminPersonaOptions {
    id: string;
    questionId: string;
    optionKey: string;
    text: string;
    traitImpacts: any;
    createdAt: string;
    updatedAt: string;
}

export interface AdminPersonaQuestion {
    id: string;
    questionNumber: number;        
    section: string;  
    prompt: string;
    type: string;     
    isActive: boolean;
    order: number; 
    options: AdminPersonaOptions[];
    createdAt: string;
    updatedAt: string;
}

export enum PersonaQuestionSortField {
    CREATED_AT = 'createdAt',
    UPDATED_AT = 'updatedAt',
    QUESTION_NUMBER = 'questionNumber',
    PROMPT = 'prompt',
    ORDER = 'order',
}

export enum SortOrder {
    ASC = 'asc',
    DESC = 'desc',
}

export enum PersonaQuestionBulkActionType {
    ACTIVATE = 'activate',
    DEACTIVATE = 'deactivate',
    DELETE = 'delete',
}

export interface QueryAdminPersonaQuestionParams {
    page?: number;
    limit?: number;
    search?: string;
    sortBy?: PersonaQuestionSortField;
    sortOrder?: SortOrder;
    order?: number;
    isActive?: boolean;
}

export interface QueryAdminPersonaQuestionResponse {
    data: AdminPersonaQuestion[];
    pagination: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
        hasNextPage: boolean;
        hasPrevPage: boolean;
    };
    filters: QueryAdminPersonaQuestionParams;
    sorting: {
        sortBy: string;
        sortOrder: string;
    };
}

export interface CreatePersonaQuestionPayload {
    questionNumber: number;
    section: string;
    prompt: string;
    type: string;
    isActive?: boolean;
    order: number;
    options: {
        optionKey: string;
        text: string;
        traitImpacts?: any; // bisa string atau object
    }[];
}

export interface UpdatePersonaQuestionPayload {
    questionNumber?: number;
    section?: string;
    prompt?: string;
    type?: string;
    isActive?: boolean;
    order?: number;
    options?: {
        id?: string;
        optionKey: string;
        text: string;
        traitImpacts?: any;
    }[];
}

export interface BulkActionPersonaQuestionPayload {
    questionIds: string[];
    action: PersonaQuestionBulkActionType;
}

export interface BulkActionPersonaQuestionResponse {
    message: string;
    affectedCount: number;
}