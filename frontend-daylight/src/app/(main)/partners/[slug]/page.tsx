'use client';

import { DashboardLayout } from '@/components/main/dashboard-layout';
import { usePublicPartner } from '@/hooks/use-partners';
import { useParams, useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  Loader2, 
  MapPin, 
  Phone, 
  Mail, 
  Globe, 
  Award,
  Calendar,
  ExternalLink,
  Instagram,
  Facebook,
  Twitter,
  Verified
} from 'lucide-react';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function PartnerProfilePage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  const { data: partner, isLoading } = usePublicPartner(slug);

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-brand" />
        </div>
      </DashboardLayout>
    );
  }

  if (!partner) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <h3 className="text-lg font-semibold mb-2">Partner not found</h3>
          <p className="text-sm text-gray-600 mb-4">
            The partner you're looking for doesn't exist
          </p>
          <button
            onClick={() => router.back()}
            className="text-brand hover:underline"
          >
            Go back
          </button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-4xl mx-auto py-4 px-4 sm:px-6">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-600 hover:text-brand transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm font-medium">Back</span>
        </button>

        {/* Cover Image */}
        {partner.coverImage && (
          <div className="relative w-full h-48 sm:h-64 rounded-xl overflow-hidden bg-gray-100">
            <Image
              src={partner.coverImage}
              alt={partner.name}
              fill
              className="object-cover"
            />
          </div>
        )}

        {/* Header */}
        <div className="flex items-start gap-4">
          {partner.logo && (
            <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden bg-gray-100 border-4 border-white shadow-lg shrink-0">
              <Image
                src={partner.logo}
                alt={partner.name}
                fill
                className="object-cover"
              />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <span className="flex items-center gap-2">
                  <span className="text-2xl sm:text-3xl font-bold text-gray-900 block">
                    {partner.name}
                  </span>
                  <Verified className="w-6 h-6 text-green-600 block" />
                </span>
                <div className="flex flex-wrap items-center gap-2 mt-2">
                  <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                    {partner.type.replace('_', ' ')}
                  </Badge>
                  {partner.isPreferred && (
                    <span className="inline-flex items-center gap-1 text-green-600 bg-transparent">
                      <Verified className="w-4 h-4" />
                      Preferred Partner
                    </span>
                  )}
                </div>
              </div>
            </div>
            {partner.shortDescription && (
              <p className="text-gray-600 mt-2 text-sm sm:text-base">
                {partner.shortDescription}
              </p>
            )}
          </div>
        </div>

        {/* Contact & Location Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Location */}
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-orange-50 flex items-center justify-center shrink-0">
                <MapPin className="w-5 h-5 text-brand" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs sm:text-sm text-gray-600 mb-1">Location</p>
                <p className="font-semibold text-sm sm:text-base text-gray-900 line-clamp-1">
                  {partner.city}
                </p>
                <p className="text-xs sm:text-sm text-gray-600 truncate">
                  {partner.address}
                </p>
                {partner.googleMapsUrl && (
                  <a
                    href={partner.googleMapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-brand text-xs sm:text-sm hover:underline inline-flex items-center gap-1 mt-1"
                  >
                    Open Maps
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Contact */}
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-orange-50 flex items-center justify-center shrink-0">
                <Phone className="w-5 h-5 text-brand" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs sm:text-sm text-gray-600 mb-1">Contact</p>
                {partner.phoneNumber && (
                  <p className="font-semibold text-sm sm:text-base text-gray-900 line-clamp-1">{partner.phoneNumber}</p>
                )}
                {partner.email && (
                  <p className="text-xs sm:text-sm text-gray-600 truncate">{partner.email}</p>
                )}
                {partner.website && (
                  <a
                    href={partner.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-brand text-xs sm:text-sm hover:underline inline-flex items-center gap-1 mt-1"
                  >
                    <Globe className="w-3 h-3" />
                    Visit Website
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Description */}
        {partner.description && (
          <div className="bg-white rounded-lg border border-gray-200 p-5 sm:p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">About</h2>
            <p className="text-gray-700 text-sm sm:text-base whitespace-pre-line leading-relaxed">
              {partner.description}
            </p>
          </div>
        )}

        {/* Amenities */}
        {partner.amenities && partner.amenities.length > 0 && (
          <div className="bg-white rounded-lg border border-gray-200 p-5 sm:p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Amenities</h2>
            <div className="flex flex-wrap gap-2">
              {partner.amenities.map((amenity, index) => (
                <Badge key={index} variant="outline" className="text-sm">
                  {amenity}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Gallery */}
        {partner.gallery && partner.gallery.length > 0 && (
          <div className="bg-white rounded-lg border border-gray-200 p-5 sm:p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Gallery</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {partner.gallery.map((image, index) => (
                <div key={index} className="relative aspect-square rounded-lg overflow-hidden bg-gray-100">
                  <Image
                    src={image}
                    alt={`${partner.name} - ${index + 1}`}
                    fill
                    className="object-cover hover:scale-105 transition-transform duration-300"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Social Media */}
        {(partner.instagram || partner.facebook || partner.twitter) && (
          <div className="bg-white rounded-lg border border-gray-200 p-5 sm:p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Follow Us</h2>
            <div className="flex gap-3">
              {partner.instagram && (
                <a
                  href={`https://instagram.com/${partner.instagram.replace('@', '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3 bg-brand text-white rounded-lg hover:bg-brand/90 transition-colors"
                >
                  <Instagram className="w-5 h-5" />
                </a>
              )}
              {partner.facebook && (
                <a
                  href={partner.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3 bg-brand text-white rounded-lg hover:bg-brand/90 transition-colors"
                >
                  <Facebook className="w-5 h-5" />
                </a>
              )}
              {partner.twitter && (
                <a
                  href={`https://twitter.com/${partner.twitter.replace('@', '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3 bg-brand text-white rounded-lg hover:bg-brand/90 transition-colors"
                >
                  <Twitter className="w-5 h-5" />
                </a>
              )}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}