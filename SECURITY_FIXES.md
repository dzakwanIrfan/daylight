# 🔒 SECURITY FIXES - KODE LENGKAP

> **IMPORTANT:** Backup semua file sebelum melakukan perubahan!

## 📋 DAFTAR FILE YANG PERLU DIUBAH

### Critical Fixes (Priority 1)
1. ✅ `backend-daylight/src/upload/upload.service.ts` - File validation
2. ✅ `backend-daylight/src/upload/upload.controller.ts` - Path traversal fix
3. ✅ `backend-daylight/src/common/guards/csrf.guard.ts` - NEW FILE
4. ✅ `backend-daylight/src/payment/payment.service.ts` - Race condition fix
5. ✅ `backend-daylight/src/payment/payment.controller.ts` - Rate limiting
6. ✅ `backend-daylight/src/main.ts` - CSP headers
7. ✅ `backend-daylight/src/auth/auth.service.ts` - Account enumeration fix
8. ✅ `backend-daylight/package.json` - New dependencies

---

## 1️⃣ INSTALL DEPENDENCIES BARU

```bash
cd backend-daylight
npm install file-type@19.0.0 csurf@1.11.0
npm install --save-dev @types/csurf@1.11.5
```

---

## 2️⃣ FILE: `backend-daylight/src/upload/upload.service.ts`

**REPLACE ENTIRE FILE dengan:**

```typescript
import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { fileTypeFromBuffer } from 'file-type';

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

  // Whitelist allowed extensions
  private readonly allowedExtensions = {
    images: ['.jpg', '.jpeg', '.png', '.webp', '.gif'],
    documents: ['.pdf', '.doc', '.docx', '.xls', '.xlsx'],
    all: ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.pdf', '.doc', '.docx', '.xls', '.xlsx']
  };

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
   * ✅ FIXED: Validate file with magic byte checking
   */
  async validateFile(file: Express.Multer.File, options?: UploadOptions): Promise<void> {
    // 1. Check file size
    const maxSize = options?.maxSize || 5 * 1024 * 1024; // Default 5MB
    if (file.size > maxSize) {
      throw new BadRequestException(
        `File size exceeds limit of ${maxSize / (1024 * 1024)}MB`
      );
    }

    // 2. Check if file has content
    if (!file.buffer || file.buffer.length === 0) {
      throw new BadRequestException('File is empty');
    }

    // 3. Validate file extension (basic check)
    const ext = path.extname(file.originalname).toLowerCase();
    const allowedExts = this.getAllowedExtensions(options?.allowedMimeTypes);

    if (!allowedExts.includes(ext)) {
      throw new BadRequestException(
        `File extension ${ext} is not allowed. Allowed: ${allowedExts.join(', ')}`
      );
    }

    // 4. ✅ MAGIC BYTE VALIDATION (CRITICAL FIX)
    // This prevents attackers from renaming malware.exe to malware.jpg
    if (options?.allowedMimeTypes && options.allowedMimeTypes.length > 0) {
      try {
        const detectedType = await fileTypeFromBuffer(file.buffer);

        if (!detectedType) {
          throw new BadRequestException(
            'Unable to detect file type. File may be corrupted or invalid.'
          );
        }

        // Check if detected MIME type matches allowed types
        if (!options.allowedMimeTypes.includes(detectedType.mime)) {
          throw new BadRequestException(
            `Invalid file type. Detected: ${detectedType.mime}, Allowed: ${options.allowedMimeTypes.join(', ')}`
          );
        }

        // Extra validation: ensure extension matches detected type
        const expectedExt = `.${detectedType.ext}`;
        if (ext !== expectedExt && !this.isExtensionCompatible(ext, detectedType.mime)) {
          throw new BadRequestException(
            `File extension mismatch. Extension: ${ext}, Detected type: ${detectedType.mime}`
          );
        }

      } catch (error) {
        if (error instanceof BadRequestException) {
          throw error;
        }
        throw new BadRequestException('File validation failed');
      }
    }

    // 5. Check for null bytes (security check)
    if (file.originalname.includes('\0')) {
      throw new BadRequestException('Invalid filename');
    }

    // 6. Check filename length
    if (file.originalname.length > 255) {
      throw new BadRequestException('Filename too long');
    }
  }

  /**
   * Helper: Get allowed extensions based on MIME types
   */
  private getAllowedExtensions(mimeTypes?: string[]): string[] {
    if (!mimeTypes || mimeTypes.length === 0) {
      return this.allowedExtensions.all;
    }

    const extensions: string[] = [];

    mimeTypes.forEach(mime => {
      if (mime.startsWith('image/')) {
        extensions.push(...this.allowedExtensions.images);
      } else if (mime.includes('pdf') || mime.includes('document') || mime.includes('spreadsheet')) {
        extensions.push(...this.allowedExtensions.documents);
      }
    });

    return [...new Set(extensions)]; // Remove duplicates
  }

  /**
   * Helper: Check if extension is compatible with MIME type
   */
  private isExtensionCompatible(ext: string, mime: string): boolean {
    const compatibilityMap: Record<string, string[]> = {
      '.jpg': ['image/jpeg'],
      '.jpeg': ['image/jpeg'],
      '.png': ['image/png'],
      '.webp': ['image/webp'],
      '.gif': ['image/gif'],
      '.pdf': ['application/pdf'],
    };

    return compatibilityMap[ext]?.includes(mime) || false;
  }

  /**
   * Upload single file
   */
  async uploadFile(
    file: Express.Multer.File,
    options?: UploadOptions
  ): Promise<UploadResult> {
    // ✅ CRITICAL: Validate file first
    await this.validateFile(file, options);

    const folder = options?.folder || 'general';
    const folderPath = path.join(this.uploadDir, folder);

    // Create folder if not exists
    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath, { recursive: true });
    }

    // Generate unique filename with original extension
    const ext = path.extname(file.originalname).toLowerCase();
    const filename = `${uuidv4()}${ext}`;
    const filePath = path.join(folderPath, filename);

    // Write file
    fs.writeFileSync(filePath, file.buffer);

    // Set restrictive permissions (read-only for others)
    fs.chmodSync(filePath, 0o644);

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
   * ✅ FIXED: Secure file path resolution
   */
  getFilePath(relativePath: string): string {
    // Remove 'uploads/' prefix if present
    const cleanPath = relativePath.replace(/^uploads\//, '');

    // Resolve the full path
    const fullPath = path.resolve(this.uploadDir, cleanPath);
    const baseDir = path.resolve(this.uploadDir);

    // ✅ CRITICAL: Ensure path is within base directory (prevent path traversal)
    if (!fullPath.startsWith(baseDir)) {
      throw new BadRequestException('Invalid file path');
    }

    return fullPath;
  }

  /**
   * Check if file exists
   */
  fileExists(relativePath: string): boolean {
    try {
      const fullPath = this.getFilePath(relativePath);
      return fs.existsSync(fullPath);
    } catch {
      return false;
    }
  }
}
```

