'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AdminCountry } from '@/types/admin-location.types';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { format } from 'date-fns';
import { Globe, Phone, Banknote, MapPin } from 'lucide-react';

interface CountryDetailsDialogProps {
  country: AdminCountry;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CountryDetailsDialog({ country, open, onOpenChange }: CountryDetailsDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] bg-white max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Country Details</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-brand/10 rounded-lg flex items-center justify-center">
              <Globe className="w-8 h-8 text-brand" />
            </div>
            <div>
              <h3 className="font-semibold text-xl text-gray-900">{country.name}</h3>
              <Badge variant="outline" className="font-mono text-brand mt-1">
                {country.code}
              </Badge>
            </div>
          </div>

          <Separator />

          {/* Details Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2 text-gray-500 mb-2">
                <Banknote className="w-4 h-4" />
                <span className="text-sm font-medium">Currency</span>
              </div>
              <p className="text-lg font-semibold text-gray-900">{country.currency}</p>
            </div>

            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2 text-gray-500 mb-2">
                <Phone className="w-4 h-4" />
                <span className="text-sm font-medium">Phone Code</span>
              </div>
              <p className="text-lg font-semibold text-gray-900">{country.phoneCode}</p>
            </div>

            <div className="col-span-2 p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2 text-gray-500 mb-2">
                <MapPin className="w-4 h-4" />
                <span className="text-sm font-medium">Cities</span>
              </div>
              <p className="text-lg font-semibold text-gray-900">
                {country._count?. cities || 0} {(country._count?.cities || 0) === 1 ? 'city' : 'cities'}
              </p>
            </div>
          </div>

          <Separator />

          {/* Metadata */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="font-medium text-gray-500">Created At</p>
              <p className="text-gray-900 mt-1">{format(new Date(country.createdAt), 'PPP p')}</p>
            </div>
            <div>
              <p className="font-medium text-gray-500">Updated At</p>
              <p className="text-gray-900 mt-1">{format(new Date(country.updatedAt), 'PPP p')}</p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}