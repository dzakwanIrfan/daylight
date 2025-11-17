'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { PaymentMethod } from '@/types/payment-method.types';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { format } from 'date-fns';
import Image from 'next/image';

interface PaymentMethodDetailsDialogProps {
  method: PaymentMethod;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PaymentMethodDetailsDialog({ method, open, onOpenChange }: PaymentMethodDetailsDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] bg-white">
        <DialogHeader>
          <DialogTitle>Payment Method Details</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Header Section */}
          <div className="flex items-center gap-4">
            <div className="relative w-16 h-16 rounded-lg overflow-hidden border border-gray-200 shrink-0">
              <Image
                src={method.iconUrl}
                alt={method.name}
                fill
                className="object-contain p-2"
                unoptimized
              />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-lg text-gray-900">{method.name}</h3>
              <p className="text-sm text-gray-600">{method.code}</p>
              <div className="flex gap-2 mt-2">
                <Badge variant={method.isActive ? 'default' : 'secondary'}>
                  {method.isActive ? 'Active' : 'Inactive'}
                </Badge>
                <Badge variant="outline">{method.type}</Badge>
              </div>
            </div>
          </div>

          <Separator />

          {/* Details Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-gray-500">Group</p>
              <p className="text-sm text-gray-900 mt-1">
                <Badge variant="outline">{method.group}</Badge>
              </p>
            </div>

            <div>
              <p className="text-sm font-medium text-gray-500">Sort Order</p>
              <p className="text-sm text-gray-900 mt-1">{method.sortOrder}</p>
            </div>

            <div className="col-span-2">
              <p className="text-sm font-medium text-gray-500 mb-2">Merchant Fees</p>
              <div className="p-3 bg-gray-50 rounded-lg space-y-1">
                <p className="text-sm text-gray-900">
                  Flat: Rp {method.feeMerchantFlat.toLocaleString('id-ID')}
                </p>
                <p className="text-sm text-gray-900">
                  Percent: {method.feeMerchantPercent}%
                </p>
              </div>
            </div>

            <div className="col-span-2">
              <p className="text-sm font-medium text-gray-500 mb-2">Customer Fees</p>
              <div className="p-3 bg-gray-50 rounded-lg space-y-1">
                <p className="text-sm text-gray-900">
                  Flat: Rp {method.feeCustomerFlat.toLocaleString('id-ID')}
                </p>
                <p className="text-sm text-gray-900">
                  Percent: {method.feeCustomerPercent}%
                </p>
              </div>
            </div>

            <div className="col-span-2">
              <p className="text-sm font-medium text-gray-500 mb-2">Fee Limits</p>
              <div className="p-3 bg-gray-50 rounded-lg space-y-1">
                <p className="text-sm text-gray-900">
                  Minimum: {method.minimumFee ? `Rp ${method.minimumFee.toLocaleString('id-ID')}` : 'None'}
                </p>
                <p className="text-sm text-gray-900">
                  Maximum: {method.maximumFee ? `Rp ${method.maximumFee.toLocaleString('id-ID')}` : 'None'}
                </p>
              </div>
            </div>

            <div className="col-span-2">
              <p className="text-sm font-medium text-gray-500 mb-2">Transaction Limits</p>
              <div className="p-3 bg-gray-50 rounded-lg space-y-1">
                <p className="text-sm text-gray-900">
                  Minimum: Rp {method.minimumAmount.toLocaleString('id-ID')}
                </p>
                <p className="text-sm text-gray-900">
                  Maximum: Rp {method.maximumAmount.toLocaleString('id-ID')}
                </p>
              </div>
            </div>

            <div>
              <p className="text-sm font-medium text-gray-500">Created At</p>
              <p className="text-sm text-gray-900 mt-1">
                {format(new Date(method.createdAt), 'PPP')}
              </p>
            </div>

            <div>
              <p className="text-sm font-medium text-gray-500">Updated At</p>
              <p className="text-sm text-gray-900 mt-1">
                {format(new Date(method.updatedAt), 'PPP')}
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}