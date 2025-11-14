import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Home } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="flex items-center justify-center min-h-screen px-4">
      <div className="text-center space-y-6">
        <h1 className="text-9xl font-heading font-bold text-brand">404</h1>
        <div className="space-y-2">
          <h2 className="text-3xl font-heading font-bold">Page Not Found</h2>
          <p className="text-muted-foreground max-w-md">
            The page you're looking for doesn't exist or has been moved.
          </p>
        </div>
        <Button asChild className="bg-brand hover:bg-brand-dark border border-black text-white font-bold">
          <Link href="/">
            <Home className="mr-2 h-4 w-4" />
            Back to Home
          </Link>
        </Button>
      </div>
    </div>
  );
}