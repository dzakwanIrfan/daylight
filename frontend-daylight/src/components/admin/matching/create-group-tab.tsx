'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, FolderPlus, Info } from 'lucide-react';
import { useMatchingMutations } from '@/hooks/use-matching';
import { MatchingGroup } from '@/types/matching.types';

interface CreateGroupTabProps {
  eventId: string;
  existingGroups: MatchingGroup[];
}

export function CreateGroupTab({ eventId, existingGroups }: CreateGroupTabProps) {
  const [groupNumber, setGroupNumber] = useState('');
  const [tableNumber, setTableNumber] = useState('');
  const [venueName, setVenueName] = useState('');
  const [note, setNote] = useState('');

  const { createGroup } = useMatchingMutations(eventId);

  const existingNumbers = new Set(existingGroups.map((g) => g.groupNumber));
  const suggestedNumber = existingGroups.length > 0
    ? Math.max(...existingGroups.map((g) => g.groupNumber)) + 1
    : 1;

  const handleCreate = async () => {
    if (!groupNumber) return;

    const num = parseInt(groupNumber);
    if (isNaN(num) || num < 1) {
      return;
    }

    try {
      await createGroup.mutateAsync({
        groupNumber: num,
        tableNumber: tableNumber || undefined,
        venueName: venueName || undefined,
        note: note || undefined,
      });

      // Reset form
      setGroupNumber('');
      setTableNumber('');
      setVenueName('');
      setNote('');
    } catch (error) {
      // Error handled by mutation
    }
  };

  return (
    <div className="space-y-6">
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription className="text-sm">
          Create a new empty group to manually assign participants. You can add members 
          later from the "Assign Users" tab.
        </AlertDescription>
      </Alert>

      <Card className="p-5 border-gray-200">
        <div className="space-y-4">
          <div>
            <Label htmlFor="group-number">Group Number *</Label>
            <Input
              id="group-number"
              type="number"
              min="1"
              placeholder={`e.g., ${suggestedNumber}`}
              value={groupNumber}
              onChange={(e) => setGroupNumber(e.target.value)}
            />
            {groupNumber && existingNumbers.has(parseInt(groupNumber)) && (
              <p className="text-xs text-red-600 mt-1">
                ⚠ Group {groupNumber} already exists
              </p>
            )}
            {!groupNumber && existingGroups.length > 0 && (
              <p className="text-xs text-gray-600 mt-1">
                Suggested: {suggestedNumber}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="table-number">Table Number (Optional)</Label>
            <Input
              id="table-number"
              placeholder="e.g., A1, T-5, Table 3"
              value={tableNumber}
              onChange={(e) => setTableNumber(e.target.value)}
            />
            <p className="text-xs text-gray-600 mt-1">
              Physical table assignment at the venue
            </p>
          </div>

          <div>
            <Label htmlFor="venue-name">Venue Name (Optional)</Label>
            <Input
              id="venue-name"
              placeholder="e.g., Main Hall, Garden Area"
              value={venueName}
              onChange={(e) => setVenueName(e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="group-note">Note (Optional)</Label>
            <Textarea
              id="group-note"
              placeholder="Add any notes about this group..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
            />
          </div>

          <Button
            onClick={handleCreate}
            disabled={
              !groupNumber ||
              existingNumbers.has(parseInt(groupNumber)) ||
              createGroup.isPending
            }
            className="w-full bg-brand hover:bg-brand/90"
          >
            {createGroup.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <FolderPlus className="mr-2 h-4 w-4" />
                Create Group
              </>
            )}
          </Button>
        </div>
      </Card>

      {/* Existing Groups Preview */}
      {existingGroups.length > 0 && (
        <div className="space-y-2">
          <Label className="text-sm font-medium text-gray-700">
            Existing Groups
          </Label>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
            {existingGroups.map((group) => (
              <div
                key={group.id}
                className="p-3 rounded-lg border border-gray-200 bg-white text-center"
              >
                <p className="text-sm font-semibold text-gray-900">
                  Group {group.groupNumber}
                </p>
                <p className="text-xs text-gray-600 mt-0.5">
                  {group.groupSize} members
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}