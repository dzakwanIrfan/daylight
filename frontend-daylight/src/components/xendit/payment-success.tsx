"use client";

import { useEffect, useState } from "react";
import {
  CheckCircle2,
  PartyPopper,
  Calendar,
  MapPin,
  Ticket,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import confetti from "canvas-confetti";

interface PaymentSuccessProps {
  eventTitle?: string;
  eventDate?: string;
  eventVenue?: string;
  transactionId: string;
  onContinue?: () => void;
  className?: string;
}

export function XenditPaymentSuccess({
  eventTitle,
  eventDate,
  eventVenue,
  transactionId,
  onContinue,
  className,
}: PaymentSuccessProps) {
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    // Trigger confetti
    const duration = 3 * 1000;
    const animationEnd = Date.now() + duration;

    const randomInRange = (min: number, max: number) => {
      return Math.random() * (max - min) + min;
    };

    const interval = setInterval(() => {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        clearInterval(interval);
        return;
      }

      const particleCount = 50 * (timeLeft / duration);

      confetti({
        particleCount,
        startVelocity: 30,
        spread: 360,
        origin: {
          x: randomInRange(0.1, 0.3),
          y: Math.random() - 0.2,
        },
        colors: ["#F97316", "#22C55E", "#3B82F6", "#EAB308", "#EC4899"],
      });

      confetti({
        particleCount,
        startVelocity: 30,
        spread: 360,
        origin: {
          x: randomInRange(0.7, 0.9),
          y: Math.random() - 0.2,
        },
        colors: ["#F97316", "#22C55E", "#3B82F6", "#EAB308", "#EC4899"],
      });
    }, 250);

    setTimeout(() => setShowContent(true), 500);

    return () => clearInterval(interval);
  }, []);

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center py-8 sm:py-12 px-4 sm:px-6",
        className
      )}
    >
      {/* Success Icon */}
      <div
        className={cn(
          "relative mb-5 sm:mb-6 transition-all duration-700",
          showContent ? "scale-100 opacity-100" : "scale-50 opacity-0"
        )}
      >
        <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-green-100 flex items-center justify-center">
          <CheckCircle2 className="w-10 h-10 sm:w-14 sm:h-14 text-green-500" />
        </div>
        <div className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2">
          <PartyPopper className="w-6 h-6 sm:w-8 sm:h-8 text-yellow-500" />
        </div>
      </div>

      {/* Title */}
      <div
        className={cn(
          "transition-all duration-700 delay-200",
          showContent ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
        )}
      >
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1.5 sm:mb-2">
          Pembayaran Berhasil!
        </h1>
        <p className="text-sm sm:text-base text-gray-600 mb-6 sm:mb-8 max-w-xs mx-auto">
          Tiket kamu sudah dikonfirmasi. Sampai jumpa di event!
        </p>
      </div>

      {/* Event Card */}
      {eventTitle && (
        <Card
          className={cn(
            "w-full max-w-sm sm:max-w-md mb-6 sm:mb-8 transition-all duration-700 delay-400",
            showContent
              ? "translate-y-0 opacity-100"
              : "translate-y-4 opacity-0"
          )}
        >
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-brand/10 flex items-center justify-center shrink-0">
                <Ticket className="w-5 h-5 sm:w-6 sm:h-6 text-brand" />
              </div>
              <div className="text-left min-w-0">
                <h3 className="font-semibold text-sm sm:text-base text-gray-900 truncate">
                  {eventTitle}
                </h3>
                <p className="text-xs text-gray-500">Tiket Dikonfirmasi</p>
              </div>
            </div>

            <div className="space-y-2 text-xs sm:text-sm">
              {eventDate && (
                <div className="flex items-center gap-2 text-gray-600">
                  <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400 shrink-0" />
                  <span className="truncate">{eventDate}</span>
                </div>
              )}
              {eventVenue && (
                <div className="flex items-center gap-2 text-gray-600">
                  <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400 shrink-0" />
                  <span className="truncate">{eventVenue}</span>
                </div>
              )}
            </div>

            <div className="mt-4 pt-4 border-t border-gray-100">
              <p className="text-xs text-gray-500">
                ID Transaksi:{" "}
                <span className="font-mono text-gray-700">{transactionId}</span>
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* CTA Button */}
      <div
        className={cn(
          "w-full max-w-sm sm:max-w-md transition-all duration-700 delay-600",
          showContent ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
        )}
      >
        <Button
          onClick={onContinue}
          size="lg"
          className="w-full h-11 sm:h-12 text-sm sm:text-base"
        >
          Lihat Event Saya
        </Button>
      </div>
    </div>
  );
}
