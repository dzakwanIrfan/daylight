'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AdminCountry } from '@/types/admin-location.types';
import { Loader2, AlertTriangle } from 'lucide-react';
import { useAdminCountryMutations } from '@/hooks/use-admin-locations';
import { useEffect } from 'react';

interface DeleteCountryDialogProps {
  country: AdminCountry;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DeleteCountryDialog({ country, open, onOpenChange }: DeleteCountryDialogProps) {
  const { deleteCountry } = useAdminCountryMutations();

  useEffect(() => {
    if (deleteCountry. isSuccess) {
      onOpenChange(false);
    }
  }, [deleteCountry.isSuccess, onOpenChange]);

  const handleDelete = () => {
    deleteCountry.mutate(country.id);
  };

  const hasCities = (country._count?.cities || 0) > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] bg-white">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="h-5 w-5" />
            Delete Country
          </DialogTitle>
          <DialogDescription>
            {hasCities 
              ? 'This country cannot be deleted because it has cities associated with it.'
              : 'This action will permanently delete this country. '}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="p-4 bg-red-50 rounded-lg border border-red-200">
            <p className="text-sm font-medium text-gray-900">
              {country.name} ({country.code})
            </p>
            <p className="text-xs text-gray-600 mt-1">
              Currency: {country.currency} | Phone: {country.phoneCode}
            </p>
            {hasCities && (
              <p className="text-xs text-red-600 mt-2 font-medium">
                {country._count?.cities} {country._count?.cities === 1 ? 'city' : 'cities'} associated
              </p>
            )}
          </div>

          {! hasCities && (
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
            disabled={deleteCountry. isPending}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={deleteCountry.isPending || hasCities}
          >
            {deleteCountry.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Delete Country
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}