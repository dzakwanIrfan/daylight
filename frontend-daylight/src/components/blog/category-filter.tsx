'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { useBlogPublicCategories } from '@/hooks/use-blog-public';
import { Skeleton } from '@/components/ui/skeleton';

export function CategoryFilter() {
  const searchParams = useSearchParams();
  const currentCategory = searchParams.get('category');
  
  const { data: categories, isLoading } = useBlogPublicCategories();

  if (isLoading) {
    return (
      <div className="flex flex-wrap gap-2">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-8 w-24" />
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      <Link href="/blog">
        <Badge
          variant={!currentCategory ? 'default' : 'outline'}
          className="cursor-pointer hover:bg-brand/90 transition-colors"
        >
          All Posts
        </Badge>
      </Link>
      {categories?.map((category) => (
        <Link key={category.id} href={`/blog?category=${category.slug}`}>
          <Badge
            variant={currentCategory === category.slug ? 'default' : 'outline'}
            className="cursor-pointer hover:bg-brand/90 transition-colors"
          >
            {category.name}
            {category._count?.posts && (
              <span className="ml-1">({category._count.posts})</span>
            )}
          </Badge>
        </Link>
      ))}
    </div>
  );
}