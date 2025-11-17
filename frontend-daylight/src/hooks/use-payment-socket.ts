'use client';

import { useEffect, useRef, useState } from 'react';
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

  // Ambil user & isHydrated dari store (bukan function isAuthenticated lagi)
  const user = useAuthStore((state) => state.user);
  const isHydrated = useAuthStore((state) => state.isHydrated);

  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const hasSetupRef = useRef(false);

  // Setup / teardown socket
  useEffect(() => {
    const authenticated = isHydrated && !!user;

    if (!enabled || !authenticated) {
      console.log('❌ Socket disabled (not authenticated or disabled)', {
        enabled,
        authenticated,
        isHydrated,
        hasUser: !!user,
      });
      return;
    }

    // Prevent double setup
    if (hasSetupRef.current) {
      console.log('ℹ️ Socket already setup');
      return;
    }

    console.log('🔌 Setting up socket...');
    hasSetupRef.current = true;

    const baseUrl =
      process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') ?? '';

    // Socket pakai cookie HttpOnly (withCredentials: true)
    const socket = io(`${baseUrl}/payment`, {
      withCredentials: true,
      transports: ['websocket'],
      reconnection: false,
    });

    // Connection handlers
    socket.on('connect', () => {
      console.log('✅ Socket connected:', socket.id);
      setIsConnected(true);
    });

    socket.on('connected', (data) => {
      console.log('🔌 Connection confirmed:', data);
    });

    socket.on('disconnect', () => {
      console.log('❌ Socket disconnected');
      setIsConnected(false);
      setIsSubscribed(false);
    });

    socket.on('auth_error', (data) => {
      console.error('❌ Auth error:', data);
      socket.disconnect();
    });

    // Payment events
    socket.on('payment:update', (data: PaymentWebSocketEvent) => {
      console.log('💳 Payment update:', data);
      onPaymentUpdate?.(data);
    });

    socket.on('payment:status-update', (data: PaymentWebSocketEvent) => {
      console.log('🔄 Status update:', data);
      onPaymentUpdate?.(data);
    });

    socket.on('payment:success', (data: PaymentWebSocketEvent) => {
      console.log('✅ Payment success:', data);
      onPaymentSuccess?.(data);
      toast.success('Pembayaran berhasil! 🎉');
    });

    socket.on('payment:failed', (data: PaymentWebSocketEvent) => {
      console.log('❌ Payment failed:', data);
      onPaymentFailed?.(data);
      toast.error('Pembayaran gagal');
    });

    socket.on('payment:expired', (data: PaymentWebSocketEvent) => {
      console.log('⏰ Payment expired:', data);
      onPaymentExpired?.(data);
      toast.error('Pembayaran kadaluarsa');
    });

    socket.on('payment:countdown', (data: PaymentWebSocketEvent) => {
      if (data.timeRemaining !== undefined) {
        onCountdown?.(data.timeRemaining);
      }
    });

    socketRef.current = socket;

    // Cleanup
    return () => {
      console.log('🔌 Cleaning up socket...');
      if (socketRef.current) {
        socketRef.current.removeAllListeners();
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      hasSetupRef.current = false;
      setIsConnected(false);
      setIsSubscribed(false);
    };
    // effect akan re-run kalau user login/logout atau hydration selesai
  }, [enabled, user, isHydrated, onPaymentUpdate, onPaymentSuccess, onPaymentFailed, onPaymentExpired, onCountdown]);

  // Handle subscription ke transactionId
  useEffect(() => {
    if (!transactionId || !isConnected || isSubscribed) {
      return;
    }

    console.log('📡 Subscribing to:', transactionId);

    socketRef.current?.emit(
      'subscribe:payment',
      { transactionId },
      (response: any) => {
        console.log('📡 Subscribe response:', response);
        if (response?.success) {
          setIsSubscribed(true);
        }
      }
    );

    return () => {
      if (isSubscribed && transactionId) {
        console.log('📴 Unsubscribing from:', transactionId);
        socketRef.current?.emit('unsubscribe:payment', { transactionId });
        setIsSubscribed(false);
      }
    };
  }, [transactionId, isConnected, isSubscribed]);

  return {
    isConnected,
    isSubscribed,
  };
}
