"use client";

import {
  CheckCircle2,
  Clock,
  XCircle,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { XenditTransactionStatus } from "@/types/xendit.types";

interface TransactionStatusBadgeProps {
  status: XenditTransactionStatus;
  size?: "sm" | "md" | "lg";
  showIcon?: boolean;
  className?: string;
}

const statusConfig: Record<
  XenditTransactionStatus,
  {
    label: string;
    icon: React.ReactNode;
    bgColor: string;
    textColor: string;
    iconColor: string;
    borderColor: string;
  }
> = {
  [XenditTransactionStatus.PENDING]: {
    label: "Pending",
    icon: <Clock className="w-full h-full" />,
    bgColor: "bg-yellow-50",
    textColor: "text-yellow-700",
    iconColor: "text-yellow-500",
    borderColor: "border-yellow-200",
  },
  [XenditTransactionStatus.PAID]: {
    label: "Paid",
    icon: <CheckCircle2 className="w-full h-full" />,
    bgColor: "bg-green-50",
    textColor: "text-green-700",
    iconColor: "text-green-500",
    borderColor: "border-green-200",
  },
  [XenditTransactionStatus.FAILED]: {
    label: "Failed",
    icon: <XCircle className="w-full h-full" />,
    bgColor: "bg-red-50",
    textColor: "text-red-700",
    iconColor: "text-red-500",
    borderColor: "border-red-200",
  },
  [XenditTransactionStatus.EXPIRED]: {
    label: "Expired",
    icon: <AlertCircle className="w-full h-full" />,
    bgColor: "bg-gray-50",
    textColor: "text-gray-700",
    iconColor: "text-gray-500",
    borderColor: "border-gray-200",
  },
  [XenditTransactionStatus.REFUNDED]: {
    label: "Refunded",
    icon: <RefreshCw className="w-full h-full" />,
    bgColor: "bg-blue-50",
    textColor: "text-blue-700",
    iconColor: "text-blue-500",
    borderColor: "border-blue-200",
  },
};

const sizeClasses = {
  sm: {
    container: "px-2 py-0.5 text-xs",
    icon: "w-3 h-3",
    gap: "gap-1",
  },
  md: {
    container: "px-3 py-1 text-sm",
    icon: "w-4 h-4",
    gap: "gap-1. 5",
  },
  lg: {
    container: "px-4 py-1. 5 text-base",
    icon: "w-5 h-5",
    gap: "gap-2",
  },
};

export function XenditTransactionStatusBadge({
  status,
  size = "md",
  showIcon = true,
  className,
}: TransactionStatusBadgeProps) {
  const config =
    statusConfig[status] || statusConfig[XenditTransactionStatus.PENDING];
  const sizes = sizeClasses[size];

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full font-medium border",
        sizes.container,
        sizes.gap,
        config.bgColor,
        config.textColor,
        config.borderColor,
        className
      )}
    >
      {showIcon && (
        <span className={cn(sizes.icon, config.iconColor)}>{config.icon}</span>
      )}
      <span>{config.label}</span>
    </span>
  );
}
