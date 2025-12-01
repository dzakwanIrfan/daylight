'use client';

import { AdminLayout } from '@/components/admin/admin-layout';
import { EditCountryForm } from '@/components/admin/locations/countries/edit-country-form';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter, useParams } from 'next/navigation';
import { useAdminCountry } from '@/hooks/use-admin-locations';

export default function EditCountryPage() {
  const router = useRouter();
  const params = useParams();
  const countryId = params. id as string;

  const { data: country, isLoading, error } = useAdminCountry(countryId);

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-[50vh]">
          <Loader2 className="h-8 w-8 animate-spin text-brand" />
        </div>
      </AdminLayout>
    );
  }

  if (error || !country) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-[50vh]">
          <div className="text-center">
            <p className="text-red-600 mb-4">Failed to load country</p>
            <Button onClick={() => router.back()}>Go Back</Button>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.back()}
            className="h-10"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl md:text-3xl font-headline font-bold text-gray-900">
              Edit Country
            </h1>
            <p className="text-gray-600 mt-1">
              Update country details
            </p>
          </div>
        </div>

        {/* Form */}
        <EditCountryForm country={country} />
      </div>
    </AdminLayout>
  );
}