"use client";

import { DashboardLayout } from "@/components/main/dashboard-layout";
import { useParams, useRouter } from "next/navigation";
import { useEventPurchaseStatus, usePublicEvent } from "@/hooks/use-public-events";
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
  CreditCard,
  Ticket,
} from "lucide-react";
import { XenditPaymentMethodSelector } from "@/components/xendit/payment-method-selector";
import {
  XenditFeeBreakdown,
  FeeBreakdownSkeleton,
} from "@/components/xendit/fee-breakdown";
import { XenditPaymentMethod, ItemType } from "@/types/xendit.types";
import { format } from "date-fns";
import { enUS } from "date-fns/locale";
import { toast } from "sonner";
import { formatCurrency } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { PaymentStatus } from "@/types/event.types";

export default function CreateXenditPaymentPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  const { user } = useAuthStore();
  const {
    data: purchaseStatus,
    isLoading: isPurchaseStatusLoading
  } = useEventPurchaseStatus(slug);

  useEffect(() => {
    if (purchaseStatus?.hasPurchased && purchaseStatus?.status === PaymentStatus.PAID) {
      toast.success("You have purchased this event!");
      router.replace(`/events/${slug}`);
    }
  }, [purchaseStatus, router, slug]);

  const isPurchased = purchaseStatus?.hasPurchased && purchaseStatus?.status === PaymentStatus.PAID;

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

  const isLoading = isLoadingEvent || isLoadingMethods || isPurchaseStatusLoading;

  if (isPurchased) {
    return null;
  }

  // Handle payment
  const handlePayment = async () => {
    if (!selectedMethod) {
      toast.error("Please select a payment method");
      return;
    }

    if (!customerName.trim()) {
      toast.error("Full name is required");
      return;
    }

    if (!customerEmail.trim()) {
      toast.error("Email is required");
      return;
    }

    if (!event) {
      toast.error("Event not found");
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
        toast.success("Payment created successfully!");
        router.push(`/payment/${result.data.transaction.id}`);
      } else {
        toast.error(result.error || "Failed to create payment");
      }
    } catch (error: any) {
      console.error("Payment creation error:", error);
      toast.error(error?.message || "Failed to create payment");
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin text-brand mx-auto mb-3" />
            <p className="text-sm sm:text-base text-gray-600">
              Loading payment data...
            </p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Event not found
  if (!event) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
          <AlertCircle className="w-12 h-12 text-gray-400 mb-3" />
          <h3 className="text-lg font-semibold mb-2">Event not found</h3>
          <Button variant="link" onClick={() => router.back()}>
            Go Back
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  const hasValidMethods =
    paymentMethodsData?.success &&
    paymentMethodsData.data &&
    paymentMethodsData.data.length > 0;

  const canProceed =
    selectedMethod &&
    customerName.trim() &&
    customerEmail.trim() &&
    !createPaymentMutation.isPending &&
    hasValidMethods;

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 pb-32 lg:pb-8">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-600 hover:text-brand transition-colors mb-4 sm:mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm font-medium">Back to Event</span>
        </button>

        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">
            Complete Your Payment
          </h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1">
            Just one more step to join this event!
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 sm:gap-6">
          {/* Main Content */}
          <div className="lg:col-span-3 space-y-4 sm:space-y-6">
            {/* Event Summary */}
            <Card>
              <CardHeader className="flex items-center">
                <div className="flex items-center gap-2">
                  <Ticket className="w-4 h-4 sm:w-5 sm:h-5 text-brand" />
                  <CardTitle className="text-base sm:text-lg">
                    Event Details
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-3 sm:space-y-4">
                <div>
                  <h3 className="font-semibold text-base sm:text-lg md:text-xl text-gray-900 leading-tight">
                    {event.title}
                  </h3>
                  <Badge variant="secondary" className="mt-2 text-xs">
                    {event.category}
                  </Badge>
                </div>

                <div className="flex items-start gap-2 text-xs sm:text-sm text-gray-600">
                  <Calendar className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
                  <span>
                    {format(new Date(event.eventDate), "EEEE, MMMM dd, yyyy", {
                      locale: enUS,
                    })}
                  </span>
                </div>

                <div className="flex items-start gap-2 text-xs sm:text-sm text-gray-600">
                  <MapPin className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
                  <span className="line-clamp-2">
                    {event.venue}, {event.city}
                  </span>
                </div>

                <Separator className="my-2 sm:my-3" />

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Event Price</span>
                  <span className="font-bold text-lg sm:text-xl text-brand">
                    {formatCurrency(event.price, event.currency)}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Customer Information */}
            <Card>
              <CardHeader className="flex items-center">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 sm:w-5 sm:h-5 text-brand" />
                  <CardTitle className="text-base sm:text-lg">
                    Your Information
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label
                    htmlFor="name"
                    className="text-sm flex items-center gap-1.5"
                  >
                    <User className="w-3.5 h-3.5 text-gray-500" />
                    <span>Full Name</span>
                    <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="name"
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Enter your full name"
                    className="h-10 sm:h-11 text-sm sm:text-base"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="email"
                    className="text-sm flex items-center gap-1.5"
                  >
                    <Mail className="w-3.5 h-3.5 text-gray-500" />
                    <span>Email</span>
                    <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="h-10 sm:h-11 text-sm sm:text-base"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="phone"
                    className="text-sm flex items-center gap-1.5"
                  >
                    <Phone className="w-3.5 h-3.5 text-gray-500" />
                    <span>Phone Number</span>
                    <span className="text-gray-400 text-xs font-normal">
                      (Optional)
                    </span>
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="Enter your phone number"
                    className="h-10 sm:h-11 text-sm sm:text-base"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Payment Method Selection */}
            <Card>
              <CardHeader className="flex items-center">
                <div className="flex items-center gap-2">
                  <CreditCard className="w-4 h-4 sm:w-5 sm:h-5 text-brand" />
                  <CardTitle className="text-base sm:text-lg">
                    Payment Method
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                {methodsError && (
                  <Alert variant="destructive" className="mb-4">
                    <AlertCircle className="w-4 h-4" />
                    <AlertDescription className="text-xs sm:text-sm">
                      Failed to load payment methods.Please refresh the page.
                    </AlertDescription>
                  </Alert>
                )}

                {isLoadingMethods ? (
                  <div className="text-center py-2">
                    <Loader2 className="h-6 w-6 animate-spin text-brand mx-auto mb-2" />
                    <p className="text-xs sm:text-sm text-gray-600">
                      Loading payment methods...
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
                  <div className="text-center py-4">
                    <AlertCircle className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                    <p className="text-sm text-gray-600 mb-2">
                      No payment methods available
                    </p>
                    <Button
                      variant="link"
                      size="sm"
                      onClick={() => window.location.reload()}
                    >
                      Refresh page
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar - Fee Summary (Desktop) */}
          <div className="hidden lg:block lg:col-span-2">
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
                <Card className="p-5">
                  <h3 className="font-semibold text-gray-900 mb-2">
                    Payment Summary
                  </h3>
                  <p className="text-sm text-gray-500">
                    Select a payment method to see fee details
                  </p>
                </Card>
              )}

              {/* CTA Button */}
              <Button
                onClick={handlePayment}
                disabled={!canProceed}
                size="lg"
                className="w-full h-12 text-base font-semibold"
              >
                {createPaymentMutation.isPending ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Processing...
                  </span>
                ) : !hasValidMethods ? (
                  "No Payment Methods Available"
                ) : (
                  "Continue to Payment"
                )}
              </Button>

              <p className="text-xs text-center text-gray-500">
                By continuing, you agree to our terms and conditions
              </p>
            </div>
          </div>
        </div>

        {/* Mobile Bottom Bar */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 lg:hidden z-50 safe-area-bottom">
          <div className="max-w-lg mx-auto">
            {/* Price Summary */}
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-xs text-gray-500">Total Payment</p>
                <p className="text-lg font-bold text-brand">
                  {feeData?.success && feeData.data
                    ? formatCurrency(
                      feeData.data.calculation.finalAmount,
                      event.currency
                    )
                    : formatCurrency(event.price, event.currency)}
                </p>
              </div>
              {selectedMethod && (
                <Badge variant="outline" className="text-xs">
                  {selectedMethod.name}
                </Badge>
              )}
            </div>

            {/* CTA Button */}
            <Button
              onClick={handlePayment}
              disabled={!canProceed}
              size="lg"
              className="w-full h-12 text-base font-semibold"
            >
              {createPaymentMutation.isPending ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Processing...
                </span>
              ) : !selectedMethod ? (
                "Select Payment Method"
              ) : !customerName.trim() || !customerEmail.trim() ? (
                "Complete Your Information"
              ) : (
                "Pay Now"
              )}
            </Button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
