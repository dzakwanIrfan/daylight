'use client';

import { BlogLayout } from '@/components/blog/blog-layout';
import { useBlogPublicCategories } from '@/hooks/use-blog-public';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';
import { ArrowRight, FolderOpen } from 'lucide-react';

export default function CategoriesPage() {
  const { data: categories, isLoading } = useBlogPublicCategories();

  return (
    <BlogLayout>
      <div className="py-12">
        <div className="container max-w-7xl mx-auto px-4 sm:px-6">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Blog Categories</h1>
            <p className="text-lg text-gray-600">
              Explore articles organized by topics and themes
            </p>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Skeleton key={i} className="h-40" />
              ))}
            </div>
          ) : categories && categories.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {categories.map((category) => (
                <Link key={category.id} href={`/blog?category=${category.slug}`}>
                  <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg hover:border-brand/50 transition-all group">
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-12 h-12 rounded-lg bg-brand/10 flex items-center justify-center group-hover:bg-brand group-hover:text-white transition-colors">
                        <FolderOpen className="w-6 h-6 text-brand group-hover:text-white" />
                      </div>
                      <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-brand group-hover:translate-x-1 transition-all" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-brand transition-colors">
                      {category.name}
                    </h3>
                    {category.description && (
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                        {category.description}
                      </p>
                    )}
                    {category._count?.posts !== undefined && (
                      <p className="text-sm text-gray-500">
                        {category._count.posts} article{category._count.posts !== 1 ? 's' : ''}
                      </p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500">No categories found.</p>
            </div>
          )}
        </div>
      </div>
    </BlogLayout>
  );
}