'use client';

import Link from 'next/link';
import { Transaction, PaymentStatus, TransactionType } from '@/types/payment.types';
import { format } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';
import { cn, formatCurrency } from '@/lib/utils';
import {
  CheckCircle2,
  Clock,
  XCircle,
  AlertCircle,
  Calendar,
  CreditCard,
  Crown,
  ArrowRight,
} from 'lucide-react';
import { FaCircleCheck } from 'react-icons/fa6';

interface TransactionCardProps {
  transaction: Transaction;
}

const statusConfig = {
  [PaymentStatus.PENDING]: {
    icon: Clock,
    color: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    label: 'Pending',
  },
  [PaymentStatus.PAID]: {
    icon: CheckCircle2,
    color: 'bg-green-50 text-green-700 border-green-200',
    label: 'Paid',
  },
  [PaymentStatus.FAILED]: {
    icon: XCircle,
    color: 'bg-red-50 text-red-700 border-red-200',
    label: 'Failed',
  },
  [PaymentStatus.EXPIRED]: {
    icon: AlertCircle,
    color: 'bg-gray-50 text-gray-700 border-gray-200',
    label: 'Expired',
  },
  [PaymentStatus.REFUNDED]: {
    icon: AlertCircle,
    color: 'bg-blue-50 text-blue-700 border-blue-200',
    label: 'Refunded',
  },
};

export function TransactionCard({ transaction }: TransactionCardProps) {
  const status = statusConfig[transaction.paymentStatus];
  const StatusIcon = status.icon;
  const isSubscription = transaction.transactionType === TransactionType.SUBSCRIPTION;

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-5 hover:border-brand/40 hover:shadow-sm transition-all">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            {/* Type Badge */}
            {isSubscription && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-orange-50 text-orange-700 border border-orange-200 rounded text-xs font-medium">
                <Crown className="w-3 h-3" />
                Subscription
              </span>
            )}
            <div className="flex gap-1 items-center">
              <h3 className="font-semibold text-gray-900 text-base truncate">
                {transaction.event?.title || 'Subscription Payment'}
              </h3>
              {transaction.event?.partner?.isPreferred && (
                <FaCircleCheck className={cn("size-3",
                  transaction.event?.partner?.type === 'BRAND' ? "text-amber-400"
                  : "text-green-600"
                )} />
              )}
            </div>
          </div>
          <p className="text-xs text-gray-600 font-mono">
            {transaction.merchantRef}
          </p>
        </div>

        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full border ${status.color} shrink-0`}
        >
          <StatusIcon className="w-3.5 h-3.5" />
          {status.label}
        </span>
      </div>

      {/* Event Info - Only for event transactions */}
      {!isSubscription && transaction.event && (
        <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
          <Calendar className="w-4 h-4 text-gray-400" />
          <span>
            {format(
              new Date(transaction.event.eventDate),
              'EEE, dd MMM yyyy',
              { locale: idLocale }
            )}
          </span>
        </div>
      )}

      {/* Payment Details */}
      <div className="space-y-2.5 mb-4">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <CreditCard className="w-4 h-4 text-gray-400" />
          <span className="truncate">{transaction.paymentName}</span>
        </div>

        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Amount</span>
          <span className="font-semibold text-gray-900">
            {formatCurrency(transaction.amount, 'IDR')}
          </span>
        </div>

        {transaction.feeCustomer > 0 && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Fee</span>
            <span className="text-brand font-medium">
              + {formatCurrency(transaction.feeCustomer, 'IDR')}
            </span>
          </div>
        )}

        <div className="flex items-center justify-between text-sm pt-2 border-t border-gray-200">
          <span className="font-semibold text-gray-900">Total Paid</span>
          <span className="font-bold text-brand">
            {formatCurrency(
              transaction.amount + transaction.feeCustomer,
              'IDR'
            )}
          </span>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
        <span className="text-xs text-gray-600">
          {format(new Date(transaction.createdAt), 'dd MMM yyyy, HH:mm', {
            locale: idLocale,
          })}
        </span>

        <Link
          href={`/payment/${transaction.id}`}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-brand hover:text-brand/80 transition-colors"
        >
          View Details
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}