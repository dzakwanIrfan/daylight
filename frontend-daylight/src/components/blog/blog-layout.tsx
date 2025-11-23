'use client';

import { BlogHeader } from './blog-header';
import { BlogFooter } from './blog-footer';

interface BlogLayoutProps {
  children: React.ReactNode;
}

export function BlogLayout({ children }: BlogLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <BlogHeader />
      <main className="flex-1">
        {children}
      </main>
      <BlogFooter />
    </div>
  );
}