'use client';

import { useState, useMemo } from 'react';
import { AdminLayout } from '@/components/admin/admin-layout';
import { DataTable } from '@/components/data-table/data-table';
import { DataTableSkeleton } from '@/components/data-table/data-table-skeleton';
import { columns } from '@/components/admin/events/columns';
import { Event, EventCategory, EventStatus, EventBulkActionType } from '@/types/event.types';
import { Card } from '@/components/ui/card';
import { Calendar, CheckCircle, Clock, XCircle, Download, Plus, Loader2, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { eventService } from '@/services/event.service';
import { useAdminEvents, useAdminEventMutations } from '@/hooks/use-admin-events';
import { useRouter } from 'next/navigation';

export default function AdminEventsPage() {
  const router = useRouter();
  const [isExporting, setIsExporting] = useState(false);

  const { data: eventsResponse, isLoading, error } = useAdminEvents({ limit: 1000 });
  const events = eventsResponse?.data || [];

  const { bulkAction } = useAdminEventMutations();

  // Calculate stats
  const stats = useMemo(() => {
    if (!events.length) return { total: 0, published: 0, draft: 0, completed: 0 };
    
    return {
      total: events.length,
      published: events.filter(e => e.status === EventStatus.PUBLISHED).length,
      draft: events.filter(e => e.status === EventStatus.DRAFT).length,
      completed: events.filter(e => e.status === EventStatus.COMPLETED).length,
    };
  }, [events]);

  const handleExport = async () => {
    try {
      setIsExporting(true);
      const exportEvents = await eventService.exportEvents({});
      
      const headers = [
        'Title', 'Category', 'Status', 'Date', 'City', 'Venue', 
        'Price', 'Participants', 'Max Participants', 'Created At'
      ];
      const csvContent = [
        headers.join(','),
        ...exportEvents.map(event => [
          `"${event.title}"`,
          event.category,
          event.status,
          new Date(event.eventDate).toLocaleDateString(),
          event.city,
          `"${event.venue}"`,
          event.price,
          event.currentParticipants,
          event.maxParticipants,
          new Date(event.createdAt).toLocaleDateString(),
        ].join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `events-export-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);

      toast.success('Events exported successfully');
    } catch (error) {
      toast.error('Failed to export events');
    } finally {
      setIsExporting(false);
    }
  };

  const handleBulkDelete = async (selectedEvents: Event[]) => {
    if (selectedEvents.length === 0) return;

    if (!confirm(`Are you sure you want to delete ${selectedEvents.length} event(s)? This action cannot be undone.`)) {
      return;
    }

    bulkAction.mutate({
      eventIds: selectedEvents.map(e => e.id),
      action: EventBulkActionType.DELETE,
    });
  };

  const statsCards = [
    {
      title: 'Total Events',
      value: stats.total,
      icon: Calendar,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
    },
    {
      title: 'Published',
      value: stats.published,
      icon: CheckCircle,
      color: 'text-green-600',
      bg: 'bg-green-50',
    },
    {
      title: 'Draft',
      value: stats.draft,
      icon: Clock,
      color: 'text-orange-600',
      bg: 'bg-orange-50',
    },
    {
      title: 'Completed',
      value: stats.completed,
      icon: CheckCircle,
      color: 'text-brand',
      bg: 'bg-brand/10',
    },
  ];

  if (error) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-[50vh]">
          <div className="text-center">
            <p className="text-red-600 mb-4">Failed to load events</p>
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
            Events Management
          </h1>
          <p className="text-gray-600 mt-1">
            Manage all events across DayBreak, DayTrip, DayCare, and DayDream
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

        {/* Events Table */}
        <Card className="p-6 bg-white">
          {isLoading ? (
            <DataTableSkeleton
              columnCount={9}
              searchableColumnCount={1}
              filterableColumnCount={3}
              rowCount={10}
            />
          ) : (
            <DataTable
              columns={columns}
              data={events}
              searchableColumns={[
                {
                  id: 'title',
                  title: 'events',
                },
              ]}
              filterableColumns={[
                {
                  id: 'category',
                  title: 'Category',
                  options: Object.values(EventCategory).map((cat) => ({
                    label: cat,
                    value: cat,
                  })),
                },
                {
                  id: 'status',
                  title: 'Status',
                  options: Object.values(EventStatus).map((status) => ({
                    label: status,
                    value: status,
                  })),
                },
                {
                  id: 'isActive',
                  title: 'Active Status',
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
                    onClick={() => router.push('/admin/events/new')}
                    className="h-10 bg-brand hover:bg-brand-dark border border-black text-white font-bold"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Create Event
                  </Button>
                </div>
              }
            />
          )}
        </Card>
      </div>
    </AdminLayout>
  );
}