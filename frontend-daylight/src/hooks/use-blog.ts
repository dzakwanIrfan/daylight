import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { blogService } from '@/services/blog.service';
import { toast } from 'sonner';
import type {
  BlogQueryParams,
  CreateBlogPostInput,
  UpdateBlogPostInput,
  CreateCategoryInput,
  UpdateCategoryInput,
  CreateTagInput,
  UpdateTagInput,
} from '@/types/blog.types';

// Query Keys
export const blogKeys = {
  all: ['blog'] as const,
  posts: () => [...blogKeys.all, 'posts'] as const,
  post: (params: BlogQueryParams) => [...blogKeys.posts(), params] as const,
  postDetail: (id: string) => [...blogKeys.posts(), id] as const,
  categories: () => [...blogKeys.all, 'categories'] as const,
  categoryDetail: (id: string) => [...blogKeys.categories(), id] as const,
  tags: () => [...blogKeys.all, 'tags'] as const,
  tagDetail: (id: string) => [...blogKeys.tags(), id] as const,
  authors: () => [...blogKeys.all, 'authors'] as const,
};

// Posts
export function useBlogPosts(params: BlogQueryParams = {}) {
  return useQuery({
    queryKey: blogKeys.post(params),
    queryFn: () => blogService.getPosts(params),
    staleTime: 30000,
  });
}

export function useBlogPost(id: string) {
  return useQuery({
    queryKey: blogKeys.postDetail(id),
    queryFn: () => blogService.getPostById(id),
    enabled: !!id,
  });
}

// Categories
export function useBlogCategories() {
  return useQuery({
    queryKey: blogKeys.categories(),
    queryFn: () => blogService.getCategories(),
    staleTime: 60000,
  });
}

export function useBlogCategory(id: string) {
  return useQuery({
    queryKey: blogKeys.categoryDetail(id),
    queryFn: () => blogService.getCategoryById(id),
    enabled: !!id,
  });
}

// Tags
export function useBlogTags() {
  return useQuery({
    queryKey: blogKeys.tags(),
    queryFn: () => blogService.getTags(),
    staleTime: 60000,
  });
}

export function useBlogTag(id: string) {
  return useQuery({
    queryKey: blogKeys.tagDetail(id),
    queryFn: () => blogService.getTagById(id),
    enabled: !!id,
  });
}

// Authors
export function useBlogAuthors() {
  return useQuery({
    queryKey: blogKeys.authors(),
    queryFn: () => blogService.getAuthors(),
    staleTime: 60000,
  });
}

// Mutations
export function useBlogMutations() {
  const queryClient = useQueryClient();

  const createPost = useMutation({
    mutationFn: (data: CreateBlogPostInput) => blogService.createPost(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: blogKeys.posts() });
      toast.success('Post created successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create post');
    },
  });

  const updatePost = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateBlogPostInput }) =>
      blogService.updatePost(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: blogKeys.posts() });
      queryClient.invalidateQueries({ queryKey: blogKeys.postDetail(variables.id) });
      toast.success('Post updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update post');
    },
  });

  const deletePost = useMutation({
    mutationFn: (id: string) => blogService.deletePost(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: blogKeys.posts() });
      toast.success('Post deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete post');
    },
  });

  const uploadImage = useMutation({
    mutationFn: (file: File) => blogService.uploadImage(file),
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to upload image');
    },
  });

  const createCategory = useMutation({
    mutationFn: (data: CreateCategoryInput) => blogService.createCategory(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: blogKeys.categories() });
      toast.success('Category created successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create category');
    },
  });

  const updateCategory = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateCategoryInput }) =>
      blogService.updateCategory(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: blogKeys.categories() });
      queryClient.invalidateQueries({ queryKey: blogKeys.categoryDetail(variables.id) });
      toast.success('Category updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update category');
    },
  });

  const deleteCategory = useMutation({
    mutationFn: (id: string) => blogService.deleteCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: blogKeys.categories() });
      toast.success('Category deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete category');
    },
  });

  const createTag = useMutation({
    mutationFn: (data: CreateTagInput) => blogService.createTag(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: blogKeys.tags() });
      toast.success('Tag created successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create tag');
    },
  });

  const updateTag = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateTagInput }) =>
      blogService.updateTag(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: blogKeys.tags() });
      queryClient.invalidateQueries({ queryKey: blogKeys.tagDetail(variables.id) });
      toast.success('Tag updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update tag');
    },
  });

  const deleteTag = useMutation({
    mutationFn: (id: string) => blogService.deleteTag(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: blogKeys.tags() });
      toast.success('Tag deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete tag');
    },
  });

  return {
    createPost,
    updatePost,
    deletePost,
    uploadImage,
    createCategory,
    updateCategory,
    deleteCategory,
    createTag,
    updateTag,
    deleteTag,
  };
}