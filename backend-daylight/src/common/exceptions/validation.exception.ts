import { BadRequestException } from '@nestjs/common';

export interface ValidationError {
  field: string;
  message: string;
  constraints?: Record<string, string>;
}

export class ValidationException extends BadRequestException {
  constructor(errors: ValidationError[]) {
    super({
      message: 'Validation failed',
      errors,
    });
  }

  static fromClassValidator(errors: any[]): ValidationException {
    const validationErrors: ValidationError[] = errors.map((error) => ({
      field: error.property,
      message: Object.values(error.constraints || {}).join('. '),
      constraints: error.constraints,
    }));

    return new ValidationException(validationErrors);
  }
}