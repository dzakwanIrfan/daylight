"use client";

import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/main/dashboard-layout";
import { useParams, useRouter } from "next/navigation";
import { useXenditTransaction } from "@/hooks/use-xendit";
import { useXenditSocket } from "@/hooks/use-xendit-socket";
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
  PartyPopper,
  Crown,
  Sparkles,
  Check,
} from "lucide-react";
import { XenditPaymentInstructions } from "@/components/xendit/payment-instructions";
import { XenditCountdownTimer } from "@/components/xendit/countdown-timer";
import { XenditTransactionStatusBadge } from "@/components/xendit/transaction-status-badge";
import {
  XenditTransactionStatus,
  type XenditTransaction,
} from "@/types/xendit.types";
import { format } from "date-fns";
import { enUS } from "date-fns/locale";
import { formatCurrency, cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert } from "@/components/ui/alert";
import confetti from "canvas-confetti";

// Response type from xenditService.getTransactionDetail
interface TransactionResponse {
  success: boolean;
  data?: XenditTransaction;
  error?: string;
}

// Success Banner Component
function PaymentSuccessBanner({
  onCelebrate,
  isSubscription = false,
}: {
  onCelebrate?: () => void;
  isSubscription?: boolean;
}) {
  return (
    <div className="relative overflow-hidden rounded-xl sm:rounded-2xl bg-linear-to-r from-green-500 to-emerald-600 p-6 sm:p-8 text-white mb-6">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute -right-10 -top-10 w-40 h-40 rounded-full bg-white"></div>
        <div className="absolute -left-10 -bottom-10 w-32 h-32 rounded-full bg-white"></div>
      </div>

      <div className="relative flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
        {/* Icon */}
        <div className="relative">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-white/20 flex items-center justify-center">
            {isSubscription ? (
              <Crown className="w-10 h-10 sm:w-12 sm:h-12 text-white" />
            ) : (
              <CheckCircle2 className="w-10 h-10 sm:w-12 sm:h-12 text-white" />
            )}
          </div>
        </div>

        {/* Text */}
        <div className="text-center sm:text-left flex-1">
          <h1 className="text-2xl sm:text-3xl font-bold mb-1">
            {isSubscription
              ? "Subscription Activated!"
              : "Payment Successful!"}
          </h1>
          <p className="text-white/90 text-sm sm:text-base">
            {isSubscription
              ? "Welcome to DayLight Premium!  Enjoy all the exclusive features."
              : "Your ticket has been confirmed.See you at the event!"}
          </p>
        </div>

        {/* Celebrate Button */}
        <Button
          onClick={onCelebrate}
          variant="secondary"
          size="sm"
          className="bg-white/20 hover:bg-white/30 text-white border-0"
        >
          <PartyPopper className="w-4 h-4 mr-2" />
          Celebrate!
        </Button>
      </div>
    </div>
  );
}

