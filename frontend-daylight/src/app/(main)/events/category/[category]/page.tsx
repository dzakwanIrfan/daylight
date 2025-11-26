"use client";

import { DashboardLayout } from "@/components/main/dashboard-layout";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowLeft, Loader2 } from "lucide-react";
import { EventsList } from "@/components/events/events-list";
import { usePublicEvents } from "@/hooks/use-public-events";
import { EventCategory, EventStatus } from "@/types/event.types";
import { CityFilter } from "@/components/events/city-filter";
import Image from "next/image";

const categoryInfo = {
  DAYBREAK: {
    title: "DayBreak Events",
    description: "Dinner & Coffee Activities.",
    color: "bg-linear-to-br from-brand/15 via-white to-brand/20 border border-brand/20",
    src: "/images/categories/text/DayBreak.png",
  },
  DAYTRIP: {
    title: "DayTrip Events",
    description: "Travel & Trip Activities.",
    color: "bg-linear-to-br from-brand/15 via-white to-brand/20 border border-brand/20",
    src: "/images/categories/text/DayTrip.png",
  },
  DAYCARE: {
    title: "DayCare Events",
    description: "Health & Wellness Activities.",
    color: "bg-linear-to-br from-brand/15 via-white to-brand/20 border border-brand/20",
    src: "/images/categories/text/DayCare.png",
  },
};

export default function CategoryPage() {
  const params = useParams();
  const router = useRouter();
  const category = params.category as EventCategory;
  const [selectedCity, setSelectedCity] = useState<string | undefined>(undefined);

  const { data, isLoading } = usePublicEvents({
    category,
    status: EventStatus.PUBLISHED,
    isActive: true,
    sortBy: "eventDate",
    sortOrder: "asc",
    limit: 50,
    city: selectedCity,
  });

  const info = categoryInfo[category];

  // Get unique cities from all events (without city filter to show all available options)
  const { data: allEventsData } = usePublicEvents({
    category,
    status: EventStatus.PUBLISHED,
    isActive: true,
    limit: 100,
  });

  const availableCities = allEventsData?.data
    ? [...new Set(allEventsData.data.map((event) => event.city))]
    : [];

  if (!info) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <h3 className="text-lg font-semibold mb-2">Invalid Category</h3>
          <button
            onClick={() => router.back()}
            className="text-brand hover:underline"
          >
            Go back
          </button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-600 hover:text-brand transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm font-medium">Back</span>
        </button>

        {/* Header */}
        <div
          className={`${info.color} rounded-xl p-6 space-x-4 flex items-center`}
        >
          <Image
            src={info.src}
            alt={info.title}
            width={64}
            height={64}
            className="rounded-full"
          />
          <div className="flex flex-col gap-0 md:gap-1">
            <h1 className="text-2xl md:text-3xl font-bold">{info.title}</h1>
            <p className="text-sm md:text-base">{info.description}</p>
          </div>
        </div>

        {/* Events List */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
            <div className="flex items-center gap-4">
              <h2 className="text-lg font-semibold">Available Events</h2>
              {data && data.pagination.total > 0 && (
                <span className="text-sm text-muted-foreground">
                  {data.pagination.total} events found
                </span>
              )}
            </div>
            <CityFilter
              cities={availableCities}
              selectedCity={selectedCity}
              onCityChange={setSelectedCity}
            />
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-brand" />
            </div>
          ) : (
            <EventsList
              events={data?.data || []}
              emptyMessage={
                selectedCity
                  ? `No ${category} events available in ${selectedCity}`
                  : `No ${category} events available at the moment`
              }
            />
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}