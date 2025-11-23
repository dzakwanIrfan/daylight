import apiClient from '@/lib/axios';
import type {
  BlogPublicQueryParams,
  RelatedPost,
} from '@/types/blog-public.types';
import { BlogCategory, BlogPost, BlogPostsResponse, BlogTag } from '@/types/blog.types';

class BlogPublicService {
  private readonly baseURL = '/blog';

  // Get published posts (public)
  async getPublishedPosts(params?: BlogPublicQueryParams): Promise<BlogPostsResponse> {
    const response = await apiClient.get(`${this.baseURL}/public/posts`, { params });
    return response.data;
  }

  // Get post by slug (public)
  async getPostBySlug(slug: string): Promise<BlogPost> {
    const response = await apiClient.get(`${this.baseURL}/public/posts/${slug}`);
    return response.data;
  }

  // Get related posts
  async getRelatedPosts(postId: string, limit: number = 3): Promise<RelatedPost[]> {
    const response = await apiClient.get(`${this.baseURL}/public/posts/${postId}/related`, {
      params: { limit },
    });
    return response.data;
  }

  // Get featured posts
  async getFeaturedPosts(limit: number = 5): Promise<BlogPost[]> {
    const response = await apiClient.get(`${this.baseURL}/public/featured`, {
      params: { limit },
    });
    return response.data;
  }

  // Get categories (public)
  async getCategories(): Promise<BlogCategory[]> {
    const response = await apiClient.get(`${this.baseURL}/public/categories`);
    return response.data;
  }

  // Get tags (public)
  async getTags(): Promise<BlogTag[]> {
    const response = await apiClient.get(`${this.baseURL}/public/tags`);
    return response.data;
  }

  // Search posts
  async searchPosts(query: string, limit: number = 10): Promise<BlogPost[]> {
    const response = await apiClient.get(`${this.baseURL}/public/search`, {
      params: { q: query, limit },
    });
    return response.data;
  }
}

export const blogPublicService = new BlogPublicService();