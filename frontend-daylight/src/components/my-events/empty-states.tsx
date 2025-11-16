'use client';

import Link from 'next/link';
import { Calendar, History, Receipt } from 'lucide-react';

export function EmptyMyEvents() {
  return (
    <div className="text-center py-12">
      <div className="w-16 h-16 rounded-full bg-brand/10 flex items-center justify-center mx-auto mb-4">
        <Calendar className="w-8 h-8 text-brand" />
      </div>
      <h3 className="text-xl md:text-2xl font-bold mb-2">No Upcoming Events</h3>
      <p className="text-muted-foreground text-sm md:text-base max-w-xl mx-auto mb-6">
        You haven't joined any events yet. Start exploring and connect with amazing people!
      </p>
      <Link
        href="/events"
        className="inline-flex items-center gap-2 px-6 py-3 bg-brand text-white rounded-lg font-semibold hover:bg-brand/90 transition-colors"
      >
        Browse Events
      </Link>
    </div>
  );
}

export function EmptyPastEvents() {
  return (
    <div className="text-center py-12">
      <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
        <History className="w-8 h-8 text-gray-400" />
      </div>
      <h3 className="text-xl md:text-2xl font-bold mb-2">No Past Events</h3>
      <p className="text-muted-foreground text-sm md:text-base max-w-xl mx-auto">
        Events you've attended will appear here
      </p>
    </div>
  );
}

export function EmptyTransactions() {
  return (
    <div className="text-center py-12">
      <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
        <Receipt className="w-8 h-8 text-gray-400" />
      </div>
      <h3 className="text-xl md:text-2xl font-bold mb-2">No Transactions</h3>
      <p className="text-muted-foreground text-sm md:text-base max-w-xl mx-auto">
        Your payment history will appear here
      </p>
    </div>
  );
}