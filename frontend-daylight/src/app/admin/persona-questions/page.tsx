'use client';

import { useState, useMemo } from 'react';
import { AdminLayout } from '@/components/admin/admin-layout';
import { DataTable } from '@/components/data-table/data-table';
import { DataTableSkeleton } from '@/components/data-table/data-table-skeleton';
import { columns } from '@/components/admin/persona-questions/columns';
import { Card } from '@/components/ui/card';
import { HelpCircle, CheckCircle, XCircle, Download, Plus, Loader2, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useAdminPersonaQuestions, useAdminPersonaQuestionMutations } from '@/hooks/use-admin-persona-questions';
import { useRouter } from 'next/navigation';
import { AdminPersonaQuestion, PersonaQuestionBulkActionType } from '@/types/admin-persona-question.types';
import { personaQuestionService } from '@/services/persona-questions.service';
import { format } from 'date-fns';

export default function AdminPersonaQuestionsPage() {
  const router = useRouter();
  const [isExporting, setIsExporting] = useState(false);

  const { data: questionsResponse, isLoading, error } = useAdminPersonaQuestions({ limit: 1000 });
  const questions = questionsResponse?.data || [];

  const { bulkAction } = useAdminPersonaQuestionMutations();

  // Calculate stats
  const stats = useMemo(() => {
    if (!questions.length) return { total: 0, active: 0, inactive: 0, totalOptions: 0 };
    
    return {
      total: questions.length,
      active: questions.filter(q => q.isActive).length,
      inactive: questions.filter(q => !q.isActive).length,
      totalOptions: questions.reduce((sum, q) => sum + q.options.length, 0),
    };
  }, [questions]);

  const handleExport = async () => {
    try {
      setIsExporting(true);
      const exportQuestions = await personaQuestionService.exportPersonaQuestions({});
      
      const headers = [
        'Question Number', 'Order', 'Section', 'Type', 'Prompt', 
        'Options Count', 'Status', 'Created At'
      ];
      const csvContent = [
        headers.join(','),
        ...exportQuestions.map(q => [
          q.questionNumber,
          q.order,
          q.section,
          q.type,
          `"${q.prompt.replace(/"/g, '""')}"`,
          q.options.length,
          q.isActive ? 'Active' : 'Inactive',
          format(new Date(q.createdAt), 'dd/MM/yyyy HH:mm'),
        ].join(',')),
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `persona-questions-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);

      toast.success('Questions exported successfully');
    } catch (error) {
      toast.error('Failed to export questions');
    } finally {
      setIsExporting(false);
    }
  };

  const handleBulkDelete = async (selectedQuestions: AdminPersonaQuestion[]) => {
    if (selectedQuestions.length === 0) return;

    if (!confirm(`Are you sure you want to delete ${selectedQuestions.length} question(s)? This action cannot be undone.`)) {
      return;
    }

    bulkAction.mutate({
      questionIds: selectedQuestions.map(q => q.id),
      action: PersonaQuestionBulkActionType.DELETE,
    });
  };

  const statsCards = [
    {
      title: 'Total Questions',
      value: stats.total,
      icon: HelpCircle,
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
    {
      title: 'Total Options',
      value: stats.totalOptions,
      icon: HelpCircle,
      color: 'text-brand',
      bg: 'bg-brand/10',
    },
  ];

  if (error) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-[50vh]">
          <div className="text-center">
            <p className="text-red-600 mb-4">Failed to load questions</p>
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
            Persona Questions Management
          </h1>
          <p className="text-gray-600 mt-1">
            Manage personality assessment questions and answer options
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

        {/* Questions Table */}
        <Card className="p-6 bg-white">
          {isLoading ? (
            <DataTableSkeleton
              columnCount={6}
              searchableColumnCount={1}
              filterableColumnCount={1}
              rowCount={10}
            />
          ) : (
            <DataTable
              columns={columns}
              data={questions}
              searchableColumns={[
                {
                  id: 'prompt',
                  title: 'questions',
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
                    onClick={() => router.push('/admin/persona-questions/new')}
                    className="h-10 bg-brand hover:bg-brand-dark border border-black text-white font-bold"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Create Question
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