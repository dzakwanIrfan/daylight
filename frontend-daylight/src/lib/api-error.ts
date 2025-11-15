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

    super(messages[0]);
    
    this.name = 'ApiError';
    this.statusCode = response?.statusCode || axiosError.response?.status || 500;
    this.error = response?.error || 'Error';
    this.messages = messages;
    this.timestamp = response?.timestamp || new Date().toISOString();
    this.path = response?.path || '';

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ApiError);
    }
  }

  get primaryMessage(): string {
    return this.messages[0];
  }

  get fullMessage(): string {
    return this.messages.join(', ');
  }

  is(statusCode: number): boolean {
    return this.statusCode === statusCode;
  }

  isUnauthorized(): boolean {
    return this.statusCode === 401;
  }

  isForbidden(): boolean {
    return this.statusCode === 403;
  }

  isNotFound(): boolean {
    return this.statusCode === 404;
  }

  isValidationError(): boolean {
    return this.statusCode === 400;
  }

  isConflict(): boolean {
    return this.statusCode === 409;
  }

  isServerError(): boolean {
    return this.statusCode >= 500;
  }
}

export function parseApiError(error: any): ApiError {
  if (error.isAxiosError) {
    return new ApiError(error as AxiosError<ApiErrorResponse>);
  }
  
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

export function getUserFriendlyErrorMessage(error: ApiError): string {
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
    'An account with this email already exists': 'This email is already registered. Please login with your password.',
  };

  for (const [key, value] of Object.entries(errorMap)) {
    if (error.messages.some(msg => msg.includes(key))) {
      return value;
    }
  }

  return error.fullMessage;
}