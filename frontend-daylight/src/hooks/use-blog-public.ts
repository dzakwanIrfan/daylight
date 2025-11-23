import { useQuery } from '@tanstack/react-query';
import { blogPublicService } from '@/services/blog-public.service';
import type { BlogPublicQueryParams } from '@/types/blog-public.types';

// Query Keys
export const blogPublicKeys = {
  all: ['blog-public'] as const,
  posts: (params: BlogPublicQueryParams) => [...blogPublicKeys.all, 'posts', params] as const,
  post: (slug: string) => [...blogPublicKeys.all, 'post', slug] as const,
  related: (postId: string) => [...blogPublicKeys.all, 'related', postId] as const,
  featured: () => [...blogPublicKeys.all, 'featured'] as const,
  categories: () => [...blogPublicKeys.all, 'categories'] as const,
  tags: () => [...blogPublicKeys.all, 'tags'] as const,
  search: (query: string) => [...blogPublicKeys.all, 'search', query] as const,
};

export function useBlogPublicPosts(params: BlogPublicQueryParams = {}) {
  return useQuery({
    queryKey: blogPublicKeys.posts(params),
    queryFn: () => blogPublicService.getPublishedPosts(params),
    staleTime: 60000, // 1 minute
  });
}

export function useBlogPublicPost(slug: string) {
  return useQuery({
    queryKey: blogPublicKeys.post(slug),
    queryFn: () => blogPublicService.getPostBySlug(slug),
    enabled: !!slug,
    staleTime: 300000, // 5 minutes
  });
}

export function useRelatedPosts(postId: string, limit: number = 3) {
  return useQuery({
    queryKey: blogPublicKeys.related(postId),
    queryFn: () => blogPublicService.getRelatedPosts(postId, limit),
    enabled: !!postId,
    staleTime: 300000,
  });
}

export function useFeaturedPosts(limit: number = 5) {
  return useQuery({
    queryKey: blogPublicKeys.featured(),
    queryFn: () => blogPublicService.getFeaturedPosts(limit),
    staleTime: 300000,
  });
}

export function useBlogPublicCategories() {
  return useQuery({
    queryKey: blogPublicKeys.categories(),
    queryFn: () => blogPublicService.getCategories(),
    staleTime: 600000, // 10 minutes
  });
}

export function useBlogPublicTags() {
  return useQuery({
    queryKey: blogPublicKeys.tags(),
    queryFn: () => blogPublicService.getTags(),
    staleTime: 600000,
  });
}

export function useBlogSearch(query: string) {
  return useQuery({
    queryKey: blogPublicKeys.search(query),
    queryFn: () => blogPublicService.searchPosts(query),
    enabled: query.length > 2,
    staleTime: 30000,
  });
}