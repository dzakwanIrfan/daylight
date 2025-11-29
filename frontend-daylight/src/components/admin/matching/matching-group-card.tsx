'use client';

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Users, TrendingUp, Sparkles, UserCog } from 'lucide-react';
import { MatchingGroup, MatchingStatus } from '@/types/matching.types';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

interface MatchingGroupCardProps {
  group: MatchingGroup;
}

const statusConfig: Record<
  MatchingStatus,
  { color: string; label: string }
> = {
  PENDING: { color: 'bg-amber-50 text-amber-700 border-amber-200', label: 'Pending' },
  MATCHED: { color: 'bg-emerald-50 text-emerald-700 border-emerald-200', label: 'Matched' },
  PARTIALLY_MATCHED: { color: 'bg-yellow-50 text-yellow-700 border-yellow-200', label: 'Partial' },
  NO_MATCH: { color: 'bg-rose-50 text-rose-700 border-rose-200', label: 'No Match' },
  CONFIRMED: { color: 'bg-blue-50 text-blue-700 border-blue-200', label: 'Confirmed' },
  CANCELLED: { color: 'bg-gray-50 text-gray-700 border-gray-200', label: 'Cancelled' },
};

export function MatchingGroupCard({ group }: MatchingGroupCardProps) {
  const statusStyle = statusConfig[group.status];
  const hasManualMembers = group.members.some((m) => m.isManuallyAssigned);

  return (
    <Card className="group relative overflow-hidden border-gray-200 hover:border-brand/30 transition-all duration-300 hover:shadow-lg">
      {/* Decorative gradient */}
      <div className="absolute inset-0 bg-linear-to-br from-brand/2 to-transparent pointer-events-none" />
      
      <div className="relative p-6 space-y-5">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-brand/10 flex items-center justify-center">
                <span className="text-lg font-semibold text-brand">
                  {group.groupNumber}
                </span>
              </div>
              <div>
                <h3 className="text-base font-semibold text-gray-900">
                  Table {group.groupNumber}
                </h3>
                {group.tableNumber && (
                  <p className="text-xs text-gray-500">
                    {group.tableNumber}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-col items-end gap-1.5">
            <Badge variant="outline" className={cn('text-xs font-medium', statusStyle.color)}>
              {statusStyle.label}
            </Badge>
            <div className="flex items-center gap-1 text-xs">
              <Sparkles className={cn(
                'h-3 w-3',
                group.thresholdUsed >= 70 ? 'text-emerald-500' :
                group.thresholdUsed >= 60 ? 'text-blue-500' :
                'text-amber-500'
              )} />
              <span className="text-gray-600 font-medium">
                {group.thresholdUsed}% match
              </span>
            </div>
            {group.hasManualChanges && (
              <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200 text-xs">
                <UserCog className="h-3 w-3 mr-1" />
                Modified
              </Badge>
            )}
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-3">
          <div className="text-center p-3 rounded-xl bg-gray-50 border border-gray-100">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Users className="h-3.5 w-3.5 text-gray-500" />
            </div>
            <p className="text-lg font-bold text-gray-900">{group.groupSize}</p>
            <p className="text-[10px] uppercase tracking-wide text-gray-500 font-medium">
              Members
            </p>
          </div>

          <div className="text-center p-3 rounded-xl bg-emerald-50 border border-emerald-100">
            <div className="flex items-center justify-center gap-1 mb-1">
              <TrendingUp className="h-3.5 w-3.5 text-emerald-600" />
            </div>
            <p className="text-lg font-bold text-emerald-700">
              {group.averageMatchScore.toFixed(0)}%
            </p>
            <p className="text-[10px] uppercase tracking-wide text-emerald-600 font-medium">
              Avg Score
            </p>
          </div>

          <div className="text-center p-3 rounded-xl bg-blue-50 border border-blue-100">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Sparkles className="h-3.5 w-3.5 text-blue-600" />
            </div>
            <p className="text-lg font-bold text-blue-700">
              {group.minMatchScore.toFixed(0)}%
            </p>
            <p className="text-[10px] uppercase tracking-wide text-blue-600 font-medium">
              Min Score
            </p>
          </div>
        </div>

        <Separator />

        {/* Members List */}
        <div className="space-y-2">
          <p className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
            Group Members
          </p>
          <div className="space-y-2">
            {group.members.map((member) => {
              const initials = [member.user.firstName, member.user.lastName]
                .filter(Boolean)
                .map((n) => n[0])
                .join('')
                .toUpperCase()
                .slice(0, 2);

              return (
                <div
                  key={member.id}
                  className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Avatar className="h-9 w-9 shrink-0 border-2 border-white shadow-sm">
                    {member.user.profilePicture ? (
                      <AvatarImage
                        src={member.user.profilePicture}
                        alt={`${member.user.firstName} ${member.user.lastName}`}
                        crossOrigin="anonymous"
                        referrerPolicy="no-referrer"
                      />
                    ) : null}
                    <AvatarFallback className="bg-linear-to-br from-brand to-brand/80 text-white text-[11px] font-semibold">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {[member.user.firstName, member.user.lastName].filter(Boolean).join(' ')}
                      </p>
                      {member.isManuallyAssigned && (
                        <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200 text-[10px] px-1.5 py-0">
                          Manual
                        </Badge>
                      )}
                    </div>
                    {member.user.archetype && (
                      <p className="text-xs text-gray-500 truncate">
                        {member.user.archetype.replace(/_/g, ' ')}
                      </p>
                    )}
                  </div>

                  {member.isConfirmed && (
                    <div className="shrink-0">
                      <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center">
                        <svg className="w-3.5 h-3.5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Last Modified Info */}
        {group.hasManualChanges && group.lastModifiedAt && (
          <div className="pt-3 border-t border-gray-200">
            <p className="text-xs text-gray-500">
              Last modified: {format(new Date(group.lastModifiedAt), 'dd MMM yyyy, HH:mm')}
            </p>
          </div>
        )}

        {/* Compatibility Details - Collapsible */}
        <details className="group/details">
          <summary className="cursor-pointer text-xs font-medium text-gray-600 hover:text-brand transition-colors flex items-center gap-1.5 py-2">
            <svg className="w-4 h-4 transition-transform group-open/details:rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            <span>View compatibility scores</span>
          </summary>
          
          <div className="mt-3 space-y-2 pl-5 border-l-2 border-gray-100">
            {group.members.map((member1) => {
              const scores = Object.entries(member1.matchScores);
              if (scores.length === 0) return null;

              return (
                <div key={member1.id} className="space-y-1.5">
                  <p className="text-xs font-medium text-gray-700">
                    {[member1.user.firstName, member1.user.lastName].filter(Boolean).join(' ')}
                  </p>
                  <div className="space-y-1 pl-3">
                    {scores.map(([userId, score]) => {
                      const member2 = group.members.find((m) => m.userId === userId);
                      if (!member2) return null;

                      return (
                        <div
                          key={userId}
                          className="flex items-center justify-between text-xs"
                        >
                          <span className="text-gray-600">
                            → {[member2.user.firstName, member2.user.lastName].filter(Boolean).join(' ')}
                          </span>
                          <span className={cn(
                            'font-semibold px-2 py-0.5 rounded',
                            score >= 80 ? 'text-emerald-700 bg-emerald-50' :
                            score >= 70 ? 'text-blue-700 bg-blue-50' :
                            score >= 60 ? 'text-amber-700 bg-amber-50' :
                            'text-orange-700 bg-orange-50'
                          )}>
                            {score.toFixed(0)}%
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </details>
      </div>
    </Card>
  );
}