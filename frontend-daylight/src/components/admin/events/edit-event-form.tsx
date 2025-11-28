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
import { Loader2, X, Building2, CheckCircle2, AlertCircle } from 'lucide-react';
import { useAdminEventMutations } from '@/hooks/use-admin-events';
import { EventCategory, EventStatus, UpdateEventInput, Event } from '@/types/event.types';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { useAvailablePartners } from '@/hooks/use-partners';
import { 
  localDateTimeToISO, 
  isoToLocalDate,
  isoToLocalDateTime,
  isEndTimeAfterStartTime,
  calculateDurationInHours 
} from '@/lib/timezone';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { cn } from '@/lib/utils';
import { PartnerType } from '@/types/partner.types';
import { FormFieldError } from '@/components/ui/form-field-error';
import { useFormError } from '@/hooks/use-form-error';

interface EditEventFormProps {
  event: Event & { partnerId?: string | null };
}

interface FormData {
  title: string;
  category: EventCategory;
  description: string;
  shortDescription?: string;
  eventDate: string;
  startTime: string;
  endTime: string;
  venue: string;
  address: string;
  city: string;
  googleMapsUrl?: string;
  latitude?: number;
  longitude?: number;
  price: number;
  currency: string;
  status: EventStatus;
  isActive: boolean;
  isFeatured: boolean;
  organizerName?: string;
  organizerContact?: string;
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
  const [timeValidationError, setTimeValidationError] = useState<string>('');
  const [generalError, setGeneralError] = useState<string>('');
  
  // Partner selection
  const { data: availablePartners, isLoading: isLoadingPartners } = useAvailablePartners();
  const [selectedPartner, setSelectedPartner] = useState<string | null>(event.partnerId || null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
    setValue,
    watch,
    setError,
    clearErrors,
  } = useForm<FormData>({
    defaultValues: {
      title: event.title,
      category: event.category,
      description: event.description,
      shortDescription: event.shortDescription,
      eventDate: isoToLocalDate(event.eventDate),
      startTime: isoToLocalDateTime(event.startTime),
      endTime: isoToLocalDateTime(event.endTime),
      venue: event.venue,
      address: event.address,
      city: event.city,
      googleMapsUrl: event.googleMapsUrl,
      latitude: event.latitude,
      longitude: event.longitude,
      price: event.price,
      currency: event.currency,
      status: event.status,
      isActive: event.isActive,
      isFeatured: event.isFeatured,
      organizerName: event.organizerName,
      organizerContact: event.organizerContact,
    },
  });

  const { handleError } = useFormError<FormData>(setError, {
    showToast: true,
    toastTitle: 'Failed to update event',
  });

  const startTime = watch('startTime');
  const endTime = watch('endTime');

  // Validate time range
  useEffect(() => {
    if (startTime && endTime) {
      if (!isEndTimeAfterStartTime(startTime, endTime)) {
        setTimeValidationError('End time must be after start time');
      } else {
        setTimeValidationError('');
      }
    }
  }, [startTime, endTime]);

  useEffect(() => {
    if (updateEvent.isSuccess) {
      router.push('/admin/events');
    }
  }, [updateEvent.isSuccess, router]);

  // Handle mutation error
  useEffect(() => {
    if (updateEvent.error) {
      const apiError = handleError(updateEvent.error);
      if (!apiError.hasFieldErrors()) {
        setGeneralError(apiError.primaryMessage);
      }
    } else {
      setGeneralError('');
    }
  }, [updateEvent.error, handleError]);

  const onSubmit = (data: FormData) => {
    // Clear previous errors
    setGeneralError('');
    clearErrors();

    // Validate times
    if (!isEndTimeAfterStartTime(data.startTime, data.endTime)) {
      setTimeValidationError('End time must be after start time');
      return;
    }

    // Convert local datetime to ISO with timezone
    const eventData: UpdateEventInput = {
      ...data,
      eventDate: localDateTimeToISO(data.eventDate + 'T00:00'),
      startTime: localDateTimeToISO(data.startTime),
      endTime: localDateTimeToISO(data.endTime),
      partnerId: selectedPartner || undefined,
      tags,
      requirements,
      highlights,
    };

    updateEvent.mutate({
      id: event.id,
      data: eventData,
    });
  };

  const handlePartnerSelect = (partnerId: string) => {
    if (partnerId === '') {
      setSelectedPartner(null);
      return;
    }
    
    const partner = availablePartners?.find(p => p.id === partnerId);
    if (partner) {
      setSelectedPartner(partnerId);
      setValue('venue', partner.name);
      setValue('address', partner.address);
      setValue('city', partner.city);
      clearErrors(['venue', 'address', 'city']);
    }
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
      {/* General Error Alert */}
      {generalError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{generalError}</AlertDescription>
        </Alert>
      )}

