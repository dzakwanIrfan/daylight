'use client';

import { useForm, Controller } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2, X } from 'lucide-react';
import { useAdminEventMutations } from '@/hooks/use-admin-events';
import { EventCategory, EventStatus, UpdateEventInput, Event } from '@/types/event.types';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { ImageUpload } from '@/components/ui/image-upload';

interface EditEventFormProps {
  event: Event;
}

export function EditEventForm({ event }: EditEventFormProps) {
  const router = useRouter();
  const { updateEvent } = useAdminEventMutations();
  const [tags, setTags] = useState<string[]>(event.tags || []);
  const [tagInput, setTagInput] = useState('');
  const [requirements, setRequirements] = useState<string[]>(event.requirements || []);
  const [requirementInput, setRequirementInput] = useState('');
  const [highlights, setHighlights] = useState<string[]>(event.highlights || []);
  const [highlightInput, setHighlightInput] = useState('');
  const [bannerImage, setBannerImage] = useState<string>(event.bannerImage || '');

  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
    reset,
    setValue,
  } = useForm<UpdateEventInput>({
    defaultValues: {
      title: event.title,
      category: event.category,
      description: event.description,
      shortDescription: event.shortDescription,
      eventDate: format(new Date(event.eventDate), 'yyyy-MM-dd'),
      startTime: format(new Date(event.startTime), "yyyy-MM-dd'T'HH:mm"),
      endTime: format(new Date(event.endTime), "yyyy-MM-dd'T'HH:mm"),
      venue: event.venue,
      address: event.address,
      city: event.city,
      googleMapsUrl: event.googleMapsUrl,
      latitude: event.latitude,
      longitude: event.longitude,
      bannerImage: event.bannerImage,
      price: event.price,
      currency: event.currency,
      maxParticipants: event.maxParticipants,
      status: event.status,
      isActive: event.isActive,
      isFeatured: event.isFeatured,
      organizerName: event.organizerName,
      organizerContact: event.organizerContact,
    },
  });

  useEffect(() => {
    if (updateEvent.isSuccess) {
      router.push('/admin/events');
    }
  }, [updateEvent.isSuccess, router]);

  const onSubmit = (data: UpdateEventInput) => {
    updateEvent.mutate({
      id: event.id,
      data: {
        ...data,
        bannerImage,
        tags,
        requirements,
        highlights,
      },
    });
  };

  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const removeTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
  };

  const addRequirement = () => {
    if (requirementInput.trim() && !requirements.includes(requirementInput.trim())) {
      setRequirements([...requirements, requirementInput.trim()]);
      setRequirementInput('');
    }
  };

  const removeRequirement = (req: string) => {
    setRequirements(requirements.filter((r) => r !== req));
  };

  const addHighlight = () => {
    if (highlightInput.trim() && !highlights.includes(highlightInput.trim())) {
      setHighlights([...highlights, highlightInput.trim()]);
      setHighlightInput('');
    }
  };

  const removeHighlight = (highlight: string) => {
    setHighlights(highlights.filter((h) => h !== highlight));
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {/* Basic Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Basic Information</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2 space-y-2">
            <Label htmlFor="title">Event Title *</Label>
            <Input
              id="title"
              placeholder="e.g., Morning Yoga & Breakfast"
              {...register('title', { required: 'Title is required', minLength: 3 })}
            />
            {errors.title && (
              <p className="text-xs text-red-600">{errors.title.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category *</Label>
            <Controller
              name="category"
              control={control}
              rules={{ required: 'Category is required' }}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    <SelectItem value={EventCategory.DAYBREAK}>DayBreak</SelectItem>
                    <SelectItem value={EventCategory.DAYTRIP}>DayTrip</SelectItem>
                    <SelectItem value={EventCategory.DAYCARE}>DayCare</SelectItem>
                    <SelectItem value={EventCategory.DAYDREAM}>DayDream</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
            {errors.category && (
              <p className="text-xs text-red-600">{errors.category.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status *</Label>
            <Controller
              name="status"
              control={control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    <SelectItem value={EventStatus.DRAFT}>Draft</SelectItem>
                    <SelectItem value={EventStatus.PUBLISHED}>Published</SelectItem>
                    <SelectItem value={EventStatus.CANCELLED}>Cancelled</SelectItem>
                    <SelectItem value={EventStatus.COMPLETED}>Completed</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          <div className="md:col-span-2 space-y-2">
            <Label htmlFor="shortDescription">Short Description</Label>
            <Input
              id="shortDescription"
              placeholder="Brief one-line description"
              {...register('shortDescription', { maxLength: 500 })}
            />
          </div>

          <div className="md:col-span-2 space-y-2">
            <Label htmlFor="description">Full Description *</Label>
            <Textarea
              id="description"
              rows={5}
              placeholder="Describe the event in detail..."
              {...register('description', { required: 'Description is required', minLength: 10 })}
            />
            {errors.description && (
              <p className="text-xs text-red-600">{errors.description.message}</p>
            )}
          </div>
        </div>
      </div>

      {/* Date & Time */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Date & Time</h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="eventDate">Event Date *</Label>
            <Input
              id="eventDate"
              type="date"
              {...register('eventDate', { required: 'Event date is required' })}
            />
            {errors.eventDate && (
              <p className="text-xs text-red-600">{errors.eventDate.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="startTime">Start Time *</Label>
            <Input
              id="startTime"
              type="datetime-local"
              {...register('startTime', { required: 'Start time is required' })}
            />
            {errors.startTime && (
              <p className="text-xs text-red-600">{errors.startTime.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="endTime">End Time *</Label>
            <Input
              id="endTime"
              type="datetime-local"
              {...register('endTime', { required: 'End time is required' })}
            />
            {errors.endTime && (
              <p className="text-xs text-red-600">{errors.endTime.message}</p>
            )}
          </div>
        </div>
      </div>

      {/* Location */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Location</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="venue">Venue Name *</Label>
            <Input
              id="venue"
              placeholder="e.g., Ubud Yoga Studio"
              {...register('venue', { required: 'Venue is required', minLength: 3 })}
            />
            {errors.venue && (
              <p className="text-xs text-red-600">{errors.venue.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="city">City *</Label>
            <Input
              id="city"
              placeholder="e.g., Bali"
              {...register('city', { required: 'City is required', minLength: 2 })}
            />
            {errors.city && (
              <p className="text-xs text-red-600">{errors.city.message}</p>
            )}
          </div>

          <div className="md:col-span-2 space-y-2">
            <Label htmlFor="address">Full Address *</Label>
            <Textarea
              id="address"
              rows={2}
              placeholder="Complete address with street, district, etc."
              {...register('address', { required: 'Address is required', minLength: 10 })}
            />
            {errors.address && (
              <p className="text-xs text-red-600">{errors.address.message}</p>
            )}
          </div>

          <div className="md:col-span-2 space-y-2">
            <Label htmlFor="googleMapsUrl">Google Maps URL</Label>
            <Input
              id="googleMapsUrl"
              type="url"
              placeholder="https://maps.google.com/..."
              {...register('googleMapsUrl')}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="latitude">Latitude</Label>
            <Input
              id="latitude"
              type="number"
              step="any"
              placeholder="-8.4095"
              {...register('latitude', { valueAsNumber: true })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="longitude">Longitude</Label>
            <Input
              id="longitude"
              type="number"
              step="any"
              placeholder="115.1889"
              {...register('longitude', { valueAsNumber: true })}
            />
          </div>
        </div>
      </div>

      {/* Pricing & Capacity */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Pricing & Capacity</h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="price">Price *</Label>
            <Input
              id="price"
              type="number"
              min="0"
              placeholder="0"
              {...register('price', { required: 'Price is required', min: 0, valueAsNumber: true })}
            />
            {errors.price && (
              <p className="text-xs text-red-600">{errors.price.message}</p>
            )}
            <p className="text-xs text-gray-500">Set 0 for free events</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="currency">Currency *</Label>
            <Input
              id="currency"
              placeholder="IDR"
              {...register('currency')}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="maxParticipants">Max Participants *</Label>
            <Input
              id="maxParticipants"
              type="number"
              min="1"
              placeholder="50"
              {...register('maxParticipants', { required: 'Max participants is required', min: 1, valueAsNumber: true })}
            />
            {errors.maxParticipants && (
              <p className="text-xs text-red-600">{errors.maxParticipants.message}</p>
            )}
          </div>
        </div>

        <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-sm text-blue-800">
            Current participants: <strong>{event.currentParticipants}</strong> / {event.maxParticipants}
          </p>
        </div>
      </div>

      {/* Media */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Banner Image</h3>

        <ImageUpload
          value={bannerImage}
          onChange={(url) => {
            setBannerImage(url);
            setValue('bannerImage', url);
          }}
          onRemove={() => {
            setBannerImage('');
            setValue('bannerImage', '');
          }}
          disabled={updateEvent.isPending}
          endpoint={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/events/upload/banner`}
          maxSize={5}
        />
      </div>

      {/* Tags */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Tags</h3>

        <div className="space-y-2">
          <div className="flex gap-2">
            <Input
              placeholder="Add a tag (e.g., outdoor, wellness)"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addTag();
                }
              }}
            />
            <Button type="button" onClick={addTag} variant="outline">
              Add
            </Button>
          </div>
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="pl-3 pr-1">
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="ml-2 hover:bg-gray-300 rounded-full p-0.5"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Requirements */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Requirements</h3>

        <div className="space-y-2">
          <div className="flex gap-2">
            <Input
              placeholder="Add a requirement (e.g., Bring yoga mat)"
              value={requirementInput}
              onChange={(e) => setRequirementInput(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addRequirement();
                }
              }}
            />
            <Button type="button" onClick={addRequirement} variant="outline">
              Add
            </Button>
          </div>
          {requirements.length > 0 && (
            <ul className="list-disc list-inside space-y-1 mt-2">
              {requirements.map((req, index) => (
                <li key={index} className="text-sm text-gray-700 flex items-center justify-between">
                  <span>{req}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeRequirement(req)}
                    className="h-6 w-6 p-0"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Highlights */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Highlights</h3>

        <div className="space-y-2">
          <div className="flex gap-2">
            <Input
              placeholder="Add a highlight (e.g., Certified instructor)"
              value={highlightInput}
              onChange={(e) => setHighlightInput(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addHighlight();
                }
              }}
            />
            <Button type="button" onClick={addHighlight} variant="outline">
              Add
            </Button>
          </div>
          {highlights.length > 0 && (
            <ul className="list-disc list-inside space-y-1 mt-2">
              {highlights.map((highlight, index) => (
                <li key={index} className="text-sm text-gray-700 flex items-center justify-between">
                  <span>{highlight}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeHighlight(highlight)}
                    className="h-6 w-6 p-0"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Organizer */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Organizer Information</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="organizerName">Organizer Name</Label>
            <Input
              id="organizerName"
              placeholder="e.g., John Doe"
              {...register('organizerName')}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="organizerContact">Organizer Contact</Label>
            <Input
              id="organizerContact"
              placeholder="e.g., +62 812 3456 7890"
              {...register('organizerContact')}
            />
          </div>
        </div>
      </div>

      {/* Settings */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Settings</h3>

        <div className="space-y-3">
          <Controller
            name="isActive"
            control={control}
            render={({ field }) => (
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isActive"
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
                <Label
                  htmlFor="isActive"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Active (visible to users)
                </Label>
              </div>
            )}
          />

          <Controller
            name="isFeatured"
            control={control}
            render={({ field }) => (
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isFeatured"
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
                <Label
                  htmlFor="isFeatured"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Featured (highlight on homepage)
                </Label>
              </div>
            )}
          />
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex items-center justify-end gap-4 pt-6 border-t">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={updateEvent.isPending}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={updateEvent.isPending}
          className="bg-brand hover:bg-brand-dark border border-black text-white font-bold"
        >
          {updateEvent.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Update Event
        </Button>
      </div>
    </form>
  );
}