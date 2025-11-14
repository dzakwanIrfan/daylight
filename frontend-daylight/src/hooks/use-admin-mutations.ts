'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { adminService } from '@/services/admin.service';
import { toast } from 'sonner';
import { 
  CreateUserPayload, 
  UpdateUserPayload, 
  BulkActionPayload,
  AdminUser 
} from '@/types/admin.types';

export function useAdminMutations() {
  const queryClient = useQueryClient();

  const createUser = useMutation({
    mutationFn: (data: CreateUserPayload) => adminService.createUser(data),
    onSuccess: (response) => {
      toast.success(response.message);
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create user');
    },
  });

  const updateUser = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateUserPayload }) => 
      adminService.updateUser(id, data),
    onSuccess: (response) => {
      toast.success(response.message);
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update user');
    },
  });

  const deleteUser = useMutation({
    mutationFn: ({ id, hardDelete }: { id: string; hardDelete?: boolean }) => 
      adminService.deleteUser(id, hardDelete),
    onSuccess: (response) => {
      toast.success(response.message);
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete user');
    },
  });

  const bulkAction = useMutation({
    mutationFn: (data: BulkActionPayload) => adminService.bulkAction(data),
    onSuccess: (response) => {
      toast.success(response.message);
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to perform bulk action');
    },
  });

  const resetPassword = useMutation({
    mutationFn: ({ id, newPassword }: { id: string; newPassword: string }) => 
      adminService.resetUserPassword(id, newPassword),
    onSuccess: (response) => {
      toast.success(response.message);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to reset password');
    },
  });

  return {
    createUser,
    updateUser,
    deleteUser,
    bulkAction,
    resetPassword,
  };
}