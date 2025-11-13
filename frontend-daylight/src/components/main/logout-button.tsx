'use client';

import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { LogOut } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { authService } from '@/services/auth.service';
import { useAuthStore } from '@/store/auth-store';

export function LogoutButton() {
  const router = useRouter();
  const clearAuth = useAuthStore((state) => state.clearAuth);

  const logoutMutation = useMutation({
    mutationFn: authService.logout,
    onSuccess: () => {
      clearAuth();
      toast.success('Logged out successfully');
      setTimeout(() => {
        window.location.href = '/login';
      }, 300);
    },
    onError: () => {
      toast.error('Logout failed');
    },
  });

  return (
    <Button
      onClick={() => logoutMutation.mutate()}
      variant="ghost"
      className="w-full justify-start"
      disabled={logoutMutation.isPending}
    >
      <LogOut className="mr-2 h-4 w-4" />
      Logout
    </Button>
  );
}