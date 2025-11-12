'use client';

import { useSearchParams } from 'next/navigation';
import { ResetPasswordForm } from '@/components/auth/reset-password-form';
import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  if (!token) {
    return (
      <div className="text-center space-y-4">
        <p className="text-destructive">Invalid or missing reset token</p>
      </div>
    );
  }

  return <ResetPasswordForm token={token} />;
}

export default function ResetPasswordPage() {
  return (
    <div className="flex items-center justify-center min-h-screen px-4 py-12">
      <Suspense
        fallback={
          <div className="flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-brand" />
          </div>
        }
      >
        <ResetPasswordContent />
      </Suspense>
    </div>
  );
}