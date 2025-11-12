'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Home, 
  Calendar, 
  Users, 
  User, 
  LogOut, 
  Menu,
  X 
} from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/store/auth-store';
import { authService } from '@/services/auth.service';
import { EmailVerificationBanner } from './email-verification-banner';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const navigation = [
  { name: 'Home', href: '/dashboard', icon: Home },
  { name: 'Events', href: '/dashboard/events', icon: Calendar },
  { name: 'Connections', href: '/dashboard/connections', icon: Users },
  { name: 'Profile', href: '/dashboard/profile', icon: User },
];

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const router = useRouter();
  const { user, clearAuth } = useAuthStore();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await authService.logout();
      clearAuth();
      toast.success('Logged out successfully');
      router.push('/login');
    } catch (error) {
      toast.error('Logout failed');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Top Navigation */}
      <nav className="border-b bg-card sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-8">
              <h1 className="text-2xl logo-text font-bold text-brand">
                DayLight
              </h1>
              
              {/* Desktop Navigation */}
              <div className="hidden md:flex items-center gap-1">
                {navigation.map((item) => (
                  <Button
                    key={item.name}
                    variant="ghost"
                    asChild
                    className="gap-2"
                  >
                    <Link href={item.href}>
                      <item.icon className="w-4 h-4" />
                      {item.name}
                    </Link>
                  </Button>
                ))}
              </div>
            </div>

            {/* User Menu */}
            <div className="flex items-center gap-4">
              <div className="hidden sm:block text-sm">
                <p className="font-medium">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-muted-foreground text-xs">{user?.email}</p>
              </div>
              
              <Button
                variant="ghost"
                size="icon"
                onClick={handleLogout}
                className="hidden md:flex"
              >
                <LogOut className="w-5 h-5" />
              </Button>

              {/* Mobile menu button */}
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                {isMobileMenuOpen ? (
                  <X className="w-5 h-5" />
                ) : (
                  <Menu className="w-5 h-5" />
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t">
            <div className="px-4 py-3 space-y-1">
              {navigation.map((item) => (
                <Button
                  key={item.name}
                  variant="ghost"
                  asChild
                  className="w-full justify-start gap-2"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Link href={item.href}>
                    <item.icon className="w-4 h-4" />
                    {item.name}
                  </Link>
                </Button>
              ))}
              <Button
                variant="ghost"
                className="w-full justify-start gap-2 text-destructive"
                onClick={handleLogout}
              >
                <LogOut className="w-4 h-4" />
                Logout
              </Button>
            </div>
          </div>
        )}
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <EmailVerificationBanner />
        {children}
      </main>
    </div>
  );
}