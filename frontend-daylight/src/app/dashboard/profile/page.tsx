'use client';

import { useAuth } from '@/hooks/use-auth';
import { DashboardLayout } from '@/components/dashboard/dashboard-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Mail, Phone, User as UserIcon } from 'lucide-react';

export default function ProfilePage() {
  const { user } = useAuth();

  return (
    <DashboardLayout>
      <div className="space-y-8 max-w-2xl">
        <div>
          <h1 className="text-3xl font-heading font-bold mb-2">Profile</h1>
          <p className="text-muted-foreground">
            Manage your account information
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <UserIcon className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Name</p>
                <p className="font-medium">
                  {user?.firstName} {user?.lastName}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium">{user?.email}</p>
              </div>
            </div>

            {user?.phoneNumber && (
              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Phone</p>
                  <p className="font-medium">{user.phoneNumber}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Personality Type</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Your Archetype</p>
                <p className="text-2xl font-bold text-brand">
                  {user?.personalityType || 'Unknown'}
                </p>
              </div>
              <Button variant="outline">
                View Full Results
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Account Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button variant="outline" className="w-full justify-start">
              Change Password
            </Button>
            <Button variant="outline" className="w-full justify-start">
              Update Profile
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-start text-destructive hover:text-destructive"
            >
              Delete Account
            </Button>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}