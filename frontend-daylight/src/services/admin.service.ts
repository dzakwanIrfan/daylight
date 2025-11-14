import apiClient from '@/lib/axios';
import {
  AdminUser,
  DashboardStats,
  QueryUsersParams,
  QueryUsersResponse,
  CreateUserPayload,
  UpdateUserPayload,
  BulkActionPayload,
  BulkActionResponse,
} from '@/types/admin.types';

class AdminService {
  private readonly baseURL = '/admin';

  /**
   * Get dashboard statistics
   */
  async getDashboardStats(): Promise<DashboardStats> {
    const response = await apiClient.get(`${this.baseURL}/dashboard/stats`);
    return response.data;
  }

  /**
   * Get all users with filtering, sorting, and pagination
   */
  async getUsers(params: QueryUsersParams): Promise<QueryUsersResponse> {
    const response = await apiClient.get(`${this.baseURL}/users`, { params });
    return response.data;
  }

  /**
   * Get user by ID
   */
  async getUserById(id: string): Promise<AdminUser> {
    const response = await apiClient.get(`${this.baseURL}/users/${id}`);
    return response.data;
  }

  /**
   * Create new user
   */
  async createUser(payload: CreateUserPayload): Promise<{ message: string; user: AdminUser }> {
    const response = await apiClient.post(`${this.baseURL}/users`, payload);
    return response.data;
  }

  /**
   * Update user
   */
  async updateUser(id: string, payload: UpdateUserPayload): Promise<{ message: string; user: AdminUser }> {
    const response = await apiClient.put(`${this.baseURL}/users/${id}`, payload);
    return response.data;
  }

  /**
   * Delete user
   */
  async deleteUser(id: string, hardDelete: boolean = false): Promise<{ message: string }> {
    const response = await apiClient.delete(`${this.baseURL}/users/${id}`, {
      params: { hard: hardDelete },
    });
    return response.data;
  }

  /**
   * Bulk actions on users
   */
  async bulkAction(payload: BulkActionPayload): Promise<BulkActionResponse> {
    const response = await apiClient.post(`${this.baseURL}/users/bulk`, payload);
    return response.data;
  }

  /**
   * Reset user password
   */
  async resetUserPassword(id: string, newPassword: string): Promise<{ message: string }> {
    const response = await apiClient.patch(`${this.baseURL}/users/${id}/reset-password`, {
      newPassword,
    });
    return response.data;
  }

  /**
   * Export users data
   */
  async exportUsers(params: QueryUsersParams): Promise<AdminUser[]> {
    const response = await apiClient.get(`${this.baseURL}/users/export`, { params });
    return response.data;
  }
}

export const adminService = new AdminService();