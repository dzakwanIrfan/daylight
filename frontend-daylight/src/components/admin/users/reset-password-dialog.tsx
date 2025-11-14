'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AdminUser } from '@/types/admin.types';
import { useForm } from 'react-hook-form';
import { Loader2, Eye, EyeOff } from 'lucide-react';
import { useAdminMutations } from '@/hooks/use-admin-mutations';
import { useState, useEffect } from 'react';

interface ResetPasswordDialogProps {
  user: AdminUser;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface ResetPasswordFormData {
  newPassword: string;
  confirmPassword: string;
}

export function ResetPasswordDialog({ user, open, onOpenChange }: ResetPasswordDialogProps) {
  const [showPassword, setShowPassword] = useState(false);
  const { resetPassword } = useAdminMutations();
  
  const { register, handleSubmit, formState: { errors }, watch, reset } = useForm<ResetPasswordFormData>();

  // Reset form when dialog closes
  useEffect(() => {
    if (!open) {
      reset();
    }
  }, [open, reset]);

  // Close dialog on success
  useEffect(() => {
    if (resetPassword.isSuccess) {
      onOpenChange(false);
    }
  }, [resetPassword.isSuccess, onOpenChange]);

  const onSubmit = async (data: ResetPasswordFormData) => {
    resetPassword.mutate({ id: user.id, newPassword: data.newPassword });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] glass-card">
        <DialogHeader>
          <DialogTitle>Reset Password</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="p-3 bg-gray-50 rounded-lg">
            <p className="text-sm font-medium text-gray-900">
              {user.firstName && user.lastName 
                ? `${user.firstName} ${user.lastName}`
                : user.email}
            </p>
            <p className="text-xs text-gray-600 mt-1">{user.email}</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="newPassword">New Password</Label>
            <div className="relative">
              <Input
                id="newPassword"
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter new password"
                {...register('newPassword', {
                  required: 'Password is required',
                  minLength: {
                    value: 8,
                    message: 'Password must be at least 8 characters',
                  },
                  pattern: {
                    value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                    message: 'Password must contain uppercase, lowercase, and number',
                  },
                })}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4 text-gray-400" />
                ) : (
                  <Eye className="h-4 w-4 text-gray-400" />
                )}
              </Button>
            </div>
            {errors.newPassword && (
              <p className="text-xs text-red-600">{errors.newPassword.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <Input
              id="confirmPassword"
              type={showPassword ? 'text' : 'password'}
              placeholder="Confirm new password"
              {...register('confirmPassword', {
                required: 'Please confirm password',
                validate: (value) =>
                  value === watch('newPassword') || 'Passwords do not match',
              })}
            />
            {errors.confirmPassword && (
              <p className="text-xs text-red-600">{errors.confirmPassword.message}</p>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={resetPassword.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={resetPassword.isPending} className='bg-brand hover:bg-brand-dark border border-black text-white font-bold'>
              {resetPassword.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Reset Password
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}