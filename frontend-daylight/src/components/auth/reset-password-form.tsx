'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { Loader2, KeyRound } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { authService } from '@/services/auth.service';

const resetPasswordSchema = z.object({
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
      'Password must contain uppercase, lowercase, number and special character'
    ),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

interface ResetPasswordFormProps {
  token: string;
}

export function ResetPasswordForm({ token }: ResetPasswordFormProps) {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const resetPasswordMutation = useMutation({
    mutationFn: (newPassword: string) =>
      authService.resetPassword({ token, newPassword }),
    onSuccess: () => {
      toast.success('Password reset successful!', {
        description: 'You can now login with your new password.',
      });
      setTimeout(() => {
        router.push('/login');
      }, 2000);
    },
    onError: (error: any) => {
      toast.error('Reset failed', {
        description:
          error.response?.data?.message || 'Invalid or expired reset token',
      });
    },
  });

  const onSubmit = (data: ResetPasswordFormData) => {
    resetPasswordMutation.mutate(data.password);
  };

  return (
    <div className="w-full max-w-md space-y-8">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-brand/10 mb-4">
          <KeyRound className="w-8 h-8 text-brand" />
        </div>
        <h1 className="text-3xl font-heading font-bold mb-2">
          Set New Password
        </h1>
        <p className="text-muted-foreground">
          Your new password must be different from previous passwords
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="password">New Password</Label>
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            {...register('password')}
            className={errors.password ? 'border-destructive' : ''}
          />
          {errors.password && (
            <p className="text-sm text-destructive">
              {errors.password.message}
            </p>
          )}
          <p className="text-xs text-muted-foreground">
            Must contain uppercase, lowercase, number and special character
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Confirm Password</Label>
          <Input
            id="confirmPassword"
            type="password"
            placeholder="••••••••"
            {...register('confirmPassword')}
            className={errors.confirmPassword ? 'border-destructive' : ''}
          />
          {errors.confirmPassword && (
            <p className="text-sm text-destructive">
              {errors.confirmPassword.message}
            </p>
          )}
        </div>

        <Button
          type="submit"
          className="w-full bg-brand hover:bg-brand-orange-dark"
          disabled={resetPasswordMutation.isPending}
        >
          {resetPasswordMutation.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Resetting...
            </>
          ) : (
            'Reset Password'
          )}
        </Button>
      </form>
    </div>
  );
}