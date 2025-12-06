import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma, PaymentMethodType } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';
import {
  QueryPaymentMethodsDto,
  SortOrder,
} from './dto/query-payment-methods.dto';
import { UpdatePaymentMethodDto } from './dto/update-payment-method.dto';
import { CreatePaymentMethodDto } from './dto/create-payment-method.dto';
import { BulkActionDto, BulkActionType } from './dto/bulk-action.dto';

@Injectable()
export class PaymentMethodsService {
  constructor(private prisma: PrismaService) { }

  /**
   * Get all active payment methods for public use
   * Grouped by country and type
   */
  async getActivePaymentMethods(countryCode?: string, currency?: string) {
    const where: Prisma.PaymentMethodWhereInput = {
      isActive: true,
    };

    if (countryCode) {
      where.countryCode = countryCode;
    }

    if (currency) {
      where.currency = currency;
    }

    const methods = await this.prisma.paymentMethod.findMany({
      where,
      include: {
        country: {
          select: {
            code: true,
            name: true,
            currency: true,
          },
        },
      },
      orderBy: [{ countryCode: 'asc' }, { type: 'asc' }, { name: 'asc' }],
    });

    // Group by country, then by type
    const grouped = methods.reduce(
      (acc, method) => {
        const countryKey = method.countryCode;
        if (!acc[countryKey]) {
          acc[countryKey] = {
            country: method.country,
            methods: {},
          };
        }

        const typeKey = method.type;
        if (!acc[countryKey].methods[typeKey]) {
          acc[countryKey].methods[typeKey] = [];
        }

        acc[countryKey].methods[typeKey].push(this.formatPaymentMethod(method));
        return acc;
      },
      {} as Record<string, any>,
    );

    return {
      success: true,
      data: grouped,
      flat: methods.map((m) => this.formatPaymentMethod(m)),
    };
  }

  /**
   * Get payment methods by country code (for frontend checkout)
   */
  async getPaymentMethodsByCountry(countryCode: string) {
    const country = await this.prisma.country.findUnique({
      where: { code: countryCode },
    });

    if (!country) {
      throw new NotFoundException(`Country with code ${countryCode} not found`);
    }

    const methods = await this.prisma.paymentMethod.findMany({
      where: {
        countryCode,
        isActive: true,
      },
      include: {
        country: {
          select: {
            code: true,
            name: true,
            currency: true,
          },
        },
      },
      orderBy: [{ type: 'asc' }, { name: 'asc' }],
    });

    // Group by type
    const grouped = methods.reduce(
      (acc, method) => {
        const typeKey = method.type;
        if (!acc[typeKey]) {
          acc[typeKey] = [];
        }
        acc[typeKey].push(this.formatPaymentMethod(method));
        return acc;
      },
      {} as Record<string, any[]>,
    );

    return {
      success: true,
      country: {
        code: country.code,
        name: country.name,
        currency: country.currency,
      },
      data: grouped,
      flat: methods.map((m) => this.formatPaymentMethod(m)),
    };
  }

  /**
   * Get payment method by code
   */
  async getPaymentMethodByCode(code: string) {
    const method = await this.prisma.paymentMethod.findUnique({
      where: { code },
      include: {
        country: {
          select: {
            code: true,
            name: true,
            currency: true,
          },
        },
      },
    });

    if (!method) {
      throw new NotFoundException('Payment method not found');
    }

    return {
      success: true,
      data: this.formatPaymentMethod(method),
    };
  }

