"use client";

import { Info, Receipt } from "lucide-react";
import { cn, formatCurrency } from "@/lib/utils";
import type { XenditFeeCalculation } from "@/types/xendit.types";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

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
    <Card className={cn("overflow-hidden")}>
      <CardHeader className="pb-3 sm:pb-4">
        <div className="flex items-center gap-2">
          <Skeleton className="w-5 h-5 rounded" />
          <Skeleton className="h-5 w-32" />
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex justify-between">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-20" />
          </div>
        ))}
      </CardContent>
      <Separator />
      <CardFooter className="pt-4">
        <div className="flex justify-between w-full">
          <Skeleton className="h-6 w-28" />
          <Skeleton className="h-6 w-24" />
        </div>
      </CardFooter>
    </Card>
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
    <Card className={cn("overflow-hidden", className)}>
      {/* Header */}
      <CardHeader>
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Receipt className="w-4 h-4 sm:w-5 sm:h-5 text-brand" />
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
        {/* Base Amount */}
        <div className="flex items-center justify-between text-sm sm:text-base">
          <span className="text-gray-600">Base Amount</span>
          <span className="font-medium text-gray-900">
            {formatCurrency(calc.baseAmount, currency)}
          </span>
        </div>

        {/* Fee Breakdown */}
        {calc.totalFee > 0 && (
          <div className="flex items-center justify-between text-sm sm:text-base">
            <div className="flex items-center gap-1.5">
              <span className="text-gray-600">Service Fee</span>
              {showDetails && (feePercentage || feeFixed) && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button type="button" className="focus:outline-none">
                        <Info className="w-3.5 h-3.5 text-gray-400 hover:text-gray-600 transition-colors" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="text-xs">
                      <div className="space-y-0.5">
                        {feePercentage && <p>Rate: {feePercentage}</p>}
                        {feeFixed && <p>Fixed: {feeFixed}</p>}
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
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

      {/* Footer Note */}
      <CardFooter className="bg-gray-50/80 border-t">
        <p className="text-xs text-gray-500 flex items-start justify-center gap-2">
          <Info className="w-3.5 h-3.5 shrink-0" />
          <span>Fee varies depending on the selected payment method.</span>
        </p>
      </CardFooter>
    </Card>
  );
}
