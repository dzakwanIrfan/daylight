'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { EventParticipant } from '@/types/participant.types';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { format } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { Copy, Mail, Phone, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface ParticipantDetailsDialogProps {
  participant: EventParticipant;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ParticipantDetailsDialog({
  participant,
  open,
  onOpenChange,
}: ParticipantDetailsDialogProps) {
  const router = useRouter();
  
  // Get eventId from participant (you may need to pass this separately)
  // For now, we'll make a simpler version that doesn't require the full detail
  const user = participant.user;
  const initials =
    `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`.toUpperCase() ||
    user.email[0].toUpperCase();

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard`);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Participant Details</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* User Profile Section */}
          <div className="flex items-start gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage 
                src={user.profilePicture || undefined} 
                alt={user.email} 
                crossOrigin='anonymous'
                referrerPolicy='no-referrer'
              />
              <AvatarFallback className="bg-brand/10 text-brand text-sm font-medium">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-lg text-gray-900">
                    {user.firstName && user.lastName
                      ? `${user.firstName} ${user.lastName}`
                      : participant.customerName}
                  </h3>
                  <p className="text-sm text-gray-600">{user.email}</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    onOpenChange(false);
                    router.push(`/admin/users`);
                  }}
                >
                  <ExternalLink className="mr-1 h-3 w-3" />
                  View Profile
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-3">
                <Badge
                  variant={
                    participant.paymentStatus === 'PAID' ? 'default' : 'secondary'
                  }
                >
                  {participant.paymentStatus}
                </Badge>
                {user.isEmailVerified && (
                  <Badge variant="outline" className="bg-green-50 text-green-700">
                    Email Verified
                  </Badge>
                )}
                {user.personalityResult && (
                  <Badge variant="outline" className="bg-purple-50 text-purple-700">
                    {user.personalityResult.archetype}
                  </Badge>
                )}
              </div>
            </div>
          </div>

          <Separator />

          {/* Transaction Details */}
          <div>
            <h4 className="font-semibold text-sm text-gray-700 mb-3">
              Transaction Details
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Transaction ID</p>
                <div className="flex items-center gap-2 mt-1">
                  <p className="text-sm text-gray-900 font-mono truncate">
                    {participant.merchantRef}
                  </p>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 shrink-0"
                    onClick={() => handleCopy(participant.merchantRef, 'Transaction ID')}
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-500">Quantity</p>
                <p className="text-sm text-gray-900 mt-1">
                  {participant.quantity} ticket{participant.quantity > 1 ? 's' : ''}
                </p>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-500">Base Amount</p>
                <p className="text-sm text-gray-900 mt-1">
                  IDR {participant.amount.toLocaleString('id-ID')}
                </p>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-500">Total Paid</p>
                <p className="text-sm font-semibold text-gray-900 mt-1">
                  IDR {participant.amountReceived.toLocaleString('id-ID')}
                </p>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-500">Payment Method</p>
                <p className="text-sm text-gray-900 mt-1">
                  {participant.paymentName}
                </p>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-500">Payment Fee</p>
                <p className="text-sm text-gray-900 mt-1">
                  IDR {participant.totalFee.toLocaleString('id-ID')}
                </p>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-500">Created At</p>
                <p className="text-sm text-gray-900 mt-1">
                  {format(
                    new Date(participant.createdAt),
                    'dd MMM yyyy HH:mm',
                    { locale: idLocale }
                  )}
                </p>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-500">Paid At</p>
                <p className="text-sm text-gray-900 mt-1">
                  {participant.paidAt
                    ? format(new Date(participant.paidAt), 'dd MMM yyyy HH:mm', {
                        locale: idLocale,
                      })
                    : '-'}
                </p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Contact Information */}
          <div>
            <h4 className="font-semibold text-sm text-gray-700 mb-3">
              Contact Information
            </h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <Mail className="h-4 w-4 text-gray-500 shrink-0" />
                  <span className="text-sm text-gray-900 truncate">{user.email}</span>
                </div>
                <div className="flex gap-1 shrink-0">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8"
                    onClick={() => handleCopy(user.email, 'Email')}
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8"
                    onClick={() => window.open(`mailto:${user.email}`)}
                  >
                    <Mail className="h-3 w-3" />
                  </Button>
                </div>
              </div>

              {(participant.customerPhone || user.phoneNumber) && (
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-900">
                      {participant.customerPhone || user.phoneNumber}
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8"
                    onClick={() =>
                      handleCopy(
                        participant.customerPhone || user.phoneNumber || '',
                        'Phone'
                      )
                    }
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Persona Profile (if available) */}
          {user.personalityResult && (
            <>
              <Separator />
              <div>
                <h4 className="font-semibold text-sm text-gray-700 mb-3">
                  Persona Profile
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-purple-50 rounded-lg">
                    <p className="text-xs font-medium text-gray-500">Archetype</p>
                    <p className="text-sm font-semibold text-purple-700 mt-1">
                      {user.personalityResult.archetype}
                    </p>
                  </div>
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <p className="text-xs font-medium text-gray-500">Score</p>
                    <p className="text-sm font-semibold text-blue-700 mt-1">
                      {user.personalityResult.profileScore.toFixed(1)}
                    </p>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}