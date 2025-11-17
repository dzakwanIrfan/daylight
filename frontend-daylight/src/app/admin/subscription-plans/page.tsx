'use client';

import { useState } from 'react';
import { AdminLayout } from '@/components/admin/admin-layout';
import { DataTable } from '@/components/data-table/data-table';
import { DataTableSkeleton } from '@/components/data-table/data-table-skeleton';
import { columns } from '@/components/admin/subscription-plans/columns';
import { Card } from '@/components/ui/card';
import { CreditCard, CheckCircle, XCircle, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CreatePlanDialog } from '@/components/admin/subscription-plans/create-plan-dialog';
import { useAdminPlans } from '@/hooks/use-admin-subscriptions';

export default function AdminSubscriptionPlansPage() {
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  // Fetch all plans (active and inactive)
  const { data: plansResponse, isLoading, error } = useAdminPlans();
  const plans = plansResponse?.data || [];

  // Calculate stats
  const activePlans = plans.filter((p) => p.isActive).length;
  const inactivePlans = plans.filter((p) => !p.isActive).length;

  const statsCards = [
    {
      title: 'Total Plans',
      value: plans.length,
      icon: CreditCard,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
    },
    {
      title: 'Active Plans',
      value: activePlans,
      icon: CheckCircle,
      color: 'text-green-600',
      bg: 'bg-green-50',
    },
    {
      title: 'Inactive Plans',
      value: inactivePlans,
      icon: XCircle,
      color: 'text-gray-600',
      bg: 'bg-gray-50',
    },
  ];

  if (error) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-[50vh]">
          <div className="text-center">
            <p className="text-red-600 mb-4">Failed to load subscription plans</p>
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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-headline font-bold text-gray-900">
              Subscription Plans
            </h1>
            <p className="text-gray-600 mt-1">
              Manage subscription plans, pricing, and features
            </p>
          </div>
          <Button
            onClick={() => setShowCreateDialog(true)}
            className="bg-brand hover:bg-brand-dark border border-black text-white font-bold"
          >
            <Plus className="mr-2 h-4 w-4" />
            Create Plan
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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

        {/* Plans Table */}
        <Card className="p-6 bg-white">
          {isLoading ? (
            <DataTableSkeleton
              columnCount={9}
              searchableColumnCount={1}
              filterableColumnCount={2}
              rowCount={5}
            />
          ) : (
            <DataTable
              columns={columns}
              data={plans}
              searchableColumns={[
                {
                  id: 'name',
                  title: 'plan name',
                },
              ]}
              filterableColumns={[
                {
                  id: 'type',
                  title: 'Type',
                  options: [
                    { label: '1 Month', value: 'MONTHLY_1' },
                    { label: '3 Months', value: 'MONTHLY_3' },
                    { label: '6 Months', value: 'MONTHLY_6' },
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
            />
          )}
        </Card>
      </div>

      <CreatePlanDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
      />
    </AdminLayout>
  );
}