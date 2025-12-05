"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { io, Socket } from "socket.io-client";
import { useAuthStore } from "@/store/auth-store";
import { useQueryClient } from "@tanstack/react-query";
import type {
  XenditWebSocketEvent,
  XenditTransactionStatus,
} from "@/types/xendit.types";
import { xenditKeys } from "./use-xendit";
import { toast } from "sonner";

// SOCKET CONNECTION MANAGER (Singleton)
class XenditSocketManager {
  private static instance: XenditSocketManager;
  private socket: Socket | null = null;
  private connectionPromise: Promise<Socket> | null = null;
  private subscribers = new Map<
    string,
    Set<(event: XenditWebSocketEvent) => void>
  >();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

  private constructor() {}

  static getInstance(): XenditSocketManager {
    if (!XenditSocketManager.instance) {
      XenditSocketManager.instance = new XenditSocketManager();
    }
    return XenditSocketManager.instance;
  }

  async connect(): Promise<Socket> {
    // Return existing socket if connected
    if (this.socket?.connected) {
      return this.socket;
    }

    // Return existing connection promise if connecting
    if (this.connectionPromise) {
      return this.connectionPromise;
    }

    // Start new connection
    this.connectionPromise = this.createConnection();
    return this.connectionPromise;
  }

  private async createConnection(): Promise<Socket> {
    return new Promise((resolve, reject) => {
      try {
        const apiEnv = process.env.NEXT_PUBLIC_API_URL;
        let origin: string;

        try {
          origin = apiEnv ? new URL(apiEnv).origin : window.location.origin;
        } catch {
          origin = window.location.origin;
        }

        const namespaceUrl = `${origin}/payment`;

        console.log("🔌 [Xendit Socket] Connecting to:", namespaceUrl);

        this.socket = io(namespaceUrl, {
          withCredentials: true,
          transports: ["websocket"],
          reconnection: true,
          reconnectionAttempts: this.maxReconnectAttempts,
          reconnectionDelay: 1000,
          reconnectionDelayMax: 5000,
          timeout: 20000,
        });

        this.socket.on("connect", () => {
          console.log("✅ [Xendit Socket] Connected:", this.socket?.id);
          this.reconnectAttempts = 0;
          this.connectionPromise = null;
          resolve(this.socket!);
        });

        this.socket.on("connected", (data) => {
          console.log("🔌 [Xendit Socket] Connection confirmed:", data);
        });

        this.socket.on("connect_error", (error) => {
          console.error("❌ [Xendit Socket] Connection error:", error.message);
          this.reconnectAttempts++;

          if (this.reconnectAttempts >= this.maxReconnectAttempts) {
            this.connectionPromise = null;
            reject(new Error("Max reconnection attempts reached"));
          }
        });

        this.socket.on("disconnect", (reason) => {
          console.log("❌ [Xendit Socket] Disconnected:", reason);
          this.connectionPromise = null;
        });

        this.socket.on("auth_error", (data) => {
          console.error("❌ [Xendit Socket] Auth error:", data);
          this.disconnect();
          reject(new Error(data.message));
        });

        // Setup event listeners
        this.setupEventListeners();
      } catch (error) {
        this.connectionPromise = null;
        reject(error);
      }
    });
  }

  private setupEventListeners() {
    if (!this.socket) return;

    const events = [
      "payment:update",
      "payment:status-update",
      "payment:success",
      "payment:failed",
      "payment:expired",
      "payment:countdown",
    ];

    events.forEach((eventName) => {
      this.socket!.on(eventName, (data: XenditWebSocketEvent) => {
        console.log(`💳 [Xendit Socket] ${eventName}:`, data);

        // Notify subscribers for this transaction
        const transactionId = data.transactionId;
        if (transactionId) {
          const callbacks = this.subscribers.get(transactionId);
          callbacks?.forEach((callback) =>
            callback({ ...data, type: eventName as any })
          );
        }

        // Also notify global subscribers
        const globalCallbacks = this.subscribers.get("*");
        globalCallbacks?.forEach((callback) =>
          callback({ ...data, type: eventName as any })
        );
      });
    });
  }

  subscribe(
    transactionId: string,
    callback: (event: XenditWebSocketEvent) => void
  ): () => void {
    if (!this.subscribers.has(transactionId)) {
      this.subscribers.set(transactionId, new Set());
    }
    this.subscribers.get(transactionId)!.add(callback);

    // Subscribe to payment updates via socket
    if (this.socket?.connected && transactionId !== "*") {
      this.socket.emit(
        "subscribe:payment",
        { transactionId },
        (response: any) => {
          console.log("📡 [Xendit Socket] Subscribe response:", response);
        }
      );
    }

    // Return unsubscribe function
    return () => {
      const callbacks = this.subscribers.get(transactionId);
      if (callbacks) {
        callbacks.delete(callback);
        if (callbacks.size === 0) {
          this.subscribers.delete(transactionId);

          // Unsubscribe from socket
          if (this.socket?.connected && transactionId !== "*") {
            this.socket.emit("unsubscribe:payment", { transactionId });
          }
        }
      }
    };
  }

  disconnect() {
    if (this.socket) {
      this.socket.removeAllListeners();
      this.socket.disconnect();
      this.socket = null;
    }
    this.connectionPromise = null;
    this.subscribers.clear();
    this.reconnectAttempts = 0;
  }

