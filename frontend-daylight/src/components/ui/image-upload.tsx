'use client';

import { useCallback, useState } from 'react';
import { Upload, X, Loader2, Image as ImageIcon } from 'lucide-react';
import { Button } from './button';
import { cn } from '@/lib/utils';

interface ImageUploadProps {
  value?: string;
  onChange: (url: string) => void;
  onRemove: () => void;
  disabled?: boolean;
  endpoint: string; // API endpoint for upload
  accept?: string;
  maxSize?: number; // in MB
  className?: string;
}

export function ImageUpload({
  value,
  onChange,
  onRemove,
  disabled,
  endpoint,
  accept = 'image/jpeg,image/jpg,image/png,image/webp',
  maxSize = 5,
  className,
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleUpload = useCallback(
    async (file: File) => {
      try {
        setIsUploading(true);
        setError(null);

        // Validate file size
        const fileSizeMB = file.size / (1024 * 1024);
        if (fileSizeMB > maxSize) {
          throw new Error(`File size must be less than ${maxSize}MB`);
        }

        // Validate file type
        const acceptedTypes = accept.split(',').map((t) => t.trim());
        if (!acceptedTypes.includes(file.type)) {
          throw new Error('Invalid file type');
        }

        const formData = new FormData();
        formData.append('banner', file);

        const response = await fetch(endpoint, {
          method: 'POST',
          body: formData,
          credentials: 'include',
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Upload failed');
        }

        const data = await response.json();
        onChange(data.url);
      } catch (err: any) {
        setError(err.message || 'Failed to upload image');
        console.error('Upload error:', err);
      } finally {
        setIsUploading(false);
      }
    },
    [accept, endpoint, maxSize, onChange]
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleUpload(file);
    }
  };

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();

      if (disabled || isUploading) return;

      const file = e.dataTransfer.files?.[0];
      if (file) {
        handleUpload(file);
      }
    },
    [disabled, isUploading, handleUpload]
  );

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  return (
    <div className={cn('space-y-2', className)}>
      {value ? (
        // Preview
        <div className="relative w-full h-64 rounded-lg overflow-hidden border border-gray-200 bg-gray-50">
          <img
            src={value}
            alt="Upload preview"
            className="w-full h-full object-cover"
          />
          <div className="absolute top-2 right-2 flex gap-2">
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={onRemove}
              disabled={disabled || isUploading}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ) : (
        // Upload Area
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          className={cn(
            'relative w-full h-64 rounded-lg border-2 border-dashed border-gray-300 bg-gray-50',
            'hover:border-brand hover:bg-brand/5 transition-colors',
            'flex flex-col items-center justify-center gap-4',
            disabled && 'opacity-50 cursor-not-allowed',
            isUploading && 'pointer-events-none'
          )}
        >
          {isUploading ? (
            <>
              <Loader2 className="h-12 w-12 text-brand animate-spin" />
              <p className="text-sm text-gray-600">Uploading...</p>
            </>
          ) : (
            <>
              <div className="rounded-full bg-brand/10 p-4">
                <ImageIcon className="h-8 w-8 text-brand" />
              </div>
              <div className="text-center">
                <label htmlFor="image-upload">
                  <span className="text-sm font-medium text-brand cursor-pointer hover:underline">
                    Click to upload
                  </span>
                  <span className="text-sm text-gray-600"> or drag and drop</span>
                </label>
                <p className="text-xs text-gray-500 mt-1">
                  PNG, JPG, WEBP up to {maxSize}MB
                </p>
              </div>
              <input
                id="image-upload"
                type="file"
                accept={accept}
                onChange={handleFileChange}
                disabled={disabled || isUploading}
                className="hidden"
              />
            </>
          )}
        </div>
      )}

      {error && (
        <p className="text-xs text-red-600 flex items-center gap-1">
          <X className="h-3 w-3" />
          {error}
        </p>
      )}

      <p className="text-xs text-gray-500">
        Recommended size: 1200x630px for best results
      </p>
    </div>
  );
}