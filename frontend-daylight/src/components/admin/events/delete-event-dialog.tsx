'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Event } from '@/types/event.types';
import { Loader2, AlertTriangle } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { useAdminEventMutations } from '@/hooks/use-admin-events';
import { useState, useEffect } from 'react';

interface DeleteEventDialogProps {
  event: Event;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DeleteEventDialog({ event, open, onOpenChange }: DeleteEventDialogProps) {
  const [hardDelete, setHardDelete] = useState(false);
  const { deleteEvent } = useAdminEventMutations();

  useEffect(() => {
    if (!open) {
      setHardDelete(false);
    }
  }, [open]);

  useEffect(() => {
    if (deleteEvent.isSuccess) {
      onOpenChange(false);
    }
  }, [deleteEvent.isSuccess, onOpenChange]);

  const handleDelete = () => {
    deleteEvent.mutate({ id: event.id, hardDelete });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] bg-white">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="h-5 w-5" />
            Delete Event
          </DialogTitle>
          <DialogDescription>
            This action will {hardDelete ? 'permanently delete' : 'deactivate and cancel'} the event.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="p-4 bg-red-50 rounded-lg border border-red-200">
            <p className="text-sm font-medium text-gray-900">{event.title}</p>
            <p className="text-xs text-gray-600 mt-1">{event.venue} • {event.city}</p>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="hardDelete"
              checked={hardDelete}
              onCheckedChange={(checked) => setHardDelete(checked as boolean)}
            />
            <Label
              htmlFor="hardDelete"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Permanently delete (cannot be undone)
            </Label>
          </div>

          {hardDelete && (
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-xs text-yellow-800">
                ⚠️ Warning: This will permanently remove all event data and cannot be recovered.
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={deleteEvent.isPending}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={deleteEvent.isPending}
          >
            {deleteEvent.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {hardDelete ? 'Delete Permanently' : 'Deactivate & Cancel'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}