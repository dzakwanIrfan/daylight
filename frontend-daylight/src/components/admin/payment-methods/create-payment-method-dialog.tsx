'use client';

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    PaymentMethodType,
    PaymentMethodTypeLabels,
} from '@/types/payment-method.types';
import { useForm } from 'react-hook-form';
import { Loader2 } from 'lucide-react';
import { useEffect } from 'react';
import { Separator } from '@/components/ui/separator';
import {
    usePaymentMethodMutations,
    useAvailableCountries,
} from '@/hooks/use-payment-methods';

interface CreatePaymentMethodDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

interface CreatePaymentMethodFormData {
    code: string;
    name: string;
    countryCode: string;
    currency: string;
    type: PaymentMethodType;
    adminFeeRate: number;
    adminFeeFixed: number;
    minAmount: number;
    maxAmount: number;
    logoUrl: string;
    isActive: boolean;
}

export function CreatePaymentMethodDialog({
    open,
    onOpenChange,
}: CreatePaymentMethodDialogProps) {
    const { createPaymentMethod } = usePaymentMethodMutations();
    const { data: countriesData } = useAvailableCountries();
    const countries = countriesData?.data || [];

    const {
        register,
        handleSubmit,
        formState: { errors },
        setValue,
        watch,
        reset,
    } = useForm<CreatePaymentMethodFormData>({
        defaultValues: {
            code: '',
            name: '',
            countryCode: 'ID',
            currency: 'IDR',
            type: PaymentMethodType.BANK_TRANSFER,
            adminFeeRate: 0,
            adminFeeFixed: 0,
            minAmount: 10000,
            maxAmount: 100000000,
            logoUrl: '',
            isActive: true,
        },
    });

    // Reset form when dialog opens
    useEffect(() => {
        if (open) {
            reset({
                code: '',
                name: '',
                countryCode: 'ID',
                currency: 'IDR',
                type: PaymentMethodType.BANK_TRANSFER,
                adminFeeRate: 0,
                adminFeeFixed: 0,
                minAmount: 10000,
                maxAmount: 100000000,
                logoUrl: '',
                isActive: true,
            });
        }
    }, [open, reset]);

    // Close dialog on success
    useEffect(() => {
        if (createPaymentMethod.isSuccess) {
            onOpenChange(false);
        }
    }, [createPaymentMethod.isSuccess, onOpenChange]);

    // Update currency when country changes
    const watchCountryCode = watch('countryCode');
    useEffect(() => {
        const selectedCountry = countries.find((c) => c.code === watchCountryCode);
        if (selectedCountry) {
            setValue('currency', selectedCountry.currency);
        }
    }, [watchCountryCode, countries, setValue]);

    const onSubmit = async (data: CreatePaymentMethodFormData) => {
        createPaymentMethod.mutate({
            code: data.code.toUpperCase().replace(/\s+/g, '_'),
            name: data.name,
            countryCode: data.countryCode,
            currency: data.currency,
            type: data.type,
            adminFeeRate: Number(data.adminFeeRate) / 100, // Convert percent to decimal
            adminFeeFixed: Number(data.adminFeeFixed),
            minAmount: Number(data.minAmount),
            maxAmount: Number(data.maxAmount),
            logoUrl: data.logoUrl || undefined,
            isActive: data.isActive,
        });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px] bg-white max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Create Payment Method</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    {/* Basic Info */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="code">Code</Label>
                            <Input
                                id="code"
                                placeholder="e.g., XENDIT_ID_BCA_VA"
                                {...register('code', {
                                    required: 'Code is required',
                                    pattern: {
                                        value: /^[A-Za-z0-9_]+$/,
                                        message: 'Only letters, numbers, and underscores allowed',
                                    },
                                })}
                                className="font-mono uppercase"
                            />
                            {errors.code && (
                                <p className="text-xs text-red-600">{errors.code.message}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="name">Name</Label>
                            <Input
                                id="name"
                                placeholder="e.g., BCA Virtual Account"
                                {...register('name', { required: 'Name is required' })}
                            />
                            {errors.name && (
                                <p className="text-xs text-red-600">{errors.name.message}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="countryCode">Country</Label>
                            <Select
                                value={watch('countryCode')}
                                onValueChange={(value) => setValue('countryCode', value)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select country" />
                                </SelectTrigger>
                                <SelectContent className="bg-white">
                                    {countries.map((country) => (
                                        <SelectItem key={country.code} value={country.code}>
                                            {country.name} ({country.code})
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="currency">Currency</Label>
                            <Input
                                id="currency"
                                {...register('currency', { required: 'Currency is required' })}
                                className="font-mono"
                            />
                            {errors.currency && (
                                <p className="text-xs text-red-600">{errors.currency.message}</p>
                            )}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="type">Type</Label>
                        <Select
                            value={watch('type')}
                            onValueChange={(value) => setValue('type', value as PaymentMethodType)}
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-white">
                                {Object.values(PaymentMethodType).map((type) => (
                                    <SelectItem key={type} value={type}>
                                        {PaymentMethodTypeLabels[type]}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <Separator className="my-4" />

                    {/* Admin Fee */}
                    <div className="space-y-3">
                        <h4 className="text-sm font-semibold text-gray-900">Admin Fee</h4>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="adminFeeRate">Percentage (%)</Label>
                                <Input
                                    id="adminFeeRate"
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    max="100"
                                    {...register('adminFeeRate', {
                                        min: { value: 0, message: 'Must be 0 or greater' },
                                        max: { value: 100, message: 'Must be 100 or less' },
                                    })}
                                />
                                {errors.adminFeeRate && (
                                    <p className="text-xs text-red-600">
                                        {errors.adminFeeRate.message}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="adminFeeFixed">
                                    Fixed Amount ({watch('currency')})
                                </Label>
                                <Input
                                    id="adminFeeFixed"
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    {...register('adminFeeFixed', {
                                        min: { value: 0, message: 'Must be 0 or greater' },
                                    })}
                                />
                                {errors.adminFeeFixed && (
                                    <p className="text-xs text-red-600">
                                        {errors.adminFeeFixed.message}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    <Separator className="my-4" />

                    {/* Transaction Limits */}
                    <div className="space-y-3">
                        <h4 className="text-sm font-semibold text-gray-900">
                            Transaction Limits
                        </h4>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="minAmount">
                                    Minimum Amount ({watch('currency')})
                                </Label>
                                <Input
                                    id="minAmount"
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    {...register('minAmount', {
                                        required: 'Required',
                                        min: { value: 0, message: 'Must be 0 or greater' },
                                    })}
                                />
                                {errors.minAmount && (
                                    <p className="text-xs text-red-600">
                                        {errors.minAmount.message}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="maxAmount">
                                    Maximum Amount ({watch('currency')})
                                </Label>
                                <Input
                                    id="maxAmount"
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    {...register('maxAmount', {
                                        required: 'Required',
                                        min: { value: 0, message: 'Must be 0 or greater' },
                                    })}
                                />
                                {errors.maxAmount && (
                                    <p className="text-xs text-red-600">
                                        {errors.maxAmount.message}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="logoUrl">Logo URL (optional)</Label>
                        <Input
                            id="logoUrl"
                            type="url"
                            placeholder="https://example.com/logo.png"
                            {...register('logoUrl')}
                        />
                    </div>

                    <div className="space-y-2">
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

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            disabled={createPaymentMethod.isPending}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={createPaymentMethod.isPending}
                            className="bg-brand hover:bg-brand-dark border border-black text-white font-bold"
                        >
                            {createPaymentMethod.isPending && (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            )}
                            Create Payment Method
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}