  /**
   * Calculate fee for a payment method
   */
  async calculateFee(code: string, amount: number) {
    const method = await this.prisma.paymentMethod.findUnique({
      where: { code },
      include: {
        country: true,
      },
    });

    if (!method) {
      throw new NotFoundException('Payment method not found');
    }

    if (!method.isActive) {
      throw new BadRequestException('Payment method is not active');
    }

    const minAmount = Number(method.minAmount);
    const maxAmount = Number(method.maxAmount);

    // Validate amount
    if (amount < minAmount) {
      throw new BadRequestException(
        `Minimum amount is ${this.formatCurrencyValue(minAmount, method.currency)}`,
      );
    }

    if (amount > maxAmount) {
      throw new BadRequestException(
        `Maximum amount is ${this.formatCurrencyValue(maxAmount, method.currency)}`,
      );
    }

    // Calculate admin fee
    const adminFeeRate = Number(method.adminFeeRate);
    const adminFeeFixed = Number(method.adminFeeFixed);

    const percentageFee = amount * adminFeeRate;
    const totalFee = percentageFee + adminFeeFixed;
    const finalAmount = amount + totalFee;

    return {
      success: true,
      data: {
        code: method.code,
        name: method.name,
        currency: method.currency,
        countryCode: method.countryCode,
        amount: amount,
        fee: {
          rate: adminFeeRate,
          ratePercent: adminFeeRate * 100, // For display (e.g., 2.5%)
          fixed: adminFeeFixed,
          percentageAmount: percentageFee,
          total: totalFee,
        },
        finalAmount: finalAmount,
        amountReceived: amount, // Merchant receives the original amount
        formatted: {
          amount: this.formatCurrencyValue(amount, method.currency),
          fee: this.formatCurrencyValue(totalFee, method.currency),
          finalAmount: this.formatCurrencyValue(finalAmount, method.currency),
        },
      },
    };
  }

