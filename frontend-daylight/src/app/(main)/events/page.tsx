'use client';

import { DashboardLayout } from '@/components/main/dashboard-layout';
import { useAuthStore } from '@/store/auth-store';
import { useEffect, useState } from 'react';
import { Calendar, Loader2, Sparkles, Users, Heart, UtensilsCrossedIcon, BusIcon, HeartHandshakeIcon, CloudyIcon } from 'lucide-react';

export default function HomePage() {
  const { user } = useAuthStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-brand" />
      </div>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Welcome Header */}
        <div className="bg-linear-to-br from-brand/5 via-white to-brand/10 rounded-lg border border-brand/20 p-6 space-y-2">
          <h1 className="text-2xl md:text-3xl font-bold">
            Welcome back, {user?.firstName}! 👋
          </h1>
          <p className="text-muted-foreground">
            Here's what's happening with your connections
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Events */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 hover:border-brand/30 transition-colors">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-muted-foreground">
                Events Attended
              </h3>
              <div className="w-10 h-10 rounded-full bg-brand/10 flex items-center justify-center">
                <Calendar className="w-5 h-5 text-brand" />
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-3xl font-bold">0</div>
              <p className="text-xs text-muted-foreground">
                No events attended yet
              </p>
            </div>
          </div>

          {/* Connections */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 hover:border-brand/30 transition-colors">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-muted-foreground">
                Connections
              </h3>
              <div className="w-10 h-10 rounded-full bg-brand/10 flex items-center justify-center">
                <Users className="w-5 h-5 text-brand" />
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-3xl font-bold">0</div>
              <p className="text-xs text-muted-foreground">
                Start meeting people
              </p>
            </div>
          </div>

          {/* Personality Type */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 hover:border-brand/30 transition-colors">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-muted-foreground">
                Personality Type
              </h3>
              <div className="w-10 h-10 rounded-full bg-brand/10 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-brand" />
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-xl font-bold">
                {user?.personalityType || 'Not Set'}
              </div>
              <p className="text-xs text-muted-foreground">
                Your archetype
              </p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold mb-4">Let's Get Started</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:border-brand/30 hover:bg-brand/5 transition-colors text-left">
              <div className="w-10 h-10 rounded-full bg-brand/10 flex items-center justify-center shrink-0">
                <UtensilsCrossedIcon className="w-5 h-5 text-brand" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-medium">DayBreak</h4>
                <p className="text-sm text-muted-foreground">
                  Start fresh. Meet new people.
                </p>
              </div>
            </button>

            <button className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:border-brand/30 hover:bg-brand/5 transition-colors text-left">
              <div className="w-10 h-10 rounded-full bg-brand/10 flex items-center justify-center shrink-0">
                <BusIcon className="w-5 h-5 text-brand" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-medium">DayTrip</h4>
                <p className="text-sm text-muted-foreground">
                  Go out. Connect through adventure.
                </p>
              </div>
            </button>

            <button className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:border-brand/30 hover:bg-brand/5 transition-colors text-left">
              <div className="w-10 h-10 rounded-full bg-brand/10 flex items-center justify-center shrink-0">
                <HeartHandshakeIcon className="w-5 h-5 text-brand" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-medium">DayCare</h4>
                <p className="text-sm text-muted-foreground">
                  A safe space to support each other.
                </p>
              </div>
            </button>

            <button className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:border-brand/30 hover:bg-brand/5 transition-colors text-left">
              <div className="w-10 h-10 rounded-full bg-brand/10 flex items-center justify-center shrink-0">
                <CloudyIcon className="w-5 h-5 text-brand" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-medium">DayDream</h4>
                <p className="text-sm text-muted-foreground">
                  Share ideas. Inspire together.
                </p>
              </div>
            </button>
          </div>
        </div>

        {/* Events Next Week */}
        <div className="bg-linear-to-br from-brand/5 via-white to-brand/10 rounded-lg border border-brand/20 p-6">
          <h2 className="text-lg font-semibold mb-4">Events Next Week</h2>
          <div className="text-center py-12">
            <div className="w-16 h-16 rounded-full bg-brand/10 flex items-center justify-center mx-auto mb-4">
              <Heart className="w-8 h-8 text-brand" />
            </div>
            <h3 className="text-xl md:text-2xl font-bold mb-2">No Activity Yet</h3>
            <p className="text-muted-foreground text-sm md:text-base max-w-xl mx-auto">
              Start connecting with people and attending events to see your activity here!
            </p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}