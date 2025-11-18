'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AdminUser } from '@/types/admin.types';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { format } from 'date-fns';

interface UserDetailsDialogProps {
  user: AdminUser;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function UserDetailsDialog({ user, open, onOpenChange }: UserDetailsDialogProps) {
  const initials = `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`.toUpperCase() || user.email[0].toUpperCase();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>User Details</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Profile Section */}
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={user.profilePicture || undefined} alt={user.email} crossOrigin="anonymous" referrerPolicy="no-referrer" />
              <AvatarFallback className="bg-brand/10 text-brand text-lg font-medium">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h3 className="font-semibold text-lg text-gray-900">
                {user.firstName && user.lastName 
                  ? `${user.firstName} ${user.lastName}`
                  : 'No Name Set'}
              </h3>
              <p className="text-sm text-gray-600">{user.email}</p>
              <div className="flex gap-2 mt-2">
                <Badge variant={user.role === 'ADMIN' ? 'default' : 'secondary'}>
                  {user.role}
                </Badge>
                <Badge variant={user.isActive ? 'default' : 'secondary'}>
                  {user.isActive ? 'Active' : 'Inactive'}
                </Badge>
              </div>
            </div>
          </div>

          <Separator />

          {/* Details Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-gray-500">Phone Number</p>
              <p className="text-sm text-gray-900 mt-1">
                {user.phoneNumber || 'Not provided'}
              </p>
            </div>

            <div>
              <p className="text-sm font-medium text-gray-500">Provider</p>
              <p className="text-sm text-gray-900 mt-1">
                <Badge variant="outline">{user.provider}</Badge>
              </p>
            </div>

            <div>
              <p className="text-sm font-medium text-gray-500">Email Verified</p>
              <p className="text-sm text-gray-900 mt-1">
                <Badge variant={user.isEmailVerified ? 'default' : 'destructive'}>
                  {user.isEmailVerified ? 'Verified' : 'Unverified'}
                </Badge>
              </p>
            </div>

            <div>
              <p className="text-sm font-medium text-gray-500">Active Sessions</p>
              <p className="text-sm text-gray-900 mt-1">
                {user._count?.refreshTokens || 0}
              </p>
            </div>

            <div>
              <p className="text-sm font-medium text-gray-500">Created At</p>
              <p className="text-sm text-gray-900 mt-1">
                {format(new Date(user.createdAt), 'PPP')}
              </p>
            </div>

            <div>
              <p className="text-sm font-medium text-gray-500">Updated At</p>
              <p className="text-sm text-gray-900 mt-1">
                {format(new Date(user.updatedAt), 'PPP')}
              </p>
            </div>
          </div>

          {/* Persona Result */}
          {user.personalityResult && (
            <>
              <Separator />
              <div>
                <p className="text-sm font-medium text-gray-500 mb-2">Persona Profile</p>
                <div className="flex items-center justify-between p-3 bg-brand/5 rounded-lg">
                  <span className="text-sm font-medium text-gray-900">
                    {user.personalityResult.archetype}
                  </span>
                  <Badge variant="secondary">
                    Score: {user.personalityResult.profileScore.toFixed(1)}
                  </Badge>
                </div>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}