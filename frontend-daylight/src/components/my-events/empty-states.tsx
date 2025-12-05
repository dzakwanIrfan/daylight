"use client";

import Link from "next/link";
import { Calendar, History, Receipt, Ticket } from "lucide-react";
import { Button } from "@/components/ui/button";

export function EmptyMyEvents() {
  return (
    <div className="text-center py-8 sm:py-12 px-4">
      <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-brand/10 flex items-center justify-center mx-auto mb-4">
        <Calendar className="w-7 h-7 sm:w-8 sm:h-8 text-brand" />
      </div>
      <h3 className="text-lg sm:text-xl md:text-2xl font-bold mb-2">
        No Upcoming Events
      </h3>
      <p className="text-gray-500 text-xs sm:text-sm md:text-base max-w-md mx-auto mb-6">
        You haven't joined any events yet. Start exploring and connect with
        amazing people!
      </p>
      <Button asChild className="h-10 sm:h-11 px-5 sm:px-6">
        <Link href="/events" className="inline-flex items-center gap-2">
          <Ticket className="w-4 h-4" />
          Browse Events
        </Link>
      </Button>
    </div>
  );
}

export function EmptyPastEvents() {
  return (
    <div className="text-center py-8 sm:py-12 px-4">
      <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
        <History className="w-7 h-7 sm:w-8 sm:h-8 text-gray-400" />
      </div>
      <h3 className="text-lg sm:text-xl md:text-2xl font-bold mb-2">
        No Past Events
      </h3>
      <p className="text-gray-500 text-xs sm:text-sm md:text-base max-w-md mx-auto">
        Events you've attended will appear here after they're completed.
      </p>
    </div>
  );
}

export function EmptyTransactions() {
  return (
    <div className="text-center py-8 sm:py-12 px-4">
      <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
        <Receipt className="w-7 h-7 sm:w-8 sm:h-8 text-gray-400" />
      </div>
      <h3 className="text-lg sm:text-xl md:text-2xl font-bold mb-2">
        No Transactions
      </h3>
      <p className="text-gray-500 text-xs sm:text-sm md:text-base max-w-md mx-auto">
        Your payment history will appear here once you make your first purchase.
      </p>
    </div>
  );
}