  isConnected(): boolean {
    return this.socket?.connected ?? false;
  }

  getSocket(): Socket | null {
    return this.socket;
  }
}

// HOOK OPTIONS
interface UseXenditSocketOptions {
  transactionId?: string;
  onPaymentUpdate?: (event: XenditWebSocketEvent) => void;
  onPaymentSuccess?: (event: XenditWebSocketEvent) => void;
  onPaymentFailed?: (event: XenditWebSocketEvent) => void;
  onPaymentExpired?: (event: XenditWebSocketEvent) => void;
  onCountdown?: (timeRemaining: number) => void;
  enabled?: boolean;
  showToasts?: boolean;
  autoInvalidate?: boolean;
}

// MAIN HOOK
export function useXenditSocket(options: UseXenditSocketOptions = {}) {
  const {
    transactionId,
    onPaymentUpdate,
    onPaymentSuccess,
    onPaymentFailed,
    onPaymentExpired,
    onCountdown,
    enabled = true,
    showToasts = true,
    autoInvalidate = true,
  } = options;

  const { user, isHydrated } = useAuthStore();
  const queryClient = useQueryClient();
  const [isConnected, setIsConnected] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const unsubscribeRef = useRef<(() => void) | null>(null);
  const socketManager = XenditSocketManager.getInstance();

  // Event handler
  const handleEvent = useCallback(
    (event: XenditWebSocketEvent) => {
      // Auto invalidate queries
      if (autoInvalidate && event.transactionId) {
        queryClient.invalidateQueries({
          queryKey: xenditKeys.transaction(event.transactionId),
        });
        queryClient.invalidateQueries({
          queryKey: xenditKeys.transactions(),
        });
      }

      switch (event.type) {
        case "payment:update":
        case "payment:status-update":
          onPaymentUpdate?.(event);
          break;

        case "payment:success":
          onPaymentSuccess?.(event);
          if (showToasts) {
            toast.success("Pembayaran berhasil!  🎉", {
              description: "Terima kasih atas pembayaran Anda",
            });
          }
          break;

        case "payment:failed":
          onPaymentFailed?.(event);
          if (showToasts) {
            toast.error("Pembayaran gagal", {
              description: event.message || "Silakan coba lagi",
            });
          }
          break;

        case "payment:expired":
          onPaymentExpired?.(event);
          if (showToasts) {
            toast.error("Pembayaran kadaluarsa", {
              description: "Waktu pembayaran telah habis",
            });
          }
          break;

        case "payment:countdown":
          if (event.timeRemaining !== undefined) {
            onCountdown?.(event.timeRemaining);
          }
          break;
      }
    },
    [
      onPaymentUpdate,
      onPaymentSuccess,
      onPaymentFailed,
      onPaymentExpired,
      onCountdown,
      showToasts,
      autoInvalidate,
      queryClient,
    ]
  );

  // Connect and subscribe effect
  useEffect(() => {
    if (!enabled || !isHydrated || !user) {
      console.log("❌ [Xendit Socket] Disabled - conditions not met");
      return;
    }

    let mounted = true;

    const setup = async () => {
      try {
        await socketManager.connect();

        if (!mounted) return;

        setIsConnected(true);

        // Subscribe to transaction if provided
        if (transactionId) {
          unsubscribeRef.current = socketManager.subscribe(
            transactionId,
            handleEvent
          );
          setIsSubscribed(true);
        }
      } catch (error) {
        console.error("[Xendit Socket] Failed to setup:", error);
        if (mounted) {
          setIsConnected(false);
          setIsSubscribed(false);
        }
      }
    };

    setup();

    // Connection status check interval
    const statusInterval = setInterval(() => {
      if (mounted) {
        setIsConnected(socketManager.isConnected());
      }
    }, 5000);

    return () => {
      mounted = false;
      clearInterval(statusInterval);

      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }

      setIsSubscribed(false);
    };
  }, [enabled, isHydrated, user?.id, transactionId, handleEvent]);

  // Manual disconnect function
  const disconnect = useCallback(() => {
    socketManager.disconnect();
    setIsConnected(false);
    setIsSubscribed(false);
  }, []);

  return {
    isConnected,
    isSubscribed,
    disconnect,
  };
}

// GLOBAL SOCKET HOOK (for app-wide listening)
export function useXenditSocketGlobal(
  onEvent?: (event: XenditWebSocketEvent) => void
) {
  const { user, isHydrated } = useAuthStore();
  const [isConnected, setIsConnected] = useState(false);
  const socketManager = XenditSocketManager.getInstance();

  useEffect(() => {
    if (!isHydrated || !user) return;

    let mounted = true;

    const setup = async () => {
      try {
        await socketManager.connect();
        if (mounted) setIsConnected(true);
      } catch (error) {
        console.error("[Xendit Socket Global] Failed to connect:", error);
      }
    };

    setup();

    // Subscribe to all events
    const unsubscribe = onEvent
      ? socketManager.subscribe("*", onEvent)
      : undefined;

    return () => {
      mounted = false;
      unsubscribe?.();
    };
  }, [isHydrated, user?.id, onEvent]);

  return { isConnected };
}
