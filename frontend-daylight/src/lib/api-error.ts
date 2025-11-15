import { AxiosError } from 'axios';

export interface ApiErrorResponse {
  success: false;
  statusCode: number;
  message: string | string[];
  error: string;
  timestamp: string;
  path: string;
}

export class ApiError extends Error {
  public statusCode: number;
  public error: string;
  public messages: string[];
  public timestamp: string;
  public path: string;

  constructor(axiosError: AxiosError<ApiErrorResponse>) {
    const response = axiosError.response?.data;
    
    // Extract message(s)
    let messages: string[];
    if (response?.message) {
      messages = Array.isArray(response.message) 
        ? response.message 
        : [response.message];
    } else {
      messages = ['An unexpected error occurred'];
    }

    super(messages[0]); // Set main error message
    
    this.name = 'ApiError';
    this.statusCode = response?.statusCode || axiosError.response?.status || 500;
    this.error = response?.error || 'Error';
    this.messages = messages;
    this.timestamp = response?.timestamp || new Date().toISOString();
    this.path = response?.path || '';

    // Maintains proper stack trace for where our error was thrown
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ApiError);
    }
  }

  /**
   * Get the primary error message
   */
  get primaryMessage(): string {
    return this.messages[0];
  }

  /**
   * Get all error messages as a single string
   */
  get fullMessage(): string {
    return this.messages.join(', ');
  }

  /**
   * Check if error is of a specific status code
   */
  is(statusCode: number): boolean {
    return this.statusCode === statusCode;
  }

  /**
   * Check if error is unauthorized (401)
   */
  isUnauthorized(): boolean {
    return this.statusCode === 401;
  }

  /**
   * Check if error is forbidden (403)
   */
  isForbidden(): boolean {
    return this.statusCode === 403;
  }

  /**
   * Check if error is not found (404)
   */
  isNotFound(): boolean {
    return this.statusCode === 404;
  }

  /**
   * Check if error is validation error (400)
   */
  isValidationError(): boolean {
    return this.statusCode === 400;
  }

  /**
   * Check if error is conflict (409)
   */
  isConflict(): boolean {
    return this.statusCode === 409;
  }

  /**
   * Check if error is server error (500+)
   */
  isServerError(): boolean {
    return this.statusCode >= 500;
  }
}

/**
 * Parse axios error to ApiError
 */
export function parseApiError(error: any): ApiError {
  if (error.isAxiosError) {
    return new ApiError(error as AxiosError<ApiErrorResponse>);
  }
  
  // If not an axios error, create a generic error
  const genericError = new Error(error.message || 'An unexpected error occurred');
  return new ApiError({
    response: {
      data: {
        success: false,
        statusCode: 500,
        message: genericError.message,
        error: 'Internal Error',
        timestamp: new Date().toISOString(),
        path: '',
      },
      status: 500,
      statusText: 'Internal Server Error',
      headers: {},
      config: {} as any,
    },
    config: {} as any,
    isAxiosError: true,
    toJSON: () => ({}),
    name: 'AxiosError',
    message: genericError.message,
  });
}

/**
 * Get user-friendly error message
 */
export function getUserFriendlyErrorMessage(error: ApiError): string {
  // Map specific error messages to user-friendly versions
  const errorMap: Record<string, string> = {
    'Invalid email or password': 'The email or password you entered is incorrect. Please try again.',
    'Please verify your email address before logging in': 'Please verify your email address. Check your inbox for the verification link.',
    'Your account has been deactivated': 'Your account has been deactivated. Please contact support.',
    'Email already registered': 'This email is already registered. Please login or use a different email.',
    'Invalid or expired token': 'This link has expired or is invalid. Please request a new one.',
    'User not found': 'We couldn\'t find an account with that information.',
    'Email is already verified': 'Your email is already verified. You can login now.',
    'Please complete the personality test first': 'Please complete the personality test before registering.',
    'Session expired. Please login again': 'Your session has expired. Please login again.',
  };

  // Check if we have a mapped message
  for (const [key, value] of Object.entries(errorMap)) {
    if (error.messages.some(msg => msg.includes(key))) {
      return value;
    }
  }

  // Return the original message if no mapping found
  return error.fullMessage;
}