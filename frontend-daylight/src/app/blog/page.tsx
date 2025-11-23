'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { BlogLayout } from '@/components/blog/blog-layout';
import { BlogCard } from '@/components/blog/blog-card';
import { CategoryFilter } from '@/components/blog/category-filter';
import { BlogSearch } from '@/components/blog/blog-search';
import { useBlogPublicPosts, useFeaturedPosts } from '@/hooks/use-blog-public';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

function BlogContent() {
  const searchParams = useSearchParams();
  const page = parseInt(searchParams.get('page') || '1');
  const category = searchParams.get('category') || '';
  const search = searchParams.get('search') || '';

  const { data: postsData, isLoading } = useBlogPublicPosts({
    page,
    limit: 12,
    categorySlug: category,
    search,
  });

  const { data: featuredPosts, isLoading: featuredLoading } = useFeaturedPosts(3);

  const showFeatured = !category && !search && page === 1;

  return (
    <BlogLayout>
      {/* Hero Section */}
      <section className="bg-linear-to-br from-brand/5 via-white to-orange-50 border-b">
        <div className="container max-w-7xl mx-auto px-4 sm:px-6 py-12 md:py-20">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              DayLight Blog
            </h1>
            <p className="text-lg text-gray-600 mb-8">
              Discover stories, insights, and tips about building meaningful connections
              and creating memorable experiences.
            </p>
            <div className="flex justify-center">
              <BlogSearch />
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12">
        <div className="container max-w-7xl mx-auto px-4 sm:px-6">
          {/* Category Filter */}
          <div className="mb-8">
            <CategoryFilter />
          </div>

          {/* Featured Posts */}
          {showFeatured && (
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Featured Posts</h2>
              {featuredLoading ? (
                <div className="grid grid-cols-1 gap-6">
                  <Skeleton className="h-96" />
                </div>
              ) : featuredPosts && featuredPosts.length > 0 ? (
                <div className="grid grid-cols-1 gap-6">
                  <BlogCard post={featuredPosts[0]} featured />
                  {featuredPosts.length > 1 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {featuredPosts.slice(1).map((post) => (
                        <BlogCard key={post.id} post={post} />
                      ))}
                    </div>
                  )}
                </div>
              ) : null}
            </div>
          )}

          {/* All Posts */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                {search ? `Search Results for "${search}"` : 'All Posts'}
              </h2>
              {postsData?.meta && (
                <p className="text-sm text-gray-500">
                  {postsData.meta.total} article{postsData.meta.total !== 1 ? 's' : ''}
                </p>
              )}
            </div>

            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <Skeleton key={i} className="h-96" />
                ))}
              </div>
            ) : postsData?.data && postsData.data.length > 0 ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {postsData.data.map((post) => (
                    <BlogCard key={post.id} post={post} />
                  ))}
                </div>

                {/* Pagination */}
                {postsData.meta.totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-12">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={page === 1}
                      onClick={() => {
                        const params = new URLSearchParams(searchParams.toString());
                        params.set('page', String(page - 1));
                        window.location.href = `/blog?${params.toString()}`;
                      }}
                    >
                      <ChevronLeft className="w-4 h-4 mr-1" />
                      Previous
                    </Button>

                    <div className="flex items-center gap-1">
                      {[...Array(postsData.meta.totalPages)].map((_, i) => {
                        const pageNum = i + 1;
                        if (
                          pageNum === 1 ||
                          pageNum === postsData.meta.totalPages ||
                          Math.abs(pageNum - page) <= 1
                        ) {
                          return (
                            <Button
                              key={pageNum}
                              variant={page === pageNum ? 'default' : 'outline'}
                              size="sm"
                              onClick={() => {
                                const params = new URLSearchParams(searchParams.toString());
                                params.set('page', String(pageNum));
                                window.location.href = `/blog?${params.toString()}`;
                              }}
                            >
                              {pageNum}
                            </Button>
                          );
                        } else if (Math.abs(pageNum - page) === 2) {
                          return <span key={pageNum}>...</span>;
                        }
                        return null;
                      })}
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      disabled={page === postsData.meta.totalPages}
                      onClick={() => {
                        const params = new URLSearchParams(searchParams.toString());
                        params.set('page', String(page + 1));
                        window.location.href = `/blog?${params.toString()}`;
                      }}
                    >
                      Next
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500">No posts found.</p>
              </div>
            )}
          </div>
        </div>
      </section>
    </BlogLayout>
  );
}

export default function BlogPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <BlogContent />
    </Suspense>
  );
}