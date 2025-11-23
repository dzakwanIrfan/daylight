'use client';

import { BlogCard } from './blog-card';
import { useRelatedPosts } from '@/hooks/use-blog-public';
import { Skeleton } from '@/components/ui/skeleton';

interface RelatedPostsProps {
  postId: string;
}

export function RelatedPosts({ postId }: RelatedPostsProps) {
  const { data: relatedPosts, isLoading } = useRelatedPosts(postId);

  if (isLoading) {
    return (
      <div className="mt-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Related Articles</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-80" />
          ))}
        </div>
      </div>
    );
  }

  if (!relatedPosts || relatedPosts.length === 0) {
    return null;
  }

  return (
    <div className="mt-12">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Related Articles</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {relatedPosts.map((post) => (
          <BlogCard key={post.id} post={post as any} />
        ))}
      </div>
    </div>
  );
}