"use client";

import { useEffect, useState } from "react";
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
} from "lucide-react";
import { XenditPaymentInstructions } from "@/components/xendit/payment-instructions";
import { XenditCountdownTimer } from "@/components/xendit/countdown-timer";
import { XenditTransactionStatusBadge } from "@/components/xendit/transaction-status-badge";
import { XenditPaymentSuccess } from "@/components/xendit/payment-success";
import { XenditTransactionStatus } from "@/types/xendit.types";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { formatCurrency } from "@/lib/utils";

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

  // Parse payment actions
  const paymentInfo = transaction
    ? xenditService.parsePaymentActions(transaction.actions)
    : {};

  // Calculate expiry (default 30 minutes from creation)
  const expiryTime = transaction
    ? new Date(new Date(transaction.createdAt).getTime() + 30 * 60 * 1000)
    : null;

  // Loading state
  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin text-brand mx-auto mb-3" />
            <p className="text-gray-600">Memuat detail pembayaran...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Transaction not found
  if (!transaction) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <h3 className="text-lg font-semibold mb-2">
            Transaksi tidak ditemukan
          </h3>
          <button
            onClick={() => router.push("/my-events")}
            className="text-brand hover:underline"
          >
            Lihat Event Saya
          </button>
        </div>
      </DashboardLayout>
    );
  }

  // Success state - show celebration
  if (isPaid) {
    return (
      <DashboardLayout>
        <div className="max-w-2xl mx-auto">
          <XenditPaymentSuccess
            eventTitle={transaction.event?.title}
            eventDate={
              transaction.event?.eventDate
                ? format(
                    new Date(transaction.event.eventDate),
                    "EEEE, dd MMMM yyyy",
                    {
                      locale: idLocale,
                    }
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

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-3xl mx-auto pb-8">
        {/* Back Button */}
        <button
          onClick={() => router.push("/my-events")}
          className="flex items-center gap-2 text-gray-600 hover:text-brand transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm font-medium">Kembali ke Event Saya</span>
        </button>

        {/* Connection Status - Only for pending */}
        {isPending && (
          <div
            className={`flex items-center justify-between gap-2 text-sm px-4 py-3 rounded-xl ${
              isConnected
                ? "bg-green-50 text-green-700 border border-green-200"
                : "bg-yellow-50 text-yellow-700 border border-yellow-200"
            }`}
          >
            <div className="flex items-center gap-2">
              {isConnected ? (
                <>
                  <Wifi className="w-4 h-4" />
                  <span>Update otomatis aktif</span>
                  {isSubscribed && (
                    <span className="text-xs bg-green-200 px-2 py-0.5 rounded-full">
                      Terhubung
                    </span>
                  )}
                </>
              ) : (
                <>
                  <WifiOff className="w-4 h-4" />
                  <span>Menghubungkan...</span>
                </>
              )}
            </div>
            <button
              onClick={() => refetch()}
              className="p-1. 5 hover:bg-white/50 rounded-lg transition-colors"
              title="Refresh status"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Status Header */}
        <div
          className={`rounded-2xl p-6 text-white ${
            isPaid
              ? "bg-linear-to-r from-green-500 to-green-600"
              : isPending
              ? "bg-linear-to-r from-brand to-orange-500"
              : isFailed
              ? "bg-linear-to-r from-red-500 to-red-600"
              : "bg-linear-to-r from-gray-500 to-gray-600"
          }`}
        >
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center shrink-0">
                {isPaid ? (
                  <CheckCircle2 className="w-7 h-7" />
                ) : isPending ? (
                  <Clock className="w-7 h-7" />
                ) : isFailed ? (
                  <XCircle className="w-7 h-7" />
                ) : (
                  <AlertCircle className="w-7 h-7" />
                )}
              </div>
              <div>
                <h1 className="text-2xl font-bold mb-1">
                  {isPaid
                    ? "Pembayaran Berhasil!  🎉"
                    : isPending
                    ? "Menunggu Pembayaran"
                    : isFailed
                    ? "Pembayaran Gagal"
                    : "Pembayaran Kadaluarsa"}
                </h1>
                <p className="text-white/90 text-sm">
                  {isPaid
                    ? "Tiket kamu sudah dikonfirmasi"
                    : isPending
                    ? "Selesaikan pembayaran sebelum waktu habis"
                    : isFailed
                    ? "Silakan coba lagi"
                    : "Link pembayaran sudah tidak berlaku"}
                </p>
              </div>
            </div>

            {/* Countdown Timer */}
            {isPending && expiryTime && (
              <XenditCountdownTimer
                expiredAt={expiryTime.toISOString()}
                onExpired={() => refetch()}
                size="md"
              />
            )}
          </div>
        </div>

        {/* Payment Instructions - Only for pending */}
        {isPending && transaction.actions && transaction.actions.length > 0 && (
          <XenditPaymentInstructions
            actions={transaction.actions}
            paymentMethodType={transaction.paymentMethod.type}
            paymentMethodName={transaction.paymentMethod.name}
          />
        )}

        {/* Event Details */}
        {transaction.event && (
          <div className="bg-white border border-gray-200 rounded-2xl p-6">
            <h2 className="text-lg font-semibold mb-4">Detail Event</h2>
            <div className="space-y-3">
              <div>
                <h3 className="font-semibold text-xl">
                  {transaction.event.title}
                </h3>
                <span className="inline-block mt-2 px-3 py-1 bg-brand/10 text-brand text-xs font-medium rounded-full">
                  {transaction.event.category}
                </span>
              </div>
              <div className="flex items-start gap-2 text-sm">
                <Calendar className="w-4 h-4 text-gray-400 mt-0.5" />
                <span>
                  {format(
                    new Date(transaction.event.eventDate),
                    "EEEE, dd MMMM yyyy",
                    {
                      locale: idLocale,
                    }
                  )}
                </span>
              </div>
              <div className="flex items-start gap-2 text-sm">
                <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
                <span>
                  {transaction.event.venue}, {transaction.event.city}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Payment Summary */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6">
          <h2 className="text-lg font-semibold mb-4">Ringkasan Pembayaran</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Metode Pembayaran</span>
              <span className="font-medium">
                {transaction.paymentMethod.name}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Harga Event</span>
              <span className="font-medium">
                {formatCurrency(
                  Number(transaction.amount),
                  transaction.paymentMethod.currency
                )}
              </span>
            </div>
            {Number(transaction.totalFee) > 0 && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Biaya Pembayaran</span>
                <span className="font-medium text-orange-600">
                  +{" "}
                  {formatCurrency(
                    Number(transaction.totalFee),
                    transaction.paymentMethod.currency
                  )}
                </span>
              </div>
            )}
            <div className="border-t border-dashed border-gray-200 pt-3 mt-3"></div>
            <div className="flex items-center justify-between">
              <span className="font-semibold">Total Pembayaran</span>
              <span className="font-bold text-2xl text-brand">
                {formatCurrency(
                  Number(transaction.finalAmount),
                  transaction.paymentMethod.currency
                )}
              </span>
            </div>
          </div>
        </div>

        {/* Transaction Info */}
        <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6">
          <h3 className="font-semibold mb-4">Informasi Transaksi</h3>
          <div className="space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">ID Transaksi</span>
              <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">
                {transaction.externalId}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Status</span>
              <XenditTransactionStatusBadge
                status={transaction.status}
                size="sm"
              />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Dibuat Pada</span>
              <span>
                {format(new Date(transaction.createdAt), "dd MMM yyyy, HH:mm", {
                  locale: idLocale,
                })}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Terakhir Update</span>
              <span>
                {format(new Date(transaction.updatedAt), "dd MMM yyyy, HH:mm", {
                  locale: idLocale,
                })}
              </span>
            </div>
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="space-y-3 pb-6">
          {isPaid && (
            <button
              onClick={() => router.push("/my-events")}
              className="w-full bg-brand hover:bg-brand/90 text-white rounded-xl px-6 py-4 font-semibold text-lg transition-all hover:shadow-lg active:scale-[0.98]"
            >
              Lihat Event Saya
            </button>
          )}
          {(isFailed || isExpired) && transaction.event && (
            <button
              onClick={() =>
                router.push(`/events/${transaction.event?.slug || ""}/payment`)
              }
              className="w-full bg-brand hover:bg-brand/90 text-white rounded-xl px-6 py-4 font-semibold text-lg transition-all hover:shadow-lg active:scale-[0.98]"
            >
              Coba Lagi
            </button>
          )}
          {isPending && (
            <button
              onClick={() => refetch()}
              className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl px-6 py-3 font-medium transition-all flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh Status
            </button>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