  /**
   * Get all payment methods with filtering, sorting, and pagination (Admin)
   */
  async getPaymentMethods(queryDto: QueryPaymentMethodsDto) {
    const {
      page = 1,
      limit = 10,
      search,
      sortBy = 'createdAt',
      sortOrder = SortOrder.DESC,
      countryCode,
      currency,
      type,
      isActive,
    } = queryDto;

    // Build where clause
    const where: Prisma.PaymentMethodWhereInput = {};

    // Search across multiple fields
    if (search) {
      where.OR = [
        { code: { contains: search, mode: 'insensitive' } },
        { name: { contains: search, mode: 'insensitive' } },
        { countryCode: { contains: search, mode: 'insensitive' } },
        { currency: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Filter by country code
    if (countryCode) {
      where.countryCode = countryCode;
    }

    // Filter by currency
    if (currency) {
      where.currency = currency;
    }

    // Filter by type
    if (type) {
      where.type = type;
    }

    // Filter by active status
    if (typeof isActive === 'boolean') {
      where.isActive = isActive;
    }

    // Calculate pagination
    const skip = (page - 1) * limit;
    const take = limit;

    // Execute queries
    const [methods, total] = await Promise.all([
      this.prisma.paymentMethod.findMany({
        where,
        skip,
        take,
        include: {
          country: {
            select: {
              code: true,
              name: true,
              currency: true,
            },
          },
        },
        orderBy: { [sortBy]: sortOrder },
      }),
      this.prisma.paymentMethod.count({ where }),
    ]);

    // Calculate pagination metadata
    const totalPages = Math.ceil(total / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    return {
      data: methods.map((m) => this.formatPaymentMethod(m)),
      pagination: {
        total,
        page,
        limit,
        totalPages,
        hasNextPage,
        hasPrevPage,
      },
      filters: {
        search,
        countryCode,
        currency,
        type,
        isActive,
      },
      sorting: {
        sortBy,
        sortOrder,
      },
    };
  }

  /**
   * Create payment method (Admin)
   */
  async createPaymentMethod(data: CreatePaymentMethodDto) {
    // Check if code already exists
    const existing = await this.prisma.paymentMethod.findUnique({
      where: { code: data.code },
    });

    if (existing) {
      throw new ConflictException(
        `Payment method with code ${data.code} already exists`,
      );
    }

    // Verify country exists
    const country = await this.prisma.country.findUnique({
      where: { code: data.countryCode },
    });

    if (!country) {
      throw new NotFoundException(
        `Country with code ${data.countryCode} not found`,
      );
    }

    const method = await this.prisma.paymentMethod.create({
      data: {
        code: data.code,
        name: data.name,
        countryCode: data.countryCode,
        currency: data.currency,
        minAmount: new Decimal(data.minAmount),
        maxAmount: new Decimal(data.maxAmount),
        type: data.type,
        adminFeeRate: new Decimal(data.adminFeeRate || 0),
        adminFeeFixed: new Decimal(data.adminFeeFixed || 0),
        logoUrl: data.logoUrl,
        isActive: data.isActive ?? true,
      },
      include: {
        country: {
          select: {
            code: true,
            name: true,
            currency: true,
          },
        },
      },
    });

    return {
      success: true,
      message: 'Payment method created successfully',
      data: this.formatPaymentMethod(method),
    };
  }

  /**
   * Update payment method (Admin)
   */
  async updatePaymentMethod(code: string, data: UpdatePaymentMethodDto) {
    const existingMethod = await this.prisma.paymentMethod.findUnique({
      where: { code },
    });

    if (!existingMethod) {
      throw new NotFoundException('Payment method not found');
    }

    // If changing country code, verify it exists
    if (data.countryCode) {
      const country = await this.prisma.country.findUnique({
        where: { code: data.countryCode },
      });

      if (!country) {
        throw new NotFoundException(
          `Country with code ${data.countryCode} not found`,
        );
      }
    }

    const updateData: Prisma.PaymentMethodUpdateInput = {};

    if (data.name !== undefined) updateData.name = data.name;
    if (data.countryCode !== undefined)
      updateData.country = { connect: { code: data.countryCode } };
    if (data.currency !== undefined) updateData.currency = data.currency;
    if (data.type !== undefined) updateData.type = data.type;
    if (data.adminFeeRate !== undefined)
      updateData.adminFeeRate = new Decimal(data.adminFeeRate);
    if (data.adminFeeFixed !== undefined)
      updateData.adminFeeFixed = new Decimal(data.adminFeeFixed);
    if (data.minAmount !== undefined)
      updateData.minAmount = new Decimal(data.minAmount);
    if (data.maxAmount !== undefined)
      updateData.maxAmount = new Decimal(data.maxAmount);
    if (data.logoUrl !== undefined) updateData.logoUrl = data.logoUrl;
    if (data.isActive !== undefined) updateData.isActive = data.isActive;

    const method = await this.prisma.paymentMethod.update({
      where: { code },
      data: updateData,
      include: {
        country: {
          select: {
            code: true,
            name: true,
            currency: true,
          },
        },
      },
    });

    return {
      success: true,
      message: 'Payment method updated successfully',
      data: this.formatPaymentMethod(method),
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
      include: {
        country: {
          select: {
            code: true,
            name: true,
            currency: true,
          },
        },
      },
    });

    return {
      success: true,
      message: `Payment method ${updated.isActive ? 'activated' : 'deactivated'}`,
      data: this.formatPaymentMethod(updated),
    };
  }

  /**
   * Delete payment method (Admin)
   */
  async deletePaymentMethod(code: string) {
    const method = await this.prisma.paymentMethod.findUnique({
      where: { code },
      include: {
        transactions: { take: 1 },
      },
    });

    if (!method) {
      throw new NotFoundException('Payment method not found');
    }

    // Check if there are any transactions using this method
    if (method.transactions.length > 0) {
      throw new BadRequestException(
        'Cannot delete payment method with existing transactions.  Deactivate it instead.',
      );
    }

    await this.prisma.paymentMethod.delete({
      where: { code },
    });

    return {
      success: true,
      message: 'Payment method deleted successfully',
    };
  }

  /**
   * Bulk actions on payment methods (Admin)
   */
  async bulkAction(bulkActionDto: BulkActionDto) {
    const { codes, action } = bulkActionDto;

    // Validate payment method codes
    const methods = await this.prisma.paymentMethod.findMany({
      where: { code: { in: codes } },
      select: { code: true },
    });

    if (methods.length !== codes.length) {
      const foundCodes = methods.map((m) => m.code);
      const invalidCodes = codes.filter((c) => !foundCodes.includes(c));
      throw new BadRequestException(
        `Invalid payment method codes: ${invalidCodes.join(', ')}`,
      );
    }

    let result;

    switch (action) {
      case BulkActionType.ACTIVATE:
        result = await this.prisma.paymentMethod.updateMany({
          where: { code: { in: codes } },
          data: { isActive: true },
        });
        break;

      case BulkActionType.DEACTIVATE:
        result = await this.prisma.paymentMethod.updateMany({
          where: { code: { in: codes } },
          data: { isActive: false },
        });
        break;

      case BulkActionType.DELETE:
        // Check if any has transactions
        const methodsWithTransactions = await this.prisma.paymentMethod.findMany(
          {
            where: {
              code: { in: codes },
              transactions: { some: {} },
            },
            select: { code: true },
          },
        );

        if (methodsWithTransactions.length > 0) {
          throw new BadRequestException(
            `Cannot delete payment methods with existing transactions: ${methodsWithTransactions.map((m) => m.code).join(', ')}`,
          );
        }

        result = await this.prisma.paymentMethod.deleteMany({
          where: { code: { in: codes } },
        });
        break;

      default:
        throw new BadRequestException('Invalid bulk action');
    }

    return {
      success: true,
      message: `Bulk action '${action}' completed successfully`,
      affectedCount: result.count,
    };
  }

  /**
   * Export payment methods data (Admin)
   */
  async exportPaymentMethods(queryDto: QueryPaymentMethodsDto) {
    const { search, countryCode, currency, type, isActive } = queryDto;

    // Build where clause (without pagination)
    const where: Prisma.PaymentMethodWhereInput = {};

    if (search) {
      where.OR = [
        { code: { contains: search, mode: 'insensitive' } },
        { name: { contains: search, mode: 'insensitive' } },
        { countryCode: { contains: search, mode: 'insensitive' } },
        { currency: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (countryCode) where.countryCode = countryCode;
    if (currency) where.currency = currency;
    if (type) where.type = type;
    if (typeof isActive === 'boolean') where.isActive = isActive;

    const methods = await this.prisma.paymentMethod.findMany({
      where,
      include: {
        country: {
          select: {
            code: true,
            name: true,
            currency: true,
          },
        },
      },
      orderBy: [{ countryCode: 'asc' }, { type: 'asc' }, { name: 'asc' }],
    });

    return methods.map((m) => this.formatPaymentMethod(m));
  }

  /**
   * Get available countries (Admin)
   */
  async getAvailableCountries() {
    const countries = await this.prisma.country.findMany({
      select: {
        code: true,
        name: true,
        currency: true,
        _count: {
          select: {
            paymentMethods: true,
          },
        },
      },
      orderBy: { name: 'asc' },
    });

    return {
      success: true,
      data: countries.map((c) => ({
        code: c.code,
        name: c.name,
        currency: c.currency,
        paymentMethodCount: c._count.paymentMethods,
      })),
    };
  }

  /**
   * Get available currencies (Admin)
   */
  async getAvailableCurrencies() {
    const methods = await this.prisma.paymentMethod.findMany({
      select: { currency: true },
      distinct: ['currency'],
      orderBy: { currency: 'asc' },
    });

    return {
      success: true,
      data: methods.map((m) => m.currency),
    };
  }

  /**
   * Get payment method types (Admin)
   */
  async getPaymentMethodTypes() {
    return {
      success: true,
      data: Object.values(PaymentMethodType),
    };
  }

  /**
   * Get statistics (Admin)
   */
  async getStatistics() {
    const [
      totalMethods,
      activeMethods,
      methodsByCountry,
      methodsByType,
      transactionStats,
    ] = await Promise.all([
      this.prisma.paymentMethod.count(),
      this.prisma.paymentMethod.count({ where: { isActive: true } }),
      this.prisma.paymentMethod.groupBy({
        by: ['countryCode'],
        _count: { id: true },
        orderBy: { _count: { id: 'desc' } },
      }),
      this.prisma.paymentMethod.groupBy({
        by: ['type'],
        _count: { id: true },
        orderBy: { _count: { id: 'desc' } },
      }),
      this.prisma.transaction.groupBy({
        by: ['paymentMethodId'],
        _count: { id: true },
        _sum: { finalAmount: true },
        where: {
          status: 'PAID',
          paymentMethodId: { not: null },
        },
        orderBy: { _count: { id: 'desc' } },
        take: 5,
      }),
    ]);

    // Get country names for methodsByCountry
    const countryCodes = methodsByCountry.map((m) => m.countryCode);
    const countries = await this.prisma.country.findMany({
      where: { code: { in: countryCodes } },
      select: { code: true, name: true },
    });
    const countryMap = new Map(countries.map((c) => [c.code, c.name]));

    // Get payment method names for top performing
    const methodIds = transactionStats
      .map((t) => t.paymentMethodId)
      .filter(Boolean) as string[];
    const topMethods = await this.prisma.paymentMethod.findMany({
      where: { id: { in: methodIds } },
      select: { id: true, code: true, name: true },
    });
    const methodMap = new Map(topMethods.map((m) => [m.id, m]));

    return {
      success: true,
      data: {
        overview: {
          total: totalMethods,
          active: activeMethods,
          inactive: totalMethods - activeMethods,
          countries: methodsByCountry.length,
        },
        byCountry: methodsByCountry.map((m) => ({
          countryCode: m.countryCode,
          countryName: countryMap.get(m.countryCode) || m.countryCode,
          count: m._count.id,
        })),
        byType: methodsByType.map((m) => ({
          type: m.type,
          count: m._count.id,
        })),
        topPerforming: transactionStats.map((t) => {
          const method = methodMap.get(t.paymentMethodId || '');
          return {
            code: method?.code || 'Unknown',
            name: method?.name || 'Unknown',
            transactionCount: t._count.id,
            totalAmount: t._sum.finalAmount
              ? Number(t._sum.finalAmount)
              : 0,
          };
        }),
      },
    };
  }

  /**
   * Helper: Format payment method for response
   */
  private formatPaymentMethod(method: any) {
    return {
      id: method.id,
      code: method.code,
      name: method.name,
      countryCode: method.countryCode,
      country: method.country || null,
      currency: method.currency,
      minAmount: Number(method.minAmount),
      maxAmount: Number(method.maxAmount),
      type: method.type,
      adminFeeRate: Number(method.adminFeeRate),
      adminFeeRatePercent: Number(method.adminFeeRate) * 100, // For display
      adminFeeFixed: Number(method.adminFeeFixed),
      logoUrl: method.logoUrl,
      isActive: method.isActive,
      createdAt: method.createdAt,
      updatedAt: method.updatedAt,
    };
  }

  /**
   * Helper: Format currency value
   */
  private formatCurrencyValue(amount: number, currency: string): string {
    const config: Record<
      string,
      { locale: string; minimumFractionDigits: number }
    > = {
      IDR: { locale: 'id-ID', minimumFractionDigits: 0 },
      USD: { locale: 'en-US', minimumFractionDigits: 2 },
      SGD: { locale: 'en-SG', minimumFractionDigits: 2 },
      MYR: { locale: 'ms-MY', minimumFractionDigits: 2 },
      PHP: { locale: 'en-PH', minimumFractionDigits: 2 },
      THB: { locale: 'th-TH', minimumFractionDigits: 2 },
      VND: { locale: 'vi-VN', minimumFractionDigits: 0 },
    };

    const { locale, minimumFractionDigits } = config[currency] || {
      locale: 'en-US',
      minimumFractionDigits: 2,
    };

    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      minimumFractionDigits,
      maximumFractionDigits: minimumFractionDigits,
    }).format(amount);
  }
}