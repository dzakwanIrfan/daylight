import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { BlogQueryDto } from './dto/blog-query.dto';
import { UploadService } from '../upload/upload.service';
import slugify from 'slugify';
import { BlogPostStatus, Prisma } from '@prisma/client';

@Injectable()
export class BlogService {
    constructor(
        private prisma: PrismaService,
        private uploadService: UploadService,
    ) { }

    // --- Posts ---

    async createPost(userId: string, createPostDto: CreatePostDto) {
        const { title, tags, ...rest } = createPostDto;
        const slug = await this.generateUniqueSlug(title);

        // Handle tags: create if not exists, then connect
        const tagConnect = tags
            ? await Promise.all(
                tags.map(async (tagName) => {
                    const tagSlug = slugify(tagName, { lower: true });
                    const tag = await this.prisma.blogTag.upsert({
                        where: { slug: tagSlug },
                        update: {},
                        create: { name: tagName, slug: tagSlug },
                    });
                    return { id: tag.id };
                }),
            )
            : [];

        return this.prisma.blogPost.create({
            data: {
                ...rest,
                title,
                slug,
                authorId: userId,
                tags: {
                    connect: tagConnect,
                },
                publishedAt: createPostDto.status === BlogPostStatus.PUBLISHED ? new Date() : null,
            },
            include: {
                author: {
                    select: { id: true, firstName: true, lastName: true, profilePicture: true },
                },
                category: true,
                tags: true,
            },
        });
    }

    async findAllPosts(query: BlogQueryDto) {
        const { page = 1, limit = 10, search, status, categoryId, tag, authorId } = query;
        const skip = (page - 1) * limit;

        const where: Prisma.BlogPostWhereInput = {
            AND: [
                status ? { status } : {},
                categoryId ? { categoryId } : {},
                authorId ? { authorId } : {},
                tag ? { tags: { some: { slug: tag } } } : {},
                search
                    ? {
                        OR: [
                            { title: { contains: search, mode: 'insensitive' } },
                            { content: { contains: search, mode: 'insensitive' } },
                        ],
                    }
                    : {},
            ],
        };

        const [total, posts] = await Promise.all([
            this.prisma.blogPost.count({ where }),
            this.prisma.blogPost.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: {
                    author: {
                        select: { id: true, firstName: true, lastName: true, profilePicture: true },
                    },
                    category: true,
                    tags: true,
                },
            }),
        ]);

        return {
            data: posts,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    async findOnePost(idOrSlug: string) {
        const post = await this.prisma.blogPost.findFirst({
            where: {
                OR: [{ id: idOrSlug }, { slug: idOrSlug }],
            },
            include: {
                author: {
                    select: { id: true, firstName: true, lastName: true, profilePicture: true },
                },
                category: true,
                tags: true,
            },
        });

        if (!post) {
            throw new NotFoundException(`Post not found`);
        }

        // Increment view count
        await this.prisma.blogPost.update({
            where: { id: post.id },
            data: { viewCount: { increment: 1 } }
        });

        return post;
    }

    async updatePost(id: string, updatePostDto: UpdatePostDto) {
        const { tags, title, ...rest } = updatePostDto;

        const post = await this.prisma.blogPost.findUnique({ where: { id } });
        if (!post) throw new NotFoundException('Post not found');

        let slug = post.slug;
        if (title && title !== post.title) {
            slug = await this.generateUniqueSlug(title);
        }

        // Handle tags update if provided
        let tagUpdate = {};
        if (tags) {
            // Disconnect all and connect new ones (simple approach)
            // Or smarter: connect/disconnect diff. 
            // For simplicity, we'll use set to replace all tags
            const tagConnect = await Promise.all(
                tags.map(async (tagName) => {
                    const tagSlug = slugify(tagName, { lower: true });
                    const tag = await this.prisma.blogTag.upsert({
                        where: { slug: tagSlug },
                        update: {},
                        create: { name: tagName, slug: tagSlug },
                    });
                    return { id: tag.id };
                }),
            );
            tagUpdate = { set: tagConnect };
        }

        return this.prisma.blogPost.update({
            where: { id },
            data: {
                ...rest,
                title,
                slug,
                tags: tagUpdate,
                publishedAt:
                    updatePostDto.status === BlogPostStatus.PUBLISHED && post.status !== BlogPostStatus.PUBLISHED
                        ? new Date()
                        : post.publishedAt,
            },
            include: {
                author: {
                    select: { id: true, firstName: true, lastName: true, profilePicture: true },
                },
                category: true,
                tags: true,
            },
        });
    }

    async removePost(id: string) {
        return this.prisma.blogPost.delete({ where: { id } });
    }

    async uploadImage(file: Express.Multer.File) {
        return this.uploadService.uploadFile(file, {
            folder: 'blog',
            allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
            maxSize: 5 * 1024 * 1024, // 5MB
        });
    }

    // --- Categories ---

    async createCategory(name: string, description?: string) {
        const slug = slugify(name, { lower: true });
        return this.prisma.blogCategory.create({
            data: { name, slug, description },
        });
    }

    async findAllCategories() {
        return this.prisma.blogCategory.findMany({
            include: { _count: { select: { posts: true } } }
        });
    }

    async updateCategory(id: string, name?: string, description?: string) {
        const data: any = { description };
        if (name) {
            data.name = name;
            data.slug = slugify(name, { lower: true });
        }
        return this.prisma.blogCategory.update({
            where: { id },
            data
        });
    }

    async removeCategory(id: string) {
        return this.prisma.blogCategory.delete({ where: { id } });
    }

    // --- Tags ---

    async findAllTags() {
        return this.prisma.blogTag.findMany({
            include: { _count: { select: { posts: true } } }
        });
    }

    async removeTag(id: string) {
        return this.prisma.blogTag.delete({ where: { id } });
    }

    // --- Helpers ---

    private async generateUniqueSlug(title: string): Promise<string> {
        let slug = slugify(title, { lower: true });
        let count = 1;

        while (await this.prisma.blogPost.findUnique({ where: { slug } })) {
            slug = `${slugify(title, { lower: true })}-${count}`;
            count++;
        }

        return slug;
    }
}
