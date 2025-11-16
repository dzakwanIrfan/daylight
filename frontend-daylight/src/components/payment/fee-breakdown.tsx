'use client';

import { FeeCalculation } from '@/types/payment.types';
import { formatCurrency } from '@/lib/utils';

interface FeeBreakdownProps {
  calculation: FeeCalculation;
  currency?: string;
}

export function FeeBreakdown({ calculation, currency = 'IDR' }: FeeBreakdownProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-3">
      <h3 className="font-semibold text-gray-900">Payment Summary</h3>

      <div className="space-y-2 text-sm">
        {/* Base Amount */}
        <div className="flex items-center justify-between">
          <span className="text-gray-600">Event Price</span>
          <span className="font-medium">
            {formatCurrency(calculation.amount, currency)}
          </span>
        </div>

        {/* Customer Fee */}
        {calculation.fee.customer.total > 0 && (
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Payment Fee</span>
            <span className="font-medium text-orange-600">
              + {formatCurrency(calculation.fee.customer.total, currency)}
            </span>
          </div>
        )}

        {/* Divider */}
        <div className="border-t border-gray-200 pt-2 mt-2"></div>

        {/* Total */}
        <div className="flex items-center justify-between">
          <span className="font-semibold text-gray-900">Total Payment</span>
          <span className="font-bold text-lg text-brand">
            {formatCurrency(calculation.finalAmount, currency)}
          </span>
        </div>
      </div>

      {/* Info */}
      <p className="text-xs text-gray-600 bg-gray-50 p-3 rounded-lg">
        💡 Payment fee may vary depending on your selected payment method
      </p>
    </div>
  );
}