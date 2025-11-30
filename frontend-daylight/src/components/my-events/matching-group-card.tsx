'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Users, Sparkles, MapPin } from 'lucide-react';
import { MatchingGroup, MatchingStatus } from '@/types/matching.types';
import { cn } from '@/lib/utils';

interface MatchingGroupCardProps {
  group: MatchingGroup;
  compact?: boolean;
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

export function MatchingGroupCard({ group, compact = false }: MatchingGroupCardProps) {
  const statusStyle = statusConfig[group.status];

  if (compact) {
    return (
      <div className="p-4 rounded-lg border border-gray-200 bg-linear-to-br from-white to-gray-50/50">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-brand/10 flex items-center justify-center">
              <Users className="w-4 h-4 text-brand" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">
                Table {group.groupNumber}
              </p>
              <p className="text-xs text-gray-500">
                {group.groupSize} members
              </p>
            </div>
          </div>
          <Badge variant="outline" className={cn('text-xs', statusStyle.color)}>
            {statusStyle.label}
          </Badge>
        </div>

        {/* Members Grid */}
        <div className="flex flex-wrap gap-2">
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
                className="flex items-center gap-2 p-2 rounded-lg bg-white border border-gray-100 hover:border-brand/30 transition-colors"
              >
                <Avatar className="h-7 w-7 border-2 border-white shadow-sm">
                  {member.user.profilePicture ? (
                    <AvatarImage
                      src={member.user.profilePicture}
                      alt={member.user.firstName + ' ' + member.user.lastName}
                      crossOrigin="anonymous"
                      referrerPolicy="no-referrer"
                    />
                  ) : null}
                  <AvatarFallback className="bg-linear-to-br from-brand to-brand/80 text-white text-[10px] font-semibold">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <p className="text-xs font-medium text-gray-900 truncate max-w-[120px]">
                    {member.isYou ? 'You' : member.user.firstName + ' ' + member.user.lastName}
                  </p>
                  {member.user.archetype && (
                    <p className="text-[10px] text-gray-500 truncate">
                      {member.user.archetype.replace(/_/g, ' ')}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Match Score */}
        {/* <div className="mt-3 pt-3 border-t border-gray-200">
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-600">Group Compatibility</span>
            <div className="flex items-center gap-1">
              <Sparkles className={cn(
                'h-3 w-3',
                group.averageMatchScore >= 80 ? 'text-emerald-500' :
                group.averageMatchScore >= 70 ? 'text-blue-500' :
                'text-amber-500'
              )} />
              <span className="font-semibold text-gray-900">
                {group.averageMatchScore.toFixed(0)}%
              </span>
            </div>
          </div>
        </div> */}

        {group.tableNumber && (
          <div className="mt-2 flex items-center gap-1.5 text-xs text-gray-600">
            <MapPin className="h-3 w-3" />
            <span>{group.tableNumber}</span>
          </div>
        )}
      </div>
    );
  }

  // Full version (for modal/detail)
  return (
    <div className="p-5 rounded-xl border border-gray-200 bg-white space-y-4">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-brand/10 flex items-center justify-center">
            <span className="text-lg font-semibold text-brand">
              {group.groupNumber}
            </span>
          </div>
          <div>
            <h3 className="text-base font-semibold text-gray-900">
              Table {group.groupNumber}
            </h3>
            <p className="text-sm text-gray-600">
              {group.groupSize} members • {group.averageMatchScore.toFixed(0)}% compatibility
            </p>
          </div>
        </div>
        <Badge variant="outline" className={statusStyle.color}>
          {statusStyle.label}
        </Badge>
      </div>

      {/* Members List */}
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
              className={cn(
                'flex items-center gap-3 p-3 rounded-lg border transition-colors',
                member.isYou
                  ? 'bg-brand/5 border-brand/20'
                  : 'bg-gray-50 border-gray-100 hover:bg-gray-100'
              )}
            >
              <Avatar className="h-10 w-10 border-2 border-white shadow-sm">
                {member.user.profilePicture ? (
                  <AvatarImage
                    src={member.user.profilePicture}
                    alt={member.user.firstName + ' ' + member.user.lastName}
                    crossOrigin="anonymous"
                    referrerPolicy="no-referrer"
                  />
                ) : null}
                <AvatarFallback className="bg-linear-to-br from-brand to-brand/80 text-white text-xs font-semibold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {member.isYou ? 'You' : member.user.firstName + ' ' + member.user.lastName}
                  </p>
                  {member.isYou && (
                    <Badge variant="outline" className="bg-brand/10 text-brand border-brand/20 text-xs">
                      You
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

      {/* Footer Info */}
      <div className="pt-3 border-t border-gray-200 space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Average Match Score</span>
          <span className="font-semibold text-gray-900">
            {group.averageMatchScore.toFixed(0)}%
          </span>
        </div>
        {group.tableNumber && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Table Location</span>
            <span className="font-medium text-gray-900">{group.tableNumber}</span>
          </div>
        )}
      </div>
    </div>
  );
}