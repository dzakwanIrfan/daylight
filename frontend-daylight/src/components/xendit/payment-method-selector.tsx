"use client";

import { useState, useEffect } from "react";
import {
  ChevronDown,
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
import { Card, CardContent } from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

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
    EWALLET: <Wallet className="w-4 h-4 sm:w-5 sm:h-5" />,
    QR_CODE: <QrCode className="w-4 h-4 sm:w-5 sm:h-5" />,
    BANK_TRANSFER: <Building2 className="w-4 h-4 sm:w-5 sm:h-5" />,
    OVER_THE_COUNTER: <Store className="w-4 h-4 sm:w-5 sm:h-5" />,
    CARDS: <CreditCard className="w-4 h-4 sm:w-5 sm:h-5" />,
    ONLINE_BANKING: <Building2 className="w-4 h-4 sm:w-5 sm:h-5" />,
    PAYLATER: <Clock className="w-4 h-4 sm:w-5 sm:h-5" />,
  };
  return iconMap[type] || <Wallet className="w-4 h-4 sm:w-5 sm:h-5" />;
};

const getTypeStyles = (type: string) => {
  const styleMap: Record<string, { bg: string; text: string; border: string }> = {
    "E-Wallet": { bg: "bg-blue-50", text: "text-blue-600", border: "border-blue-100" },
    "QR Code": { bg: "bg-purple-50", text: "text-purple-600", border: "border-purple-100" },
    "Virtual Account": { bg: "bg-emerald-50", text: "text-emerald-600", border: "border-emerald-100" },
    "Retail Outlet": { bg: "bg-amber-50", text: "text-amber-600", border: "border-amber-100" },
    "Credit/Debit Card": { bg: "bg-indigo-50", text: "text-indigo-600", border: "border-indigo-100" },
    "Online Banking": { bg: "bg-teal-50", text: "text-teal-600", border: "border-teal-100" },
    "Pay Later": { bg: "bg-pink-50", text: "text-pink-600", border: "border-pink-100" },
  };
  return styleMap[type] || { bg: "bg-gray-50", text: "text-gray-600", border: "border-gray-100" };
};

// PAYMENT METHOD ITEM
function PaymentMethodItem({
  method,
  isSelected,
  onSelect,
  disabled,
}: {
  method: XenditPaymentMethod;
  isSelected: boolean;
  onSelect: () => void;
  disabled?: boolean;
}) {
  const isDisabled = disabled || ! method.isActive;

  return (
    <button
      type="button"
      onClick={onSelect}
      disabled={isDisabled}
      className={cn(
        "w-full flex items-center gap-3 p-3 sm:p-4 rounded-lg sm:rounded-xl border transition-all duration-200",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-1",
        "active:scale-[0.99]",
        isSelected
          ? "border-brand bg-brand/5 ring-1 ring-brand/20"
          : "border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50/50",
        isDisabled && "opacity-50 cursor-not-allowed hover:bg-white hover:border-gray-200"
      )}
    >
      {/* Logo */}
      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg border border-gray-100 bg-white flex items-center justify-center overflow-hidden shrink-0 p-1.5 sm:p-2">
        {method.logoUrl ?  (
          <Image
            src={method.logoUrl}
            alt={method.name}
            width={40}
            height={40}
            className="w-full h-full object-contain"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.style.display = "none";
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-50 text-gray-400 rounded">
            {getTypeIcon(method.type)}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 text-left min-w-0">
        <h4 className="font-medium text-sm sm:text-base text-gray-900 truncate">
          {method.name}
        </h4>
        <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
          {method.adminFeeFixed > 0
            ? `Fee: ${method.currency} ${method.adminFeeFixed.toLocaleString()}`
            : method.adminFeeRate > 0
            ? `Fee: ${(method.adminFeeRate * 100).toFixed(1)}%`
            : "Tanpa biaya tambahan"}
        </p>
      </div>

      {/* Selection Indicator */}
      <div
        className={cn(
          "w-5 h-5 sm:w-6 sm:h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-all",
          isSelected
            ? "border-brand bg-brand"
            : "border-gray-300 bg-white"
        )}
      >
        {isSelected && <Check className="w-3 h-3 sm:w-4 sm:h-4 text-white" />}
      </div>
    </button>
  );
}

// PAYMENT GROUP
function PaymentGroup({
  groupName,
  methods,
  selectedMethodId,
  onSelect,
  disabled,
  defaultExpanded = false,
}: {
  groupName: string;
  methods: XenditPaymentMethod[];
  selectedMethodId: string | null;
  onSelect: (method: XenditPaymentMethod) => void;
  disabled?: boolean;
  defaultExpanded?: boolean;
}) {
  const hasSelectedMethod = methods.some((m) => m.id === selectedMethodId);
  const [isOpen, setIsOpen] = useState(defaultExpanded || hasSelectedMethod);
  const styles = getTypeStyles(groupName);

  useEffect(() => {
    if (hasSelectedMethod) setIsOpen(true);
  }, [hasSelectedMethod]);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card className={cn("overflow-hidden transition-shadow", isOpen && "shadow-sm")}>
        <CollapsibleTrigger asChild>
          <button
            type="button"
            className={cn(
              "w-full flex items-center justify-between p-3 sm:p-4",
              hasSelectedMethod
            )}
          >
            <div className="flex items-center gap-2.5 sm:gap-3">
              <div
                className={cn(
                  "w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center border",
                  styles.bg,
                  styles.text,
                  styles.border
                )}
              >
                {hasSelectedMethod ? (
                  <Check className="w-4 h-4 sm:w-5 sm:h-5" />
                ) : (
                  <span className="text-xs sm:text-sm font-semibold">{methods.length}</span>
                )}
              </div>
              <div className="text-left">
                <h3 className="font-semibold text-sm sm:text-base text-gray-900">{groupName}</h3>
                <p className="text-xs text-gray-500 hidden sm:block">
                  {methods.length} payment method
                </p>
              </div>
            </div>

            <ChevronDown
              className={cn(
                "w-4 h-4 sm:w-5 sm:h-5 text-gray-400 transition-transform duration-200",
                isOpen && "rotate-180"
              )}
            />
          </button>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <CardContent className="space-y-2">
            {methods.map((method) => (
              <PaymentMethodItem
                key={method.id}
                method={method}
                isSelected={method.id === selectedMethodId}
                onSelect={() => onSelect(method)}
                disabled={disabled}
              />
            ))}
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
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
      <div className="text-center py-4 sm:py-8">
        <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3">
          <Wallet className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400" />
        </div>
        <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-1">
          Payment Methods Unavailable
        </h3>
        <p className="text-xs sm:text-sm text-gray-500 max-w-xs mx-auto">
          Currently, there are no payment methods available. Please try again later.
        </p>
      </div>
    );
  }

  return (
    <div className={cn("space-y-3", className)}>
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