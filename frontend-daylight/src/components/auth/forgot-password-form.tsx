'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useMutation } from '@tanstack/react-query';
import Link from 'next/link';
import { Loader2, ArrowLeft, Mail } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { authService } from '@/services/auth.service';

const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export function ForgotPasswordForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const forgotPasswordMutation = useMutation({
    mutationFn: authService.forgotPassword,
    onSuccess: () => {
      toast.success('Email sent!', {
        description: 'If an account exists, a reset link has been sent to your email.',
      });
      reset();
    },
    onError: (error: any) => {
      toast.error('Request failed', {
        description: error.response?.data?.message || 'Something went wrong',
      });
    },
  });

  const onSubmit = (data: ForgotPasswordFormData) => {
    forgotPasswordMutation.mutate(data);
  };

  return (
    <div className="w-full max-w-md space-y-8">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-brand/10 mb-4">
          <Mail className="w-8 h-8 text-brand" />
        </div>
        <h1 className="text-3xl font-heading font-bold mb-2">
          Forgot Password?
        </h1>
        <p className="text-muted-foreground">
          No worries, we'll send you reset instructions
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="your@email.com"
            {...register('email')}
            className={errors.email ? 'border-destructive' : ''}
          />
          {errors.email && (
            <p className="text-sm text-destructive">{errors.email.message}</p>
          )}
        </div>

        <Button
          type="submit"
          className="w-full bg-brand hover:bg-brand-orange-dark"
          disabled={forgotPasswordMutation.isPending}
        >
          {forgotPasswordMutation.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Sending...
            </>
          ) : (
            'Send Reset Link'
          )}
        </Button>
      </form>

      <div className="text-center">
        <Link
          href="/login"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to login
        </Link>
      </div>
    </div>
  );
}