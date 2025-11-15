import { AlertCircle, XCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { cn } from '@/lib/utils';

interface ErrorAlertProps {
  error: string | string[] | null;
  title?: string;
  className?: string;
  onDismiss?: () => void;
}

export function ErrorAlert({ error, title, className, onDismiss }: ErrorAlertProps) {
  if (!error) return null;

  const errors = Array.isArray(error) ? error : [error];

  return (
    <Alert variant="destructive" className={cn('relative', className)}>
      <AlertCircle className="h-4 w-4" />
      {title && <AlertTitle>{title}</AlertTitle>}
      <AlertDescription>
        {errors.length === 1 ? (
          <span>{errors[0]}</span>
        ) : (
          <ul className="list-disc list-inside space-y-1">
            {errors.map((err, idx) => (
              <li key={idx}>{err}</li>
            ))}
          </ul>
        )}
      </AlertDescription>
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="absolute top-3 right-3 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none"
        >
          <XCircle className="h-4 w-4" />
          <span className="sr-only">Dismiss</span>
        </button>
      )}
    </Alert>
  );
}