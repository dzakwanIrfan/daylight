import { IsString, IsNotEmpty, IsOptional, IsArray, IsEnum } from 'class-validator';
import { BlogPostStatus } from '@prisma/client';

export class CreatePostDto {
    @IsString()
    @IsNotEmpty()
    title: string;
    
    @IsString()
    @IsNotEmpty()
    slug: string;

    @IsString()
    @IsNotEmpty()
    content: string;

    @IsString()
    @IsOptional()
    excerpt?: string;

    @IsString()
    @IsOptional()
    coverImage?: string;

    @IsEnum(BlogPostStatus)
    @IsOptional()
    status?: BlogPostStatus;

    @IsString()
    @IsOptional()
    categoryId?: string;

    @IsArray()
    @IsString({ each: true })
    @IsOptional()
    tags?: string[];
}
