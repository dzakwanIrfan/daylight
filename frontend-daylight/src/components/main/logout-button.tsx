'use client';

import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { LogOut } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { authService } from '@/services/auth.service';
import { useAuthStore } from '@/store/auth-store';
import { usePersonalityTestStore } from '@/store/personality-test-store';

export function LogoutButton() {
  const router = useRouter();
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const resetPersonalityTest = usePersonalityTestStore((state) => state.reset);

  const logoutMutation = useMutation({
    mutationFn: authService.logout,
    onSuccess: () => {
      clearAuth();
      resetPersonalityTest();
      // Also manually remove from localStorage to be sure
      if (typeof window !== 'undefined') {
        localStorage.removeItem('personality-test-storage');
      }
      toast.success('Logged out successfully');
      setTimeout(() => {
        window.location.href = '/auth/login';
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