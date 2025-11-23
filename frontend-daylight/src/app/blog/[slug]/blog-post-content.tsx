'use client';

import { BlogLayout } from '@/components/blog/blog-layout';
import { useBlogPublicPost } from '@/hooks/use-blog-public';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, User, ArrowLeft } from 'lucide-react';
import { formatDisplayDate } from '@/lib/timezone';
import { ShareButtons } from '@/components/blog/share-buttons';
import { RelatedPosts } from '@/components/blog/related-posts';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

interface BlogPostContentProps {
  slug: string;
}

export function BlogPostContent({ slug }: BlogPostContentProps) {
  const { data: post, isLoading, error } = useBlogPublicPost(slug);

  if (isLoading) {
    return (
      <BlogLayout>
        <article className="py-12">
          <div className="container max-w-4xl mx-auto px-4 sm:px-6">
            <Skeleton className="h-8 w-32 mb-8" />
            <Skeleton className="h-12 w-3/4 mb-4" />
            <Skeleton className="h-4 w-1/2 mb-8" />
            <Skeleton className="h-96 w-full mb-8" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        </article>
      </BlogLayout>
    );
  }

  if (error || !post) {
    return (
      <BlogLayout>
        <div className="container max-w-4xl mx-auto px-4 sm:px-6 py-12">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Post Not Found</h1>
            <p className="text-gray-600 mb-8">
              The blog post you're looking for doesn't exist or has been removed.
            </p>
            <Link href="/blog">
              <Button>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Blog
              </Button>
            </Link>
          </div>
        </div>
      </BlogLayout>
    );
  }

  // Safe author name extraction with fallback
  const getAuthorName = () => {
    if (!post.author) return 'DayLight Team';
    
    const { firstName, lastName } = post.author;
    
    if (firstName && lastName) {
      return `${firstName} ${lastName}`.trim();
    }
    
    if (firstName) return firstName;
    if (lastName) return lastName;
    
    return 'DayLight Team';
  };

  const authorName = getAuthorName();

  return (
    <BlogLayout>
      <article className="py-8 md:py-12">
        <div className="container max-w-4xl mx-auto px-4 sm:px-6">
          {/* Back Button */}
          <Link href="/blog">
            <Button variant="ghost" size="sm" className="mb-6 gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back to Blog
            </Button>
          </Link>

          {/* Header */}
          <header className="mb-8">
            {/* Category Badge */}
            {post.category && (
              <Link href={`/blog?category=${post.category.slug}`}>
                <Badge className="mb-4 bg-brand text-white hover:bg-brand/90">
                  {post.category.name}
                </Badge>
              </Link>
            )}

            {/* Title */}
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 leading-tight">
              {post.title}
            </h1>

            {/* Excerpt */}
            {post.excerpt && (
              <p className="text-lg text-gray-600 mb-6">{post.excerpt}</p>
            )}

            {/* Meta Info */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 pb-6 border-b border-gray-200">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-brand/10 flex items-center justify-center">
                  {post.author?.profilePicture ? (
                    <img
                      src={post.author.profilePicture}
                      alt={authorName}
                      className="w-full h-full rounded-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        if (e.currentTarget.nextElementSibling) {
                          (e.currentTarget.nextElementSibling as HTMLElement).style.display = 'flex';
                        }
                      }}
                    />
                  ) : (
                    <User className="w-5 h-5 text-brand" />
                  )}
                  {post.author?.profilePicture && (
                    <User className="w-5 h-5 text-brand" style={{ display: 'none' }} />
                  )}
                </div>
                <span className="font-medium text-gray-900">{authorName}</span>
              </div>

              {post.publishedAt && (
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  <span>{formatDisplayDate(post.publishedAt, 'dd MMMM yyyy')}</span>
                </div>
              )}

              {post.readTime && (
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span>{post.readTime} min read</span>
                </div>
              )}
            </div>

            {/* Tags */}
            {post.tags && post.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-6">
                {post.tags.map((tag) => (
                  <Link key={tag.id} href={`/blog?tag=${tag.slug}`}>
                    <Badge variant="outline" className="hover:bg-gray-100 cursor-pointer">
                      #{tag.name}
                    </Badge>
                  </Link>
                ))}
              </div>
            )}
          </header>

          {/* Cover Image */}
          {post.coverImage && (
            <div className="mb-8 rounded-xl overflow-hidden">
              <img
                src={post.coverImage}
                alt={post.title}
                className="w-full h-auto"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            </div>
          )}

          {/* Content */}
          <div
            className="prose prose-lg max-w-none mb-12
              prose-headings:font-bold prose-headings:text-gray-900
              prose-h1:text-3xl prose-h2:text-2xl prose-h3:text-xl
              prose-p:text-gray-700 prose-p:leading-relaxed
              prose-a:text-brand prose-a:no-underline hover:prose-a:underline
              prose-strong:text-gray-900 prose-strong:font-semibold
              prose-img:rounded-lg prose-img:shadow-md
              prose-blockquote:border-l-4 prose-blockquote:border-brand prose-blockquote:pl-4 prose-blockquote:italic
              prose-code:bg-gray-100 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:text-sm
              prose-pre:bg-gray-900 prose-pre:text-gray-100
              prose-ul:list-disc prose-ol:list-decimal
              prose-li:text-gray-700"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />

          {/* Share Buttons */}
          <div className="py-6 border-y border-gray-200 mb-12">
            <ShareButtons url={`/blog/${post.slug}`} title={post.title} />
          </div>

          {/* Author Card */}
          <div className="bg-gray-50 rounded-xl p-6 mb-12">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-full bg-brand/10 flex items-center justify-center shrink-0">
                {post.author?.profilePicture ? (
                  <img
                    src={post.author.profilePicture}
                    alt={authorName}
                    className="w-full h-full rounded-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      if (e.currentTarget.nextElementSibling) {
                        (e.currentTarget.nextElementSibling as HTMLElement).style.display = 'flex';
                      }
                    }}
                  />
                ) : (
                  <User className="w-8 h-8 text-brand" />
                )}
                {post.author?.profilePicture && (
                  <User className="w-8 h-8 text-brand" style={{ display: 'none' }} />
                )}
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">
                  Written by {authorName}
                </h3>
                <p className="text-sm text-gray-600">
                  Contributing to DayLight's mission of connecting people through meaningful experiences.
                </p>
              </div>
            </div>
          </div>

          {/* Related Posts */}
          <RelatedPosts postId={post.id} />
        </div>
      </article>
    </BlogLayout>
  );
}