'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { User, LogOut, ChevronDown, Shield, Crown, Calendar } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

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
  const hasActiveSubscription = user?.hasActiveSubscription ?? false;
  const subscription = user?.subscription;

  // Format expiry date
  const getExpiryText = () => {
    if (!subscription?.endDate) return '';
    try {
      return `Until ${format(new Date(subscription.endDate), 'dd MMM yyyy')}`;
    } catch {
      return '';
    }
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
      >
        {/* Avatar with Badge */}
        <div className="relative">
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
          
          {/* Subscription Crown Badge */}
          {hasActiveSubscription && (
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-liniear-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center border border-white shadow-sm">
              <Crown className="w-2.5 h-2.5 text-white" />
            </div>
          )}
        </div>

        <div className="text-left hidden sm:block">
          <div className="flex items-center gap-1.5">
            <p className="font-medium text-sm">
              {user?.firstName} {user?.lastName}
            </p>
            {hasActiveSubscription && (
              <Crown className="w-3.5 h-3.5 text-orange-500" />
            )}
          </div>
          <p className="text-xs text-muted-foreground">{user?.email}</p>
        </div>
        <ChevronDown
          className={`w-4 h-4 transition-transform ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
          {/* Mobile Header */}
          <div className="px-4 py-3 border-b border-gray-100 sm:hidden">
            <div className="flex items-center gap-3 mb-2">
              <div className="relative">
                <div className="w-10 h-10 rounded-full overflow-hidden bg-linear-to-br from-brand/20 to-brand/5 flex items-center justify-center border border-brand/20">
                  {user?.profilePicture ? (
                    <img
                      key={user.profilePicture}
                      src={user.profilePicture}
                      alt="Profile"
                      className="w-full h-full object-cover rounded-full"
                      crossOrigin='anonymous'
                      referrerPolicy='no-referrer'
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
                
                {hasActiveSubscription && (
                  <div className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-liniear-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center border border-white shadow-sm">
                    <Crown className="w-2.5 h-2.5 text-white" />
                  </div>
                )}
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <p className="font-medium text-sm">
                    {user?.firstName} {user?.lastName}
                  </p>
                  {hasActiveSubscription && (
                    <Crown className="w-3.5 h-3.5 text-orange-500" />
                  )}
                </div>
                <p className="text-xs text-muted-foreground">{user?.email}</p>
              </div>
            </div>
          </div>

          {/* Subscription Status Card */}
          {hasActiveSubscription && subscription && (
            <>
              <div className="px-4 py-3 bg-linear-to-br from-orange-50 to-yellow-50 mx-2 mt-2 rounded-lg border border-orange-200">
                <div className="flex items-start gap-2">
                  <div className="w-8 h-8 rounded-full bg-linear-to-br from-yellow-400 to-orange-500 flex items-center justify-center shrink-0">
                    <Crown className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-orange-900">
                      Premium Member
                    </p>
                    <p className="text-xs text-orange-700 truncate">
                      {subscription.planName}
                    </p>
                    <p className="text-xs text-orange-600 mt-1">
                      {getExpiryText()}
                    </p>
                  </div>
                </div>
              </div>
              <div className="my-2 border-t border-gray-100" />
            </>
          )}

          {/* No Subscription - Upgrade CTA */}
          {!hasActiveSubscription && (
            <>
              <button
                onClick={() => {
                  setIsOpen(false);
                  router.push('/subscriptions');
                }}
                className="w-full px-4 py-3 mx-2 my-2 rounded-lg bg-linear-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 transition-all text-left"
                style={{ width: 'calc(100% - 1rem)' }}
              >
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center shrink-0">
                    <Crown className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-white">
                      Upgrade to Premium
                    </p>
                    <p className="text-xs text-white/90">
                      Unlock unlimited events
                    </p>
                  </div>
                </div>
              </button>
              <div className="my-2 border-t border-gray-100" />
            </>
          )}

          {/* Admin Dashboard Link */}
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

          {/* Profile */}
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

          {/* My Events */}
          <button
            onClick={() => {
              setIsOpen(false);
              router.push('/my-events');
            }}
            className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors text-left"
          >
            <Calendar className="w-4 h-4" />
            <span className="text-sm font-medium">My Events</span>
          </button>

          {/* Subscription Management */}
          {hasActiveSubscription && (
            <button
              onClick={() => {
                setIsOpen(false);
                router.push('/my-subscriptions');
              }}
              className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors text-left"
            >
              <Crown className="w-4 h-4 text-orange-500" />
              <span className="text-sm font-medium">My Subscription</span>
            </button>
          )}

          <div className="my-2 border-t border-gray-100" />

          {/* Logout */}
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