'use client';

import { AdminLayout } from '@/components/admin/admin-layout';
import { CreateEventForm } from '@/components/admin/events/create-event-form';
import { Card } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

export default function CreateEventPage() {
  const router = useRouter();

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
              Create New Event
            </h1>
            <p className="text-gray-600 mt-1">
              Fill in the details to create a new event
            </p>
          </div>
        </div>

        {/* Form */}
        <Card className="p-6 bg-white">
          <CreateEventForm />
        </Card>
      </div>
    </AdminLayout>
  );
}