import apiClient from '@/lib/axios';
import type {
  BlogPost,
  BlogPostsResponse,
  CreateBlogPostInput,
  UpdateBlogPostInput,
  BlogQueryParams,
  BlogCategory,
  BlogTag,
  BlogAuthor,
  CreateCategoryInput,
  UpdateCategoryInput,
} from '@/types/blog.types';

class BlogService {
  private readonly baseURL = '/blog';

  // Posts
  async getPosts(params?: BlogQueryParams): Promise<BlogPostsResponse> {
    const response = await apiClient.get(`${this.baseURL}/posts`, { params });
    return response.data;
  }

  async getPostById(id: string): Promise<BlogPost> {
    const response = await apiClient.get(`${this.baseURL}/posts/${id}`);
    return response.data;
  }

  async createPost(data: CreateBlogPostInput): Promise<BlogPost> {
    const response = await apiClient.post(`${this.baseURL}/posts`, data);
    return response.data;
  }

  async updatePost(id: string, data: UpdateBlogPostInput): Promise<BlogPost> {
    const response = await apiClient.patch(`${this.baseURL}/posts/${id}`, data);
    return response.data;
  }

  async deletePost(id: string): Promise<void> {
    await apiClient.delete(`${this.baseURL}/posts/${id}`);
  }

  async uploadImage(file: File): Promise<{ url: string }> {
    const formData = new FormData();
    formData.append('file', file);
    const response = await apiClient.post(`${this.baseURL}/posts/upload-image`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  // Categories
  async getCategories(): Promise<BlogCategory[]> {
    const response = await apiClient.get(`${this.baseURL}/categories`);
    return response.data;
  }

  async createCategory(data: CreateCategoryInput): Promise<BlogCategory> {
    const response = await apiClient.post(`${this.baseURL}/categories`, data);
    return response.data;
  }

  async updateCategory(id: string, data: UpdateCategoryInput): Promise<BlogCategory> {
    const response = await apiClient.patch(`${this.baseURL}/categories/${id}`, data);
    return response.data;
  }

  async deleteCategory(id: string): Promise<void> {
    await apiClient.delete(`${this.baseURL}/categories/${id}`);
  }

  // Tags
  async getTags(): Promise<BlogTag[]> {
    const response = await apiClient.get(`${this.baseURL}/tags`);
    return response.data;
  }

  async deleteTag(id: string): Promise<void> {
    await apiClient.delete(`${this.baseURL}/tags/${id}`);
  }

  // Authors
  async getAuthors(): Promise<BlogAuthor[]> {
    const response = await apiClient.get(`${this.baseURL}/authors`);
    return response.data;
  }
}

export const blogService = new BlogService();