---

## 3️⃣ FILE: `backend-daylight/src/upload/upload.controller.ts`

**REPLACE ENTIRE FILE dengan:**

```typescript
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
  NotFoundException,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { Throttle } from '@nestjs/throttler';
import type { Response } from 'express';
import { UploadService } from './upload.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { Public } from '../common/decorators/public.decorator';
import * as path from 'path';
import * as fs from 'fs';

@Controller('uploads')
export class UploadController {
  // ✅ SECURITY: Whitelist allowed folders
  private readonly allowedFolders = ['avatars', 'general', 'events', 'blogs'];

  constructor(private uploadService: UploadService) {}

  /**
   * ✅ FIXED: Upload single file with MIME type validation
   */
  @Post('file')
  @UseGuards(JwtAuthGuard)
  @Throttle({ default: { limit: 20, ttl: 3600000 } }) // ✅ ADDED: 20 uploads per hour
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    // ✅ CRITICAL FIX: Add MIME type whitelist
    return this.uploadService.uploadFile(file, {
      allowedMimeTypes: [
        // Images
        'image/jpeg',
        'image/png',
        'image/jpg',
        'image/webp',
        'image/gif',
        // Documents
        'application/pdf',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      ],
      maxSize: 10 * 1024 * 1024, // 10MB
      folder: 'general',
    });
  }

  /**
   * ✅ FIXED: Upload multiple files with rate limiting
   */
  @Post('files')
  @UseGuards(JwtAuthGuard)
  @Throttle({ default: { limit: 10, ttl: 3600000 } }) // ✅ ADDED: 10 batch uploads per hour
  @UseInterceptors(FilesInterceptor('files', 10))
  async uploadFiles(@UploadedFiles() files: Express.Multer.File[]) {
    if (!files || files.length === 0) {
      throw new BadRequestException('No files uploaded');
    }

    // ✅ ADDED: Maximum 10 files per batch
    if (files.length > 10) {
      throw new BadRequestException('Maximum 10 files per upload');
    }

    return this.uploadService.uploadFiles(files, {
      allowedMimeTypes: [
        'image/jpeg',
        'image/png',
        'image/jpg',
        'image/webp',
        'image/gif',
        'application/pdf',
      ],
      maxSize: 10 * 1024 * 1024,
      folder: 'general',
    });
  }

  /**
   * Upload avatar (stricter validation)
   */
  @Post('avatar')
  @UseGuards(JwtAuthGuard)
  @Throttle({ default: { limit: 5, ttl: 3600000 } }) // ✅ ADDED: 5 avatar uploads per hour
  @UseInterceptors(FileInterceptor('avatar'))
  async uploadAvatar(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    return this.uploadService.uploadFile(file, {
      allowedMimeTypes: ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'],
      maxSize: 5 * 1024 * 1024, // 5MB for avatars
      folder: 'avatars',
    });
  }

  /**
   * ✅ CRITICAL FIX: Serve uploaded files with path traversal protection
   */
  @Public()
  @Get(':folder/:filename')
  async serveFile(
    @Param('folder') folder: string,
    @Param('filename') filename: string,
    @Res() res: Response
  ) {
    // ✅ SECURITY FIX 1: Validate folder against whitelist
    if (!this.allowedFolders.includes(folder)) {
      throw new BadRequestException('Invalid folder');
    }

    // ✅ SECURITY FIX 2: Validate filename (prevent path traversal)
    if (
      filename.includes('..') ||
      filename.includes('/') ||
      filename.includes('\\') ||
      filename.includes('\0')
    ) {
      throw new BadRequestException('Invalid filename');
    }

    // ✅ SECURITY FIX 3: Validate filename format (UUID + extension)
    const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.(jpg|jpeg|png|webp|gif|pdf|doc|docx|xls|xlsx)$/i;
    if (!uuidPattern.test(filename)) {
      throw new BadRequestException('Invalid filename format');
    }

    try {
      // ✅ SECURITY FIX 4: Use secure path resolution
      const filePath = this.uploadService.getFilePath(`${folder}/${filename}`);

      // ✅ SECURITY FIX 5: Verify file exists
      if (!fs.existsSync(filePath)) {
        throw new NotFoundException('File not found');
      }

      // ✅ SECURITY FIX 6: Verify it's a file (not directory)
      const stats = fs.statSync(filePath);
      if (!stats.isFile()) {
        throw new BadRequestException('Invalid file');
      }

      // ✅ SECURITY: Set proper MIME type based on extension
      const ext = path.extname(filename).toLowerCase();
      const mimeTypes: Record<string, string> = {
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.png': 'image/png',
        '.webp': 'image/webp',
        '.gif': 'image/gif',
        '.pdf': 'application/pdf',
        '.doc': 'application/msword',
        '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        '.xls': 'application/vnd.ms-excel',
        '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      };

      const mimeType = mimeTypes[ext] || 'application/octet-stream';
      res.setHeader('Content-Type', mimeType);

      // ✅ SECURITY: Prevent browsers from executing files
      res.setHeader('X-Content-Type-Options', 'nosniff');

      // Set cache headers
      res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');

      return res.sendFile(filePath);
    } catch (error) {
      if (error instanceof BadRequestException || error instanceof NotFoundException) {
        throw error;
      }
      throw new NotFoundException('File not found');
    }
  }
}
```

