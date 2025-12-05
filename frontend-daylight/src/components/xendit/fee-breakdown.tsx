"use client";

import { Info, Calculator, ArrowRight } from "lucide-react";
import { cn, formatCurrency } from "@/lib/utils";
import type { XenditFeeCalculation } from "@/types/xendit.types";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// TYPES
interface FeeBreakdownProps {
  calculation: XenditFeeCalculation;
  currency?: string;
  className?: string;
  showDetails?: boolean;
}

// SKELETON LOADER
export function FeeBreakdownSkeleton() {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-5 animate-pulse">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-5 h-5 bg-gray-200 rounded" />
        <div className="h-5 bg-gray-200 rounded w-32" />
      </div>
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex justify-between">
            <div className="h-4 bg-gray-200 rounded w-24" />
            <div className="h-4 bg-gray-200 rounded w-20" />
          </div>
        ))}
      </div>
      <div className="border-t border-gray-200 my-4" />
      <div className="flex justify-between">
        <div className="h-6 bg-gray-200 rounded w-28" />
        <div className="h-6 bg-gray-200 rounded w-24" />
      </div>
    </div>
  );
}

// MAIN COMPONENT
export function XenditFeeBreakdown({
  calculation,
  currency = "IDR",
  className,
  showDetails = true,
}: FeeBreakdownProps) {
  const { paymentMethod, calculation: calc } = calculation;

  const feePercentage =
    calc.feeRate > 0 ? `${(calc.feeRate * 100).toFixed(1)}%` : null;
  const feeFixed =
    calc.feeFixed > 0 ? formatCurrency(calc.feeFixed, currency) : null;

  return (
    <div
      className={cn(
        "bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm",
        className
      )}
    >
      {/* Header */}
      <div className="bg-linear-to-r from-brand/10 to-brand/5 px-5 py-4 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calculator className="w-5 h-5 text-brand" />
            <h3 className="font-semibold text-gray-900">Payment Summary</h3>
          </div>
          <span className="text-xs font-medium text-brand bg-brand/10 px-2 py-1 rounded-full">
            {paymentMethod.name}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-5 space-y-4">
        {/* Base Amount */}
        <div className="flex items-center justify-between">
          <span className="text-gray-600">Event Price</span>
          <span className="font-semibold text-gray-900">
            {formatCurrency(calc.baseAmount, currency)}
          </span>
        </div>

        {/* Fee Breakdown */}
        {calc.totalFee > 0 && (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1. 5">
              <span className="text-gray-600">Payment Fee</span>
              {showDetails && (feePercentage || feeFixed) && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="w-4 h-4 text-gray-400" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <div className="text-sm">
                        {feePercentage && <p>Rate: {feePercentage}</p>}
                        {feeFixed && <p>Fixed: {feeFixed}</p>}
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
            <span className="font-semibold text-orange-600">
              + {formatCurrency(calc.totalFee, currency)}
            </span>
          </div>
        )}

        {/* Divider */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-dashed border-gray-200" />
          </div>
          <div className="relative flex justify-center">
            <ArrowRight className="w-4 h-4 text-gray-400 bg-white px-1" />
          </div>
        </div>

        {/* Total */}
        <div className="flex items-center justify-between pt-1">
          <span className="font-semibold text-gray-900">Total Payment</span>
          <div className="text-right">
            <span className="text-2xl font-bold text-brand">
              {formatCurrency(calc.finalAmount, currency)}
            </span>
          </div>
        </div>
      </div>

      {/* Footer Note */}
      <div className="bg-gray-50 px-5 py-3 border-t border-gray-100">
        <p className="text-xs text-gray-500 flex items-start gap-2">
          <Info className="w-4 h-4 shrink-0 mt-0.5" />
          <span>
            Fee varies based on payment method. Choose the most convenient
            option for you.
          </span>
        </p>
      </div>
    </div>
  );
}
