'use client';

import { useAuth } from '@/hooks/use-auth';
import { DashboardLayout } from '@/components/main/dashboard-layout';

export default function ChatPage() {
  useAuth();

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-2xl md:text-3xl font-bold">Chat</h1>
        <p className="text-muted-foreground">Connect with your friends</p>
        {/* Chat interface will go here */}
      </div>
    </DashboardLayout>
  );
}