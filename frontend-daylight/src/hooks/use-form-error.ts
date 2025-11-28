import { useCallback } from 'react';
import { UseFormSetError, FieldValues, Path } from 'react-hook-form';
import { ApiError, parseApiError, getUserFriendlyErrorMessage } from '@/lib/api-error';
import { toast } from 'sonner';

interface UseFormErrorOptions {
  showToast?: boolean;
  toastTitle?: string;
}

export function useFormError<T extends FieldValues>(
  setError: UseFormSetError<T>,
  options: UseFormErrorOptions = {}
) {
  const { showToast = true, toastTitle = 'Error' } = options;

  const handleError = useCallback(
    (error: any) => {
      const apiError = error instanceof ApiError ? error : parseApiError(error);

      // Apply field-specific errors to form
      if (apiError.hasFieldErrors()) {
        apiError.fieldErrors.forEach((message, field) => {
          // Check if field exists in form
          setError(field as Path<T>, {
            type: 'server',
            message,
          });
        });
      }

      // Show toast for general errors or if no field errors
      if (showToast) {
        const message = getUserFriendlyErrorMessage(apiError);
        
        if (apiError.hasFieldErrors()) {
          toast.error(toastTitle, {
            description: 'Please check the form for errors',
          });
        } else {
          toast.error(toastTitle, {
            description: message,
          });
        }
      }

      return apiError;
    },
    [setError, showToast, toastTitle]
  );

  return { handleError };
}