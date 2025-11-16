'use client';

import Link from 'next/link';
import { Transaction, PaymentStatus } from '@/types/payment.types';
import { format } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';
import { formatCurrency } from '@/lib/utils';
import {
  CheckCircle2,
  Clock,
  XCircle,
  AlertCircle,
  Calendar,
  CreditCard,
} from 'lucide-react';

interface TransactionCardProps {
  transaction: Transaction;
}

const statusConfig = {
  [PaymentStatus.PENDING]: {
    icon: Clock,
    color: 'text-yellow-700 bg-yellow-50 border-yellow-200',
    label: 'Pending',
  },
  [PaymentStatus.PAID]: {
    icon: CheckCircle2,
    color: 'text-green-700 bg-green-50 border-green-200',
    label: 'Paid',
  },
  [PaymentStatus.FAILED]: {
    icon: XCircle,
    color: 'text-red-700 bg-red-50 border-red-200',
    label: 'Failed',
  },
  [PaymentStatus.EXPIRED]: {
    icon: AlertCircle,
    color: 'text-gray-700 bg-gray-50 border-gray-200',
    label: 'Expired',
  },
  [PaymentStatus.REFUNDED]: {
    icon: AlertCircle,
    color: 'text-blue-700 bg-blue-50 border-blue-200',
    label: 'Refunded',
  },
};

export function TransactionCard({ transaction }: TransactionCardProps) {
  const status = statusConfig[transaction.paymentStatus];
  const StatusIcon = status.icon;

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 hover:border-brand hover:shadow-md transition-all">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="font-semibold text-gray-900 line-clamp-1">
              {transaction.event?.title || 'Event'}
            </h3>
          </div>
          <p className="text-xs text-gray-600 font-mono">
            {transaction.merchantRef}
          </p>
        </div>

        <span
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-full border ${status.color} shrink-0`}
        >
          <StatusIcon className="w-3.5 h-3.5" />
          {status.label}
        </span>
      </div>

      {/* Event Info */}
      {transaction.event && (
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
      <div className="space-y-2 mb-4">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <CreditCard className="w-4 h-4 text-gray-400" />
          <span>{transaction.paymentName}</span>
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
            <span className="text-orange-600">
              + {formatCurrency(transaction.feeCustomer, 'IDR')}
            </span>
          </div>
        )}

        <div className="flex items-center justify-between text-sm pt-2 border-t border-gray-200">
          <span className="font-medium text-gray-900">Total Paid</span>
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
          className="text-sm font-medium text-brand hover:text-brand/80 transition-colors"
        >
          View Details →
        </Link>
      </div>
    </div>
  );
}