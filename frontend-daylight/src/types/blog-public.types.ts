import { BlogPost, BlogCategory, BlogTag, BlogPostsResponse } from './blog.types';

export interface BlogPublicQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  categorySlug?: string;
  tagSlug?: string;
  featured?: boolean;
}

export interface RelatedPost {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  coverImage?: string;
  publishedAt: string;
  readTime?: number;
  category?: BlogCategory;
}