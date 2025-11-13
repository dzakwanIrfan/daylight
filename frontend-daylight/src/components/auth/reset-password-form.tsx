'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { Loader2, KeyRound, Eye, EyeOff, CheckCircle2, XCircle } from 'lucide-react';
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
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    mode: 'onChange',
  });

  const password = watch('password');

  const passwordRequirements = [
    { label: 'At least 8 characters', test: (pwd: string) => pwd?.length >= 8 },
    { label: 'One uppercase letter', test: (pwd: string) => /[A-Z]/.test(pwd) },
    { label: 'One lowercase letter', test: (pwd: string) => /[a-z]/.test(pwd) },
    { label: 'One number', test: (pwd: string) => /\d/.test(pwd) },
    { label: 'One special character', test: (pwd: string) => /[@$!%*?&]/.test(pwd) },
  ];

  const resetPasswordMutation = useMutation({
    mutationFn: (newPassword: string) =>
      authService.resetPassword({ token, newPassword }),
    onSuccess: () => {
      toast.success('Password reset successful!', {
        description: 'You can now login with your new password.',
        duration: 6000,
        action: {
          label: 'Go to Login',
          onClick: () => router.push('/auth/login'),
        },
      });
      setTimeout(() => {
        router.push('/auth/login');
      }, 2500);
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Invalid or expired reset token';
      toast.error('Reset failed', {
        description: Array.isArray(message) ? message.join(', ') : message,
        duration: 6000,
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
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              autoComplete="new-password"
              {...register('password')}
              className={errors.password ? 'border-destructive pr-10' : 'pr-10'}
              disabled={resetPasswordMutation.isPending}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              disabled={resetPasswordMutation.isPending}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {errors.password && (
            <p className="text-sm text-destructive">
              {errors.password.message}
            </p>
          )}
          {password && (
            <div className="mt-2 space-y-1">
              {passwordRequirements.map((req, idx) => {
                const isValid = req.test(password);
                return (
                  <div key={idx} className="flex items-center gap-2 text-xs">
                    {isValid ? (
                      <CheckCircle2 className="h-3 w-3 text-green-500" />
                    ) : (
                      <XCircle className="h-3 w-3 text-muted-foreground" />
                    )}
                    <span className={isValid ? 'text-green-600' : 'text-muted-foreground'}>
                      {req.label}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Confirm Password</Label>
          <div className="relative">
            <Input
              id="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              placeholder="••••••••"
              autoComplete="new-password"
              {...register('confirmPassword')}
              className={errors.confirmPassword ? 'border-destructive pr-10' : 'pr-10'}
              disabled={resetPasswordMutation.isPending}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              disabled={resetPasswordMutation.isPending}
            >
              {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {errors.confirmPassword && (
            <p className="text-sm text-destructive">
              {errors.confirmPassword.message}
            </p>
          )}
        </div>

        <Button
          type="submit"
          className="w-full bg-brand hover:bg-brand/90 border border-r-4 border-b-4 border-black rounded-full font-bold text-white"
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