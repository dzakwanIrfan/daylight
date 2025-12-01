'use client';

import { useState, useMemo } from 'react';
import { AdminLayout } from '@/components/admin/admin-layout';
import { DataTable } from '@/components/data-table/data-table';
import { DataTableSkeleton } from '@/components/data-table/data-table-skeleton';
import { cityColumns } from '@/components/admin/locations/cities/columns';
import { Card } from '@/components/ui/card';
import { MapPin, CheckCircle, XCircle, Download, Plus, Loader2, Trash2, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useAdminCities, useAdminCityMutations, useCountryOptions } from '@/hooks/use-admin-locations';
import { useRouter, useSearchParams } from 'next/navigation';
import { AdminCity, CityBulkActionType } from '@/types/admin-location.types';
import { locationService } from '@/services/location.service';
import { format } from 'date-fns';

export default function AdminCitiesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const countryIdFilter = searchParams.get('countryId');
  
  const [isExporting, setIsExporting] = useState(false);

  const { data: citiesResponse, isLoading, error } = useAdminCities({ 
    limit: 1000,
    countryId: countryIdFilter || undefined,
  });
  const cities = citiesResponse?.data || [];

  const { data: countries } = useCountryOptions();
  const { bulkAction } = useAdminCityMutations();

  // Calculate stats
  const stats = useMemo(() => {
    if (! cities.length) return { total: 0, active: 0, inactive: 0 };
    
    return {
      total: cities.length,
      active: cities. filter(c => c. isActive).length,
      inactive: cities.filter(c => !c.isActive).length,
    };
  }, [cities]);

  const handleExport = async () => {
    try {
      setIsExporting(true);
      const exportData = await locationService.exportCities({ countryId: countryIdFilter || undefined });
      
      const headers = ['Name', 'Slug', 'Country', 'Timezone', 'Status', 'Users', 'Events', 'Created At'];
      const csvContent = [
        headers.join(','),
        ...exportData.map(c => [
          `"${c.name}"`,
          c.slug,
          c.country?. name || '',
          c.timezone,
          c.isActive ? 'Active' : 'Inactive',
          c._count?.users || 0,
          c._count?. events || 0,
          format(new Date(c.createdAt), 'dd/MM/yyyy HH:mm'),
        ].join(',')),
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window. URL.createObjectURL(blob);
      const a = document. createElement('a');
      a.href = url;
      a.download = `cities-${new Date(). toISOString(). split('T')[0]}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);

      toast.success('Cities exported successfully');
    } catch (error) {
      toast.error('Failed to export cities');
    } finally {
      setIsExporting(false);
    }
  };

  const handleBulkDelete = async (selectedCities: AdminCity[]) => {
    if (selectedCities.length === 0) return;

    // Check if any has usage
    const citiesInUse = selectedCities.filter(c => 
      (c._count?.users || 0) > 0 || (c._count?.events || 0) > 0
    );
    if (citiesInUse.length > 0) {
      toast.error(`${citiesInUse.length} cities have users/events and cannot be deleted`);
      return;
    }

    if (!confirm(`Are you sure you want to delete ${selectedCities. length} city(ies)? This action cannot be undone. `)) {
      return;
    }

    bulkAction.mutate({
      cityIds: selectedCities.map(c => c.id),
      action: CityBulkActionType.DELETE,
    });
  };

  const handleBulkActivate = async (selectedCities: AdminCity[]) => {
    if (selectedCities.length === 0) return;

    bulkAction.mutate({
      cityIds: selectedCities. map(c => c.id),
      action: CityBulkActionType. ACTIVATE,
    });
  };

  const handleBulkDeactivate = async (selectedCities: AdminCity[]) => {
    if (selectedCities. length === 0) return;

    bulkAction.mutate({
      cityIds: selectedCities. map(c => c.id),
      action: CityBulkActionType. DEACTIVATE,
    });
  };

  // Get country name for filter display
  const filterCountryName = countryIdFilter 
    ? countries?. find(c => c.id === countryIdFilter)?.name 
    : null;

  const statsCards = [
    {
      title: 'Total Cities',
      value: stats.total,
      icon: MapPin,
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
      title: 'Inactive',
      value: stats.inactive,
      icon: XCircle,
      color: 'text-orange-600',
      bg: 'bg-orange-50',
    },
  ];

  if (error) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-[50vh]">
          <div className="text-center">
            <p className="text-red-600 mb-4">Failed to load cities</p>
            <Button onClick={() => window. location.reload()}>Retry</Button>
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
              Cities Management
            </h1>
            <p className="text-gray-600 mt-1">
              Manage cities for events and users
              {filterCountryName && (
                <span className="ml-2 text-brand font-medium">
                  • Filtered by: {filterCountryName}
                </span>
              )}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {countryIdFilter && (
              <Button
                variant="outline"
                onClick={() => router.push('/admin/locations/cities')}
              >
                Clear Filter
              </Button>
            )}
            <Button
              variant="outline"
              onClick={() => router.push('/admin/locations/countries')}
            >
              <Globe className="mr-2 h-4 w-4" />
              View Countries
            </Button>
          </div>
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
                      {stat. title}
                    </p>
                    <h3 className="text-2xl font-bold text-gray-900 mt-2">
                      {stat. value}
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

        {/* Cities Table */}
        <Card className="p-6 bg-white">
          {isLoading ? (
            <DataTableSkeleton
              columnCount={8}
              searchableColumnCount={1}
              filterableColumnCount={1}
              rowCount={10}
            />
          ) : (
            <DataTable
              columns={cityColumns}
              data={cities}
              searchableColumns={[
                {
                  id: 'name',
                  title: 'cities',
                },
              ]}
              filterableColumns={[
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
                  <div className="flex items-center gap-2">
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
                        <CheckCircle className="mr-2 h-4 w-4" />
                      )}
                      Activate
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
                        <XCircle className="mr-2 h-4 w-4" />
                      )}
                      Deactivate
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleBulkDelete(selectedRows)}
                      disabled={bulkAction. isPending}
                      className="h-10 text-red-600 hover:text-red-700"
                    >
                      {bulkAction.isPending ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="mr-2 h-4 w-4" />
                      )}
                      Delete ({selectedRows.length})
                    </Button>
                  </div>
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
                    onClick={() => router.push(
                      countryIdFilter 
                        ? `/admin/locations/cities/new?countryId=${countryIdFilter}` 
                        : '/admin/locations/cities/new'
                    )}
                    className="h-10 bg-brand hover:bg-brand-dark border border-black text-white font-bold"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add City
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