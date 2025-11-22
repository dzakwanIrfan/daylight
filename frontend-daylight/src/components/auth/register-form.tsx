'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Loader2, Eye, EyeOff, CheckCircle2, XCircle, Mail, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { authService } from '@/services/auth.service';
import { personalityService } from '@/services/personality.service';
import { usePersonalityTestStore } from '@/store/personality-test-store';

const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
      'Password must contain uppercase, lowercase, number and special character'
    ),
  confirmPassword: z.string().min(1, 'Please confirm your password'),
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  phoneNumber: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

type RegisterFormData = z.infer<typeof registerSchema>;

export function RegisterForm() {
  const router = useRouter();
  const { sessionId, reset: resetPersonalityTest, setTestCompleted, isTestCompleted } = usePersonalityTestStore();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [apiError, setApiError] = useState<string | null>(null);

  // Fetch personality result untuk preview
  const { data: personalityResult, isLoading: isLoadingResult } = useQuery({
    queryKey: ['personality-result-preview', sessionId],
    queryFn: () => personalityService.getResult(sessionId),
    enabled: !!sessionId && isTestCompleted,
  });

  useEffect(() => {
    if (registrationSuccess) return;
    
    if (!sessionId || !isTestCompleted) {
      toast.error('Please complete the persona test first', {
        description: 'You need to take the persona test before registering.',
        duration: 5000,
      });
      router.push('/personality-test');
    }
  }, [sessionId, isTestCompleted, registrationSuccess, router]);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
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

  const registerMutation = useMutation({
    mutationFn: authService.register,
    onSuccess: (data) => {
      if (data.success) {
        setApiError(null);
        setUserEmail(data.user.email);
        setRegistrationSuccess(true);
        
        // Reset personality test data setelah berhasil register
        resetPersonalityTest();
        
        toast.success('Registration successful!', {
          description: 'Please check your email to verify your account.',
          duration: 6000,
        });
      }
    },
    onError: (error: any) => {
      const errorMessage = error?.response?.data?.message || error?.message || 'Registration failed. Please try again.';
      setApiError(errorMessage);
      
      toast.error('Registration failed', {
        description: errorMessage,
        duration: 6000,
      });
    },
  });

  const resendMutation = useMutation({
    mutationFn: authService.resendVerification,
    onSuccess: () => {
      toast.success('Verification email sent!', {
        description: 'Please check your inbox.',
        duration: 5000,
      });
    },
    onError: (error: any) => {
      const errorMessage = error?.response?.data?.message || 'Failed to resend email. Please try again later.';
      toast.error('Failed to resend email', {
        description: errorMessage,
        duration: 5000,
      });
    },
  });

  const onSubmit = (data: RegisterFormData) => {
    if (!sessionId) {
      toast.error('Session expired', {
        description: 'Please take the persona test again before registering.',
        duration: 6000,
        action: {
          label: 'Take Test',
          onClick: () => router.push('/personality-test'),
        },
      });
      return;
    }

    setApiError(null);

    registerMutation.mutate({
      email: data.email,
      password: data.password,
      confirmPassword: data.confirmPassword,
      firstName: data.firstName,
      lastName: data.lastName,
      phoneNumber: data.phoneNumber || undefined,
      sessionId,
    });
  };

  const handleGoogleRegister = () => {
    if (!sessionId) {
      toast.error('Please complete the persona test first', {
        description: 'You need to take the persona test before registering.',
        duration: 6000,
        action: {
          label: 'Take Test',
          onClick: () => router.push('/personality-test'),
        },
      });
      return;
    }
    
    authService.googleLogin(sessionId);
  };

  const handleResendVerification = () => {
    if (userEmail) {
      resendMutation.mutate({ email: userEmail });
    }
  };

  // Success screen
  if (registrationSuccess) {
    return (
      <div className="w-full max-w-md space-y-8 text-center">
        <div className="flex justify-center">
          <div className="rounded-full bg-green-100 p-4">
            <Mail className="h-16 w-16 text-green-600" />
          </div>
        </div>
        
        <div className="space-y-4">
          <h2 className="text-3xl font-bold text-gray-900">Check Your Email</h2>
          <div className="space-y-2">
            <p className="text-gray-600">
              We've sent a verification link to:
            </p>
            <p className="font-semibold text-gray-900">{userEmail}</p>
          </div>
          <p className="text-sm text-gray-500">
            Click the link in the email to verify your account and start using DayLight.
          </p>
        </div>

        <div className="space-y-3">
          <Button
            onClick={handleResendVerification}
            variant="outline"
            className="w-full border border-r-4 border-b-4 border-black rounded-full font-bold"
            disabled={resendMutation.isPending}
          >
            {resendMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : (
              'Resend Verification Email'
            )}
          </Button>

          <Button
            onClick={() => router.push('/auth/login')}
            className="w-full bg-brand hover:bg-brand/90 border border-r-4 border-b-4 border-black rounded-full font-bold text-white"
          >
            Go to Login
          </Button>
        </div>

        <p className="text-xs text-gray-500">
          Didn't receive the email? Check your spam folder or click resend.
        </p>
      </div>
    );
  }

  // Main form
  return (
    <div className="w-full max-w-md space-y-6 py-8">
      <div className="text-center">
        <h1 className="text-4xl logo-text font-bold text-brand mb-2">DayLight</h1>
        <h2 className="text-2xl font-semibold mb-2">Create Your Account</h2>
        <p className="text-muted-foreground">One last step to start your journey</p>
      </div>

      {/* Personality Test Completed Card */}
      {sessionId && isTestCompleted && (
        <Card className="border border-brand/20 bg-linear-to-r from-brand/5 to-brand/10">
          <CardContent>
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-green-100">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">
                  Persona test complete
                </p>
                <p className="text-xs text-muted-foreground">
                  Register to see your results and find your people
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {isLoadingResult && sessionId && isTestCompleted && (
        <Card className="border-2 border-brand/30 bg-brand/5">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-3">
              <Loader2 className="w-6 h-6 animate-spin text-brand" />
              <span className="text-sm text-muted-foreground">Loading...</span>
            </div>
          </CardContent>
        </Card>
      )}

      {apiError && (
        <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4">
          <p className="text-sm text-red-800">{apiError}</p>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="firstName">First Name *</Label>
            <Input
              id="firstName"
              placeholder="John"
              {...register('firstName')}
              className={errors.firstName ? 'border-destructive' : ''}
              disabled={registerMutation.isPending}
            />
            {errors.firstName && (
              <p className="text-sm text-destructive">{errors.firstName.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="lastName">Last Name *</Label>
            <Input
              id="lastName"
              placeholder="Doe"
              {...register('lastName')}
              className={errors.lastName ? 'border-destructive' : ''}
              disabled={registerMutation.isPending}
            />
            {errors.lastName && (
              <p className="text-sm text-destructive">{errors.lastName.message}</p>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email *</Label>
          <Input
            id="email"
            type="email"
            placeholder="your@email.com"
            {...register('email')}
            className={errors.email ? 'border-destructive' : ''}
            disabled={registerMutation.isPending}
          />
          {errors.email && (
            <p className="text-sm text-destructive">{errors.email.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="phoneNumber">Phone Number (Optional)</Label>
          <Input
            id="phoneNumber"
            type="tel"
            placeholder="+62 812 3456 7890"
            {...register('phoneNumber')}
            disabled={registerMutation.isPending}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Password *</Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              {...register('password')}
              className={errors.password ? 'border-destructive pr-10' : 'pr-10'}
              disabled={registerMutation.isPending}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              disabled={registerMutation.isPending}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
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
          <Label htmlFor="confirmPassword">Confirm Password *</Label>
          <div className="relative">
            <Input
              id="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              placeholder="••••••••"
              {...register('confirmPassword')}
              className={errors.confirmPassword ? 'border-destructive pr-10' : 'pr-10'}
              disabled={registerMutation.isPending}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              disabled={registerMutation.isPending}
            >
              {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {errors.confirmPassword && (
            <p className="text-sm text-destructive">{errors.confirmPassword.message}</p>
          )}
        </div>

        <Button
          type="submit"
          className="w-full bg-brand hover:bg-brand/90 border border-r-4 border-b-4 border-black rounded-full font-bold text-white"
          disabled={registerMutation.isPending || !sessionId}
        >
          {registerMutation.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating account...
            </>
          ) : (
            'Create Account'
          )}
        </Button>
      </form>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-white px-2 text-muted-foreground">Or register with</span>
        </div>
      </div>

      <Button
        type="button"
        variant="outline"
        className="w-full border border-r-4 border-b-4 border-black rounded-full font-bold"
        onClick={handleGoogleRegister}
        disabled={registerMutation.isPending || !sessionId}
      >
        <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
        </svg>
        Continue with Google
      </Button>

      {!sessionId && (
        <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-4">
          <p className="text-sm text-yellow-800 text-center">
            Please complete the persona test first before registering
          </p>
          <Button
            onClick={() => router.push('/personality-test')}
            variant="outline"
            className="w-full mt-3 border-yellow-400"
          >
            Take Persona Test
          </Button>
        </div>
      )}

      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{' '}
        <Link href="/auth/login" className="text-brand hover:underline font-medium">
          Sign in
        </Link>
      </p>

      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="flex flex-wrap justify-center gap-4 text-xs text-muted-foreground">
          <Link href="/terms" className="hover:text-brand transition-colors">
            Terms & Conditions
          </Link>
          <span>•</span>
          <Link href="/privacy" className="hover:text-brand transition-colors">
            Privacy Policy
          </Link>
          <span>•</span>
          <Link href="/community-guidelines" className="hover:text-brand transition-colors">
            Community Guidelines
          </Link>
          <span>•</span>
          <Link href="/contact" className="hover:text-brand transition-colors">
            Contact
          </Link>
        </div>
      </div>
    </div>
  );
}