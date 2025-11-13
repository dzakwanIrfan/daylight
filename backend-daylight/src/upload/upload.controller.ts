import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  UploadedFiles,
  BadRequestException,
  UseGuards,
  Get,
  Param,
  Res,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import type { Response } from 'express';
import { UploadService } from './upload.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { Public } from '../common/decorators/public.decorator';
import * as path from 'path';
import * as fs from 'fs';

@Controller('uploads')
export class UploadController {
  constructor(private uploadService: UploadService) {}

  /**
   * Upload single file (generic endpoint)
   */
  @Post('file')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    return this.uploadService.uploadFile(file, {
      maxSize: 10 * 1024 * 1024, // 10MB
      folder: 'general',
    });
  }

  /**
   * Upload multiple files
   */
  @Post('files')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FilesInterceptor('files', 10))
  async uploadFiles(@UploadedFiles() files: Express.Multer.File[]) {
    if (!files || files.length === 0) {
      throw new BadRequestException('No files uploaded');
    }

    return this.uploadService.uploadFiles(files, {
      maxSize: 10 * 1024 * 1024, // 10MB
      folder: 'general',
    });
  }

  /**
   * Upload avatar
   */
  @Post('avatar')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('avatar'))
  async uploadAvatar(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    return this.uploadService.uploadFile(file, {
      allowedMimeTypes: ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'],
      maxSize: 5 * 1024 * 1024, // 5MB
      folder: 'avatars',
    });
  }

  /**
   * Serve uploaded files - PUBLIC endpoint
   */
  @Public()
  @Get(':folder/:filename')
  async serveFile(
    @Param('folder') folder: string,
    @Param('filename') filename: string,
    @Res() res: Response
  ) {
    const filePath = this.uploadService.getFilePath(`${folder}/${filename}`);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: 'File not found' });
    }

    // Set proper cache headers
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    
    return res.sendFile(path.resolve(filePath));
  }
}