'use client';

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { PaymentMethod } from '@/types/payment-method.types';
import { usePaymentMethodMutations } from '@/hooks/use-payment-methods';
import { Loader2, AlertTriangle } from 'lucide-react';
import { useEffect } from 'react';

interface DeletePaymentMethodDialogProps {
    method: PaymentMethod;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function DeletePaymentMethodDialog({
    method,
    open,
    onOpenChange,
}: DeletePaymentMethodDialogProps) {
    const { deletePaymentMethod } = usePaymentMethodMutations();

    // Close dialog on success
    useEffect(() => {
        if (deletePaymentMethod.isSuccess) {
            onOpenChange(false);
        }
    }, [deletePaymentMethod.isSuccess, onOpenChange]);

    const handleDelete = () => {
        deletePaymentMethod.mutate(method.code);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px] bg-white">
                <DialogHeader>
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100">
                            <AlertTriangle className="h-5 w-5 text-red-600" />
                        </div>
                        <DialogTitle>Delete Payment Method</DialogTitle>
                    </div>
                    <DialogDescription className="pt-3">
                        Are you sure you want to delete <strong>{method.name}</strong> (
                        {method.code})?  This action cannot be undone.
                    </DialogDescription>
                </DialogHeader>

                <div className="rounded-lg bg-amber-50 border border-amber-200 p-4 my-4">
                    <p className="text-sm text-amber-800">
                        <strong>Warning:</strong> If this payment method has existing
                        transactions, the deletion will fail. You should deactivate it
                        instead.
                    </p>
                </div>

                <DialogFooter>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        disabled={deletePaymentMethod.isPending}
                    >
                        Cancel
                    </Button>
                    <Button
                        type="button"
                        variant="destructive"
                        onClick={handleDelete}
                        disabled={deletePaymentMethod.isPending}
                    >
                        {deletePaymentMethod.isPending && (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        )}
                        Delete
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}