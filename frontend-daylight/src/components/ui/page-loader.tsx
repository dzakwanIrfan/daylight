import { LoadingSpinner } from './loading-spinner';

interface PageLoaderProps {
  message?: string;
}

export function PageLoader({ message = 'Loading...' }: PageLoaderProps) {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center space-y-4 flex flex-col items-center justify-center">
        <LoadingSpinner size="lg" className='text-center' />
        <p className="text-muted-foreground">{message}</p>
      </div>
    </div>
  );
}