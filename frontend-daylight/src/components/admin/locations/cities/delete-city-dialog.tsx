'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AdminCity } from '@/types/admin-location.types';
import { Loader2, AlertTriangle } from 'lucide-react';
import { useAdminCityMutations } from '@/hooks/use-admin-locations';
import { useEffect } from 'react';

interface DeleteCityDialogProps {
  city: AdminCity;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DeleteCityDialog({ city, open, onOpenChange }: DeleteCityDialogProps) {
  const { deleteCity } = useAdminCityMutations();

  useEffect(() => {
    if (deleteCity.isSuccess) {
      onOpenChange(false);
    }
  }, [deleteCity.isSuccess, onOpenChange]);

  const handleDelete = () => {
    deleteCity.mutate(city.id);
  };

  const hasUsage = (city._count?.users || 0) > 0 || (city._count?.events || 0) > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] bg-white">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="h-5 w-5" />
            Delete City
          </DialogTitle>
          <DialogDescription>
            {hasUsage 
              ? 'This city cannot be deleted because it has users or events associated with it.'
              : 'This action will permanently delete this city. '}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="p-4 bg-red-50 rounded-lg border border-red-200">
            <p className="text-sm font-medium text-gray-900">
              {city.name}
            </p>
            <p className="text-xs text-gray-600 mt-1">
              {city.country?.name} | {city.timezone}
            </p>
            {hasUsage && (
              <div className="mt-2 text-xs text-red-600 font-medium">
                <p>{city._count?.users || 0} users associated</p>
                <p>{city._count?.events || 0} events associated</p>
              </div>
            )}
          </div>

          {! hasUsage && (
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-xs text-yellow-800">
                ⚠️ Warning: This action cannot be undone. 
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={deleteCity.isPending}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={deleteCity.isPending || hasUsage}
          >
            {deleteCity.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Delete City
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}