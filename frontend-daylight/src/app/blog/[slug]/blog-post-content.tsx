'use client';

import { BlogLayout } from '@/components/blog/blog-layout';
import { useBlogPublicPost } from '@/hooks/use-blog-public';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, User, ArrowLeft, Share2 } from 'lucide-react';
import { formatDisplayDate } from '@/lib/timezone';
import { ShareButtons } from '@/components/blog/share-buttons';
import { RelatedPosts } from '@/components/blog/related-posts';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useEffect } from 'react';

interface BlogPostContentProps {
  slug: string;
}

export function BlogPostContent({ slug }: BlogPostContentProps) {
  const { data: post, isLoading, error } = useBlogPublicPost(slug);

  // Add structured data for SEO
  useEffect(() => {
    if (post) {
      const structuredData = {
        '@context': 'https://schema.org',
        '@type': 'BlogPosting',
        headline: post.title,
        description: post.excerpt || post.title,
        image: post.coverImage || '',
        datePublished: post.publishedAt,
        dateModified: post.updatedAt || post.publishedAt,
        author: {
          '@type': 'Person',
          name: post.author?.firstName 
            ? `${post.author.firstName} ${post.author.lastName}` 
            : 'DayLight Team',
          image: post.author?.profilePicture || '',
        },
        publisher: {
          '@type': 'Organization',
          name: 'DayLight',
          logo: {
            '@type': 'ImageObject',
            url: '/logo.png',
          },
        },
        mainEntityOfPage: {
          '@type': 'WebPage',
          '@id': `${typeof window !== 'undefined' ? window.location.origin : ''}/blog/${post.slug}`,
        },
        keywords: post.tags?.map(tag => tag.name).join(', '),
        articleSection: post.category?.name || 'General',
        wordCount: post.content ? post.content.replace(/<[^>]*>/g, '').split(/\s+/).length : 0,
      };

      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.text = JSON.stringify(structuredData);
      document.head.appendChild(script);

      return () => {
        document.head.removeChild(script);
      };
    }
  }, [post]);

  if (isLoading) {
    return (
      <BlogLayout>
        <article className="py-12">
          <div className="container max-w-3xl mx-auto px-4 sm:px-6">
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
        <div className="container max-w-3xl mx-auto px-4 sm:px-6 py-12">
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
        {/* Back Button - Outside container for full width background */}
        <div className="border-b border-gray-100 mb-8">
          <div className="container max-w-3xl mx-auto px-4 sm:px-6 py-4">
            <Link href="/blog">
              <Button variant="ghost" size="sm" className="gap-2 -ml-2">
                <ArrowLeft className="w-4 h-4" />
                Back to Blog
              </Button>
            </Link>
          </div>
        </div>

        <div className="container max-w-3xl mx-auto px-4 sm:px-6">
          {/* Header */}
          <header className="mb-12">
            {/* Category Badge */}
            {post.category && (
              <Link href={`/blog?category=${post.category.slug}`}>
                <Badge className="mb-6 bg-brand text-white hover:bg-brand/90 text-xs font-medium px-3 py-1">
                  {post.category.name}
                </Badge>
              </Link>
            )}

            {/* Title */}
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-6 leading-[1.15] tracking-tight">
              {post.title}
            </h1>

            {/* Excerpt */}
            {post.excerpt && (
              <p className="text-lg md:text-xl text-gray-600 mb-8 leading-relaxed font-light">
                {post.excerpt}
              </p>
            )}

            {/* Author Info & Meta */}
            <div className="flex items-center justify-between flex-wrap gap-4 pb-8 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <Link href="#author" className="shrink-0">
                  <div className="w-12 h-12 rounded-full bg-brand/10 flex items-center justify-center overflow-hidden ring-2 ring-white hover:ring-brand/20 transition-all">
                    {post.author?.profilePicture ? (
                      <img
                        src={post.author.profilePicture}
                        alt={authorName}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          if (e.currentTarget.nextElementSibling) {
                            (e.currentTarget.nextElementSibling as HTMLElement).style.display = 'flex';
                          }
                        }}
                      />
                    ) : (
                      <User className="w-6 h-6 text-brand" />
                    )}
                    {post.author?.profilePicture && (
                      <User className="w-6 h-6 text-brand" style={{ display: 'none' }} />
                    )}
                  </div>
                </Link>
                <div className="flex flex-col">
                  <span className="font-medium text-gray-900 text-sm">{authorName}</span>
                  <div className="flex items-center gap-3 text-sm text-gray-500">
                    {post.publishedAt && (
                      <time dateTime={post.publishedAt} className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>{formatDisplayDate(post.publishedAt, 'dd MMM yyyy')}</span>
                      </time>
                    )}
                    {post.readTime && (
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{post.readTime} min read</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Share Button */}
              <Button variant="outline" size="sm" className="gap-2">
                <Share2 className="w-4 h-4" />
                <span className="hidden sm:inline">Share</span>
              </Button>
            </div>
          </header>

          {/* Cover Image */}
          {post.coverImage && (
            <figure className="mb-14 -mx-4 sm:mx-0">
              <img
                src={post.coverImage}
                alt={post.title}
                className="w-full h-auto rounded-none sm:rounded-xl shadow-sm"
                loading="eager"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            </figure>
          )}

          {/* Content - Medium-like styling with better spacing */}
          <div
            className="article-content prose prose-lg max-w-none mb-16
              /* Base text */
              prose-p:text-[21px] prose-p:leading-[1.58] prose-p:text-gray-800
              prose-p:mb-[2em] prose-p:mt-0
              prose-p:font-normal prose-p:tracking-normal
              
              /* Headings with better spacing */
              prose-headings:font-bold prose-headings:text-gray-900 prose-headings:tracking-tight
              prose-h1:text-[32px] prose-h1:leading-tight prose-h1:mb-[0.75em] prose-h1:mt-[1.5em]
              prose-h2:text-[28px] prose-h2:leading-[1.3] prose-h2:mb-[0.5em] prose-h2:mt-[1.75em]
              prose-h3:text-[24px] prose-h3:leading-[1.35] prose-h3:mb-[0.5em] prose-h3:mt-[1.5em]
              
              /* First paragraph no top margin */
              [&>p:first-child]:mt-0
              
              /* Links */
              prose-a:text-brand prose-a:no-underline prose-a:font-normal
              hover:prose-a:underline prose-a:underline-offset-2
              prose-a:transition-all
              
              /* Strong & Emphasis */
              prose-strong:text-gray-900 prose-strong:font-bold
              prose-em:text-gray-800 prose-em:italic
              
              /* Images with caption support */
              prose-img:rounded-lg prose-img:my-10 prose-img:w-full
              prose-img:shadow-sm
              
              /* Blockquotes - Medium style dengan spacing yang benar */
              prose-blockquote:border-l-[3px] prose-blockquote:border-black
              prose-blockquote:pl-[23px] prose-blockquote:pr-0
              prose-blockquote:my-[1em] prose-blockquote:italic
              prose-blockquote:text-[21px] prose-blockquote:leading-[1.58]
              prose-blockquote:text-gray-700 prose-blockquote:font-normal
              [&_blockquote]:ml-[-23px]
              [&_blockquote_p]:my-[0.5em] [&_blockquote_p]:leading-[1.58]
              [&_blockquote_p:first-child]:mt-0 [&_blockquote_p:last-child]:mb-0
              
              /* Code inline */
              prose-code:bg-gray-100 prose-code:text-gray-800
              prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded
              prose-code:text-[18px] prose-code:font-mono
              prose-code:before:content-[''] prose-code:after:content-['']
              prose-code:font-normal
              
              /* Pre & Code blocks */
              prose-pre:bg-gray-900 prose-pre:text-gray-100 prose-pre:rounded-lg
              prose-pre:p-6 prose-pre:my-10 prose-pre:overflow-x-auto
              prose-pre:shadow-md prose-pre:text-[16px] prose-pre:leading-normal
              
              /* Lists with proper spacing */
              prose-ul:my-[1.5em] prose-ul:list-disc prose-ul:pl-[30px]
              prose-ol:my-[1.5em] prose-ol:list-decimal prose-ol:pl-[30px]
              prose-li:text-[21px] prose-li:leading-[1.58] prose-li:my-[0.5em]
              prose-li:text-gray-800 prose-li:marker:text-gray-500
              [&_ul_ul]:my-[0.25em] [&_ol_ol]:my-[0.25em]
              
              /* Nested lists */
              [&_li_p]:mb-[0.5em]
              
              /* Horizontal Rule */
              prose-hr:my-[3em] prose-hr:border-gray-200 prose-hr:border-t
              
              /* Tables */
              prose-table:my-[2em] prose-table:text-[18px]
              prose-thead:border-b-2 prose-thead:border-gray-300
              prose-th:py-3 prose-th:px-4 prose-th:text-left prose-th:font-semibold prose-th:text-[16px]
              prose-td:py-3 prose-td:px-4 prose-td:border-t prose-td:border-gray-200
              prose-td:text-[18px] prose-td:leading-[1.58]
              
              /* Figure & Figcaption */
              prose-figure:my-10
              prose-figcaption:text-center prose-figcaption:text-[16px] 
              prose-figcaption:leading-[1.4] prose-figcaption:text-gray-500 
              prose-figcaption:mt-3 prose-figcaption:italic"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-12 pb-12 border-b border-gray-200">
              {post.tags.map((tag) => (
                <Link key={tag.id} href={`/blog?tag=${tag.slug}`}>
                  <Badge 
                    variant="outline" 
                    className="hover:bg-gray-100 cursor-pointer px-3 py-1.5 text-sm font-normal"
                  >
                    {tag.name}
                  </Badge>
                </Link>
              ))}
            </div>
          )}

          {/* Share Section */}
          <div className="py-8 mb-12 border-y border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Share this article</h3>
              <ShareButtons url={`/blog/${post.slug}`} title={post.title} />
            </div>
          </div>

          {/* Author Card */}
          <div id="author" className="bg-gray-50 rounded-2xl p-8 mb-16 scroll-mt-8">
            <div className="flex items-start gap-5">
              <div className="w-20 h-20 rounded-full bg-brand/10 flex items-center justify-center shrink-0 overflow-hidden ring-4 ring-white">
                {post.author?.profilePicture ? (
                  <img
                    src={post.author.profilePicture}
                    alt={authorName}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      if (e.currentTarget.nextElementSibling) {
                        (e.currentTarget.nextElementSibling as HTMLElement).style.display = 'flex';
                      }
                    }}
                  />
                ) : (
                  <User className="w-10 h-10 text-brand" />
                )}
                {post.author?.profilePicture && (
                  <User className="w-10 h-10 text-brand" style={{ display: 'none' }} />
                )}
              </div>
              <div className="flex-1">
                <div className="text-sm text-gray-500 uppercase tracking-wider mb-1 font-medium">
                  Written by
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {authorName}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Contributing to DayLight's mission of connecting people through meaningful experiences.
                </p>
              </div>
            </div>
          </div>

          {/* Related Posts */}
          <div className="border-t border-gray-200 pt-12">
            <RelatedPosts postId={post.id} />
          </div>
        </div>
      </article>
    </BlogLayout>
  );
}