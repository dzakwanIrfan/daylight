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
import { Loader2, X, Upload, MapPin } from 'lucide-react';
import { useAdminPartnerMutations } from '@/hooks/use-partners';
import { useCityOptions } from '@/hooks/use-admin-locations';
import { PartnerType, PartnerStatus, UpdatePartnerInput, Partner } from '@/types/partner.types';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';

interface EditPartnerFormProps {
  partner: Partner;
}

export function EditPartnerForm({ partner }: EditPartnerFormProps) {
  const router = useRouter();
  const { updatePartner, uploadLogo, uploadCover, uploadGalleryImage, removeGalleryImage } = useAdminPartnerMutations();
  const [tags, setTags] = useState<string[]>(partner.tags || []);
  const [tagInput, setTagInput] = useState('');
  const [amenities, setAmenities] = useState<string[]>(partner.amenities || []);
  const [amenityInput, setAmenityInput] = useState('');

  // Fetch cities using existing hook
  const { data: cities, isLoading: citiesLoading } = useCityOptions();

  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
    watch,
    setValue,
  } = useForm<UpdatePartnerInput>({
    defaultValues: {
      name: partner.name,
      type: partner.type,
      description: partner.description,
      shortDescription: partner.shortDescription,
      address: partner.address,
      city: partner.city,
      cityId: partner.cityId,
      phoneNumber: partner.phoneNumber,
      email: partner.email,
      website: partner.website,
      googleMapsUrl: partner.googleMapsUrl,
      latitude: partner.latitude,
      longitude: partner.longitude,
      status: partner.status,
      isActive: partner.isActive,
      isPreferred: partner.isPreferred,
      isFeatured: partner.isFeatured,
      instagram: partner.instagram,
      facebook: partner.facebook,
      twitter: partner.twitter,
    },
  });

  // Watch cityId to auto-fill city name
  const selectedCityId = watch('cityId');
  useEffect(() => {
    if (selectedCityId && cities && cities.length > 0) {
      const selectedCity = cities.find((c) => c.id === selectedCityId);
      if (selectedCity) {
        setValue('city', selectedCity.name);
      }
    }
  }, [selectedCityId, cities, setValue]);

  useEffect(() => {
    if (updatePartner.isSuccess) {
      router.push('/admin/partners');
    }
  }, [updatePartner.isSuccess, router]);

  const onSubmit = (data: UpdatePartnerInput) => {
    updatePartner.mutate({
      id: partner.id,
      data: {
        ...data,
        tags,
        amenities,
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

  const addAmenity = () => {
    if (amenityInput.trim() && !amenities.includes(amenityInput.trim())) {
      setAmenities([...amenities, amenityInput.trim()]);
      setAmenityInput('');
    }
  };

  const removeAmenity = (amenity: string) => {
    setAmenities(amenities.filter((a) => a !== amenity));
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      uploadLogo.mutate({ partnerId: partner.id, file });
    }
  };

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      uploadCover.mutate({ partnerId: partner.id, file });
    }
  };

  const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      uploadGalleryImage.mutate({ partnerId: partner.id, file });
    }
  };

  const handleRemoveGalleryImage = (imageUrl: string) => {
    if (confirm('Are you sure you want to remove this image?')) {
      removeGalleryImage.mutate({ partnerId: partner.id, imageUrl });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {/* Media Upload */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Media</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Logo */}
          <div className="space-y-2">
            <Label>Logo</Label>
            {partner.logo && (
              <div className="relative w-32 h-32 rounded-lg overflow-hidden bg-gray-100 mb-2">
                <Image
                  src={partner.logo}
                  alt={partner.name}
                  fill
                  className="object-cover"
                />
              </div>
            )}
            <div className="flex items-center gap-2">
              <Input
                id="logo-upload"
                type="file"
                accept="image/*"
                onChange={handleLogoUpload}
                className="hidden"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => document.getElementById('logo-upload')?.click()}
                disabled={uploadLogo.isPending}
              >
                {uploadLogo.isPending ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Upload className="h-4 w-4 mr-2" />
                )}
                Upload Logo
              </Button>
            </div>
          </div>

          {/* Cover Image */}
          <div className="space-y-2">
            <Label>Cover Image</Label>
            {partner.coverImage && (
              <div className="relative w-full h-32 rounded-lg overflow-hidden bg-gray-100 mb-2">
                <Image
                  src={partner.coverImage}
                  alt={partner.name}
                  fill
                  className="object-cover"
                />
              </div>
            )}
            <div className="flex items-center gap-2">
              <Input
                id="cover-upload"
                type="file"
                accept="image/*"
                onChange={handleCoverUpload}
                className="hidden"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => document.getElementById('cover-upload')?.click()}
                disabled={uploadCover.isPending}
              >
                {uploadCover.isPending ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Upload className="h-4 w-4 mr-2" />
                )}
                Upload Cover
              </Button>
            </div>
          </div>
        </div>

        {/* Gallery */}
        <div className="space-y-2">
          <Label>Gallery</Label>
          {partner.gallery && partner.gallery.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-2">
              {partner.gallery.map((image, index) => (
                <div key={index} className="relative aspect-square rounded-lg overflow-hidden bg-gray-100 group">
                  <Image
                    src={image}
                    alt={`${partner.name} - ${index + 1}`}
                    fill
                    className="object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveGalleryImage(image)}
                    className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
          <div className="flex items-center gap-2">
            <Input
              id="gallery-upload"
              type="file"
              accept="image/*"
              onChange={handleGalleryUpload}
              className="hidden"
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => document.getElementById('gallery-upload')?.click()}
              disabled={uploadGalleryImage.isPending}
            >
              {uploadGalleryImage.isPending ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Upload className="h-4 w-4 mr-2" />
              )}
              Add to Gallery
            </Button>
          </div>
        </div>
      </div>

      {/* Basic Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Basic Information</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2 space-y-2">
            <Label htmlFor="name">Partner Name *</Label>
            <Input
              id="name"
              placeholder="e.g., Kopi Kenangan"
              {...register('name', { required: 'Name is required', minLength: 2 })}
            />
            {errors.name && (
              <p className="text-xs text-red-600">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">Type *</Label>
            <Controller
              name="type"
              control={control}
              rules={{ required: 'Type is required' }}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    <SelectItem value={PartnerType.BRAND}>Brand</SelectItem>
                    <SelectItem value={PartnerType.COMMUNITY}>Community</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
            {errors.type && (
              <p className="text-xs text-red-600">{errors.type.message}</p>
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
                    <SelectItem value={PartnerStatus.PENDING}>Pending</SelectItem>
                    <SelectItem value={PartnerStatus.ACTIVE}>Active</SelectItem>
                    <SelectItem value={PartnerStatus.INACTIVE}>Inactive</SelectItem>
                    <SelectItem value={PartnerStatus.REJECTED}>Rejected</SelectItem>
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
              {...register('shortDescription', { maxLength: 300 })}
            />
          </div>

          <div className="md:col-span-2 space-y-2">
            <Label htmlFor="description">Full Description</Label>
            <Textarea
              id="description"
              rows={5}
              placeholder="Describe the partner in detail..."
              {...register('description')}
            />
          </div>
        </div>
      </div>

      {/* Location - City Selector */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Location</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* City Selector */}
          <div className="md:col-span-2 space-y-2">
            <Label htmlFor="cityId">City *</Label>
            <Controller
              name="cityId"
              control={control}
              rules={{ required: 'City is required' }}
              render={({ field }) => (
                <Select 
                  value={field.value} 
                  onValueChange={field.onChange}
                  disabled={citiesLoading}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder={citiesLoading ? "Loading cities..." : "Select a city"}>
                      {field.value && cities && cities.length > 0 ?  (
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-gray-500" />
                          <span>{cities.find((c) => c.id === field.value)?.name}</span>
                        </div>
                      ) : (
                        "Select a city"
                      )}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent className="bg-white max-h-[300px]">
                    {!cities || cities.length === 0 ? (
                      <div className="p-4 text-sm text-gray-500 text-center">
                        No cities available
                      </div>
                    ) : (
                      cities.map((city) => (
                        <SelectItem key={city.id} value={city.id}>
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-gray-400" />
                            <span>{city.name}</span>
                          </div>
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.cityId && (
              <p className="text-xs text-red-600">{errors.cityId.message}</p>
            )}
            <p className="text-xs text-gray-500">
              Update the city location for this partner
            </p>
          </div>

          <div className="md:col-span-2 space-y-2">
            <Label htmlFor="address">Address *</Label>
            <Textarea
              id="address"
              rows={2}
              placeholder="Complete address"
              {...register('address', { required: 'Address is required', minLength: 10 })}
            />
            {errors.address && (
              <p className="text-xs text-red-600">{errors.address.message}</p>
            )}
          </div>

          <div className="space-y-2">
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
              placeholder="-6.2088"
              {...register('latitude', { valueAsNumber: true })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="longitude">Longitude</Label>
            <Input
              id="longitude"
              type="number"
              step="any"
              placeholder="106.8456"
              {...register('longitude', { valueAsNumber: true })}
            />
          </div>
        </div>
      </div>

      {/* Contact Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Contact Information</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="phoneNumber">Phone Number</Label>
            <Input
              id="phoneNumber"
              placeholder="+62 812 3456 7890"
              {...register('phoneNumber')}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="contact@partner.com"
              {...register('email')}
            />
          </div>

          <div className="md:col-span-2 space-y-2">
            <Label htmlFor="website">Website</Label>
            <Input
              id="website"
              type="url"
              placeholder="https://www.partner.com"
              {...register('website')}
            />
          </div>
        </div>
      </div>

      {/* Social Media */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Social Media</h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="instagram">Instagram</Label>
            <Input
              id="instagram"
              placeholder="@username"
              {...register('instagram')}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="facebook">Facebook</Label>
            <Input
              id="facebook"
              placeholder="facebook.com/page"
              {...register('facebook')}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="twitter">Twitter</Label>
            <Input
              id="twitter"
              placeholder="@username"
              {...register('twitter')}
            />
          </div>
        </div>
      </div>

      {/* Tags */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Tags</h3>

        <div className="space-y-2">
          <div className="flex gap-2">
            <Input
              placeholder="Add a tag (e.g., cozy, modern)"
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

      {/* Amenities */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Amenities</h3>

        <div className="space-y-2">
          <div className="flex gap-2">
            <Input
              placeholder="Add an amenity (e.g., WiFi, Parking)"
              value={amenityInput}
              onChange={(e) => setAmenityInput(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addAmenity();
                }
              }}
            />
            <Button type="button" onClick={addAmenity} variant="outline">
              Add
            </Button>
          </div>
          {amenities.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {amenities.map((amenity) => (
                <Badge key={amenity} variant="outline" className="pl-3 pr-1">
                  {amenity}
                  <button
                    type="button"
                    onClick={() => removeAmenity(amenity)}
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

      {/* Statistics */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Statistics</h3>
        
        <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
          <div>
            <p className="text-sm text-gray-600">Total Events</p>
            <p className="text-2xl font-bold text-gray-900">{partner.totalEvents}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">View Count</p>
            <p className="text-2xl font-bold text-gray-900">{partner.viewCount}</p>
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
            name="isPreferred"
            control={control}
            render={({ field }) => (
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isPreferred"
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
                <Label
                  htmlFor="isPreferred"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Preferred Partner (show badge)
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
          disabled={updatePartner.isPending}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={updatePartner.isPending}
          className="bg-brand hover:bg-brand-dark border border-black text-white font-bold"
        >
          {updatePartner.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Update Partner
        </Button>
      </div>

      {/* Hidden field for city name (auto-filled) */}
      <input type="hidden" {... register('city')} />
    </form>
  );
}