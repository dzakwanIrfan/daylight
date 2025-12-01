'use client';

import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { CreateCountryPayload } from '@/types/admin-location.types';
import { useAdminCountryMutations } from '@/hooks/use-admin-locations';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export function CreateCountryForm() {
  const router = useRouter();
  const { createCountry } = useAdminCountryMutations();

  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm<CreateCountryPayload>({
    defaultValues: {
      code: '',
      name: '',
      currency: '',
      phoneCode: '+',
    },
  });

  useEffect(() => {
    if (createCountry.isSuccess) {
      router.push('/admin/locations/countries');
    }
  }, [createCountry. isSuccess, router]);

  // Auto uppercase code and currency
  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue('code', e. target.value.toUpperCase(). slice(0, 2));
  };

  const handleCurrencyChange = (e: React. ChangeEvent<HTMLInputElement>) => {
    setValue('currency', e.target.value. toUpperCase(). slice(0, 3));
  };

  const onSubmit = (data: CreateCountryPayload) => {
    createCountry.mutate(data);
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
            <p className="text-xs text-gray-500">Example: ID (Indonesia), SG (Singapore)</p>
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
            <p className="text-xs text-gray-500">Example: IDR, SGD, USD</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="phoneCode">Phone Code *</Label>
            <Input
              id="phoneCode"
              placeholder="+62"
              {... register('phoneCode', { 
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
            <p className="text-xs text-gray-500">Example: +62, +65, +1</p>
          </div>
        </div>
      </Card>

      {/* Actions */}
      <div className="flex items-center justify-end gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={createCountry. isPending}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={createCountry. isPending}
          className="bg-brand hover:bg-brand-dark border border-black text-white font-bold"
        >
          {createCountry.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Create Country
        </Button>
      </div>
    </form>
  );
}