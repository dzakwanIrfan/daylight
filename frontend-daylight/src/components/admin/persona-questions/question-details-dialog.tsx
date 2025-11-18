'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AdminPersonaQuestion } from '@/types/admin-persona-question.types';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { format } from 'date-fns';

interface QuestionDetailsDialogProps {
  question: AdminPersonaQuestion;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function QuestionDetailsDialog({ question, open, onOpenChange }: QuestionDetailsDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] bg-white max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Question Details</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Info */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-2xl font-bold text-brand">
                  #{question.questionNumber}
                </span>
                <Badge className="ml-3" variant={question.isActive ? 'default' : 'secondary'}>
                  {question.isActive ? 'Active' : 'Inactive'}
                </Badge>
              </div>
              <Badge variant="outline">Order: {question.order}</Badge>
            </div>

            <div>
              <h3 className="font-semibold text-lg text-gray-900">
                {question.prompt}
              </h3>
              <div className="flex gap-2 mt-2">
                <Badge variant="outline">{question.section}</Badge>
                <Badge variant="outline">{question.type}</Badge>
              </div>
            </div>
          </div>

          <Separator />

          {/* Options */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-3">
              Options ({question.options.length})
            </h4>
            <div className="space-y-3">
              {question.options.map((option, index) => (
                <div key={option.id} className="p-4 bg-gray-50 rounded-lg border">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="secondary" className="text-xs">
                          {option.optionKey}
                        </Badge>
                        <span className="text-sm font-medium text-gray-700">
                          Option {index + 1}
                        </span>
                      </div>
                      <p className="text-sm text-gray-900">{option.text}</p>
                    </div>
                  </div>
                  {option.traitImpacts && Object.keys(option.traitImpacts).length > 0 && (
                    <div className="mt-3 pt-3 border-t">
                      <p className="text-xs font-medium text-gray-500 mb-2">Trait Impacts:</p>
                      <pre className="text-xs bg-white p-2 rounded border overflow-x-auto">
                        {JSON.stringify(option.traitImpacts, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Metadata */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="font-medium text-gray-500">Created At</p>
              <p className="text-gray-900 mt-1">
                {format(new Date(question.createdAt), 'PPP p')}
              </p>
            </div>
            <div>
              <p className="font-medium text-gray-500">Updated At</p>
              <p className="text-gray-900 mt-1">
                {format(new Date(question.updatedAt), 'PPP p')}
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}