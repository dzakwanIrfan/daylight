'use client';

import Link from 'next/link';
import { Calendar, Clock, User } from 'lucide-react';
import { formatDisplayDate } from '@/lib/timezone';
import { Badge } from '@/components/ui/badge';
import { BlogPost } from '@/types/blog.types';

interface BlogCardProps {
  post: BlogPost;
  featured?: boolean;
}

export function BlogCard({ post, featured = false }: BlogCardProps) {
  const authorName = post.author.firstName && post.author.lastName
    ? `${post.author.firstName} ${post.author.lastName}`
    : 'DayLight Team';

  return (
    <Link href={`/blog/${post.slug}`}>
      <article
        className={`group bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300 h-full flex flex-col ${
          featured ? 'md:flex-row' : ''
        }`}
      >
        {/* Image */}
        {post.coverImage && (
          <div className={`relative overflow-hidden bg-gray-100 ${
            featured ? 'md:w-1/2' : 'w-full h-48'
          }`}>
            <img
              src={post.coverImage}
              alt={post.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
            {post.category && (
              <Badge className="absolute top-4 left-4 bg-brand text-white">
                {post.category.name}
              </Badge>
            )}
          </div>
        )}

        {/* Content */}
        <div className={`p-6 flex flex-col flex-1 ${featured ? 'md:w-1/2' : ''}`}>
          <div className="flex-1">
            <h3 className={`font-semibold text-gray-900 mb-2 group-hover:text-brand transition-colors line-clamp-2 ${
              featured ? 'text-2xl' : 'text-lg'
            }`}>
              {post.title}
            </h3>

            {post.excerpt && (
              <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                {post.excerpt}
              </p>
            )}

            {/* Tags */}
            {post.tags && post.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {post.tags.slice(0, 3).map((tag) => (
                  <Badge key={tag.id} variant="outline" className="text-xs">
                    {tag.name}
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Meta */}
          <div className="flex items-center gap-4 text-xs text-gray-500 pt-4 border-t border-gray-100">
            <div className="flex items-center gap-1">
              <User className="w-3 h-3" />
              <span>{authorName}</span>
            </div>
            {post.publishedAt && (
              <div className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                <span>{formatDisplayDate(post.publishedAt, 'dd MMM yyyy')}</span>
              </div>
            )}
            {post.readTime && (
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                <span>{post.readTime} min read</span>
              </div>
            )}
          </div>
        </div>
      </article>
    </Link>
  );
}