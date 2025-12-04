import { 
  Injectable, 
  NotFoundException, 
  BadRequestException 
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma, PaymentStatus } from '@prisma/client';
import { QueryTransactionsDto, SortOrder } from './dto/query-transactions.dto';
import { BulkActionTransactionDto, TransactionBulkActionType } from './dto/bulk-action-transaction.dto';

@Injectable()
export class TransactionsService {
  constructor(private prisma: PrismaService) {}

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
      paymentStatus,
      paymentMethod,
      userId,
      eventId,
      dateFrom,
      dateTo,
    } = queryDto;

    const where: Prisma.LegacyTransactionWhereInput = {};

    // Search
    if (search) {
      where.OR = [
        { tripayReference: { contains: search, mode: 'insensitive' } },
        { merchantRef: { contains: search, mode: 'insensitive' } },
        { customerName: { contains: search, mode: 'insensitive' } },
        { customerEmail: { contains: search, mode: 'insensitive' } },
        { customerPhone: { contains: search, mode: 'insensitive' } },
        { user: { email: { contains: search, mode: 'insensitive' } } },
        { event: { title: { contains: search, mode: 'insensitive' } } },
      ];
    }

    // Filters
    if (paymentStatus) where.paymentStatus = paymentStatus;
    if (paymentMethod) where.paymentMethodCode = { contains: paymentMethod, mode: 'insensitive' };
    if (userId) where.userId = userId;
    if (eventId) where.eventId = eventId;

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
      this.prisma.legacyTransaction.findMany({
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
            },
          },
        },
      }),
      this.prisma.legacyTransaction.count({ where }),
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
        paymentStatus,
        paymentMethod,
        userId,
        eventId,
        dateFrom,
        dateTo,
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
    const transaction = await this.prisma.legacyTransaction.findUnique({
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
   * Delete transaction
   */
  async deleteTransaction(transactionId: string, hardDelete: boolean = false) {
    const transaction = await this.prisma.legacyTransaction.findUnique({
      where: { id: transactionId },
    });

    if (!transaction) {
      throw new NotFoundException('Transaction not found');
    }

    // Prevent deletion of successful payments unless hard delete
    if (transaction.paymentStatus === PaymentStatus.PAID && !hardDelete) {
      throw new BadRequestException('Cannot delete a successful payment. Use hard delete if you are sure.');
    }

    await this.prisma.legacyTransaction.delete({
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

    const transactions = await this.prisma.legacyTransaction.findMany({
      where: { id: { in: transactionIds } },
      select: { id: true, paymentStatus: true },
    });

    if (transactions.length !== transactionIds.length) {
      throw new BadRequestException('Some transaction IDs are invalid');
    }

    let result;

    switch (action) {
      case TransactionBulkActionType.MARK_PAID:
        result = await this.prisma.legacyTransaction.updateMany({
          where: { id: { in: transactionIds } },
          data: { 
            paymentStatus: PaymentStatus.PAID,
            paidAt: new Date(),
          },
        });
        break;

      case TransactionBulkActionType.MARK_FAILED:
        result = await this.prisma.legacyTransaction.updateMany({
          where: { id: { in: transactionIds } },
          data: { paymentStatus: PaymentStatus.FAILED },
        });
        break;

      case TransactionBulkActionType.MARK_EXPIRED:
        result = await this.prisma.legacyTransaction.updateMany({
          where: { id: { in: transactionIds } },
          data: { paymentStatus: PaymentStatus.EXPIRED },
        });
        break;

      case TransactionBulkActionType.REFUND:
        // Check if all transactions are PAID before refunding
        const unpaidTransactions = transactions.filter(
          (t) => t.paymentStatus !== PaymentStatus.PAID
        );
        if (unpaidTransactions.length > 0) {
          throw new BadRequestException('Can only refund paid transactions');
        }

        result = await this.prisma.legacyTransaction.updateMany({
          where: { id: { in: transactionIds } },
          data: { paymentStatus: PaymentStatus.REFUNDED },
        });
        break;

      case TransactionBulkActionType.DELETE:
        // Only allow deletion of non-paid transactions
        const paidTransactions = transactions.filter(
          (t) => t.paymentStatus === PaymentStatus.PAID
        );
        if (paidTransactions.length > 0) {
          throw new BadRequestException('Cannot delete paid transactions');
        }

        result = await this.prisma.legacyTransaction.deleteMany({
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
      recentTransactions,
    ] = await Promise.all([
      this.prisma.legacyTransaction.count(),
      this.prisma.legacyTransaction.count({ 
        where: { paymentStatus: PaymentStatus.PAID } 
      }),
      this.prisma.legacyTransaction.count({ 
        where: { paymentStatus: PaymentStatus.PENDING } 
      }),
      this.prisma.legacyTransaction.count({ 
        where: { 
          paymentStatus: { in: [PaymentStatus.FAILED, PaymentStatus.EXPIRED] } 
        } 
      }),
      this.prisma.legacyTransaction.aggregate({
        where: { paymentStatus: PaymentStatus.PAID },
        _sum: { amountReceived: true },
      }),
      this.prisma.legacyTransaction.groupBy({
        by: ['paymentStatus'],
        _count: true,
        _sum: { amountReceived: true },
      }),
      this.prisma.legacyTransaction.groupBy({
        by: ['paymentMethod'],
        _count: true,
        _sum: { amountReceived: true },
        where: { paymentStatus: PaymentStatus.PAID },
      }),
      this.prisma.legacyTransaction.findMany({
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
        },
      }),
    ]);

    return {
      overview: {
        totalTransactions,
        paidTransactions,
        pendingTransactions,
        failedTransactions,
        totalRevenue: totalRevenue._sum.amountReceived || 0,
      },
      breakdown: {
        byStatus: transactionsByStatus.map((item) => ({
          status: item.paymentStatus,
          count: item._count,
          totalAmount: item._sum.amountReceived || 0,
        })),
        byPaymentMethod: transactionsByPaymentMethod.map((item) => ({
          method: item.paymentMethod,
          count: item._count,
          totalAmount: item._sum.amountReceived || 0,
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
      paymentStatus, 
      paymentMethod,
      userId,
      eventId,
      dateFrom, 
      dateTo 
    } = queryDto;

    const where: Prisma.LegacyTransactionWhereInput = {};

    if (search) {
      where.OR = [
        { tripayReference: { contains: search, mode: 'insensitive' } },
        { merchantRef: { contains: search, mode: 'insensitive' } },
        { customerName: { contains: search, mode: 'insensitive' } },
        { customerEmail: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (paymentStatus) where.paymentStatus = paymentStatus;
    if (paymentMethod) where.paymentMethodCode = { contains: paymentMethod, mode: 'insensitive' };
    if (userId) where.userId = userId;
    if (eventId) where.eventId = eventId;

    if (dateFrom || dateTo) {
      where.createdAt = {};
      if (dateFrom) where.createdAt.gte = new Date(dateFrom);
      if (dateTo) where.createdAt.lte = new Date(dateTo);
    }

    const transactions = await this.prisma.legacyTransaction.findMany({
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
      },
    });

    return transactions;
  }
}