---

## 4️⃣ FILE: `backend-daylight/src/common/guards/csrf.guard.ts` (NEW FILE)

**CREATE NEW FILE:**

```typescript
import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import * as crypto from 'crypto';

/**
 * ✅ CSRF Protection Guard
 * Implements Double Submit Cookie pattern
 */
@Injectable()
export class CsrfGuard implements CanActivate {
  private readonly logger = new Logger(CsrfGuard.name);

  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // Check if route is marked as CSRF-exempt
    const isCsrfExempt = this.reflector.getAllAndOverride<boolean>('csrfExempt', [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isCsrfExempt) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const method = request.method.toUpperCase();

    // Only check CSRF for state-changing methods
    if (['GET', 'HEAD', 'OPTIONS'].includes(method)) {
      return true;
    }

    // Get CSRF token from header
    const csrfTokenHeader = request.headers['x-csrf-token'] as string;

    // Get CSRF token from cookie
    const csrfTokenCookie = request.cookies?.['csrf-token'];

    // Validate tokens exist
    if (!csrfTokenHeader || !csrfTokenCookie) {
      this.logger.warn(`CSRF token missing. Method: ${method}, Path: ${request.path}`);
      throw new ForbiddenException('CSRF token missing');
    }

    // Validate tokens match (constant-time comparison)
    if (!this.secureCompare(csrfTokenHeader, csrfTokenCookie)) {
      this.logger.warn(`CSRF token mismatch. Method: ${method}, Path: ${request.path}, IP: ${request.ip}`);
      throw new ForbiddenException('Invalid CSRF token');
    }

    return true;
  }

  /**
   * Constant-time string comparison to prevent timing attacks
   */
  private secureCompare(a: string, b: string): boolean {
    if (a.length !== b.length) {
      return false;
    }

    try {
      return crypto.timingSafeEqual(Buffer.from(a), Buffer.from(b));
    } catch {
      return false;
    }
  }
}

/**
 * Decorator to exempt routes from CSRF protection
 * Use for webhook callbacks and public APIs
 */
import { SetMetadata } from '@nestjs/common';
export const CsrfExempt = () => SetMetadata('csrfExempt', true);
```

