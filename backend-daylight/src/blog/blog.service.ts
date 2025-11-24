import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { BlogQueryDto } from './dto/blog-query.dto';
import { UploadService } from '../upload/upload.service';
import slugify from 'slugify';
import { BlogPostStatus, Prisma } from '@prisma/client';
import { BlogPublicQueryDto } from './dto/blog-public-query.dto';
import { UpdateTagDto } from './dto/update-tag.dto';

@Injectable()
export class BlogService {
    constructor(
        private prisma: PrismaService,
        private uploadService: UploadService,
    ) { }

    // --- Posts --- (keep existing code)

    async createPost(userId: string, createPostDto: CreatePostDto) {
        const { title, tags, ...rest } = createPostDto;
        const slug = await this.generateUniqueSlug(title);

        const tagConnect = tags
            ? await Promise.all(
                tags.map(async (tagName) => {
                    const tagSlug = slugify(tagName, { lower: true, strict: true });
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
                    select: { id: true, firstName: true, lastName: true, profilePicture: true, email: true },
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
                        select: { id: true, firstName: true, lastName: true, profilePicture: true, email: true },
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
                    select: { id: true, firstName: true, lastName: true, profilePicture: true, email: true },
                },
                category: true,
                tags: true,
            },
        });

        if (!post) {
            throw new NotFoundException(`Post not found`);
        }

        await this.prisma.blogPost.update({
            where: { id: post.id },
            data: { viewCount: { increment: 1 } }
        });

