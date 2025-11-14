import { useState, useCallback } from 'react';
import apiClient from '@/lib/axios';
import { toast } from 'sonner';

interface UploadResult {
  filename: string;
  originalName: string;
  mimetype: string;
  size: number;
  url: string;
  path: string;
}

interface UseImageUploadOptions {
  endpoint: string;
  onSuccess?: (result: UploadResult) => void;
  onError?: (error: Error) => void;
  maxSize?: number; // in MB
}

export function useImageUpload({
  endpoint,
  onSuccess,
  onError,
  maxSize = 5,
}: UseImageUploadOptions) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);

  const upload = useCallback(
    async (file: File) => {
      try {
        setIsUploading(true);
        setError(null);

        // Validate file size
        const fileSizeMB = file.size / (1024 * 1024);
        if (fileSizeMB > maxSize) {
          throw new Error(`File size must be less than ${maxSize}MB`);
        }

        const formData = new FormData();
        formData.append('banner', file);

        const response = await apiClient.post<UploadResult>(endpoint, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });

        const result = response.data;
        setUploadedUrl(result.url);
        
        if (onSuccess) {
          onSuccess(result);
        }

        toast.success('Image uploaded successfully');
        return result;
      } catch (err: any) {
        const errorMessage = err.response?.data?.message || err.message || 'Upload failed';
        setError(errorMessage);
        
        if (onError) {
          onError(new Error(errorMessage));
        }

        toast.error(errorMessage);
        throw err;
      } finally {
        setIsUploading(false);
      }
    },
    [endpoint, maxSize, onSuccess, onError]
  );

  const reset = useCallback(() => {
    setError(null);
    setUploadedUrl(null);
  }, []);

  return {
    upload,
    isUploading,
    error,
    uploadedUrl,
    reset,
  };
}