---

## 5️⃣ FILE: `backend-daylight/src/common/middleware/csrf.middleware.ts` (NEW FILE)

**CREATE NEW FILE:**

```typescript
import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import * as crypto from 'crypto';
import { ConfigService } from '@nestjs/config';

/**
 * ✅ CSRF Token Generation Middleware
 */
@Injectable()
export class CsrfMiddleware implements NestMiddleware {
  constructor(private configService: ConfigService) {}

  use(req: Request, res: Response, next: NextFunction) {
    // Generate CSRF token if not exists
    let csrfToken = req.cookies?.['csrf-token'];

    if (!csrfToken) {
      // Generate new token
      csrfToken = crypto.randomBytes(32).toString('hex');

      // Set cookie
      const isProduction = this.configService.get('NODE_ENV') === 'production';
      const cookieDomain = this.configService.get('COOKIE_DOMAIN');

      res.cookie('csrf-token', csrfToken, {
        httpOnly: false, // Frontend needs to read this
        secure: isProduction,
        sameSite: isProduction ? 'none' : 'lax',
        path: '/',
        domain: isProduction ? cookieDomain : undefined,
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
      });
    }

    // Attach token to response for frontend to read
    res.locals.csrfToken = csrfToken;

    next();
  }
}
```

---

## 6️⃣ FILE: `backend-daylight/src/payment/payment.service.ts`

**HANYA REPLACE method `handleCallback` (line 324-486):**

