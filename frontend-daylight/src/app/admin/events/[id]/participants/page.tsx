'use client';

import { useState, useMemo, use } from 'react';
import { AdminLayout } from '@/components/admin/admin-layout';
import { DataTable } from '@/components/data-table/data-table';
import { DataTableSkeleton } from '@/components/data-table/data-table-skeleton';
import { participantsColumns } from '@/components/admin/events/participants-columns';
import { Card } from '@/components/ui/card';
import { Users, CheckCircle, Clock, TrendingUp, Download, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useEventParticipants } from '@/hooks/use-event-participants';
import { useAdminEvent } from '@/hooks/use-admin-events';
import { useRouter } from 'next/navigation';
import { PaymentStatus } from '@/types/event.types';
import { participantService } from '@/services/participant.service';
import { format } from 'date-fns';

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function EventParticipantsPage({ params }: PageProps) {
  const router = useRouter();
  const resolvedParams = use(params);
  const eventId = resolvedParams.id;
  
  const [isExporting, setIsExporting] = useState(false);

  const { data: event, isLoading: eventLoading } = useAdminEvent(eventId);
  const { data: participantsResponse, isLoading: participantsLoading } =
    useEventParticipants(eventId, { limit: 1000 });

  const participants = participantsResponse?.data || [];
  const statistics = participantsResponse?.statistics;

  const handleExport = async () => {
    try {
      setIsExporting(true);
      const exportData = await participantService.exportParticipants(eventId, {});

      const headers = [
        'Customer Name',
        'Email',
        'Phone',
        'Quantity',
        'Amount',
        'Total Paid',
        'Payment Method',
        'Status',
        'Paid At',
        'Created At',
      ];

      const csvContent = [
        headers.join(','),
        ...exportData.map((p) => [
          `"${p.customerName}"`,
          p.customerEmail,
          p.customerPhone || '',
          p.quantity,
          p.amount,
          p.amountReceived,
          `"${p.paymentName}"`,
          p.paymentStatus,
          p.paidAt
            ? format(new Date(p.paidAt), 'dd/MM/yyyy HH:mm')
            : '',
          format(new Date(p.createdAt), 'dd/MM/yyyy HH:mm'),
        ].join(',')),
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `event-participants-${eventId}-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);

      toast.success('Participants exported successfully');
    } catch (error) {
      toast.error('Failed to export participants');
    } finally {
      setIsExporting(false);
    }
  };

  const statsCards = [
    {
      title: 'Total Participants',
      value: statistics?.totalTransactions || 0,
      icon: Users,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
    },
    {
      title: 'Paid',
      value: statistics?.paidTransactions || 0,
      icon: CheckCircle,
      color: 'text-green-600',
      bg: 'bg-green-50',
    },
    {
      title: 'Pending',
      value: statistics?.pendingTransactions || 0,
      icon: Clock,
      color: 'text-orange-600',
      bg: 'bg-orange-50',
    },
    {
      title: 'Total Revenue',
      value: `IDR ${(statistics?.totalRevenue || 0).toLocaleString('id-ID')}`,
      icon: TrendingUp,
      color: 'text-brand',
      bg: 'bg-brand/10',
    },
  ];

  if (eventLoading || participantsLoading) {
    return (
      <AdminLayout>
        <div className="space-y-6">
          <div className="h-20 bg-gray-200 animate-pulse rounded-lg" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 bg-gray-200 animate-pulse rounded-lg" />
            ))}
          </div>
          <DataTableSkeleton columnCount={8} rowCount={10} />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push('/admin/events')}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Events
          </Button>

          <h1 className="text-2xl md:text-3xl font-headline font-bold text-gray-900">
            Event Participants
          </h1>
          <p className="text-gray-600 mt-1">
            {event?.title || 'Loading...'}
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
                    <p className="text-sm font-medium text-gray-600">{stat.title}</p>
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

        {/* Participants Table */}
        <Card className="p-6 bg-white">
          <DataTable
            columns={participantsColumns}
            data={participants}
            searchableColumns={[
              {
                id: 'customerName',
                title: 'participants',
              },
            ]}
            filterableColumns={[
              {
                id: 'paymentStatus',
                title: 'Status',
                options: Object.values(PaymentStatus).map((status) => ({
                  label: status,
                  value: status,
                })),
              },
            ]}
            newRowAction={
              <Button
                variant="outline"
                size="sm"
                onClick={handleExport}
                disabled={isExporting}
                className="h-10"
              >
                {isExporting ? (
                  <>
                    <Download className="mr-2 h-4 w-4 animate-pulse" />
                    Exporting...
                  </>
                ) : (
                  <>
                    <Download className="mr-2 h-4 w-4" />
                    Export CSV
                  </>
                )}
              </Button>
            }
          />
        </Card>
      </div>
    </AdminLayout>
  );
}