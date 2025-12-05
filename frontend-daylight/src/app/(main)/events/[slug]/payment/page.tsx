"use client";

import { DashboardLayout } from "@/components/main/dashboard-layout";
import { useParams, useRouter } from "next/navigation";
import { usePublicEvent } from "@/hooks/use-public-events";
import {
  useXenditPaymentMethods,
  useXenditFeeCalculation,
  useXenditCreatePayment,
} from "@/hooks/use-xendit";
import { useState, useEffect } from "react";
import { useAuthStore } from "@/store/auth-store";
import {
  Loader2,
  ArrowLeft,
  Calendar,
  MapPin,
  User,
  Mail,
  Phone,
  AlertCircle,
  Shield,
} from "lucide-react";
import { XenditPaymentMethodSelector } from "@/components/xendit/payment-method-selector";
import {
  XenditFeeBreakdown,
  FeeBreakdownSkeleton,
} from "@/components/xendit/fee-breakdown";
import { XenditPaymentMethod, ItemType } from "@/types/xendit.types";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { toast } from "sonner";
import { formatCurrency } from "@/lib/utils";

export default function CreateXenditPaymentPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  const { user } = useAuthStore();

  // Queries
  const { data: event, isLoading: isLoadingEvent } = usePublicEvent(slug);
  const {
    data: paymentMethodsData,
    isLoading: isLoadingMethods,
    error: methodsError,
  } = useXenditPaymentMethods();

  // State
  const [selectedMethod, setSelectedMethod] =
    useState<XenditPaymentMethod | null>(null);
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");

  // Initialize form with user data
  useEffect(() => {
    if (user) {
      setCustomerName(
        `${user.firstName || ""} ${user.lastName || ""}`.trim() || ""
      );
      setCustomerEmail(user.email || "");
      setCustomerPhone(user.phoneNumber || "");
    }
  }, [user]);

  // Fee calculation
  const { data: feeData, isLoading: isCalculatingFee } =
    useXenditFeeCalculation(event?.price || 0, selectedMethod?.id || null);

  // Create payment mutation
  const createPaymentMutation = useXenditCreatePayment();

  const isLoading = isLoadingEvent || isLoadingMethods;

  // Handle payment
  const handlePayment = async () => {
    if (!selectedMethod) {
      toast.error("Pilih metode pembayaran");
      return;
    }

    if (!customerName.trim()) {
      toast.error("Nama lengkap wajib diisi");
      return;
    }

    if (!customerEmail.trim()) {
      toast.error("Email wajib diisi");
      return;
    }

    if (!event) {
      toast.error("Event tidak ditemukan");
      return;
    }

    try {
      const result = await createPaymentMutation.mutateAsync({
        type: ItemType.EVENT,
        itemId: event.id,
        paymentMethodId: selectedMethod.id,
        customerName: customerName.trim(),
        customerEmail: customerEmail.trim(),
        customerPhone: customerPhone.trim() || undefined,
      });

      if (result.success && result.data) {
        toast.success("Pembayaran berhasil dibuat! ");
        router.push(`/payment/${result.data.transaction.id}`);
      } else {
        toast.error(result.error || "Gagal membuat pembayaran");
      }
    } catch (error: any) {
      console.error("Payment creation error:", error);
      toast.error(error?.message || "Gagal membuat pembayaran");
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin text-brand mx-auto mb-3" />
            <p className="text-gray-600">Memuat data pembayaran...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Event not found
  if (!event) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <h3 className="text-lg font-semibold mb-2">Event tidak ditemukan</h3>
          <button
            onClick={() => router.back()}
            className="text-brand hover:underline"
          >
            Kembali
          </button>
        </div>
      </DashboardLayout>
    );
  }

  const hasValidMethods =
    paymentMethodsData?.success &&
    paymentMethodsData.data &&
    paymentMethodsData.data.length > 0;

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-4xl mx-auto pb-8">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-600 hover:text-brand transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm font-medium">Kembali ke Event</span>
        </button>

        {/* Header */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6">
          <h1 className="text-2xl md:text-3xl font-bold mb-2">
            Selesaikan Pembayaran
          </h1>
          <p className="text-muted-foreground">
            Satu langkah lagi untuk bergabung di event ini!
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Event Summary */}
            <div className="bg-white border border-gray-200 rounded-2xl p-6">
              <h2 className="text-lg font-semibold mb-4">Detail Event</h2>
              <div className="space-y-3">
                <div>
                  <h3 className="font-semibold text-xl">{event.title}</h3>
                  <span className="inline-block mt-2 px-3 py-1 bg-brand/10 text-brand text-xs font-medium rounded-full">
                    {event.category}
                  </span>
                </div>

                <div className="flex items-start gap-2 text-sm">
                  <Calendar className="w-4 h-4 text-gray-400 mt-0.5" />
                  <span>
                    {format(new Date(event.eventDate), "EEEE, dd MMMM yyyy", {
                      locale: idLocale,
                    })}
                  </span>
                </div>

                <div className="flex items-start gap-2 text-sm">
                  <MapPin className="w-4 h-4 text-gray-400 mt-0. 5" />
                  <span>
                    {event.venue}, {event.city}
                  </span>
                </div>

                <div className="pt-3 mt-3 border-t border-gray-100">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Harga Event</span>
                    <span className="font-bold text-xl text-brand">
                      {formatCurrency(event.price, event.currency)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Customer Information */}
            <div className="bg-white border border-gray-200 rounded-2xl p-6">
              <h2 className="text-lg font-semibold mb-4">Informasi Kamu</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <span className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      Nama Lengkap <span className="text-red-500">*</span>
                    </span>
                  </label>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand focus:border-transparent transition-all"
                    placeholder="Masukkan nama lengkap"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <span className="flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      Email <span className="text-red-500">*</span>
                    </span>
                  </label>
                  <input
                    type="email"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand focus:border-transparent transition-all"
                    placeholder="Masukkan email"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <span className="flex items-center gap-2">
                      <Phone className="w-4 h-4" />
                      Nomor Telepon (Opsional)
                    </span>
                  </label>
                  <input
                    type="tel"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand focus:border-transparent transition-all"
                    placeholder="Masukkan nomor telepon"
                  />
                </div>
              </div>
            </div>

            {/* Payment Method Selection */}
            <div className="bg-white border border-gray-200 rounded-2xl p-6">
              <h2 className="text-lg font-semibold mb-4">
                Pilih Metode Pembayaran
              </h2>

              {methodsError && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0. 5" />
                    <div>
                      <h4 className="font-medium text-red-900 mb-1">
                        Gagal memuat metode pembayaran
                      </h4>
                      <p className="text-sm text-red-700">
                        Silakan refresh halaman atau coba lagi nanti
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {isLoadingMethods ? (
                <div className="text-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-brand mx-auto mb-2" />
                  <p className="text-sm text-gray-600">
                    Memuat metode pembayaran...
                  </p>
                </div>
              ) : hasValidMethods ? (
                <XenditPaymentMethodSelector
                  methods={paymentMethodsData.data}
                  groupedMethods={paymentMethodsData.grouped}
                  selectedMethodId={selectedMethod?.id || null}
                  onSelect={setSelectedMethod}
                  disabled={createPaymentMutation.isPending}
                />
              ) : (
                <div className="text-center py-8 text-gray-600">
                  <AlertCircle className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p>Tidak ada metode pembayaran tersedia untuk lokasi Anda</p>
                  <button
                    onClick={() => window.location.reload()}
                    className="mt-3 text-brand hover:underline text-sm"
                  >
                    Refresh halaman
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar - Fee Summary */}
          <div className="lg:col-span-1">
            <div className="sticky top-20 space-y-4">
              {/* Fee Breakdown */}
              {selectedMethod && feeData?.success && feeData.data ? (
                <XenditFeeBreakdown
                  calculation={feeData.data}
                  currency={event.currency}
                />
              ) : isCalculatingFee && selectedMethod ? (
                <FeeBreakdownSkeleton />
              ) : (
                <div className="bg-white border border-gray-200 rounded-2xl p-5">
                  <h3 className="font-semibold text-gray-900 mb-3">
                    Ringkasan Pembayaran
                  </h3>
                  <p className="text-sm text-gray-600">
                    Pilih metode pembayaran untuk melihat rincian biaya
                  </p>
                </div>
              )}

              {/* CTA Button */}
              <button
                onClick={handlePayment}
                disabled={
                  !selectedMethod ||
                  !customerName.trim() ||
                  !customerEmail.trim() ||
                  createPaymentMutation.isPending ||
                  !hasValidMethods
                }
                className={`w-full px-6 py-4 rounded-xl font-semibold text-lg transition-all ${
                  !selectedMethod ||
                  !customerName.trim() ||
                  !customerEmail.trim() ||
                  createPaymentMutation.isPending ||
                  !hasValidMethods
                    ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                    : "bg-brand text-white hover:bg-brand/90 hover:shadow-xl active:scale-[0.98]"
                }`}
              >
                {createPaymentMutation.isPending ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Memproses...
                  </span>
                ) : !hasValidMethods ? (
                  "Tidak Ada Metode Pembayaran"
                ) : (
                  "Lanjutkan Pembayaran"
                )}
              </button>

              {/* Security Badge */}
              <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
                <Shield className="w-4 h-4" />
                <span>Pembayaran aman dengan Xendit</span>
              </div>

              <p className="text-xs text-center text-gray-600">
                Dengan melanjutkan, kamu setuju dengan syarat dan ketentuan kami
              </p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
