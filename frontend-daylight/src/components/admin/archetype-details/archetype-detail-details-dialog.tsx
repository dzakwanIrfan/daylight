'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AdminArchetypeDetail } from '@/types/admin-archetype-detail.types';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { format } from 'date-fns';

interface ArchetypeDetailDetailsDialogProps {
  archetypeDetail: AdminArchetypeDetail;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ArchetypeDetailDetailsDialog({ archetypeDetail, open, onOpenChange }: ArchetypeDetailDetailsDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] bg-white max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Archetype Detail</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <span className="text-6xl">{archetypeDetail.symbol}</span>
              <div>
                <h3 className="font-semibold text-2xl text-gray-900">
                  {archetypeDetail.name}
                </h3>
                <Badge variant="outline" className="mt-2">
                  {archetypeDetail.archetype.replace(/_/g, ' ')}
                </Badge>
              </div>
            </div>
          </div>

          <Separator />

          {/* Traits */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-3">
              Traits
            </h4>
            <div className="flex flex-wrap gap-2">
              {archetypeDetail.traits.map((trait, index) => (
                <Badge key={index} variant="secondary">
                  {trait}
                </Badge>
              ))}
            </div>
          </div>

          <Separator />

          {/* Description */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-3">
              Description
            </h4>
            <p className="text-sm text-gray-700 leading-relaxed">
              {archetypeDetail.description}
            </p>
          </div>

          <Separator />

          {/* Image Key */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">
              Image Key
            </h4>
            <code className="text-sm bg-gray-100 px-3 py-1 rounded">
              {archetypeDetail.imageKey}
            </code>
          </div>

          <Separator />

          {/* Metadata */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="font-medium text-gray-500">Created At</p>
              <p className="text-gray-900 mt-1">
                {format(new Date(archetypeDetail.createdAt), 'PPP p')}
              </p>
            </div>
            <div>
              <p className="font-medium text-gray-500">Updated At</p>
              <p className="text-gray-900 mt-1">
                {format(new Date(archetypeDetail.updatedAt), 'PPP p')}
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}