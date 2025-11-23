# LAPORAN AUDIT KEAMANAN - Daylight Platform
**Tanggal Audit:** 23 November 2025
**Platform:** Event Management & Personality Matching SaaS
**Tech Stack:** NestJS + Next.js + PostgreSQL + Prisma
**Auditor:** Security Analysis System

---

## 🎯 EXECUTIVE SUMMARY

Website Daylight telah diaudit dari segi keamanan authentication hingga payment processing. Secara umum, aplikasi memiliki **implementasi keamanan yang solid** dengan beberapa area yang memerlukan perbaikan dan peningkatan.

### Status Keamanan Global
- ✅ **Authentication & Authorization:** BAIK (dengan rekomendasi)
- ✅ **Payment Processing:** BAIK (dengan peringatan kritis)
- ⚠️ **Input Validation:** BAIK (dengan catatan)
- ✅ **Session Management:** BAIK
- ⚠️ **File Upload:** MEMERLUKAN PERBAIKAN
- ✅ **API Security:** BAIK
- ⚠️ **CSRF Protection:** PARSIAL

---

## 📋 TABLE OF CONTENTS
1. [Authentication & Password Security](#1-authentication--password-security)
2. [Authorization & Access Control](#2-authorization--access-control)
3. [Session Management & JWT Security](#3-session-management--jwt-security)
4. [Payment Processing Security](#4-payment-processing-security)
5. [Input Validation & SQL Injection](#5-input-validation--sql-injection)
6. [XSS Protection](#6-xss-protection)
7. [CSRF Protection](#7-csrf-protection)
8. [File Upload Security](#8-file-upload-security)
9. [API Security & Rate Limiting](#9-api-security--rate-limiting)
10. [Data Encryption & Sensitive Data](#10-data-encryption--sensitive-data)
11. [Dependencies & Known Vulnerabilities](#11-dependencies--known-vulnerabilities)
12. [Critical Findings Summary](#12-critical-findings-summary)
13. [Recommendations](#13-recommendations)

---

## 1. AUTHENTICATION & PASSWORD SECURITY

### ✅ Kekuatan (Strengths)

#### 1.1 Password Hashing
```typescript
Location: backend-daylight/src/users/users.service.ts:35
```
- **Algoritma:** bcryptjs dengan salt rounds = 12
- **Status:** ✅ AMAN
- Password tidak pernah disimpan dalam plaintext
- Salt rounds 12 memberikan proteksi yang kuat terhadap brute-force

#### 1.2 Password Requirements
```typescript
Location: backend-daylight/src/auth/dto/register.dto.ts:8-12
```
- Minimum 8 karakter
- Harus mengandung: uppercase, lowercase, number, special character
- Regex validation yang kuat
- **Status:** ✅ AMAN

#### 1.3 Email Verification
```typescript
Location: backend-daylight/src/auth/auth.service.ts:129-141
```
- Token verification menggunakan crypto.randomBytes(32)
- Token di-hash dengan SHA256 sebelum disimpan
- Expiry: 24 jam
- **Status:** ✅ AMAN

#### 1.4 Password Reset Flow
```typescript
Location: backend-daylight/src/auth/auth.service.ts:397-428
```
- Reset token: crypto.randomBytes(32) + SHA256 hashing
- Expiry: 1 jam
- Token hanya valid sekali (dihapus setelah digunakan)
- **Status:** ✅ AMAN

#### 1.5 Multi-Provider Authentication
- LOCAL (email/password)
- Google OAuth 2.0
- Provider mismatch protection
- **Status:** ✅ BAIK

### ⚠️ Kelemahan & Rekomendasi

#### 1.1 Account Enumeration
```typescript
Location: backend-daylight/src/auth/auth.service.ts:204-211
```
**Issue:** Endpoint `resendVerificationEmail` mengembalikan pesan berbeda untuk user yang tidak ada vs user yang sudah verified.

```typescript
// Saat ini:
if (!user) {
  return { success: true, message: 'If an account exists...' }; // Generic
}
if (user.isEmailVerified) {
  throw new BadRequestException('EMAIL_ALREADY_VERIFIED'); // Specific!
}
```

**Risk:** MEDIUM
**Impact:** Attacker dapat enumerate valid email addresses
**Rekomendasi:** Kembalikan pesan generic yang sama untuk semua kasus

#### 1.2 Login Rate Limiting
```typescript
Location: backend-daylight/src/auth/auth.controller.ts:64
@Throttle({ default: { limit: 10, ttl: 900000 } }) // 10 attempts per 15 minutes
```

**Status:** ✅ BAIK, tapi bisa diperkuat
**Rekomendasi:**
- Tambahkan account lockout setelah N failed attempts
- Implement progressive delays (backoff strategy)
- Log failed login attempts untuk monitoring

#### 1.3 Password Change - Same Password Check
```typescript
Location: backend-daylight/src/users/users.service.ts:287-294
```
**Status:** ✅ BAIK - mencegah user menggunakan password lama

---

## 2. AUTHORIZATION & ACCESS CONTROL

### ✅ Implementasi yang Baik

#### 2.1 Role-Based Access Control (RBAC)
```typescript
Location: backend-daylight/src/common/guards/roles.guard.ts
```
- Roles: USER, ADMIN
- Guard enforcement yang konsisten
- **Status:** ✅ AMAN

#### 2.2 JWT Auth Guard
```typescript
Location: backend-daylight/src/common/guards/jwt-auth.guard.ts
```
- Global guard dengan @Public() decorator bypass
- User aktif validation
- **Status:** ✅ AMAN

#### 2.3 Resource Ownership Validation
```typescript
Location: backend-daylight/src/payment/payment.service.ts:491-504
```
Payment endpoints memvalidasi userId:
```typescript
const transaction = await this.prisma.transaction.findFirst({
  where: { id: transactionId, userId: userId } // ✅ Good!
});
```

### ⚠️ Potensi Issues

#### 2.1 No Fine-Grained Permissions
**Status:** ⚠️ MEDIUM RISK (untuk scaling)
Saat ini hanya 2 roles (USER, ADMIN). Untuk aplikasi yang berkembang, pertimbangkan:
- Permission-based access control
- Resource-level permissions
- Feature flags

---

## 3. SESSION MANAGEMENT & JWT SECURITY

### ✅ Implementasi yang Sangat Baik

#### 3.1 Token Architecture
```typescript
Location: backend-daylight/src/auth/auth.service.ts:533-573
```
**Design:**
- Access Token: Short-lived (default: 1 day)
- Refresh Token: Long-lived (default: 7 days)
- Token versioning untuk logout-all functionality
- **Status:** ✅ EXCELLENT

#### 3.2 Token Storage - HttpOnly Cookies
```typescript
Location: backend-daylight/src/auth/auth.controller.ts:246-273
```
**Configuration:**
```typescript
const cookieOptions = {
  httpOnly: true,              // ✅ XSS protection
  secure: isProduction,        // ✅ HTTPS only in prod
  sameSite: 'none'|'lax',     // ✅ CSRF protection
  path: '/',
  domain: cookieDomain,
};
```
**Status:** ✅ EXCELLENT - Melindungi dari XSS attacks

#### 3.3 Refresh Token Rotation
```typescript
Location: backend-daylight/src/auth/auth.service.ts:447-479
```
**Flow:**
1. Validasi refresh token dari database
2. Revoke token lama
3. Generate token baru
4. Store new token hash

**Status:** ✅ EXCELLENT - Best practice implementation

#### 3.4 Token Blacklist/Revocation
```typescript
Location: backend-daylight/src/auth/auth.service.ts:500-531
```
**Features:**
- Database-backed token blacklist (RefreshToken table)
- Token versioning (user.refreshTokenVersion)
- Logout single device
- Logout all devices

**Status:** ✅ EXCELLENT

#### 3.5 JWT Payload Minimal
```typescript
interface TokenPayload {
  sub: string;           // User ID
  email: string;         // Email
  tokenVersion: number;  // For revocation
  type: 'access' | 'refresh';
}
```
**Status:** ✅ BAIK - Tidak ada sensitive data dalam payload

### ⚠️ Areas for Improvement

#### 3.1 JWT Secret Strength
```typescript
Location: backend-daylight/src/auth/strategies/jwt.strategy.ts:14
```
**Recommendation:**
- Pastikan JWT_SECRET minimal 256 bits (32 karakter random)
- Gunakan separate secrets untuk access & refresh tokens (✅ sudah diimplementasi)
- Rotate secrets secara periodik

#### 3.2 Token Expiry Monitoring
**Missing:** Tidak ada cleanup untuk expired refresh tokens di database

**Rekomendasi:**
```typescript
// Scheduled task untuk cleanup
@Cron('0 0 * * *') // Daily
async cleanupExpiredTokens() {
  await this.prisma.refreshToken.deleteMany({
    where: { expiresAt: { lt: new Date() } }
  });
}
```

---

## 4. PAYMENT PROCESSING SECURITY

### ✅ Implementasi yang Baik

#### 4.1 Signature Verification (HMAC-SHA256)
```typescript
Location: backend-daylight/src/payment/payment.service.ts:82-100
```
**Tripay Callback Verification:**
```typescript
private verifyCallbackSignature(callbackData, signature): boolean {
  const json = JSON.stringify(callbackData);
  const calculatedSignature = crypto
    .createHmac('sha256', this.tripayPrivateKey)
    .update(json)
    .digest('hex');
  return calculatedSignature === signature;
}
```
**Status:** ✅ EXCELLENT - Proteksi terhadap callback forgery

#### 4.2 Transaction Signature Generation
```typescript
Location: backend-daylight/src/payment/payment.service.ts:71-77
```
```typescript
private generateSignature(merchantRef: string, amount: number): string {
  const data = merchantCode + merchantRef + amount;
  return crypto.createHmac('sha256', privateKey).update(data).digest('hex');
}
```
**Status:** ✅ AMAN

#### 4.3 Merchant Reference Uniqueness
```typescript
Location: backend-daylight/src/payment/payment.service.ts:62-66
```
```typescript
private generateMerchantRef(): string {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 10000);
  return `INV-${timestamp}-${random}`;
}
```
**Status:** ✅ BAIK (timestamp + random)

#### 4.4 Payment Method Validation
```typescript
Location: backend-daylight/src/payment/payment.service.ts:186-192
```
Memvalidasi payment method aktif sebelum membuat transaksi.
**Status:** ✅ BAIK

#### 4.5 Amount Validation
Fee calculation dan final amount diverifikasi melalui Tripay API.
**Status:** ✅ BAIK

### 🔴 CRITICAL SECURITY ISSUES

#### 4.1 🔴 CRITICAL: Private Key Exposure Risk
```typescript
Location: backend-daylight/src/payment/payment.service.ts:28-47
```

**Issue:**
```typescript
this.tripayPrivateKey = this.getRequiredConfig('TRIPAY_PRIVATE_KEY');
```

**Risks:**
1. ❌ Private key bisa terexpose di error logs
2. ❌ Tidak ada encryption untuk private key di memory
3. ❌ Jika ada error, private key bisa muncul di stack trace

**Rekomendasi SEGERA:**
```typescript
// 1. Never log private keys
this.logger.error(`Tripay API Error:`, {
  status: error.response?.status,
  message: error.response?.data?.message,
  // ❌ JANGAN: privateKey: this.tripayPrivateKey
});

// 2. Mask private key dalam logging
private maskPrivateKey(key: string): string {
  return key.substring(0, 4) + '****' + key.substring(key.length - 4);
}

// 3. Environment variable validation
if (!this.tripayPrivateKey || this.tripayPrivateKey.length < 32) {
  throw new Error('Invalid TRIPAY_PRIVATE_KEY configuration');
}
```

**Priority:** 🔴 CRITICAL
**Harus diperbaiki:** SEGERA

#### 4.2 ⚠️ Missing Rate Limiting on Callback
```typescript
Location: backend-daylight/src/payment/payment.controller.ts:60-79
```

**Issue:** Endpoint `/payment/callback` tidak memiliki rate limiting

**Risk:** MEDIUM
**Impact:** Potential DoS attack dari repeated callbacks

**Rekomendasi:**
```typescript
@Public()
@Post('callback')
@Throttle({ default: { limit: 100, ttl: 60000 } }) // Add this
@HttpCode(HttpStatus.OK)
async handleCallback(...) { }
```

#### 4.3 ⚠️ Transaction Race Condition
```typescript
Location: backend-daylight/src/payment/payment.service.ts:324-486
```

**Issue:** Tidak ada transaction locking untuk concurrent callbacks

**Scenario:**
```
Time 0ms:  Callback 1 arrives (status: PAID)
Time 5ms:  Callback 2 arrives (status: PAID)
Both process simultaneously → potential double credit
```

**Rekomendasi:**
```typescript
// Implementasi database-level locking
const transaction = await this.prisma.transaction.update({
  where: {
    merchantRef: merchant_ref,
    paymentStatus: PaymentStatus.PENDING // Only update if still PENDING
  },
  data: { paymentStatus: mappedStatus },
});

if (!transaction) {
  throw new BadRequestException('Transaction already processed');
}
```

**Priority:** ⚠️ MEDIUM-HIGH
**Harus diperbaiki:** PRIORITAS TINGGI

#### 4.4 ✅ BAIK: Payment Status Validation
Callback hanya diproses untuk status PENDING → PAID transition.
**Status:** ✅ BAIK

---

## 5. INPUT VALIDATION & SQL INJECTION

### ✅ Proteksi yang Baik

#### 5.1 Class-Validator Implementation
```typescript
Location: backend-daylight/src/main.ts:74-83
```
**Global Validation Pipe:**
```typescript
app.useGlobalPipes(
  new ValidationPipe({
    whitelist: true,           // ✅ Strip unknown properties
    forbidNonWhitelisted: true, // ✅ Reject unknown properties
    transform: true,           // ✅ Auto-transform types
  }),
);
```
**Status:** ✅ EXCELLENT

#### 5.2 DTO Validation Examples
```typescript
// RegisterDto
@IsEmail()
email: string;

@MinLength(8)
@Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/, {...})
password: string;
```
**Status:** ✅ BAIK

#### 5.3 SQL Injection Protection - Prisma ORM
```typescript
Location: Semua database queries menggunakan Prisma
```

**Prisma automatically protects against SQL injection:**
```typescript
// ✅ SAFE - Prisma parameterized query
await this.prisma.user.findUnique({
  where: { email: userInput }
});

// ✅ SAFE - Prisma handles escaping
await this.prisma.transaction.findMany({
  where: {
    OR: [
      { merchantRef: { contains: search, mode: 'insensitive' } },
      { customerName: { contains: search, mode: 'insensitive' } }
    ]
  }
});
```

**Status:** ✅ EXCELLENT - No raw SQL queries detected

### ⚠️ Potensi Issues

#### 5.1 Search Query Injection (Low Risk)
```typescript
Location: backend-daylight/src/payment/payment.service.ts:559-564
```

**Code:**
```typescript
if (search) {
  where.OR = [
    { merchantRef: { contains: search, mode: 'insensitive' } },
    { tripayReference: { contains: search, mode: 'insensitive' } },
  ];
}
```

**Status:** ✅ AMAN (Prisma handles escaping)
**Note:** Prisma's `contains` operator automatically escapes special characters

#### 5.2 Missing Validation: Amount/Quantity
```typescript
Location: backend-daylight/src/payment/dto/create-payment.dto.ts (jika ada)
```

**Rekomendasi:** Pastikan validation untuk:
```typescript
@Min(1)
@Max(1000)
@IsInt()
quantity: number;

@Min(0)
amount: number;
```

---

## 6. XSS PROTECTION

### ✅ Implementasi yang Baik

#### 6.1 HttpOnly Cookies
```typescript
Location: backend-daylight/src/auth/auth.controller.ts:256-273
```
**Configuration:**
```typescript
httpOnly: true  // ✅ JavaScript tidak bisa akses tokens
```
**Impact:** Melindungi access/refresh tokens dari XSS attacks
**Status:** ✅ EXCELLENT

#### 6.2 Helmet.js Security Headers
```typescript
Location: backend-daylight/src/main.ts:21-23
```
```typescript
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));
```

**Headers yang diset:**
- X-Content-Type-Options: nosniff
- X-Frame-Options: SAMEORIGIN
- X-XSS-Protection: 1; mode=block
- Content-Security-Policy (default)

**Status:** ✅ BAIK

#### 6.3 Content-Type Validation
Semua API responses menggunakan `application/json`.
**Status:** ✅ BAIK

### ⚠️ Areas for Improvement

#### 6.1 Content Security Policy (CSP)
**Missing:** Custom CSP headers belum dikonfigurasi

**Rekomendasi:**
```typescript
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"], // Minimize inline scripts
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", process.env.FRONTEND_URL],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      frameAncestors: ["'none'"],
    },
  },
}));
```

**Priority:** ⚠️ MEDIUM

#### 6.2 User-Generated Content Sanitization
```typescript
Location: Backend tidak terdeteksi melakukan HTML sanitization
```

**Risk:** Jika ada fitur blog/comments yang menerima HTML
**Rekomendasi:**
```typescript
import * as DOMPurify from 'isomorphic-dompurify';

@Transform(({ value }) => DOMPurify.sanitize(value))
content: string;
```

**Priority:** ⚠️ MEDIUM (tergantung fitur)

#### 6.3 Frontend XSS Protection
**File:** `frontend-daylight/src/lib/axios.ts`

**Status:** ✅ BAIK - Tidak ada eval() atau dangerouslySetInnerHTML detected

**Rekomendasi untuk frontend:**
- Gunakan React's built-in XSS protection
- Avoid `dangerouslySetInnerHTML` jika memungkinkan
- Sanitize user input sebelum render

---

## 7. CSRF PROTECTION

### ✅ Implementasi Parsial

#### 7.1 SameSite Cookie Attribute
```typescript
Location: backend-daylight/src/auth/auth.controller.ts:259
```
```typescript
sameSite: isProduction ? 'none' as const : 'lax' as const
```

**Production:** `SameSite=None` (for cross-origin)
**Development:** `SameSite=Lax`

**Status:** ⚠️ PARTIAL PROTECTION

**Analysis:**
- ✅ `SameSite=Lax` melindungi dari CSRF di development
- ⚠️ `SameSite=None` di production memerlukan proteksi tambahan

#### 7.2 CORS Configuration
```typescript
Location: backend-daylight/src/main.ts:44-69
```
**Whitelist-based origin validation:**
```typescript
const allowedOrigins = ['https://daylightapp.asia'];
origin: (origin, callback) => {
  if (allowedOrigins.includes(origin)) {
    callback(null, true);
  } else {
    callback(new Error('Not allowed by CORS'));
  }
}
```

**Status:** ✅ BAIK - Membatasi origin

### 🔴 MISSING: CSRF Token Protection

**Issue:** Tidak ada CSRF token implementation

**Risk Level:** 🔴 MEDIUM-HIGH (untuk production)

**Impact:**
Karena `SameSite=None` di production, API rentan terhadap CSRF attacks jika:
1. User logged in di browser
2. User mengunjungi malicious site
3. Malicious site membuat request ke API

**Rekomendasi CSRF Protection:**

#### Option 1: Double Submit Cookie Pattern
```typescript
// Backend
import * as csrf from 'csurf';

const csrfProtection = csrf({
  cookie: {
    httpOnly: true,
    secure: true,
    sameSite: 'none'
  }
});

app.use(csrfProtection);
```

#### Option 2: Custom Token Header
```typescript
// Backend middleware
@Injectable()
export class CsrfGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const csrfToken = request.headers['x-csrf-token'];
    const cookieToken = request.cookies['csrf-token'];

    return csrfToken && csrfToken === cookieToken;
  }
}

// Apply to state-changing operations
@Post('create')
@UseGuards(CsrfGuard)
async create() { }
```

**Priority:** 🔴 HIGH untuk production
**Harus diperbaiki:** SEBELUM PRODUCTION LAUNCH

---

## 8. FILE UPLOAD SECURITY

### ✅ Implementasi yang Ada

#### 8.1 File Size Validation
```typescript
Location: backend-daylight/src/upload/upload.service.ts:45-52
```
```typescript
const maxSize = options?.maxSize || 5 * 1024 * 1024; // Default 5MB
if (file.size > maxSize) {
  throw new BadRequestException(`File size exceeds limit`);
}
```
**Status:** ✅ BAIK

#### 8.2 MIME Type Validation
```typescript
Location: backend-daylight/src/upload/upload.service.ts:54-61
```
```typescript
if (options?.allowedMimeTypes && !options.allowedMimeTypes.includes(file.mimetype)) {
  throw new BadRequestException(`File type ${file.mimetype} is not allowed`);
}
```
**Status:** ✅ BAIK untuk avatar uploads

#### 8.3 UUID Filename Generation
```typescript
Location: backend-daylight/src/upload/upload.service.ts:82-83
```
```typescript
const ext = path.extname(file.originalname);
const filename = `${uuidv4()}${ext}`;
```
**Status:** ✅ BAIK - Prevents path traversal

### 🔴 CRITICAL SECURITY ISSUES

#### 8.1 🔴 CRITICAL: Missing File Content Validation
```typescript
Location: backend-daylight/src/upload/upload.controller.ts:28-40
```

**Issue:** Generic file upload endpoint tidak memvalidasi MIME type!

```typescript
@Post('file')
@UseInterceptors(FileInterceptor('file'))
async uploadFile(@UploadedFile() file: Express.Multer.File) {
  return this.uploadService.uploadFile(file, {
    maxSize: 10 * 1024 * 1024,
    folder: 'general',
    // ❌ NO allowedMimeTypes! User bisa upload .exe, .php, .js
  });
}
```

**Risk:** 🔴 CRITICAL
**Impact:**
- User bisa upload malicious files (.exe, .php, .sh)
- Jika directory executable, bisa remote code execution
- Jika file di-serve dengan incorrect MIME, XSS risk

**Exploit Scenario:**
```bash
# Attacker uploads malicious file
curl -X POST http://api.daylightapp.asia/api/uploads/file \
  -H "Authorization: Bearer [token]" \
  -F "file=@malicious.php"

# File saved as: uploads/general/uuid-random.php
# If served with wrong MIME or executed → RCE
```

**Rekomendasi SEGERA:**
```typescript
@Post('file')
@UseInterceptors(FileInterceptor('file'))
async uploadFile(@UploadedFile() file: Express.Multer.File) {
  // ✅ ADD WHITELIST
  const allowedMimeTypes = [
    'image/jpeg', 'image/png', 'image/jpg', 'image/webp',
    'application/pdf',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  ];

  return this.uploadService.uploadFile(file, {
    maxSize: 10 * 1024 * 1024,
    folder: 'general',
    allowedMimeTypes, // ✅ CRITICAL
  });
}
```

**Priority:** 🔴 CRITICAL
**Harus diperbaiki:** SEGERA

#### 8.2 🔴 CRITICAL: Magic Byte Validation Missing
**Issue:** MIME type validation hanya berdasarkan `Content-Type` header

**Risk:**
Attacker bisa rename `malware.exe` → `malware.png` dan bypass MIME check

**Rekomendasi:**
```typescript
import * as fileType from 'file-type';

async validateFile(file: Express.Multer.File, options?: UploadOptions): Promise<void> {
  // ✅ Magic byte validation
  const detectedType = await fileType.fromBuffer(file.buffer);

  if (!detectedType || !options.allowedMimeTypes.includes(detectedType.mime)) {
    throw new BadRequestException(
      `Invalid file type. Detected: ${detectedType?.mime}, Expected: ${options.allowedMimeTypes.join(', ')}`
    );
  }

  // ✅ Also check file extension
  const ext = path.extname(file.originalname).toLowerCase();
  const allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.pdf'];
  if (!allowedExtensions.includes(ext)) {
    throw new BadRequestException('Invalid file extension');
  }
}
```

**Priority:** 🔴 CRITICAL
**Harus diperbaiki:** SEGERA

#### 8.3 🔴 HIGH: Path Traversal in serveFile
```typescript
Location: backend-daylight/src/upload/upload.controller.ts:80-97
```

**Issue:**
```typescript
@Get(':folder/:filename')
async serveFile(
  @Param('folder') folder: string,  // ❌ User controlled!
  @Param('filename') filename: string, // ❌ User controlled!
  @Res() res: Response
) {
  const filePath = this.uploadService.getFilePath(`${folder}/${filename}`);
  return res.sendFile(path.resolve(filePath));
}
```

**Exploit:**
```bash
GET /api/uploads/../../../etc/passwd
GET /api/uploads/general/../../../../app/.env
```

**Rekomendasi SEGERA:**
```typescript
@Get(':folder/:filename')
async serveFile(
  @Param('folder') folder: string,
  @Param('filename') filename: string,
  @Res() res: Response
) {
  // ✅ Validate folder
  const allowedFolders = ['avatars', 'general', 'events'];
  if (!allowedFolders.includes(folder)) {
    throw new BadRequestException('Invalid folder');
  }

  // ✅ Validate filename (no path traversal)
  if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
    throw new BadRequestException('Invalid filename');
  }

  // ✅ Use path.join safely
  const filePath = this.uploadService.getFilePath(`${folder}/${filename}`);
  const resolvedPath = path.resolve(filePath);
  const baseDir = path.resolve(this.uploadService.uploadDir);

  // ✅ Ensure path is within base directory
  if (!resolvedPath.startsWith(baseDir)) {
    throw new BadRequestException('Invalid file path');
  }

  if (!fs.existsSync(resolvedPath)) {
    throw new NotFoundException('File not found');
  }

  return res.sendFile(resolvedPath);
}
```

**Priority:** 🔴 CRITICAL
**Harus diperbaiki:** SEGERA

#### 8.4 ⚠️ Missing: Virus Scanning
**Recommendation:** Integrate antivirus scanning (ClamAV) untuk production

---

## 9. API SECURITY & RATE LIMITING

### ✅ Implementasi yang Baik

#### 9.1 Throttler Module
```typescript
Location: backend-daylight/package.json:41
@nestjs/throttler: ^6.4.0
```

**Rate Limits Applied:**
```typescript
// Registration
@Throttle({ default: { limit: 5, ttl: 3600000 } })  // 5 per hour
POST /auth/register

// Email Verification Resend
@Throttle({ default: { limit: 3, ttl: 3600000 } })  // 3 per hour
POST /auth/resend-verification

// Login
@Throttle({ default: { limit: 10, ttl: 900000 } })  // 10 per 15 min
POST /auth/login

// Forgot Password
@Throttle({ default: { limit: 3, ttl: 3600000 } })  // 3 per hour
POST /auth/forgot-password
```

**Status:** ✅ EXCELLENT

#### 9.2 Helmet Security Headers
```typescript
Location: backend-daylight/src/main.ts:21-23
```
**Status:** ✅ BAIK

#### 9.3 CORS Whitelist
```typescript
Location: backend-daylight/src/main.ts:38-55
```
**Production Origins:**
- https://daylightapp.asia

**Status:** ✅ BAIK - Strict whitelist

### ⚠️ Areas for Improvement

#### 9.1 Missing Rate Limiting on Critical Endpoints

**Missing Rate Limits:**
```typescript
❌ POST /payment/create        // No limit - potential DoS
❌ POST /payment/callback       // No limit - potential abuse
❌ POST /uploads/file           // No limit - storage DoS
❌ GET  /payment/my-transactions // No limit - enumeration
```

**Rekomendasi:**
```typescript
// Payment creation
@Throttle({ default: { limit: 10, ttl: 60000 } })  // 10 per minute
@Post('create')
async createPayment() { }

// File uploads
@Throttle({ default: { limit: 20, ttl: 3600000 } })  // 20 per hour
@Post('file')
async uploadFile() { }

// Callback endpoint
@Throttle({ default: { limit: 100, ttl: 60000 } })  // 100 per minute
@Post('callback')
async handleCallback() { }
```

**Priority:** ⚠️ MEDIUM-HIGH

#### 9.2 IP-Based Rate Limiting
**Recommendation:** Implement IP-based rate limiting untuk production

```typescript
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';

ThrottlerModule.forRoot({
  ttl: 60,
  limit: 100,
  ignoreUserAgents: [/googlebot/i], // Whitelist crawlers
  skipIf: (context) => {
    // Skip for admin IPs
    const request = context.switchToHttp().getRequest();
    const adminIPs = ['1.2.3.4'];
    return adminIPs.includes(request.ip);
  }
})
```

#### 9.3 Request Size Limiting
**Missing:** No explicit request body size limit

**Rekomendasi:**
```typescript
// main.ts
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ limit: '1mb', extended: true }));
```

---

## 10. DATA ENCRYPTION & SENSITIVE DATA

### ✅ Implementasi yang Baik

#### 10.1 Password Hashing
- **Algorithm:** bcryptjs (salt rounds: 12)
- **Status:** ✅ EXCELLENT

#### 10.2 Token Hashing
```typescript
Location: backend-daylight/src/auth/auth.service.ts:52-54
```
```typescript
private hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}
```

**Applied to:**
- Email verification tokens
- Password reset tokens
- Refresh tokens (before storage)

**Status:** ✅ EXCELLENT

#### 10.3 JWT Signing
- **Algorithm:** HS256 (HMAC-SHA256)
- **Separate secrets:** JWT_SECRET vs JWT_REFRESH_SECRET
- **Status:** ✅ BAIK

#### 10.4 Payment Signature
- **Algorithm:** HMAC-SHA256
- **Status:** ✅ EXCELLENT

### ⚠️ Potensi Issues

#### 10.1 Database: Sensitive Data at Rest
**Issue:** Database tidak menggunakan encryption at rest

**Rekomendasi untuk Production:**
```sql
-- PostgreSQL: Enable encryption at rest
-- 1. Use AWS RDS with encryption enabled
-- 2. Use Azure Database for PostgreSQL with TDE
-- 3. Use Google Cloud SQL with encryption

-- OR implement column-level encryption untuk field sensitive:
-- - phoneNumber
-- - paymentMethod details
-- - Transaction metadata
```

**Priority:** ⚠️ MEDIUM (tergantung compliance requirements)

#### 10.2 HTTPS Enforcement
```typescript
Location: backend-daylight/src/auth/auth.controller.ts:258
```
```typescript
secure: isProduction  // Cookies only over HTTPS in production
```

**Status:** ✅ BAIK
**Ensure:** SSL/TLS certificate valid dan up-to-date

#### 10.3 Sensitive Data in Logs
**Rekomendasi:**
```typescript
// ❌ JANGAN
this.logger.log(`User password: ${password}`);
this.logger.log(`Payment details:`, transaction);

// ✅ LAKUKAN
this.logger.log(`User login attempt: ${email}`);
this.logger.log(`Payment created: ${transaction.id}`);
```

**Audit:** Pastikan tidak ada logging untuk:
- Passwords
- Tokens
- Private keys
- Credit card details
- Full transaction objects

#### 10.4 Environment Variables Security
**File:** `.env`

**CRITICAL:** Pastikan `.env` file:
- ✅ Di-ignore di `.gitignore`
- ❌ TIDAK di-commit ke repository
- ✅ Restricted file permissions (chmod 600)
- ✅ Tidak accessible via web server

---

## 11. DEPENDENCIES & KNOWN VULNERABILITIES

### 📦 Package Audit

**Backend Dependencies:**
```json
{
  "@nestjs/core": "^11.0.1",
  "@nestjs/jwt": "^11.0.1",
  "@prisma/client": "^6.19.0",
  "bcryptjs": "^3.0.3",
  "helmet": "^8.1.0",
  "passport-jwt": "^4.0.1",
  "axios": "^1.13.2"
}
```

### ⚠️ Recommendations

#### 11.1 Regular Security Updates
```bash
# Jalankan secara berkala
npm audit
npm audit fix

# Atau gunakan automated tools
npm install -g npm-check-updates
ncu -u
```

**Priority:** ⚠️ MEDIUM
**Frequency:** Minimal setiap bulan

#### 11.2 Known Vulnerabilities Check
**Tool:** Snyk, Dependabot, or npm audit

**Rekomendasi:**
- Enable GitHub Dependabot alerts
- Run `npm audit` sebelum setiap deployment
- Subscribe to security advisories untuk critical packages

#### 11.3 Outdated Packages
**Recommendation:** Update to latest stable versions

**Priority Packages to Monitor:**
- `@nestjs/*` - Security patches frequent
- `passport-*` - Authentication critical
- `helmet` - Security headers
- `axios` - HTTP client vulnerabilities

---

## 12. CRITICAL FINDINGS SUMMARY

### 🔴 CRITICAL (Harus diperbaiki SEGERA)

| # | Issue | Location | Risk | Priority |
|---|-------|----------|------|----------|
| 1 | **File Upload: No MIME Type Validation** | `upload.controller.ts:28-40` | RCE | 🔴 CRITICAL |
| 2 | **File Upload: Path Traversal Vulnerability** | `upload.controller.ts:80-97` | Information Disclosure | 🔴 CRITICAL |
| 3 | **File Upload: Magic Byte Validation Missing** | `upload.service.ts:45-62` | Malware Upload | 🔴 CRITICAL |
| 4 | **Payment: Private Key Exposure Risk** | `payment.service.ts:28-47` | Key Compromise | 🔴 CRITICAL |
| 5 | **CSRF Protection Missing** | Global | CSRF Attack | 🔴 HIGH |

### ⚠️ HIGH PRIORITY

| # | Issue | Location | Risk | Priority |
|---|-------|----------|------|----------|
| 6 | **Payment: Transaction Race Condition** | `payment.service.ts:324-486` | Double Payment | ⚠️ HIGH |
| 7 | **Rate Limiting: Missing on Payment Endpoints** | `payment.controller.ts` | DoS | ⚠️ HIGH |
| 8 | **Account Enumeration** | `auth.service.ts:204-211` | User Enumeration | ⚠️ MEDIUM |
| 9 | **CSP Headers Not Configured** | `main.ts:21-23` | XSS | ⚠️ MEDIUM |

---

## 13. RECOMMENDATIONS

### 🔴 Immediate Actions (Critical)

#### 1. Fix File Upload Vulnerabilities
```typescript
// 1. Add MIME type whitelist to generic upload
@Post('file')
async uploadFile(@UploadedFile() file: Express.Multer.File) {
  return this.uploadService.uploadFile(file, {
    allowedMimeTypes: ['image/jpeg', 'image/png', 'application/pdf'],
    maxSize: 10 * 1024 * 1024,
    folder: 'general',
  });
}

// 2. Implement magic byte validation
async validateFile(file: Express.Multer.File) {
  const detectedType = await fileType.fromBuffer(file.buffer);
  if (!allowedMimeTypes.includes(detectedType.mime)) {
    throw new BadRequestException('Invalid file type');
  }
}

// 3. Fix path traversal in serveFile
@Get(':folder/:filename')
async serveFile(@Param('folder') folder, @Param('filename') filename) {
  // Validate folder whitelist
  if (!['avatars', 'general'].includes(folder)) {
    throw new BadRequestException('Invalid folder');
  }

  // Prevent path traversal
  if (filename.includes('..') || filename.includes('/')) {
    throw new BadRequestException('Invalid filename');
  }

  // Verify path is within base directory
  const resolvedPath = path.resolve(filePath);
  if (!resolvedPath.startsWith(baseDir)) {
    throw new BadRequestException('Invalid path');
  }
}
```

#### 2. Implement CSRF Protection
```typescript
// Install dependency
npm install csurf

// Apply to main.ts
import * as csrf from 'csurf';
app.use(csrf({
  cookie: {
    httpOnly: true,
    secure: true,
    sameSite: 'none'
  }
}));

// Or implement custom CSRF token middleware
```

#### 3. Secure Private Key Handling
```typescript
// Never log private keys
this.logger.error('Tripay Error', {
  status: error.status,
  // ❌ REMOVE: privateKey: this.tripayPrivateKey
});

// Add validation
if (!this.tripayPrivateKey || this.tripayPrivateKey.length < 32) {
  throw new Error('Invalid TRIPAY_PRIVATE_KEY');
}

// Consider using AWS Secrets Manager or similar
```

#### 4. Fix Payment Race Condition
```typescript
async handleCallback(callbackData, signature) {
  // Use database-level locking
  const transaction = await this.prisma.transaction.updateMany({
    where: {
      merchantRef: merchant_ref,
      paymentStatus: PaymentStatus.PENDING // Only update if PENDING
    },
    data: { paymentStatus: mappedStatus },
  });

  if (transaction.count === 0) {
    throw new BadRequestException('Transaction already processed or not found');
  }
}
```

### ⚠️ Short-term Improvements (1-2 weeks)

#### 1. Add Rate Limiting to All Endpoints
```typescript
// Payment endpoints
@Throttle({ default: { limit: 10, ttl: 60000 } })
@Post('create')

@Throttle({ default: { limit: 100, ttl: 60000 } })
@Post('callback')

// File upload
@Throttle({ default: { limit: 20, ttl: 3600000 } })
@Post('file')
```

#### 2. Implement CSP Headers
```typescript
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", process.env.FRONTEND_URL],
    },
  },
}));
```

#### 3. Add Account Lockout
```typescript
// Track failed login attempts
const MAX_ATTEMPTS = 5;
const LOCKOUT_DURATION = 30 * 60 * 1000; // 30 minutes

async login(loginDto: LoginDto) {
  const attempts = await this.getLoginAttempts(email);

  if (attempts >= MAX_ATTEMPTS) {
    throw new UnauthorizedException('Account locked due to multiple failed attempts');
  }

  // ... existing login logic

  if (!isPasswordValid) {
    await this.incrementLoginAttempts(email);
    throw new UnauthorizedException('Invalid credentials');
  }

  await this.resetLoginAttempts(email);
}
```

#### 4. Implement Request Logging
```typescript
// Middleware untuk log semua requests
import { Logger } from '@nestjs/common';

app.use((req, res, next) => {
  const logger = new Logger('HTTP');
  logger.log(`${req.method} ${req.url} - IP: ${req.ip}`);
  next();
});
```

### 📊 Long-term Enhancements (1-3 months)

#### 1. Security Monitoring & Alerting
- Implement logging system (Winston, Sentry)
- Monitor failed login attempts
- Alert on suspicious activities
- Track API abuse patterns

#### 2. Penetration Testing
- Hire security firm untuk penetration testing
- Bug bounty program consideration
- Regular security audits

#### 3. Compliance & Standards
- GDPR compliance check (if handling EU data)
- PCI DSS compliance (if handling credit cards directly)
- OWASP Top 10 regular review

#### 4. Advanced Security Features
- Implement 2FA/MFA
- Email-based login verification for new devices
- IP whitelisting untuk admin endpoints
- Geo-blocking untuk suspicious regions

#### 5. Database Security
- Enable encryption at rest (PostgreSQL TDE)
- Implement row-level security
- Regular backup & disaster recovery testing
- Audit trail untuk sensitive operations

#### 6. Infrastructure Security
- WAF (Web Application Firewall) implementation
- DDoS protection (Cloudflare, AWS Shield)
- CDN untuk static assets
- Regular security patches untuk OS & dependencies

---

## 📝 SECURITY CHECKLIST

### Pre-Production Checklist

- [ ] ✅ File upload MIME validation implemented
- [ ] ✅ Path traversal vulnerability fixed
- [ ] ✅ Magic byte validation added
- [ ] ✅ CSRF protection enabled
- [ ] ✅ Private key exposure risks mitigated
- [ ] ✅ Payment race condition fixed
- [ ] ✅ Rate limiting added to all endpoints
- [ ] ✅ CSP headers configured
- [ ] ✅ Account enumeration fixed
- [ ] ✅ Environment variables secured
- [ ] ✅ SSL/TLS certificate installed
- [ ] ✅ Database encryption enabled
- [ ] ✅ Logging system configured
- [ ] ✅ Monitoring & alerting setup
- [ ] ✅ `npm audit` passed
- [ ] ✅ Penetration testing completed
- [ ] ✅ Security documentation updated

### Post-Production Monitoring

- [ ] Weekly: Review failed login attempts
- [ ] Weekly: Check error logs for anomalies
- [ ] Monthly: `npm audit` and dependency updates
- [ ] Monthly: Review access logs for suspicious patterns
- [ ] Quarterly: Security audit review
- [ ] Quarterly: Penetration testing
- [ ] Annually: Full security assessment

---

## 🎯 CONCLUSION

**Overall Security Score: 7.5/10**

### Strengths:
✅ Solid authentication & password security
✅ Excellent JWT implementation with refresh token rotation
✅ Good payment processing with signature verification
✅ Prisma ORM prevents SQL injection
✅ Rate limiting on critical auth endpoints
✅ HttpOnly cookies protect against XSS

### Critical Issues:
🔴 File upload vulnerabilities (RCE risk)
🔴 Missing CSRF protection
🔴 Payment private key exposure risk
🔴 Transaction race condition

### Recommendation:
**DO NOT DEPLOY TO PRODUCTION** until critical issues (marked 🔴) are resolved.

**Timeline:**
- Fix Critical Issues: 1-2 days
- Implement High Priority: 1 week
- Complete Security Checklist: 2-3 weeks

**Next Steps:**
1. Address all 🔴 CRITICAL findings immediately
2. Implement short-term improvements within 1-2 weeks
3. Schedule penetration testing before production launch
4. Establish ongoing security monitoring process

---

**Report Generated:** 2025-11-23
**Version:** 1.0
**Audited By:** Security Analysis System
