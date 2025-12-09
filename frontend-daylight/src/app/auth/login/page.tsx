"use client";

import { Suspense } from 'react';
import { LoginForm } from '@/components/auth/login-form';
import { useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import { toast } from 'sonner';

function LoginContent() {
  const searchParams = useSearchParams();

  useEffect(() => {
    if (searchParams.get('session') === 'expired') {
      setTimeout(() => {
        toast.error('Sesi Anda telah kedaluwarsa. Silakan masuk kembali.');
      }, 0);
    }
  }, [searchParams]);

  return <LoginForm />;
}

export default function LoginPage() {
  return (
    <div className="flex items-center justify-center min-h-screen px-4 py-12">
      <Suspense fallback={<div>Loading...</div>}>
        <LoginContent />
      </Suspense>
    </div>
  );
}