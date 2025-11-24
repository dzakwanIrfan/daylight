import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    Query,
    UseInterceptors,
    UploadedFile,
    UseGuards,
} from '@nestjs/common';
import { BlogService } from './blog.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { BlogQueryDto } from './dto/blog-query.dto';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { CreateTagDto } from './dto/create-tag.dto';
import { UpdateTagDto } from './dto/update-tag.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { UserRole } from '@prisma/client';
import type { User } from '@prisma/client';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { BlogPublicQueryDto } from './dto/blog-public-query.dto';
import { Public } from 'src/common/decorators/public.decorator';

@Controller('blog')
export class BlogController {
    constructor(private readonly blogService: BlogService) { }

    // Posts

    @Post('posts')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    create(
        @Body() createPostDto: CreatePostDto, 
        @CurrentUser() user: User,
    ) {
        return this.blogService.createPost(user.id, createPostDto);
    }

    @Get('posts')
    findAll(@Query() query: BlogQueryDto) {
        return this.blogService.findAllPosts(query);
    }

    @Get('posts/:id')
    findOne(@Param('id') id: string) {
        return this.blogService.findOnePost(id);
    }

    @Patch('posts/:id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    update(@Param('id') id: string, @Body() updatePostDto: UpdatePostDto) {
        return this.blogService.updatePost(id, updatePostDto);
    }

    @Delete('posts/:id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    remove(@Param('id') id: string) {
        return this.blogService.removePost(id);
    }

    @Post('posts/upload-image')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    @UseInterceptors(FileInterceptor('file'))
    uploadImage(@UploadedFile() file: Express.Multer.File) {
        return this.blogService.uploadImage(file);
    }

    // Categories

    @Post('categories')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    createCategory(@Body() createCategoryDto: CreateCategoryDto) {
        return this.blogService.createCategory(createCategoryDto.name, createCategoryDto.description);
    }

    @Get('categories')
    findAllCategories() {
        return this.blogService.findAllCategories();
    }

    @Get('categories/:id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    findOneCategory(@Param('id') id: string) {
        return this.blogService.findOneCategory(id);
    }

    @Patch('categories/:id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    updateCategory(
        @Param('id') id: string,
        @Body() updateCategoryDto: UpdateCategoryDto,
    ) {
        return this.blogService.updateCategory(id, updateCategoryDto.name, updateCategoryDto.description);
    }

    @Delete('categories/:id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    removeCategory(@Param('id') id: string) {
        return this.blogService.removeCategory(id);
    }

    // Tags

    @Post('tags')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    createTag(@Body() createTagDto: CreateTagDto) {
        return this.blogService.createTag(createTagDto.name);
    }

    @Get('tags')
    findAllTags() {
        return this.blogService.findAllTags();
    }

    @Get('tags/:id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    findOneTag(@Param('id') id: string) {
        return this.blogService.findOneTag(id);
    }

    @Patch('tags/:id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    updateTag(
        @Param('id') id: string,
        @Body() updateTagDto: UpdateTagDto,
    ) {
        return this.blogService.updateTag(id, updateTagDto);
    }

    @Delete('tags/:id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    removeTag(@Param('id') id: string) {
        return this.blogService.removeTag(id);
    }

    // Authors

    @Get('authors')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    findAllAuthors() {
        return this.blogService.findAllAuthors();
    }

    // Public Routes

    @Public()
    @Get('public/posts')
    findAllPublished(@Query() query: BlogPublicQueryDto) {
        return this.blogService.findPublishedPosts(query);
    }

    @Public()
    @Get('public/posts/:slug')
    findOnePublished(@Param('slug') slug: string) {
        return this.blogService.findPublishedPostBySlug(slug);
    }

    @Public()
    @Get('public/posts/:id/related')
    findRelated(@Param('id') id: string, @Query('limit') limit?: number) {
        return this.blogService.findRelatedPosts(id, limit ? parseInt(limit as any) : 3);
    }

    @Public()
    @Get('public/featured')
    findFeatured(@Query('limit') limit?: number) {
        return this.blogService.findFeaturedPosts(limit ? parseInt(limit as any) : 5);
    }

    @Public()
    @Get('public/search')
    search(@Query('q') query: string, @Query('limit') limit?: number) {
        return this.blogService.searchPublishedPosts(query, limit ? parseInt(limit as any) : 10);
    }

    @Public()
    @Get('public/categories')
    findAllCategoriesPublic() {
        return this.blogService.findAllCategories();
    }

    @Public()
    @Get('public/tags')
    findAllTagsPublic() {
        return this.blogService.findAllTags();
    }
}