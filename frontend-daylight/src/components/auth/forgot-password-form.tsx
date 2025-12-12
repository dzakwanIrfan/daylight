'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useMutation } from '@tanstack/react-query';
import Link from 'next/link';
import { Loader2, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { authService } from '@/services/auth.service';
import { MeshGradient } from "@blur-ui/mesh-gradient";

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
        duration: 6000,
      });
      reset();
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Something went wrong';
      toast.error('Request failed', {
        description: Array.isArray(message) ? message.join(', ') : message,
        duration: 6000,
      });
    },
  });

  const onSubmit = (data: ForgotPasswordFormData) => {
    forgotPasswordMutation.mutate(data);
  };

  return (
    <div className="w-full max-w-md space-y-8">
      <div className="fixed inset-0 -z-10 w-full h-full">
        <MeshGradient
          colors={{
            color1: "#FFF0E6",
            color2: "#FEECA7",
            color3: "#FEECA7",
            color4: "#e3cfff",
          }}
          opacity={0.8}
          className="w-full h-full"
          style={{ width: "100%", height: "100%" }}
        />
      </div>
      <div className="text-center md:text-left">
        <h1 className="text-3xl font-bold mb-2">
          Forgot Password?
        </h1>
        <p className="text-muted-foreground">
          No worries, we&apos;ll send you reset instructions
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 p-10 border-2 border-orange-400 rounded-2xl bg-white/20 backdrop-blur-lg inset-shadow-sm inset-shadow-white">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="your@email.com"
            autoComplete="email"
            {...register('email')}
            className={`rounded-full px-6 py-4 bg-white! text-gray-800 placeholder:text-gray-500 shadow-[0_6px_12px_rgba(0,0,0,0.08)] border border-white focus:outline-none focus:ring-2 focus:ring-[#f2ac55] {errors.email ? 'border-destructive' : ''}`}
            disabled={forgotPasswordMutation.isPending}
          />
          {errors.email && (
            <p className="text-sm text-destructive">{errors.email.message}</p>
          )}
        </div>

        <Button
          type="submit"
          className="w-fit font-bold bg-radial-[at_50%_50%] from-yellow-glow from-40% to-brand to-90% rounded-full text-black outline-2 outline-white"
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
          href="/auth/login"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to login
        </Link>
      </div>
    </div>
  );
}