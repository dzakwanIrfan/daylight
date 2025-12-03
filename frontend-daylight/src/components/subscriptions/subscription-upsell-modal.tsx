"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Crown,
  Check,
  X,
  TrendingUp,
  ArrowRight,
  Zap,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { useActivePlans } from "@/hooks/use-subscriptions";
import { cn } from "@/lib/utils";

interface SubscriptionUpsellModalProps {
  isOpen: boolean;
  onClose: () => void;
  eventPrice: number;
  eventTitle: string;
  eventSlug: string;
  currency?: string;
}

export function SubscriptionUpsellModal({
  isOpen,
  onClose,
  eventPrice,
  eventTitle,
  eventSlug,
  currency = "IDR",
}: SubscriptionUpsellModalProps) {
  const router = useRouter();
  const { data: plansResponse, isLoading, error } = useActivePlans();
  const [selectedOption, setSelectedOption] = useState<
    "onetime" | "subscription"
  >("subscription");

  const plans = plansResponse?.data || [];
  const monthlyPlan = plans.find((p) => p.type === "MONTHLY_1");

  // Use backend-calculated price (already in correct currency based on user location)
  const planPrice = monthlyPlan?.currentPrice || monthlyPlan?.price || 0;
  const planCurrency =
    monthlyPlan?.currentCurrency || monthlyPlan?.currency || currency;

  // Calculate savings
  const eventsPerMonth = 4;
  const costPerMonthOneTime = eventPrice * eventsPerMonth;
  const savingsPerMonth = planPrice > 0 ? costPerMonthOneTime - planPrice : 0;
  const savingsPercentage =
    planPrice > 0
      ? Math.round((savingsPerMonth / costPerMonthOneTime) * 100)
      : 0;

  const handleProceed = () => {
    if (selectedOption === "subscription") {
      router.push("/subscriptions");
    } else {
      router.push(`/events/${eventSlug}/payment`);
    }
    onClose();
  };

  if (isLoading) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-3xl">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-brand" />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (error || !monthlyPlan) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-3xl">
          <div className="text-center py-8">
            <AlertCircle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
            <p className="text-gray-600 mb-4">
              Unable to load subscription plans. Please try again later.
            </p>
            <Button onClick={onClose}>Close</Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto p-0">
        <div className="p-6 space-y-6">
          {/* Header */}
          <DialogHeader className="space-y-2">
            <DialogTitle className="text-2xl font-bold text-gray-900">
              Choose Your Option
            </DialogTitle>
            <DialogDescription className="text-sm text-gray-600 leading-relaxed">
              <span className="font-semibold text-gray-900">{eventTitle}</span>{" "}
              costs{" "}
              <span className="font-semibold text-gray-900">
                {formatCurrency(eventPrice, currency)}
              </span>
              . Would you prefer unlimited access instead?
            </DialogDescription>
          </DialogHeader>

          {/* Options Grid */}
          <div className="grid md:grid-cols-2 gap-4">
            {/* Single Purchase Card */}
            <button
              onClick={() => setSelectedOption("onetime")}
              className={cn(
                "relative p-6 rounded-lg border-2 text-left transition-all h-full",
                selectedOption === "onetime"
                  ? "border-gray-900 bg-gray-50 shadow-sm"
                  : "border-gray-200 hover:border-gray-300"
              )}
            >
              {/* Header Section - Fixed Height */}
              <div className="flex items-center justify-between mb-4 h-12">
                <div>
                  <h3 className="font-bold text-lg text-gray-900 mb-0.5">
                    Single Purchase
                  </h3>
                  <p className="text-xs text-gray-600">
                    Pay once for this event
                  </p>
                </div>
                <div
                  className={cn(
                    "w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ml-2",
                    selectedOption === "onetime"
                      ? "border-gray-900 bg-gray-900"
                      : "border-gray-300"
                  )}
                >
                  {selectedOption === "onetime" && (
                    <Check className="w-3 h-3 text-white" />
                  )}
                </div>
              </div>

              {/* Price Section - Fixed Height */}
              <div className="mb-6 h-16 flex flex-col">
                <div className="text-3xl font-bold text-gray-900">
                  {formatCurrency(eventPrice, currency)}
                </div>
                <p className="text-sm text-gray-600 mt-1">One-time payment</p>
              </div>

              {/* Features Section - Fixed Height */}
              <div className="pt-4 border-t border-gray-200 space-y-3 min-h-[140px]">
                <div className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-gray-600 shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-700">
                    Access to this event
                  </span>
                </div>
                <div className="flex items-start gap-2.5">
                  <X className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-500">
                    Limited to single event
                  </span>
                </div>
                <div className="flex items-start gap-2.5">
                  <X className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-500">
                    No future access
                  </span>
                </div>
              </div>
            </button>

            {/* Subscription Card */}
            <button
              onClick={() => setSelectedOption("subscription")}
              className={cn(
                "relative p-6 rounded-lg border-2 text-left transition-all h-full",
                selectedOption === "subscription"
                  ? "border-brand bg-orange-50 shadow-md"
                  : "border-orange-200 hover:border-orange-300"
              )}
            >
              {/* Recommended Badge */}
              <div className="absolute -top-2.5 left-1/2 -translate-x-1/2">
                <div className="inline-flex items-center gap-1 px-3 py-1 bg-brand text-white text-xs font-bold rounded-full shadow-sm">
                  <Zap className="w-3 h-3" />
                  Recommended
                </div>
              </div>

              {/* Header Section */}
              <div className="flex items-center justify-between mb-4 h-12 mt-2">
                <div>
                  <h3 className="font-bold text-lg text-gray-900 mb-0.5">
                    Subscription
                  </h3>
                  <p className="text-xs text-gray-600">
                    Unlimited event access
                  </p>
                </div>
                <div
                  className={cn(
                    "w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ml-2",
                    selectedOption === "subscription"
                      ? "border-brand bg-brand"
                      : "border-orange-300"
                  )}
                >
                  {selectedOption === "subscription" && (
                    <Check className="w-3 h-3 text-white" />
                  )}
                </div>
              </div>

              {/* Price Section - Fixed Height */}
              <div className="mb-6 h-16 flex flex-col justify-center">
                <div className="flex flex-col">
                  <span className="text-3xl font-bold text-brand">
                    {formatCurrency(planPrice, planCurrency)}
                  </span>
                  <div className="text-sm text-gray-600">/ month</div>
                </div>
                {savingsPercentage > 0 && (
                  <div className="inline-flex items-center gap-1 mt-2 px-2 py-0.5 bg-green-50 text-green-700 text-xs font-semibold rounded border border-green-200 w-fit">
                    <TrendingUp className="w-3 h-3" />
                    Save {savingsPercentage}%
                  </div>
                )}
              </div>

              {/* Features Section - Fixed Height */}
              <div className="pt-4 border-t border-orange-200 space-y-3 min-h-[140px]">
                <div className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-brand shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-900 font-medium">
                    Unlimited events
                  </span>
                </div>
                <div className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-brand shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-900 font-medium">
                    Exclusive community
                  </span>
                </div>
                <div className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-brand shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-900 font-medium">
                    VIP access
                  </span>
                </div>
              </div>
            </button>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col-reverse sm:flex-row gap-3 pt-2">
            <Button variant="outline" onClick={onClose} className="flex-1 h-11">
              Maybe Later
            </Button>
            <Button
              onClick={handleProceed}
              className={cn(
                "flex-1 h-11",
                selectedOption === "subscription"
                  ? "bg-brand hover:bg-brand/90"
                  : "bg-gray-900 hover:bg-gray-800"
              )}
            >
              {selectedOption === "subscription" ? (
                <>
                  <Crown className="w-4 h-4 mr-2" />
                  View Plans
                </>
              ) : (
                <>
                  Continue
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          </div>

          {/* Footer Note */}
          <p className="text-xs text-center text-gray-600 leading-relaxed">
            Most members attend 4-6 events monthly
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