        return post;
    }

    async updatePost(id: string, updatePostDto: UpdatePostDto) {
        const { tags, title, authorId, ...rest } = updatePostDto;

        const post = await this.prisma.blogPost.findUnique({ where: { id } });
        if (!post) throw new NotFoundException('Post not found');

        if (authorId) {
            const author = await this.prisma.user.findUnique({ 
                where: { id: authorId },
                select: { id: true, role: true }
            });
            
            if (!author) {
                throw new NotFoundException('Author not found');
            }
            
            if (author.role !== 'ADMIN') {
                throw new BadRequestException('Selected user is not an admin');
            }
        }

        let slug = post.slug;
        if (title && title !== post.title) {
            slug = await this.generateUniqueSlug(title);
        }

        let tagUpdate = {};
        if (tags) {
            const tagConnect = await Promise.all(
                tags.map(async (tagName) => {
                    const tagSlug = slugify(tagName, { lower: true, strict: true });
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
                ...(authorId && { authorId }),
                tags: tagUpdate,
                publishedAt:
                    updatePostDto.status === BlogPostStatus.PUBLISHED && post.status !== BlogPostStatus.PUBLISHED
                        ? new Date()
                        : post.publishedAt,
            },
            include: {
                author: {
                    select: { id: true, firstName: true, lastName: true, profilePicture: true, email: true },
                },
                category: true,
                tags: true,
            },
        });
    }

    async removePost(id: string) {
        const post = await this.prisma.blogPost.findUnique({ where: { id } });
        if (!post) throw new NotFoundException('Post not found');
        
        return this.prisma.blogPost.delete({ where: { id } });
    }

    async uploadImage(file: Express.Multer.File) {
        return this.uploadService.uploadFile(file, {
            folder: 'blog',
            allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
            maxSize: 5 * 1024 * 1024,
        });
    }

    // --- Categories ---

    async createCategory(name: string, description?: string) {
        const slug = slugify(name, { lower: true, strict: true });
        
        // Check if category with same slug already exists
        const existing = await this.prisma.blogCategory.findUnique({
            where: { slug }
        });
        
        if (existing) {
            throw new ConflictException('Category with this name already exists');
        }
        
        return this.prisma.blogCategory.create({
            data: { name, slug, description },
            include: { _count: { select: { posts: true } } }
        });
    }

    async findAllCategories() {
        return this.prisma.blogCategory.findMany({
            include: { _count: { select: { posts: true } } },
            orderBy: { name: 'asc' }
        });
    }

    async findOneCategory(id: string) {
        const category = await this.prisma.blogCategory.findUnique({
            where: { id },
            include: { _count: { select: { posts: true } } }
        });
        
        if (!category) {
            throw new NotFoundException('Category not found');
        }
        
        return category;
    }

    async updateCategory(id: string, name?: string, description?: string) {
        const category = await this.prisma.blogCategory.findUnique({ where: { id } });
        if (!category) throw new NotFoundException('Category not found');
        
        const data: any = {};
        
        if (description !== undefined) {
            data.description = description;
        }
        
        if (name && name !== category.name) {
            const slug = slugify(name, { lower: true, strict: true });
            
            // Check if new slug conflicts with existing category
            const existing = await this.prisma.blogCategory.findFirst({
                where: { 
                    slug,
                    NOT: { id }
                }
            });
            
            if (existing) {
                throw new ConflictException('Category with this name already exists');
            }
            
            data.name = name;
            data.slug = slug;
        }
        
        return this.prisma.blogCategory.update({
            where: { id },
            data,
            include: { _count: { select: { posts: true } } }
        });
    }

    async removeCategory(id: string) {
        const category = await this.prisma.blogCategory.findUnique({
            where: { id },
            include: { _count: { select: { posts: true } } }
        });
        
        if (!category) throw new NotFoundException('Category not found');
        
        if (category._count.posts > 0) {
            throw new BadRequestException('Cannot delete category with existing posts');
        }
        
        return this.prisma.blogCategory.delete({ where: { id } });
    }

    // --- Tags ---

    async createTag(name: string) {
        const slug = slugify(name, { lower: true, strict: true });
        
        // Check if tag with same slug already exists
        const existing = await this.prisma.blogTag.findUnique({
            where: { slug }
        });
        
        if (existing) {
            throw new ConflictException('Tag with this name already exists');
        }
        
        return this.prisma.blogTag.create({
            data: { name, slug },
            include: { _count: { select: { posts: true } } }
        });
    }

    async findAllTags() {
        return this.prisma.blogTag.findMany({
            include: { _count: { select: { posts: true } } },
            orderBy: { name: 'asc' }
        });
    }

    async findOneTag(id: string) {
        const tag = await this.prisma.blogTag.findUnique({
            where: { id },
            include: { _count: { select: { posts: true } } }
        });
        
        if (!tag) {
            throw new NotFoundException('Tag not found');
        }
        
        return tag;
    }

    async updateTag(id: string, updateTagDto: UpdateTagDto) {
        const tag = await this.prisma.blogTag.findUnique({ where: { id } });
        if (!tag) throw new NotFoundException('Tag not found');
        
        // If no name provided, just return the existing tag
        if (!updateTagDto.name) {
            return tag;
        }
        
        // If name is the same, no need to update
        if (updateTagDto.name === tag.name) {
            return tag;
        }
        
        const slug = slugify(updateTagDto.name, { lower: true, strict: true });
        
        // Check if new slug conflicts with existing tag
        const existing = await this.prisma.blogTag.findFirst({
            where: { 
                slug,
                NOT: { id }
            }
        });
        
        if (existing) {
            throw new ConflictException('Tag with this name already exists');
        }
        
        return this.prisma.blogTag.update({
            where: { id },
            data: { name: updateTagDto.name, slug },
            include: { _count: { select: { posts: true } } }
        });
    }

    async removeTag(id: string) {
        const tag = await this.prisma.blogTag.findUnique({
            where: { id },
            include: { _count: { select: { posts: true } } }
        });
        
        if (!tag) throw new NotFoundException('Tag not found');
        
        if (tag._count.posts > 0) {
            throw new BadRequestException('Cannot delete tag with existing posts');
        }
        
        return this.prisma.blogTag.delete({ where: { id } });
    }

    // --- Authors ---

    async findAllAuthors() {
        const authors = await this.prisma.user.findMany({
            where: {
                role: 'ADMIN',
            },
            select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                profilePicture: true,
                _count: {
                    select: { posts: true }
                }
            },
            orderBy: {
                firstName: 'asc'
            }
        });

        return authors;
    }

    // --- Helpers ---

    private async generateUniqueSlug(title: string): Promise<string> {
        let slug = slugify(title, { lower: true, strict: true });
        let count = 1;

        while (await this.prisma.blogPost.findUnique({ where: { slug } })) {
            slug = `${slugify(title, { lower: true, strict: true })}-${count}`;
            count++;
        }

        return slug;
    }

    // Keep other existing methods (findPublishedPosts, findPublishedPostBySlug, etc.)
    async findPublishedPosts(query: BlogPublicQueryDto) {
        const { page = 1, limit = 10, search, categorySlug, tagSlug, featured } = query;
        const skip = (page - 1) * limit;

        const where: Prisma.BlogPostWhereInput = {
            AND: [
                { status: BlogPostStatus.PUBLISHED },
                categorySlug ? { category: { slug: categorySlug } } : {},
                tagSlug ? { tags: { some: { slug: tagSlug } } } : {},
                search
                    ? {
                        OR: [
                            { title: { contains: search, mode: 'insensitive' } },
                            { content: { contains: search, mode: 'insensitive' } },
                            { excerpt: { contains: search, mode: 'insensitive' } },
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
                orderBy: { publishedAt: 'desc' },
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

    async findPublishedPostBySlug(slug: string) {
        const post = await this.prisma.blogPost.findFirst({
            where: {
                slug,
                status: BlogPostStatus.PUBLISHED,
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

        await this.prisma.blogPost.update({
            where: { id: post.id },
            data: { viewCount: { increment: 1 } }
        });

        return post;
    }

    async findRelatedPosts(postId: string, limit: number = 3) {
        const post = await this.prisma.blogPost.findUnique({
            where: { id: postId },
            include: { tags: true, category: true },
        });

        if (!post) {
            throw new NotFoundException('Post not found');
        }

        const relatedPosts = await this.prisma.blogPost.findMany({
            where: {
                AND: [
                    { id: { not: postId } },
                    { status: BlogPostStatus.PUBLISHED },
                    {
                        OR: [
                            { categoryId: post.categoryId },
                            { tags: { some: { id: { in: post.tags.map(t => t.id) } } } },
                        ],
                    },
                ],
            },
            take: limit,
            orderBy: { publishedAt: 'desc' },
            select: {
                id: true,
                title: true,
                slug: true,
                excerpt: true,
                coverImage: true,
                publishedAt: true,
                readTime: true,
                category: true,
            },
        });

        return relatedPosts;
    }

    async findFeaturedPosts(limit: number = 5) {
        return this.prisma.blogPost.findMany({
            where: { status: BlogPostStatus.PUBLISHED },
            take: limit,
            orderBy: { publishedAt: 'desc' },
            include: {
                author: {
                    select: { id: true, firstName: true, lastName: true, profilePicture: true },
                },
                category: true,
                tags: true,
            },
        });
    }

    async searchPublishedPosts(query: string, limit: number = 10) {
        return this.prisma.blogPost.findMany({
            where: {
                AND: [
                    { status: BlogPostStatus.PUBLISHED },
                    {
                        OR: [
                            { title: { contains: query, mode: 'insensitive' } },
                            { content: { contains: query, mode: 'insensitive' } },
                            { excerpt: { contains: query, mode: 'insensitive' } },
                        ],
                    },
                ],
            },
            take: limit,
            orderBy: { publishedAt: 'desc' },
            include: {
                author: {
                    select: { id: true, firstName: true, lastName: true, profilePicture: true },
                },
                category: true,
                tags: true,
            },
        });
    }
}