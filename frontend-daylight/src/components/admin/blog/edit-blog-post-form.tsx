'use client';

import { useForm, Controller } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2, X, Upload } from 'lucide-react';
import { useBlogMutations, useBlogCategories, useBlogAuthors } from '@/hooks/use-blog';
import { BlogPost, BlogPostStatus, UpdateBlogPostInput } from '@/types/blog.types';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { RichTextEditor } from './rich-text-editor';

interface EditBlogPostFormProps {
  post: BlogPost;
}

export function EditBlogPostForm({ post }: EditBlogPostFormProps) {
  const router = useRouter();
  const { updatePost, uploadImage } = useBlogMutations();
  const { data: categories } = useBlogCategories();
  const { data: authors } = useBlogAuthors();
  const [tags, setTags] = useState<string[]>(post.tags.map((t) => t.name));
  const [tagInput, setTagInput] = useState('');
  const [coverImageFile, setCoverImageFile] = useState<File | null>(null);
  const [coverImagePreview, setCoverImagePreview] = useState<string>(post.coverImage || '');

  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
    setValue,
  } = useForm<UpdateBlogPostInput>({
    defaultValues: {
      title: post.title,
      slug: post.slug,
      content: post.content,
      excerpt: post.excerpt,
      status: post.status,
      categoryId: post.categoryId || '',
      authorId: post.authorId,
      coverImage: post.coverImage,
    },
  });

  useEffect(() => {
    if (updatePost.isSuccess) {
      router.push('/admin/blog');
    }
  }, [updatePost.isSuccess, router]);

  const handleCoverImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCoverImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setCoverImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (data: UpdateBlogPostInput) => {
    let coverImageUrl = data.coverImage;

    // Upload cover image if selected
    if (coverImageFile) {
      try {
        const result = await uploadImage.mutateAsync(coverImageFile);
        coverImageUrl = result.url;
      } catch (error) {
        console.error('Failed to upload cover image:', error);
        return;
      }
    }

    const postData: UpdateBlogPostInput = {
      ...data,
      coverImage: coverImageUrl,
      tags,
    };

    updatePost.mutate({
      id: post.id,
      data: postData,
    });
  };

  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const removeTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
  };

  const getAuthorName = (author: any) => {
    const firstName = author?.firstName || '';
    const lastName = author?.lastName || '';
    const name = `${firstName} ${lastName}`.trim();
    return name || author?.email || 'Unknown Author';
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {/* Basic Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Basic Information</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2 space-y-2">
            <Label htmlFor="title">Post Title *</Label>
            <Input
              id="title"
              placeholder="Enter an engaging title"
              {...register('title', { required: 'Title is required', minLength: 3 })}
            />
            {errors.title && <p className="text-xs text-red-600">{errors.title.message}</p>}
          </div>

          <div className="md:col-span-2 space-y-2">
            <Label htmlFor="slug">Slug *</Label>
            <Input
              id="slug"
              placeholder="post-slug"
              {...register('slug', { required: 'Slug is required', minLength: 3 })}
            />
            {errors.slug && <p className="text-xs text-red-600">{errors.slug.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="author">Author *</Label>
            <Controller
              name="authorId"
              control={control}
              rules={{ required: 'Author is required' }}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select author" />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    {authors?.map((author) => (
                      <SelectItem key={author.id} value={author.id}>
                        {getAuthorName(author)}
                        {author._count && author._count.posts > 0 && (
                          <span className="text-xs text-gray-500 ml-2">
                            ({author._count.posts} posts)
                          </span>
                        )}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.authorId && <p className="text-xs text-red-600">{errors.authorId.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Controller
              name="categoryId"
              control={control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    {categories?.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status *</Label>
            <Controller
              name="status"
              control={control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    <SelectItem value={BlogPostStatus.DRAFT}>Draft</SelectItem>
                    <SelectItem value={BlogPostStatus.PUBLISHED}>Published</SelectItem>
                    <SelectItem value={BlogPostStatus.ARCHIVED}>Archived</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          <div className="md:col-span-2 space-y-2">
            <Label htmlFor="excerpt">Excerpt</Label>
            <Textarea
              id="excerpt"
              rows={3}
              placeholder="Brief summary of the post (optional)"
              {...register('excerpt')}
            />
            <p className="text-xs text-gray-500">Short description for preview cards</p>
          </div>
        </div>
      </div>

      {/* Cover Image */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Cover Image</h3>

        <div className="space-y-2">
          <Label htmlFor="coverImage">Upload Cover Image</Label>
          <div className="flex items-center gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => document.getElementById('coverImage')?.click()}
              disabled={uploadImage.isPending}
            >
              {uploadImage.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Upload className="mr-2 h-4 w-4" />
              )}
              Choose Image
            </Button>
            <input
              id="coverImage"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleCoverImageChange}
            />
          </div>
          {coverImagePreview && (
            <div className="mt-4 relative w-full max-w-md">
              <img
                src={coverImagePreview}
                alt="Cover preview"
                className="w-full rounded-lg border"
              />
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={() => {
                  setCoverImageFile(null);
                  setCoverImagePreview('');
                  setValue('coverImage', '');
                }}
                className="absolute top-2 right-2"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Content *</h3>
        <Controller
          name="content"
          control={control}
          rules={{ required: 'Content is required' }}
          render={({ field }) => (
            <RichTextEditor
              content={field.value ? field.value : ''}
              onChange={field.onChange}
              placeholder="Write your blog post content here..."
            />
          )}
        />
        {errors.content && <p className="text-xs text-red-600">{errors.content.message}</p>}
      </div>

      {/* Tags */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Tags</h3>

        <div className="space-y-2">
          <div className="flex gap-2">
            <Input
              placeholder="Add a tag (e.g., lifestyle, technology)"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addTag();
                }
              }}
            />
            <Button type="button" onClick={addTag} variant="outline">
              Add
            </Button>
          </div>
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="pl-3 pr-1">
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="ml-2 hover:bg-gray-300 rounded-full p-0.5"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex items-center justify-end gap-4 pt-6 border-t">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={updatePost.isPending}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={updatePost.isPending}
          className="bg-brand hover:bg-brand-dark border border-black text-white font-bold"
        >
          {updatePost.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Update Post
        </Button>
      </div>
    </form>
  );
}