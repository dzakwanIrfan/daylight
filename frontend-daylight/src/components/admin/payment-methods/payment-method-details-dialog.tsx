'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { PaymentMethod, PaymentMethodTypeLabels } from '@/types/payment-method.types';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { format } from 'date-fns';
import { formatCurrency } from '@/lib/utils';
import Image from 'next/image';
import { CreditCard, Globe, Banknote, Clock, Calendar } from 'lucide-react';

interface PaymentMethodDetailsDialogProps {
  method: PaymentMethod;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PaymentMethodDetailsDialog({
  method,
  open,
  onOpenChange,
}: PaymentMethodDetailsDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] bg-white max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Payment Method Details</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Header Section */}
          <div className="flex items-center gap-4">
            <div className="relative w-16 h-16 rounded-lg overflow-hidden border border-gray-200 shrink-0 bg-white">
              {method.logoUrl ?  (
                <Image
                  src={method.logoUrl}
                  alt={method.name}
                  fill
                  className="object-contain p-2"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-100">
                  <CreditCard className="w-8 h-8 text-gray-400" />
                </div>
              )}
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-lg text-gray-900">{method.name}</h3>
              <p className="text-sm text-gray-600 font-mono">{method.code}</p>
              <div className="flex gap-2 mt-2 flex-wrap">
                <Badge variant={method.isActive ? 'default' : 'secondary'}>
                  {method.isActive ? 'Active' : 'Inactive'}
                </Badge>
                <Badge variant="outline">
                  {PaymentMethodTypeLabels[method.type] || method.type}
                </Badge>
              </div>
            </div>
          </div>

          <Separator />

          {/* Location & Currency */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-start gap-3">
              <Globe className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-500">Country</p>
                <p className="text-sm text-gray-900 mt-1">
                  {method.country?.name || method.countryCode}
                </p>
                <p className="text-xs text-gray-500">{method.countryCode}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Banknote className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-500">Currency</p>
                <p className="text-sm text-gray-900 mt-1 font-mono">
                  {method.currency}
                </p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Admin Fees */}
          <div>
            <p className="text-sm font-medium text-gray-500 mb-3">Admin Fee Structure</p>
            <div className="p-4 bg-gray-50 rounded-lg space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Percentage Rate:</span>
                <span className="text-sm font-medium text-gray-900">
                  {method.adminFeeRatePercent.toFixed(2)}%
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Fixed Amount:</span>
                <span className="text-sm font-medium text-gray-900">
                  {formatCurrency(method.adminFeeFixed, method.currency)}
                </span>
              </div>
              <Separator className="my-2" />
              <div className="flex justify-between text-xs text-gray-500">
                <span>Formula:</span>
                <span className="font-mono">
                  (amount × {method.adminFeeRate}) + {method.adminFeeFixed}
                </span>
              </div>
            </div>
          </div>

          {/* Transaction Limits */}
          <div>
            <p className="text-sm font-medium text-gray-500 mb-3">Transaction Limits</p>
            <div className="p-4 bg-gray-50 rounded-lg space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Minimum Amount:</span>
                <span className="text-sm font-medium text-gray-900">
                  {formatCurrency(method.minAmount, method.currency)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Maximum Amount:</span>
                <span className="text-sm font-medium text-gray-900">
                  {formatCurrency(method.maxAmount, method.currency)}
                </span>
              </div>
            </div>
          </div>

          <Separator />

          {/* Timestamps */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-start gap-3">
              <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-500">Created At</p>
                <p className="text-sm text-gray-900 mt-1">
                  {format(new Date(method.createdAt), 'PPP')}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Clock className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-500">Updated At</p>
                <p className="text-sm text-gray-900 mt-1">
                  {format(new Date(method.updatedAt), 'PPP')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}