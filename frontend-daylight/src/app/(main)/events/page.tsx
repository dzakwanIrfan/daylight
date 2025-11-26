"use client";

import { DashboardLayout } from "@/components/main/dashboard-layout";
import { useAuthStore } from "@/store/auth-store";
import { useEffect, useState } from "react";
import { Calendar, Loader2, Sparkles, Users, Heart } from "lucide-react";
import { CategoryCard } from "@/components/events/category-card";
import { EventsList } from "@/components/events/events-list";
import { useNextWeekEvents } from "@/hooks/use-public-events";
import { useUserStats } from "@/hooks/use-user-stats";
import { StatsCard } from "@/components/main/stats-card";
import { PersonalityResultModal } from "@/components/profile/personality-result-modal";
import { CityFilter } from "@/components/events/city-filter";
import { UtensilsCrossed, Bus, HeartHandshake, Cloud } from "lucide-react";

const categories = [
  {
    label: "DayBreak",
    description: "Dinner & Coffee Activities.",
    icon: UtensilsCrossed,
    href: "/events/category/DAYBREAK",
    color: "bg-orange-500",
    src: "/images/categories/text/DayBreak.png",
  },
  {
    label: "DayTrip",
    description: "Travel & Trip Activities.",
    icon: Bus,
    href: "/events/category/DAYTRIP",
    color: "bg-blue-500",
    src: "/images/categories/text/DayTrip.png",
  },
  {
    label: "DayCare",
    description: "Health & Wellness Activities.",
    icon: HeartHandshake,
    href: "/events/category/DAYCARE",
    color: "bg-green-500",
    src: "/images/categories/text/DayCare.png",
  },
];

export default function HomePage() {
  const { user } = useAuthStore();
  const [mounted, setMounted] = useState(false);
  const [isPersonalityModalOpen, setIsPersonalityModalOpen] = useState(false);
  const [selectedCity, setSelectedCity] = useState<string | undefined>(undefined);

  // Get user stats
  const { data: statsData, isLoading: isLoadingStats } = useUserStats();

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

  const stats = statsData?.data;
  const hasPersonalityType = Boolean(
    stats?.personalityType && stats.personalityType !== "Not Set"
  );

  // Filter events by city if selected
  const filteredEvents = selectedCity
    ? nextWeekData?.data.filter((event) =>
        event.city.toLowerCase().includes(selectedCity.toLowerCase())
      )
    : nextWeekData?.data;

  // Get unique cities from events
  const availableCities = nextWeekData?.data
    ? [...new Set(nextWeekData.data.map((event) => event.city))]
    : [];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Persona Result Modal */}
        <PersonalityResultModal
          isOpen={isPersonalityModalOpen}
          onClose={() => setIsPersonalityModalOpen(false)}
        />

        {/* Welcome Header */}
        <div className="bg-brand rounded-xl border border-brand p-6 space-y-2 text-white">
          <h1 className="text-2xl md:text-3xl font-bold">
            Welcome back, {user?.firstName}! 👋
          </h1>
          <p>Here's what's happening with your connections</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Events Attended */}
          <StatsCard
            title="Events Attended"
            value={stats?.eventsAttended || 0}
            subtitle={
              stats?.eventsAttended === 0
                ? "No events attended yet"
                : `${stats?.eventsAttended} event${
                    stats?.eventsAttended === 1 ? "" : "s"
                  } completed`
            }
            icon={Calendar}
            isLoading={isLoadingStats}
          />

          {/* Connections */}
          <StatsCard
            title="Connections"
            value={stats?.connections || 0}
            subtitle={
              stats?.connections === 0
                ? "Start meeting people"
                : `${stats?.connections} connection${
                    stats?.connections === 1 ? "" : "s"
                  } made`
            }
            icon={Users}
            isLoading={isLoadingStats}
          />

          {/* Persona Type */}
          <StatsCard
            title="Persona Type"
            value={stats?.personalityType || "Not Set"}
            subtitle={
              hasPersonalityType
                ? "Click to view your profile"
                : "Your archetype"
            }
            icon={Sparkles}
            isLoading={isLoadingStats}
            clickable={hasPersonalityType}
            onClick={() => {
              if (hasPersonalityType) {
                setIsPersonalityModalOpen(true);
              }
            }}
          />
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
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
            <h2 className="text-lg font-semibold">Events Next Week</h2>
            <CityFilter
              cities={availableCities}
              selectedCity={selectedCity}
              onCityChange={setSelectedCity}
            />
          </div>

          {isLoadingNextWeek ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-brand" />
            </div>
          ) : filteredEvents && filteredEvents.length > 0 ? (
            <EventsList events={filteredEvents} />
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 rounded-full bg-brand/10 flex items-center justify-center mx-auto mb-4">
                <Heart className="w-8 h-8 text-brand" />
              </div>
              <h3 className="text-xl md:text-2xl font-bold mb-2">
                No Events Yet
              </h3>
              <p className="text-muted-foreground text-sm md:text-base max-w-xl mx-auto">
                {selectedCity
                  ? `No events found in ${selectedCity}. Try selecting a different city or clear the filter.`
                  : "No events scheduled for next week. Check back later or explore other categories!"}
              </p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
