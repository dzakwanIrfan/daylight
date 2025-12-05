"use client";

import Link from "next/link";
import { format } from "date-fns";
import { cn, formatCurrency } from "@/lib/utils";
import { Calendar, CreditCard, Crown, ArrowRight, Receipt } from "lucide-react";
import { FaCircleCheck } from "react-icons/fa6";
import {
  XenditTransaction,
  XenditTransactionStatus,
} from "@/types/xendit.types";
import { XenditTransactionStatusBadge } from "@/components/xendit/transaction-status-badge";

interface TransactionCardProps {
  transaction: XenditTransaction;
}

export function TransactionCard({ transaction }: TransactionCardProps) {
  const isSubscription = !transaction.eventId;
  const currency = transaction.paymentMethod?.currency || "IDR";

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-5 hover:border-brand/40 hover:shadow-sm transition-all">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            {/* Type Badge */}
            {isSubscription && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-orange-50 text-orange-700 border border-orange-200 rounded text-[10px] sm:text-xs font-medium">
                <Crown className="w-3 h-3" />
                Subscription
              </span>
            )}
            <div className="flex gap-1 items-center min-w-0">
              <h3 className="font-semibold text-gray-900 text-sm sm:text-base truncate">
                {transaction.event?.title || "Subscription Payment"}
              </h3>
              {transaction.event?.partner?.isPreferred && (
                <FaCircleCheck
                  className={cn(
                    "size-3 shrink-0",
                    transaction.event?.partner?.type === "BRAND"
                      ? "text-amber-400"
                      : "text-green-600"
                  )}
                />
              )}
            </div>
          </div>
          <p className="text-[10px] sm:text-xs text-gray-600 font-mono truncate">
            {transaction.externalId}
          </p>
        </div>

        <XenditTransactionStatusBadge
          status={transaction.status}
          size="sm"
          className="self-start shrink-0"
        />
      </div>

      {/* Event Info - Only for event transactions */}
      {!isSubscription && transaction.event && (
        <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600 mb-4">
          <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400 shrink-0" />
          <span className="truncate">
            {format(new Date(transaction.event.eventDate), "EEE, dd MMM yyyy")}
          </span>
        </div>
      )}

      {/* Payment Details */}
      <div className="space-y-2 sm:space-y-2.5 mb-4">
        <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600">
          <CreditCard className="w-3. 5 h-3.5 sm:w-4 sm:h-4 text-gray-400 shrink-0" />
          <span className="truncate">
            {transaction.paymentMethodName || "Unknown"}
          </span>
        </div>

        <div className="flex items-center justify-between text-xs sm:text-sm">
          <span className="text-gray-600">Amount</span>
          <span className="font-medium text-gray-900">
            {formatCurrency(Number(transaction.amount), currency)}
          </span>
        </div>

        {Number(transaction.totalFee) > 0 && (
          <div className="flex items-center justify-between text-xs sm:text-sm">
            <span className="text-gray-600">Service Fee</span>
            <span className="font-medium text-amber-600">
              + {formatCurrency(Number(transaction.totalFee), currency)}
            </span>
          </div>
        )}

        <div className="flex items-center justify-between text-xs sm:text-sm pt-2 border-t border-gray-200">
          <span className="font-semibold text-gray-900">Total</span>
          <span className="font-bold text-brand">
            {formatCurrency(Number(transaction.finalAmount), currency)}
          </span>
        </div>
      </div>

      {/* Footer */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pt-3 sm:pt-4 border-t border-gray-200">
        <span className="text-[10px] sm:text-xs text-gray-500">
          {format(new Date(transaction.createdAt), "dd MMM yyyy, HH:mm")}
        </span>

        {transaction.paymentMethodName !== "SUBSCRIPTION" && (
          <Link
            href={`/payment/${transaction.id}`}
            className="inline-flex items-center gap-1. 5 text-xs sm:text-sm font-medium text-brand hover:text-brand/80 transition-colors self-end sm:self-auto"
          >
            View Details
            <ArrowRight className="w-3. 5 h-3.5 sm:w-4 sm:h-4" />
          </Link>
        )}
      </div>
    </div>
  );
}
