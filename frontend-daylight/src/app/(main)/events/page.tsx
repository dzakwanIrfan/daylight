'use client';

import { DashboardLayout } from '@/components/main/dashboard-layout';
import { useAuthStore } from '@/store/auth-store';
import { useEffect, useState } from 'react';
import { Calendar, Loader2, Sparkles, Users, Heart } from 'lucide-react';
import { CategoryCard } from '@/components/events/category-card';
import { EventsList } from '@/components/events/events-list';
import { useNextWeekEvents } from '@/hooks/use-public-events';
import {
  UtensilsCrossed,
  Bus,
  HeartHandshake,
  Cloud,
} from 'lucide-react';

const categories = [
  {
    label: 'DayBreak',
    description: 'Drink and Dinner Activities.',
    icon: UtensilsCrossed,
    href: '/events/category/DAYBREAK',
    color: 'bg-orange-500',
  },
  {
    label: 'DayTrip',
    description: 'Travel & Trip Activities.',
    icon: Bus,
    href: '/events/category/DAYTRIP',
    color: 'bg-blue-500',
  },
  {
    label: 'DayCare',
    description: 'Health & Wellness Activities.',
    icon: HeartHandshake,
    href: '/events/category/DAYCARE',
    color: 'bg-green-500',
  },
  {
    label: 'DayDream',
    description: 'Share ideas. Inspire together.',
    icon: Cloud,
    href: '/events/category/DAYDREAM',
    color: 'bg-purple-500',
    disabled: true,
  },
];

export default function HomePage() {
  const { user } = useAuthStore();
  const [mounted, setMounted] = useState(false);

  // Get events for next week using dedicated endpoint
  const { data: nextWeekData, isLoading: isLoadingNextWeek } = useNextWeekEvents();

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
        <div className="bg-linear-to-br from-brand/5 via-white to-brand/10 rounded-xl border border-brand/20 p-6 space-y-2">
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
          <div className="bg-white rounded-xl border border-gray-200 p-6 hover:border-brand/30 transition-colors">
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
          <div className="bg-white rounded-xl border border-gray-200 p-6 hover:border-brand/30 transition-colors">
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
          <div className="bg-white rounded-xl border border-gray-200 p-6 hover:border-brand/30 transition-colors">
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
              <p className="text-xs text-muted-foreground">Your archetype</p>
            </div>
          </div>
        </div>

        {/* Let's Get Started - Categories */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold mb-4">Find Events</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {categories.map((category) => (
              <CategoryCard key={category.label} {...category} />
            ))}
          </div>
        </div>

        {/* Events Next Week */}
        <div className="bg-linear-to-br from-brand/5 via-white to-brand/10 rounded-xl border border-brand/20 p-6">
          <h2 className="text-lg font-semibold mb-4">Events Next Week</h2>
          
          {isLoadingNextWeek ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-brand" />
            </div>
          ) : nextWeekData && nextWeekData.data.length > 0 ? (
            <EventsList events={nextWeekData.data} />
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 rounded-full bg-brand/10 flex items-center justify-center mx-auto mb-4">
                <Heart className="w-8 h-8 text-brand" />
              </div>
              <h3 className="text-xl md:text-2xl font-bold mb-2">
                No Events Yet
              </h3>
              <p className="text-muted-foreground text-sm md:text-base max-w-xl mx-auto">
                No events scheduled for next week. Check back later or explore
                other categories!
              </p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}