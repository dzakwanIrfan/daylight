export enum BlogPostStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  ARCHIVED = 'ARCHIVED',
}

export interface BlogCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  _count?: {
    posts: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface BlogTag {
  id: string;
  name: string;
  slug: string;
  _count?: {
    posts: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  coverImage?: string;
  status: BlogPostStatus;
  publishedAt?: string;
  authorId: string;
  author: {
    id: string;
    firstName?: string;
    lastName?: string;
    profilePicture?: string;
  };
  categoryId?: string;
  category?: BlogCategory;
  tags: BlogTag[];
  viewCount: number;
  readTime?: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateBlogPostInput {
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  coverImage?: string;
  status?: BlogPostStatus;
  categoryId?: string;
  tags?: string[];
}

export interface UpdateBlogPostInput extends Partial<CreateBlogPostInput> {}

export interface BlogQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: BlogPostStatus;
  categoryId?: string;
  tag?: string;
  authorId?: string;
}

export interface BlogPostsResponse {
  data: BlogPost[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface CreateCategoryInput {
  name: string;
  description?: string;
}

export interface UpdateCategoryInput extends Partial<CreateCategoryInput> {}