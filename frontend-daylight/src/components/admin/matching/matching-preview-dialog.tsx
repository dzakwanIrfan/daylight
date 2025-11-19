'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Users, 
  TrendingUp, 
  Sparkles, 
  AlertCircle, 
  CheckCircle2,
  AlertTriangle,
  XCircle
} from 'lucide-react';
import { MatchingPreviewResponse } from '@/types/matching.types';
import { cn } from '@/lib/utils';

interface MatchingPreviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  previewData: MatchingPreviewResponse | null;
  onConfirm: () => void;
  isConfirming: boolean;
}

export function MatchingPreviewDialog({
  open,
  onOpenChange,
  previewData,
  onConfirm,
  isConfirming,
}: MatchingPreviewDialogProps) {
  if (!previewData) return null;

  const { result } = previewData;
  const { statistics, groups, unmatchedUsers, thresholdBreakdown, warnings } = result;

  const matchRate = (statistics.matchedCount / result.totalParticipants) * 100;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[900px] max-h-[90vh] p-0">
        <DialogHeader className="px-6 pt-6 pb-4 space-y-1">
          <DialogTitle className="text-xl font-semibold flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-brand/10 flex items-center justify-center">
              <Sparkles className="h-4 w-4 text-brand" />
            </div>
            Matching Preview
          </DialogTitle>
          <DialogDescription className="text-sm">
            Review matching results with adaptive threshold algorithm
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(90vh-180px)]">
          <div className="px-6 space-y-6 pb-6">
            {/* Match Success Rate */}
            <div className="relative overflow-hidden rounded-xl border border-gray-200 bg-linear-to-br from-white to-gray-50 p-5">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-sm font-medium text-gray-700">Match Success Rate</p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {statistics.matchedCount} of {result.totalParticipants} participants
                  </p>
                </div>
                <div className={cn(
                  "text-3xl font-bold",
                  matchRate >= 80 ? "text-emerald-600" :
                  matchRate >= 60 ? "text-blue-600" :
                  "text-amber-600"
                )}>
                  {matchRate.toFixed(0)}%
                </div>
              </div>
              <Progress 
                value={matchRate} 
                className={cn(
                  "h-2",
                  matchRate >= 80 ? "[&>div]:bg-emerald-500" :
                  matchRate >= 60 ? "[&>div]:bg-blue-500" :
                  "[&>div]:bg-amber-500"
                )}
              />
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-4 gap-3">
              <div className="rounded-xl border border-gray-200 bg-white p-4 text-center">
                <Users className="h-5 w-5 text-blue-500 mx-auto mb-2" />
                <p className="text-2xl font-bold text-gray-900">{statistics.totalGroups}</p>
                <p className="text-xs text-gray-600 mt-1">Groups</p>
              </div>

              <div className="rounded-xl border border-gray-200 bg-white p-4 text-center">
                <TrendingUp className="h-5 w-5 text-emerald-500 mx-auto mb-2" />
                <p className="text-2xl font-bold text-gray-900">
                  {statistics.averageMatchScore.toFixed(0)}%
                </p>
                <p className="text-xs text-gray-600 mt-1">Avg Match</p>
              </div>

              <div className="rounded-xl border border-gray-200 bg-white p-4 text-center">
                <Users className="h-5 w-5 text-purple-500 mx-auto mb-2" />
                <p className="text-2xl font-bold text-gray-900">
                  {statistics.averageGroupSize.toFixed(1)}
                </p>
                <p className="text-xs text-gray-600 mt-1">Avg Size</p>
              </div>

              <div className="rounded-xl border border-gray-200 bg-white p-4 text-center">
                <Sparkles className="h-5 w-5 text-amber-500 mx-auto mb-2" />
                <p className="text-sm font-bold text-gray-900">
                  {statistics.highestThreshold}%-{statistics.lowestThreshold}%
                </p>
                <p className="text-xs text-gray-600 mt-1">Threshold</p>
              </div>
            </div>

            {/* Threshold Breakdown */}
            {thresholdBreakdown.length > 0 && (
              <div className="space-y-3">
                <p className="text-sm font-semibold text-gray-900">Threshold Strategy</p>
                <div className="space-y-2">
                  {thresholdBreakdown.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <Badge
                          variant="outline"
                          className={cn(
                            'font-semibold',
                            item.threshold >= 70
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : item.threshold >= 60
                              ? 'bg-blue-50 text-blue-700 border-blue-200'
                              : 'bg-amber-50 text-amber-700 border-amber-200'
                          )}
                        >
                          {item.threshold}%
                        </Badge>
                        <span className="text-sm text-gray-700">
                          {item.groupsFormed} {item.groupsFormed === 1 ? 'group' : 'groups'}
                        </span>
                      </div>
                      <span className="text-sm font-medium text-gray-900">
                        {item.participantsMatched} participants
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Warnings */}
            {warnings.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-semibold text-gray-900">Algorithm Analysis</p>
                <div className="space-y-1.5">
                  {warnings.map((warning, index) => {
                    const isSuccess = warning.startsWith('✓');
                    const isWarning = warning.startsWith('⚠');
                    const isError = warning.startsWith('❌');

                    return (
                      <Alert
                        key={index}
                        variant={isError ? 'destructive' : 'default'}
                        className={cn(
                          'text-sm py-2.5 px-3',
                          isSuccess && 'bg-emerald-50 border-emerald-200 text-emerald-900',
                          isWarning && 'bg-amber-50 border-amber-200 text-amber-900'
                        )}
                      >
                        {isSuccess && <CheckCircle2 className="h-4 w-4 text-emerald-600" />}
                        {isWarning && <AlertTriangle className="h-4 w-4 text-amber-600" />}
                        {isError && <AlertCircle className="h-4 w-4" />}
                        <AlertDescription className="text-xs ml-1">
                          {warning}
                        </AlertDescription>
                      </Alert>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Unmatched Warning */}
            {unmatchedUsers.length > 0 && (
              <Alert variant="destructive" className="border-rose-200 bg-rose-50">
                <XCircle className="h-4 w-4 text-rose-600" />
                <AlertDescription className="text-sm text-rose-900">
                  <strong>{unmatchedUsers.length} participant(s) unmatched</strong>
                  <div className="mt-2 space-y-0.5">
                    {unmatchedUsers.slice(0, 3).map((user: any, index: number) => (
                      <p key={index} className="text-xs">
                        • {user.name}
                      </p>
                    ))}
                    {unmatchedUsers.length > 3 && (
                      <p className="text-xs font-medium">
                        +{unmatchedUsers.length - 3} more
                      </p>
                    )}
                  </div>
                </AlertDescription>
              </Alert>
            )}

            <Separator />

            {/* Groups Preview */}
            <div className="space-y-3">
              <p className="text-sm font-semibold text-gray-900">
                Matched Groups ({groups.length})
              </p>
              <div className="space-y-2.5">
                {groups.map((group, index) => (
                  <div
                    key={index}
                    className="rounded-lg border-2 border-gray-200 bg-white p-4 hover:border-brand/30 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-brand/10 flex items-center justify-center">
                          <span className="text-sm font-bold text-brand">
                            {index + 1}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-900">
                            Table {index + 1}
                          </p>
                          <p className="text-xs text-gray-500">
                            {group.size} members
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Badge
                          variant="outline"
                          className={cn(
                            'text-xs font-medium',
                            group.thresholdUsed >= 70
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : group.thresholdUsed >= 60
                              ? 'bg-blue-50 text-blue-700 border-blue-200'
                              : 'bg-amber-50 text-amber-700 border-amber-200'
                          )}
                        >
                          {group.thresholdUsed}% threshold
                        </Badge>
                        <Badge variant="outline" className="text-xs bg-gray-50 text-gray-700 border-gray-200">
                          {group.averageMatchScore.toFixed(0)}% avg
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="space-y-1.5">
                      {group.members.map((member: any, i: number) => (
                        <div key={i} className="flex items-center gap-2 text-xs py-1">
                          <div className="w-1.5 h-1.5 rounded-full bg-brand/40" />
                          <span className="text-gray-700 font-medium">{member.name}</span>
                          <span className="text-gray-400">•</span>
                          <span className="text-gray-500">{member.email}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </ScrollArea>

        <DialogFooter className="px-6 py-4 border-t bg-gray-50">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isConfirming}
            className="border-gray-300"
          >
            Cancel
          </Button>
          <Button 
            onClick={onConfirm} 
            disabled={isConfirming}
            className="bg-brand hover:bg-brand/90"
          >
            {isConfirming ? (
              <>
                <Sparkles className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Confirm & Save
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}