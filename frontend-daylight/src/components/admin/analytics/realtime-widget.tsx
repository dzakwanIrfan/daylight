'use client';

import { Activity, Users, UserCheck, UserX } from 'lucide-react';
import { Card } from '@/components/ui/card';
import type { RealtimeData } from '@/services/analytics.service';

interface RealtimeWidgetProps {
  data: RealtimeData;
}

export function RealtimeWidget({ data }: RealtimeWidgetProps) {
  return (
    <Card className="p-4 bg-linear-to-r from-brand/5 to-brand/10 border-brand/20">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Activity className="w-6 h-6 text-brand" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse" />
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-600">Real-time</h3>
            <p className="text-2xl font-bold text-gray-900">
              {data.activeSessions} <span className="text-sm font-normal text-gray-500">active now</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-green-500" />
            <div>
              <p className="text-xs text-gray-500">Logged In</p>
              <p className="text-lg font-semibold text-gray-900">{data.loggedInUsers}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <UserX className="w-5 h-5 text-gray-400" />
            <div>
              <p className="text-xs text-gray-500">Anonymous</p>
              <p className="text-lg font-semibold text-gray-900">{data.anonymousUsers}</p>
            </div>
          </div>

          {data.currentPages.length > 0 && (
            <div className="hidden md:block border-l pl-6 ml-2">
              <p className="text-xs text-gray-500 mb-1">Top Page Now</p>
              <p className="text-sm font-medium text-gray-700 truncate max-w-[150px]">
                {data.currentPages[0].path}
              </p>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}