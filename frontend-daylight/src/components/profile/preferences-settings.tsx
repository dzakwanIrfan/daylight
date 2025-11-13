'use client';

import { MapPin, Globe, Settings } from 'lucide-react';

export function PreferencesSettings() {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-1">Preferences</h3>
        <p className="text-sm text-muted-foreground">
          Customize your DayLight experience
        </p>
      </div>

      <div className="space-y-4">
        {/* Settings Preview */}
        <div className="border border-gray-200 rounded-lg p-4 hover:border-brand/30 transition-colors cursor-not-allowed opacity-60">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
              <Settings className="w-5 h-5 text-gray-400" />
            </div>
            <div className="flex-1">
              <h4 className="font-medium mb-1">App Settings</h4>
              <p className="text-sm text-muted-foreground">
                Notifications, privacy, and account preferences
              </p>
            </div>
            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
              Coming Soon
            </span>
          </div>
        </div>

        {/* Location Preview */}
        <div className="border border-gray-200 rounded-lg p-4 hover:border-brand/30 transition-colors cursor-not-allowed opacity-60">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
              <MapPin className="w-5 h-5 text-gray-400" />
            </div>
            <div className="flex-1">
              <h4 className="font-medium mb-1">Location</h4>
              <p className="text-sm text-muted-foreground">
                Set your preferred location for events and gatherings
              </p>
            </div>
            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
              Coming Soon
            </span>
          </div>
        </div>

        {/* Language Preview */}
        <div className="border border-gray-200 rounded-lg p-4 hover:border-brand/30 transition-colors cursor-not-allowed opacity-60">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
              <Globe className="w-5 h-5 text-gray-400" />
            </div>
            <div className="flex-1">
              <h4 className="font-medium mb-1">Language</h4>
              <p className="text-sm text-muted-foreground">
                Choose your preferred language for the app
              </p>
            </div>
            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
              Coming Soon
            </span>
          </div>
        </div>
      </div>

      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mt-6">
        <p className="text-sm text-muted-foreground text-center">
          These features are currently in development and will be available soon. Stay tuned! 🚀
        </p>
      </div>
    </div>
  );
}