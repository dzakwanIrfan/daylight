'use client';

import { useState, useMemo } from 'react';
import { AdminLayout } from '@/components/admin/admin-layout';
import { DataTable } from '@/components/data-table/data-table';
import { DataTableSkeleton } from '@/components/data-table/data-table-skeleton';
import { columns } from '@/components/admin/payment-methods/columns';
import {
  PaymentMethod,
  PaymentMethodType,
  PaymentMethodTypeLabels,
  BulkActionType,
} from '@/types/payment-method.types';
import { Card } from '@/components/ui/card';
import {
  CreditCard,
  Activity,
  Power,
  Download,
  Loader2,
  Globe,
  Plus,
  BarChart3,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { paymentMethodService } from '@/services/payment-method.service';
import {
  usePaymentMethods,
  usePaymentMethodMutations,
  usePaymentMethodStatistics,
  useAvailableCountries,
  useAvailableCurrencies,
} from '@/hooks/use-payment-methods';
import { CreatePaymentMethodDialog } from '@/components/admin/payment-methods/create-payment-method-dialog';

export default function AdminPaymentMethodsPage() {
  const [isExporting, setIsExporting] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  // Fetch data
  const { data: methodsResponse, isLoading, error } = usePaymentMethods({ limit: 1000 });
  const { data: statisticsData } = usePaymentMethodStatistics();
  const { data: countriesData } = useAvailableCountries();
  const { data: currenciesData } = useAvailableCurrencies();

  const methods = methodsResponse?.data || [];
  const countries = countriesData?.data || [];
  const currencies = currenciesData?.data || [];
  const stats = statisticsData?.data;

  // Mutations
  const { bulkAction } = usePaymentMethodMutations();

  // Filter options
  const countryFilterOptions = useMemo(() => {
    return countries.map((c) => ({
      label: `${c.name} (${c.code})`,
      value: c.code,
    }));
  }, [countries]);

  const currencyFilterOptions = useMemo(() => {
    return currencies.map((c) => ({
      label: c,
      value: c,
    }));
  }, [currencies]);

  const typeFilterOptions = useMemo(() => {
    return Object.values(PaymentMethodType).map((type) => ({
      label: PaymentMethodTypeLabels[type],
      value: type,
    }));
  }, []);

  const handleExport = async () => {
    try {
      setIsExporting(true);
      const exportMethods = await paymentMethodService.exportPaymentMethods({});

      const headers = [
        'Code',
        'Name',
        'Country',
        'Currency',
        'Type',
        'Admin Fee Rate',
        'Admin Fee Fixed',
        'Min Amount',
        'Max Amount',
        'Status',
      ];
      const csvContent = [
        headers.join(','),
        ...exportMethods.map((method) =>
          [
            method.code,
            `"${method.name}"`,
            method.countryCode,
            method.currency,
            method.type,
            `${method.adminFeeRatePercent}%`,
            method.adminFeeFixed,
            method.minAmount,
            method.maxAmount,
            method.isActive ? 'Active' : 'Inactive',
          ].join(',')
        ),
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
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
      codes: selectedMethods.map((m) => m.code),
      action: BulkActionType.ACTIVATE,
    });
  };

  const handleBulkDeactivate = async (selectedMethods: PaymentMethod[]) => {
    if (selectedMethods.length === 0) return;

    if (
      !confirm(
        `Are you sure you want to deactivate ${selectedMethods.length} payment method(s)? `
      )
    ) {
      return;
    }

    bulkAction.mutate({
      codes: selectedMethods.map((m) => m.code),
      action: BulkActionType.DEACTIVATE,
    });
  };

  const handleBulkDelete = async (selectedMethods: PaymentMethod[]) => {
    if (selectedMethods.length === 0) return;

    if (
      !confirm(
        `Are you sure you want to DELETE ${selectedMethods.length} payment method(s)? This action cannot be undone.`
      )
    ) {
      return;
    }

    bulkAction.mutate({
      codes: selectedMethods.map((m) => m.code),
      action: BulkActionType.DELETE,
    });
  };

  const statsCards = [
    {
      title: 'Total Methods',
      value: stats?.overview?.total || methods.length,
      icon: CreditCard,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
    },
    {
      title: 'Active Methods',
      value: stats?.overview?.active || methods.filter((m) => m.isActive).length,
      icon: Activity,
      color: 'text-green-600',
      bg: 'bg-green-50',
    },
    {
      title: 'Inactive Methods',
      value: stats?.overview?.inactive || methods.filter((m) => !m.isActive).length,
      icon: Power,
      color: 'text-gray-600',
      bg: 'bg-gray-50',
    },
    {
      title: 'Countries',
      value: stats?.overview?.countries || countries.length,
      icon: Globe,
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
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-headline font-bold text-gray-900">
              Payment Methods
            </h1>
            <p className="text-gray-600 mt-1">
              Manage Xendit payment methods for overseas payments
            </p>
          </div>
          <div className="flex gap-2">
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
              <Plus className="mr-2 h-4 w-4" />
              Add Method
            </Button>
          </div>
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

        {/* Statistics by Country and Type */}
        {stats && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* By Country */}
            <Card className="p-6 bg-white">
              <div className="flex items-center gap-2 mb-4">
                <Globe className="w-5 h-5 text-gray-600" />
                <h3 className="font-semibold text-gray-900">By Country</h3>
              </div>
              <div className="space-y-3">
                {stats.byCountry?.slice(0, 5).map((item) => (
                  <div key={item.countryCode} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-900">
                        {item.countryName}
                      </span>
                      <span className="text-xs text-gray-500">({item.countryCode})</span>
                    </div>
                    <span className="text-sm font-bold text-gray-900">{item.count}</span>
                  </div>
                ))}
                {(!stats.byCountry || stats.byCountry.length === 0) && (
                  <p className="text-sm text-gray-500">No data available</p>
                )}
              </div>
            </Card>

            {/* By Type */}
            <Card className="p-6 bg-white">
              <div className="flex items-center gap-2 mb-4">
                <BarChart3 className="w-5 h-5 text-gray-600" />
                <h3 className="font-semibold text-gray-900">By Type</h3>
              </div>
              <div className="space-y-3">
                {stats.byType?.map((item) => (
                  <div key={item.type} className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-900">
                      {PaymentMethodTypeLabels[item.type] || item.type}
                    </span>
                    <span className="text-sm font-bold text-gray-900">{item.count}</span>
                  </div>
                ))}
                {(!stats.byType || stats.byType.length === 0) && (
                  <p className="text-sm text-gray-500">No data available</p>
                )}
              </div>
            </Card>
          </div>
        )}

        {/* Payment Methods Table */}
        <Card className="p-6 bg-white">
          {isLoading ? (
            <DataTableSkeleton
              columnCount={10}
              searchableColumnCount={1}
              filterableColumnCount={4}
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
                  id: 'countryCode',
                  title: 'Country',
                  options: countryFilterOptions,
                },
                {
                  id: 'currency',
                  title: 'Currency',
                  options: currencyFilterOptions,
                },
                {
                  id: 'type',
                  title: 'Type',
                  options: typeFilterOptions,
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
              deleteRowsAction={(selectedRows) =>
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
                      className="h-10 text-orange-600 hover:text-orange-700"
                    >
                      {bulkAction.isPending ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Power className="mr-2 h-4 w-4" />
                      )}
                      Deactivate ({selectedRows.length})
                    </Button>
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
                        <Power className="mr-2 h-4 w-4" />
                      )}
                      Delete ({selectedRows.length})
                    </Button>
                  </div>
                ) : null
              }
            />
          )}
        </Card>
      </div>

      {/* Create Payment Method Dialog */}
      <CreatePaymentMethodDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
      />
    </AdminLayout>
  );
}