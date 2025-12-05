"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { DashboardLayout } from "@/components/main/dashboard-layout";
import { Calendar, Loader2, RefreshCw } from "lucide-react";
import { TabsNavigation } from "@/components/my-events/tabs-navigation";
import { MyEventCard } from "@/components/my-events/my-event-card";
import { TransactionCard } from "@/components/my-events/transaction-card";
import {
  EmptyMyEvents,
  EmptyPastEvents,
  EmptyTransactions,
} from "@/components/my-events/empty-states";
import { MyEventsTab } from "@/types/my-events.types";
import {
  useMyEvents,
  usePastEvents,
  useMyTransactions,
} from "@/hooks/use-my-events";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function MyEventsPage() {
  useAuth();
  const [activeTab, setActiveTab] = useState<MyEventsTab>(
    MyEventsTab.MY_EVENTS
  );

  // Fetch data for all tabs
  const {
    data: myEventsData,
    isLoading: isLoadingMyEvents,
    refetch: refetchMyEvents,
  } = useMyEvents();

  const {
    data: pastEventsData,
    isLoading: isLoadingPastEvents,
    refetch: refetchPastEvents,
  } = usePastEvents();

  const {
    data: transactionsData,
    isLoading: isLoadingTransactions,
    refetch: refetchTransactions,
  } = useMyTransactions({ limit: 20 });

  const counts = {
    myEvents: myEventsData?.total || 0,
    pastEvents: pastEventsData?.total || 0,
    transactions: transactionsData?.meta?.total || 0,
  };

  const isLoading =
    isLoadingMyEvents || isLoadingPastEvents || isLoadingTransactions;

  const handleRefresh = () => {
    refetchMyEvents();
    refetchPastEvents();
    refetchTransactions();
  };

  return (
    <DashboardLayout>
      <div className="space-y-4 sm:space-y-6 pb-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-brand/10 flex items-center justify-center shrink-0">
              <Calendar className="w-5 h-5 sm:w-6 sm:h-6 text-brand" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold">
                My Events
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Manage your events and view transaction history
              </p>
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isLoading}
            className="self-end sm:self-auto h-9"
          >
            <RefreshCw
              className={cn("w-4 h-4 mr-2", isLoading && "animate-spin")}
            />
            Refresh
          </Button>
        </div>

        {/* Tabs Navigation */}
        <TabsNavigation
          activeTab={activeTab}
          onTabChange={setActiveTab}
          counts={counts}
        />

        {/* Tab Content */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6">
          {/* Loading State */}
          {isLoading && (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <Loader2 className="h-8 w-8 animate-spin text-brand mx-auto mb-3" />
                <p className="text-sm text-gray-500">Loading your data...</p>
              </div>
            </div>
          )}

          {/* My Events Tab */}
          {!isLoading && activeTab === MyEventsTab.MY_EVENTS && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base sm:text-lg font-semibold">
                  Upcoming Events
                </h2>
                {myEventsData && myEventsData.data.length > 0 && (
                  <span className="text-xs sm:text-sm text-gray-500">
                    {myEventsData.total} event
                    {myEventsData.total > 1 ? "s" : ""}
                  </span>
                )}
              </div>
              {myEventsData && myEventsData.data.length > 0 ? (
                <div className="grid grid-cols-1 gap-3 sm:gap-4">
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
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base sm:text-lg font-semibold">
                  Past Events
                </h2>
                {pastEventsData && pastEventsData.data.length > 0 && (
                  <span className="text-xs sm:text-sm text-gray-500">
                    {pastEventsData.total} event
                    {pastEventsData.total > 1 ? "s" : ""}
                  </span>
                )}
              </div>
              {pastEventsData && pastEventsData.data.length > 0 ? (
                <div className="grid grid-cols-1 gap-3 sm:gap-4">
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
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base sm:text-lg font-semibold">
                  Transaction History
                </h2>
                {transactionsData && transactionsData.data.length > 0 && (
                  <span className="text-xs sm:text-sm text-gray-500">
                    {transactionsData.meta.total} transaction
                    {transactionsData.meta.total > 1 ? "s" : ""}
                  </span>
                )}
              </div>
              {transactionsData && transactionsData.data.length > 0 ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 gap-3 sm:gap-4">
                    {transactionsData.data.map((transaction) => (
                      <TransactionCard
                        key={transaction.id}
                        transaction={transaction}
                      />
                    ))}
                  </div>

                  {/* Pagination Info */}
                  {transactionsData.meta.total > 1 && (
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pt-4 border-t border-gray-200">
                      <p className="text-xs sm:text-sm text-gray-500">
                        Showing {transactionsData.data.length} of{" "}
                        {transactionsData.meta.total} transactions
                      </p>
                      <div className="flex items-center gap-2 self-end sm:self-auto">
                        <span className="text-xs text-gray-400">
                          Page {transactionsData.meta.page} of{" "}
                          {transactionsData.meta.total}
                        </span>
                      </div>
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
