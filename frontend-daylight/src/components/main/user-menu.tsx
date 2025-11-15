'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { User, LogOut, ChevronDown, Shield } from 'lucide-react';
import { toast } from 'sonner';

import { useAuthStore } from '@/store/auth-store';
import { authService } from '@/services/auth.service';

export function UserMenu() {
  const router = useRouter();
  const { user, clearAuth } = useAuthStore();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await authService.logout();
      clearAuth();
      toast.success('Logged out successfully');
      router.push('/auth/login');
    } catch (error) {
      toast.error('Logout failed');
    }
  };

  const getInitials = () => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
    }
    return user?.email?.[0].toUpperCase() || 'U';
  };

  const isAdmin = user?.role === 'ADMIN';

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
      >
        {/* Avatar */}
        <div className="w-8 h-8 rounded-full overflow-hidden bg-linear-to-br from-brand/20 to-brand/5 flex items-center justify-center border border-brand/20">
          {user?.profilePicture ? (
            <img
              key={user.profilePicture}
              src={user.profilePicture}
              alt="Profile"
              className="w-full h-full object-cover"
              crossOrigin='anonymous'
              referrerPolicy='no-referrer'
              onError={(e) => {
                console.error('Avatar load error');
                e.currentTarget.style.display = 'none';
                const initialsElement = e.currentTarget.nextElementSibling as HTMLElement;
                if (initialsElement) {
                  initialsElement.classList.remove('hidden');
                }
              }}
            />
          ) : null}
          <span 
            className={`text-xs font-bold text-brand ${user?.profilePicture ? 'hidden' : ''}`}
          >
            {getInitials()}
          </span>
        </div>

        <div className="text-left hidden sm:block">
          <p className="font-medium text-sm">
            {user?.firstName} {user?.lastName}
          </p>
          <p className="text-xs text-muted-foreground">{user?.email}</p>
        </div>
        <ChevronDown
          className={`w-4 h-4 transition-transform ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
          <div className="px-4 py-3 border-b border-gray-100 sm:hidden">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-full overflow-hidden bg-linear-to-br from-brand/20 to-brand/5 flex items-center justify-center border border-brand/20">
                {user?.profilePicture ? (
                  <img
                    key={user.profilePicture}
                    src={user.profilePicture}
                    alt="Profile"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      const initialsElement = e.currentTarget.nextElementSibling as HTMLElement;
                      if (initialsElement) {
                        initialsElement.classList.remove('hidden');
                      }
                    }}
                  />
                ) : null}
                <span 
                  className={`text-sm font-bold text-brand ${user?.profilePicture ? 'hidden' : ''}`}
                >
                  {getInitials()}
                </span>
              </div>
              <div>
                <p className="font-medium text-sm">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-xs text-muted-foreground">{user?.email}</p>
              </div>
            </div>
          </div>

          {/* Admin Dashboard Link - Only for Admins */}
          {isAdmin && (
            <>
              <button
                onClick={() => {
                  setIsOpen(false);
                  router.push('/admin');
                }}
                className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors text-left"
              >
                <Shield className="w-4 h-4 text-brand" />
                <span className="text-sm font-medium">Admin Dashboard</span>
              </button>
              <div className="my-2 border-t border-gray-100" />
            </>
          )}

          <button
            onClick={() => {
              setIsOpen(false);
              router.push('/profile');
            }}
            className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors text-left"
          >
            <User className="w-4 h-4" />
            <span className="text-sm font-medium">Profile</span>
          </button>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors text-left text-red-600"
          >
            <LogOut className="w-4 h-4" />
            <span className="text-sm font-medium">Logout</span>
          </button>
        </div>
      )}
    </div>
  );
}