      {/* Basic Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Basic Information</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2 space-y-2">
            <Label htmlFor="title">Event Title *</Label>
            <Input
              id="title"
              placeholder="e.g., Morning Yoga & Breakfast"
              className={cn(errors.title && 'border-red-500 focus-visible:ring-red-500')}
              {...register('title', { required: 'Title is required', minLength: { value: 3, message: 'Title must be at least 3 characters' } })}
            />
            <FormFieldError message={errors.title?.message} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category *</Label>
            <Controller
              name="category"
              control={control}
              rules={{ required: 'Category is required' }}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className={cn(errors.category && 'border-red-500')}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    <SelectItem value={EventCategory.DAYBREAK}>DayBreak</SelectItem>
                    <SelectItem value={EventCategory.DAYTRIP}>DayTrip</SelectItem>
                    <SelectItem value={EventCategory.DAYCARE}>DayCare</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
            <FormFieldError message={errors.category?.message} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status *</Label>
            <Controller
              name="status"
              control={control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className={cn(errors.status && 'border-red-500')}>
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
            <FormFieldError message={errors.status?.message} />
          </div>

          <div className="md:col-span-2 space-y-2">
            <Label htmlFor="shortDescription">Short Description</Label>
            <Input
              id="shortDescription"
              placeholder="Brief one-line description"
              className={cn(errors.shortDescription && 'border-red-500 focus-visible:ring-red-500')}
              {...register('shortDescription', { maxLength: { value: 500, message: 'Short description must be less than 500 characters' } })}
            />
            <FormFieldError message={errors.shortDescription?.message} />
          </div>

          <div className="md:col-span-2 space-y-2">
            <Label htmlFor="description">Full Description *</Label>
            <Textarea
              id="description"
              rows={5}
              placeholder="Describe the event in detail..."
              className={cn(errors.description && 'border-red-500 focus-visible:ring-red-500')}
              {...register('description', { 
                required: 'Description is required', 
                minLength: { value: 10, message: 'Description must be at least 10 characters' } 
              })}
            />
            <FormFieldError message={errors.description?.message} />
          </div>
        </div>
      </div>

      {/* Date & Time */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Date & Time</h3>

        {timeValidationError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{timeValidationError}</AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="eventDate">Event Date *</Label>
            <Input
              id="eventDate"
              type="date"
              className={cn(errors.eventDate && 'border-red-500 focus-visible:ring-red-500')}
              {...register('eventDate', { required: 'Event date is required' })}
            />
            <FormFieldError message={errors.eventDate?.message} />
            <p className="text-xs text-gray-500">Timezone: Asia/Jakarta (WIB)</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="startTime">Start Time *</Label>
            <Input
              id="startTime"
              type="datetime-local"
              className={cn(errors.startTime && 'border-red-500 focus-visible:ring-red-500')}
              {...register('startTime', { required: 'Start time is required' })}
            />
            <FormFieldError message={errors.startTime?.message} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="endTime">End Time *</Label>
            <Input
              id="endTime"
              type="datetime-local"
              className={cn(errors.endTime && 'border-red-500 focus-visible:ring-red-500')}
              {...register('endTime', { required: 'End time is required' })}
            />
            <FormFieldError message={errors.endTime?.message} />
          </div>
        </div>

        {startTime && endTime && !timeValidationError && (
          <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-800">
              Duration: <strong>{calculateDurationInHours(startTime, endTime).toFixed(1)} hours</strong>
            </p>
          </div>
        )}
      </div>

      {/* Location - WITH PARTNER SELECTION */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Location</h3>

        {/* Partner Selection */}
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg space-y-3">
          <div className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-brand" />
            <Label className="text-sm font-semibold text-gray-900">
              Select from Partners (Optional)
            </Label>
          </div>
          <p className="text-xs text-gray-600">
            Choose a partner to auto-fill venue details
          </p>
          
          {isLoadingPartners ? (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading partners...
            </div>
          ) : (
            <Select value={selectedPartner || ''} onValueChange={handlePartnerSelect}>
              <SelectTrigger className="bg-white">
                <SelectValue placeholder="Select a partner" />
              </SelectTrigger>
              <SelectContent className="bg-white max-h-[300px]">
                {availablePartners?.map((partner) => (
                  <SelectItem key={partner.id} value={partner.id}>
                    <div className="flex items-center gap-2">
                      <span>{partner.name}</span>
                      {partner.isPreferred && (
                        <Badge className={cn("text-xs px-1.5 py-0", 
                          partner?.type === PartnerType.BRAND ? "bg-green-100 text-green-700 border-green-200" : "bg-amber-50 text-amber-400 border-amber-300"
                        )}>
                          <CheckCircle2 className="h-3 w-3 mr-0.5" />
                          Preferred {partner?.type === PartnerType.BRAND ? 'Brand' : 'Community'}
                        </Badge>
                      )}
                      <span className="text-xs text-gray-500">• {partner.city}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="venue">Venue Name *</Label>
            <Input
              id="venue"
              placeholder="e.g., Ubud Yoga Studio"
              className={cn(errors.venue && 'border-red-500 focus-visible:ring-red-500')}
              {...register('venue', { 
                required: 'Venue is required', 
                minLength: { value: 3, message: 'Venue must be at least 3 characters' } 
              })}
            />
            <FormFieldError message={errors.venue?.message} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="city">City *</Label>
            <Input
              id="city"
              placeholder="e.g., Bali"
              className={cn(errors.city && 'border-red-500 focus-visible:ring-red-500')}
              {...register('city', { 
                required: 'City is required', 
                minLength: { value: 2, message: 'City must be at least 2 characters' } 
              })}
            />
            <FormFieldError message={errors.city?.message} />
          </div>

          <div className="md:col-span-2 space-y-2">
            <Label htmlFor="address">Full Address *</Label>
            <Textarea
              id="address"
              rows={2}
              placeholder="Complete address with street, district, etc."
              className={cn(errors.address && 'border-red-500 focus-visible:ring-red-500')}
              {...register('address', { 
                required: 'Address is required', 
                minLength: { value: 10, message: 'Address must be at least 10 characters' } 
              })}
            />
            <FormFieldError message={errors.address?.message} />
          </div>

          <div className="md:col-span-2 space-y-2">
            <Label htmlFor="googleMapsUrl">Google Maps URL</Label>
            <Input
              id="googleMapsUrl"
              type="url"
              placeholder="https://maps.google.com/..."
              className={cn(errors.googleMapsUrl && 'border-red-500 focus-visible:ring-red-500')}
              {...register('googleMapsUrl')}
            />
            <FormFieldError message={errors.googleMapsUrl?.message} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="latitude">Latitude</Label>
            <Input
              id="latitude"
              type="number"
              step="any"
              placeholder="-8.4095"
              className={cn(errors.latitude && 'border-red-500 focus-visible:ring-red-500')}
              {...register('latitude', { valueAsNumber: true })}
            />
            <FormFieldError message={errors.latitude?.message} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="longitude">Longitude</Label>
            <Input
              id="longitude"
              type="number"
              step="any"
              placeholder="115.1889"
              className={cn(errors.longitude && 'border-red-500 focus-visible:ring-red-500')}
              {...register('longitude', { valueAsNumber: true })}
            />
            <FormFieldError message={errors.longitude?.message} />
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
              className={cn(errors.price && 'border-red-500 focus-visible:ring-red-500')}
              {...register('price', { 
                required: 'Price is required', 
                min: { value: 0, message: 'Price cannot be negative' }, 
                valueAsNumber: true 
              })}
            />
            <FormFieldError message={errors.price?.message} />
            <p className="text-xs text-gray-500">Set 0 for free events</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="currency">Currency *</Label>
            <Input
              id="currency"
              placeholder="IDR"
              className={cn(errors.currency && 'border-red-500 focus-visible:ring-red-500')}
              {...register('currency')}
            />
            <FormFieldError message={errors.currency?.message} />
          </div>
        </div>

        <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-sm text-blue-800">
            Current participants: <strong>{event.currentParticipants}</strong>
          </p>
        </div>
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
              className={cn(errors.organizerName && 'border-red-500 focus-visible:ring-red-500')}
              {...register('organizerName')}
            />
            <FormFieldError message={errors.organizerName?.message} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="organizerContact">Organizer Contact</Label>
            <Input
              id="organizerContact"
              placeholder="e.g., +62 812 3456 7890"
              className={cn(errors.organizerContact && 'border-red-500 focus-visible:ring-red-500')}
              {...register('organizerContact')}
            />
            <FormFieldError message={errors.organizerContact?.message} />
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
          disabled={updateEvent.isPending || !!timeValidationError}
          className="bg-brand hover:bg-brand-dark border border-black text-white font-bold"
        >
          {updateEvent.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Update Event
        </Button>
      </div>
    </form>
  );
}