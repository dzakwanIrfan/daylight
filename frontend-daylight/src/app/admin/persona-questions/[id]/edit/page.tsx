'use client';

import { AdminLayout } from '@/components/admin/admin-layout';
import { EditQuestionForm } from '@/components/admin/persona-questions/edit-question-form';
import { Card } from '@/components/ui/card';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter, useParams } from 'next/navigation';
import { useAdminPersonaQuestion } from '@/hooks/use-admin-persona-questions';

export default function EditPersonaQuestionPage() {
  const router = useRouter();
  const params = useParams();
  const questionId = params.id as string;

  const { data: question, isLoading, error } = useAdminPersonaQuestion(questionId);

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-[50vh]">
          <Loader2 className="h-8 w-8 animate-spin text-brand" />
        </div>
      </AdminLayout>
    );
  }

  if (error || !question) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-[50vh]">
          <div className="text-center">
            <p className="text-red-600 mb-4">Failed to load question</p>
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
              Edit Persona Question
            </h1>
            <p className="text-gray-600 mt-1">
              Update question details and options
            </p>
          </div>
        </div>

        {/* Form */}
        <EditQuestionForm question={question} />
      </div>
    </AdminLayout>
  );
}