'use client';

import { useState, useMemo } from 'react';
import { AdminLayout } from '@/components/admin/admin-layout';
import { DataTable } from '@/components/data-table/data-table';
import { DataTableSkeleton } from '@/components/data-table/data-table-skeleton';
import { blogPostsColumns } from '@/components/admin/blog/blog-posts-columns';
import { Card } from '@/components/ui/card';
import { FileText, Eye, Folder, Tags, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useBlogPosts, useBlogCategories, useBlogTags, useBlogAuthors } from '@/hooks/use-blog';
import { useRouter } from 'next/navigation';
import { BlogPostStatus } from '@/types/blog.types';
import { CategoryDialog } from '@/components/admin/blog/category-dialog';

export default function AdminBlogPage() {
  const router = useRouter();
  const [showCategoryDialog, setShowCategoryDialog] = useState(false);

  const { data: postsResponse, isLoading, error } = useBlogPosts({ limit: 1000 });
  const { data: categories } = useBlogCategories();
  const { data: tags } = useBlogTags();
  const { data: authors } = useBlogAuthors();
  const posts = postsResponse?.data || [];

  // Calculate stats
  const stats = useMemo(() => {
    if (!posts.length)
      return { total: 0, published: 0, draft: 0, totalViews: 0 };

    return {
      total: posts.length,
      published: posts.filter((p) => p.status === BlogPostStatus.PUBLISHED).length,
      draft: posts.filter((p) => p.status === BlogPostStatus.DRAFT).length,
      totalViews: posts.reduce((sum, p) => sum + p.viewCount, 0),
    };
  }, [posts]);

  const statsCards = [
    {
      title: 'Total Posts',
      value: stats.total,
      icon: FileText,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
    },
    {
      title: 'Published',
      value: stats.published,
      icon: Eye,
      color: 'text-green-600',
      bg: 'bg-green-50',
    },
    {
      title: 'Draft',
      value: stats.draft,
      icon: FileText,
      color: 'text-orange-600',
      bg: 'bg-orange-50',
    },
    {
      title: 'Total Views',
      value: stats.totalViews.toLocaleString(),
      icon: Eye,
      color: 'text-brand',
      bg: 'bg-brand/10',
    },
  ];

  const getAuthorName = (author: any) => {
    const firstName = author?.firstName || '';
    const lastName = author?.lastName || '';
    const name = `${firstName} ${lastName}`.trim();
    return name || author?.email || 'Unknown Author';
  };

  if (error) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-[50vh]">
          <div className="text-center">
            <p className="text-red-600 mb-4">Failed to load blog posts</p>
            <Button onClick={() => window.location.reload()}>Retry</Button>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:gap-0 gap-2 md:items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-headline font-bold text-gray-900">
              Blog Management
            </h1>
            <p className="text-gray-600 mt-1">
              Manage blog posts, categories, and tags
            </p>
          </div>
          <Button
            onClick={() => setShowCategoryDialog(true)}
            variant="outline"
            size="sm"
          >
            <Folder className="mr-2 h-4 w-4" />
            Manage Categories
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {statsCards.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.title} className="p-6 bg-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                    <h3 className="text-2xl font-bold text-gray-900 mt-2">
                      {stat.value}
                    </h3>
                  </div>
                  <div className={`${stat.bg} ${stat.color} p-3 rounded-lg`}>
                    <Icon className="w-6 h-6" />
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="p-4 bg-white">
            <div className="flex items-center gap-3">
              <div className="bg-purple-50 p-2 rounded-lg">
                <Folder className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Categories</p>
                <p className="text-xl font-bold text-gray-900">
                  {categories?.length || 0}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-4 bg-white">
            <div className="flex items-center gap-3">
              <div className="bg-pink-50 p-2 rounded-lg">
                <Tags className="h-5 w-5 text-pink-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Tags</p>
                <p className="text-xl font-bold text-gray-900">
                  {tags?.length || 0}
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Blog Posts Table */}
        <Card className="p-6 bg-white">
          {isLoading ? (
            <DataTableSkeleton
              columnCount={7}
              searchableColumnCount={1}
              filterableColumnCount={3}
              rowCount={10}
            />
          ) : (
            <DataTable
              columns={blogPostsColumns}
              data={posts}
              searchableColumns={[
                {
                  id: 'title',
                  title: 'posts',
                },
              ]}
              filterableColumns={[
                {
                  id: 'status',
                  title: 'Status',
                  options: Object.values(BlogPostStatus).map((status) => ({
                    label: status,
                    value: status,
                  })),
                },
                {
                  id: 'categoryId',
                  title: 'Category',
                  options:
                    categories?.map((cat) => ({
                      label: cat.name,
                      value: cat.id,
                    })) || [],
                },
              ]}
              newRowAction={
                <Button
                  size="sm"
                  onClick={() => router.push('/admin/blog/new')}
                  className="h-10 bg-brand hover:bg-brand-dark border border-black text-white font-bold"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Create Post
                </Button>
              }
            />
          )}
        </Card>
      </div>

      {/* Category Dialog */}
      <CategoryDialog
        open={showCategoryDialog}
        onOpenChange={setShowCategoryDialog}
      />
    </AdminLayout>
  );
}