'use client';

import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2 } from 'lucide-react';
import { AdminCity, UpdateCityPayload } from '@/types/admin-location.types';
import { useAdminCityMutations, useCountryOptions } from '@/hooks/use-admin-locations';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

const TIMEZONE_OPTIONS = [
  { value: 'Asia/Jakarta', label: 'Asia/Jakarta (WIB)' },
  { value: 'Asia/Makassar', label: 'Asia/Makassar (WITA)' },
  { value: 'Asia/Jayapura', label: 'Asia/Jayapura (WIT)' },
  { value: 'Asia/Singapore', label: 'Asia/Singapore' },
  { value: 'Asia/Kuala_Lumpur', label: 'Asia/Kuala_Lumpur' },
  { value: 'Asia/Bangkok', label: 'Asia/Bangkok' },
  { value: 'Asia/Ho_Chi_Minh', label: 'Asia/Ho_Chi_Minh' },
  { value: 'Asia/Manila', label: 'Asia/Manila' },
  { value: 'Asia/Tokyo', label: 'Asia/Tokyo' },
  { value: 'Asia/Seoul', label: 'Asia/Seoul' },
  { value: 'Asia/Shanghai', label: 'Asia/Shanghai' },
  { value: 'Asia/Hong_Kong', label: 'Asia/Hong_Kong' },
  { value: 'Asia/Dubai', label: 'Asia/Dubai' },
  { value: 'Australia/Sydney', label: 'Australia/Sydney' },
  { value: 'Europe/London', label: 'Europe/London' },
  { value: 'America/New_York', label: 'America/New_York' },
  { value: 'America/Los_Angeles', label: 'America/Los_Angeles' },
];

interface EditCityFormProps {
  city: AdminCity;
}

export function EditCityForm({ city }: EditCityFormProps) {
  const router = useRouter();
  const { updateCity } = useAdminCityMutations();
  const { data: countries, isLoading: isLoadingCountries } = useCountryOptions();

  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm<UpdateCityPayload>({
    defaultValues: {
      slug: city. slug,
      name: city.name,
      timezone: city.timezone,
      countryId: city.countryId,
      isActive: city.isActive,
    },
  });

  useEffect(() => {
    if (updateCity.isSuccess) {
      router. push('/admin/locations/cities');
    }
  }, [updateCity.isSuccess, router]);

  const onSubmit = (data: UpdateCityPayload) => {
    updateCity.mutate({
      id: city.id,
      data,
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Card className="p-6 bg-white">
        <h3 className="text-lg font-semibold mb-4">City Information</h3>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="name">City Name *</Label>
            <Input
              id="name"
              placeholder="Jakarta"
              {...register('name', { required: 'City name is required' })}
            />
            {errors.name && (
              <p className="text-xs text-red-600">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="slug">Slug *</Label>
            <Input
              id="slug"
              placeholder="jakarta"
              {...register('slug', { 
                required: 'Slug is required',
                pattern: {
                  value: /^[a-z0-9-]+$/,
                  message: 'Slug must be lowercase letters, numbers, and hyphens only'
                }
              })}
              className="font-mono"
            />
            {errors.slug && (
              <p className="text-xs text-red-600">{errors. slug.message}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="countryId">Country *</Label>
            <Select
              value={watch('countryId')}
              onValueChange={(value) => setValue('countryId', value)}
              disabled={isLoadingCountries}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select country" />
              </SelectTrigger>
              <SelectContent className="bg-white max-h-60">
                {countries?.map((country) => (
                  <SelectItem key={country.id} value={country.id}>
                    {country.code} - {country.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.countryId && (
              <p className="text-xs text-red-600">{errors. countryId.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="timezone">Timezone *</Label>
            <Select
              value={watch('timezone')}
              onValueChange={(value) => setValue('timezone', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select timezone" />
              </SelectTrigger>
              <SelectContent className="bg-white max-h-60">
                {TIMEZONE_OPTIONS. map((tz) => (
                  <SelectItem key={tz.value} value={tz. value}>
                    {tz.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.timezone && (
              <p className="text-xs text-red-600">{errors.timezone.message}</p>
            )}
          </div>
        </div>

        <div className="mt-4 space-y-2">
          <Label htmlFor="isActive">Status</Label>
          <Select
            value={watch('isActive') ? 'active' : 'inactive'}
            onValueChange={(value) => setValue('isActive', value === 'active')}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-white">
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* Stats Info */}
      <Card className="p-6 bg-gray-50">
        <h3 className="text-lg font-semibold mb-4">Statistics</h3>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <p className="text-sm text-gray-500">Users</p>
            <p className="text-2xl font-bold text-gray-900">{city._count?.users || 0}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Events</p>
            <p className="text-2xl font-bold text-gray-900">{city._count?.events || 0}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Created</p>
            <p className="text-sm font-medium text-gray-900">
              {new Date(city.createdAt).toLocaleDateString('id-ID', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
              })}
            </p>
          </div>
        </div>
      </Card>

      {/* Actions */}
      <div className="flex items-center justify-end gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={updateCity.isPending}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={updateCity.isPending}
          className="bg-brand hover:bg-brand-dark border border-black text-white font-bold"
        >
          {updateCity. isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Save Changes
        </Button>
      </div>
    </form>
  );
}