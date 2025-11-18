'use client';

import { MapPin, Globe, Settings, FileText, Shield, Users, Mail, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { PersonalityResultView } from './personality-result-view';
import { Button } from '@/components/ui/button';

export function PreferencesSettings() {
  const [showPersonalityResult, setShowPersonalityResult] = useState(false);

  if (showPersonalityResult) {
    return (
      <div className="space-y-6">
        <Button
          variant="outline"
          onClick={() => setShowPersonalityResult(false)}
          className="border-2 border-black rounded-full hover:shadow-brutal-sm transition-all"
        >
          ← Back to Preferences
        </Button>
        <PersonalityResultView />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-1">Preferences</h3>
        <p className="text-sm text-muted-foreground">
          Customize your DayLight experience
        </p>
      </div>

      <div className="space-y-4">
        {/* Persona Test Result */}
        <div 
          onClick={() => setShowPersonalityResult(true)}
          className="border border-brand/30 bg-brand/5 rounded-lg p-4 hover:border-brand hover:bg-brand/10 transition-colors cursor-pointer"
        >
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-brand/20 flex items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5 text-brand" />
            </div>
            <div className="flex-1">
              <h4 className="font-medium mb-1 text-brand">My Persona Result</h4>
              <p className="text-sm text-muted-foreground">
                View your day archetype and persona profile
              </p>
            </div>
            <span className="text-xs bg-brand text-white px-2 py-1 rounded-full font-bold">
              View
            </span>
          </div>
        </div>

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

      {/* Legal & Support Section */}
      <div className="border-t border-gray-200 pt-6 mt-6">
        <h4 className="font-semibold text-gray-900 mb-4">Legal & Support</h4>
        <div className="space-y-3">
          <Link href="/terms" target="_blank">
            <div className="border border-gray-200 rounded-lg p-4 hover:border-brand/30 hover:bg-brand/5 transition-colors cursor-pointer">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-brand/10 flex items-center justify-center shrink-0">
                  <FileText className="w-5 h-5 text-brand" />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium">Terms & Conditions</h4>
                  <p className="text-sm text-muted-foreground">
                    Read our terms of service
                  </p>
                </div>
              </div>
            </div>
          </Link>

          <Link href="/privacy" target="_blank">
            <div className="border border-gray-200 rounded-lg p-4 hover:border-brand/30 hover:bg-brand/5 transition-colors cursor-pointer">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-brand/10 flex items-center justify-center shrink-0">
                  <Shield className="w-5 h-5 text-brand" />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium">Privacy Policy</h4>
                  <p className="text-sm text-muted-foreground">
                    Learn how we protect your data
                  </p>
                </div>
              </div>
            </div>
          </Link>

          <Link href="/community-guidelines" target="_blank">
            <div className="border border-gray-200 rounded-lg p-4 hover:border-brand/30 hover:bg-brand/5 transition-colors cursor-pointer">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-brand/10 flex items-center justify-center shrink-0">
                  <Users className="w-5 h-5 text-brand" />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium">Community Guidelines</h4>
                  <p className="text-sm text-muted-foreground">
                    Our rules for a safe community
                  </p>
                </div>
              </div>
            </div>
          </Link>

          <Link href="/contact" target="_blank">
            <div className="border border-gray-200 rounded-lg p-4 hover:border-brand/30 hover:bg-brand/5 transition-colors cursor-pointer">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-brand/10 flex items-center justify-center shrink-0">
                  <Mail className="w-5 h-5 text-brand" />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium">Contact Us</h4>
                  <p className="text-sm text-muted-foreground">
                    Get in touch with our team
                  </p>
                </div>
              </div>
            </div>
          </Link>
        </div>
      </div>

      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mt-6">
        <p className="text-sm text-muted-foreground text-center">
          App settings features are currently in development and will be available soon. Stay tuned! 🚀
        </p>
      </div>
    </div>
  );
}