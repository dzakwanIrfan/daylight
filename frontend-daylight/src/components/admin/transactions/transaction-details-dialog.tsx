'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Transaction, PaymentStatus, TransactionType } from '@/types/transaction.types';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { format } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';
import { 
  User, 
  Calendar, 
  CreditCard, 
  DollarSign, 
  Hash,
  CheckCircle,
  Clock,
  XCircle,
  Package,
  Crown
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface TransactionDetailsDialogProps {
  transaction: Transaction;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const statusColors: Record<PaymentStatus, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  PAID: 'bg-green-100 text-green-800 border-green-200',
  FAILED: 'bg-red-100 text-red-800 border-red-200',
  EXPIRED: 'bg-gray-100 text-gray-800 border-gray-200',
  REFUNDED: 'bg-purple-100 text-purple-800 border-purple-200',
};

const typeColors: Record<TransactionType, string> = {
  EVENT: 'bg-blue-100 text-blue-800 border-blue-200',
  SUBSCRIPTION: 'bg-orange-100 text-orange-800 border-orange-200',
};

const statusIcons: Record<PaymentStatus, React.ReactNode> = {
  PENDING: <Clock className="h-4 w-4" />,
  PAID: <CheckCircle className="h-4 w-4" />,
  FAILED: <XCircle className="h-4 w-4" />,
  EXPIRED: <XCircle className="h-4 w-4" />,
  REFUNDED: <XCircle className="h-4 w-4" />,
};

export function TransactionDetailsDialog({ transaction, open, onOpenChange }: TransactionDetailsDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto bg-white">
        <DialogHeader>
          <DialogTitle className="text-xl">Transaction Details</DialogTitle>
          <div className="flex gap-2 mt-2">
            <Badge variant="outline" className={typeColors[transaction.transactionType]}>
              {transaction.transactionType === TransactionType.EVENT && <Package className="mr-1 h-3 w-3" />}
              {transaction.transactionType === TransactionType.SUBSCRIPTION && <Crown className="mr-1 h-3 w-3" />}
              {transaction.transactionType}
            </Badge>
            <Badge variant="outline" className={statusColors[transaction.paymentStatus]}>
              <span className="mr-1">{statusIcons[transaction.paymentStatus]}</span>
              {transaction.paymentStatus}
            </Badge>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          {/* Transaction IDs */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Hash className="h-4 w-4" />
                <span className="font-medium">Merchant Reference</span>
              </div>
              <p className="font-mono text-sm text-gray-900 ml-6 break-all">
                {transaction.merchantRef}
              </p>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Hash className="h-4 w-4" />
                <span className="font-medium">Tripay Reference</span>
              </div>
              <p className="font-mono text-sm text-gray-900 ml-6 break-all">
                {transaction.tripayReference}
              </p>
            </div>
          </div>

          <Separator />

          {/* Customer Information */}
          <div>
            <h4 className="font-semibold text-sm text-gray-700 mb-3 flex items-center gap-2">
              <User className="h-4 w-4" />
              Customer Information
            </h4>
            <div className="grid grid-cols-2 gap-4 ml-6">
              <div className="space-y-1">
                <span className="text-xs text-gray-500">Name</span>
                <p className="text-sm text-gray-900">{transaction.customerName}</p>
              </div>
              <div className="space-y-1">
                <span className="text-xs text-gray-500">Email</span>
                <p className="text-sm text-gray-900 break-all">{transaction.customerEmail}</p>
              </div>
              {transaction.customerPhone && (
                <div className="space-y-1">
                  <span className="text-xs text-gray-500">Phone</span>
                  <p className="text-sm text-gray-900">{transaction.customerPhone}</p>
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Item Information - EVENT */}
          {transaction.transactionType === TransactionType.EVENT && transaction.event && (
            <>
              <div>
                <h4 className="font-semibold text-sm text-gray-700 mb-3 flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Event Information
                </h4>
                <div className="space-y-2 ml-6">
                  <div className="space-y-1">
                    <span className="text-xs text-gray-500">Event Title</span>
                    <p className="text-sm font-medium text-gray-900">{transaction.event.title}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <span className="text-xs text-gray-500">Date</span>
                      <p className="text-sm text-gray-900">
                        {format(new Date(transaction.event.eventDate), 'dd MMMM yyyy', { locale: idLocale })}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <span className="text-xs text-gray-500">Location</span>
                      <p className="text-sm text-gray-900">{transaction.event.venue}, {transaction.event.city}</p>
                    </div>
                  </div>
                </div>
              </div>
              <Separator />
            </>
          )}

          {/* Item Information - SUBSCRIPTION */}
          {transaction.transactionType === TransactionType.SUBSCRIPTION && transaction.userSubscription && (
            <>
              <div>
                <h4 className="font-semibold text-sm text-gray-700 mb-3 flex items-center gap-2">
                  <Crown className="h-4 w-4" />
                  Subscription Information
                </h4>
                <div className="space-y-2 ml-6">
                  <div className="space-y-1">
                    <span className="text-xs text-gray-500">Plan Name</span>
                    <p className="text-sm font-medium text-gray-900">{transaction.userSubscription.plan.name}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <span className="text-xs text-gray-500">Duration</span>
                      <p className="text-sm text-gray-900">
                        {transaction.userSubscription.plan.durationInMonths} month(s)
                      </p>
                    </div>
                    <div className="space-y-1">
                      <span className="text-xs text-gray-500">Status</span>
                      <Badge variant="outline" className="text-xs">
                        {transaction.userSubscription.status}
                      </Badge>
                    </div>
                  </div>
                  {transaction.userSubscription.startDate && transaction.userSubscription.endDate && (
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <span className="text-xs text-gray-500">Start Date</span>
                        <p className="text-sm text-gray-900">
                          {format(new Date(transaction.userSubscription.startDate), 'dd MMM yyyy', { locale: idLocale })}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <span className="text-xs text-gray-500">End Date</span>
                        <p className="text-sm text-gray-900">
                          {format(new Date(transaction.userSubscription.endDate), 'dd MMM yyyy', { locale: idLocale })}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <Separator />
            </>
          )}

          {/* Payment Information */}
          <div>
            <h4 className="font-semibold text-sm text-gray-700 mb-3 flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              Payment Information
            </h4>
            <div className="grid grid-cols-2 gap-4 ml-6">
              <div className="space-y-1">
                <span className="text-xs text-gray-500">Payment Method</span>
                <p className="text-sm text-gray-900">{transaction.paymentName}</p>
                <p className="text-xs text-gray-500">{transaction.paymentMethod}</p>
              </div>
              {transaction.payCode && (
                <div className="space-y-1">
                  <span className="text-xs text-gray-500">Payment Code</span>
                  <p className="font-mono text-sm font-medium text-gray-900">{transaction.payCode}</p>
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Amount Breakdown */}
          <div>
            <h4 className="font-semibold text-sm text-gray-700 mb-3 flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Amount Breakdown
            </h4>
            <div className="space-y-2 ml-6">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Base Amount</span>
                <span className="text-sm font-medium text-gray-900">
                  {formatCurrency(transaction.amount, 'IDR')}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Merchant Fee</span>
                <span className="text-sm text-gray-900">
                  {formatCurrency(transaction.feeMerchant, 'IDR')}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Customer Fee</span>
                <span className="text-sm text-gray-900">
                  {formatCurrency(transaction.feeCustomer, 'IDR')}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Total Fee</span>
                <span className="text-sm text-gray-900">
                  {formatCurrency(transaction.totalFee, 'IDR')}
                </span>
              </div>
              <Separator />
              <div className="flex justify-between items-center">
                <span className="text-sm font-semibold text-gray-900">Amount Received</span>
                <span className="text-lg font-bold text-green-600">
                  {formatCurrency(transaction.amountReceived, 'IDR')}
                </span>
              </div>
            </div>
          </div>

          <Separator />

          {/* Timestamps */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <span className="text-xs text-gray-500">Created At</span>
              <p className="text-sm text-gray-900">
                {format(new Date(transaction.createdAt), 'dd MMM yyyy, HH:mm', { locale: idLocale })}
              </p>
            </div>
            {transaction.paidAt && (
              <div className="space-y-1">
                <span className="text-xs text-gray-500">Paid At</span>
                <p className="text-sm text-green-600 font-medium">
                  {format(new Date(transaction.paidAt), 'dd MMM yyyy, HH:mm', { locale: idLocale })}
                </p>
              </div>
            )}
            {transaction.expiredAt && (
              <div className="space-y-1">
                <span className="text-xs text-gray-500">Expires At</span>
                <p className="text-sm text-gray-900">
                  {format(new Date(transaction.expiredAt), 'dd MMM yyyy, HH:mm', { locale: idLocale })}
                </p>
              </div>
            )}
          </div>

          {/* Payment Links */}
          {(transaction.checkoutUrl || transaction.qrUrl) && (
            <>
              <Separator />
              <div className="space-y-2">
                {transaction.checkoutUrl && (
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => window.open(transaction.checkoutUrl!, '_blank')}
                  >
                    Open Payment Link
                  </Button>
                )}
                {transaction.qrUrl && (
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => window.open(transaction.qrUrl!, '_blank')}
                  >
                    View QR Code
                  </Button>
                )}
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}