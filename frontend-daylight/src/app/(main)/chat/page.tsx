'use client';

import { useAuth } from '@/hooks/use-auth';
import { DashboardLayout } from '@/components/main/dashboard-layout';
import { MessageCircle, Users, Sparkles, Clock } from 'lucide-react';

export default function ChatPage() {
  useAuth();

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-brand/10 flex items-center justify-center">
              <MessageCircle className="w-5 h-5 text-brand" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">Chat</h1>
              <p className="text-sm text-muted-foreground">
                Connect with your friends
              </p>
            </div>
          </div>
        </div>

        {/* Coming Soon Content */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          {/* Hero Section */}
          <div className="relative bg-linear-to-br from-brand/5 via-white to-brand/10 p-8 md:p-12 text-center">
            <div className="max-w-2xl mx-auto space-y-6">
              {/* Icon */}
              <div className="flex justify-center">
                <div className="relative">
                  <div className="w-20 h-20 rounded-full bg-brand/10 flex items-center justify-center">
                    <MessageCircle className="w-10 h-10 text-brand" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-brand flex items-center justify-center">
                    <Sparkles className="w-3 h-3 text-white" />
                  </div>
                </div>
              </div>

              {/* Title */}
              <div className="space-y-3">
                <h2 className="text-2xl md:text-3xl font-bold">
                  Real-Time Chat Coming Soon
                </h2>
                <p className="text-muted-foreground text-base md:text-lg max-w-xl mx-auto">
                  We're building something special. Connect with friends, share moments, 
                  and keep the conversation flowing—all within DayLight.
                </p>
              </div>

              {/* Status Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-brand/20 text-sm font-medium text-brand">
                <Clock className="w-4 h-4" />
                In Development
              </div>
            </div>
          </div>

          {/* Features Preview */}
          <div className="p-6 md:p-8 border-t border-gray-200">
            <div className="max-w-3xl mx-auto">
              <h3 className="text-lg font-semibold mb-6 text-center">
                What to Expect
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Feature 1 */}
                <div className="border border-gray-200 rounded-lg p-4 hover:border-brand/30 transition-colors">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-brand/10 flex items-center justify-center shrink-0">
                      <MessageCircle className="w-5 h-5 text-brand" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium mb-1">Real-Time Messaging</h4>
                      <p className="text-sm text-muted-foreground">
                        Instant communication with friends in your DayLight community
                      </p>
                    </div>
                  </div>
                </div>

                {/* Feature 2 */}
                <div className="border border-gray-200 rounded-lg p-4 hover:border-brand/30 transition-colors">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-brand/10 flex items-center justify-center shrink-0">
                      <Users className="w-5 h-5 text-brand" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium mb-1">Group Conversations</h4>
                      <p className="text-sm text-muted-foreground">
                        Create group chats to plan activities and stay connected
                      </p>
                    </div>
                  </div>
                </div>

                {/* Feature 3 */}
                <div className="border border-gray-200 rounded-lg p-4 hover:border-brand/30 transition-colors">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-brand/10 flex items-center justify-center shrink-0">
                      <Sparkles className="w-5 h-5 text-brand" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium mb-1">Rich Media Sharing</h4>
                      <p className="text-sm text-muted-foreground">
                        Share photos, videos, and moments from your gatherings
                      </p>
                    </div>
                  </div>
                </div>

                {/* Feature 4 */}
                <div className="border border-gray-200 rounded-lg p-4 hover:border-brand/30 transition-colors">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-brand/10 flex items-center justify-center shrink-0">
                      <Clock className="w-5 h-5 text-brand" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium mb-1">Event Coordination</h4>
                      <p className="text-sm text-muted-foreground">
                        Coordinate meetups and activities directly in chat
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom CTA */}
          <div className="bg-gray-50 border-t border-gray-200 p-6 text-center">
            <p className="text-sm text-muted-foreground">
              Stay tuned! We'll notify you when chat becomes available. 🚀
            </p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}