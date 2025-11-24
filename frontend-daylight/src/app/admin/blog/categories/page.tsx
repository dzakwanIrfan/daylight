'use client';

import { useState } from 'react';
import { AdminLayout } from '@/components/admin/admin-layout';
import { DataTable } from '@/components/data-table/data-table';
import { DataTableSkeleton } from '@/components/data-table/data-table-skeleton';
import { categoriesColumns } from '@/components/admin/blog/categories-columns';
import { Card } from '@/components/ui/card';
import { Folder, Plus, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useBlogCategories } from '@/hooks/use-blog';
import { useRouter } from 'next/navigation';
import { CategoryDialog } from '@/components/admin/blog/category-dialog';

export default function CategoriesPage() {
  const router = useRouter();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const { data: categories, isLoading, error } = useBlogCategories();

  if (error) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-[50vh]">
          <div className="text-center">
            <p className="text-red-600 mb-4">Failed to load categories</p>
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
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push('/admin/blog')}
              className="h-10"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Blog
            </Button>
            <div>
              <h1 className="text-2xl md:text-3xl font-headline font-bold text-gray-900">
                Blog Categories
              </h1>
              <p className="text-gray-600 mt-1">
                Manage blog post categories
              </p>
            </div>
          </div>
        </div>

        {/* Stats Card */}
        <Card className="p-6 bg-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-purple-50 p-3 rounded-lg">
                <Folder className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Total Categories</p>
                <h3 className="text-2xl font-bold text-gray-900 mt-1">
                  {categories?.length || 0}
                </h3>
              </div>
            </div>
          </div>
        </Card>

        {/* Categories Table */}
        <Card className="p-6 bg-white">
          {isLoading ? (
            <DataTableSkeleton
              columnCount={4}
              searchableColumnCount={1}
              filterableColumnCount={0}
              rowCount={10}
            />
          ) : (
            <DataTable
              columns={categoriesColumns}
              data={categories || []}
              searchableColumns={[
                {
                  id: 'name',
                  title: 'categories',
                },
              ]}
              newRowAction={
                <Button
                  size="sm"
                  onClick={() => setShowCreateDialog(true)}
                  className="h-10 bg-brand hover:bg-brand-dark border border-black text-white font-bold"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Create Category
                </Button>
              }
            />
          )}
        </Card>
      </div>

      {/* Create Category Dialog */}
      <CategoryDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
      />
    </AdminLayout>
  );
}