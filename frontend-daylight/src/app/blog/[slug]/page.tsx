// frontend-daylight/src/app/blog/[slug]/page.tsx
import { Metadata } from 'next';
import { BlogPostContent } from './blog-post-content';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  try {
    const { slug } = await params;
    
    // Fetch post data for metadata
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api'}/blog/public/posts/${slug}`,
      { cache: 'no-store' }
    );

    if (!response.ok) {
      return {
        title: 'Post Not Found - DayLight Blog',
      };
    }

    const post = await response.json();

    return {
      title: `${post.title} - DayLight Blog`,
      description: post.excerpt || post.title,
      openGraph: {
        title: post.title,
        description: post.excerpt || post.title,
        images: post.coverImage ? [post.coverImage] : [],
        type: 'article',
        publishedTime: post.publishedAt,
        authors: post.author?.firstName ? [`${post.author.firstName} ${post.author.lastName}`] : [],
      },
      twitter: {
        card: 'summary_large_image',
        title: post.title,
        description: post.excerpt || post.title,
        images: post.coverImage ? [post.coverImage] : [],
      },
    };
  } catch (error) {
    return {
      title: 'DayLight Blog',
    };
  }
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  return <BlogPostContent slug={slug} />;
}