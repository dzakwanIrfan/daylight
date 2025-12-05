"use client";

import { useState } from "react";
import {
  Copy,
  Check,
  ExternalLink,
  QrCode,
  Building2,
  Store,
  Info,
  Smartphone,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type {
  TransactionAction,
  XenditPaymentMethodType,
} from "@/types/xendit.types";
import { QRCodeSVG } from "qrcode.react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";

// TYPES
interface PaymentInstructionsProps {
  actions: TransactionAction[];
  paymentMethodType: XenditPaymentMethodType;
  paymentMethodName: string;
  className?: string;
}

// COPY BUTTON
function CopyButton({ value, label }: { value: string; label?: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      toast.success(label ? `${label} copied!` : "Copied!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy");
    }
  };

  return (
    <Button
      onClick={handleCopy}
      size="icon"
      variant={copied ? "default" : "default"}
      className={cn(
        "shrink-0 h-10 w-10 sm:h-11 sm:w-11 rounded-lg transition-all",
        copied
          ? "bg-green-500 hover:bg-green-600"
          : "bg-brand hover:bg-brand/90"
      )}
    >
      {copied ? (
        <Check className="w-4 h-4 sm:w-5 sm:h-5" />
      ) : (
        <Copy className="w-4 h-4 sm:w-5 sm:h-5" />
      )}
    </Button>
  );
}

// QR CODE DISPLAY
function QRCodeDisplay({ qrString }: { qrString: string }) {
  return (
    <Card>
      <CardHeader className="pb-3 text-center">
        <div className="inline-flex items-center justify-center p-2 bg-brand/10 rounded-lg mx-auto mb-2">
          <QrCode className="w-5 h-5 text-brand" />
        </div>
        <CardTitle className="text-base sm:text-lg">Scan QR Code</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center">
        <div className="p-3 sm:p-4 bg-white rounded-xl border-2 border-gray-100 shadow-inner">
          <QRCodeSVG
            value={qrString}
            size={180}
            level="H"
            includeMargin={true}
            className="rounded-lg w-40 h-40 sm:w-[180px] sm:h-[180px]"
          />
        </div>
        <p className="text-xs sm:text-sm text-gray-500 mt-3 text-center max-w-[200px]">
          Open your e-wallet app and scan this QR code
        </p>
      </CardContent>
    </Card>
  );
}

// VIRTUAL ACCOUNT DISPLAY
function VirtualAccountDisplay({
  accountNumber,
  bankName,
}: {
  accountNumber: string;
  bankName: string;
}) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-emerald-100 rounded-lg">
            <Building2 className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600" />
          </div>
          <div>
            <CardTitle className="text-base sm:text-lg">
              Virtual Account Number
            </CardTitle>
            <p className="text-xs sm:text-sm text-gray-500">{bankName}</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="flex-1 bg-gray-50 rounded-lg px-3 py-3 sm:px-4 sm:py-3.5 border border-gray-200">
            <p className="font-mono text-lg sm:text-xl md:text-2xl font-bold tracking-wider text-center text-gray-900 break-all">
              {accountNumber}
            </p>
          </div>
          <CopyButton value={accountNumber} label="VA Number" />
        </div>

        <Alert className="bg-blue-50 border-blue-100">
          <Info className="w-4 h-4 text-blue-500" />
          <AlertDescription className="text-xs sm:text-sm text-blue-700 ml-2">
            <p className="font-medium mb-1.5">How to pay:</p>
            <ol className="list-decimal list-inside space-y-0.5 text-blue-600">
              <li>Open your mobile/internet banking app</li>
              <li>Select Transfer to Virtual Account</li>
              <li>Enter the VA number above</li>
              <li>Confirm the amount and complete payment</li>
            </ol>
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
}

