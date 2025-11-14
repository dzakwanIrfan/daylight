'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AdminUser, UserRole } from '@/types/admin.types';
import { useForm } from 'react-hook-form';
import { Loader2 } from 'lucide-react';
import { useAdminMutations } from '@/hooks/use-admin-mutations';
import { useEffect } from 'react';

interface EditUserDialogProps {
  user: AdminUser;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface EditUserFormData {
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  role: UserRole;
  isEmailVerified: boolean;
  isActive: boolean;
}

export function EditUserDialog({ user, open, onOpenChange }: EditUserDialogProps) {
  const { updateUser } = useAdminMutations();
  
  const { register, handleSubmit, formState: { errors }, setValue, watch, reset } = useForm<EditUserFormData>({
    defaultValues: {
      email: user.email,
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      phoneNumber: user.phoneNumber || '',
      role: user.role,
      isEmailVerified: user.isEmailVerified,
      isActive: user.isActive,
    },
  });

  // Reset form when user changes or dialog opens
  useEffect(() => {
    if (open) {
      reset({
        email: user.email,
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        phoneNumber: user.phoneNumber || '',
        role: user.role,
        isEmailVerified: user.isEmailVerified,
        isActive: user.isActive,
      });
    }
  }, [user, open, reset]);

  // Close dialog on success
  useEffect(() => {
    if (updateUser.isSuccess) {
      onOpenChange(false);
    }
  }, [updateUser.isSuccess, onOpenChange]);

  const onSubmit = async (data: EditUserFormData) => {
    updateUser.mutate({
      id: user.id,
      data: {
        email: data.email,
        firstName: data.firstName || undefined,
        lastName: data.lastName || undefined,
        phoneNumber: data.phoneNumber || undefined,
        role: data.role,
        isEmailVerified: data.isEmailVerified,
        isActive: data.isActive,
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] bg-white">
        <DialogHeader>
          <DialogTitle>Edit User</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name</Label>
              <Input
                id="firstName"
                placeholder="John"
                {...register('firstName', { required: 'First name is required' })}
              />
              {errors.firstName && (
                <p className="text-xs text-red-600">{errors.firstName.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                id="lastName"
                placeholder="Doe"
                {...register('lastName', { required: 'Last name is required' })}
              />
              {errors.lastName && (
                <p className="text-xs text-red-600">{errors.lastName.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="john@example.com"
              {...register('email', { 
                required: 'Email is required',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'Invalid email address',
                },
              })}
            />
            {errors.email && (
              <p className="text-xs text-red-600">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="phoneNumber">Phone Number</Label>
            <Input
              id="phoneNumber"
              placeholder="+62 812 3456 7890"
              {...register('phoneNumber')}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select
                value={watch('role')}
                onValueChange={(value) => setValue('role', value as UserRole)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className='bg-white'>
                  <SelectItem value={UserRole.USER}>User</SelectItem>
                  <SelectItem value={UserRole.ADMIN}>Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="isActive">Status</Label>
              <Select
                value={watch('isActive') ? 'active' : 'inactive'}
                onValueChange={(value) => setValue('isActive', value === 'active')}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className='bg-white'>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="isEmailVerified">Email Verification</Label>
            <Select
              value={watch('isEmailVerified') ? 'verified' : 'unverified'}
              onValueChange={(value) => setValue('isEmailVerified', value === 'verified')}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent className='bg-white'>
                <SelectItem value="verified">Verified</SelectItem>
                <SelectItem value="unverified">Unverified</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={updateUser.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={updateUser.isPending} className='bg-brand hover:bg-brand-dark border border-black text-white font-bold'>
              {updateUser.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}