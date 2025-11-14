'use client';

import { useState, useMemo } from 'react';
import { AdminLayout } from '@/components/admin/admin-layout';
import { DataTable } from '@/components/data-table/data-table';
import { DataTableSkeleton } from '@/components/data-table/data-table-skeleton';
import { columns } from '../../../components/admin/users/columns';
import { AdminUser, UserRole, AuthProvider, BulkActionType } from '@/types/admin.types';
import { Card } from '@/components/ui/card';
import { Users, UserCheck, UserX, Shield, Download, UserPlus, Trash2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CreateUserDialog } from '../../../components/admin/users/create-user-dialog';
import { toast } from 'sonner';
import { adminService } from '@/services/admin.service';
import { useAdminUsers } from '@/hooks/use-admin-users';
import { useAdminMutations } from '@/hooks/use-admin-mutations';

export default function AdminUsersPage() {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  // Fetch users using React Query
  const { data: usersResponse, isLoading, error } = useAdminUsers({ limit: 1000 });
  const users = usersResponse?.data || [];

  // Mutations
  const { bulkAction } = useAdminMutations();

  // Calculate stats
  const stats = useMemo(() => {
    if (!users.length) return { total: 0, active: 0, inactive: 0, admins: 0 };
    
    return {
      total: users.length,
      active: users.filter(u => u.isActive).length,
      inactive: users.filter(u => !u.isActive).length,
      admins: users.filter(u => u.role === UserRole.ADMIN).length,
    };
  }, [users]);

  const handleExport = async () => {
    try {
      setIsExporting(true);
      const exportUsers = await adminService.exportUsers({});
      
      const headers = ['Email', 'First Name', 'Last Name', 'Role', 'Provider', 'Status', 'Created At'];
      const csvContent = [
        headers.join(','),
        ...exportUsers.map(user => [
          user.email,
          user.firstName || '',
          user.lastName || '',
          user.role,
          user.provider,
          user.isActive ? 'Active' : 'Inactive',
          new Date(user.createdAt).toLocaleDateString(),
        ].join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `users-export-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);

      toast.success('Users exported successfully');
    } catch (error) {
      toast.error('Failed to export users');
    } finally {
      setIsExporting(false);
    }
  };

  const handleBulkDelete = async (selectedUsers: AdminUser[]) => {
    if (selectedUsers.length === 0) return;

    if (!confirm(`Are you sure you want to delete ${selectedUsers.length} user(s)? This action cannot be undone.`)) {
      return;
    }

    bulkAction.mutate({
      userIds: selectedUsers.map(u => u.id),
      action: BulkActionType.DELETE,
    });
  };

  const statsCards = [
    {
      title: 'Total Users',
      value: stats.total,
      icon: Users,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
    },
    {
      title: 'Active Users',
      value: stats.active,
      icon: UserCheck,
      color: 'text-green-600',
      bg: 'bg-green-50',
    },
    {
      title: 'Inactive Users',
      value: stats.inactive,
      icon: UserX,
      color: 'text-gray-600',
      bg: 'bg-gray-50',
    },
    {
      title: 'Admins',
      value: stats.admins,
      icon: Shield,
      color: 'text-brand',
      bg: 'bg-brand/10',
    },
  ];

  // Show error state
  if (error) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-[50vh]">
          <div className="text-center">
            <p className="text-red-600 mb-4">Failed to load users</p>
            <Button onClick={() => window.location.reload()}>Retry</Button>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-2xl md:text-3xl font-headline font-bold text-gray-900">
            User Management
          </h1>
          <p className="text-gray-600 mt-1">
            Manage all users, roles, and permissions
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {statsCards.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.title} className="p-6 bg-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      {stat.title}
                    </p>
                    <h3 className="text-2xl font-bold text-gray-900 mt-2">
                      {stat.value}
                    </h3>
                  </div>
                  <div className={`${stat.bg} ${stat.color} p-3 rounded-lg`}>
                    <Icon className="w-6 h-6" />
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Users Table */}
        <Card className="p-6 bg-white">
          {isLoading ? (
            <DataTableSkeleton
              columnCount={8}
              searchableColumnCount={1}
              filterableColumnCount={3}
              rowCount={10}
            />
          ) : (
            <DataTable
              columns={columns}
              data={users}
              searchableColumns={[
                {
                  id: 'email',
                  title: 'email',
                },
              ]}
              filterableColumns={[
                {
                  id: 'role',
                  title: 'Role',
                  options: [
                    { label: 'User', value: UserRole.USER },
                    { label: 'Admin', value: UserRole.ADMIN },
                  ],
                },
                {
                  id: 'provider',
                  title: 'Provider',
                  options: [
                    { label: 'Local', value: AuthProvider.LOCAL },
                    { label: 'Google', value: AuthProvider.GOOGLE },
                  ],
                },
                {
                  id: 'isActive',
                  title: 'Status',
                  options: [
                    { label: 'Active', value: 'true' },
                    { label: 'Inactive', value: 'false' },
                  ],
                },
              ]}
              deleteRowsAction={(selectedRows) => (
                selectedRows.length > 0 ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleBulkDelete(selectedRows)}
                    disabled={bulkAction.isPending}
                    className="h-10 text-red-600 hover:text-red-700"
                  >
                    {bulkAction.isPending ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="mr-2 h-4 w-4" />
                    )}
                    Delete ({selectedRows.length})
                  </Button>
                ) : null
              )}
              newRowAction={
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleExport}
                    disabled={isExporting}
                    className="h-10"
                  >
                    {isExporting ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Download className="mr-2 h-4 w-4" />
                    )}
                    Export
                  </Button>

                  <Button
                    size="sm"
                    onClick={() => setShowCreateDialog(true)}
                    className="h-10 bg-brand hover:bg-brand-dark border border-black text-white font-bold"
                  >
                    <UserPlus className="mr-2 h-4 w-4" />
                    Add User
                  </Button>
                </div>
              }
            />
          )}
        </Card>
      </div>

      <CreateUserDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
      />
    </AdminLayout>
  );
}