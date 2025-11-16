'use client';

import { useState, useMemo } from 'react';
import { AdminLayout } from '@/components/admin/admin-layout';
import { useAdminTransactions } from '@/hooks/use-admin-transactions';
import { DataTable } from '@/components/data-table/data-table';
import { DataTableSkeleton } from '@/components/data-table/data-table-skeleton';
import { columns } from '@/components/admin/transactions/columns';
import { TransactionsBulkActions } from '@/components/admin/transactions/transactions-bulk-actions';
import { PaymentStatus, Transaction, TransactionType } from '@/types/transaction.types';
import { Button } from '@/components/ui/button';
import { Download, Loader2, CreditCard, CheckCircle, Clock, XCircle, DollarSign, Package, Crown } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { transactionService } from '@/services/transaction.service';
import { toast } from 'sonner';
import { formatCurrency } from '@/lib/utils';

export default function TransactionsPage() {
  const [isExporting, setIsExporting] = useState(false);

  // Fetch transactions using React Query
  const { data: transactionsResponse, isLoading, error } = useAdminTransactions({ limit: 1000 });
  const transactions = transactionsResponse?.data || [];

  // Calculate stats
  const stats = useMemo(() => {
    if (!transactions.length) {
      return { 
        total: 0, 
        paid: 0, 
        pending: 0, 
        failed: 0,
        totalRevenue: 0,
        eventTransactions: 0,
        subscriptionTransactions: 0,
      };
    }
    
    return {
      total: transactions.length,
      paid: transactions.filter(t => t.paymentStatus === PaymentStatus.PAID).length,
      pending: transactions.filter(t => t.paymentStatus === PaymentStatus.PENDING).length,
      failed: transactions.filter(
        t => t.paymentStatus === PaymentStatus.FAILED || 
            t.paymentStatus === PaymentStatus.EXPIRED
      ).length,
      totalRevenue: transactions
        .filter(t => t.paymentStatus === PaymentStatus.PAID)
        .reduce((sum, t) => sum + t.amountReceived, 0),
      eventTransactions: transactions.filter(t => t.transactionType === TransactionType.EVENT).length,
      subscriptionTransactions: transactions.filter(t => t.transactionType === TransactionType.SUBSCRIPTION).length,
    };
  }, [transactions]);

  const handleExport = async () => {
    try {
      setIsExporting(true);
      const exportTransactions = await transactionService.exportTransactions({});
      
      const headers = [
        'Merchant Ref',
        'Tripay Ref',
        'Type',
        'Customer Name',
        'Customer Email',
        'Item',
        'Payment Method',
        'Amount',
        'Fee',
        'Amount Received',
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

          return [
            t.merchantRef,
            t.tripayReference,
            t.transactionType,
            `"${t.customerName}"`,
            t.customerEmail,
            `"${itemName}"`,
            `"${t.paymentName}"`,
            t.amount,
            t.totalFee,
            t.amountReceived,
            t.paymentStatus,
            new Date(t.createdAt).toLocaleDateString('id-ID'),
            t.paidAt ? new Date(t.paidAt).toLocaleDateString('id-ID') : '-',
          ].join(',');
        }),
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv' });
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
      value: stats.total,
      icon: CreditCard,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
    },
    {
      title: 'Paid',
      value: stats.paid,
      icon: CheckCircle,
      color: 'text-green-600',
      bg: 'bg-green-50',
    },
    {
      title: 'Pending',
      value: stats.pending,
      icon: Clock,
      color: 'text-yellow-600',
      bg: 'bg-yellow-50',
    },
    {
      title: 'Failed/Expired',
      value: stats.failed,
      icon: XCircle,
      color: 'text-red-600',
      bg: 'bg-red-50',
    },
  ];

  const typeStatsCards = [
    {
      title: 'Event Transactions',
      value: stats.eventTransactions,
      icon: Package,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
    },
    {
      title: 'Subscription Transactions',
      value: stats.subscriptionTransactions,
      icon: Crown,
      color: 'text-orange-600',
      bg: 'bg-orange-50',
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
        <div>
          <h1 className="text-2xl md:text-3xl font-headline font-bold text-gray-900">
            Transaction Management
          </h1>
          <p className="text-gray-600 mt-1">
            Manage and track all payment transactions
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

        {/* Type Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {typeStatsCards.map((stat) => {
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

        {/* Revenue Card */}
        <Card className="p-6 bg-linear-to-r from-green-50 to-emerald-50 border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-700">
                Total Revenue (Paid Transactions)
              </p>
              <h3 className="text-3xl font-bold text-green-900 mt-2">
                {formatCurrency(stats.totalRevenue, 'IDR')}
              </h3>
            </div>
            <div className="bg-green-100 text-green-700 p-4 rounded-lg">
              <DollarSign className="w-8 h-8" />
            </div>
          </div>
        </Card>

        {/* Transactions Table */}
        <Card className="p-6 bg-white">
          {isLoading ? (
            <DataTableSkeleton
              columnCount={11}
              searchableColumnCount={1}
              filterableColumnCount={2}
              rowCount={10}
            />
          ) : (
            <DataTable
              columns={columns}
              data={transactions}
              searchableColumns={[
                {
                  id: 'merchantRef',
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
                  id: 'paymentStatus',
                  title: 'Status',
                  options: [
                    { label: 'Pending', value: PaymentStatus.PENDING },
                    { label: 'Paid', value: PaymentStatus.PAID },
                    { label: 'Failed', value: PaymentStatus.FAILED },
                    { label: 'Expired', value: PaymentStatus.EXPIRED },
                    { label: 'Refunded', value: PaymentStatus.REFUNDED },
                  ],
                },
              ]}
              deleteRowsAction={(selectedRows) => (
                selectedRows.length > 0 ? (
                  <TransactionsBulkActions
                    selectedTransactions={selectedRows}
                    onClearSelection={() => {}}
                  />
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