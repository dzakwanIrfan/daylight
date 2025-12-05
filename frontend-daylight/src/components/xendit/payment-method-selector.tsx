"use client";

import { useState, useMemo } from "react";
import {
  ChevronDown,
  ChevronRight,
  Check,
  Wallet,
  CreditCard,
  QrCode,
  Building2,
  Store,
  Clock,
} from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import type {
  XenditPaymentMethod,
  XenditPaymentMethodGroup,
  XenditPaymentMethodType,
} from "@/types/xendit.types";

// TYPES
interface PaymentMethodSelectorProps {
  methods: XenditPaymentMethod[];
  groupedMethods: XenditPaymentMethodGroup;
  selectedMethodId: string | null;
  onSelect: (method: XenditPaymentMethod) => void;
  disabled?: boolean;
  className?: string;
}

// ICON MAPPING
const getTypeIcon = (type: XenditPaymentMethodType) => {
  const iconMap: Record<string, React.ReactNode> = {
    EWALLET: <Wallet className="w-5 h-5" />,
    QR_CODE: <QrCode className="w-5 h-5" />,
    BANK_TRANSFER: <Building2 className="w-5 h-5" />,
    OVER_THE_COUNTER: <Store className="w-5 h-5" />,
    CARDS: <CreditCard className="w-5 h-5" />,
    ONLINE_BANKING: <Building2 className="w-5 h-5" />,
    PAYLATER: <Clock className="w-5 h-5" />,
  };
  return iconMap[type] || <Wallet className="w-5 h-5" />;
};

const getTypeColor = (type: string): string => {
  const colorMap: Record<string, string> = {
    "E-Wallet": "bg-blue-50 text-blue-600 border-blue-200",
    "QR Code": "bg-purple-50 text-purple-600 border-purple-200",
    "Virtual Account": "bg-green-50 text-green-600 border-green-200",
    "Retail Outlet": "bg-orange-50 text-orange-600 border-orange-200",
    "Credit/Debit Card": "bg-indigo-50 text-indigo-600 border-indigo-200",
    "Online Banking": "bg-teal-50 text-teal-600 border-teal-200",
    "Pay Later": "bg-pink-50 text-pink-600 border-pink-200",
  };
  return colorMap[type] || "bg-gray-50 text-gray-600 border-gray-200";
};

// PAYMENT METHOD ITEM
interface PaymentMethodItemProps {
  method: XenditPaymentMethod;
  isSelected: boolean;
  onSelect: () => void;
  disabled?: boolean;
}

function PaymentMethodItem({
  method,
  isSelected,
  onSelect,
  disabled,
}: PaymentMethodItemProps) {
  return (
    <button
      type="button"
      onClick={onSelect}
      disabled={disabled || !method.isActive}
      className={cn(
        "w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all duration-200",
        "hover:shadow-md focus:outline-none focus:ring-2 focus:ring-brand focus:ring-offset-2",
        isSelected
          ? "border-brand bg-brand/5 shadow-md"
          : "border-gray-200 bg-white hover:border-gray-300",
        (disabled || !method.isActive) &&
          "opacity-50 cursor-not-allowed hover:shadow-none"
      )}
    >
      {/* Logo */}
      <div className="w-14 h-14 rounded-xl border border-gray-200 bg-white flex items-center justify-center overflow-hidden shrink-0 p-2">
        {method.logoUrl ? (
          <Image
            src={method.logoUrl}
            alt={method.name}
            width={48}
            height={48}
            className="w-full h-full object-contain"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.style.display = "none";
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400 rounded-lg">
            {getTypeIcon(method.type)}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 text-left min-w-0">
        <h4 className="font-semibold text-gray-900 truncate">{method.name}</h4>
        <p className="text-sm text-gray-500 mt-0.5">
          {method.adminFeeFixed > 0
            ? `Fee: ${method.currency} ${method.adminFeeFixed.toLocaleString()}`
            : method.adminFeeRate > 0
            ? `Fee: ${(method.adminFeeRate * 100).toFixed(1)}%`
            : "No additional fee"}
        </p>
      </div>

      {/* Selection Indicator */}
      <div
        className={cn(
          "w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-all",
          isSelected ? "border-brand bg-brand" : "border-gray-300 bg-white"
        )}
      >
        {isSelected && <Check className="w-4 h-4 text-white" />}
      </div>
    </button>
  );
}

// PAYMENT GROUP
interface PaymentGroupProps {
  groupName: string;
  methods: XenditPaymentMethod[];
  selectedMethodId: string | null;
  onSelect: (method: XenditPaymentMethod) => void;
  disabled?: boolean;
  defaultExpanded?: boolean;
}

function PaymentGroup({
  groupName,
  methods,
  selectedMethodId,
  onSelect,
  disabled,
  defaultExpanded = false,
}: PaymentGroupProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const hasSelectedMethod = methods.some((m) => m.id === selectedMethodId);

  // Auto expand if has selected method
  useMemo(() => {
    if (hasSelectedMethod && !isExpanded) {
      setIsExpanded(true);
    }
  }, [hasSelectedMethod]);

  return (
    <div className="rounded-2xl border border-gray-200 bg-white overflow-hidden shadow-sm">
      {/* Group Header */}
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className={cn(
          "w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors",
          hasSelectedMethod && "bg-brand/5"
        )}
      >
        <div className="flex items-center gap-3">
          <div
            className={cn(
              "w-10 h-10 rounded-xl flex items-center justify-center",
              getTypeColor(groupName)
            )}
          >
            {hasSelectedMethod ? (
              <Check className="w-5 h-5" />
            ) : (
              <span className="text-sm font-bold">{methods.length}</span>
            )}
          </div>
          <div className="text-left">
            <h3 className="font-semibold text-gray-900">{groupName}</h3>
            <p className="text-xs text-gray-500">
              {methods.length} payment method{methods.length > 1 ? "s" : ""}
            </p>
          </div>
        </div>

        <ChevronDown
          className={cn(
            "w-5 h-5 text-gray-400 transition-transform duration-200",
            isExpanded && "rotate-180"
          )}
        />
      </button>

      {/* Group Content */}
      <div
        className={cn(
          "overflow-hidden transition-all duration-300",
          isExpanded ? "max-h-[1000px] opacity-100" : "max-h-0 opacity-0"
        )}
      >
        <div className="p-4 pt-0 space-y-3">
          {methods.map((method) => (
            <PaymentMethodItem
              key={method.id}
              method={method}
              isSelected={method.id === selectedMethodId}
              onSelect={() => onSelect(method)}
              disabled={disabled}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// MAIN COMPONENT
export function XenditPaymentMethodSelector({
  methods,
  groupedMethods,
  selectedMethodId,
  onSelect,
  disabled = false,
  className,
}: PaymentMethodSelectorProps) {
  const groupNames = Object.keys(groupedMethods);

  if (methods.length === 0) {
    return (
      <div className="text-center py-12">
        <Wallet className="w-12 h-12 text-gray-300 mx-auto mb-3" />
        <h3 className="text-lg font-semibold text-gray-900 mb-1">
          No Payment Methods Available
        </h3>
        <p className="text-sm text-gray-500">
          Payment methods are not available for your region
        </p>
      </div>
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      {groupNames.map((groupName, index) => (
        <PaymentGroup
          key={groupName}
          groupName={groupName}
          methods={groupedMethods[groupName]}
          selectedMethodId={selectedMethodId}
          onSelect={onSelect}
          disabled={disabled}
          defaultExpanded={index === 0}
        />
      ))}
    </div>
  );
}
