'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { DashboardLayout } from '@/components/main/dashboard-layout';
import { Calendar, Loader2 } from 'lucide-react';
import { TabsNavigation } from '@/components/my-events/tabs-navigation';
import { MyEventCard } from '@/components/my-events/my-event-card';
import { TransactionCard } from '@/components/my-events/transaction-card';
import {
  EmptyMyEvents,
  EmptyPastEvents,
  EmptyTransactions,
} from '@/components/my-events/empty-states';
import { MyEventsTab } from '@/types/my-events.types';
import {
  useMyEvents,
  usePastEvents,
  useMyTransactions,
} from '@/hooks/use-my-events';

export default function MyEventsPage() {
  useAuth();
  const [activeTab, setActiveTab] = useState<MyEventsTab>(
    MyEventsTab.MY_EVENTS
  );

  // Fetch data for all tabs
  const { data: myEventsData, isLoading: isLoadingMyEvents } = useMyEvents();
  const { data: pastEventsData, isLoading: isLoadingPastEvents } =
    usePastEvents();
  const { data: transactionsData, isLoading: isLoadingTransactions } =
    useMyTransactions({ limit: 20 });

  const counts = {
    myEvents: myEventsData?.total || 0,
    pastEvents: pastEventsData?.total || 0,
    transactions: transactionsData?.pagination.total || 0,
  };

  const isLoading =
    isLoadingMyEvents || isLoadingPastEvents || isLoadingTransactions;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-brand/10 flex items-center justify-center">
              <Calendar className="w-5 h-5 text-brand" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">My Events</h1>
              <p className="text-sm text-muted-foreground">
                Manage your events and view your table groups
              </p>
            </div>
          </div>
        </div>

        {/* Tabs Navigation */}
        <TabsNavigation
          activeTab={activeTab}
          onTabChange={setActiveTab}
          counts={counts}
        />

        {/* Tab Content */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          {/* Loading State */}
          {isLoading && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-brand" />
            </div>
          )}

          {/* My Events Tab */}
          {!isLoading && activeTab === MyEventsTab.MY_EVENTS && (
            <div>
              <h2 className="text-lg font-semibold mb-4">Upcoming Events</h2>
              {myEventsData && myEventsData.data.length > 0 ? (
                <div className="grid grid-cols-1 gap-4">
                  {myEventsData.data.map((event) => (
                    <MyEventCard key={event.id} event={event} />
                  ))}
                </div>
              ) : (
                <EmptyMyEvents />
              )}
            </div>
          )}

          {/* Past Events Tab */}
          {!isLoading && activeTab === MyEventsTab.PAST_EVENTS && (
            <div>
              <h2 className="text-lg font-semibold mb-4">Past Events</h2>
              {pastEventsData && pastEventsData.data.length > 0 ? (
                <div className="grid grid-cols-1 gap-4">
                  {pastEventsData.data.map((event) => (
                    <MyEventCard key={event.id} event={event} isPast />
                  ))}
                </div>
              ) : (
                <EmptyPastEvents />
              )}
            </div>
          )}

          {/* Transactions Tab */}
          {!isLoading && activeTab === MyEventsTab.TRANSACTIONS && (
            <div>
              <h2 className="text-lg font-semibold mb-4">
                Transaction History
              </h2>
              {transactionsData && transactionsData.data.length > 0 ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 gap-4">
                    {transactionsData.data.map((transaction) => (
                      <TransactionCard
                        key={transaction.id}
                        transaction={transaction}
                      />
                    ))}
                  </div>

                  {/* Pagination Info */}
                  {transactionsData.pagination.totalPages > 1 && (
                    <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                      <p className="text-sm text-gray-600">
                        Showing {transactionsData.data.length} of{' '}
                        {transactionsData.pagination.total} transactions
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <EmptyTransactions />
              )}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}