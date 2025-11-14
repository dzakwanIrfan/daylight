'use client';

import { useQuery } from '@tanstack/react-query';
import { adminService } from '@/services/admin.service';
import { QueryUsersParams } from '@/types/admin.types';

export function useAdminUsers(params: QueryUsersParams = {}) {
  return useQuery({
    queryKey: ['admin-users', params],
    queryFn: () => adminService.getUsers(params),
    staleTime: 30 * 1000, // 30 seconds
    refetchOnWindowFocus: false,
  });
}

export function useAdminStats() {
  return useQuery({
    queryKey: ['admin-stats'],
    queryFn: () => adminService.getDashboardStats(),
    staleTime: 60 * 1000, // 1 minute
    refetchOnWindowFocus: false,
  });
}