"use client";

import { useEffect } from "react";
import { DashboardLayout } from "@/components/main/dashboard-layout";
import { useParams, useRouter } from "next/navigation";
import { useXenditTransaction } from "@/hooks/use-xendit";
import { useXenditSocket } from "@/hooks/use-xendit-socket";
import { xenditService } from "@/services/xendit.service";
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
  RefreshCw,
  Receipt,
  CreditCard,
  Ticket,
} from "lucide-react";
import { XenditPaymentInstructions } from "@/components/xendit/payment-instructions";
import { XenditCountdownTimer } from "@/components/xendit/countdown-timer";
import { XenditTransactionStatusBadge } from "@/components/xendit/transaction-status-badge";
import { XenditPaymentSuccess } from "@/components/xendit/payment-success";
import { XenditTransactionStatus } from "@/types/xendit.types";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { formatCurrency, cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function XenditPaymentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const transactionId = params.id as string;

  // Query transaction
  const {
    data: transactionResponse,
    isLoading,
    refetch,
  } = useXenditTransaction(transactionId);
  const transaction = transactionResponse?.data;

  // Status checks
  const isPending = transaction?.status === XenditTransactionStatus.PENDING;
  const isPaid = transaction?.status === XenditTransactionStatus.PAID;
  const isFailed = transaction?.status === XenditTransactionStatus.FAILED;
  const isExpired = transaction?.status === XenditTransactionStatus.EXPIRED;

  // WebSocket for real-time updates
  const { isConnected, isSubscribed } = useXenditSocket({
    transactionId: isPending ? transactionId : undefined,
    enabled: isPending,
    onPaymentUpdate: () => {
      console.log("🔄 Payment updated, refetching...");
      refetch();
    },
    onPaymentSuccess: () => {
      console.log("✅ Payment success!");
      refetch();
    },
    onPaymentFailed: () => {
      console.log("❌ Payment failed");
      refetch();
    },
    onPaymentExpired: () => {
      console.log("⏰ Payment expired");
      refetch();
    },
  });

  // Calculate expiry (default 30 minutes from creation)
  const expiryTime = transaction
    ? new Date(new Date(transaction.createdAt).getTime() + 30 * 60 * 1000)
    : null;

  // Loading state
  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin text-brand mx-auto mb-3" />
            <p className="text-sm sm:text-base text-gray-600">
              Memuat detail pembayaran...
            </p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Transaction not found
  if (!transaction) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
          <AlertCircle className="w-12 h-12 text-gray-400 mb-3" />
          <h3 className="text-lg font-semibold mb-2">
            Transaksi tidak ditemukan
          </h3>
          <Button variant="link" onClick={() => router.push("/my-events")}>
            Lihat Event Saya
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  // Success state - show celebration
  if (isPaid) {
    return (
      <DashboardLayout>
        <div className="max-w-lg mx-auto px-4">
          <XenditPaymentSuccess
            eventTitle={transaction.event?.title}
            eventDate={
              transaction.event?.eventDate
                ? format(
                    new Date(transaction.event.eventDate),
                    "EEEE, dd MMMM yyyy",
                    { locale: idLocale }
                  )
                : undefined
            }
            eventVenue={
              transaction.event
                ? `${transaction.event.venue}, ${transaction.event.city}`
                : undefined
            }
            transactionId={transaction.externalId}
            onContinue={() => router.push("/my-events")}
          />
        </div>
      </DashboardLayout>
    );
  }

  // Get status config
  const getStatusConfig = () => {
    if (isPaid) {
      return {
        gradient: "from-green-500 to-emerald-600",
        icon: <CheckCircle2 className="w-6 h-6 sm:w-7 sm:h-7" />,
        title: "Pembayaran Berhasil!  🎉",
        subtitle: "Tiket kamu sudah dikonfirmasi",
      };
    }
    if (isPending) {
      return {
        gradient: "from-brand to-orange-500",
        icon: <Clock className="w-6 h-6 sm:w-7 sm:h-7" />,
        title: "Menunggu Pembayaran",
        subtitle: "Selesaikan pembayaran sebelum waktu habis",
      };
    }
    if (isFailed) {
      return {
        gradient: "from-red-500 to-red-600",
        icon: <XCircle className="w-6 h-6 sm:w-7 sm:h-7" />,
        title: "Pembayaran Gagal",
        subtitle: "Silakan coba lagi dengan metode lain",
      };
    }
    return {
      gradient: "from-gray-500 to-gray-600",
      icon: <AlertCircle className="w-6 h-6 sm:w-7 sm:h-7" />,
      title: "Pembayaran Kadaluarsa",
      subtitle: "Link pembayaran sudah tidak berlaku",
    };
  };

  const statusConfig = getStatusConfig();

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 pb-8">
        {/* Back Button */}
        <button
          onClick={() => router.push("/my-events")}
          className="flex items-center gap-2 text-gray-600 hover:text-brand transition-colors mb-4 sm:mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm font-medium">Kembali ke Event Saya</span>
        </button>

        {/* Connection Status - Only for pending */}
        {isPending && (
          <Alert
            className={cn(
              "mb-4 flex items-center justify-between border",
              isConnected
                ? "bg-green-50 border-green-200 text-green-700"
                : "bg-yellow-50 border-yellow-200 text-yellow-700"
            )}
          >
            <div className="flex items-center gap-2">
              {isConnected ? (
                <>
                  <Wifi className="w-4 h-4" />
                  <span className="text-xs sm:text-sm">
                    Update otomatis aktif
                  </span>
                  {isSubscribed && (
                    <Badge
                      variant="secondary"
                      className="text-[10px] bg-green-100 text-green-700"
                    >
                      Terhubung
                    </Badge>
                  )}
                </>
              ) : (
                <>
                  <WifiOff className="w-4 h-4" />
                  <span className="text-xs sm:text-sm">Menghubungkan... </span>
                </>
              )}
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => refetch()}
            >
              <RefreshCw className="w-4 h-4" />
            </Button>
          </Alert>
        )}

        {/* Status Header */}
        <div
          className={cn(
            "rounded-xl sm:rounded-2xl p-4 sm:p-6 text-white bg-linear-to-r mb-4 sm:mb-6",
            statusConfig.gradient
          )}
        >
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div className="flex items-start gap-3 sm:gap-4">
              <div className="w-11 h-11 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-white/20 flex items-center justify-center shrink-0">
                {statusConfig.icon}
              </div>
              <div className="min-w-0">
                <h1 className="text-lg sm:text-2xl font-bold mb-0.5 sm:mb-1 leading-tight">
                  {statusConfig.title}
                </h1>
                <p className="text-white/90 text-xs sm:text-sm">
                  {statusConfig.subtitle}
                </p>
              </div>
            </div>

            {/* Countdown Timer */}
            {isPending && expiryTime && (
              <XenditCountdownTimer
                expiredAt={expiryTime.toISOString()}
                onExpired={() => refetch()}
                size="sm"
                className="self-end sm:self-start"
              />
            )}
          </div>
        </div>

        <div className="space-y-4 sm:space-y-6">
          {/* Payment Instructions - Only for pending */}
          {isPending &&
            transaction.actions &&
            transaction.actions.length > 0 && (
              <XenditPaymentInstructions
                actions={transaction.actions}
                paymentMethodType={transaction.paymentMethod.type}
                paymentMethodName={transaction.paymentMethod.name}
              />
            )}

          {/* Event Details */}
          {transaction.event && (
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Ticket className="w-4 h-4 sm:w-5 sm:h-5 text-brand" />
                  <CardTitle className="text-base sm:text-lg">
                    Detail Event
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <h3 className="font-semibold text-base sm:text-lg text-gray-900 leading-tight">
                    {transaction.event.title}
                  </h3>
                  <Badge variant="secondary" className="mt-2 text-xs">
                    {transaction.event.category}
                  </Badge>
                </div>
                <div className="flex items-start gap-2 text-xs sm:text-sm text-gray-600">
                  <Calendar className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
                  <span>
                    {format(
                      new Date(transaction.event.eventDate),
                      "EEEE, dd MMMM yyyy",
                      { locale: idLocale }
                    )}
                  </span>
                </div>
                <div className="flex items-start gap-2 text-xs sm:text-sm text-gray-600">
                  <MapPin className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
                  <span>
                    {transaction.event.venue}, {transaction.event.city}
                  </span>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Payment Summary */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Receipt className="w-4 h-4 sm:w-5 sm:h-5 text-brand" />
                <CardTitle className="text-base sm:text-lg">
                  Ringkasan Pembayaran
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between text-xs sm:text-sm">
                <span className="text-gray-600">Metode Pembayaran</span>
                <span className="font-medium text-gray-900">
                  {transaction.paymentMethod.name}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs sm:text-sm">
                <span className="text-gray-600">Harga Event</span>
                <span className="font-medium text-gray-900">
                  {formatCurrency(
                    Number(transaction.amount),
                    transaction.paymentMethod.currency
                  )}
                </span>
              </div>
              {Number(transaction.totalFee) > 0 && (
                <div className="flex items-center justify-between text-xs sm:text-sm">
                  <span className="text-gray-600">Biaya Layanan</span>
                  <span className="font-medium text-amber-600">
                    +{" "}
                    {formatCurrency(
                      Number(transaction.totalFee),
                      transaction.paymentMethod.currency
                    )}
                  </span>
                </div>
              )}
              <Separator className="my-2" />
              <div className="flex items-center justify-between pt-1">
                <span className="font-semibold text-sm sm:text-base text-gray-900">
                  Total Pembayaran
                </span>
                <span className="font-bold text-xl sm:text-2xl text-brand">
                  {formatCurrency(
                    Number(transaction.finalAmount),
                    transaction.paymentMethod.currency
                  )}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Transaction Info */}
          <Card className="bg-gray-50">
            <CardHeader>
              <div className="flex items-center gap-2">
                <CreditCard className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500" />
                <CardTitle className="text-sm sm:text-base font-semibold text-gray-700">
                  Informasi Transaksi
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-2.5 sm:space-y-3 text-xs sm:text-sm">
              <div className="flex items-center justify-between gap-2">
                <span className="text-gray-500">ID Transaksi</span>
                <code className="font-mono text-[10px] sm:text-xs bg-gray-100 px-1.5 py-0.5 rounded truncate max-w-[150px] sm:max-w-none">
                  {transaction.externalId}
                </code>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-500">Status</span>
                <XenditTransactionStatusBadge
                  status={transaction.status}
                  size="sm"
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-500">Dibuat Pada</span>
                <span className="text-gray-700">
                  {format(
                    new Date(transaction.createdAt),
                    "dd MMM yyyy, HH:mm",
                    {
                      locale: idLocale,
                    }
                  )}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-500">Terakhir Update</span>
                <span className="text-gray-700">
                  {format(
                    new Date(transaction.updatedAt),
                    "dd MMM yyyy, HH:mm",
                    {
                      locale: idLocale,
                    }
                  )}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* CTA Buttons */}
          <div className="space-y-3 pt-2 pb-4">
            {isPaid && (
              <Button
                onClick={() => router.push("/my-events")}
                size="lg"
                className="w-full h-11 sm:h-12 text-sm sm:text-base"
              >
                Lihat Event Saya
              </Button>
            )}

            {(isFailed || isExpired) && transaction.event && (
              <Button
                onClick={() =>
                  router.push(
                    `/events/${transaction.event?.slug || ""}/payment`
                  )
                }
                size="lg"
                className="w-full h-11 sm:h-12 text-sm sm:text-base"
              >
                Coba Lagi
              </Button>
            )}

            {isPending && (
              <Button
                variant="outline"
                onClick={() => refetch()}
                className="w-full h-10 sm:h-11 text-sm"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh Status
              </Button>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
