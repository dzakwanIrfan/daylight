'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '@/store/auth-store';
import { toast } from 'sonner';

interface UseSocketOptions {
  namespace?: string;
  autoConnect?: boolean;
  onConnect?: () => void;
  onDisconnect?: () => void;
  onError?: (error: any) => void;
}

export function useSocket(options: UseSocketOptions = {}) {
  const {
    namespace = '/chat',
    autoConnect = true,
  } = options;

  const { isAuthenticated } = useAuthStore();
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const mountedRef = useRef(true);

  // Stable callbacks using useRef to avoid recreating
  const onConnectRef = useRef(options.onConnect);
  const onDisconnectRef = useRef(options.onDisconnect);
  const onErrorRef = useRef(options.onError);

  useEffect(() => {
    onConnectRef.current = options. onConnect;
    onDisconnectRef.current = options.onDisconnect;
    onErrorRef.current = options.onError;
  }, [options.onConnect, options.onDisconnect, options.onError]);

  const emit = useCallback((event: string, data: any, callback?: (response: any) => void) => {
    if (! socketRef.current?. connected) {
      console.warn('⚠️ Socket not connected.  Cannot emit:', event);
      return;
    }

    if (callback) {
      socketRef.current.emit(event, data, callback);
    } else {
      socketRef.current. emit(event, data);
    }
  }, []);

  const on = useCallback((event: string, handler: (...args: any[]) => void) => {
    socketRef.current?.on(event, handler);
  }, []);

  const off = useCallback((event: string, handler?: (...args: any[]) => void) => {
    if (handler) {
      socketRef.current?.off(event, handler);
    } else {
      socketRef.current?.off(event);
    }
  }, []);

  // Initialize socket ONCE
  useEffect(() => {
    // Don't connect if not authenticated
    if (!isAuthenticated() || !autoConnect) {
      return;
    }

    // Prevent multiple connections
    if (socketRef.current) {
      console.log('⚠️ Socket already initialized');
      return;
    }

    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:3000';
    const fullUrl = `${wsUrl}${namespace}`;

    console.log('🔌 Initializing socket connection to:', fullUrl);
    setIsConnecting(true);

    const socket = io(fullUrl, {
      withCredentials: true,
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
      timeout: 10000,
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('✅ Socket connected:', socket.id);
      if (mountedRef.current) {
        setIsConnected(true);
        setIsConnecting(false);
        onConnectRef.current?.();
      }
    });

    socket.on('disconnect', (reason) => {
      console. log('❌ Socket disconnected:', reason);
      if (mountedRef.current) {
        setIsConnected(false);
        setIsConnecting(false);
        onDisconnectRef.current?. ();
      }
    });

    socket.on('connect_error', (error) => {
      console.error('❌ Socket connection error:', error. message);
      if (mountedRef.current) {
        setIsConnecting(false);
        onErrorRef.current?.(error);
      }
    });

    // Cleanup on unmount
    return () => {
      mountedRef.current = false;
      console.log('🔌 Cleaning up socket.. .');
      socket.removeAllListeners();
      socket. disconnect();
      socketRef.current = null;
    };
  }, [namespace, autoConnect, isAuthenticated]); // Only reinitialize if these change

  return {
    socket: socketRef. current,
    isConnected,
    isConnecting,
    emit,
    on,
    off,
  };
}