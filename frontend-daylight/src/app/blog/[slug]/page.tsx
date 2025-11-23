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
        description: 'The blog post you are looking for could not be found.',
      };
    }

    const post = await response.json();

    // Extract text from HTML content for better description
    const contentText = post.content ? post.content.replace(/<[^>]*>/g, '').substring(0, 160) : '';
    const description = post.excerpt || contentText || post.title;

    return {
      title: `${post.title} - DayLight Blog`,
      description: description,
      keywords: post.tags?.map((tag: any) => tag.name).join(', '),
      authors: post.author?.firstName ? [{ name: `${post.author.firstName} ${post.author.lastName}` }] : [],
      openGraph: {
        title: post.title,
        description: description,
        images: post.coverImage ? [{
          url: post.coverImage,
          width: 1200,
          height: 630,
          alt: post.title,
        }] : [],
        type: 'article',
        publishedTime: post.publishedAt,
        modifiedTime: post.updatedAt,
        authors: post.author?.firstName ? [`${post.author.firstName} ${post.author.lastName}`] : [],
        tags: post.tags?.map((tag: any) => tag.name),
      },
      twitter: {
        card: 'summary_large_image',
        title: post.title,
        description: description,
        images: post.coverImage ? [post.coverImage] : [],
        creator: '@DayLight',
      },
      alternates: {
        canonical: `/blog/${slug}`,
      },
      robots: {
        index: true,
        follow: true,
        googleBot: {
          index: true,
          follow: true,
          'max-image-preview': 'large',
          'max-snippet': -1,
        },
      },
    };
  } catch (error) {
    return {
      title: 'DayLight Blog',
      description: 'Discover meaningful experiences and connect with like-minded people.',
    };
  }
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  return <BlogPostContent slug={slug} />;
}