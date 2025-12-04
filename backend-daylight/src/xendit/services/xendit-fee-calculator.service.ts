import { Injectable } from '@nestjs/common';
import { PaymentMethod, Prisma } from '@prisma/client';

export interface FeeCalculationResult {
  amount: Prisma.Decimal;
  totalFee: Prisma.Decimal;
  finalAmount: Prisma.Decimal;
  breakdown: {
    baseAmount: number;
    feeRate: number;
    feeFixed: number;
    calculatedFee: number;
    totalFee: number;
    finalAmount: number;
  };
}

@Injectable()
export class XenditFeeCalculatorService {
  calculateFee(
    amount: number,
    paymentMethod: PaymentMethod,
  ): FeeCalculationResult {
    const baseAmount = amount;

    // Konversi Decimal ke number untuk kalkulasi
    const feeRate = paymentMethod.adminFeeRate.toNumber();
    const feeFixed = paymentMethod.adminFeeFixed.toNumber();

    // Hitung fee persentase
    const calculatedFee = baseAmount * feeRate;

    // Total fee = fee persentase + fee fixed
    const totalFee = calculatedFee + feeFixed;

    // Final amount yang harus dibayar user
    const finalAmount = baseAmount + totalFee;

    return {
      amount: new Prisma.Decimal(baseAmount),
      totalFee: new Prisma.Decimal(totalFee),
      finalAmount: new Prisma.Decimal(finalAmount),
      breakdown: {
        baseAmount,
        feeRate,
        feeFixed,
        calculatedFee,
        totalFee,
        finalAmount,
      },
    };
  }

  // Validasi apakah amount sesuai dengan min/max payment method
  validateAmount(amount: number, paymentMethod: PaymentMethod): boolean {
    const minAmount = paymentMethod.minAmount.toNumber();
    const maxAmount = paymentMethod.maxAmount.toNumber();

    return amount >= minAmount && amount <= maxAmount;
  }

  // Get formatted fee info untuk display
  getFormattedFeeInfo(
    amount: number,
    paymentMethod: PaymentMethod,
  ): {
    isValid: boolean;
    error?: string;
    feeInfo?: FeeCalculationResult;
  } {
    // Validasi amount
    if (!this.validateAmount(amount, paymentMethod)) {
      const minAmount = paymentMethod.minAmount.toNumber();
      const maxAmount = paymentMethod.maxAmount.toNumber();

      return {
        isValid: false,
        error: `Amount must be between ${paymentMethod.currency} ${minAmount} and ${paymentMethod.currency} ${maxAmount}`,
      };
    }

    // Kalkulasi fee
    const feeInfo = this.calculateFee(amount, paymentMethod);

    return {
      isValid: true,
      feeInfo,
    };
  }
}
