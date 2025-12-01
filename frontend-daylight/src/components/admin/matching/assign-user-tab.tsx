'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2, UserPlus, Search, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useUnassignedParticipants, useMatchingMutations } from '@/hooks/use-matching';
import { MatchingGroup } from '@/types/matching.types';
import { cn } from '@/lib/utils';

interface AssignUserTabProps {
  eventId: string;
  groups: MatchingGroup[];
}

export function AssignUserTab({ eventId, groups }: AssignUserTabProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [selectedTransactionId, setSelectedTransactionId] = useState<string | null>(null);
  const [targetGroupNumber, setTargetGroupNumber] = useState<string>('');
  const [note, setNote] = useState('');

  const { data: unassignedData, isLoading } = useUnassignedParticipants(eventId);
  const { assignUser } = useMatchingMutations(eventId);

  const unassigned = unassignedData?.participants || [];

  const filteredUnassigned = unassigned.filter(
    (p) =>
      p.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedUser = unassigned.find((p) => p.userId === selectedUserId);

  const handleAssign = async () => {
    if (!selectedUserId || !selectedTransactionId || !targetGroupNumber) return;

    try {
      await assignUser.mutateAsync({
        userId: selectedUserId,
        transactionId: selectedTransactionId,
        targetGroupNumber: parseInt(targetGroupNumber),
        note: note || undefined,
      });

      // Reset form
      setSelectedUserId(null);
      setSelectedTransactionId(null);
      setTargetGroupNumber('');
      setNote('');
    } catch (error) {
      // Error handled by mutation
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-brand" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Info Alert */}
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription className="text-sm">
          <strong>{unassigned.length} unassigned participant(s)</strong> found. 
          Select a user and assign them to a group.
        </AlertDescription>
      </Alert>

      {unassigned.length === 0 ? (
        <Card className="p-8 text-center">
          <CheckCircle2 className="h-12 w-12 text-emerald-500 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-gray-900 mb-1">
            All Participants Assigned
          </h3>
          <p className="text-sm text-gray-600">
            There are no unassigned participants for this event
          </p>
        </Card>
      ) : (
        <>
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Unassigned List */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700">
              Select Participant
            </Label>
            <div className="grid grid-cols-1 gap-2 max-h-[300px] overflow-y-auto border border-gray-200 rounded-lg p-2">
              {filteredUnassigned.map((participant) => {
                const initials = [participant.firstName, participant.lastName]
                  .filter(Boolean)
                  .map((n) => n[0])
                  .join('')
                  .toUpperCase()
                  .slice(0, 2);

                const isSelected = selectedUserId === participant.userId;

                return (
                  <button
                    key={participant.userId}
                    onClick={() => {
                      setSelectedUserId(participant.userId);
                      setSelectedTransactionId(participant.transactionId);
                    }}
                    className={cn(
                      'flex items-center gap-3 p-3 rounded-lg border-2 transition-all text-left',
                      isSelected
                        ? 'border-brand bg-brand/5'
                        : 'border-gray-200 hover:border-gray-300 bg-white'
                    )}
                  >
                    <Avatar className="h-10 w-10 shrink-0">
                      <AvatarFallback className="bg-linear-to-br from-brand to-brand/80 text-white text-xs font-semibold">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {participant.firstName} {participant.lastName}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {participant.email}
                      </p>
                    </div>
                    {isSelected && (
                      <CheckCircle2 className="h-5 w-5 text-brand shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Assignment Form */}
          {selectedUser && (
            <Card className="p-4 border-brand/30 bg-brand/5">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="target-group">Target Group *</Label>
                  <Select
                    value={targetGroupNumber}
                    onValueChange={setTargetGroupNumber}
                  >
                    <SelectTrigger id="target-group">
                      <SelectValue placeholder="Select a group" />
                    </SelectTrigger>
                    <SelectContent>
                      {groups.map((group) => (
                        <SelectItem
                          key={group.id}
                          value={group.groupNumber.toString()}
                          disabled={group.groupSize >= 5}
                        >
                          <div className="flex items-center justify-between w-full">
                            <span>Group {group.groupNumber}</span>
                            <div className="flex items-center gap-2 ml-4">
                              <Badge
                                variant="outline"
                                className={cn(
                                  'text-xs',
                                  group.groupSize >= 5
                                    ? 'bg-red-50 text-red-700 border-red-200'
                                    : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                )}
                              >
                                {group.groupSize}/5
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                {group.averageMatchScore.toFixed(0)}%
                              </Badge>
                            </div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-gray-600 mt-1">
                    Groups with full capacity (5/5) are disabled
                  </p>
                </div>

                <div>
                  <Label htmlFor="note">Note (Optional)</Label>
                  <Textarea
                    id="note"
                    placeholder="Add a note about this assignment..."
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    rows={2}
                  />
                </div>

                <Button
                  onClick={handleAssign}
                  disabled={!targetGroupNumber || assignUser.isPending}
                  className="w-full bg-brand hover:bg-brand/90"
                >
                  {assignUser.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Assigning...
                    </>
                  ) : (
                    <>
                      <UserPlus className="mr-2 h-4 w-4" />
                      Assign to Group
                    </>
                  )}
                </Button>
              </div>
            </Card>
          )}
        </>
      )}
    </div>
  );
}