// frontend-daylight/src/components/blog/blog-header.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ArrowLeft, LogIn, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/store/auth-store';

export function BlogHeader() {
  const pathname = usePathname();
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = !!user;
  const [mounted, setMounted] = useState(false);

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  // Check if current path matches the nav item
  const isActiveRoute = (path: string) => {
    if (!mounted) return false; // Don't compute active state until mounted
    
    if (path === '/blog') {
      // For blog home, check exact match or if it's a blog post detail page
      return pathname === '/blog' || (pathname.startsWith('/blog/') && !pathname.startsWith('/blog/categories'));
    }
    return pathname.startsWith(path);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-backdrop-filter:bg-white/80">
      <div className="container max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2">
              <h1 className="text-2xl logo-text font-bold text-brand">
                DayLight
              </h1>
            </Link>
            <nav className="hidden md:flex items-center gap-6">
              <Link 
                href="/blog" 
                className={`text-sm font-medium transition-colors relative ${
                  isActiveRoute('/blog')
                    ? 'text-brand'
                    : 'text-gray-700 hover:text-brand'
                }`}
              >
                All Posts
                {isActiveRoute('/blog') && (
                  <span className="absolute -bottom-[21px] left-0 right-0 h-0.5 bg-brand" />
                )}
              </Link>
              <Link 
                href="/blog/categories" 
                className={`text-sm font-medium transition-colors relative ${
                  isActiveRoute('/blog/categories')
                    ? 'text-brand'
                    : 'text-gray-700 hover:text-brand'
                }`}
              >
                Categories
                {isActiveRoute('/blog/categories') && (
                  <span className="absolute -bottom-[21px] left-0 right-0 h-0.5 bg-brand" />
                )}
              </Link>
            </nav>
          </div>

          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              // Show Back to Events for authenticated users
              <Link href="/events">
                <Button variant="ghost" size="sm" className="gap-2">
                  <ArrowLeft className="w-4 h-4" />
                  <span className="hidden sm:inline">Back to Events</span>
                  <span className="sm:hidden">Back</span>
                </Button>
              </Link>
            ) : (
              // Show Sign In and Sign Up for non-authenticated users
              <>
                <Link href="/auth/login">
                  <Button variant="ghost" size="sm" className="flex items-center gap-2 bg-transparent border-2 border-black rounded-full hover:shadow-brutal-sm shadow-brutal transition-all">
                    <LogIn className="w-3 h-3" />
                    <span className="hidden sm:inline">Sign In</span>
                  </Button>
                </Link>
                <Link href="/personality-test">
                  <Button size="sm" className="flex items-center gap-2 bg-brand hover:bg-brand/90 border-2 border-black rounded-full hover:shadow-brutal-sm shadow-brutal transition-all">
                    <UserPlus className="w-3 h-3" />
                    <span className="hidden sm:inline">Sign Up</span>
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}