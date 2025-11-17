'use client';

import { useState, useMemo } from 'react';
import { AdminLayout } from '@/components/admin/admin-layout';
import { DataTable } from '@/components/data-table/data-table';
import { DataTableSkeleton } from '@/components/data-table/data-table-skeleton';
import { columns } from '../../../components/admin/payment-methods/columns';
import { PaymentMethod, PaymentChannelType, BulkActionType } from '@/types/payment-method.types';
import { Card } from '@/components/ui/card';
import { CreditCard, Activity, Power, Download, Loader2, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { paymentMethodService } from '@/services/payment-method.service';
import { usePaymentMethods, usePaymentMethodGroups, usePaymentMethodMutations } from '@/hooks/use-payment-methods';

export default function AdminPaymentMethodsPage() {
  const [isExporting, setIsExporting] = useState(false);

  // Fetch payment methods using React Query
  const { data: methodsResponse, isLoading, error } = usePaymentMethods({ limit: 1000 });
  const { data: groups } = usePaymentMethodGroups();
  const methods = methodsResponse?.data || [];

  // Mutations
  const { bulkAction } = usePaymentMethodMutations();

  // Calculate stats
  const stats = useMemo(() => {
    if (!methods.length) return { total: 0, active: 0, inactive: 0, groups: 0 };
    
    return {
      total: methods.length,
      active: methods.filter(m => m.isActive).length,
      inactive: methods.filter(m => !m.isActive).length,
      groups: new Set(methods.map(m => m.group)).size,
    };
  }, [methods]);

  const handleExport = async () => {
    try {
      setIsExporting(true);
      const exportMethods = await paymentMethodService.exportPaymentMethods({});
      
      const headers = ['Code', 'Name', 'Group', 'Type', 'Merchant Fee', 'Customer Fee', 'Min Amount', 'Max Amount', 'Status'];
      const csvContent = [
        headers.join(','),
        ...exportMethods.map(method => [
          method.code,
          method.name,
          method.group,
          method.type,
          `${method.feeMerchantFlat} + ${method.feeMerchantPercent}%`,
          `${method.feeCustomerFlat} + ${method.feeCustomerPercent}%`,
          method.minimumAmount,
          method.maximumAmount,
          method.isActive ? 'Active' : 'Inactive',
        ].join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `payment-methods-export-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);

      toast.success('Payment methods exported successfully');
    } catch (error) {
      toast.error('Failed to export payment methods');
    } finally {
      setIsExporting(false);
    }
  };

  const handleBulkActivate = async (selectedMethods: PaymentMethod[]) => {
    if (selectedMethods.length === 0) return;

    bulkAction.mutate({
      codes: selectedMethods.map(m => m.code),
      action: BulkActionType.ACTIVATE,
    });
  };

  const handleBulkDeactivate = async (selectedMethods: PaymentMethod[]) => {
    if (selectedMethods.length === 0) return;

    if (!confirm(`Are you sure you want to deactivate ${selectedMethods.length} payment method(s)?`)) {
      return;
    }

    bulkAction.mutate({
      codes: selectedMethods.map(m => m.code),
      action: BulkActionType.DEACTIVATE,
    });
  };

  const statsCards = [
    {
      title: 'Total Methods',
      value: stats.total,
      icon: CreditCard,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
    },
    {
      title: 'Active Methods',
      value: stats.active,
      icon: Activity,
      color: 'text-green-600',
      bg: 'bg-green-50',
    },
    {
      title: 'Inactive Methods',
      value: stats.inactive,
      icon: Power,
      color: 'text-gray-600',
      bg: 'bg-gray-50',
    },
    {
      title: 'Payment Groups',
      value: stats.groups,
      icon: RefreshCw,
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
            <p className="text-red-600 mb-4">Failed to load payment methods</p>
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
            Payment Methods
          </h1>
          <p className="text-gray-600 mt-1">
            Manage payment methods, fees, and configurations
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

        {/* Payment Methods Table */}
        <Card className="p-6 bg-white">
          {isLoading ? (
            <DataTableSkeleton
              columnCount={10}
              searchableColumnCount={1}
              filterableColumnCount={3}
              rowCount={10}
            />
          ) : (
            <DataTable
              columns={columns}
              data={methods}
              searchableColumns={[
                {
                  id: 'name',
                  title: 'payment method',
                },
              ]}
              filterableColumns={[
                {
                  id: 'group',
                  title: 'Group',
                  options: (groups || []).map(group => ({
                    label: group,
                    value: group,
                  })),
                },
                {
                  id: 'type',
                  title: 'Type',
                  options: [
                    { label: 'Direct', value: PaymentChannelType.DIRECT },
                    { label: 'Redirect', value: PaymentChannelType.REDIRECT },
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
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleBulkActivate(selectedRows)}
                      disabled={bulkAction.isPending}
                      className="h-10 text-green-600 hover:text-green-700"
                    >
                      {bulkAction.isPending ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Power className="mr-2 h-4 w-4" />
                      )}
                      Activate ({selectedRows.length})
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleBulkDeactivate(selectedRows)}
                      disabled={bulkAction.isPending}
                      className="h-10 text-red-600 hover:text-red-700"
                    >
                      {bulkAction.isPending ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Power className="mr-2 h-4 w-4" />
                      )}
                      Deactivate ({selectedRows.length})
                    </Button>
                  </div>
                ) : null
              )}
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