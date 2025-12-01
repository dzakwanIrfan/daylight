'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { MoreVertical, MoveRight, UserMinus, AlertTriangle, Sparkles } from 'lucide-react';
import { MatchingGroup } from '@/types/matching.types';
import { useMatchingMutations } from '@/hooks/use-matching';
import { cn } from '@/lib/utils';

interface ManageGroupsTabProps {
  eventId: string;
  groups: MatchingGroup[];
}

export function ManageGroupsTab({ eventId, groups }: ManageGroupsTabProps) {
  const [moveDialogOpen, setMoveDialogOpen] = useState(false);
  const [removeDialogOpen, setRemoveDialogOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<{
    userId: string;
    name: string;
    groupId: string;
    groupNumber: number;
  } | null>(null);
  const [targetGroupId, setTargetGroupId] = useState<string>('');

  const { moveUser, removeUser } = useMatchingMutations(eventId);

  const handleMoveClick = (
    userId: string,
    name: string,
    groupId: string,
    groupNumber: number
  ) => {
    setSelectedMember({ userId, name, groupId, groupNumber });
    setMoveDialogOpen(true);
  };

  const handleRemoveClick = (
    userId: string,
    name: string,
    groupId: string,
    groupNumber: number
  ) => {
    setSelectedMember({ userId, name, groupId, groupNumber });
    setRemoveDialogOpen(true);
  };

  const handleMove = async () => {
    if (!selectedMember || !targetGroupId) return;

    try {
      await moveUser.mutateAsync({
        userId: selectedMember.userId,
        fromGroupId: selectedMember.groupId,
        toGroupId: targetGroupId,
      });
      setMoveDialogOpen(false);
      setSelectedMember(null);
      setTargetGroupId('');
    } catch (error) {
      // Error handled by mutation
    }
  };

  const handleRemove = async () => {
    if (!selectedMember) return;

    try {
      await removeUser.mutateAsync({
        userId: selectedMember.userId,
        groupId: selectedMember.groupId,
      });
      setRemoveDialogOpen(false);
      setSelectedMember(null);
    } catch (error) {
      // Error handled by mutation
    }
  };

  if (groups.length === 0) {
    return (
      <Card className="p-8 text-center">
        <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-3" />
        <h3 className="text-base font-semibold text-gray-900 mb-1">
          No Groups Yet
        </h3>
        <p className="text-sm text-gray-600">
          Run matching first or create a manual group
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {groups.map((group) => (
        <Card key={group.id} className="p-5 border-gray-200">
          <div className="space-y-4">
            {/* Group Header */}
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-base font-semibold text-gray-900">
                    Table {group.groupNumber}
                  </h3>
                  {group.hasManualChanges && (
                    <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 text-xs">
                      Modified
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-3 text-xs text-gray-600">
                  <span>{group.groupSize} members</span>
                  <span>•</span>
                  <div className="flex items-center gap-1">
                    <Sparkles className="h-3 w-3" />
                    <span>{group.averageMatchScore.toFixed(0)}% avg match</span>
                  </div>
                </div>
              </div>
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
                    className="flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <Avatar className="h-9 w-9 shrink-0">
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
                            {[member.user.firstName, member.user.lastName].filter(Boolean).join(' ')}
                          </p>
                          {member.isManuallyAssigned && (
                            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 text-xs">
                              Manual
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 truncate">
                          {member.user.email}
                        </p>
                      </div>
                    </div>

                    {/* Actions */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() =>
                            handleMoveClick(
                              member.userId,
                              member.user.firstName + ' ' + member.user.lastName,
                              group.id,
                              group.groupNumber
                            )
                          }
                        >
                          <MoveRight className="mr-2 h-4 w-4" />
                          Move to Another Group
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() =>
                            handleRemoveClick(
                              member.userId,
                              member.user.firstName + ' ' + member.user.lastName,
                              group.id,
                              group.groupNumber
                            )
                          }
                          className="text-red-600"
                        >
                          <UserMinus className="mr-2 h-4 w-4" />
                          Remove from Group
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                );
              })}
            </div>
          </div>
        </Card>
      ))}

      {/* Move Dialog */}
      <AlertDialog open={moveDialogOpen} onOpenChange={setMoveDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Move Participant</AlertDialogTitle>
            <AlertDialogDescription>
              Move <strong>{selectedMember?.name}</strong> from Group{' '}
              {selectedMember?.groupNumber} to another group
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="py-4">
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Select Target Group
            </label>
            <div className="space-y-2">
              {groups
                .filter((g) => g.id !== selectedMember?.groupId && g.groupSize < 5)
                .map((g) => (
                  <button
                    key={g.id}
                    onClick={() => setTargetGroupId(g.id)}
                    className={cn(
                      'w-full flex items-center justify-between p-3 rounded-lg border-2 transition-colors',
                      targetGroupId === g.id
                        ? 'border-brand bg-brand/5'
                        : 'border-gray-200 hover:border-gray-300'
                    )}
                  >
                    <span className="font-medium text-gray-900">
                      Table {g.groupNumber}
                    </span>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {g.groupSize}/5
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {g.averageMatchScore.toFixed(0)}%
                      </Badge>
                    </div>
                  </button>
                ))}
            </div>
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleMove}
              disabled={!targetGroupId || moveUser.isPending}
              className="bg-brand hover:bg-brand/90"
            >
              {moveUser.isPending ? 'Moving...' : 'Move'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Remove Dialog */}
      <AlertDialog open={removeDialogOpen} onOpenChange={setRemoveDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Participant</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove <strong>{selectedMember?.name}</strong> from
              Group {selectedMember?.groupNumber}? They will become unassigned.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRemove}
              disabled={removeUser.isPending}
              className="bg-red-600 hover:bg-red-700"
            >
              {removeUser.isPending ? 'Removing...' : 'Remove'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}