import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class PaymentMethodsService {
  constructor(private prisma: PrismaService) {}

  /**
   * Get all active payment methods
   */
  async getActivePaymentMethods() {
    const methods = await this.prisma.paymentMethod.findMany({
      where: { isActive: true },
      orderBy: [{ group: 'asc' }, { sortOrder: 'asc' }],
    });

    // Group by payment group
    const grouped = methods.reduce((acc, method) => {
      if (!acc[method.group]) {
        acc[method.group] = [];
      }
      acc[method.group].push(method);
      return acc;
    }, {} as Record<string, any[]>);

    return {
      success: true,
      data: grouped,
      flat: methods,
    };
  }

  /**
   * Get payment method by code
   */
  async getPaymentMethodByCode(code: string) {
    const method = await this.prisma.paymentMethod.findUnique({
      where: { code },
    });

    if (!method) {
      throw new NotFoundException('Payment method not found');
    }

    return {
      success: true,
      data: method,
    };
  }

  /**
   * Calculate fee for a payment method
   */
  async calculateFee(code: string, amount: number) {
    const method = await this.prisma.paymentMethod.findUnique({
      where: { code },
    });

    if (!method) {
      throw new NotFoundException('Payment method not found');
    }

    if (!method.isActive) {
      throw new NotFoundException('Payment method is not active');
    }

    // Validate amount
    if (amount < method.minimumAmount) {
      throw new Error(
        `Minimum amount is ${method.minimumAmount.toLocaleString('id-ID')}`,
      );
    }

    if (amount > method.maximumAmount) {
      throw new Error(
        `Maximum amount is ${method.maximumAmount.toLocaleString('id-ID')}`,
      );
    }

    // Calculate fees
    const merchantFeeFlat = method.feeMerchantFlat;
    const merchantFeePercent = (amount * method.feeMerchantPercent) / 100;
    let merchantFeeTotal = merchantFeeFlat + merchantFeePercent;

    // Apply minimum and maximum fee if set
    if (method.minimumFee && merchantFeeTotal < method.minimumFee) {
      merchantFeeTotal = method.minimumFee;
    }
    if (method.maximumFee && merchantFeeTotal > method.maximumFee) {
      merchantFeeTotal = method.maximumFee;
    }

    const customerFeeFlat = method.feeCustomerFlat;
    const customerFeePercent = (amount * method.feeCustomerPercent) / 100;
    const customerFeeTotal = customerFeeFlat + customerFeePercent;

    const totalFee = merchantFeeTotal + customerFeeTotal;
    const finalAmount = amount + customerFeeTotal;

    return {
      success: true,
      data: {
        code: method.code,
        name: method.name,
        amount: amount,
        fee: {
          merchant: {
            flat: merchantFeeFlat,
            percent: method.feeMerchantPercent,
            total: merchantFeeTotal,
          },
          customer: {
            flat: customerFeeFlat,
            percent: method.feeCustomerPercent,
            total: customerFeeTotal,
          },
          total: totalFee,
        },
        finalAmount: finalAmount,
        amountReceived: amount - merchantFeeTotal,
      },
    };
  }

  /**
   * Get all payment methods (Admin)
   */
  async getAllPaymentMethods(isActive?: boolean) {
    const where: Prisma.PaymentMethodWhereInput = {};
    if (typeof isActive === 'boolean') {
      where.isActive = isActive;
    }

    const methods = await this.prisma.paymentMethod.findMany({
      where,
      orderBy: [{ group: 'asc' }, { sortOrder: 'asc' }],
    });

    return {
      success: true,
      data: methods,
    };
  }

  /**
   * Update payment method (Admin)
   */
  async updatePaymentMethod(code: string, data: Prisma.PaymentMethodUpdateInput) {
    const method = await this.prisma.paymentMethod.update({
      where: { code },
      data,
    });

    return {
      success: true,
      message: 'Payment method updated successfully',
      data: method,
    };
  }

  /**
   * Toggle payment method active status (Admin)
   */
  async togglePaymentMethod(code: string) {
    const method = await this.prisma.paymentMethod.findUnique({
      where: { code },
    });

    if (!method) {
      throw new NotFoundException('Payment method not found');
    }

    const updated = await this.prisma.paymentMethod.update({
      where: { code },
      data: { isActive: !method.isActive },
    });

    return {
      success: true,
      message: `Payment method ${updated.isActive ? 'activated' : 'deactivated'}`,
      data: updated,
    };
  }

  /**
   * Sync with Tripay API (Admin)
   */
  async syncWithTripay(tripayData: any[]) {
    let created = 0;
    let updated = 0;

    for (const item of tripayData) {
      const existing = await this.prisma.paymentMethod.findUnique({
        where: { code: item.code },
      });

      const data = {
        code: item.code,
        name: item.name,
        group: item.group,
        type: item.type.toUpperCase(),
        feeMerchantFlat: item.fee_merchant.flat,
        feeMerchantPercent: item.fee_merchant.percent,
        feeCustomerFlat: item.fee_customer.flat,
        feeCustomerPercent: item.fee_customer.percent,
        minimumFee: item.minimum_fee,
        maximumFee: item.maximum_fee,
        minimumAmount: item.minimum_amount,
        maximumAmount: item.maximum_amount,
        iconUrl: item.icon_url,
        isActive: item.active,
      };

      if (existing) {
        await this.prisma.paymentMethod.update({
          where: { code: item.code },
          data,
        });
        updated++;
      } else {
        await this.prisma.paymentMethod.create({
          data: {
            ...data,
            sortOrder: 0,
          },
        });
        created++;
      }
    }

    return {
      success: true,
      message: 'Payment methods synced successfully',
      stats: {
        created,
        updated,
        total: tripayData.length,
      },
    };
  }
}