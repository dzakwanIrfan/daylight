'use client';

import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { AdminCountry, UpdateCountryPayload } from '@/types/admin-location.types';
import { useAdminCountryMutations } from '@/hooks/use-admin-locations';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

interface EditCountryFormProps {
  country: AdminCountry;
}

export function EditCountryForm({ country }: EditCountryFormProps) {
  const router = useRouter();
  const { updateCountry } = useAdminCountryMutations();

  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm<UpdateCountryPayload>({
    defaultValues: {
      code: country.code,
      name: country. name,
      currency: country.currency,
      phoneCode: country.phoneCode,
    },
  });

  useEffect(() => {
    if (updateCountry.isSuccess) {
      router.push('/admin/locations/countries');
    }
  }, [updateCountry. isSuccess, router]);

  const handleCodeChange = (e: React. ChangeEvent<HTMLInputElement>) => {
    setValue('code', e.target.value.toUpperCase(). slice(0, 2));
  };

  const handleCurrencyChange = (e: React. ChangeEvent<HTMLInputElement>) => {
    setValue('currency', e.target.value.toUpperCase(). slice(0, 3));
  };

  const onSubmit = (data: UpdateCountryPayload) => {
    updateCountry.mutate({
      id: country.id,
      data,
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Card className="p-6 bg-white">
        <h3 className="text-lg font-semibold mb-4">Country Information</h3>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="code">Country Code (ISO 3166-1 alpha-2) *</Label>
            <Input
              id="code"
              placeholder="ID"
              maxLength={2}
              {...register('code', { 
                required: 'Country code is required',
                pattern: {
                  value: /^[A-Z]{2}$/,
                  message: 'Must be 2 uppercase letters'
                }
              })}
              onChange={handleCodeChange}
              value={watch('code')}
              className="uppercase font-mono"
            />
            {errors.code && (
              <p className="text-xs text-red-600">{errors.code.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Country Name *</Label>
            <Input
              id="name"
              placeholder="Indonesia"
              {...register('name', { required: 'Country name is required' })}
            />
            {errors.name && (
              <p className="text-xs text-red-600">{errors.name.message}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="currency">Currency Code *</Label>
            <Input
              id="currency"
              placeholder="IDR"
              maxLength={3}
              {...register('currency', { 
                required: 'Currency is required',
                minLength: { value: 3, message: 'Must be 3 characters' },
                maxLength: { value: 3, message: 'Must be 3 characters' }
              })}
              onChange={handleCurrencyChange}
              value={watch('currency')}
              className="uppercase font-mono"
            />
            {errors. currency && (
              <p className="text-xs text-red-600">{errors.currency.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="phoneCode">Phone Code *</Label>
            <Input
              id="phoneCode"
              placeholder="+62"
              {...register('phoneCode', { 
                required: 'Phone code is required',
                pattern: {
                  value: /^\+\d{1,4}$/,
                  message: 'Must start with + followed by 1-4 digits'
                }
              })}
            />
            {errors.phoneCode && (
              <p className="text-xs text-red-600">{errors.phoneCode.message}</p>
            )}
          </div>
        </div>
      </Card>

      {/* Stats Info */}
      <Card className="p-6 bg-gray-50">
        <h3 className="text-lg font-semibold mb-4">Statistics</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500">Cities</p>
            <p className="text-2xl font-bold text-gray-900">{country._count?. cities || 0}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Created</p>
            <p className="text-sm font-medium text-gray-900">
              {new Date(country.createdAt).toLocaleDateString('id-ID', {
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
          onClick={() => router. back()}
          disabled={updateCountry. isPending}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={updateCountry.isPending}
          className="bg-brand hover:bg-brand-dark border border-black text-white font-bold"
        >
          {updateCountry. isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Save Changes
        </Button>
      </div>
    </form>
  );
}