'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { format } from 'date-fns';
import { Clock, Users, TrendingUp, Sparkles, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import { MatchingAttempt, MatchingStatus } from '@/types/matching.types';
import { cn } from '@/lib/utils';

interface MatchingHistoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  history: MatchingAttempt[];
  isLoading: boolean;
}

const statusConfig: Record<
  MatchingStatus,
  { color: string; icon: React.ComponentType<any>; label: string }
> = {
  PENDING: { color: 'bg-amber-50 text-amber-700 border-amber-200', icon: Clock, label: 'Pending' },
  MATCHED: { color: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: CheckCircle2, label: 'Success' },
  PARTIALLY_MATCHED: { color: 'bg-yellow-50 text-yellow-700 border-yellow-200', icon: AlertCircle, label: 'Partial' },
  NO_MATCH: { color: 'bg-rose-50 text-rose-700 border-rose-200', icon: XCircle, label: 'Failed' },
  CONFIRMED: { color: 'bg-blue-50 text-blue-700 border-blue-200', icon: CheckCircle2, label: 'Confirmed' },
  CANCELLED: { color: 'bg-gray-50 text-gray-700 border-gray-200', icon: XCircle, label: 'Cancelled' },
};

export function MatchingHistoryDialog({
  open,
  onOpenChange,
  history,
  isLoading,
}: MatchingHistoryDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] p-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b">
          <DialogTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-brand" />
            Matching History
          </DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center h-[400px]">
            <div className="text-center">
              <Clock className="h-8 w-8 animate-spin text-brand mx-auto mb-2" />
              <p className="text-sm text-gray-600">Loading history...</p>
            </div>
          </div>
        ) : history.length === 0 ? (
          <div className="flex items-center justify-center h-[400px]">
            <div className="text-center">
              <Clock className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <h3 className="text-base font-medium text-gray-900 mb-1">
                No History Yet
              </h3>
              <p className="text-sm text-gray-500">
                Matching attempts will appear here
              </p>
            </div>
          </div>
        ) : (
          <ScrollArea className="h-[600px] px-6 pb-6">
            <div className="space-y-3 pt-4">
              {history.map((attempt, index) => {
                const statusStyle = statusConfig[attempt.status];
                const StatusIcon = statusStyle.icon;
                const matchRate = (attempt.matchedCount / attempt.totalParticipants) * 100;

                return (
                  <Card key={attempt.id} className="p-4 border-gray-200 hover:border-brand/30 transition-colors">
                    <div className="flex items-start justify-between mb-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-gray-900">
                            Attempt #{attempt.attemptNumber}
                          </span>
                          <Badge variant="outline" className={cn('text-xs', statusStyle.color)}>
                            <StatusIcon className="h-3 w-3 mr-1" />
                            {statusStyle.label}
                          </Badge>
                        </div>
                        <p className="text-xs text-gray-500">
                          {format(new Date(attempt.createdAt), 'dd MMM yyyy, HH:mm')}
                        </p>
                      </div>
                      <Badge variant="outline" className="text-xs bg-gray-50 border-gray-200">
                        {attempt.executionTime.toFixed(1)}s
                      </Badge>
                    </div>

                    <div className="grid grid-cols-4 gap-2">
                      <div className="text-center p-2.5 rounded-lg bg-gray-50">
                        <Users className="h-4 w-4 text-gray-500 mx-auto mb-1" />
                        <p className="text-base font-bold text-gray-900">{attempt.totalParticipants}</p>
                        <p className="text-[10px] text-gray-600 uppercase tracking-wide">Total</p>
                      </div>

                      <div className="text-center p-2.5 rounded-lg bg-emerald-50">
                        <CheckCircle2 className="h-4 w-4 text-emerald-600 mx-auto mb-1" />
                        <p className="text-base font-bold text-emerald-700">
                          {attempt.matchedCount}
                          <span className="text-[10px] ml-0.5">({matchRate.toFixed(0)}%)</span>
                        </p>
                        <p className="text-[10px] text-emerald-600 uppercase tracking-wide">Matched</p>
                      </div>

                      <div className="text-center p-2.5 rounded-lg bg-purple-50">
                        <Users className="h-4 w-4 text-purple-600 mx-auto mb-1" />
                        <p className="text-base font-bold text-purple-700">{attempt.groupsFormed}</p>
                        <p className="text-[10px] text-purple-600 uppercase tracking-wide">Groups</p>
                      </div>

                      <div className="text-center p-2.5 rounded-lg bg-blue-50">
                        <Sparkles className="h-4 w-4 text-blue-600 mx-auto mb-1" />
                        <p className="text-base font-bold text-blue-700">
                          {attempt.averageMatchScore?.toFixed(0) || 'N/A'}%
                        </p>
                        <p className="text-[10px] text-blue-600 uppercase tracking-wide">Avg</p>
                      </div>
                    </div>

                    <div className="mt-3 flex items-center justify-between text-xs py-2 px-3 rounded-lg bg-gray-50">
                      <span className="text-gray-600">Threshold Range</span>
                      <span className="font-semibold text-gray-900">
                        {attempt.highestThreshold}% - {attempt.lowestThreshold}%
                      </span>
                    </div>

                    {attempt.unmatchedCount > 0 && (
                      <div className="mt-2 flex items-center gap-1.5 text-xs py-2 px-3 rounded-lg bg-amber-50 text-amber-700">
                        <AlertCircle className="h-3.5 w-3.5" />
                        <span>{attempt.unmatchedCount} participants unmatched</span>
                      </div>
                    )}
                  </Card>
                );
              })}
            </div>
          </ScrollArea>
        )}
      </DialogContent>
    </Dialog>
  );
}