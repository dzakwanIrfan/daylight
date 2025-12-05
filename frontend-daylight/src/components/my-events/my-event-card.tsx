"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Calendar,
  MapPin,
  Users,
  ChevronDown,
  ChevronUp,
  CreditCard,
} from "lucide-react";
import { MyEvent } from "@/types/my-events.types";
import { format } from "date-fns";
import { cn, formatCurrency } from "@/lib/utils";
import { useMyMatchingGroup } from "@/hooks/use-my-events";
import { MatchingGroupCard } from "./matching-group-card";
import { FaCircleCheck } from "react-icons/fa6";
import { Badge } from "@/components/ui/badge";
import { XenditTransactionStatusBadge } from "@/components/xendit/transaction-status-badge";
import { XenditTransactionStatus } from "@/types/xendit.types";

interface MyEventCardProps {
  event: MyEvent;
  isPast?: boolean;
}

export function MyEventCard({ event, isPast = false }: MyEventCardProps) {
  const [showGroup, setShowGroup] = useState(false);

  // Fetch matching group (only if not past event)
  const { data: matchingGroup, isLoading: isLoadingGroup } = useMyMatchingGroup(
    event.id,
    !isPast // Only fetch for upcoming events
  );

  const formatDate = (date: string) => {
    return format(new Date(date), "EEE, yyyy-MM-dd");
  };

  const formatTime = (time: string) => {
    return format(new Date(time), "hh:mm a");
  };

  const hasMatchingGroup = matchingGroup && matchingGroup.groupSize > 0;
  const currency =
    event.transaction.paymentMethod?.currency || event.currency || "IDR";

  return (
    <div className="bg-white rounded-xl border border-gray-200 hover:border-brand/30 hover:shadow-md transition-all overflow-hidden">
      <div className="p-4 sm:p-5 space-y-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
          {/* Event Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start gap-2 sm:gap-3 mb-2 flex-wrap">
              <h3 className="font-semibold text-base sm:text-lg text-gray-900 line-clamp-2 flex-1 min-w-0">
                {event.title}
              </h3>
              <XenditTransactionStatusBadge
                status={event.transaction.status as XenditTransactionStatus}
                size="sm"
              />
            </div>

            <div className="flex flex-col gap-1. 5 sm:gap-2 text-xs sm:text-sm text-gray-600">
              {/* Date & Time */}
              <div className="flex items-center gap-2">
                <Calendar className="w-3. 5 h-3.5 sm:w-4 sm:h-4 text-gray-400 shrink-0" />
                <span className="truncate">
                  {formatDate(event.eventDate)} • {formatTime(event.startTime)}
                </span>
              </div>

              {/* Location */}
              <div className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400 shrink-0" />
                <div className="flex items-center gap-1 truncate">
                  <span className="truncate">
                    {event.venue}, {event.city}
                  </span>
                  {event.partner?.isPreferred && (
                    <FaCircleCheck
                      className={cn(
                        "size-3 shrink-0",
                        event.partner?.type === "BRAND"
                          ? "text-amber-400"
                          : "text-green-600"
                      )}
                    />
                  )}
                </div>
              </div>

              {/* Payment Method */}
              <div className="flex items-center gap-2">
                <CreditCard className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400 shrink-0" />
                <span className="truncate text-gray-500">
                  {event.transaction.paymentMethod?.name || "Subscription"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Matching Group Preview */}
        {!isPast && hasMatchingGroup && (
          <div className="pt-3 border-t border-gray-200">
            <button
              onClick={() => setShowGroup(!showGroup)}
              className="w-full flex items-center justify-between p-2. 5 sm:p-3 rounded-lg bg-linear-to-br from-brand/5 to-transparent border border-brand/20 hover:bg-brand/10 transition-colors"
            >
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-brand" />
                <div className="text-left">
                  <p className="text-xs sm:text-sm font-semibold text-gray-900">
                    Your Table Group
                  </p>
                  <p className="text-[10px] sm:text-xs text-gray-600">
                    Table {matchingGroup.groupNumber} •{" "}
                    {matchingGroup.groupSize} members
                  </p>
                </div>
              </div>
              {showGroup ? (
                <ChevronUp className="w-4 h-4 text-brand" />
              ) : (
                <ChevronDown className="w-4 h-4 text-brand" />
              )}
            </button>

            {showGroup && (
              <div className="mt-3">
                <MatchingGroupCard group={matchingGroup} compact />
              </div>
            )}
          </div>
        )}

        {/* Loading state for matching group */}
        {!isPast && isLoadingGroup && (
          <div className="pt-3 border-t border-gray-200">
            <div className="p-3 rounded-lg bg-gray-50 animate-pulse">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-gray-200" />
                <div className="h-4 bg-gray-200 rounded w-32" />
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-3 sm:pt-4 border-t border-gray-200">
          <div className="text-xs sm:text-sm text-gray-600">
            <span className="font-medium">Total Paid: </span>
            <span className="text-brand font-semibold">
              {formatCurrency(event.transaction.finalAmount, currency)}
            </span>
            {event.transaction.totalFee > 0 && (
              <span className="text-gray-400 text-[10px] sm:text-xs ml-1">
                (incl. fee{" "}
                {formatCurrency(event.transaction.totalFee, currency)})
              </span>
            )}
          </div>

          <Link
            href={`/events/${event.slug}`}
            className="text-xs sm:text-sm font-medium text-brand hover:text-brand/80 transition-colors self-end sm:self-auto"
          >
            View Details →
          </Link>
        </div>
      </div>
    </div>
  );
}
