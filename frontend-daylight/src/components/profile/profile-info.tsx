'use client';

import { useState, useRef, useEffect } from 'react';
import { useAuthStore } from '@/store/auth-store';
import { userService } from '@/services/user.service';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Camera, Loader2 } from 'lucide-react';

export function ProfileInfo() {
  const { user, setAuth } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState(user?.profilePicture || '');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    phoneNumber: user?.phoneNumber || '',
  });

  // Sync form with user data when user changes
  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        phoneNumber: user.phoneNumber || '',
      });
      setAvatarUrl(user.profilePicture || '');
    }
  }, [user?.id, user?.firstName, user?.lastName, user?.phoneNumber, user?.profilePicture]);

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB');
      return;
    }

    setIsUploadingAvatar(true);
    try {
      const uploadResult = await userService.uploadAvatar(file);

      // Update profile with new avatar URL
      await userService.updateProfile({
        profilePicture: uploadResult.url,
      });

      // Update local state immediately for instant feedback
      setAvatarUrl(uploadResult.url);

      // Update auth store
      if (user) {
        setAuth({
          ...user,
          profilePicture: uploadResult.url,
        });
      }

      toast.success('Avatar updated successfully');
    } catch (error: any) {
      console.error('Avatar upload error:', error);
      toast.error(error.response?.data?.message || 'Failed to upload avatar');
    } finally {
      setIsUploadingAvatar(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await userService.updateProfile(formData);

      // Update auth store with new user data
      if (user) {
        setAuth({
          ...user,
          firstName: response.user.firstName,
          lastName: response.user.lastName,
          phoneNumber: response.user.phoneNumber,
        });
      }

      toast.success('Profile updated successfully');
    } catch (error: any) {
      console.error('Profile update error:', error);
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  const getInitials = () => {
    const firstName = formData.firstName || user?.firstName;
    const lastName = formData.lastName || user?.lastName;

    if (firstName && lastName) {
      return `${firstName[0]}${lastName[0]}`.toUpperCase();
    }
    return user?.email?.[0].toUpperCase() || 'U';
  };

  return (
    <div className="space-y-6">
      {/* Avatar Section */}
      <div className="flex flex-col items-center gap-4 pb-6 border-b border-gray-200">
        <div className="relative group">
          <div className="w-24 h-24 rounded-full overflow-hidden bg-linear-to-br from-brand/20 to-brand/5 flex items-center justify-center border-2 border-brand/20">
            {avatarUrl ? (
              <img
                key={avatarUrl} // Force re-render when URL changes
                src={avatarUrl}
                alt="Profile picture"
                className="w-full h-full object-cover"
                crossOrigin='anonymous'
                referrerPolicy='no-referrer'
                onError={(e) => {
                  console.error('Image load error:', e);
                  e.currentTarget.style.display = 'none';
                  const initialsElement = e.currentTarget.nextElementSibling as HTMLElement;
                  if (initialsElement) {
                    initialsElement.classList.remove('hidden');
                  }
                }}
              />
            ) : null}
            <span
              className={`text-3xl font-bold text-brand ${avatarUrl ? 'hidden' : ''}`}
            >
              {getInitials()}
            </span>
          </div>

          <button
            type="button"
            onClick={handleAvatarClick}
            disabled={isUploadingAvatar}
            className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-brand text-white flex items-center justify-center hover:bg-brand/90 transition-colors shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isUploadingAvatar ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Camera className="w-4 h-4" />
            )}
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/jpg,image/webp"
            onChange={handleAvatarChange}
            className="hidden"
          />
        </div>

        <div className="text-center">
          <p className="font-medium">
            {formData.firstName || user?.firstName} {formData.lastName || user?.lastName}
          </p>
          <p className="text-sm text-muted-foreground">{user?.email}</p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="firstName">First Name</Label>
            <Input
              id="firstName"
              value={formData.firstName}
              onChange={(e) =>
                setFormData({ ...formData, firstName: e.target.value })
              }
              placeholder="Enter your first name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="lastName">Last Name</Label>
            <Input
              id="lastName"
              value={formData.lastName}
              onChange={(e) =>
                setFormData({ ...formData, lastName: e.target.value })
              }
              placeholder="Enter your last name"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email Address</Label>
          <Input
            id="email"
            type="email"
            value={user?.email || ''}
            disabled
            className="bg-gray-50"
          />
          <p className="text-xs text-muted-foreground">
            Email cannot be changed
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="phoneNumber">Phone Number (Optional)</Label>
          <Input
            id="phoneNumber"
            value={formData.phoneNumber}
            onChange={(e) =>
              setFormData({ ...formData, phoneNumber: e.target.value })
            }
            placeholder="+62 812 3456 7890"
          />
        </div>

        <div className="flex justify-end pt-4">
          <Button type="submit" disabled={isLoading} className="min-w-32 bg-brand hover:bg-brand/90 shadow-brutal hover:shadow-brutal-sm border-2 border-black rounded-full font-bold text-white">
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Changes'
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}