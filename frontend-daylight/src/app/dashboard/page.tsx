'use client';

import { useAuth } from '@/hooks/use-auth';
import { DashboardLayout } from '@/components/dashboard/dashboard-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Users, Sparkles } from 'lucide-react';

export default function DashboardPage() {
  const { user } = useAuth();

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Welcome Section */}
        <div className="space-y-2">
          <h1 className="text-3xl md:text-4xl font-heading font-bold">
            Welcome back, {user?.firstName}! 👋
          </h1>
          <p className="text-muted-foreground text-lg">
            Here's what's happening with your connections
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Upcoming Events
              </CardTitle>
              <Calendar className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">0</div>
              <p className="text-xs text-muted-foreground mt-1">
                No events scheduled yet
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Connections
              </CardTitle>
              <Users className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">0</div>
              <p className="text-xs text-muted-foreground mt-1">
                Start meeting people
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Personality Type
              </CardTitle>
              <Sparkles className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-xl font-bold">
                {user?.personalityType || 'Unknown'}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Your archetype
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <Button className="bg-brand hover:bg-brand-orange-dark">
                Find Events Near Me
              </Button>
              <Button variant="outline">
                View My Profile
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Placeholder for future features */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                No activity yet. Start connecting with people!
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}