import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma, TransactionStatus, TransactionType } from '@prisma/client';
import { QueryTransactionsDto, SortOrder } from './dto/query-transactions.dto';
import {
  BulkActionTransactionDto,
  TransactionBulkActionType,
} from './dto/bulk-action-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { Decimal } from '@prisma/client/runtime/library';

@Injectable()
export class TransactionsService {
  constructor(private prisma: PrismaService) { }

  /**
   * Get transactions with filtering, sorting, and pagination
   */
  async getTransactions(queryDto: QueryTransactionsDto) {
    const {
      page = 1,
      limit = 10,
      search,
      sortBy = 'createdAt',
      sortOrder = SortOrder.DESC,
      status,
      paymentMethodId,
      userId,
      eventId,
      transactionType,
      dateFrom,
      dateTo,
      countryCode,
    } = queryDto;

    const where: Prisma.TransactionWhereInput = {};

    // Search
    if (search) {
      where.OR = [
        { externalId: { contains: search, mode: 'insensitive' } },
        { user: { email: { contains: search, mode: 'insensitive' } } },
        { user: { firstName: { contains: search, mode: 'insensitive' } } },
        { user: { lastName: { contains: search, mode: 'insensitive' } } },
        { event: { title: { contains: search, mode: 'insensitive' } } },
        { paymentMethodName: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Filters
    if (status) where.status = status;
    if (paymentMethodId) where.paymentMethodId = paymentMethodId;
    if (userId) where.userId = userId;
    if (eventId) where.eventId = eventId;
    if (transactionType) where.transactionType = transactionType;

    // Country filter - filter by payment method's country
    if (countryCode) {
      where.paymentMethod = {
        countryCode: countryCode,
      };
    }

    // Date range
    if (dateFrom || dateTo) {
      where.createdAt = {};
      if (dateFrom) where.createdAt.gte = new Date(dateFrom);
      if (dateTo) where.createdAt.lte = new Date(dateTo);
    }

    // Pagination
    const skip = (page - 1) * limit;
    const take = limit;

    // Execute queries
    const [transactions, total] = await Promise.all([
      this.prisma.transaction.findMany({
        where,
        skip,
        take,
        orderBy: { [sortBy]: sortOrder },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
              phoneNumber: true,
              profilePicture: true,
              currentCity: {
                select: {
                  id: true,
                  name: true,
                  country: {
                    select: {
                      code: true,
                      name: true,
                      currency: true,
                    },
                  },
                },
              },
            },
          },
          event: {
            select: {
              id: true,
              title: true,
              slug: true,
              category: true,
              eventDate: true,
              venue: true,
              city: true,
              cityRelation: {
                select: {
                  name: true,
                  country: {
                    select: {
                      code: true,
                      name: true,
                    },
                  },
                },
              },
            },
          },
          paymentMethod: {
            select: {
              id: true,
              code: true,
              name: true,
              type: true,
              currency: true,
              countryCode: true,
              country: {
                select: {
                  name: true,
                  currency: true,
                },
              },
            },
          },
          actions: true,
          userSubscription: {
            include: {
              plan: {
                select: {
                  id: true,
                  name: true,
                  type: true,
                  durationInMonths: true,
                },
              },
            },
          },
        },
      }),
      this.prisma.transaction.count({ where }),
    ]);

    // Calculate pagination metadata
    const totalPages = Math.ceil(total / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    return {
      data: transactions,
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
        status,
        paymentMethodId,
        userId,
        eventId,
        transactionType,
        dateFrom,
        dateTo,
        countryCode,
      },
      sorting: {
        sortBy,
        sortOrder,
      },
    };
  }

