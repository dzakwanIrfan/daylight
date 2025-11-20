'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Partner } from '@/types/partner.types';
import { Loader2, AlertTriangle } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { useAdminPartnerMutations } from '@/hooks/use-partners';
import { useState, useEffect } from 'react';

interface DeletePartnerDialogProps {
  partner: Partner;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DeletePartnerDialog({ partner, open, onOpenChange }: DeletePartnerDialogProps) {
  const [hardDelete, setHardDelete] = useState(false);
  const { deletePartner } = useAdminPartnerMutations();

  useEffect(() => {
    if (!open) {
      setHardDelete(false);
    }
  }, [open]);

  useEffect(() => {
    if (deletePartner.isSuccess) {
      onOpenChange(false);
    }
  }, [deletePartner.isSuccess, onOpenChange]);

  const handleDelete = () => {
    deletePartner.mutate({ id: partner.id, hardDelete });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] bg-white">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="h-5 w-5" />
            Delete Partner
          </DialogTitle>
          <DialogDescription>
            This action will {hardDelete ? 'permanently delete' : 'deactivate'} the partner.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="p-4 bg-red-50 rounded-lg border border-red-200">
            <p className="text-sm font-medium text-gray-900">{partner.name}</p>
            <p className="text-xs text-gray-600 mt-1">{partner.type} • {partner.city}</p>
            {partner.totalEvents > 0 && (
              <p className="text-xs text-yellow-700 mt-2">
                ⚠️ This partner has {partner.totalEvents} associated event(s)
              </p>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="hardDelete"
              checked={hardDelete}
              onCheckedChange={(checked) => setHardDelete(checked as boolean)}
              disabled={partner.totalEvents > 0}
            />
            <Label
              htmlFor="hardDelete"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Permanently delete (cannot be undone)
            </Label>
          </div>

          {partner.totalEvents > 0 && hardDelete && (
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-xs text-yellow-800">
                ⚠️ Cannot permanently delete partner with associated events. Please remove or reassign events first.
              </p>
            </div>
          )}

          {hardDelete && partner.totalEvents === 0 && (
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-xs text-yellow-800">
                ⚠️ Warning: This will permanently remove all partner data and cannot be recovered.
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={deletePartner.isPending}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={deletePartner.isPending || (hardDelete && partner.totalEvents > 0)}
          >
            {deletePartner.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {hardDelete ? 'Delete Permanently' : 'Deactivate'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}