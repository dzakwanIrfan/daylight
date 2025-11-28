import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';

export interface ValidationErrorDetail {
  field: string;
  message: string;
  constraints?: Record<string, string>;
}

export interface ErrorResponse {
  success: false;
  statusCode: number;
  message: string;
  error: string;
  errors?: ValidationErrorDetail[];
  timestamp: string;
  path: string;
}

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest();
    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse();

    // Extract message and validation errors
    let message: string;
    let validationErrors: ValidationErrorDetail[] | undefined;

    if (typeof exceptionResponse === 'string') {
      message = exceptionResponse;
    } else if (typeof exceptionResponse === 'object') {
      const responseObj = exceptionResponse as any;

      // Handle class-validator errors
      if (Array.isArray(responseObj.message)) {
        // Parse validation messages into structured format
        validationErrors = this.parseValidationErrors(responseObj.message);
        message = 'Validation failed';
      } else {
        message = responseObj.message || 'An error occurred';
      }

      // Check if there are already structured errors
      if (responseObj.errors && Array.isArray(responseObj.errors)) {
        validationErrors = responseObj.errors;
      }
    } else {
      message = 'An error occurred';
    }

    // Standardized error response
    const errorResponse: ErrorResponse = {
      success: false,
      statusCode: status,
      message,
      error: this.getErrorName(status),
      timestamp: new Date().toISOString(),
      path: request.url,
    };

    // Add validation errors if present
    if (validationErrors && validationErrors.length > 0) {
      errorResponse.errors = validationErrors;
    }

    response.status(status).json(errorResponse);
  }

  /**
   * Parse class-validator error messages into structured format
   * Messages format: "fieldName constraint message" or just "message"
   */
  private parseValidationErrors(messages: string[]): ValidationErrorDetail[] {
    const errorsMap = new Map<string, ValidationErrorDetail>();

    for (const msg of messages) {
      // Try to extract field name from common patterns
      const fieldMatch = this.extractFieldFromMessage(msg);

      if (fieldMatch) {
        const { field, message } = fieldMatch;

        if (errorsMap.has(field)) {
          // Append to existing field error
          const existing = errorsMap.get(field)!;
          existing.message = `${existing.message}. ${message}`;
        } else {
          errorsMap.set(field, {
            field,
            message,
          });
        }
      } else {
        // Generic error without field
        if (!errorsMap.has('_general')) {
          errorsMap.set('_general', {
            field: '_general',
            message: msg,
          });
        } else {
          const existing = errorsMap.get('_general')!;
          existing.message = `${existing.message}. ${msg}`;
        }
      }
    }

    return Array.from(errorsMap.values());
  }

  /**
   * Extract field name from validation message
   */
  private extractFieldFromMessage(
    message: string,
  ): { field: string; message: string } | null {
    // Common patterns from class-validator
    const patterns = [
      // "title must be longer than or equal to 3 characters"
      /^(\w+)\s+(must|should|cannot|is not|has to)/i,
      // "property title has failed"
      /^property\s+(\w+)/i,
      // "title is required"
      /^(\w+)\s+is\s+required/i,
      // "Invalid title"
      /^Invalid\s+(\w+)/i,
      // "title: some message"
      /^(\w+):\s+(.+)$/i,
    ];

    for (const pattern of patterns) {
      const match = message.match(pattern);
      if (match) {
        return {
          field: this.toCamelCase(match[1]),
          message: message,
        };
      }
    }

    return null;
  }

  /**
   * Convert string to camelCase
   */
  private toCamelCase(str: string): string {
    return str.charAt(0).toLowerCase() + str.slice(1);
  }

  private getErrorName(status: number): string {
    switch (status) {
      case HttpStatus.BAD_REQUEST:
        return 'Bad Request';
      case HttpStatus.UNAUTHORIZED:
        return 'Unauthorized';
      case HttpStatus.FORBIDDEN:
        return 'Forbidden';
      case HttpStatus.NOT_FOUND:
        return 'Not Found';
      case HttpStatus.CONFLICT:
        return 'Conflict';
      case HttpStatus.UNPROCESSABLE_ENTITY:
        return 'Unprocessable Entity';
      case HttpStatus.INTERNAL_SERVER_ERROR:
        return 'Internal Server Error';
      default:
        return 'Error';
    }
  }
}
