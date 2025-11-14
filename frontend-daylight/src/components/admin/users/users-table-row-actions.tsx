'use client';

import { Row } from '@tanstack/react-table';
import { MoreHorizontal, Pencil, Trash2, Eye, KeyRound, UserX, UserCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { AdminUser } from '@/types/admin.types';
import { useState } from 'react';
import { UserDetailsDialog } from './user-details-dialog';
import { EditUserDialog } from './edit-user-dialog';
import { DeleteUserDialog } from './delete-user-dialog';
import { ResetPasswordDialog } from './reset-password-dialog';

interface UsersTableRowActionsProps {
  row: Row<AdminUser>;
}

export function UsersTableRowActions({ row }: UsersTableRowActionsProps) {
  const user = row.original;
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showResetPasswordDialog, setShowResetPasswordDialog] = useState(false);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            aria-label="Open menu"
            variant="ghost"
            className="flex h-8 w-8 p-0 data-[state=open]:bg-muted"
          >
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-[200px] glass-card">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuSeparator />
          
          <DropdownMenuItem onClick={() => setShowDetailsDialog(true)}>
            <Eye className="mr-2 h-4 w-4" />
            View Details
          </DropdownMenuItem>
          
          <DropdownMenuItem onClick={() => setShowEditDialog(true)}>
            <Pencil className="mr-2 h-4 w-4" />
            Edit User
          </DropdownMenuItem>
          
          {user.provider === 'LOCAL' && (
            <DropdownMenuItem onClick={() => setShowResetPasswordDialog(true)}>
              <KeyRound className="mr-2 h-4 w-4" />
              Reset Password
            </DropdownMenuItem>
          )}
          
          <DropdownMenuSeparator />
          
          <DropdownMenuItem 
            onClick={() => setShowDeleteDialog(true)}
            className="text-red-600 focus:text-red-600"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete User
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <UserDetailsDialog
        user={user}
        open={showDetailsDialog}
        onOpenChange={setShowDetailsDialog}
      />
      
      <EditUserDialog
        user={user}
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
      />
      
      <DeleteUserDialog
        user={user}
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
      />
      
      {user.provider === 'LOCAL' && (
        <ResetPasswordDialog
          user={user}
          open={showResetPasswordDialog}
          onOpenChange={setShowResetPasswordDialog}
        />
      )}
    </>
  );
}