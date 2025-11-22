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
import { FileInterceptor } from '@nestjs/platform-express';
import { UserRole } from '@prisma/client';
import type { User } from '@prisma/client';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';

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
    createCategory(@Body() body: { name: string; description?: string }) {
        return this.blogService.createCategory(body.name, body.description);
    }

    @Get('categories')
    findAllCategories() {
        return this.blogService.findAllCategories();
    }

    @Patch('categories/:id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    updateCategory(
        @Param('id') id: string,
        @Body() body: { name?: string; description?: string },
    ) {
        return this.blogService.updateCategory(id, body.name, body.description);
    }

    @Delete('categories/:id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    removeCategory(@Param('id') id: string) {
        return this.blogService.removeCategory(id);
    }

    // Tags

    @Get('tags')
    findAllTags() {
        return this.blogService.findAllTags();
    }

    @Delete('tags/:id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    removeTag(@Param('id') id: string) {
        return this.blogService.removeTag(id);
    }
}
