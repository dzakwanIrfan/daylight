'use client';

import { MyEventsTab } from '@/types/my-events.types';

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
      label: 'My Events',
      count: counts.myEvents,
    },
    {
      id: MyEventsTab.PAST_EVENTS,
      label: 'Past Events',
      count: counts.pastEvents,
    },
    {
      id: MyEventsTab.TRANSACTIONS,
      label: 'Transactions',
      count: counts.transactions,
    },
  ];

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-1">
      <div className="grid grid-cols-3 gap-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`px-4 py-2.5 rounded-md text-sm font-medium transition-all ${
              activeTab === tab.id
                ? 'bg-brand text-white shadow-sm'
                : 'text-gray-600 hover:text-brand hover:bg-brand/5'
            }`}
          >
            <span className="flex items-center justify-center gap-2">
              {tab.label}
              {tab.count > 0 && (
                <span
                  className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                    activeTab === tab.id
                      ? 'bg-white/20 text-white'
                      : 'bg-brand/10 text-brand'
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}