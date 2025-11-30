import { MessageCircle, Calendar, Users } from 'lucide-react';
import Link from 'next/link';

export function ChatEmptyState() {
  return (
    <div className="min-h-full bg-white overflow-y-auto">
      <div className="p-6 md:p-12 text-center space-y-6 max-w-4xl mx-auto">
        <div className="flex justify-center">
          <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-brand/10 flex items-center justify-center">
            <MessageCircle className="w-8 h-8 md:w-10 md:h-10 text-brand" />
          </div>
        </div>

        <div className="space-y-3 max-w-md mx-auto">
          <h2 className="text-xl md:text-2xl font-bold">No Chat Groups Yet</h2>
          <p className="text-sm md:text-base text-muted-foreground">
            Join an event and get matched with others to start chatting!
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-2">
          <Link
            href="/events"
            className="inline-flex items-center gap-2 bg-brand text-white px-6 py-3 rounded-lg hover:bg-brand-dark transition-colors w-full sm:w-auto justify-center"
          >
            <Calendar className="w-5 h-5 shrink-0" />
            Browse Events
          </Link>
        </div>

        <div className="pt-6 border-t border-gray-200 mt-8">
          <h3 className="font-semibold mb-4 text-sm md:text-base">How it works</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-4 text-sm">
            <div className="space-y-2">
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-brand/10 flex items-center justify-center mx-auto">
                <Calendar className="w-5 h-5 md:w-6 md:h-6 text-brand" />
              </div>
              <p className="font-medium">1. Join an Event</p>
              <p className="text-muted-foreground text-xs md:text-sm">Purchase a ticket to an event</p>
            </div>
            <div className="space-y-2">
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-brand/10 flex items-center justify-center mx-auto">
                <Users className="w-5 h-5 md:w-6 md:h-6 text-brand" />
              </div>
              <p className="font-medium">2. Get Matched</p>
              <p className="text-muted-foreground text-xs md:text-sm">We'll match you with compatible people</p>
            </div>
            <div className="space-y-2">
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-brand/10 flex items-center justify-center mx-auto">
                <MessageCircle className="w-5 h-5 md:w-6 md:h-6 text-brand" />
              </div>
              <p className="font-medium">3. Start Chatting</p>
              <p className="text-muted-foreground text-xs md:text-sm">Connect with your group before the event</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}