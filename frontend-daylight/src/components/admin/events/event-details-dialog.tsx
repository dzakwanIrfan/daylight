'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Event, EventCategory, EventStatus } from '@/types/event.types';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { format } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';
import { MapPin, Calendar, Clock, Users, DollarSign, Tag, Star } from 'lucide-react';

interface EventDetailsDialogProps {
  event: Event;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const categoryColors: Record<EventCategory, string> = {
  DAYBREAK: 'bg-orange-100 text-orange-800 border-orange-200',
  DAYTRIP: 'bg-blue-100 text-blue-800 border-blue-200',
  DAYCARE: 'bg-green-100 text-green-800 border-green-200',
  DAYDREAM: 'bg-purple-100 text-purple-800 border-purple-200',
};

const statusColors: Record<EventStatus, string> = {
  DRAFT: 'bg-gray-100 text-gray-800 border-gray-200',
  PUBLISHED: 'bg-green-100 text-green-800 border-green-200',
  CANCELLED: 'bg-red-100 text-red-800 border-red-200',
  COMPLETED: 'bg-blue-100 text-blue-800 border-blue-200',
};

export function EventDetailsDialog({ event, open, onOpenChange }: EventDetailsDialogProps) {
  const eventDate = new Date(event.eventDate);
  const startTime = new Date(event.startTime);
  const endTime = new Date(event.endTime);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto bg-white">
        <DialogHeader>
          <DialogTitle className="text-xl">{event.title}</DialogTitle>
          <div className="flex gap-2 mt-2">
            <Badge variant="outline" className={categoryColors[event.category]}>
              {event.category}
            </Badge>
            <Badge variant="outline" className={statusColors[event.status]}>
              {event.status}
            </Badge>
            {event.isFeatured && (
              <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                <Star className="h-3 w-3 mr-1" />
                Featured
              </Badge>
            )}
            <Badge variant={event.isActive ? 'default' : 'secondary'}>
              {event.isActive ? 'Active' : 'Inactive'}
            </Badge>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          {/* Description */}
          <div>
            <h4 className="font-semibold text-sm text-gray-700 mb-2">Description</h4>
            <p className="text-sm text-gray-600 leading-relaxed">
              {event.description}
            </p>
          </div>

          <Separator />

          {/* Event Details Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Calendar className="h-4 w-4" />
                <span className="font-medium">Date</span>
              </div>
              <p className="text-sm text-gray-900 ml-6">
                {format(eventDate, 'EEEE, dd MMMM yyyy', { locale: idLocale })}
              </p>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Clock className="h-4 w-4" />
                <span className="font-medium">Time</span>
              </div>
              <p className="text-sm text-gray-900 ml-6">
                {format(startTime, 'HH:mm')} - {format(endTime, 'HH:mm')} WIB
              </p>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <MapPin className="h-4 w-4" />
                <span className="font-medium">Location</span>
              </div>
              <p className="text-sm text-gray-900 ml-6">{event.venue}</p>
              <p className="text-xs text-gray-500 ml-6">{event.city}</p>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Users className="h-4 w-4" />
                <span className="font-medium">Participants</span>
              </div>
              <p className="text-sm text-gray-900 ml-6">
                {event.currentParticipants} / {event.maxParticipants}
              </p>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <DollarSign className="h-4 w-4" />
                <span className="font-medium">Price</span>
              </div>
              <p className="text-sm text-gray-900 ml-6">
                {event.price === 0 
                  ? 'FREE' 
                  : `${event.currency} ${event.price.toLocaleString('id-ID')}`
                }
              </p>
            </div>
          </div>

          {/* Address */}
          <div>
            <h4 className="font-semibold text-sm text-gray-700 mb-2">Full Address</h4>
            <p className="text-sm text-gray-600">{event.address}</p>
            {event.googleMapsUrl && (
              <a 
                href={event.googleMapsUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-sm text-brand hover:underline mt-1 inline-block"
              >
                View on Google Maps →
              </a>
            )}
          </div>

          {/* Tags */}
          {event.tags.length > 0 && (
            <div>
              <h4 className="font-semibold text-sm text-gray-700 mb-2">Tags</h4>
              <div className="flex flex-wrap gap-2">
                {event.tags.map((tag, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    <Tag className="h-3 w-3 mr-1" />
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Highlights */}
          {event.highlights.length > 0 && (
            <div>
              <h4 className="font-semibold text-sm text-gray-700 mb-2">Highlights</h4>
              <ul className="list-disc list-inside space-y-1">
                {event.highlights.map((highlight, index) => (
                  <li key={index} className="text-sm text-gray-600">{highlight}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Requirements */}
          {event.requirements.length > 0 && (
            <div>
              <h4 className="font-semibold text-sm text-gray-700 mb-2">Requirements</h4>
              <ul className="list-disc list-inside space-y-1">
                {event.requirements.map((req, index) => (
                  <li key={index} className="text-sm text-gray-600">{req}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Organizer */}
          {event.organizerName && (
            <div>
              <h4 className="font-semibold text-sm text-gray-700 mb-2">Organizer</h4>
              <p className="text-sm text-gray-900">{event.organizerName}</p>
              {event.organizerContact && (
                <p className="text-sm text-gray-600">{event.organizerContact}</p>
              )}
            </div>
          )}

          <Separator />

          {/* Metadata */}
          <div className="grid grid-cols-2 gap-4 text-xs text-gray-500">
            <div>
              <span className="font-medium">Created:</span>{' '}
              {format(new Date(event.createdAt), 'PPP', { locale: idLocale })}
            </div>
            <div>
              <span className="font-medium">Updated:</span>{' '}
              {format(new Date(event.updatedAt), 'PPP', { locale: idLocale })}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}