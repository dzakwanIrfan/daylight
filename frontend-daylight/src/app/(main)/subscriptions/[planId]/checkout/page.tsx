"use client";

import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/main/dashboard-layout";
import { useAuthStore } from "@/store/auth-store";
import { usePlanById } from "@/hooks/use-subscriptions";
import {
  useXenditPaymentMethods,
  useXenditFeeCalculation,
  useXenditCreatePayment,
} from "@/hooks/use-xendit";
import { useParams, useRouter } from "next/navigation";
import {
  Loader2,
  ArrowLeft,
  Crown,
  Check,
  AlertCircle,
  CreditCard,
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Sparkles,
} from "lucide-react";
import { XenditPaymentMethodSelector } from "@/components/xendit/payment-method-selector";
import {
  XenditFeeBreakdown,
  FeeBreakdownSkeleton,
} from "@/components/xendit/fee-breakdown";
import { XenditPaymentMethod, ItemType } from "@/types/xendit.types";
import { formatCurrency, cn } from "@/lib/utils";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

export default function SubscriptionCheckoutPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuthStore();
  const planId = params.planId as string;

  // Queries
  const { data: planResponse, isLoading: isLoadingPlan } = usePlanById(planId);
  const {
    data: paymentMethodsData,
    isLoading: isLoadingMethods,
    error: methodsError,
  } = useXenditPaymentMethods();

  const plan = planResponse?.data;

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

  // Use currentPrice from backend (already calculated based on user location)
  const displayPrice = plan?.currentPrice || plan?.price || 0;
  const displayCurrency = plan?.currentCurrency || plan?.currency || "IDR";

  // Fee calculation
  const { data: feeData, isLoading: isCalculatingFee } =
    useXenditFeeCalculation(displayPrice, selectedMethod?.id || null);

  // Create payment mutation - using Xendit
  const createPaymentMutation = useXenditCreatePayment();

  const isLoading = isLoadingPlan || isLoadingMethods;

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

    if (!plan) {
      toast.error("Plan not found");
      return;
    }

    try {
      const result = await createPaymentMutation.mutateAsync({
        type: ItemType.SUBSCRIPTION,
        itemId: plan.id,
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
              Loading checkout...
            </p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Plan not found
  if (!plan) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
          <AlertCircle className="w-12 h-12 text-gray-400 mb-3" />
          <h3 className="text-lg font-semibold mb-2">Plan not found</h3>
          <Button variant="link" onClick={() => router.push("/subscriptions")}>
            Back to Plans
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

  const monthlyPrice = displayPrice / plan.durationInMonths;
  const userLocation = plan.userLocation;

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 pb-32 lg:pb-8">
        {/* Back Button */}
        <button
          onClick={() => router.push("/subscriptions")}
          className="flex items-center gap-2 text-gray-600 hover:text-brand transition-colors mb-4 sm:mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm font-medium">Back to Plans</span>
        </button>

        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">
            Complete Your Subscription
          </h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1">
            Upgrade to{" "}
            <span className="font-semibold text-brand">{plan.name}</span> and
            unlock premium features!
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 sm:gap-6">
          {/* Main Content */}
          <div className="lg:col-span-3 space-y-4 sm:space-y-6">
            {/* Plan Summary */}
            <Card className="border-brand/20 bg-linear-to-br from-brand/5 to-orange-50/50">
              <CardHeader className="flex flex-row items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-linear-to-br from-brand to-orange-600 flex items-center justify-center shrink-0 shadow-lg shadow-brand/20">
                  <Crown className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-base sm:text-lg">
                      {plan.name}
                    </CardTitle>
                    <Badge className="bg-brand/10 text-brand border-0 text-xs">
                      <Sparkles className="w-3 h-3 mr-1" />
                      Premium
                    </Badge>
                  </div>
                  {plan.description && (
                    <p className="text-xs sm:text-sm text-gray-600 mt-1">
                      {plan.description}
                    </p>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                {/* Pricing */}
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl sm:text-3xl font-bold text-gray-900">
                    {formatCurrency(displayPrice, displayCurrency)}
                  </span>
                  <span className="text-sm text-gray-600">
                    / {plan.durationInMonths} month
                    {plan.durationInMonths > 1 ? "s" : ""}
                  </span>
                </div>

                <p className="text-sm text-gray-600">
                  Only{" "}
                  <span className="font-semibold text-brand">
                    {formatCurrency(monthlyPrice, displayCurrency)}
                  </span>
                  /month
                </p>
              </CardContent>
            </Card>

            {/* Customer Information */}
            <Card>
              <CardHeader>
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
                    disabled={createPaymentMutation.isPending}
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
                    disabled={createPaymentMutation.isPending}
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
                    disabled={createPaymentMutation.isPending}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Payment Method Selection */}
            <Card>
              <CardHeader>
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
                  <div className="text-center py-6">
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
                  <div className="text-center py-6">
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
                <SubscriptionFeeBreakdown
                  calculation={feeData.data}
                  currency={displayCurrency}
                  planName={plan.name}
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
                className="w-full h-12 text-base font-semibold bg-linear-to-r from-brand to-orange-600 hover:from-orange-600 hover:to-orange-700"
              >
                {createPaymentMutation.isPending ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Processing...
                  </span>
                ) : !hasValidMethods ? (
                  "No Payment Methods Available"
                ) : (
                  <>
                    <Crown className="w-5 h-5 mr-2" />
                    Subscribe Now
                  </>
                )}
              </Button>

              <p className="text-xs text-center text-gray-500">
                By subscribing, you agree to our terms and conditions
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
                        displayCurrency
                      )
                    : formatCurrency(displayPrice, displayCurrency)}
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
              className="w-full h-12 text-base font-semibold bg-linear-to-r from-brand to-orange-600 hover:from-orange-600 hover:to-orange-700"
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
                <>
                  <Crown className="w-5 h-5 mr-2" />
                  Subscribe Now
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

// Custom Fee Breakdown for Subscription
function SubscriptionFeeBreakdown({
  calculation,
  currency = "IDR",
  planName,
}: {
  calculation: any;
  currency?: string;
  planName: string;
}) {
  const { paymentMethod, calculation: calc } = calculation;

  return (
    <Card className="overflow-hidden">
      {/* Header */}
      <CardHeader>
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Crown className="w-4 h-4 sm:w-5 sm:h-5 text-brand" />
            <h3 className="font-semibold text-sm sm:text-base text-gray-900">
              Payment Summary
            </h3>
          </div>
          <Badge variant="secondary" className="text-xs font-medium">
            {paymentMethod.name}
          </Badge>
        </div>
      </CardHeader>

      {/* Content */}
      <CardContent className="space-y-3 pt-0">
        {/* Plan */}
        <div className="flex items-center justify-between text-sm sm:text-base">
          <span className="text-gray-600">{planName}</span>
          <span className="font-medium text-gray-900">
            {formatCurrency(calc.baseAmount, currency)}
          </span>
        </div>

        {/* Fee Breakdown */}
        {calc.totalFee > 0 && (
          <div className="flex items-center justify-between text-sm sm:text-base">
            <span className="text-gray-600">Service Fee</span>
            <span className="font-medium text-amber-600">
              + {formatCurrency(calc.totalFee, currency)}
            </span>
          </div>
        )}

        <Separator className="my-2" />

        {/* Total */}
        <div className="flex items-center justify-between pt-1">
          <span className="font-semibold text-sm sm:text-base text-gray-900">
            Total
          </span>
          <span className="text-xl sm:text-2xl font-bold text-brand">
            {formatCurrency(calc.finalAmount, currency)}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