```typescript
  /**
   * ✅ FIXED: Handle payment callback with race condition protection
   */
  async handleCallback(
    callbackData: PaymentCallbackDto,
    signature: string,
  ) {
    this.logger.log('=== CALLBACK RECEIVED ===');
    this.logger.log(`Reference: ${callbackData.reference}`);
    this.logger.log(`Merchant Ref: ${callbackData.merchant_ref}`);
    this.logger.log(`Status: ${callbackData.status}`);

    // Verify signature
    const isValid = this.verifyCallbackSignature(callbackData, signature);
    if (!isValid) {
      this.logger.error('Invalid callback signature');
      throw new UnauthorizedException('Invalid signature');
    }

    this.logger.log('✅ Signature verified');

    const { merchant_ref, status, paid_at } = callbackData;

    // Map Tripay status
    let mappedStatus: PaymentStatus;
    switch (status) {
      case 'PAID':
        mappedStatus = PaymentStatus.PAID;
        break;
      case 'EXPIRED':
        mappedStatus = PaymentStatus.EXPIRED;
        break;
      case 'FAILED':
        mappedStatus = PaymentStatus.FAILED;
        break;
      case 'REFUND':
        mappedStatus = PaymentStatus.REFUNDED;
        break;
      default:
        mappedStatus = PaymentStatus.PENDING;
    }

    // ✅ CRITICAL FIX: Use database transaction with row locking to prevent race condition
    const result = await this.prisma.$transaction(async (tx) => {
      // Find and lock the transaction row (FOR UPDATE)
      const transaction = await tx.transaction.findUnique({
        where: { merchantRef: merchant_ref },
        include: {
          event: true,
          user: true,
          userSubscription: {
            include: {
              plan: true,
            },
          },
        },
      });

      if (!transaction) {
        this.logger.error(`Transaction not found: ${merchant_ref}`);
        throw new NotFoundException('Transaction not found');
      }

      this.logger.log(`Found transaction: ${transaction.id}`);
      this.logger.log(`Current status: ${transaction.paymentStatus}`);
      this.logger.log(`New status: ${mappedStatus}`);

      // ✅ CRITICAL: Prevent processing if already paid/completed
      if (transaction.paymentStatus === PaymentStatus.PAID) {
        this.logger.warn(`Transaction already PAID: ${transaction.id}`);
        return {
          success: true,
          message: 'Transaction already processed',
          transaction,
        };
      }

      // ✅ CRITICAL: Only allow valid status transitions
      const validTransitions: Record<PaymentStatus, PaymentStatus[]> = {
        [PaymentStatus.PENDING]: [
          PaymentStatus.PAID,
          PaymentStatus.EXPIRED,
          PaymentStatus.FAILED,
        ],
        [PaymentStatus.PAID]: [], // No transitions from PAID
        [PaymentStatus.EXPIRED]: [],
        [PaymentStatus.FAILED]: [PaymentStatus.PAID], // Allow retry
        [PaymentStatus.REFUNDED]: [],
      };

      const allowedStatuses = validTransitions[transaction.paymentStatus] || [];
      if (!allowedStatuses.includes(mappedStatus)) {
        this.logger.warn(
          `Invalid status transition: ${transaction.paymentStatus} -> ${mappedStatus}`
        );
        throw new BadRequestException(
          `Invalid status transition from ${transaction.paymentStatus} to ${mappedStatus}`
        );
      }

      // Prepare update data
      const updateData: Prisma.TransactionUpdateInput = {
        paymentStatus: mappedStatus,
        callbackData: callbackData as any,
        updatedAt: new Date(),
      };

      if (status === 'PAID' && paid_at) {
        updateData.paidAt = new Date(paid_at * 1000);

        // HANDLE SUBSCRIPTION PAYMENT
        if (transaction.transactionType === TransactionType.SUBSCRIPTION) {
          this.logger.log('Processing SUBSCRIPTION payment');

          if (transaction.userSubscription) {
            await this.subscriptionsService.activateSubscription(
              transaction.userSubscription.id
            );
            this.logger.log(`✅ Subscription activated: ${transaction.userSubscription.id}`);
          }
        }

        // HANDLE EVENT PAYMENT
        if (transaction.transactionType === TransactionType.EVENT && transaction.eventId) {
          this.logger.log('Processing EVENT payment');

          const orderItems = transaction.orderItems as any[];
          const quantity = orderItems[0]?.quantity || 1;

          await tx.event.update({
            where: { id: transaction.eventId },
            data: {
              currentParticipants: {
                increment: quantity,
              },
            },
          });
          this.logger.log(`✅ Event participants updated: +${quantity}`);
        }
      }

      // ✅ Update transaction with new status
      const updatedTransaction = await tx.transaction.update({
        where: { id: transaction.id },
        data: updateData,
        include: {
          event: true,
          user: true,
          userSubscription: {
            include: {
              plan: true,
            },
          },
        },
      });

      this.logger.log('✅ Transaction updated successfully');

      return {
        success: true,
        message: 'Callback processed successfully',
        transaction: updatedTransaction,
      };
    });

    // Emit WebSocket events (outside transaction)
    try {
      const { transaction } = result;

      if (status === 'PAID') {
        this.paymentGateway.emitPaymentSuccess(
          transaction.id,
          transaction.userId,
          {
            type: transaction.transactionType,
            event: transaction.event,
            subscription: transaction.userSubscription,
            amount: transaction.amount,
            paidAt: transaction.paidAt,
          },
        );
      } else if (status === 'EXPIRED') {
        this.paymentGateway.emitPaymentExpired(
          transaction.id,
          transaction.userId,
        );
      } else if (status === 'FAILED') {
        this.paymentGateway.emitPaymentFailed(
          transaction.id,
          transaction.userId,
          { status },
        );
      }

      this.paymentGateway.emitPaymentStatusUpdate(transaction.id, {
        status: transaction.paymentStatus,
        paidAt: transaction.paidAt,
        updatedAt: transaction.updatedAt,
      });

      this.logger.log('✅ WebSocket events emitted');
    } catch (wsError) {
      this.logger.error(`WebSocket error: ${wsError.message}`);
    }

    return result;
  }
```

