export interface AdminPersonaOptions {
    id: string;
    questionId: string;
    question: AdminPersonaQuestion[];
    optionKey: string;
    text: string;
    traitImpacts: JSON;
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