'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Transaction, TransactionStatus, TransactionType } from '@/types/transaction.types';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { format } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';
import {
  User,
  Calendar,
  CreditCard,
  DollarSign,
  Hash,
  CheckCircle,
  Clock,
  XCircle,
  Package,
  Crown,
  Globe,
  QrCode,
  ExternalLink
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';

interface TransactionDetailsDialogProps {
  transaction: Transaction;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const statusColors: Record<TransactionStatus, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  PAID: 'bg-green-100 text-green-800 border-green-200',
  FAILED: 'bg-red-100 text-red-800 border-red-200',
  EXPIRED: 'bg-gray-100 text-gray-800 border-gray-200',
  REFUNDED: 'bg-purple-100 text-purple-800 border-purple-200',
};

const typeColors: Record<TransactionType, string> = {
  EVENT: 'bg-blue-100 text-blue-800 border-blue-200',
  SUBSCRIPTION: 'bg-orange-100 text-orange-800 border-orange-200',
};

const statusIcons: Record<TransactionStatus, React.ReactNode> = {
  PENDING: <Clock className="h-4 w-4" />,
  PAID: <CheckCircle className="h-4 w-4" />,
  FAILED: <XCircle className="h-4 w-4" />,
  EXPIRED: <XCircle className="h-4 w-4" />,
  REFUNDED: <XCircle className="h-4 w-4" />,
};

export function TransactionDetailsDialog({ transaction, open, onOpenChange }: TransactionDetailsDialogProps) {
  const currency = transaction.paymentMethod?.currency || 'IDR';
  const user = transaction.user;
  const fullName = user ? [user.firstName, user.lastName].filter(Boolean).join(' ') : 'N/A';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[750px] max-h-[90vh] bg-white">
        <DialogHeader>
          <DialogTitle className="text-xl">Transaction Details</DialogTitle>
          <div className="flex gap-2 mt-2 flex-wrap">
            <Badge variant="outline" className={typeColors[transaction.transactionType]}>
              {transaction.transactionType === TransactionType.EVENT && <Package className="mr-1 h-3 w-3" />}
              {transaction.transactionType === TransactionType.SUBSCRIPTION && <Crown className="mr-1 h-3 w-3" />}
              {transaction.transactionType}
            </Badge>
            <Badge variant="outline" className={statusColors[transaction.status]}>
              <span className="mr-1">{statusIcons[transaction.status]}</span>
              {transaction.status}
            </Badge>
            {transaction.paymentMethod && (
              <Badge variant="outline" className="bg-gray-50">
                <Globe className="mr-1 h-3 w-3" />
                {transaction.paymentMethod.country.name} ({transaction.paymentMethod.currency})
              </Badge>
            )}
          </div>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(90vh-120px)] pr-4">
          <div className="space-y-4">
            {/* Transaction ID */}
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Hash className="h-4 w-4" />
                <span className="font-medium">External ID</span>
              </div>
              <p className="font-mono text-sm text-gray-900 ml-6 break-all">
                {transaction.externalId}
              </p>
            </div>

            <Separator />

            {/* Customer Information */}
            <div>
              <h4 className="font-semibold text-sm text-gray-700 mb-3 flex items-center gap-2">
                <User className="h-4 w-4" />
                Customer Information
              </h4>
              <div className="grid grid-cols-2 gap-4 ml-6">
                <div className="space-y-1">
                  <span className="text-xs text-gray-500">Name</span>
                  <p className="text-sm text-gray-900">{fullName}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-xs text-gray-500">Email</span>
                  <p className="text-sm text-gray-900 break-all">{user?.email || 'N/A'}</p>
                </div>
                {user?.phoneNumber && (
                  <div className="space-y-1">
                    <span className="text-xs text-gray-500">Phone</span>
                    <p className="text-sm text-gray-900">{user.phoneNumber}</p>
                  </div>
                )}
                {user?.currentCity && (
                  <div className="space-y-1">
                    <span className="text-xs text-gray-500">Location</span>
                    <p className="text-sm text-gray-900">
                      {user.currentCity.name}, {user.currentCity.country.name}
                    </p>
                  </div>
                )}
              </div>
            </div>

            <Separator />

            {/* Item Information - EVENT */}
            {transaction.transactionType === TransactionType.EVENT && transaction.event && (
              <>
                <div>
                  <h4 className="font-semibold text-sm text-gray-700 mb-3 flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Event Information
                  </h4>
                  <div className="space-y-2 ml-6">
                    <div className="space-y-1">
                      <span className="text-xs text-gray-500">Event Title</span>
                      <p className="text-sm font-medium text-gray-900">{transaction.event.title}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <span className="text-xs text-gray-500">Date</span>
                        <p className="text-sm text-gray-900">
                          {format(new Date(transaction.event.eventDate), 'dd MMMM yyyy', { locale: idLocale })}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <span className="text-xs text-gray-500">Location</span>
                        <p className="text-sm text-gray-900">
                          {transaction.event.cityRelation
                            ? `${transaction.event.venue}, ${transaction.event.cityRelation.name}`
                            : `${transaction.event.venue}, ${transaction.event.city}`
                          }
                        </p>
                      </div>
                      {transaction.event.cityRelation && (
                        <div className="space-y-1">
                          <span className="text-xs text-gray-500">Country</span>
                          <p className="text-sm text-gray-900">
                            {transaction.event.cityRelation.country.name}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <Separator />
              </>
            )}

            {/* Item Information - SUBSCRIPTION */}
            {transaction.transactionType === TransactionType.SUBSCRIPTION && transaction.userSubscription && (
              <>
                <div>
                  <h4 className="font-semibold text-sm text-gray-700 mb-3 flex items-center gap-2">
                    <Crown className="h-4 w-4" />
                    Subscription Information
                  </h4>
                  <div className="space-y-2 ml-6">
                    <div className="space-y-1">
                      <span className="text-xs text-gray-500">Plan Name</span>
                      <p className="text-sm font-medium text-gray-900">{transaction.userSubscription.plan.name}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <span className="text-xs text-gray-500">Duration</span>
                        <p className="text-sm text-gray-900">
                          {transaction.userSubscription.plan.durationInMonths} month(s)
                        </p>
                      </div>
                      <div className="space-y-1">
                        <span className="text-xs text-gray-500">Status</span>
                        <Badge variant="outline" className="text-xs">
                          {transaction.userSubscription.status}
                        </Badge>
                      </div>
                    </div>
                    {transaction.userSubscription.startDate && transaction.userSubscription.endDate && (
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <span className="text-xs text-gray-500">Start Date</span>
                          <p className="text-sm text-gray-900">
                            {format(new Date(transaction.userSubscription.startDate), 'dd MMM yyyy', { locale: idLocale })}
                          </p>
                        </div>
                        <div className="space-y-1">
                          <span className="text-xs text-gray-500">End Date</span>
                          <p className="text-sm text-gray-900">
                            {format(new Date(transaction.userSubscription.endDate), 'dd MMM yyyy', { locale: idLocale })}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <Separator />
              </>
            )}

            {/* Payment Information */}
            <div>
              <h4 className="font-semibold text-sm text-gray-700 mb-3 flex items-center gap-2">
                <CreditCard className="h-4 w-4" />
                Payment Information
              </h4>
              <div className="grid grid-cols-2 gap-4 ml-6">
                <div className="space-y-1">
                  <span className="text-xs text-gray-500">Payment Method</span>
                  <p className="text-sm text-gray-900">
                    {transaction.paymentMethod?.name || transaction.paymentMethodName}
                  </p>
                  {transaction.paymentMethod && (
                    <p className="text-xs text-gray-500">
                      {transaction.paymentMethod.type.replace(/_/g, ' ')}
                    </p>
                  )}
                </div>
                {transaction.paymentMethod && (
                  <div className="space-y-1">
                    <span className="text-xs text-gray-500">Country</span>
                    <p className="text-sm text-gray-900">
                      {transaction.paymentMethod.country.name}
                    </p>
                  </div>
                )}
              </div>

              {/* Payment Actions */}
              {transaction.actions && transaction.actions.length > 0 && (
                <div className="mt-4 space-y-2">
                  <span className="text-xs font-medium text-gray-700">Payment Actions</span>
                  <div className="space-y-2">
                    {transaction.actions.map((action) => (
                      <div key={action.id} className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            {action.descriptor === 'QR_STRING' && <QrCode className="h-4 w-4 text-gray-600" />}
                            {action.descriptor === 'WEB_URL' && <ExternalLink className="h-4 w-4 text-gray-600" />}
                            <span className="text-xs font-medium text-gray-700">
                              {action.descriptor.replace(/_/g, ' ')}
                            </span>
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {action.type.replace(/_/g, ' ')}
                          </Badge>
                        </div>

                        {action.descriptor === 'WEB_URL' ? (
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full"
                            onClick={() => window.open(action.value, '_blank')}
                          >
                            <ExternalLink className="mr-2 h-3 w-3" />
                            Open Payment Link
                          </Button>
                        ) : action.descriptor === 'QR_STRING' ? (
                          <div className="space-y-2">
                            <div className="p-2 bg-white rounded border border-gray-200 flex items-center justify-center">
                              <QrCode className="h-32 w-32 text-gray-400" />
                            </div>
                            <p className="text-xs text-gray-500 text-center">
                              QR Code Available
                            </p>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <code className="flex-1 text-xs p-2 bg-white rounded border border-gray-200 font-mono break-all">
                              {action.value}
                            </code>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                navigator.clipboard.writeText(action.value);
                                toast.success('Copied to clipboard');
                              }}
                            >
                              Copy
                            </Button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <Separator />

            {/* Amount Breakdown */}
            <div>
              <h4 className="font-semibold text-sm text-gray-700 mb-3 flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Amount Breakdown
              </h4>
              <div className="space-y-2 ml-6">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Base Amount</span>
                  <span className="text-sm font-medium text-gray-900">
                    {formatCurrency(Number(transaction.amount), currency)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Total Fee</span>
                  <span className="text-sm text-gray-900">
                    {formatCurrency(Number(transaction.totalFee), currency)}
                  </span>
                </div>
                <Separator />
                <div className="flex justify-between items-center">
                  <span className="text-sm font-semibold text-gray-900">Final Amount</span>
                  <span className="text-lg font-bold text-green-600">
                    {formatCurrency(Number(transaction.finalAmount), currency)}
                  </span>
                </div>
              </div>
            </div>

            <Separator />

            {/* Timestamps */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <span className="text-xs text-gray-500">Created At</span>
                <p className="text-sm text-gray-900">
                  {format(new Date(transaction.createdAt), 'dd MMM yyyy, HH:mm', { locale: idLocale })}
                </p>
              </div>
              {transaction.paidAt && (
                <div className="space-y-1">
                  <span className="text-xs text-gray-500">Paid At</span>
                  <p className="text-sm text-green-600 font-medium">
                    {format(new Date(transaction.paidAt), 'dd MMM yyyy, HH:mm', { locale: idLocale })}
                  </p>
                </div>
              )}
            </div>

            {/* Payment URL */}
            {transaction.paymentUrl && (
              <>
                <Separator />
                <div className="space-y-2">
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => window.open(transaction.paymentUrl!, '_blank')}
                  >
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Open Payment Page
                  </Button>
                </div>
              </>
            )}

            {/* Matching Group Info */}
            {transaction.matchingMember && (
              <>
                <Separator />
                <div>
                  <h4 className="font-semibold text-sm text-gray-700 mb-3">
                    Matching Group Information
                  </h4>
                  <div className="ml-6 space-y-2">
                    <div className="space-y-1">
                      <span className="text-xs text-gray-500">Group Number</span>
                      <p className="text-sm text-gray-900">
                        Group #{transaction.matchingMember.group.groupNumber}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <span className="text-xs text-gray-500">Group Status</span>
                      <Badge variant="outline">
                        {transaction.matchingMember.group.status}
                      </Badge>
                    </div>
                    <div className="space-y-1">
                      <span className="text-xs text-gray-500">Event</span>
                      <p className="text-sm text-gray-900">
                        {transaction.matchingMember.group.event.title}
                      </p>
                      <p className="text-xs text-gray-500">
                        {format(new Date(transaction.matchingMember.group.event.eventDate), 'dd MMM yyyy', { locale: idLocale })}
                      </p>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}