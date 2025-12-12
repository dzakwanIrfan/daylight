"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useMutation } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Loader2, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ErrorAlert } from "@/components/ui/error-alert";
import { authService } from "@/services/auth.service";
import { useAuthStore } from "@/store/auth-store";
import { ApiError, getUserFriendlyErrorMessage } from "@/lib/api-error";
import Image from "next/image";
import { Button as ButtonDaylight } from "@/components/company-profile/components/button";
import { MeshGradient } from "@blur-ui/mesh-gradient";

const loginSchema = z.object({
  email: z.email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const setAuth = useAuthStore((state) => state.setAuth);
  const [showPassword, setShowPassword] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const loginMutation = useMutation({
    mutationFn: authService.login,
    onSuccess: (data) => {
      if (data.success && data.user && data.accessToken) {
        setApiError(null);
        setAuth(data.user);

        toast.success("Welcome back!", {
          description: `Hello ${data.user.firstName}!`,
          duration: 3000,
        });

        const redirectTo = searchParams?.get("redirect") || "/";

        setTimeout(() => {
          router.push(redirectTo);
          router.refresh();
        }, 500);
      }
    },
    onError: (error: any) => {
      if (error instanceof ApiError) {
        const friendlyMessage = getUserFriendlyErrorMessage(error);
        setApiError(friendlyMessage);

        toast.error("Login failed", {
          description: friendlyMessage,
          duration: 6000,
        });
      } else {
        const fallbackMessage =
          "An unexpected error occurred. Please try again.";
        setApiError(fallbackMessage);

        toast.error("Login failed", {
          description: fallbackMessage,
          duration: 6000,
        });
      }
    },
  });

  const onSubmit = (data: LoginFormData) => {
    setApiError(null);
    loginMutation.mutate(data);
  };

  const handleGoogleLogin = () => {
    authService.googleLogin();
  };

  return (
    <div className="relative w-full h-full space-y-8 flex flex-col md:flex-row p-4 md:p-0">
      <div className="fixed inset-0 -z-10 w-full h-full">
        <MeshGradient
          colors={{
            color1: "#FFF0E6",
            color2: "#FEECA7",
            color3: "#bdffd2",
            color4: "#e3cfff",
          }}
          opacity={0.8}
          className="w-full h-full"
          style={{ width: "100%", height: "100%" }}
        />
      </div>
      <div className="flex flex-col py-10 md:p-10 w-full md:w-1/3">
        <div className="text-center md:text-left flex flex-col">
          <h1 className="text-4xl font-bold text-brand mb-2 logo-text md:mb-8">
            DayLight
          </h1>
          <h2 className="text-2xl font-semibold mb-2">Welcome Back</h2>
          <p className="">
            We’ve missed you. Let’s sign in to check upcoming events.
          </p>
        </div>
        <div className="relative">
          <div className="absolute">
            <Image
              src="/images/login/maskot.png"
              alt="maskot"
              height={500}
              width={500}
              className="object-cover drop-shadow-lg hidden md:block"
            />
          </div>
        </div>
      </div>
      <div className="w-full md:w-2/3 px-3 md:px-64 border-2 border-orange-400 rounded-2xl md:rounded-l-2xl space-y-8 py-12 h-full bg-white/30 backdrop-blur-lg inset-shadow-sm inset-shadow-white">
        <h1 className="text-4xl font-bold text-center w-full md:mt-6">Sign In</h1>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="your@email.com"
              autoComplete="email"
              {...register("email")}
              className={`rounded-full px-6 py-4 bg-white! text-gray-800 placeholder:text-gray-500 shadow-[0_6px_12px_rgba(0,0,0,0.08)] border border-white focus:outline-none focus:ring-2 focus:ring-[#f2ac55] {errors.email ? "border-destructive" : ""}`}
              disabled={loginMutation.isPending}
            />
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Password</Label>
              <Link
                href="/auth/forgot-password"
                className="text-sm text-brand hover:underline"
              >
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                autoComplete="current-password"
                {...register("password")}
                className={`rounded-full px-6 py-4 bg-white! text-gray-800 placeholder:text-gray-500 shadow-[0_6px_12px_rgba(0,0,0,0.08)] border border-white focus:outline-none focus:ring-2 focus:ring-[#f2ac55] {
                  errors.password ? "border-destructive pr-10" : "pr-10"
                }`}
                disabled={loginMutation.isPending}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                disabled={loginMutation.isPending}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.password && (
              <p className="text-sm text-destructive">
                {errors.password.message}
              </p>
            )}
          </div>

          <Button
            type="submit"
            className="w-full font-bold bg-radial-[at_50%_50%] from-yellow-glow from-40% to-brand to-90% rounded-full text-black outline-2 outline-white"
            disabled={loginMutation.isPending}
          >
            {loginMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Signing in...
              </>
            ) : (
              "Sign In"
            )}
          </Button>
        </form>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="px-2 text-muted-foreground">
              Or continue with
            </span>
          </div>
        </div>

        <Button
          type="button"
          className="w-full border-2 rounded-full font-bold border-black bg-white text-black hover:bg-gray-100"
          onClick={handleGoogleLogin}
          disabled={loginMutation.isPending}
        >
          <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              fill="#EA4335"
            />
          </svg>
          Sign in with Google
        </Button>
        <div className="w-full flex justify-center">
          <div className="w-full text-center text-sm md:text-base">
            By signing up you agreee to the <a href="/terms" className="font-bold underline">Terms of Service</a>, <a href="/privacy" className="font-bold underline">Privacy Policy</a>, and <a href="/community-guidelines" className="font-bold underline">Community Guidelines</a>
          </div>
        </div>
        <div className="flex flex-col gap-2 justify-center w-full items-center">
          <h3 className="font-bold">New user?</h3>
          <ButtonDaylight href="/personality-test" className="w-fit px-4 text-sm md:text-base">
            Take Persona Quiz
          </ButtonDaylight>
        </div>
      </div>

      <ErrorAlert error={apiError} onDismiss={() => setApiError(null)} />
    </div>
  );
}