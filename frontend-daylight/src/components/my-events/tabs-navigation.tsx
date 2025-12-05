"use client";

import { MyEventsTab } from "@/types/my-events.types";
import { cn } from "@/lib/utils";
import { Calendar, History, Receipt } from "lucide-react";

interface TabsNavigationProps {
  activeTab: MyEventsTab;
  onTabChange: (tab: MyEventsTab) => void;
  counts: {
    myEvents: number;
    pastEvents: number;
    transactions: number;
  };
}

export function TabsNavigation({
  activeTab,
  onTabChange,
  counts,
}: TabsNavigationProps) {
  const tabs = [
    {
      id: MyEventsTab.MY_EVENTS,
      label: "My Events",
      shortLabel: "Events",
      count: counts.myEvents,
      icon: Calendar,
    },
    {
      id: MyEventsTab.PAST_EVENTS,
      label: "Past Events",
      shortLabel: "Past",
      count: counts.pastEvents,
      icon: History,
    },
    {
      id: MyEventsTab.TRANSACTIONS,
      label: "Transactions",
      shortLabel: "History",
      count: counts.transactions,
      icon: Receipt,
    },
  ];

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-1 sm:p-1.5">
      <div className="grid grid-cols-3 gap-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={cn(
                "relative px-2 sm:px-4 py-2 sm:py-2.5 rounded-md text-xs sm:text-sm font-medium transition-all",
                isActive
                  ? "bg-brand text-white shadow-sm"
                  : "text-gray-600 hover:text-brand hover:bg-brand/5"
              )}
            >
              <span className="flex items-center justify-center gap-1.5 sm:gap-2">
                <Icon
                  className={cn(
                    "w-3.5 h-3.5 sm:w-4 sm:h-4",
                    isActive ? "text-white" : "text-gray-400"
                  )}
                />
                {/* Short label on mobile, full label on larger screens */}
                <span className="hidden sm:inline">{tab.label}</span>
                <span className="sm:hidden">{tab.shortLabel}</span>
                {tab.count > 0 && (
                  <span
                    className={cn(
                      "px-1.5 sm:px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-semibold min-w-5 sm:min-w-6 text-center",
                      isActive
                        ? "bg-white/20 text-white"
                        : "bg-brand/10 text-brand"
                    )}
                  >
                    {tab.count > 99 ? "99+" : tab.count}
                  </span>
                )}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
