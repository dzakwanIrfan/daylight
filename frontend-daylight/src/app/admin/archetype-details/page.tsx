'use client';

import { useMemo, useState } from 'react';
import { AdminLayout } from '@/components/admin/admin-layout';
import { DataTable } from '@/components/data-table/data-table';
import { DataTableSkeleton } from '@/components/data-table/data-table-skeleton';
import { columns } from '@/components/admin/archetype-details/columns';
import { Card } from '@/components/ui/card';
import { Sparkles, RefreshCw, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAdminArchetypeDetails, useAdminArchetypeDetailMutations } from '@/hooks/use-admin-archetype-details';

export default function AdminArchetypeDetailsPage() {
  const [isSeedingConfirm, setIsSeedingConfirm] = useState(false);

  const { data: archetypeDetailsResponse, isLoading, error } = useAdminArchetypeDetails({ limit: 100 });
  const archetypeDetails = archetypeDetailsResponse?.data || [];

  const { seedArchetypeDetails } = useAdminArchetypeDetailMutations();

  // Calculate stats
  const stats = useMemo(() => {
    if (!archetypeDetails.length) return { total: 0 };
    
    return {
      total: archetypeDetails.length,
    };
  }, [archetypeDetails]);

  const handleSeed = () => {
    if (isSeedingConfirm) {
      seedArchetypeDetails.mutate();
      setIsSeedingConfirm(false);
    } else {
      setIsSeedingConfirm(true);
      setTimeout(() => setIsSeedingConfirm(false), 3000);
    }
  };

  if (error) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-[50vh]">
          <div className="text-center">
            <p className="text-red-600 mb-4">Failed to load archetype details</p>
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
            Archetype Details Management
          </h1>
          <p className="text-gray-600 mt-1">
            Manage personality archetype information and descriptions
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-6 bg-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Total Archetypes
                </p>
                <h3 className="text-2xl font-bold text-gray-900 mt-2">
                  {stats.total}
                </h3>
              </div>
              <div className="bg-brand/10 text-brand p-3 rounded-lg">
                <Sparkles className="w-6 h-6" />
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Database Status
                </p>
                <h3 className="text-lg font-bold text-green-600 mt-2">
                  Active
                </h3>
              </div>
              <div className="bg-green-50 text-green-600 p-3 rounded-lg">
                <RefreshCw className="w-6 h-6" />
              </div>
            </div>
          </Card>
        </div>

        {/* Archetype Details Table */}
        <Card className="p-6 bg-white">
          {isLoading ? (
            <DataTableSkeleton
              columnCount={6}
              searchableColumnCount={1}
              filterableColumnCount={0}
              rowCount={10}
            />
          ) : (
            <DataTable
              columns={columns}
              data={archetypeDetails}
              searchableColumns={[
                {
                  id: 'name',
                  title: 'archetype names',
                },
              ]}
              newRowAction={
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleSeed}
                    disabled={seedArchetypeDetails.isPending}
                    className={`h-10 ${isSeedingConfirm ? 'border-orange-500 text-orange-600' : ''}`}
                  >
                    {seedArchetypeDetails.isPending ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <RefreshCw className="mr-2 h-4 w-4" />
                    )}
                    {isSeedingConfirm ? 'Click again to confirm' : 'Seed/Reset Data'}
                  </Button>
                </div>
              }
            />
          )}
        </Card>

        {/* Info Card */}
        <Card className="p-4 bg-blue-50 border-blue-200">
          <div className="flex items-start gap-3">
            <Sparkles className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <h4 className="font-semibold text-blue-900 text-sm">About Archetype Details</h4>
              <p className="text-xs text-blue-800 mt-1">
                Archetype details are used to describe personality types in the personality test results. 
                You can edit the symbol, name, traits, and description for each archetype. 
                Use the "Seed/Reset Data" button to restore default values if needed.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </AdminLayout>
  );
}