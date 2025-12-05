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
import { Badge } from "@/components/ui/badge";

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
    labelId: string;
    icon: React.ElementType;
    variant: "default" | "secondary" | "destructive" | "outline";
    className: string;
  }
> = {
  [XenditTransactionStatus.PENDING]: {
    label: "Pending",
    labelId: "Menunggu",
    icon: Clock,
    variant: "secondary",
    className:
      "bg-yellow-50 text-yellow-700 border-yellow-200 hover:bg-yellow-100",
  },
  [XenditTransactionStatus.PAID]: {
    label: "Paid",
    labelId: "Berhasil",
    icon: CheckCircle2,
    variant: "secondary",
    className: "bg-green-50 text-green-700 border-green-200 hover:bg-green-100",
  },
  [XenditTransactionStatus.FAILED]: {
    label: "Failed",
    labelId: "Gagal",
    icon: XCircle,
    variant: "destructive",
    className: "bg-red-50 text-red-700 border-red-200 hover:bg-red-100",
  },
  [XenditTransactionStatus.EXPIRED]: {
    label: "Expired",
    labelId: "Kadaluarsa",
    icon: AlertCircle,
    variant: "outline",
    className: "bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100",
  },
  [XenditTransactionStatus.REFUNDED]: {
    label: "Refunded",
    labelId: "Dikembalikan",
    icon: RefreshCw,
    variant: "secondary",
    className: "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100",
  },
};

const sizeClasses = {
  sm: {
    badge: "px-2 py-0.5 text-[10px] sm:text-xs gap-1",
    icon: "w-3 h-3",
  },
  md: {
    badge: "px-2.5 py-1 text-xs sm:text-sm gap-1. 5",
    icon: "w-3.5 h-3.5 sm:w-4 sm:h-4",
  },
  lg: {
    badge: "px-3 py-1.5 text-sm sm:text-base gap-2",
    icon: "w-4 h-4 sm:w-5 sm:h-5",
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
  const Icon = config.icon;

  return (
    <Badge
      variant="outline"
      className={cn(
        "inline-flex items-center font-medium border rounded-full transition-colors",
        sizes.badge,
        config.className,
        className
      )}
    >
      {showIcon && <Icon className={sizes.icon} />}
      <span>{config.labelId}</span>
    </Badge>
  );
}