// Subscription Confirmed Card
function SubscriptionConfirmedCard({
  subscription,
}: {
  subscription: XenditTransaction["userSubscription"];
}) {
  if (!subscription) return null;

  const plan = (subscription as any).plan;

  return (
    <Card className="border-green-200 bg-linear-to-br from-green-50/50 to-emerald-50/50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-linear-to-br from-brand to-orange-600 flex items-center justify-center shadow-lg shadow-brand/20">
              <Crown className="w-5 h-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-base sm:text-lg text-gray-900">
                Premium Subscription
              </CardTitle>
              <p className="text-xs text-gray-500">
                {plan?.name || "DayLight Premium"}
              </p>
            </div>
          </div>
          <Badge className="bg-green-100 text-green-700 hover:bg-green-200">
            <Sparkles className="w-3 h-3 mr-1" />
            Active
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Subscription Period */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white rounded-lg p-3 border border-green-100">
            <p className="text-xs text-gray-500 mb-1">Start Date</p>
            <p className="font-medium text-gray-900 text-sm">
              {subscription.startDate
                ? format(new Date(subscription.startDate), "MMM dd, yyyy")
                : "Immediately"}
            </p>
          </div>
          <div className="bg-white rounded-lg p-3 border border-green-100">
            <p className="text-xs text-gray-500 mb-1">End Date</p>
            <p className="font-medium text-gray-900 text-sm">
              {subscription.endDate
                ? format(new Date(subscription.endDate), "MMM dd, yyyy")
                : "-"}
            </p>
          </div>
        </div>

        {/* Features */}
        {plan?.features && plan.features.length > 0 && (
          <div className="pt-2">
            <p className="text-xs font-medium text-gray-700 mb-2">
              Your Premium Benefits:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {plan.features
                .slice(0, 4)
                .map((feature: string, index: number) => (
                  <div
                    key={index}
                    className="flex items-start gap-2 text-xs text-gray-600"
                  >
                    <div className="w-4 h-4 rounded-full bg-green-100 flex items-center justify-center shrink-0 mt-0.5">
                      <Check className="w-2.5 h-2.5 text-green-600" />
                    </div>
                    <span>{feature}</span>
                  </div>
                ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function XenditPaymentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const externalId = params.id as string;
  const [hasTriggeredConfetti, setHasTriggeredConfetti] = useState(false);

  // Query transaction with explicit type
  const {
    data: transactionResponse,
    isLoading,
    refetch,
  } = useXenditTransaction(externalId) as {
    data: TransactionResponse | undefined;
    isLoading: boolean;
    refetch: () => void;
  };

  const transaction: XenditTransaction | undefined = transactionResponse?.data;

  // Determine if this is a subscription payment
  const isSubscription = !!transaction?.userSubscription;

  // Status checks
  const isPending = transaction?.status === XenditTransactionStatus.PENDING;
  const isPaid = transaction?.status === XenditTransactionStatus.PAID;
  const isFailed = transaction?.status === XenditTransactionStatus.FAILED;
  const isExpired = transaction?.status === XenditTransactionStatus.EXPIRED;

  // Trigger confetti function
  const triggerConfetti = () => {
    const duration = 3 * 1000;
    const animationEnd = Date.now() + duration;

    const randomInRange = (min: number, max: number) => {
      return Math.random() * (max - min) + min;
    };

    const interval = setInterval(() => {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        clearInterval(interval);
        return;
      }

      const particleCount = 50 * (timeLeft / duration);

      confetti({
        particleCount,
        startVelocity: 30,
        spread: 360,
        origin: {
          x: randomInRange(0.1, 0.3),
          y: Math.random() - 0.2,
        },
        colors: ["#F97316", "#22C55E", "#3B82F6", "#EAB308", "#EC4899"],
      });

      confetti({
        particleCount,
        startVelocity: 30,
        spread: 360,
        origin: {
          x: randomInRange(0.7, 0.9),
          y: Math.random() - 0.2,
        },
        colors: ["#F97316", "#22C55E", "#3B82F6", "#EAB308", "#EC4899"],
      });
    }, 250);
  };

  // Auto trigger confetti once when payment is successful
  useEffect(() => {
    if (isPaid && !hasTriggeredConfetti) {
      setHasTriggeredConfetti(true);
      setTimeout(() => triggerConfetti(), 500);
    }
  }, [isPaid, hasTriggeredConfetti]);

  // WebSocket for real-time updates
  const { isConnected, isSubscribed } = useXenditSocket({
    transactionId: isPending ? externalId : undefined,
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
              Loading payment details...
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
          <h3 className="text-lg font-semibold mb-2">Transaction not found</h3>
          <Button variant="link" onClick={() => router.push("/my-events")}>
            View My Events
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  // Get status config
  const getStatusConfig = () => {
    if (isPaid) {
      return {
        gradient: "from-green-500 to-emerald-600",
        icon: isSubscription ? (
          <Crown className="w-6 h-6 sm:w-7 sm:h-7" />
        ) : (
          <CheckCircle2 className="w-6 h-6 sm:w-7 sm:h-7" />
        ),
        title: isSubscription
          ? "Subscription Activated!"
          : "Payment Successful!",
        subtitle: isSubscription
          ? "Welcome to DayLight Premium"
          : "Your ticket has been confirmed",
      };
    }
    if (isPending) {
      return {
        gradient: "from-brand to-orange-500",
        icon: <Clock className="w-6 h-6 sm:w-7 sm:h-7" />,
        title: "Awaiting Payment",
        subtitle: "Complete your payment before time runs out",
      };
    }
    if (isFailed) {
      return {
        gradient: "from-red-500 to-red-600",
        icon: <XCircle className="w-6 h-6 sm:w-7 sm:h-7" />,
        title: "Payment Failed",
        subtitle: "Please try again with another method",
      };
    }
    return {
      gradient: "from-gray-500 to-gray-600",
      icon: <AlertCircle className="w-6 h-6 sm:w-7 sm:h-7" />,
      title: "Payment Expired",
      subtitle: "Payment link is no longer valid",
    };
  };

  const statusConfig = getStatusConfig();

  // Get back URL based on transaction type
  const getBackUrl = () => {
    if (isSubscription) return "/subscriptions";
    return "/my-events";
  };

  const getBackLabel = () => {
    if (isSubscription) return "Back to Subscriptions";
    return "Back to My Events";
  };

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 pb-8">
        {/* Back Button */}
        <button
          onClick={() => router.push(getBackUrl())}
          className="flex items-center gap-2 text-gray-600 hover:text-brand transition-colors mb-4 sm:mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm font-medium">{getBackLabel()}</span>
        </button>

        {/* Success Banner - Only for paid transactions */}
        {isPaid && (
          <PaymentSuccessBanner
            onCelebrate={triggerConfetti}
            isSubscription={isSubscription}
          />
        )}

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
                    Auto-update enabled
                  </span>
                  {isSubscribed && (
                    <Badge
                      variant="secondary"
                      className="text-[10px] bg-green-100 text-green-700"
                    >
                      Connected
                    </Badge>
                  )}
                </>
              ) : (
                <>
                  <WifiOff className="w-4 h-4" />
                  <span className="text-xs sm:text-sm">Connecting...</span>
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

        {/* Status Header - For non-paid statuses */}
        {!isPaid && (
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
        )}

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

          {/* Subscription Confirmation Card - Only for paid subscription */}
          {isPaid && isSubscription && transaction.userSubscription && (
            <SubscriptionConfirmedCard
              subscription={transaction.userSubscription}
            />
          )}

          {/* Ticket Confirmation Card - Only for paid event */}
          {isPaid && !isSubscription && transaction.event && (
            <Card className="border-green-200 bg-green-50/50">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center">
                      <Ticket className="w-4 h-4 text-green-600" />
                    </div>
                    <CardTitle className="text-base sm:text-lg text-green-800">
                      Ticket Confirmed
                    </CardTitle>
                  </div>
                  <Badge className="bg-green-100 text-green-700 hover:bg-green-200">
                    <CheckCircle2 className="w-3 h-3 mr-1" />
                    Active
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold text-lg sm:text-xl text-gray-900 leading-tight">
                    {transaction.event.title}
                  </h3>
                  <Badge variant="secondary" className="mt-2 text-xs">
                    {transaction.event.category}
                  </Badge>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="flex items-start gap-2 text-sm text-gray-600 bg-white rounded-lg p-3">
                    <Calendar className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs text-gray-500">Date</p>
                      <p className="font-medium text-gray-900">
                        {format(
                          new Date(transaction.event.eventDate),
                          "EEEE, MMMM dd, yyyy",
                          { locale: enUS }
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2 text-sm text-gray-600 bg-white rounded-lg p-3">
                    <MapPin className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs text-gray-500">Location</p>
                      <p className="font-medium text-gray-900">
                        {transaction.event.venue}, {transaction.event.city}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Subscription Details - For non-paid subscription statuses */}
          {!isPaid && isSubscription && transaction.userSubscription && (
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Crown className="w-4 h-4 sm:w-5 sm:h-5 text-brand" />
                  <CardTitle className="text-base sm:text-lg">
                    Subscription Details
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <h3 className="font-semibold text-base sm:text-lg text-gray-900 leading-tight">
                    {(transaction.userSubscription as any).plan?.name ||
                      "DayLight Premium"}
                  </h3>
                  <Badge variant="secondary" className="mt-2 text-xs">
                    <Sparkles className="w-3 h-3 mr-1" />
                    {(transaction.userSubscription as any).plan
                      ?.durationInMonths || 1}{" "}
                    Month
                    {((transaction.userSubscription as any).plan
                      ?.durationInMonths || 1) > 1
                      ? "s"
                      : ""}
                  </Badge>
                </div>
                {(transaction.userSubscription as any).plan?.features && (
                  <div className="pt-2 space-y-2">
                    {(transaction.userSubscription as any).plan.features
                      .slice(0, 3)
                      .map((feature: string, index: number) => (
                        <div
                          key={index}
                          className="flex items-start gap-2 text-xs sm:text-sm text-gray-600"
                        >
                          <Check className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                          <span>{feature}</span>
                        </div>
                      ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Event Details - For non-paid event statuses */}
          {!isPaid && !isSubscription && transaction.event && (
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Ticket className="w-4 h-4 sm:w-5 sm:h-5 text-brand" />
                  <CardTitle className="text-base sm:text-lg">
                    Event Details
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
                      "EEEE, MMMM dd, yyyy",
                      { locale: enUS }
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
                  Payment Summary
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between text-xs sm:text-sm">
                <span className="text-gray-600">Payment Method</span>
                <span className="font-medium text-gray-900">
                  {transaction.paymentMethodName}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs sm:text-sm">
                <span className="text-gray-600">
                  {isSubscription ? "Subscription Price" : "Event Price"}
                </span>
                <span className="font-medium text-gray-900">
                  {formatCurrency(
                    Number(transaction.amount),
                    transaction.paymentMethod.currency
                  )}
                </span>
              </div>
              {Number(transaction.totalFee) > 0 && (
                <div className="flex items-center justify-between text-xs sm:text-sm">
                  <span className="text-gray-600">Service Fee</span>
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
                  Total Payment
                </span>
                <span
                  className={cn(
                    "font-bold text-xl sm:text-2xl",
                    isPaid ? "text-green-600" : "text-brand"
                  )}
                >
                  {formatCurrency(
                    Number(transaction.finalAmount),
                    transaction.paymentMethod.currency
                  )}
                </span>
              </div>

              {/* Payment Status Indicator */}
              {isPaid && (
                <div className="flex items-center justify-center gap-2 pt-3 mt-3 border-t border-green-100">
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                  <span className="text-sm font-medium text-green-600">
                    Payment has been received
                  </span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Transaction Info */}
          <Card className="bg-gray-50">
            <CardHeader>
              <div className="flex items-center gap-2">
                <CreditCard className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500" />
                <CardTitle className="text-sm sm:text-base font-semibold text-gray-700">
                  Transaction Information
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-2.5 sm:space-y-3 text-xs sm:text-sm">
              <div className="flex items-center justify-between gap-2">
                <span className="text-gray-500">Transaction ID</span>
                <code className="font-mono text-[10px] sm:text-xs bg-gray-100 px-1.5 py-0.5 rounded truncate max-w-[150px] sm:max-w-none">
                  {transaction.externalId}
                </code>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-500">Type</span>
                <Badge variant="outline" className="text-xs">
                  {isSubscription ? (
                    <>
                      <Crown className="w-3 h-3 mr-1" />
                      Subscription
                    </>
                  ) : (
                    <>
                      <Ticket className="w-3 h-3 mr-1" />
                      Event
                    </>
                  )}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-500">Status</span>
                <XenditTransactionStatusBadge
                  status={transaction.status}
                  size="sm"
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-500">Created At</span>
                <span className="text-gray-700">
                  {format(
                    new Date(transaction.createdAt),
                    "MMM dd, yyyy, HH:mm",
                    { locale: enUS }
                  )}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-500">Last Updated</span>
                <span className="text-gray-700">
                  {format(
                    new Date(transaction.updatedAt),
                    "MMM dd, yyyy, HH:mm",
                    { locale: enUS }
                  )}
                </span>
              </div>
              {isPaid && (
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Paid At</span>
                  <span className="text-green-600 font-medium">
                    {format(
                      new Date(transaction.updatedAt),
                      "MMM dd, yyyy, HH:mm",
                      { locale: enUS }
                    )}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* CTA Buttons */}
          <div className="space-y-3 pt-2 pb-4">
            {isPaid && isSubscription && (
              <>
                <Button
                  onClick={() => router.push("/subscriptions")}
                  size="lg"
                  className="w-full h-11 sm:h-12 text-sm sm:text-base bg-linear-to-r from-brand to-orange-600 hover:from-orange-600 hover:to-orange-700"
                >
                  <Crown className="w-4 h-4 mr-2" />
                  View My Subscription
                </Button>
                <Button
                  variant="outline"
                  onClick={() => router.push("/events")}
                  className="w-full h-10 sm:h-11 text-sm"
                >
                  Explore Premium Events
                </Button>
              </>
            )}

            {isPaid && !isSubscription && (
              <>
                <Button
                  onClick={() => router.push("/my-events")}
                  size="lg"
                  className="w-full h-11 sm:h-12 text-sm sm:text-base"
                >
                  <Ticket className="w-4 h-4 mr-2" />
                  View My Events
                </Button>
                <Button
                  variant="outline"
                  onClick={() => router.push("/events")}
                  className="w-full h-10 sm:h-11 text-sm"
                >
                  Explore Other Events
                </Button>
              </>
            )}

            {(isFailed || isExpired) && (
              <Button
                onClick={() => {
                  if (isSubscription) {
                    router.push("/subscriptions");
                  } else if (transaction.event) {
                    router.push(`/events/${transaction.event.slug}/payment`);
                  }
                }}
                size="lg"
                className="w-full h-11 sm:h-12 text-sm sm:text-base"
              >
                Try Again
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
