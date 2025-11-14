// src/types/admin.types.ts
export enum UserRole {
  USER = 'USER',
  ADMIN = 'ADMIN',
}

export enum AuthProvider {
  LOCAL = 'LOCAL',
  GOOGLE = 'GOOGLE',
}

export enum BulkActionType {
  ACTIVATE = 'activate',
  DEACTIVATE = 'deactivate',
  DELETE = 'delete',
  UPDATE_ROLE = 'updateRole',
  VERIFY_EMAIL = 'verifyEmail',
}

export interface AdminUser {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  phoneNumber: string | null;
  profilePicture: string | null;
  role: UserRole;
  provider: AuthProvider;
  isEmailVerified: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  personalityResult?: {
    archetype: string;
    profileScore: number;
  } | null;
  _count?: {
    refreshTokens: number;
  };
}

export interface QueryUsersParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: 'createdAt' | 'updatedAt' | 'email' | 'firstName' | 'lastName';
  sortOrder?: 'asc' | 'desc';
  role?: UserRole;
  provider?: AuthProvider;
  isActive?: boolean;
  isEmailVerified?: boolean;
  dateFrom?: string;
  dateTo?: string;
}

export interface QueryUsersResponse {
  data: AdminUser[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
  filters: {
    search?: string;
    role?: UserRole;
    provider?: AuthProvider;
    isActive?: boolean;
    isEmailVerified?: boolean;
    dateFrom?: string;
    dateTo?: string;
  };
  sorting: {
    sortBy: string;
    sortOrder: string;
  };
}

export interface CreateUserPayload {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  role?: UserRole;
  isEmailVerified?: boolean;
  isActive?: boolean;
}

export interface UpdateUserPayload {
  email?: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  profilePicture?: string;
  role?: UserRole;
  isEmailVerified?: boolean;
  isActive?: boolean;
}

export interface BulkActionPayload {
  userIds: string[];
  action: BulkActionType;
  role?: UserRole;
}

export interface BulkActionResponse {
  message: string;
  affectedCount: number;
}

export interface DashboardStats {
  overview: {
    totalUsers: number;
    activeUsers: number;
    inactiveUsers: number;
    verifiedUsers: number;
    unverifiedUsers: number;
    usersWithPersonality: number;
  };
  breakdown: {
    byRole: Array<{ role: UserRole; count: number }>;
    byProvider: Array<{ provider: AuthProvider; count: number }>;
  };
  recentUsers: Array<{
    id: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
    role: UserRole;
    createdAt: string;
  }>;
}