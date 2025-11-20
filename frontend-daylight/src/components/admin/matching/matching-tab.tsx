'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Users, RefreshCw, Eye, AlertCircle, History, UserCog } from 'lucide-react';
import { useMatchingResults, useMatchingMutations, useMatchingHistory } from '@/hooks/use-matching';
import { MatchingGroupCard } from './matching-group-card';
import { MatchingPreviewDialog } from './matching-preview-dialog';
import { MatchingHistoryDialog } from './matching-history-dialog';
import { ManualAssignmentDialog } from './manual-assignment-dialog';
import { MatchingPreviewResponse } from '@/types/matching.types';

interface MatchingTabProps {
  eventId: string;
}

export function MatchingTab({ eventId }: MatchingTabProps) {
  const [previewData, setPreviewData] = useState<MatchingPreviewResponse | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showManualAssignment, setShowManualAssignment] = useState(false);

  const { data: matchingData, isLoading, error } = useMatchingResults(eventId);
  const { data: historyData, isLoading: historyLoading } = useMatchingHistory(eventId);
  const { triggerMatching, previewMatching } = useMatchingMutations(eventId);

  const handlePreview = async () => {
    try {
      const result = await previewMatching.mutateAsync();
      setPreviewData(result);
      setShowPreview(true);
    } catch (error) {
      // Error handled by mutation
    }
  };

  const handleConfirmMatching = async () => {
    try {
      await triggerMatching.mutateAsync();
      setShowPreview(false);
      setPreviewData(null);
    } catch (error) {
      // Error handled by mutation
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-brand" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive" className="border-rose-200 bg-rose-50">
        <AlertCircle className="h-4 w-4 text-rose-600" />
        <AlertDescription className="text-rose-900">
          {(error as any)?.response?.data?.message || 'Failed to load matching results'}
        </AlertDescription>
      </Alert>
    );
  }

  const hasResults = matchingData && matchingData.totalGroups > 0;

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <Card className="border-gray-200 bg-white">
        <div className="p-6 space-y-4">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <h3 className="text-lg font-semibold text-gray-900">
                Group Matching
              </h3>
              <p className="text-sm text-gray-600">
                {hasResults
                  ? `${matchingData.totalGroups} ${matchingData.totalGroups === 1 ? 'group' : 'groups'} matched`
                  : 'No matching results yet'}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowHistory(true)}
                disabled={historyLoading}
                className="border-gray-300 hover:bg-gray-50"
              >
                <History className="mr-2 h-4 w-4" />
                History
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowManualAssignment(true)}
                className="border-brand/30 hover:bg-brand/5 text-brand"
              >
                <UserCog className="mr-2 h-4 w-4" />
                Manual Assignment
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={handlePreview}
                disabled={previewMatching.isPending}
                className="border-gray-300 hover:bg-gray-50"
              >
                {previewMatching.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Eye className="mr-2 h-4 w-4" />
                    Preview
                  </>
                )}
              </Button>

              <Button
                onClick={() => triggerMatching.mutate()}
                disabled={triggerMatching.isPending}
                className="bg-brand hover:bg-brand/90"
              >
                {triggerMatching.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Matching...
                  </>
                ) : (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    {hasResults ? 'Re-match' : 'Start Matching'}
                  </>
                )}
              </Button>
            </div>
          </div>

          <Alert className="border-blue-200 bg-blue-50">
            <Users className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-sm text-blue-900">
              <strong>Multi-Pass Strategy:</strong> Algorithm tries thresholds from 70% → 0% 
              with 10 seed attempts per level. Use <strong>Manual Assignment</strong> to force 
              assign unmatched users or modify groups.
            </AlertDescription>
          </Alert>
        </div>
      </Card>

      {/* Results Grid */}
      {hasResults ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {matchingData.groups.map((group) => (
            <MatchingGroupCard key={group.id} group={group} />
          ))}
        </div>
      ) : (
        <Card className="border-gray-200 bg-white">
          <div className="p-12 text-center">
            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
              <Users className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-base font-medium text-gray-900 mb-2">
              No Matching Results
            </h3>
            <p className="text-sm text-gray-600 mb-6 max-w-md mx-auto">
              Start matching to create compatible groups based on personality profiles, 
              or use manual assignment to create groups manually.
            </p>
            <div className="flex items-center justify-center gap-3">
              <Button
                variant="outline"
                onClick={() => setShowManualAssignment(true)}
              >
                <UserCog className="mr-2 h-4 w-4" />
                Manual Assignment
              </Button>
              <Button onClick={() => triggerMatching.mutate()}>
                Start Auto Matching
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Dialogs */}
      <MatchingPreviewDialog
        open={showPreview}
        onOpenChange={setShowPreview}
        previewData={previewData}
        onConfirm={handleConfirmMatching}
        isConfirming={triggerMatching.isPending}
      />

      <MatchingHistoryDialog
        open={showHistory}
        onOpenChange={setShowHistory}
        history={historyData?.history || []}
        isLoading={historyLoading}
      />

      <ManualAssignmentDialog
        open={showManualAssignment}
        onOpenChange={setShowManualAssignment}
        eventId={eventId}
        groups={matchingData?.groups || []}
      />
    </div>
  );
}