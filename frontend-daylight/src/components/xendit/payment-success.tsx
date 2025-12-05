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

    // Show content with delay
    setTimeout(() => setShowContent(true), 500);

    return () => clearInterval(interval);
  }, []);

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center py-12 px-6",
        className
      )}
    >
      {/* Success Icon */}
      <div
        className={cn(
          "relative mb-6 transition-all duration-700",
          showContent ? "scale-100 opacity-100" : "scale-50 opacity-0"
        )}
      >
        <div className="w-24 h-24 rounded-full bg-green-100 flex items-center justify-center">
          <CheckCircle2 className="w-14 h-14 text-green-500" />
        </div>
        <div className="absolute -top-2 -right-2">
          <PartyPopper className="w-8 h-8 text-yellow-500" />
        </div>
      </div>

      {/* Title */}
      <div
        className={cn(
          "transition-all duration-700 delay-200",
          showContent ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
        )}
      >
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Payment Successful! 🎉
        </h1>
        <p className="text-gray-600 mb-8">
          Your ticket has been confirmed. See you at the event!
        </p>
      </div>

      {/* Event Card */}
      {eventTitle && (
        <div
          className={cn(
            "w-full max-w-md bg-white border border-gray-200 rounded-2xl p-6 mb-8 transition-all duration-700 delay-400",
            showContent
              ? "translate-y-0 opacity-100"
              : "translate-y-4 opacity-0"
          )}
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-brand/10 flex items-center justify-center">
              <Ticket className="w-6 h-6 text-brand" />
            </div>
            <div className="text-left">
              <h3 className="font-semibold text-gray-900">{eventTitle}</h3>
              <p className="text-xs text-gray-500">Ticket Confirmed</p>
            </div>
          </div>

          <div className="space-y-2 text-sm">
            {eventDate && (
              <div className="flex items-center gap-2 text-gray-600">
                <Calendar className="w-4 h-4 text-gray-400" />
                <span>{eventDate}</span>
              </div>
            )}
            {eventVenue && (
              <div className="flex items-center gap-2 text-gray-600">
                <MapPin className="w-4 h-4 text-gray-400" />
                <span>{eventVenue}</span>
              </div>
            )}
          </div>

          <div className="mt-4 pt-4 border-t border-gray-100">
            <p className="text-xs text-gray-500">
              Transaction ID: <span className="font-mono">{transactionId}</span>
            </p>
          </div>
        </div>
      )}

      {/* CTA Button */}
      <div
        className={cn(
          "w-full max-w-md transition-all duration-700 delay-600",
          showContent ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
        )}
      >
        <button
          onClick={onContinue}
          className="w-full bg-brand hover:bg-brand/90 text-white rounded-xl px-6 py-4 font-semibold text-lg transition-all hover:shadow-lg active:scale-[0.98]"
        >
          View My Events
        </button>
      </div>
    </div>
  );
}
