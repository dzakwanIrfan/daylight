'use client';

import { useState } from 'react';
import { AdminLayout } from '@/components/admin/admin-layout';
import { useAdminTransactions, useTransactionDashboardStats } from '@/hooks/use-admin-transactions';
import { DataTable } from '@/components/data-table/data-table';
import { DataTableSkeleton } from '@/components/data-table/data-table-skeleton';
import { columns } from '@/components/admin/transactions/columns';
import { TransactionsBulkActions } from '@/components/admin/transactions/transactions-bulk-actions';
import { TransactionStatus, TransactionType } from '@/types/transaction.types';
import { Button } from '@/components/ui/button';
import { Download, Loader2, CreditCard, CheckCircle, Clock, XCircle, DollarSign, Package, Crown, Globe, TrendingUp } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { transactionService } from '@/services/transaction.service';
import { toast } from 'sonner';
import { formatCurrency } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

export default function TransactionsPage() {
  const [isExporting, setIsExporting] = useState(false);
  const [queryParams, setQueryParams] = useState({
    page: 1,
    limit: 100,
  });

  // Fetch transactions and stats
  const { data: transactionsResponse, isLoading, error } = useAdminTransactions(queryParams);
  const { data: statsData, isLoading: statsLoading } = useTransactionDashboardStats();

  const transactions = transactionsResponse?.data || [];
  const stats = statsData?.overview || {
    totalTransactions: 0,
    paidTransactions: 0,
    pendingTransactions: 0,
    failedTransactions: 0,
    totalRevenue: 0,
  };

  const handleExport = async () => {
    try {
      setIsExporting(true);
      const exportTransactions = await transactionService.exportTransactions(queryParams);

      const headers = [
        'External ID',
        'Type',
        'Customer',
        'Customer Email',
        'Item',
        'Payment Method',
        'Country',
        'Currency',
        'Amount',
        'Fee',
        'Final Amount',
        'Status',
        'Created At',
        'Paid At',
      ];

      const csvContent = [
        headers.join(','),
        ...exportTransactions.map((t) => {
          let itemName = 'N/A';
          if (t.transactionType === TransactionType.EVENT && t.event) {
            itemName = t.event.title;
          } else if (t.transactionType === TransactionType.SUBSCRIPTION && t.userSubscription) {
            itemName = t.userSubscription.plan.name;
          }

          const customerName = t.user
            ? [t.user.firstName, t.user.lastName].filter(Boolean).join(' ') || t.user.email
            : 'N/A';

          return [
            t.externalId,
            t.transactionType,
            `"${customerName}"`,
            t.user?.email || 'N/A',
            `"${itemName}"`,
            `"${t.paymentMethodName}"`,
            t.paymentMethod?.country.name || 'N/A',
            t.paymentMethod?.currency || 'IDR',
            Number(t.amount),
            Number(t.totalFee),
            Number(t.finalAmount),
            t.status,
            new Date(t.createdAt).toLocaleString('id-ID'),
            t.paidAt ? new Date(t.paidAt).toLocaleString('id-ID') : '-',
          ].join(',');
        }),
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `transactions-export-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);

      toast.success('Transactions exported successfully');
    } catch (error) {
      toast.error('Failed to export transactions');
    } finally {
      setIsExporting(false);
    }
  };

  const statsCards = [
    {
      title: 'Total Transactions',
      value: stats.totalTransactions,
      icon: CreditCard,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
    },
    {
      title: 'Paid',
      value: stats.paidTransactions,
      icon: CheckCircle,
      color: 'text-green-600',
      bg: 'bg-green-50',
    },
    {
      title: 'Pending',
      value: stats.pendingTransactions,
      icon: Clock,
      color: 'text-yellow-600',
      bg: 'bg-yellow-50',
    },
    {
      title: 'Failed',
      value: stats.failedTransactions,
      icon: XCircle,
      color: 'text-red-600',
      bg: 'bg-red-50',
    },
  ];

  // Show error state
  if (error) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-[50vh]">
          <div className="text-center">
            <p className="text-red-600 mb-4">Failed to load transactions</p>
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
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl md:text-3xl font-headline font-bold text-gray-900">
              Transaction Management
            </h1>
            <p className="text-gray-600 mt-1">
              Manage and track all payment transactions across countries
            </p>
          </div>
        </div>

        {/* Stats Grid */}
        {statsLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="p-6 bg-white animate-pulse">
                <div className="h-20 bg-gray-200 rounded"></div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {statsCards.map((stat) => {
              const Icon = stat.icon;
              return (
                <Card key={stat.title} className="p-6 bg-white hover:shadow-lg transition-shadow">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">
                        {stat.title}
                      </p>
                      <h3 className="text-2xl font-bold text-gray-900 mt-2">
                        {stat.value.toLocaleString('id-ID')}
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
        )}

        {/* Breakdown Stats */}
        {!statsLoading && statsData && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* By Country */}
            <Card className="p-6 bg-white">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Globe className="h-5 w-5 text-blue-600" />
                Transactions by Country
              </h3>
              <div className="space-y-3">
                {statsData.breakdown.byCountry.slice(0, 5).map((item) => (
                  <div key={item.countryCode} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="font-mono">
                        {item.countryCode}
                      </Badge>
                      <span className="text-sm text-gray-700">{item.countryName}</span>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">
                        {item.count} txns
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatCurrency(Number(item.totalAmount), item.currency)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* By Type */}
            <Card className="p-6 bg-white">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-600" />
                Transactions by Type
              </h3>
              <div className="space-y-3">
                {statsData.breakdown.byType.map((item) => {
                  const Icon = item.type === TransactionType.EVENT ? Package : Crown;
                  const colorClass = item.type === TransactionType.EVENT ? 'text-blue-600' : 'text-orange-600';
                  const bgClass = item.type === TransactionType.EVENT ? 'bg-blue-50' : 'bg-orange-50';

                  return (
                    <div key={item.type} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`${bgClass} ${colorClass} p-2 rounded-lg`}>
                          <Icon className="h-4 w-4" />
                        </div>
                        <span className="text-sm font-medium text-gray-700">{item.type}</span>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">
                          {item.count} transactions
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatCurrency(Number(item.totalAmount), 'IDR')}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          </div>
        )}

        {/* Revenue Card */}
        {!statsLoading && (
          <Card className="p-6 bg-gradient-to-r from-green-50 via-emerald-50 to-teal-50 border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-700 flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  Total Revenue (Paid Transactions)
                </p>
                <h3 className="text-3xl font-bold text-green-900 mt-2">
                  {formatCurrency(Number(stats.totalRevenue), 'IDR')}
                </h3>
                <p className="text-xs text-green-600 mt-1">
                  From {stats.paidTransactions} successful payments
                </p>
              </div>
              <div className="bg-green-100 text-green-700 p-4 rounded-lg">
                <DollarSign className="w-8 h-8" />
              </div>
            </div>
          </Card>
        )}

        {/* Transactions Table */}
        <Card className="p-6 bg-white">
          {isLoading ? (
            <DataTableSkeleton
              columnCount={11}
              searchableColumnCount={1}
              filterableColumnCount={3}
              rowCount={10}
            />
          ) : (
            <DataTable
              columns={columns}
              data={transactions}
              searchableColumns={[
                {
                  id: 'externalId',
                  title: 'transactions',
                },
              ]}
              filterableColumns={[
                {
                  id: 'transactionType',
                  title: 'Type',
                  options: [
                    { label: 'Event', value: TransactionType.EVENT },
                    { label: 'Subscription', value: TransactionType.SUBSCRIPTION },
                  ],
                },
                {
                  id: 'status',
                  title: 'Status',
                  options: [
                    { label: 'Pending', value: TransactionStatus.PENDING },
                    { label: 'Paid', value: TransactionStatus.PAID },
                    { label: 'Failed', value: TransactionStatus.FAILED },
                    { label: 'Expired', value: TransactionStatus.EXPIRED },
                    { label: 'Refunded', value: TransactionStatus.REFUNDED },
                  ],
                },
              ]}
              deleteRowsAction={(selectedRows) =>
                selectedRows.length > 0 ? (
                  <TransactionsBulkActions
                    selectedTransactions={selectedRows}
                    onClearSelection={() => { }}
                  />
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
                  Export CSV
                </Button>
              }
            />
          )}
        </Card>

        {/* Recent Transactions */}
        {!statsLoading && statsData?.recentTransactions && statsData.recentTransactions.length > 0 && (
          <Card className="p-6 bg-white">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Recent Transactions
            </h3>
            <div className="space-y-3">
              {statsData.recentTransactions.slice(0, 5).map((txn) => {
                const statusColors: Record<TransactionStatus, string> = {
                  PENDING: 'bg-yellow-100 text-yellow-800',
                  PAID: 'bg-green-100 text-green-800',
                  FAILED: 'bg-red-100 text-red-800',
                  EXPIRED: 'bg-gray-100 text-gray-800',
                  REFUNDED: 'bg-purple-100 text-purple-800',
                };

                const customerName = txn.user
                  ? [txn.user.firstName, txn.user.lastName].filter(Boolean).join(' ') || txn.user.email
                  : 'N/A';

                return (
                  <div key={txn.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{customerName}</p>
                      <p className="text-xs text-gray-500 font-mono">{txn.externalId}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">
                          {formatCurrency(Number(txn.finalAmount), txn.paymentMethod?.currency || 'IDR')}
                        </p>
                        <p className="text-xs text-gray-500">{txn.paymentMethodName}</p>
                      </div>
                      <Badge className={statusColors[txn.status]}>
                        {txn.status}
                      </Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        )}
      </div>
    </AdminLayout>
  );
}