// PAYMENT CODE DISPLAY (OTC/Retail)
function PaymentCodeDisplay({
  paymentCode,
  storeName,
}: {
  paymentCode: string;
  storeName: string;
}) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-amber-100 rounded-lg">
            <Store className="w-4 h-4 sm:w-5 sm:h-5 text-amber-600" />
          </div>
          <div>
            <CardTitle className="text-base sm:text-lg">Payment Code</CardTitle>
            <p className="text-xs sm:text-sm text-gray-500">{storeName}</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="flex-1 bg-gray-50 rounded-lg px-3 py-3 sm:px-4 sm:py-3.5 border border-gray-200">
            <p className="font-mono text-lg sm:text-xl md:text-2xl font-bold tracking-wider text-center text-gray-900 break-all">
              {paymentCode}
            </p>
          </div>
          <CopyButton value={paymentCode} label="Payment Code" />
        </div>

        <Alert className="bg-amber-50 border-amber-100">
          <Info className="w-4 h-4 text-amber-500" />
          <AlertDescription className="text-xs sm:text-sm text-amber-700 ml-2">
            <p className="font-medium mb-1.5">How to pay:</p>
            <ol className="list-decimal list-inside space-y-0.5 text-amber-600">
              <li>Visit the nearest {storeName} outlet</li>
              <li>Tell the cashier you want to make a payment</li>
              <li>Show this payment code</li>
              <li>Pay and keep the receipt</li>
            </ol>
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
}

// REDIRECT BUTTON
function RedirectButton({ url, label }: { url: string; label: string }) {
  return (
    <Card className="text-center">
      <CardContent className="pt-6 pb-6">
        <div className="inline-flex items-center justify-center p-3 bg-brand/10 rounded-full mb-4">
          <Smartphone className="w-6 h-6 sm:w-8 sm:h-8 text-brand" />
        </div>
        <h3 className="font-semibold text-base sm:text-lg text-gray-900 mb-1.5">
          Continue Payment
        </h3>
        <p className="text-xs sm:text-sm text-gray-500 mb-5 max-w-[250px] mx-auto">
          You will be redirected to complete your payment
        </p>
        <Button asChild className="w-full h-11 sm:h-12 text-sm sm:text-base">
          <a href={url} target="_blank" rel="noopener noreferrer">
            <span>{label}</span>
            <ExternalLink className="w-4 h-4 sm:w-5 sm:h-5 ml-2" />
          </a>
        </Button>
      </CardContent>
    </Card>
  );
}

// MAIN COMPONENT
export function XenditPaymentInstructions({
  actions,
  paymentMethodType,
  paymentMethodName,
  className,
}: PaymentInstructionsProps) {
  if (!actions || actions.length === 0) {
    return (
      <div className={cn("text-center py-6 sm:py-8 text-gray-500", className)}>
        <Info className="w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-2 text-gray-400" />
        <p className="text-sm">Payment instructions not available</p>
      </div>
    );
  }

  // Parse actions
  const paymentUrl = actions.find(
    (a) => a.descriptor === "WEB_URL" || a.descriptor === "DEEPLINK_URL"
  )?.value;
  const qrString = actions.find((a) => a.descriptor === "QR_STRING")?.value;
  const vaNumber = actions.find(
    (a) => a.descriptor === "VIRTUAL_ACCOUNT_NUMBER"
  )?.value;
  const paymentCode = actions.find(
    (a) => a.descriptor === "PAYMENT_CODE"
  )?.value;

  return (
    <div className={cn("space-y-4", className)}>
      {qrString && <QRCodeDisplay qrString={qrString} />}

      {vaNumber && (
        <VirtualAccountDisplay
          accountNumber={vaNumber}
          bankName={paymentMethodName}
        />
      )}

      {paymentCode && (
        <PaymentCodeDisplay
          paymentCode={paymentCode}
          storeName={paymentMethodName}
        />
      )}

      {paymentUrl && !qrString && (
        <RedirectButton
          url={paymentUrl}
          label={`Pay with ${paymentMethodName}`}
        />
      )}

      {paymentUrl && qrString && (
        <div className="text-center pt-2">
          <p className="text-xs sm:text-sm text-gray-500 mb-2">
            Or use the app directly
          </p>
          <Button variant="outline" size="sm" asChild>
            <a href={paymentUrl} target="_blank" rel="noopener noreferrer">
              <span>Open {paymentMethodName}</span>
              <ExternalLink className="w-3.5 h-3.5 ml-1.5" />
            </a>
          </Button>
        </div>
      )}
    </div>
  );
}
