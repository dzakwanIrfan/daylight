'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AdminCity } from '@/types/admin-location.types';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { format } from 'date-fns';
import { MapPin, Clock, Users, Calendar, Globe } from 'lucide-react';

interface CityDetailsDialogProps {
  city: AdminCity;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CityDetailsDialog({ city, open, onOpenChange }: CityDetailsDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] bg-white max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>City Details</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-brand/10 rounded-lg flex items-center justify-center">
              <MapPin className="w-8 h-8 text-brand" />
            </div>
            <div>
              <h3 className="font-semibold text-xl text-gray-900">{city.name}</h3>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline" className="font-mono text-xs">
                  {city.slug}
                </Badge>
                <Badge variant={city.isActive ?  'default' : 'secondary'}>
                  {city.isActive ? 'Active' : 'Inactive'}
                </Badge>
              </div>
            </div>
          </div>

          <Separator />

          {/* Details Grid */}
          <div className="grid grid-cols-2 gap-4">
            {city.country && (
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2 text-gray-500 mb-2">
                  <Globe className="w-4 h-4" />
                  <span className="text-sm font-medium">Country</span>
                </div>
                <p className="text-lg font-semibold text-gray-900">{city.country. name}</p>
                <p className="text-xs text-gray-500 font-mono">{city.country.code}</p>
              </div>
            )}

            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2 text-gray-500 mb-2">
                <Clock className="w-4 h-4" />
                <span className="text-sm font-medium">Timezone</span>
              </div>
              <p className="text-lg font-semibold text-gray-900">{city. timezone}</p>
            </div>

            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2 text-gray-500 mb-2">
                <Users className="w-4 h-4" />
                <span className="text-sm font-medium">Users</span>
              </div>
              <p className="text-lg font-semibold text-gray-900">{city._count?.users || 0}</p>
            </div>

            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2 text-gray-500 mb-2">
                <Calendar className="w-4 h-4" />
                <span className="text-sm font-medium">Events</span>
              </div>
              <p className="text-lg font-semibold text-gray-900">{city._count?.events || 0}</p>
            </div>
          </div>

          <Separator />

          {/* Metadata */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="font-medium text-gray-500">Created At</p>
              <p className="text-gray-900 mt-1">{format(new Date(city.createdAt), 'PPP p')}</p>
            </div>
            <div>
              <p className="font-medium text-gray-500">Updated At</p>
              <p className="text-gray-900 mt-1">{format(new Date(city.updatedAt), 'PPP p')}</p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}