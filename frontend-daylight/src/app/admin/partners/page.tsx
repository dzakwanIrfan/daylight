'use client';

import { useState, useMemo } from 'react';
import { AdminLayout } from '@/components/admin/admin-layout';
import { DataTable } from '@/components/data-table/data-table';
import { DataTableSkeleton } from '@/components/data-table/data-table-skeleton';
import { columns } from '@/components/admin/partners/columns';
import { Partner, PartnerType, PartnerStatus, PartnerBulkActionType } from '@/types/partner.types';
import { Card } from '@/components/ui/card';
import { Building2, CheckCircle, Clock, Download, Plus, Loader2, Trash2, Verified } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { partnerService } from '@/services/partner.service';
import { useAdminPartners, useAdminPartnerMutations } from '@/hooks/use-partners';
import { useRouter } from 'next/navigation';

export default function AdminPartnersPage() {
  const router = useRouter();
  const [isExporting, setIsExporting] = useState(false);

  const { data: partnersResponse, isLoading, error } = useAdminPartners({ limit: 1000 });
  const partners = partnersResponse?.data || [];

  const { bulkAction } = useAdminPartnerMutations();

  // Calculate stats
  const stats = useMemo(() => {
    if (!partners.length) return { total: 0, active: 0, preferred: 0, pending: 0 };
    
    return {
      total: partners.length,
      active: partners.filter(p => p.status === PartnerStatus.ACTIVE && p.isActive).length,
      preferred: partners.filter(p => p.isPreferred).length,
      pending: partners.filter(p => p.status === PartnerStatus.PENDING).length,
    };
  }, [partners]);

  const handleExport = async () => {
    try {
      setIsExporting(true);
      const exportPartners = await partnerService.exportPartners({});
      
      const headers = [
        'Name', 'Type', 'Status', 'City', 'Address', 'Phone', 'Email',
        'Preferred', 'Total Events', 'Created At'
      ];
      const csvContent = [
        headers.join(','),
        ...exportPartners.map(partner => [
          `"${partner.name}"`,
          partner.type,
          partner.status,
          partner.city,
          `"${partner.address}"`,
          partner.phoneNumber || '',
          partner.email || '',
          partner.isPreferred ? 'Yes' : 'No',
          partner.totalEvents,
          new Date(partner.createdAt).toLocaleDateString(),
        ].join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `partners-export-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);

      toast.success('Partners exported successfully');
    } catch (error) {
      toast.error('Failed to export partners');
    } finally {
      setIsExporting(false);
    }
  };

  const handleBulkDelete = async (selectedPartners: Partner[]) => {
    if (selectedPartners.length === 0) return;

    const hasPartnersWithEvents = selectedPartners.some(p => p.totalEvents > 0);
    
    if (hasPartnersWithEvents) {
      toast.error('Cannot delete partners with associated events');
      return;
    }

    if (!confirm(`Are you sure you want to delete ${selectedPartners.length} partner(s)? This action cannot be undone.`)) {
      return;
    }

    bulkAction.mutate({
      partnerIds: selectedPartners.map(p => p.id),
      action: PartnerBulkActionType.DELETE,
    });
  };

  const statsCards = [
    {
      title: 'Total Partners',
      value: stats.total,
      icon: Building2,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
    },
    {
      title: 'Active',
      value: stats.active,
      icon: CheckCircle,
      color: 'text-green-600',
      bg: 'bg-green-50',
    },
    {
      title: 'Preferred',
      value: stats.preferred,
      icon: Verified,
      color: 'text-green-700',
      bg: 'bg-green-50',
    },
    {
      title: 'Pending',
      value: stats.pending,
      icon: Clock,
      color: 'text-orange-600',
      bg: 'bg-orange-50',
    },
  ];

  if (error) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-[50vh]">
          <div className="text-center">
            <p className="text-red-600 mb-4">Failed to load partners</p>
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
            Partners Management
          </h1>
          <p className="text-gray-600 mt-1">
            Manage restaurants, cafes, art galleries, brands, and communities
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

        {/* Partners Table */}
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
              data={partners}
              searchableColumns={[
                {
                  id: 'name',
                  title: 'partners',
                },
              ]}
              filterableColumns={[
                {
                  id: 'type',
                  title: 'Type',
                  options: Object.values(PartnerType).map((type) => ({
                    label: type.replace('_', ' '),
                    value: type,
                  })),
                },
                {
                  id: 'status',
                  title: 'Status',
                  options: Object.values(PartnerStatus).map((status) => ({
                    label: status,
                    value: status,
                  })),
                },
                {
                  id: 'isPreferred',
                  title: 'Preferred',
                  options: [
                    { label: 'Yes', value: 'true' },
                    { label: 'No', value: 'false' },
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
                    onClick={() => router.push('/admin/partners/new')}
                    className="h-10 bg-brand hover:bg-brand-dark border border-black text-white font-bold"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Partner
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