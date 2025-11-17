'use client';

import { useState, useMemo } from 'react';
import { AdminLayout } from '@/components/admin/admin-layout';
import { DataTable } from '@/components/data-table/data-table';
import { DataTableSkeleton } from '@/components/data-table/data-table-skeleton';
import { columns } from '@/components/admin/subscriptions/columns';
import type { AdminSubscription } from '@/types/admin-subscription.types';
import { SubscriptionStatus } from '@/types/subscription.types';
import { Card } from '@/components/ui/card';
import {
  CreditCard,
  CheckCircle,
  XCircle,
  Clock,
  Download,
  Loader2,
  Ban,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import {
  useAdminSubscriptions,
  useSubscriptionStats,
  useSubscriptionBulkActions,
} from '@/hooks/use-admin-subscriptions';
import { BulkSubscriptionActionType } from '@/types/admin-subscription.types';
import { subscriptionService } from '@/services/subscription.service';

export default function AdminSubscriptionsPage() {
  const [isExporting, setIsExporting] = useState(false);

  // Fetch subscriptions
  const { data: subscriptionsResponse, isLoading, error } = useAdminSubscriptions({
    limit: 1000,
  });
  const subscriptions = subscriptionsResponse?.data || [];

  // Fetch stats
  const { data: statsResponse } = useSubscriptionStats();
  const stats = statsResponse?.data;

  // Mutations
  const bulkAction = useSubscriptionBulkActions();

  const handleExport = async () => {
    try {
      setIsExporting(true);
      const exportData = await subscriptionService.exportSubscriptions({});

      const headers = [
        'User Email',
        'User Name',
        'Plan',
        'Status',
        'Amount',
        'Start Date',
        'End Date',
        'Created At',
      ];

      const csvContent = [
        headers.join(','),
        ...exportData.map((sub) => {
          const userName =
            sub.user.firstName && sub.user.lastName
              ? `${sub.user.firstName} ${sub.user.lastName}`
              : '';
          return [
            sub.user.email,
            userName,
            sub.plan.name,
            sub.status,
            sub.plan.price,
            sub.startDate || '',
            sub.endDate || '',
            new Date(sub.createdAt).toLocaleDateString(),
          ].join(',');
        }),
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `subscriptions-export-${
        new Date().toISOString().split('T')[0]
      }.csv`;
      a.click();
      window.URL.revokeObjectURL(url);

      toast.success('Subscriptions exported successfully');
    } catch (error) {
      toast.error('Failed to export subscriptions');
    } finally {
      setIsExporting(false);
    }
  };

  const handleBulkCancel = async (selectedSubscriptions: AdminSubscription[]) => {
    if (selectedSubscriptions.length === 0) return;

    if (
      !confirm(
        `Are you sure you want to cancel ${selectedSubscriptions.length} subscription(s)?`
      )
    ) {
      return;
    }

    bulkAction.mutate({
      subscriptionIds: selectedSubscriptions.map((s) => s.id),
      action: BulkSubscriptionActionType.CANCEL,
    });
  };

  const statsCards = [
    {
      title: 'Total Subscriptions',
      value: stats?.overview.totalSubscriptions || 0,
      icon: CreditCard,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
    },
    {
      title: 'Active',
      value: stats?.overview.activeSubscriptions || 0,
      icon: CheckCircle,
      color: 'text-green-600',
      bg: 'bg-green-50',
    },
    {
      title: 'Expired',
      value: stats?.overview.expiredSubscriptions || 0,
      icon: Clock,
      color: 'text-gray-600',
      bg: 'bg-gray-50',
    },
    {
      title: 'Cancelled',
      value: stats?.overview.cancelledSubscriptions || 0,
      icon: XCircle,
      color: 'text-red-600',
      bg: 'bg-red-50',
    },
  ];

  if (error) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-[50vh]">
          <div className="text-center">
            <p className="text-red-600 mb-4">Failed to load subscriptions</p>
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
            Subscription Management
          </h1>
          <p className="text-gray-600 mt-1">
            Manage user subscriptions and plans
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

        {/* Subscriptions Table */}
        <Card className="p-6 bg-white">
          {isLoading ? (
            <DataTableSkeleton
              columnCount={9}
              searchableColumnCount={1}
              filterableColumnCount={1}
              rowCount={10}
            />
          ) : (
            <DataTable
              columns={columns}
              data={subscriptions}
              searchableColumns={[
                {
                  id: 'user',
                  title: 'user email or name',
                },
              ]}
              filterableColumns={[
                {
                  id: 'status',
                  title: 'Status',
                  options: [
                    { label: 'Active', value: SubscriptionStatus.ACTIVE },
                    { label: 'Pending', value: SubscriptionStatus.PENDING },
                    { label: 'Expired', value: SubscriptionStatus.EXPIRED },
                    { label: 'Cancelled', value: SubscriptionStatus.CANCELLED },
                  ],
                },
              ]}
              deleteRowsAction={(selectedRows) =>
                selectedRows.length > 0 ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleBulkCancel(selectedRows)}
                    disabled={bulkAction.isPending}
                    className="h-10 text-red-600 hover:text-red-700"
                  >
                    {bulkAction.isPending ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Ban className="mr-2 h-4 w-4" />
                    )}
                    Cancel ({selectedRows.length})
                  </Button>
                ) : null
              }
              newRowAction={
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
              }
            />
          )}
        </Card>
      </div>
    </AdminLayout>
  );
}