'use client';

import { useEffect, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '@/store/auth-store';
import { PaymentWebSocketEvent } from '@/types/payment.types';
import { toast } from 'sonner';

interface UsePaymentSocketOptions {
  transactionId?: string;
  onPaymentUpdate?: (event: PaymentWebSocketEvent) => void;
  onPaymentSuccess?: (event: PaymentWebSocketEvent) => void;
  onPaymentFailed?: (event: PaymentWebSocketEvent) => void;
  onPaymentExpired?: (event: PaymentWebSocketEvent) => void;
  onCountdown?: (timeRemaining: number) => void;
  enabled?: boolean;
}

export function usePaymentSocket(options: UsePaymentSocketOptions = {}) {
  const {
    transactionId,
    onPaymentUpdate,
    onPaymentSuccess,
    onPaymentFailed,
    onPaymentExpired,
    onCountdown,
    enabled = true,
  } = options;

  const { accessToken, isAuthenticated } = useAuthStore();
  const socketRef = useRef<Socket | null>(null);
  const isConnectingRef = useRef(false);
  const hasSubscribedRef = useRef(false);
  
  // Store callbacks in refs to avoid recreating socket connection
  const callbacksRef = useRef({
    onPaymentUpdate,
    onPaymentSuccess,
    onPaymentFailed,
    onPaymentExpired,
    onCountdown,
  });

  // Update callbacks ref when they change
  useEffect(() => {
    callbacksRef.current = {
      onPaymentUpdate,
      onPaymentSuccess,
      onPaymentFailed,
      onPaymentExpired,
      onCountdown,
    };
  }, [onPaymentUpdate, onPaymentSuccess, onPaymentFailed, onPaymentExpired, onCountdown]);

  const subscribeToTransaction = useCallback((txId: string) => {
    if (!socketRef.current?.connected) {
      console.warn('⚠️ Socket not connected, cannot subscribe');
      return;
    }

    if (hasSubscribedRef.current) {
      console.log('ℹ️ Already subscribed to transaction');
      return;
    }

    console.log('📡 Subscribing to transaction:', txId);
    socketRef.current.emit(
      'subscribe:payment',
      { transactionId: txId },
      (response: any) => {
        console.log('📡 Subscribed to transaction:', response);
        hasSubscribedRef.current = true;
      }
    );
  }, []);

  const unsubscribeFromTransaction = useCallback((txId: string) => {
    if (!socketRef.current?.connected || !hasSubscribedRef.current) {
      return;
    }

    console.log('📴 Unsubscribing from transaction:', txId);
    socketRef.current.emit(
      'unsubscribe:payment',
      { transactionId: txId },
      (response: any) => {
        console.log('📴 Unsubscribed from transaction:', response);
        hasSubscribedRef.current = false;
      }
    );
  }, []);

  useEffect(() => {
    // Don't connect if disabled or not authenticated
    if (!enabled || !isAuthenticated() || !accessToken) {
      console.log('❌ WebSocket not connecting:', { enabled, authenticated: isAuthenticated() });
      return;
    }

    // Prevent multiple simultaneous connections
    if (isConnectingRef.current || socketRef.current?.connected) {
      console.log('ℹ️ WebSocket already connecting or connected');
      return;
    }

    isConnectingRef.current = true;
    console.log('🔌 Initiating WebSocket connection...');

    const socket = io(
      `${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '')}/payment`,
      {
        auth: { token: accessToken },
        transports: ['websocket'],
        autoConnect: false, // Manual connect
        reconnection: false, // Disable auto-reconnect to prevent loops
      }
    );

    // Setup event listeners
    socket.on('connect', () => {
      console.log('✅ Payment WebSocket connected:', socket.id);
      isConnectingRef.current = false;
    });

    socket.on('connected', (data) => {
      console.log('🔌 Payment WebSocket confirmed:', data);
      
      // Auto-subscribe if transaction ID is available
      if (transactionId && !hasSubscribedRef.current) {
        setTimeout(() => subscribeToTransaction(transactionId), 500);
      }
    });

    socket.on('disconnect', (reason) => {
      console.log('❌ Payment WebSocket disconnected:', reason);
      isConnectingRef.current = false;
      hasSubscribedRef.current = false;
    });

    socket.on('connect_error', (err) => {
      console.error('❌ Payment WebSocket error:', err.message);
      isConnectingRef.current = false;
    });

    // Payment events - use callback refs
    socket.on('payment:update', (data: PaymentWebSocketEvent) => {
      console.log('💳 Payment update:', data);
      callbacksRef.current.onPaymentUpdate?.(data);
    });

    socket.on('payment:status-update', (data: PaymentWebSocketEvent) => {
      console.log('🔄 Payment status update:', data);
      callbacksRef.current.onPaymentUpdate?.(data);
      toast.info(data.message || 'Payment status updated');
    });

    socket.on('payment:success', (data: PaymentWebSocketEvent) => {
      console.log('✅ Payment success:', data);
      callbacksRef.current.onPaymentSuccess?.(data);
      toast.success(data.message || 'Payment successful! 🎉');
    });

    socket.on('payment:failed', (data: PaymentWebSocketEvent) => {
      console.log('❌ Payment failed:', data);
      callbacksRef.current.onPaymentFailed?.(data);
      toast.error(data.message || 'Payment failed');
    });

    socket.on('payment:expired', (data: PaymentWebSocketEvent) => {
      console.log('⏰ Payment expired:', data);
      callbacksRef.current.onPaymentExpired?.(data);
      toast.error(data.message || 'Payment expired');
    });

    socket.on('payment:countdown', (data: PaymentWebSocketEvent) => {
      if (data.timeRemaining !== undefined) {
        callbacksRef.current.onCountdown?.(data.timeRemaining);
      }
    });

    socket.on('payment:warning', (data: PaymentWebSocketEvent) => {
      toast.warning(data.message || 'Payment expiring soon!');
    });

    socket.on('payment:urgent', (data: PaymentWebSocketEvent) => {
      toast.error(data.message || 'Payment expiring very soon!', {
        duration: 10000,
      });
    });

    socketRef.current = socket;
    
    // Connect after setup
    socket.connect();

    // Cleanup
    return () => {
      console.log('🔌 Cleaning up WebSocket connection...');
      
      if (transactionId && hasSubscribedRef.current) {
        unsubscribeFromTransaction(transactionId);
      }

      if (socketRef.current) {
        socketRef.current.removeAllListeners();
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      
      isConnectingRef.current = false;
      hasSubscribedRef.current = false;
    };
  }, [enabled, accessToken, isAuthenticated]); // Minimal dependencies

  // Handle transaction subscription separately
  useEffect(() => {
    if (transactionId && socketRef.current?.connected && !hasSubscribedRef.current) {
      const timer = setTimeout(() => {
        subscribeToTransaction(transactionId);
      }, 500);

      return () => {
        clearTimeout(timer);
        if (hasSubscribedRef.current) {
          unsubscribeFromTransaction(transactionId);
        }
      };
    }
  }, [transactionId, subscribeToTransaction, unsubscribeFromTransaction]);

  return {
    isConnected: socketRef.current?.connected || false,
    subscribeToTransaction,
    unsubscribeFromTransaction,
  };
}