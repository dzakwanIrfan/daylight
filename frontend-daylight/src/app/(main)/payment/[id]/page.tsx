// frontend-daylight/src/app/(main)/payment/[id]/page.tsx
'use client';

import { DashboardLayout } from '@/components/main/dashboard-layout';
import { useParams, useRouter } from 'next/navigation';
import { useTransactionDetail } from '@/hooks/use-payment';
import { usePaymentSocket } from '@/hooks/use-payment-socket';
import {
  Loader2,
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
  ArrowLeft,
  Calendar,
  MapPin,
  Wifi,
  WifiOff,
} from 'lucide-react';
import { PaymentInstructions } from '@/components/payment/payment-instructions';
import { CountdownTimer } from '@/components/payment/countdown-timer';
import { PaymentStatus } from '@/types/payment.types';
import { format } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';
import { formatCurrency } from '@/lib/utils';

export default function PaymentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const transactionId = params.id as string;

  const { data: transactionResponse, isLoading, refetch } = useTransactionDetail(transactionId);
  const transaction = transactionResponse?.data;
  const isPending = transaction?.paymentStatus === PaymentStatus.PENDING;

  // WebSocket
  const { isConnected, isSubscribed } = usePaymentSocket({
    transactionId: isPending ? transactionId : undefined,
    enabled: isPending,
    onPaymentUpdate: () => {
      console.log('Refetching transaction...');
      refetch();
    },
    onPaymentSuccess: () => {
      refetch();
      setTimeout(() => router.push('/my-events'), 3000);
    },
    onPaymentFailed: () => refetch(),
    onPaymentExpired: () => refetch(),
  });

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-brand" />
        </div>
      </DashboardLayout>
    );
  }

  if (!transaction) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <h3 className="text-lg font-semibold mb-2">Transaction not found</h3>
          <button onClick={() => router.push('/my-events')} className="text-brand hover:underline">
            Go to My Events
          </button>
        </div>
      </DashboardLayout>
    );
  }

  const isPaid = transaction.paymentStatus === PaymentStatus.PAID;
  const isFailed = transaction.paymentStatus === PaymentStatus.FAILED;
  const isExpired = transaction.paymentStatus === PaymentStatus.EXPIRED;

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-3xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => router.push('/my-events')}
          className="flex items-center gap-2 text-gray-600 hover:text-brand transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm font-medium">Back to My Events</span>
        </button>

        {/* Connection Status - Only for pending */}
        {isPending && (
          <div className={`flex items-center gap-2 text-sm px-4 py-2 rounded-lg ${
            isConnected 
              ? 'bg-green-50 text-green-700' 
              : 'bg-yellow-50 text-yellow-700'
          }`}>
            {isConnected ? (
              <>
                <Wifi className="w-4 h-4" />
                <span>Live updates active</span>
                {isSubscribed && (
                  <span className="ml-2 text-xs bg-green-200 px-2 py-0.5 rounded">Watching</span>
                )}
              </>
            ) : (
              <>
                <WifiOff className="w-4 h-4" />
                <span>Connecting...</span>
              </>
            )}
          </div>
        )}

        {/* Status Header */}
        <div className={`rounded-xl p-6 text-white ${
          isPaid ? 'bg-green-500' :
          isPending ? 'bg-brand' :
          isFailed ? 'bg-red-500' :
          'bg-gray-500'
        }`}>
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                {isPaid ? <CheckCircle2 className="w-6 h-6" /> :
                 isPending ? <Clock className="w-6 h-6" /> :
                 isFailed ? <XCircle className="w-6 h-6" /> :
                 <AlertCircle className="w-6 h-6" />}
              </div>
              <div>
                <h1 className="text-2xl font-bold mb-1">
                  {isPaid ? 'Payment Successful! 🎉' :
                   isPending ? 'Waiting for Payment' :
                   isFailed ? 'Payment Failed' :
                   'Payment Expired'}
                </h1>
                <p className="text-white/90 text-sm">
                  {isPaid ? 'Your ticket has been confirmed' :
                   isPending ? 'Complete your payment before it expires' :
                   isFailed ? 'Please try again' :
                   'This payment link has expired'}
                </p>
              </div>
            </div>

            {isPending && transaction.expiredAt && (
              <CountdownTimer expiredAt={transaction.expiredAt} onExpired={() => refetch()} />
            )}
          </div>
        </div>

        {/* Event Details */}
        {transaction.event && (
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h2 className="text-lg font-semibold mb-4">Event Details</h2>
            <div className="space-y-3">
              <h3 className="font-semibold text-xl">{transaction.event.title}</h3>
              <div className="flex items-start gap-2 text-sm">
                <Calendar className="w-4 h-4 text-gray-400 mt-0.5" />
                <span>
                  {format(new Date(transaction.event.eventDate), 'EEEE, dd MMMM yyyy', { locale: idLocale })}
                </span>
              </div>
              <div className="flex items-start gap-2 text-sm">
                <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
                <span>{transaction.event.venue}, {transaction.event.city}</span>
              </div>
            </div>
          </div>
        )}

        {/* Payment Summary */}
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h2 className="text-lg font-semibold mb-4">Payment Summary</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Payment Method</span>
              <span className="font-medium">{transaction.paymentName}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Event Price</span>
              <span className="font-medium">{formatCurrency(transaction.amount, 'IDR')}</span>
            </div>
            {transaction.feeCustomer > 0 && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Payment Fee</span>
                <span className="font-medium text-orange-600">
                  + {formatCurrency(transaction.feeCustomer, 'IDR')}
                </span>
              </div>
            )}
            <div className="border-t border-gray-200 pt-3 mt-3"></div>
            <div className="flex items-center justify-between">
              <span className="font-semibold">Total Payment</span>
              <span className="font-bold text-xl text-brand">
                {formatCurrency(transaction.amount + transaction.feeCustomer, 'IDR')}
              </span>
            </div>
            {isPaid && transaction.paidAt && (
              <div className="bg-green-50 rounded-lg p-3 mt-4">
                <p className="text-sm text-green-800">
                  <span className="font-semibold">Paid on:</span>{' '}
                  {format(new Date(transaction.paidAt), 'dd MMM yyyy, HH:mm', { locale: idLocale })}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Payment Instructions */}
        {isPending && (transaction.instructions || transaction.payCode || transaction.payUrl || transaction.qrUrl) && (
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h2 className="text-lg font-semibold mb-4">How to Complete Payment</h2>
            <PaymentInstructions
              instructions={transaction.instructions || []}
              payCode={transaction.payCode}
              payUrl={transaction.payUrl}
              qrUrl={transaction.qrUrl}
            />
          </div>
        )}

        {/* Transaction Info */}
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-6">
          <h3 className="font-semibold mb-3">Transaction Information</h3>
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Transaction ID</span>
              <span className="font-mono text-xs">{transaction.merchantRef}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Customer Name</span>
              <span>{transaction.customerName}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Email</span>
              <span className="truncate ml-2">{transaction.customerEmail}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Created At</span>
              <span>
                {format(new Date(transaction.createdAt), 'dd MMM yyyy, HH:mm', { locale: idLocale })}
              </span>
            </div>
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="space-y-3 pb-6">
          {isPaid && (
            <button
              onClick={() => router.push('/my-events')}
              className="w-full bg-brand hover:bg-brand/90 text-white rounded-xl px-6 py-4 font-semibold text-lg transition-all"
            >
              View My Events
            </button>
          )}
          {(isFailed || isExpired) && (
            <button
              onClick={() => router.push(`/events/${transaction.event?.slug || ''}/payment`)}
              className="w-full bg-brand hover:bg-brand/90 text-white rounded-xl px-6 py-4 font-semibold text-lg transition-all"
            >
              Try Again
            </button>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}