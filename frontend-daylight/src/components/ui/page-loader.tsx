import { LoadingSpinner } from './loading-spinner';

interface PageLoaderProps {
  message?: string;
}

export function PageLoader({ message = 'Loading...' }: PageLoaderProps) {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center space-y-4">
        <LoadingSpinner size="lg" />
        <p className="text-muted-foreground">{message}</p>
      </div>
    </div>
  );
}