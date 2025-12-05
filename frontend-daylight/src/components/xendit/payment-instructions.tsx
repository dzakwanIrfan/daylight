'use client';

import { useState } from 'react';
import {
  Copy,
  Check,
  ExternalLink,
  QrCode,
  Building2,
  Store,
  Info,
  Smartphone,
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import type { TransactionAction, XenditPaymentMethodType } from '@/types/xendit.types';
import { QRCodeSVG } from 'qrcode.react';

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
      await navigator.clipboard. writeText(value);
      setCopied(true);
      toast.success(label ?  `${label} copied!` : 'Copied!');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Failed to copy');
    }
  };

  return (
    <button
      onClick={handleCopy}
      className={cn(
        'p-3 rounded-xl transition-all duration-200',
        copied
          ? 'bg-green-500 text-white'
          : 'bg-brand hover:bg-brand/90 text-white'
      )}
    >
      {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
    </button>
  );
}

// QR CODE DISPLAY
function QRCodeDisplay({ qrString }: { qrString: string }) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6 text-center">
      <div className="inline-flex items-center justify-center p-2 bg-brand/10 rounded-xl mb-4">
        <QrCode className="w-6 h-6 text-brand" />
      </div>
      <h3 className="font-semibold text-gray-900 mb-4">Scan QR Code</h3>
      <div className="flex justify-center mb-4">
        <div className="p-4 bg-white rounded-xl border-2 border-gray-100 shadow-inner">
          <QRCodeSVG
            value={qrString}
            size={200}
            level="H"
            includeMargin={true}
            className="rounded-lg"
          />
        </div>
      </div>
      <p className="text-sm text-gray-500">
        Open your e-wallet app and scan this QR code
      </p>
    </div>
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
    <div className="bg-white border border-gray-200 rounded-2xl p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-green-100 rounded-xl">
          <Building2 className="w-5 h-5 text-green-600" />
        </div>
        <div>
          <h3 className="font-semibold text-gray-900">Virtual Account Number</h3>
          <p className="text-sm text-gray-500">{bankName}</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex-1 bg-gray-50 rounded-xl px-5 py-4 border border-gray-200">
          <p className="font-mono text-2xl font-bold tracking-wider text-center text-gray-900">
            {accountNumber}
          </p>
        </div>
        <CopyButton value={accountNumber} label="VA Number" />
      </div>

      <div className="mt-4 p-4 bg-blue-50 rounded-xl border border-blue-100">
        <div className="flex gap-2">
          <Info className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
          <div className="text-sm text-blue-700">
            <p className="font-medium mb-1">How to pay:</p>
            <ol className="list-decimal list-inside space-y-1 text-blue-600">
              <li>Open your mobile/internet banking app</li>
              <li>Select Transfer to Virtual Account</li>
              <li>Enter the VA number above</li>
              <li>Verify the amount and complete payment</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
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
    <div className="bg-white border border-gray-200 rounded-2xl p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-orange-100 rounded-xl">
          <Store className="w-5 h-5 text-orange-600" />
        </div>
        <div>
          <h3 className="font-semibold text-gray-900">Payment Code</h3>
          <p className="text-sm text-gray-500">{storeName}</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex-1 bg-gray-50 rounded-xl px-5 py-4 border border-gray-200">
          <p className="font-mono text-2xl font-bold tracking-wider text-center text-gray-900">
            {paymentCode}
          </p>
        </div>
        <CopyButton value={paymentCode} label="Payment Code" />
      </div>

      <div className="mt-4 p-4 bg-orange-50 rounded-xl border border-orange-100">
        <div className="flex gap-2">
          <Info className="w-5 h-5 text-orange-500 shrink-0 mt-0.5" />
          <div className="text-sm text-orange-700">
            <p className="font-medium mb-1">How to pay:</p>
            <ol className="list-decimal list-inside space-y-1 text-orange-600">
              <li>Visit the nearest {storeName} store</li>
              <li>Tell the cashier you want to make a payment</li>
              <li>Show or tell them the payment code</li>
              <li>Pay the amount and keep your receipt</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}

// REDIRECT BUTTON
function RedirectButton({ url, label }: { url: string; label: string }) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6 text-center">
      <div className="inline-flex items-center justify-center p-3 bg-brand/10 rounded-full mb-4">
        <Smartphone className="w-8 h-8 text-brand" />
      </div>
      <h3 className="font-semibold text-gray-900 mb-2">Continue Payment</h3>
      <p className="text-sm text-gray-500 mb-6">
        You will be redirected to complete your payment
      </p>
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center justify-center gap-2 w-full bg-brand hover:bg-brand/90 text-white rounded-xl px-6 py-4 font-semibold transition-all"
      >
        <span>{label}</span>
        <ExternalLink className="w-5 h-5" />
      </a>
    </div>
  );
}

// MAIN COMPONENT
export function XenditPaymentInstructions({
  actions,
  paymentMethodType,
  paymentMethodName,
  className,
}: PaymentInstructionsProps) {
  if (! actions || actions.length === 0) {
    return (
      <div className={cn('text-center py-8 text-gray-500', className)}>
        <Info className="w-8 h-8 mx-auto mb-2 text-gray-400" />
        <p>No payment instructions available</p>
      </div>
    );
  }

  // Parse actions to get payment info
  const paymentUrl = actions.find(
    (a) => a.descriptor === 'WEB_URL' || a.descriptor === 'DEEPLINK_URL'
  )?.value;
  const qrString = actions.find((a) => a.descriptor === 'QR_STRING')?.value;
  const vaNumber = actions.find((a) => a.descriptor === 'VIRTUAL_ACCOUNT_NUMBER')?. value;
  const paymentCode = actions. find((a) => a.descriptor === 'PAYMENT_CODE')?.value;

  return (
    <div className={cn('space-y-4', className)}>
      {/* QR Code */}
      {qrString && <QRCodeDisplay qrString={qrString} />}

      {/* Virtual Account */}
      {vaNumber && (
        <VirtualAccountDisplay
          accountNumber={vaNumber}
          bankName={paymentMethodName}
        />
      )}

      {/* Payment Code (OTC) */}
      {paymentCode && (
        <PaymentCodeDisplay
          paymentCode={paymentCode}
          storeName={paymentMethodName}
        />
      )}

      {/* Redirect URL */}
      {paymentUrl && ! qrString && (
        <RedirectButton url={paymentUrl} label={`Pay with ${paymentMethodName}`} />
      )}

      {/* E-Wallet with both QR and deeplink */}
      {paymentUrl && qrString && (
        <div className="text-center">
          <p className="text-sm text-gray-500 mb-3">Or use the app directly</p>
          <a
            href={paymentUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-brand hover:underline font-medium"
          >
            <span>Open in {paymentMethodName} App</span>
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      )}
    </div>
  );
}