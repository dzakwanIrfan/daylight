import { IsNotEmpty, IsString, IsBoolean, IsNumber, Min, IsEnum, Max, IsOptional } from 'class-validator';
import { PaymentMethodType } from '@prisma/client';
import { Type } from 'class-transformer';

export class CreatePaymentMethodDto {
    @IsNotEmpty()
    @IsString()
    code: string; 

    @IsNotEmpty()
    @IsString()
    name: string;

    @IsNotEmpty()
    @IsString()
    countryCode: string;

    @IsNotEmpty()
    @IsString()
    currency: string;

    @IsNotEmpty()
    @Type(() => Number)
    @IsNumber({ maxDecimalPlaces: 4 })
    @Min(0)
    minAmount: number;

    @IsNotEmpty()
    @Type(() => Number)
    @IsNumber({ maxDecimalPlaces: 4 })
    @Min(0)
    maxAmount: number;

    @IsNotEmpty()
    @IsEnum(PaymentMethodType)
    type: PaymentMethodType;

    @IsOptional()
    @Type(() => Number)
    @IsNumber({ maxDecimalPlaces: 4 })
    @Min(0)
    @Max(1) // Max 100% = 1.0
    adminFeeRate?: number = 0;

    @IsOptional()
    @Type(() => Number)
    @IsNumber({ maxDecimalPlaces: 4 })
    @Min(0)
    adminFeeFixed?: number = 0;

    @IsOptional()
    @IsString()
    logoUrl?: string;

    @IsOptional()
    @IsBoolean()
    isActive?: boolean = true;
}