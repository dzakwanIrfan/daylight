"use client";

import {
  MapPin,
  Globe,
  Settings,
  FileText,
  Shield,
  Users,
  Mail,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { PersonalityResultView } from "./personality-result-view";
import { CitySelectorModal } from "./city-selector-modal";
import { Button } from "@/components/ui/button";
import { userService } from "@/services/user.service";
import { Skeleton } from "@/components/ui/skeleton";

export function PreferencesSettings() {
  const [showPersonalityResult, setShowPersonalityResult] = useState(false);
  const [showCitySelector, setShowCitySelector] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      setLoadingProfile(true);
      const data = await userService.getProfile();
      setUserProfile(data);
    } catch (error) {
      console.error("Failed to fetch user profile:", error);
    } finally {
      setLoadingProfile(false);
    }
  };

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
          className="border border-brand/30 bg-brand/5 rounded-lg p-3 sm:p-4 hover:border-brand hover:bg-brand/10 transition-colors cursor-pointer active:scale-[0.98]"
        >
          <div className="flex items-start gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-brand/20 flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-brand" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-medium mb-1 text-brand text-sm sm:text-base">
                My Persona Result
              </h4>
              <p className="text-xs sm:text-sm text-muted-foreground">
                View your Light Archetype and persona profile
              </p>
            </div>
            <span className="text-xs bg-brand text-white px-2 py-1 rounded-full font-bold shrink-0">
              View
            </span>
          </div>
        </div>

        {/* Settings Preview */}
        <div className="border border-gray-200 rounded-lg p-3 sm:p-4 hover:border-brand/30 transition-colors cursor-not-allowed opacity-60">
          <div className="flex items-start gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
              <Settings className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-medium mb-1 text-sm sm:text-base">
                App Settings
              </h4>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Notifications, privacy, and account preferences
              </p>
            </div>
            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full shrink-0">
              Soon
            </span>
          </div>
        </div>

        {/* Location Preview */}
        {loadingProfile ? (
          <div className="border border-gray-200 rounded-lg p-3 sm:p-4">
            <div className="flex items-start gap-2 sm:gap-3">
              <Skeleton className="w-8 h-8 sm:w-10 sm:h-10 rounded-full shrink-0" />
              <div className="flex-1 space-y-2 min-w-0">
                <Skeleton className="h-4 sm:h-5 w-20 sm:w-24" />
                <Skeleton className="h-3 sm:h-4 w-full" />
              </div>
            </div>
          </div>
        ) : (
          <div
            onClick={() => setShowCitySelector(true)}
            className="border border-brand/30 bg-brand/5 rounded-lg p-3 sm:p-4 hover:border-brand hover:bg-brand/10 transition-colors cursor-pointer active:scale-[0.98]"
          >
            <div className="flex items-start gap-2 sm:gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-brand/20 flex items-center justify-center shrink-0">
                <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-brand" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-medium mb-1 text-brand text-sm sm:text-base">
                  Current Location
                </h4>
                <p className="text-xs sm:text-sm text-muted-foreground truncate">
                  {userProfile?.currentCity
                    ? `${userProfile.currentCity.name}, ${userProfile.currentCity.country.name}`
                    : "Set your preferred location for events"}
                </p>
                {userProfile?.currentCity && (
                  <p className="text-xs text-muted-foreground mt-1 truncate">
                    Timezone: {userProfile.currentCity.timezone}
                  </p>
                )}
              </div>
              <span className="text-xs bg-brand text-white px-2 py-1 rounded-full font-bold shrink-0">
                {userProfile?.currentCity ? "Change" : "Set"}
              </span>
            </div>
          </div>
        )}

        {/* Language Preview */}
        <div className="border border-gray-200 rounded-lg p-3 sm:p-4 hover:border-brand/30 transition-colors cursor-not-allowed opacity-60">
          <div className="flex items-start gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
              <Globe className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-medium mb-1 text-sm sm:text-base">
                Language
              </h4>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Choose your preferred language for the app
              </p>
            </div>
            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full shrink-0">
              Soon
            </span>
          </div>
        </div>
      </div>

      {/* Legal & Support Section */}
      <div className="border-t border-gray-200 pt-4 sm:pt-6 mt-4 sm:mt-6">
        <h4 className="font-semibold text-gray-900 mb-3 sm:mb-4 text-sm sm:text-base">
          Legal & Support
        </h4>
        <div className="flex flex-col space-y-2 sm:space-y-3 justify-center items-stretch">
          <Link href="/terms" target="_blank">
            <div className="border border-gray-200 rounded-lg p-3 sm:p-4 hover:border-brand/30 hover:bg-brand/5 transition-colors cursor-pointer active:scale-[0.98]">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-brand/10 flex items-center justify-center shrink-0">
                  <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-brand" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-sm sm:text-base">
                    Terms & Conditions
                  </h4>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    Read our terms of service
                  </p>
                </div>
              </div>
            </div>
          </Link>

          <Link href="/privacy" target="_blank">
            <div className="border border-gray-200 rounded-lg p-3 sm:p-4 hover:border-brand/30 hover:bg-brand/5 transition-colors cursor-pointer active:scale-[0.98]">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-brand/10 flex items-center justify-center shrink-0">
                  <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-brand" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-sm sm:text-base">
                    Privacy Policy
                  </h4>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    Learn how we protect your data
                  </p>
                </div>
              </div>
            </div>
          </Link>

          <Link href="/community-guidelines" target="_blank">
            <div className="border border-gray-200 rounded-lg p-3 sm:p-4 hover:border-brand/30 hover:bg-brand/5 transition-colors cursor-pointer active:scale-[0.98]">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-brand/10 flex items-center justify-center shrink-0">
                  <Users className="w-4 h-4 sm:w-5 sm:h-5 text-brand" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-sm sm:text-base">
                    Community Guidelines
                  </h4>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    Our rules for a safe community
                  </p>
                </div>
              </div>
            </div>
          </Link>

          <Link href="/contact" target="_blank">
            <div className="border border-gray-200 rounded-lg p-3 sm:p-4 hover:border-brand/30 hover:bg-brand/5 transition-colors cursor-pointer active:scale-[0.98]">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-brand/10 flex items-center justify-center shrink-0">
                  <Mail className="w-4 h-4 sm:w-5 sm:h-5 text-brand" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-sm sm:text-base">
                    Contact Us
                  </h4>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    Get in touch with our team
                  </p>
                </div>
              </div>
            </div>
          </Link>
        </div>
      </div>

      <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 sm:p-4 mt-4 sm:mt-6">
        <p className="text-xs sm:text-sm text-muted-foreground text-center">
          App settings features are currently in development and will be
          available soon. Stay tuned! 🚀
        </p>
      </div>

      {/* City Selector Modal */}
      <CitySelectorModal
        open={showCitySelector}
        onOpenChange={setShowCitySelector}
        currentCityId={userProfile?.currentCityId}
        onCityChanged={fetchUserProfile}
      />
    </div>
  );
}