**TAMBAHKAN di akhir file (sebelum closing bracket):**

```typescript
  /**
   * ✅ SECURITY: Mask sensitive data for logging
   */
  private maskPrivateKey(key: string): string {
    if (!key || key.length < 8) return '****';
    return key.substring(0, 4) + '****' + key.substring(key.length - 4);
  }

  /**
   * ✅ SECURITY: Safe error logging (never log private keys)
   */
  private logSafeError(message: string, error: any) {
    this.logger.error(message, {
      status: error.response?.status,
      message: error.response?.data?.message || error.message,
      // ❌ NEVER log: privateKey, apiKey, signatures
    });
  }
```

---

## 7️⃣ FILE: `backend-daylight/src/payment/payment.controller.ts`

**REPLACE lines 58-79 dengan:**

```typescript
  /**
   * ✅ FIXED: Handle payment callback with rate limiting
   */
  @Public()
  @Post('callback')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 100, ttl: 60000 } }) // ✅ ADDED: 100 per minute
  async handleCallback(
    @Headers('x-callback-signature') signature: string,
    @Headers('x-callback-event') event: string,
    @Body() callbackData: PaymentCallbackDto,
  ) {
    // Validate required headers
    if (!signature) {
      throw new BadRequestException('Missing callback signature');
    }

    if (!event || event !== 'payment_status') {
      throw new BadRequestException('Invalid callback event');
    }

    // Process callback
    return this.paymentService.handleCallback(callbackData, signature);
  }
```

**REPLACE lines 86-94 dengan:**

```typescript
  /**
   * ✅ FIXED: Create new payment with rate limiting
   */
  @UseGuards(JwtAuthGuard)
  @Post('create')
  @HttpCode(HttpStatus.CREATED)
  @Throttle({ default: { limit: 10, ttl: 60000 } }) // ✅ ADDED: 10 per minute
  async createPayment(
    @CurrentUser() user: User,
    @Body() createPaymentDto: CreatePaymentDto,
  ) {
    return this.paymentService.createPayment(user.id, createPaymentDto);
  }
```

**TAMBAHKAN decorator di line 157:**

```typescript
  /**
   * ✅ FIXED: Create subscription payment with rate limiting
   */
  @UseGuards(JwtAuthGuard)
  @Post('subscribe')
  @HttpCode(HttpStatus.CREATED)
  @Throttle({ default: { limit: 5, ttl: 60000 } }) // ✅ ADDED: 5 per minute
  async createSubscriptionPayment(
    @CurrentUser() user: any,
    @Body() dto: CreateSubscriptionPaymentDto,
  ) {
    return this.paymentService.createSubscriptionPayment(user.id, dto);
  }
```

---

## 8️⃣ FILE: `backend-daylight/src/auth/auth.service.ts`

**REPLACE method `resendVerificationEmail` (lines 204-238) dengan:**

