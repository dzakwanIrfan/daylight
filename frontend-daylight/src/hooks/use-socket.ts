'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '@/store/auth-store';

interface UseSocketOptions {
  namespace?: string;
  autoConnect?: boolean;
  onConnect?: () => void;
  onDisconnect?: () => void;
  onError?: (error: Error) => void;
}

// Singleton socket instances per namespace
const socketInstances = new Map<string, Socket>();
const connectionStates = new Map<string, boolean>();
const listenerCounts = new Map<string, number>();

function getSocketInstance(namespace: string): Socket | null {
  return socketInstances.get(namespace) || null;
}

function createSocketInstance(namespace: string): Socket {
  const existingSocket = socketInstances.get(namespace);
  if (existingSocket) {
    return existingSocket;
  }

  const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:3000';
  const fullUrl = `${wsUrl}${namespace}`;

  console.log('🔌 Creating new socket connection to:', fullUrl);

  const socket = io(fullUrl, {
    withCredentials: true,
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    reconnectionAttempts: Infinity,
    timeout: 20000,
    autoConnect: true,
  });

  socketInstances.set(namespace, socket);
  connectionStates. set(namespace, false);
  listenerCounts.set(namespace, 0);

  // Global connection handlers
  socket.on('connect', () => {
    console. log(`✅ Socket connected [${namespace}]:`, socket.id);
    connectionStates.set(namespace, true);
  });

  socket. on('disconnect', (reason) => {
    console.log(`❌ Socket disconnected [${namespace}]:`, reason);
    connectionStates. set(namespace, false);
  });

  socket. on('connect_error', (error) => {
    console.error(`❌ Socket connection error [${namespace}]:`, error. message);
  });

  socket. io.on('reconnect', (attemptNumber) => {
    console.log(`🔄 Socket reconnected [${namespace}] after ${attemptNumber} attempts`);
    connectionStates.set(namespace, true);
  });

  return socket;
}

export function useSocket(options: UseSocketOptions = {}) {
  const { namespace = '/chat', autoConnect = true } = options;

  const { isAuthenticated } = useAuthStore();
  const [isConnected, setIsConnected] = useState(() => {
    return connectionStates.get(namespace) || false;
  });
  const [isConnecting, setIsConnecting] = useState(false);
  const mountedRef = useRef(true);
  const currentNamespace = useRef(namespace);

  // Stable callback refs
  const onConnectRef = useRef(options.onConnect);
  const onDisconnectRef = useRef(options.onDisconnect);
  const onErrorRef = useRef(options. onError);

  useEffect(() => {
    onConnectRef.current = options.onConnect;
    onDisconnectRef.current = options.onDisconnect;
    onErrorRef.current = options.onError;
  }, [options. onConnect, options. onDisconnect, options.onError]);

  // Emit function - gets fresh socket reference
  const emit = useCallback(
    (event: string, data: any, callback?: (response: any) => void) => {
      const socket = getSocketInstance(currentNamespace.current);

      if (! socket?. connected) {
        console.warn('⚠️ Socket not connected.  Cannot emit:', event);
        return;
      }

      if (callback) {
        socket.emit(event, data, callback);
      } else {
        socket. emit(event, data);
      }
    },
    []
  );

  // On function - registers listener on the actual socket
  const on = useCallback((event: string, handler: (...args: any[]) => void) => {
    const socket = getSocketInstance(currentNamespace.current);
    if (! socket) {
      console.warn('⚠️ Socket not available for event:', event);
      return;
    }

    socket. on(event, handler);
  }, []);

  // Off function - removes listener from the actual socket
  const off = useCallback((event: string, handler?: (...args: any[]) => void) => {
    const socket = getSocketInstance(currentNamespace. current);
    if (!socket) return;

    if (handler) {
      socket.off(event, handler);
    } else {
      socket.off(event);
    }
  }, []);

  // Initialize socket connection
  useEffect(() => {
    mountedRef.current = true;
    currentNamespace.current = namespace;

    const authCheck = isAuthenticated();

    if (! authCheck || !autoConnect) {
      return;
    }

    // Get or create socket
    let socket = getSocketInstance(namespace);

    if (!socket) {
      socket = createSocketInstance(namespace);
      setIsConnecting(true);
    }

    // Increment listener count
    listenerCounts.set(namespace, (listenerCounts. get(namespace) || 0) + 1);

    // If already connected, update state
    if (socket.connected) {
      setIsConnected(true);
      setIsConnecting(false);
    }

    // Connection handlers for this hook instance
    const handleConnect = () => {
      if (mountedRef.current) {
        setIsConnected(true);
        setIsConnecting(false);
        onConnectRef.current?.();
      }
    };

    const handleDisconnect = () => {
      if (mountedRef.current) {
        setIsConnected(false);
        setIsConnecting(false);
        onDisconnectRef.current?.();
      }
    };

    const handleConnectError = (error: Error) => {
      if (mountedRef.current) {
        setIsConnecting(false);
        onErrorRef.current?.(error);
      }
    };

    socket.on('connect', handleConnect);
    socket. on('disconnect', handleDisconnect);
    socket.on('connect_error', handleConnectError);

    // Connect if not connected
    if (!socket.connected) {
      socket.connect();
    }

    // Cleanup
    return () => {
      mountedRef.current = false;

      socket?. off('connect', handleConnect);
      socket?.off('disconnect', handleDisconnect);
      socket?.off('connect_error', handleConnectError);

      // Decrement listener count
      const count = (listenerCounts. get(namespace) || 1) - 1;
      listenerCounts.set(namespace, count);
    };
  }, [namespace, autoConnect, isAuthenticated]);

  // Sync connection state
  useEffect(() => {
    const checkConnection = () => {
      const socket = getSocketInstance(namespace);
      const connected = socket?.connected || false;

      if (connected !== isConnected && mountedRef.current) {
        setIsConnected(connected);
      }
    };

    const interval = setInterval(checkConnection, 1000);
    checkConnection();

    return () => clearInterval(interval);
  }, [namespace, isConnected]);

  return {
    socket: getSocketInstance(namespace),
    isConnected,
    isConnecting,
    emit,
    on,
    off,
  };
}

// Utility function to disconnect all sockets (call on logout)
export function disconnectAllSockets() {
  socketInstances.forEach((socket, namespace) => {
    console.log('🔌 Disconnecting socket:', namespace);
    socket.removeAllListeners();
    socket.disconnect();
  });
  socketInstances.clear();
  connectionStates.clear();
  listenerCounts. clear();
}

// Utility to get socket directly
export function getSocket(namespace: string = '/chat'): Socket | null {
  return getSocketInstance(namespace);
}