  /**
   * Get transaction by ID
   */
  async getTransactionById(transactionId: string) {
    const transaction = await this.prisma.transaction.findUnique({
      where: { id: transactionId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            phoneNumber: true,
            profilePicture: true,
            currentCity: {
              select: {
                id: true,
                name: true,
                timezone: true,
                country: {
                  select: {
                    code: true,
                    name: true,
                    currency: true,
                    phoneCode: true,
                  },
                },
              },
            },
          },
        },
        event: {
          select: {
            id: true,
            title: true,
            slug: true,
            category: true,
            description: true,
            eventDate: true,
            startTime: true,
            endTime: true,
            venue: true,
            address: true,
            city: true,
            price: true,
            currency: true,
            cityRelation: {
              select: {
                name: true,
                country: {
                  select: {
                    code: true,
                    name: true,
                    currency: true,
                  },
                },
              },
            },
          },
        },
        paymentMethod: {
          select: {
            id: true,
            code: true,
            name: true,
            type: true,
            currency: true,
            minAmount: true,
            maxAmount: true,
            adminFeeRate: true,
            adminFeeFixed: true,
            countryCode: true,
            country: {
              select: {
                code: true,
                name: true,
                currency: true,
              },
            },
          },
        },
        actions: {
          orderBy: {
            createdAt: 'asc',
          },
        },
        userSubscription: {
          include: {
            plan: {
              select: {
                id: true,
                name: true,
                type: true,
                description: true,
                durationInMonths: true,
                features: true,
              },
            },
          },
        },
        matchingMember: {
          include: {
            group: {
              select: {
                id: true,
                groupNumber: true,
                status: true,
                event: {
                  select: {
                    title: true,
                    eventDate: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!transaction) {
      throw new NotFoundException('Transaction not found');
    }

    return transaction;
  }

  /**
   * Update transaction status
   */
  async updateTransaction(
    transactionId: string,
    updateDto: UpdateTransactionDto,
  ) {
    const transaction = await this.prisma.transaction.findUnique({
      where: { id: transactionId },
    });

    if (!transaction) {
      throw new NotFoundException('Transaction not found');
    }

    const updateData: Prisma.TransactionUpdateInput = {};

    if (updateDto.status) {
      updateData.status = updateDto.status;

      // Set paidAt if status is PAID
      if (updateDto.status === TransactionStatus.PAID && !transaction.paidAt) {
        updateData.paidAt = new Date();
      }
    }

    const updatedTransaction = await this.prisma.transaction.update({
      where: { id: transactionId },
      data: updateData,
      include: {
        user: true,
        event: true,
        paymentMethod: true,
      },
    });

    return updatedTransaction;
  }

  /**
   * Delete transaction
   */
  async deleteTransaction(transactionId: string, hardDelete: boolean = false) {
    const transaction = await this.prisma.transaction.findUnique({
      where: { id: transactionId },
    });

    if (!transaction) {
      throw new NotFoundException('Transaction not found');
    }

    // Prevent deletion of successful payments unless hard delete
    if (transaction.status === TransactionStatus.PAID && !hardDelete) {
      throw new BadRequestException(
        'Cannot delete a successful payment. Use hard delete if you are sure.',
      );
    }

    await this.prisma.transaction.delete({
      where: { id: transactionId },
    });

    return {
      message: 'Transaction deleted successfully',
    };
  }

  /**
   * Bulk actions
   */
  async bulkAction(bulkActionDto: BulkActionTransactionDto) {
    const { transactionIds, action } = bulkActionDto;

    const transactions = await this.prisma.transaction.findMany({
      where: { id: { in: transactionIds } },
      select: { id: true, status: true },
    });

    if (transactions.length !== transactionIds.length) {
      throw new BadRequestException('Some transaction IDs are invalid');
    }

    let result;

    switch (action) {
      case TransactionBulkActionType.MARK_PAID:
        result = await this.prisma.transaction.updateMany({
          where: { id: { in: transactionIds } },
          data: {
            status: TransactionStatus.PAID,
            paidAt: new Date(),
          },
        });
        break;

      case TransactionBulkActionType.MARK_FAILED:
        result = await this.prisma.transaction.updateMany({
          where: { id: { in: transactionIds } },
          data: { status: TransactionStatus.FAILED },
        });
        break;

      case TransactionBulkActionType.MARK_EXPIRED:
        result = await this.prisma.transaction.updateMany({
          where: { id: { in: transactionIds } },
          data: { status: TransactionStatus.EXPIRED },
        });
        break;

      case TransactionBulkActionType.REFUND:
        // Check if all transactions are PAID before refunding
        const unpaidTransactions = transactions.filter(
          (t) => t.status !== TransactionStatus.PAID,
        );
        if (unpaidTransactions.length > 0) {
          throw new BadRequestException('Can only refund paid transactions');
        }

        result = await this.prisma.transaction.updateMany({
          where: { id: { in: transactionIds } },
          data: { status: TransactionStatus.REFUNDED },
        });
        break;

      case TransactionBulkActionType.DELETE:
        // Only allow deletion of non-paid transactions
        const paidTransactions = transactions.filter(
          (t) => t.status === TransactionStatus.PAID,
        );
        if (paidTransactions.length > 0) {
          throw new BadRequestException('Cannot delete paid transactions');
        }

        result = await this.prisma.transaction.deleteMany({
          where: { id: { in: transactionIds } },
        });
        break;

      default:
        throw new BadRequestException('Invalid bulk action');
    }

    return {
      message: `Bulk action ${action} completed successfully`,
      affectedCount: result.count,
    };
  }

  /**
   * Get dashboard statistics
   */
  async getDashboardStats() {
    const [
      totalTransactions,
      paidTransactions,
      pendingTransactions,
      failedTransactions,
      totalRevenue,
      transactionsByStatus,
      transactionsByPaymentMethod,
      transactionsByCountry,
      transactionsByType,
      recentTransactions,
    ] = await Promise.all([
      this.prisma.transaction.count(),
      this.prisma.transaction.count({
        where: { status: TransactionStatus.PAID },
      }),
      this.prisma.transaction.count({
        where: { status: TransactionStatus.PENDING },
      }),
      this.prisma.transaction.count({
        where: {
          status: { in: [TransactionStatus.FAILED, TransactionStatus.EXPIRED] },
        },
      }),
      this.prisma.transaction.aggregate({
        where: { status: TransactionStatus.PAID },
        _sum: { finalAmount: true },
      }),
      this.prisma.transaction.groupBy({
        by: ['status'],
        _count: true,
        _sum: { finalAmount: true },
      }),
      this.prisma.transaction.groupBy({
        by: ['paymentMethodName'],
        _count: true,
        _sum: { finalAmount: true },
        where: { status: TransactionStatus.PAID },
        orderBy: {
          _count: {
            paymentMethodName: 'desc',
          },
        },
        take: 10,
      }),
      // Group by country using paymentMethod relation
      this.prisma.$queryRaw`
        SELECT 
          pm."countryCode",
          c.name as "countryName",
          c.currency,
          COUNT(t.id)::int as count,
          SUM(t."finalAmount")::decimal as "totalAmount"
        FROM "transactions" t
        LEFT JOIN "PaymentMethod" pm ON t."paymentMethodId" = pm.id
        LEFT JOIN "Country" c ON pm."countryCode" = c.code
        WHERE t.status = 'PAID' AND pm."countryCode" IS NOT NULL
        GROUP BY pm."countryCode", c.name, c.currency
        ORDER BY count DESC
      `,
      this.prisma.transaction.groupBy({
        by: ['transactionType'],
        _count: true,
        _sum: { finalAmount: true },
        where: { status: TransactionStatus.PAID },
      }),
      this.prisma.transaction.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
            },
          },
          event: {
            select: {
              id: true,
              title: true,
              slug: true,
              category: true,
            },
          },
          paymentMethod: {
            select: {
              name: true,
              countryCode: true,
              country: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
      }),
    ]);

    return {
      overview: {
        totalTransactions,
        paidTransactions,
        pendingTransactions,
        failedTransactions,
        totalRevenue: totalRevenue._sum.finalAmount || new Decimal(0),
      },
      breakdown: {
        byStatus: transactionsByStatus.map((item) => ({
          status: item.status,
          count: item._count,
          totalAmount: item._sum.finalAmount || new Decimal(0),
        })),
        byPaymentMethod: transactionsByPaymentMethod.map((item) => ({
          method: item.paymentMethodName,
          count: item._count,
          totalAmount: item._sum.finalAmount || new Decimal(0),
        })),
        byCountry: (transactionsByCountry as any[]).map((item) => ({
          countryCode: item.countryCode,
          countryName: item.countryName,
          currency: item.currency,
          count: item.count,
          totalAmount: new Decimal(item.totalAmount || 0),
        })),
        byType: transactionsByType.map((item) => ({
          type: item.transactionType,
          count: item._count,
          totalAmount: item._sum.finalAmount || new Decimal(0),
        })),
      },
      recentTransactions,
    };
  }

  /**
   * Export transactions
   */
  async exportTransactions(queryDto: QueryTransactionsDto) {
    const {
      search,
      status,
      paymentMethodId,
      userId,
      eventId,
      transactionType,
      dateFrom,
      dateTo,
      countryCode,
    } = queryDto;

    const where: Prisma.TransactionWhereInput = {};

    if (search) {
      where.OR = [
        { externalId: { contains: search, mode: 'insensitive' } },
        { user: { email: { contains: search, mode: 'insensitive' } } },
        { user: { firstName: { contains: search, mode: 'insensitive' } } },
        { user: { lastName: { contains: search, mode: 'insensitive' } } },
      ];
    }

    if (status) where.status = status;
    if (paymentMethodId) where.paymentMethodId = paymentMethodId;
    if (userId) where.userId = userId;
    if (eventId) where.eventId = eventId;
    if (transactionType) where.transactionType = transactionType;

    if (countryCode) {
      where.paymentMethod = {
        countryCode: countryCode,
      };
    }

    if (dateFrom || dateTo) {
      where.createdAt = {};
      if (dateFrom) where.createdAt.gte = new Date(dateFrom);
      if (dateTo) where.createdAt.lte = new Date(dateTo);
    }

    const transactions = await this.prisma.transaction.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
        event: {
          select: {
            id: true,
            title: true,
            category: true,
            eventDate: true,
          },
        },
        paymentMethod: {
          select: {
            name: true,
            countryCode: true,
            currency: true,
          },
        },
        userSubscription: {
          include: {
            plan: true,
          },
        },
      },
    });

    return transactions;
  }

  /**
   * Get transaction statistics by date range
   */
  async getTransactionsByDateRange(startDate: Date, endDate: Date) {
    const transactions = await this.prisma.transaction.findMany({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        paymentMethod: {
          select: {
            countryCode: true,
            currency: true,
          },
        },
      },
    });

    return transactions;
  }
}