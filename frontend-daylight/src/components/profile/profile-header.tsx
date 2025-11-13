'use client';

import { User } from 'lucide-react';

export function ProfileHeader() {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-brand/10 flex items-center justify-center">
          <User className="w-5 h-5 text-brand" />
        </div>
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Profile</h1>
          <p className="text-sm text-muted-foreground">
            Manage your personal information and preferences
          </p>
        </div>
      </div>
    </div>
  );
}