'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AdminUser, BulkActionType } from '@/types/admin.types';
import { adminService } from '@/services/admin.service';
import { toast } from 'sonner';
import { useState } from 'react';
import { Loader2, AlertTriangle } from 'lucide-react';

interface DeleteUsersDialogProps {
  users: AdminUser[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DeleteUsersDialog({ users, open, onOpenChange }: DeleteUsersDialogProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleDelete = async () => {
    try {
      setIsLoading(true);
      await adminService.bulkAction({
        userIds: users.map(u => u.id),
        action: BulkActionType.DELETE,
      });
      
      toast.success(`${users.length} user(s) deleted successfully`);
      onOpenChange(false);
      window.location.reload(); // Refresh data
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete users');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] glass-card">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="h-5 w-5" />
            Delete Multiple Users
          </DialogTitle>
          <DialogDescription>
            This action will permanently delete {users.length} user(s) and cannot be undone.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="max-h-48 overflow-y-auto space-y-2">
            {users.map((user) => (
              <div key={user.id} className="p-3 bg-red-50 rounded-lg border border-red-200">
                <p className="text-sm font-medium text-gray-900">
                  {user.firstName && user.lastName 
                    ? `${user.firstName} ${user.lastName}`
                    : user.email}
                </p>
                <p className="text-xs text-gray-600">{user.email}</p>
              </div>
            ))}
          </div>

          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-xs text-yellow-800">
              ⚠️ Warning: This will permanently remove all user data including persona results.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={isLoading}
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Delete {users.length} User(s)
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}