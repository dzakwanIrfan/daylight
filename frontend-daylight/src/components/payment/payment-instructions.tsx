'use client';

import { PaymentInstruction } from '@/types/payment.types';
import { Check, Copy, ExternalLink } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

interface PaymentInstructionsProps {
  instructions: PaymentInstruction[];
  payCode?: string | null;
  payUrl?: string | null;
  qrUrl?: string | null;
}

export function PaymentInstructions({
  instructions,
  payCode,
  payUrl,
  qrUrl,
}: PaymentInstructionsProps) {
  const [copiedCode, setCopiedCode] = useState(false);

  const handleCopyCode = async () => {
    if (!payCode) return;

    try {
      await navigator.clipboard.writeText(payCode);
      setCopiedCode(true);
      toast.success('Payment code copied!');
      setTimeout(() => setCopiedCode(false), 2000);
    } catch (error) {
      toast.error('Failed to copy code');
    }
  };

  return (
    <div className="space-y-4">
      {/* QR Code */}
      {qrUrl && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="font-semibold text-center mb-4">Scan QR Code</h3>
          <div className="flex justify-center">
            <img
              src={qrUrl}
              alt="Payment QR Code"
              className="w-48 h-48 border border-gray-200 rounded-lg"
            />
          </div>
        </div>
      )}

      {/* Payment Code */}
      {payCode && (
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <p className="text-sm text-gray-600 mb-2 text-center">
            Payment Code
          </p>
          <div className="flex items-center gap-2">
            <div className="flex-1 bg-gray-50 rounded-lg px-4 py-3 font-mono text-lg font-bold text-center">
              {payCode}
            </div>
            <button
              onClick={handleCopyCode}
              className="p-3 bg-brand hover:bg-brand/90 text-white rounded-lg transition-colors"
            >
              {copiedCode ? (
                <Check className="w-5 h-5" />
              ) : (
                <Copy className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      )}

      {/* Payment URL */}
      {payUrl && (
        <a
          href={payUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="block w-full bg-brand hover:bg-brand/90 text-white rounded-lg px-6 py-3 font-semibold text-center transition-colors"
        >
          <span className="flex items-center justify-center gap-2">
            Open Payment Page
            <ExternalLink className="w-5 h-5" />
          </span>
        </a>
      )}

      {/* Instructions */}
      {instructions && instructions.length > 0 && (
        <div className="space-y-4">
          {instructions.map((instruction, index) => (
            <div
              key={index}
              className="bg-white border border-gray-200 rounded-lg p-4"
            >
              <h4 className="font-semibold mb-3">{instruction.title}</h4>
              <ol className="space-y-2">
                {instruction.steps.map((step, stepIndex) => (
                  <li
                    key={stepIndex}
                    className="flex items-start gap-3 text-sm text-gray-700"
                  >
                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-brand/10 text-brand font-semibold text-xs shrink-0 mt-0.5">
                      {stepIndex + 1}
                    </span>
                    <span 
                      className="flex-1"
                      dangerouslySetInnerHTML={{ __html: step }}
                    />
                  </li>
                ))}
              </ol>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}