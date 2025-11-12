'use client';

import { useAuth } from '@/hooks/use-auth';
import { DashboardLayout } from '@/components/dashboard/dashboard-layout';
import { Card, CardContent } from '@/components/ui/card';
import { Users } from 'lucide-react';

export default function ConnectionsPage() {
  useAuth();

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-heading font-bold mb-2">Connections</h1>
          <p className="text-muted-foreground">
            People you've met at DayLight events
          </p>
        </div>

        <Card>
          <CardContent className="py-12">
            <div className="text-center space-y-4">
              <Users className="w-12 h-12 text-muted-foreground mx-auto" />
              <div>
                <h3 className="font-semibold text-lg mb-2">No Connections Yet</h3>
                <p className="text-muted-foreground">
                  Start attending events to meet people!
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}