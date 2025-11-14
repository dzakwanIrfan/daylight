'use client';

import { Table } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { Download, Trash2, UserPlus } from 'lucide-react';
import { AdminUser } from '@/types/admin.types';
import { useState } from 'react';
import { CreateUserDialog } from './create-user-dialog';
import { DeleteUsersDialog } from './delete-users-dialog';
import { adminService } from '@/services/admin.service';
import { toast } from 'sonner';

interface UsersToolbarActionsProps {
  table: Table<AdminUser>;
}

export function UsersToolbarActions({ table }: UsersToolbarActionsProps) {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const selectedRows = table.getFilteredSelectedRowModel().rows;
  const hasSelection = selectedRows.length > 0;

  const handleExport = async () => {
    try {
      setIsExporting(true);
      const users = await adminService.exportUsers({});
      
      // Convert to CSV
      const headers = ['Email', 'First Name', 'Last Name', 'Role', 'Provider', 'Status', 'Created At'];
      const csvContent = [
        headers.join(','),
        ...users.map(user => [
          user.email,
          user.firstName || '',
          user.lastName || '',
          user.role,
          user.provider,
          user.isActive ? 'Active' : 'Inactive',
          new Date(user.createdAt).toLocaleDateString(),
        ].join(','))
      ].join('\n');

      // Download
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `users-export-${new Date().toISOString()}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);

      toast.success('Users exported successfully');
    } catch (error) {
      toast.error('Failed to export users');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <>
      <div className="flex items-center gap-2">
        {hasSelection && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowDeleteDialog(true)}
            className="h-10 text-red-600 hover:text-red-700"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete ({selectedRows.length})
          </Button>
        )}

        <Button
          variant="outline"
          size="sm"
          onClick={handleExport}
          disabled={isExporting}
          className="h-10"
        >
          <Download className="mr-2 h-4 w-4" />
          Export
        </Button>

        <Button
          size="sm"
          onClick={() => setShowCreateDialog(true)}
          className="h-10"
        >
          <UserPlus className="mr-2 h-4 w-4" />
          Add User
        </Button>
      </div>

      <CreateUserDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
      />

      {hasSelection && (
        <DeleteUsersDialog
          users={selectedRows.map(row => row.original)}
          open={showDeleteDialog}
          onOpenChange={setShowDeleteDialog}
        />
      )}
    </>
  );
}