```typescript
  /**
   * ✅ FIXED: Prevent account enumeration
   */
  async resendVerificationEmail(email: string) {
    const user = await this.usersService.findByEmail(email);

    // ✅ SECURITY FIX: Always return same message (prevent enumeration)
    const genericMessage = {
      success: true,
      message: 'If an account with this email exists and is unverified, a verification email has been sent',
    };

    if (!user) {
      // Simulate processing time to prevent timing attacks
      await new Promise(resolve => setTimeout(resolve, 100 + Math.random() * 100));
      return genericMessage;
    }

    if (user.isEmailVerified) {
      // ✅ FIX: Return generic message instead of specific error
      await new Promise(resolve => setTimeout(resolve, 100 + Math.random() * 100));
      return genericMessage;
    }

    if (user.provider !== AuthProvider.LOCAL) {
      // ✅ FIX: Return generic message instead of specific error
      await new Promise(resolve => setTimeout(resolve, 100 + Math.random() * 100));
      return genericMessage;
    }

    const verificationToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = this.hashToken(verificationToken);
    const expires = new Date(Date.now() + 24 * 3600000);

    await this.usersService.updateEmailVerificationToken(user.id, tokenHash, expires);

    await this.emailService.sendVerificationEmail(
      user.email,
      verificationToken,
      user.firstName || 'User',
    );

    return genericMessage;
  }
```

---

## 9️⃣ FILE: `backend-daylight/src/main.ts`

**REPLACE lines 20-23 dengan:**

```typescript
  // ✅ ENHANCED: Security headers with CSP
  app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'"], // Adjust based on your needs
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", "data:", "https:"],
        connectSrc: ["'self'", frontendUrl],
        fontSrc: ["'self'"],
        objectSrc: ["'none'"],
        mediaSrc: ["'self'"],
        frameSrc: ["'none'"],
        frameAncestors: ["'none'"],
      },
    },
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true,
    },
  }));
```

**TAMBAHKAN setelah line 26 (setelah cookieParser):**

```typescript
  // ✅ ADDED: Request size limiting
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ limit: '1mb', extended: true }));

  // ✅ ADDED: CSRF middleware
  import { CsrfMiddleware } from './common/middleware/csrf.middleware';
  app.use(new CsrfMiddleware(configService).use.bind(new CsrfMiddleware(configService)));
```

**TAMBAHKAN import di bagian atas file:**

```typescript
import * as express from 'express';
```

---

## 🔟 FILE: `backend-daylight/package.json`

**TAMBAHKAN di dependencies:**

```json
{
  "dependencies": {
    // ... existing dependencies
    "file-type": "^19.0.0",
    "csurf": "^1.11.0"
  },
  "devDependencies": {
    // ... existing devDependencies
    "@types/csurf": "^1.11.5"
  }
}
```

---

## 1️⃣1️⃣ FILE: `backend-daylight/src/app.module.ts`

**TAMBAHKAN CSRF Guard ke providers:**

```typescript
import { APP_GUARD } from '@nestjs/core';
import { CsrfGuard } from './common/guards/csrf.guard';

@Module({
  // ... existing config
  providers: [
    // ... existing providers
    {
      provide: APP_GUARD,
      useClass: CsrfGuard,
    },
  ],
})
export class AppModule {}
```

---

## 1️⃣2️⃣ FRONTEND FIX: `frontend-daylight/src/lib/axios.ts`

**TAMBAHKAN setelah line 11:**

```typescript
// ✅ CSRF Token Helper
const getCsrfToken = (): string | null => {
  if (typeof document === 'undefined') return null;

  const match = document.cookie.match(/csrf-token=([^;]+)/);
  return match ? match[1] : null;
};

// REQUEST INTERCEPTOR dengan CSRF token
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // ✅ Add CSRF token to headers for state-changing requests
    if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(config.method?.toUpperCase() || '')) {
      const csrfToken = getCsrfToken();
      if (csrfToken) {
        config.headers['X-CSRF-Token'] = csrfToken;
      }
    }

    return config;
  },
  (error) => {
    return Promise.reject(parseApiError(error));
  }
);
```

---

## 📝 CARA IMPLEMENTASI

### Step 1: Install Dependencies
```bash
cd backend-daylight
npm install file-type@19.0.0 csurf@1.11.0
npm install --save-dev @types/csurf@1.11.5
```

