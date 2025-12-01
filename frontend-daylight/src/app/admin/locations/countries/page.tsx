'use client';

import { useState, useMemo } from 'react';
import { AdminLayout } from '@/components/admin/admin-layout';
import { DataTable } from '@/components/data-table/data-table';
import { DataTableSkeleton } from '@/components/data-table/data-table-skeleton';
import { countryColumns } from '@/components/admin/locations/countries/columns';
import { Card } from '@/components/ui/card';
import { Globe, MapPin, Download, Plus, Loader2, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useAdminCountries, useAdminCountryMutations } from '@/hooks/use-admin-locations';
import { useRouter } from 'next/navigation';
import { AdminCountry, CountryBulkActionType } from '@/types/admin-location.types';
import { locationService } from '@/services/location.service';
import { format } from 'date-fns';

export default function AdminCountriesPage() {
  const router = useRouter();
  const [isExporting, setIsExporting] = useState(false);

  const { data: countriesResponse, isLoading, error } = useAdminCountries({ limit: 1000 });
  const countries = countriesResponse?.data || [];

  const { bulkAction } = useAdminCountryMutations();

  // Calculate stats
  const stats = useMemo(() => {
    if (!countries. length) return { total: 0, totalCities: 0 };
    
    return {
      total: countries.length,
      totalCities: countries.reduce((sum, c) => sum + (c._count?. cities || 0), 0),
    };
  }, [countries]);

  const handleExport = async () => {
    try {
      setIsExporting(true);
      const exportData = await locationService.exportCountries({});
      
      const headers = ['Code', 'Name', 'Currency', 'Phone Code', 'Cities', 'Created At'];
      const csvContent = [
        headers.join(','),
        ... exportData.map(c => [
          c.code,
          `"${c.name}"`,
          c.currency,
          c.phoneCode,
          c._count?.cities || 0,
          format(new Date(c.createdAt), 'dd/MM/yyyy HH:mm'),
        ].join(',')),
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `countries-${new Date().toISOString().split('T')[0]}.csv`;
      a. click();
      window.URL.revokeObjectURL(url);

      toast.success('Countries exported successfully');
    } catch (error) {
      toast.error('Failed to export countries');
    } finally {
      setIsExporting(false);
    }
  };

  const handleBulkDelete = async (selectedCountries: AdminCountry[]) => {
    if (selectedCountries.length === 0) return;

    // Check if any has cities
    const countriesWithCities = selectedCountries.filter(c => (c._count?.cities || 0) > 0);
    if (countriesWithCities.length > 0) {
      toast.error(`${countriesWithCities.length} countries have cities and cannot be deleted`);
      return;
    }

    if (! confirm(`Are you sure you want to delete ${selectedCountries.length} country(ies)?  This action cannot be undone.`)) {
      return;
    }

    bulkAction. mutate({
      countryIds: selectedCountries.map(c => c.id),
      action: CountryBulkActionType.DELETE,
    });
  };

  const statsCards = [
    {
      title: 'Total Countries',
      value: stats.total,
      icon: Globe,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
    },
    {
      title: 'Total Cities',
      value: stats. totalCities,
      icon: MapPin,
      color: 'text-brand',
      bg: 'bg-brand/10',
    },
  ];

  if (error) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-[50vh]">
          <div className="text-center">
            <p className="text-red-600 mb-4">Failed to load countries</p>
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
              Countries Management
            </h1>
            <p className="text-gray-600 mt-1">
              Manage countries for international support
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => router.push('/admin/locations/cities')}
          >
            <MapPin className="mr-2 h-4 w-4" />
            View Cities
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

        {/* Countries Table */}
        <Card className="p-6 bg-white">
          {isLoading ? (
            <DataTableSkeleton
              columnCount={7}
              searchableColumnCount={1}
              filterableColumnCount={0}
              rowCount={10}
            />
          ) : (
            <DataTable
              columns={countryColumns}
              data={countries}
              searchableColumns={[
                {
                  id: 'name',
                  title: 'countries',
                },
              ]}
              filterableColumns={[]}
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
                    onClick={() => router.push('/admin/locations/countries/new')}
                    className="h-10 bg-brand hover:bg-brand-dark border border-black text-white font-bold"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Country
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