'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AdminUser } from '@/types/admin.types';
import { Loader2, AlertTriangle } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { useAdminMutations } from '@/hooks/use-admin-mutations';
import { useState, useEffect } from 'react';

interface DeleteUserDialogProps {
  user: AdminUser;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DeleteUserDialog({ user, open, onOpenChange }: DeleteUserDialogProps) {
  const [hardDelete, setHardDelete] = useState(false);
  const { deleteUser } = useAdminMutations();

  // Reset hardDelete when dialog closes
  useEffect(() => {
    if (!open) {
      setHardDelete(false);
    }
  }, [open]);

  // Close dialog on success
  useEffect(() => {
    if (deleteUser.isSuccess) {
      onOpenChange(false);
    }
  }, [deleteUser.isSuccess, onOpenChange]);

  const handleDelete = () => {
    deleteUser.mutate({ id: user.id, hardDelete });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] glass-card">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="h-5 w-5" />
            Delete User
          </DialogTitle>
          <DialogDescription>
            This action will {hardDelete ? 'permanently delete' : 'deactivate'} the user.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="p-4 bg-red-50 rounded-lg border border-red-200">
            <p className="text-sm font-medium text-gray-900">
              {user.firstName && user.lastName 
                ? `${user.firstName} ${user.lastName}`
                : user.email}
            </p>
            <p className="text-xs text-gray-600 mt-1">{user.email}</p>
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
                ⚠️ Warning: This will permanently remove all user data including persona results and cannot be recovered.
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={deleteUser.isPending}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={deleteUser.isPending}
          >
            {deleteUser.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {hardDelete ? 'Delete Permanently' : 'Deactivate'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}