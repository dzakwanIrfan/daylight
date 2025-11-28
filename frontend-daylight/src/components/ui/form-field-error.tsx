'use client';

import { cn } from '@/lib/utils';
import { AlertCircle } from 'lucide-react';

interface FormFieldErrorProps {
  message?: string;
  className?: string;
}

export function FormFieldError({ message, className }: FormFieldErrorProps) {
  if (!message) return null;

  return (
    <div className={cn('flex items-center gap-1.5 mt-1.5', className)}>
      <AlertCircle className="h-3.5 w-3.5 text-red-500 shrink-0" />
      <p className="text-xs text-red-600 leading-tight">{message}</p>
    </div>
  );
}