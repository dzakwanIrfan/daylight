'use client';

import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2 } from 'lucide-react';
import { CreateCityPayload } from '@/types/admin-location.types';
import { useAdminCityMutations, useCountryOptions } from '@/hooks/use-admin-locations';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';

// Common timezone options
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

export function CreateCityForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedCountryId = searchParams. get('countryId');
  
  const { createCity } = useAdminCityMutations();
  const { data: countries, isLoading: isLoadingCountries } = useCountryOptions();

  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm<CreateCityPayload>({
    defaultValues: {
      slug: '',
      name: '',
      timezone: 'Asia/Jakarta',
      countryId: preselectedCountryId || '',
      isActive: true,
    },
  });

  useEffect(() => {
    if (createCity.isSuccess) {
      router. push('/admin/locations/cities');
    }
  }, [createCity.isSuccess, router]);

  // Auto-generate slug from name
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target. value;
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      . replace(/-+/g, '-');
    setValue('slug', slug);
  };

  const onSubmit = (data: CreateCityPayload) => {
    createCity.mutate(data);
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
              {... register('name', { required: 'City name is required' })}
              onChange={(e) => {
                register('name'). onChange(e);
                handleNameChange(e);
              }}
            />
            {errors.name && (
              <p className="text-xs text-red-600">{errors.name. message}</p>
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
              <p className="text-xs text-red-600">{errors.slug.message}</p>
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
                {countries?. map((country) => (
                  <SelectItem key={country.id} value={country.id}>
                    {country. code} - {country. name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <input type="hidden" {... register('countryId', { required: 'Country is required' })} />
            {errors.countryId && (
              <p className="text-xs text-red-600">{errors.countryId. message}</p>
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
                {TIMEZONE_OPTIONS.map((tz) => (
                  <SelectItem key={tz. value} value={tz.value}>
                    {tz.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <input type="hidden" {...register('timezone', { required: 'Timezone is required' })} />
            {errors.timezone && (
              <p className="text-xs text-red-600">{errors.timezone.message}</p>
            )}
          </div>
        </div>

        <div className="mt-4 space-y-2">
          <Label htmlFor="isActive">Status</Label>
          <Select
            value={watch('isActive') ?  'active' : 'inactive'}
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

      {/* Actions */}
      <div className="flex items-center justify-end gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={createCity.isPending}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={createCity. isPending}
          className="bg-brand hover:bg-brand-dark border border-black text-white font-bold"
        >
          {createCity.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Create City
        </Button>
      </div>
    </form>
  );
}