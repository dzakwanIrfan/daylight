'use client';

import { AdminLayout } from '@/components/admin/admin-layout';
import { CreateCountryForm } from '@/components/admin/locations/countries/create-country-form';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

export default function CreateCountryPage() {
  const router = useRouter();

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router. back()}
            className="h-10"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl md:text-3xl font-headline font-bold text-gray-900">
              Add New Country
            </h1>
            <p className="text-gray-600 mt-1">
              Fill in the details to add a new country
            </p>
          </div>
        </div>

        {/* Form */}
        <CreateCountryForm />
      </div>
    </AdminLayout>
  );
}