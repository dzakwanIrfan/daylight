'use client';

import { AdminLayout } from '@/components/admin/admin-layout';
import { EditBlogPostForm } from '@/components/admin/blog/edit-blog-post-form';
import { Card } from '@/components/ui/card';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter, useParams } from 'next/navigation';
import { useBlogPost } from '@/hooks/use-blog';

export default function EditBlogPostPage() {
  const router = useRouter();
  const params = useParams();
  const postId = params.id as string;

  const { data: post, isLoading, error } = useBlogPost(postId);

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-[50vh]">
          <Loader2 className="h-8 w-8 animate-spin text-brand" />
        </div>
      </AdminLayout>
    );
  }

  if (error || !post) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-[50vh]">
          <div className="text-center">
            <p className="text-red-600 mb-4">Failed to load blog post</p>
            <Button onClick={() => router.back()}>Go Back</Button>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.back()}
            className="h-10"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl md:text-3xl font-headline font-bold text-gray-900">
              Edit Blog Post
            </h1>
            <p className="text-gray-600 mt-1">Update blog post details</p>
          </div>
        </div>

        {/* Form */}
        <Card className="p-6 bg-white">
          <EditBlogPostForm post={post} />
        </Card>
      </div>
    </AdminLayout>
  );
}