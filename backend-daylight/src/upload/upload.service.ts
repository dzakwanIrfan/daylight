import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';

export interface UploadResult {
  filename: string;
  originalName: string;
  mimetype: string;
  size: number;
  url: string;
  path: string;
}

export interface UploadOptions {
  allowedMimeTypes?: string[];
  maxSize?: number; // in bytes
  folder?: string;
}

@Injectable()
export class UploadService {
  private readonly uploadDir: string;
  private readonly baseUrl: string;

  constructor(private configService: ConfigService) {
    this.uploadDir = this.configService.get('UPLOAD_DIR') || './uploads';
    this.baseUrl = this.configService.get('API_URL') || 'http://localhost:3000';
    this.ensureUploadDirExists();
  }

  /**
   * Ensure upload directory exists
   */
  private ensureUploadDirExists() {
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  /**
   * Validate file before upload
   */
  validateFile(file: Express.Multer.File, options?: UploadOptions): void {
    // Check file size
    const maxSize = options?.maxSize || 5 * 1024 * 1024; // Default 5MB
    if (file.size > maxSize) {
      throw new BadRequestException(
        `File size exceeds limit of ${maxSize / (1024 * 1024)}MB`
      );
    }

    // Check mime type
    if (options?.allowedMimeTypes && options.allowedMimeTypes.length > 0) {
      if (!options.allowedMimeTypes.includes(file.mimetype)) {
        throw new BadRequestException(
          `File type ${file.mimetype} is not allowed. Allowed types: ${options.allowedMimeTypes.join(', ')}`
        );
      }
    }
  }

  /**
   * Upload single file
   */
  async uploadFile(
    file: Express.Multer.File,
    options?: UploadOptions
  ): Promise<UploadResult> {
    this.validateFile(file, options);

    const folder = options?.folder || 'general';
    const folderPath = path.join(this.uploadDir, folder);

    // Create folder if not exists
    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath, { recursive: true });
    }

    // Generate unique filename
    const ext = path.extname(file.originalname);
    const filename = `${uuidv4()}${ext}`;
    const filePath = path.join(folderPath, filename);

    // Write file
    fs.writeFileSync(filePath, file.buffer);

    return {
      filename,
      originalName: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
      url: `${this.baseUrl}/api/uploads/${folder}/${filename}`,
      path: `uploads/${folder}/${filename}`,
    };
  }

  /**
   * Upload multiple files
   */
  async uploadFiles(
    files: Express.Multer.File[],
    options?: UploadOptions
  ): Promise<UploadResult[]> {
    const results: UploadResult[] = [];

    for (const file of files) {
      const result = await this.uploadFile(file, options);
      results.push(result);
    }

    return results;
  }

  /**
   * Delete file
   */
  async deleteFile(filePath: string): Promise<void> {
    const fullPath = path.join(this.uploadDir, filePath.replace('uploads/', ''));

    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
    }
  }

  /**
   * Get file path
   */
  getFilePath(relativePath: string): string {
    return path.join(this.uploadDir, relativePath.replace('uploads/', ''));
  }

  /**
   * Check if file exists
   */
  fileExists(relativePath: string): boolean {
    const fullPath = this.getFilePath(relativePath);
    return fs.existsSync(fullPath);
  }
}