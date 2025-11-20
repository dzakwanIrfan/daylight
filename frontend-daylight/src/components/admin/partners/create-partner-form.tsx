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
import { Loader2, X, Upload, Image as ImageIcon } from 'lucide-react';
import { useAdminPartnerMutations } from '@/hooks/use-partners';
import { PartnerType, PartnerStatus, CreatePartnerInput } from '@/types/partner.types';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import { toast } from 'sonner';
import apiClient from '@/lib/axios';

export function CreatePartnerForm() {
  const router = useRouter();
  const { createPartner } = useAdminPartnerMutations();
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [amenities, setAmenities] = useState<string[]>([]);
  const [amenityInput, setAmenityInput] = useState('');

  // Image upload states
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [galleryFiles, setGalleryFiles] = useState<File[]>([]);
  const [galleryPreviews, setGalleryPreviews] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const logoInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
  } = useForm<CreatePartnerInput>({
    defaultValues: {
      type: PartnerType.RESTAURANT,
      status: PartnerStatus.PENDING,
      isActive: true,
      isPreferred: false,
      isFeatured: false,
    },
  });

  useEffect(() => {
    if (createPartner.isSuccess) {
      router.push('/admin/partners');
    }
  }, [createPartner.isSuccess, router]);

  // Logo upload handler
  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Logo file size must be less than 5MB');
        return;
      }
      if (!['image/jpeg', 'image/png', 'image/jpg', 'image/webp'].includes(file.type)) {
        toast.error('Logo must be JPG, PNG, or WEBP format');
        return;
      }
      setLogoFile(file);
      setLogoPreview(URL.createObjectURL(file));
    }
  };

  // Cover upload handler
  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error('Cover file size must be less than 10MB');
        return;
      }
      if (!['image/jpeg', 'image/png', 'image/jpg', 'image/webp'].includes(file.type)) {
        toast.error('Cover must be JPG, PNG, or WEBP format');
        return;
      }
      setCoverFile(file);
      setCoverPreview(URL.createObjectURL(file));
    }
  };

  // Gallery upload handler
  const handleGalleryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    if (galleryFiles.length + files.length > 10) {
      toast.error('Maximum 10 gallery images allowed');
      return;
    }

    const validFiles: File[] = [];
    const previews: string[] = [];

    files.forEach(file => {
      if (file.size > 10 * 1024 * 1024) {
        toast.error(`${file.name} exceeds 10MB size limit`);
        return;
      }
      if (!['image/jpeg', 'image/png', 'image/jpg', 'image/webp'].includes(file.type)) {
        toast.error(`${file.name} must be JPG, PNG, or WEBP format`);
        return;
      }
      validFiles.push(file);
      previews.push(URL.createObjectURL(file));
    });

    setGalleryFiles([...galleryFiles, ...validFiles]);
    setGalleryPreviews([...galleryPreviews, ...previews]);
  };

  const removeGalleryImage = (index: number) => {
    setGalleryFiles(galleryFiles.filter((_, i) => i !== index));
    setGalleryPreviews(galleryPreviews.filter((_, i) => i !== index));
  };

  // Upload images function
  const uploadImages = async () => {
    const uploadedUrls: { logo?: string; cover?: string; gallery?: string[] } = {};

    try {
      // Upload logo
      if (logoFile) {
        const formData = new FormData();
        formData.append('file', logoFile);
        const response = await apiClient.post('/uploads/file', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        uploadedUrls.logo = response.data.url;
      }

      // Upload cover
      if (coverFile) {
        const formData = new FormData();
        formData.append('file', coverFile);
        const response = await apiClient.post('/uploads/file', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        uploadedUrls.cover = response.data.url;
      }

      // Upload gallery
      if (galleryFiles.length > 0) {
        const galleryUrls: string[] = [];
        for (const file of galleryFiles) {
          const formData = new FormData();
          formData.append('file', file);
          const response = await apiClient.post('/uploads/file', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
          });
          galleryUrls.push(response.data.url);
        }
        uploadedUrls.gallery = galleryUrls;
      }

      return uploadedUrls;
    } catch (error) {
      console.error('Upload error:', error);
      throw new Error('Failed to upload images');
    }
  };

  const onSubmit = async (data: CreatePartnerInput) => {
    try {
      setIsUploading(true);

      // Upload images first
      const uploadedUrls = await uploadImages();

      // Create partner with uploaded image URLs
      createPartner.mutate({
        ...data,
        logo: uploadedUrls.logo,
        coverImage: uploadedUrls.cover,
        gallery: uploadedUrls.gallery,
        tags,
        amenities,
      });
    } catch (error) {
      toast.error('Failed to upload images. Please try again.');
    } finally {
      setIsUploading(false);
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

  const addAmenity = () => {
    if (amenityInput.trim() && !amenities.includes(amenityInput.trim())) {
      setAmenities([...amenities, amenityInput.trim()]);
      setAmenityInput('');
    }
  };

  const removeAmenity = (amenity: string) => {
    setAmenities(amenities.filter((a) => a !== amenity));
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {/* Media Upload */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Media</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Logo Upload */}
          <div className="space-y-2">
            <Label>Logo</Label>
            <p className="text-xs text-gray-500">Recommended: Square, 500x500px, Max 5MB</p>
            
            {logoPreview ? (
              <div className="relative w-32 h-32 rounded-lg overflow-hidden bg-gray-100 border-2 border-brand">
                <Image
                  src={logoPreview}
                  alt="Logo preview"
                  fill
                  className="object-cover"
                />
                <button
                  type="button"
                  onClick={() => {
                    setLogoFile(null);
                    setLogoPreview(null);
                  }}
                  className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ) : (
              <div
                onClick={() => logoInputRef.current?.click()}
                className="w-32 h-32 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-brand hover:bg-gray-50 transition-colors"
              >
                <ImageIcon className="h-8 w-8 text-gray-400 mb-2" />
                <span className="text-xs text-gray-500">Click to upload</span>
              </div>
            )}

            <input
              ref={logoInputRef}
              type="file"
              accept="image/*"
              onChange={handleLogoChange}
              className="hidden"
            />
          </div>

          {/* Cover Upload */}
          <div className="space-y-2">
            <Label>Cover Image</Label>
            <p className="text-xs text-gray-500">Recommended: 1920x1080px, Max 10MB</p>
            
            {coverPreview ? (
              <div className="relative w-full h-32 rounded-lg overflow-hidden bg-gray-100 border-2 border-brand">
                <Image
                  src={coverPreview}
                  alt="Cover preview"
                  fill
                  className="object-cover"
                />
                <button
                  type="button"
                  onClick={() => {
                    setCoverFile(null);
                    setCoverPreview(null);
                  }}
                  className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ) : (
              <div
                onClick={() => coverInputRef.current?.click()}
                className="w-full h-32 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-brand hover:bg-gray-50 transition-colors"
              >
                <ImageIcon className="h-8 w-8 text-gray-400 mb-2" />
                <span className="text-xs text-gray-500">Click to upload</span>
              </div>
            )}

            <input
              ref={coverInputRef}
              type="file"
              accept="image/*"
              onChange={handleCoverChange}
              className="hidden"
            />
          </div>
        </div>

        {/* Gallery Upload */}
        <div className="space-y-2">
          <Label>Gallery (Max 10 images)</Label>
          <p className="text-xs text-gray-500">Max 10MB per image</p>
          
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {galleryPreviews.map((preview, index) => (
              <div key={index} className="relative aspect-square rounded-lg overflow-hidden bg-gray-100 border-2 border-brand">
                <Image
                  src={preview}
                  alt={`Gallery ${index + 1}`}
                  fill
                  className="object-cover"
                />
                <button
                  type="button"
                  onClick={() => removeGalleryImage(index)}
                  className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}

            {galleryFiles.length < 10 && (
              <div
                onClick={() => galleryInputRef.current?.click()}
                className="aspect-square border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-brand hover:bg-gray-50 transition-colors"
              >
                <Upload className="h-6 w-6 text-gray-400 mb-1" />
                <span className="text-xs text-gray-500">Add Photo</span>
              </div>
            )}
          </div>

          <input
            ref={galleryInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleGalleryChange}
            className="hidden"
          />
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
                    <SelectItem value={PartnerType.RESTAURANT}>Restaurant</SelectItem>
                    <SelectItem value={PartnerType.CAFE}>Cafe</SelectItem>
                    <SelectItem value={PartnerType.ART_GALLERY}>Art Gallery</SelectItem>
                    <SelectItem value={PartnerType.BRAND}>Brand</SelectItem>
                    <SelectItem value={PartnerType.COMMUNITY}>Community</SelectItem>
                    <SelectItem value={PartnerType.VENUE}>Venue</SelectItem>
                    <SelectItem value={PartnerType.SHOP}>Shop</SelectItem>
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

      {/* Location */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Location</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            <Label htmlFor="city">City *</Label>
            <Input
              id="city"
              placeholder="e.g., Jakarta"
              {...register('city', { required: 'City is required', minLength: 2 })}
            />
            {errors.city && (
              <p className="text-xs text-red-600">{errors.city.message}</p>
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
                  Preferred Partner (show green badge)
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
          disabled={createPartner.isPending || isUploading}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={createPartner.isPending || isUploading}
          className="bg-brand hover:bg-brand-dark border border-black text-white font-bold"
        >
          {(createPartner.isPending || isUploading) && (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          )}
          {isUploading ? 'Uploading...' : 'Create Partner'}
        </Button>
      </div>
    </form>
  );
}