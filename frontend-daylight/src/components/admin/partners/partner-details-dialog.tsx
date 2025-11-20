'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Partner, PartnerType, PartnerStatus } from '@/types/partner.types';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { format } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';
import { 
  MapPin, 
  Phone, 
  Mail, 
  Globe, 
  ExternalLink, 
  Award,
  Calendar,
  Eye,
  Tag
} from 'lucide-react';
import Image from 'next/image';

interface PartnerDetailsDialogProps {
  partner: Partner;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const typeColors: Record<PartnerType, string> = {
  RESTAURANT: 'bg-orange-100 text-orange-800 border-orange-200',
  ART_GALLERY: 'bg-purple-100 text-purple-800 border-purple-200',
  CAFE: 'bg-amber-100 text-amber-800 border-amber-200',
  BRAND: 'bg-blue-100 text-blue-800 border-blue-200',
  COMMUNITY: 'bg-green-100 text-green-800 border-green-200',
  VENUE: 'bg-pink-100 text-pink-800 border-pink-200',
  SHOP: 'bg-cyan-100 text-cyan-800 border-cyan-200',
};

const statusColors: Record<PartnerStatus, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  ACTIVE: 'bg-green-100 text-green-800 border-green-200',
  INACTIVE: 'bg-gray-100 text-gray-800 border-gray-200',
  REJECTED: 'bg-red-100 text-red-800 border-red-200',
};

export function PartnerDetailsDialog({ partner, open, onOpenChange }: PartnerDetailsDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto bg-white">
        <DialogHeader>
          <div className="flex items-start gap-4">
            {partner.logo && (
              <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                <Image
                  src={partner.logo}
                  alt={partner.name}
                  fill
                  className="object-cover"
                />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <DialogTitle className="text-xl">{partner.name}</DialogTitle>
              <div className="flex flex-wrap gap-2 mt-2">
                <Badge variant="outline" className={typeColors[partner.type]}>
                  {partner.type.replace('_', ' ')}
                </Badge>
                <Badge variant="outline" className={statusColors[partner.status]}>
                  {partner.status}
                </Badge>
                {partner.isPreferred && (
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                    <Award className="h-3 w-3 mr-1" />
                    Preferred Partner
                  </Badge>
                )}
                <Badge variant={partner.isActive ? 'default' : 'secondary'}>
                  {partner.isActive ? 'Active' : 'Inactive'}
                </Badge>
              </div>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          {/* Description */}
          {partner.description && (
            <div>
              <h4 className="font-semibold text-sm text-gray-700 mb-2">Description</h4>
              <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">
                {partner.description}
              </p>
            </div>
          )}

          <Separator />

          {/* Contact & Location */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <h4 className="font-semibold text-sm text-gray-700">Location</h4>
              <div className="space-y-2">
                <div className="flex items-start gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-gray-400 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-gray-900">{partner.address}</p>
                    <p className="text-gray-600">{partner.city}</p>
                  </div>
                </div>
                {partner.googleMapsUrl && (
                  <a
                    href={partner.googleMapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-sm text-brand hover:underline"
                  >
                    View on Google Maps
                    <ExternalLink className="h-3 w-3" />
                  </a>
                )}
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-semibold text-sm text-gray-700">Contact</h4>
              <div className="space-y-2">
                {partner.phoneNumber && (
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-900">{partner.phoneNumber}</span>
                  </div>
                )}
                {partner.email && (
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-900">{partner.email}</span>
                  </div>
                )}
                {partner.website && (
                  <div className="flex items-center gap-2 text-sm">
                    <Globe className="h-4 w-4 text-gray-400" />
                    <a
                      href={partner.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-brand hover:underline"
                    >
                      Visit Website
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Statistics */}
          <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 text-sm text-gray-600 mb-1">
                <Calendar className="h-4 w-4" />
                Total Events
              </div>
              <p className="text-2xl font-bold text-gray-900">{partner.totalEvents}</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 text-sm text-gray-600 mb-1">
                <Eye className="h-4 w-4" />
                Views
              </div>
              <p className="text-2xl font-bold text-gray-900">{partner.viewCount}</p>
            </div>
          </div>

          {/* Tags */}
          {partner.tags && partner.tags.length > 0 && (
            <div>
              <h4 className="font-semibold text-sm text-gray-700 mb-2">Tags</h4>
              <div className="flex flex-wrap gap-2">
                {partner.tags.map((tag, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    <Tag className="h-3 w-3 mr-1" />
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Amenities */}
          {partner.amenities && partner.amenities.length > 0 && (
            <div>
              <h4 className="font-semibold text-sm text-gray-700 mb-2">Amenities</h4>
              <div className="flex flex-wrap gap-2">
                {partner.amenities.map((amenity, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {amenity}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Gallery */}
          {partner.gallery && partner.gallery.length > 0 && (
            <div>
              <h4 className="font-semibold text-sm text-gray-700 mb-2">Gallery</h4>
              <div className="grid grid-cols-3 gap-2">
                {partner.gallery.map((image, index) => (
                  <div key={index} className="relative aspect-square rounded-lg overflow-hidden bg-gray-100">
                    <Image
                      src={image}
                      alt={`${partner.name} - ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          <Separator />

          {/* Metadata */}
          <div className="grid grid-cols-2 gap-4 text-xs text-gray-500">
            <div>
              <span className="font-medium">Created:</span>{' '}
              {format(new Date(partner.createdAt), 'PPP', { locale: idLocale })}
            </div>
            <div>
              <span className="font-medium">Updated:</span>{' '}
              {format(new Date(partner.updatedAt), 'PPP', { locale: idLocale })}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}