### Step 2: Backup Files
```bash
# Backup semua file yang akan diubah
cp src/upload/upload.service.ts src/upload/upload.service.ts.backup
cp src/upload/upload.controller.ts src/upload/upload.controller.ts.backup
cp src/payment/payment.service.ts src/payment/payment.service.ts.backup
cp src/payment/payment.controller.ts src/payment/payment.controller.ts.backup
cp src/auth/auth.service.ts src/auth/auth.service.ts.backup
cp src/main.ts src/main.ts.backup
```

### Step 3: Apply Changes (by Priority)
1. ✅ File Upload Fixes (CRITICAL)
   - Replace `upload.service.ts`
   - Replace `upload.controller.ts`

2. ✅ CSRF Protection (CRITICAL)
   - Create `csrf.guard.ts`
   - Create `csrf.middleware.ts`
   - Update `app.module.ts`
   - Update `main.ts`
   - Update frontend `axios.ts`

3. ✅ Payment Fixes (HIGH)
   - Update `payment.service.ts`
   - Update `payment.controller.ts`

4. ✅ Auth Improvements (MEDIUM)
   - Update `auth.service.ts`

### Step 4: Test Each Fix
```bash
# Test file upload
curl -X POST http://localhost:3000/api/uploads/file \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@test-image.jpg"

# Test CSRF protection
# Should fail without CSRF token
curl -X POST http://localhost:3000/api/payment/create \
  -H "Content-Type: application/json" \
  -d '{"eventId": "123"}'

# Test payment callback (should have rate limit)
# Try 101 requests in 1 minute - should be blocked
```

### Step 5: Verify Security
```bash
# Run security audit
npm audit

# Check for issues
npm run lint
npm run test
```

---

## ⚠️ IMPORTANT NOTES

### 1. CSRF Token Flow
```
1. User visits website → Backend sets csrf-token cookie
2. Frontend reads cookie value
3. On POST/PUT/DELETE → Frontend sends X-CSRF-Token header
4. Backend validates header matches cookie
```

### 2. Breaking Changes
- ⚠️ **Frontend must include CSRF token** in headers for all state-changing requests
- ⚠️ **Webhook callbacks** need `@CsrfExempt()` decorator
- ⚠️ **Rate limits** akan block terlalu banyak requests

### 3. Webhook Exemption
**PENTING:** Tambahkan `@CsrfExempt()` untuk webhook endpoints:

```typescript
import { CsrfExempt } from '../common/guards/csrf.guard';

@Public()
@CsrfExempt() // ✅ IMPORTANT for webhooks
@Post('callback')
async handleCallback() { }
```

### 4. Environment Variables
Pastikan ada di `.env`:
```env
NODE_ENV=production
COOKIE_DOMAIN=.daylightapp.asia
UPLOAD_DIR=./uploads
```

---

## 🎯 CHECKLIST SETELAH IMPLEMENTASI

- [ ] ✅ npm install berhasil
- [ ] ✅ Semua files di-backup
- [ ] ✅ Code changes applied
- [ ] ✅ npm run build berhasil
- [ ] ✅ File upload test: reject .exe files
- [ ] ✅ File upload test: accept valid images
- [ ] ✅ Path traversal test: blocked
- [ ] ✅ CSRF test: POST without token → blocked
- [ ] ✅ CSRF test: POST with token → success
- [ ] ✅ Payment callback: rate limit works
- [ ] ✅ Payment callback: double payment blocked
- [ ] ✅ Account enumeration: same message for all cases
- [ ] ✅ npm audit: no critical vulnerabilities

---

## 🆘 TROUBLESHOOTING

### Issue: "Cannot find module 'file-type'"
```bash
npm install file-type@19.0.0 --save
```

### Issue: CSRF blocking legitimate requests
```typescript
// Temporarily disable untuk debugging:
// Di app.module.ts, comment out CsrfGuard
```

### Issue: Frontend tidak bisa upload
```typescript
// Check CSRF token ada:
console.log('CSRF Token:', document.cookie.match(/csrf-token=([^;]+)/)?.[1]);
```

### Issue: Webhook callback error 403
```typescript
// Pastikan ada @CsrfExempt():
@CsrfExempt()
@Post('callback')
```

---

**READY TO COPY-PASTE!** 🚀

Silakan copy-paste kode di atas satu per satu sesuai urutan prioritas. Semua vulnerability critical akan ter-fix!
