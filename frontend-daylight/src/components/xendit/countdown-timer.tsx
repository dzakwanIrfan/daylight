"use client";

import { useEffect, useState } from "react";
import { Clock, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

// TYPES
interface CountdownTimerProps {
  expiredAt: string | Date;
  onExpired?: () => void;
  className?: string;
  size?: "sm" | "md" | "lg";
  variant?: "default" | "compact";
}

interface TimeLeft {
  hours: number;
  minutes: number;
  seconds: number;
  total: number;
}

// HELPER
function calculateTimeLeft(expiredAt: string | Date): TimeLeft {
  const now = new Date().getTime();
  const expiry = new Date(expiredAt).getTime();
  const diff = Math.max(0, Math.floor((expiry - now) / 1000));

  return {
    hours: Math.floor(diff / 3600),
    minutes: Math.floor((diff % 3600) / 60),
    seconds: diff % 60,
    total: diff,
  };
}

function formatTimeUnit(value: number): string {
  return value.toString().padStart(2, "0");
}

// TIME UNIT BOX
function TimeUnitBox({
  value,
  label,
  isUrgent,
  size,
}: {
  value: number;
  label: string;
  isUrgent: boolean;
  size: "sm" | "md" | "lg";
}) {
  const sizeClasses = {
    sm: "w-8 h-8 sm:w-9 sm:h-9 text-xs sm:text-sm",
    md: "w-10 h-10 sm:w-12 sm:h-12 text-sm sm:text-base",
    lg: "w-12 h-12 sm:w-14 sm:h-14 text-base sm:text-lg",
  };

  const labelSizes = {
    sm: "text-[9px] sm:text-[10px]",
    md: "text-[10px] sm:text-xs",
    lg: "text-xs sm:text-sm",
  };

  return (
    <div className="flex flex-col items-center gap-0.5 sm:gap-1">
      <div
        className={cn(
          "rounded-lg font-mono font-bold flex items-center justify-center transition-all",
          sizeClasses[size],
          isUrgent
            ? "bg-red-500 text-white"
            : "bg-white/20 text-white backdrop-blur-sm"
        )}
      >
        {formatTimeUnit(value)}
      </div>
      <span
        className={cn(
          "text-white/70 uppercase tracking-wide",
          labelSizes[size]
        )}
      >
        {label}
      </span>
    </div>
  );
}

// MAIN COMPONENT
export function XenditCountdownTimer({
  expiredAt,
  onExpired,
  className,
  size = "md",
  variant = "default",
}: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>(() =>
    calculateTimeLeft(expiredAt)
  );
  const [hasExpired, setHasExpired] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      const newTimeLeft = calculateTimeLeft(expiredAt);
      setTimeLeft(newTimeLeft);

      if (newTimeLeft.total === 0 && !hasExpired) {
        setHasExpired(true);
        onExpired?.();
        clearInterval(timer);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [expiredAt, hasExpired, onExpired]);

  const isUrgent = timeLeft.total > 0 && timeLeft.total <= 300;
  const isWarning = timeLeft.total > 300 && timeLeft.total <= 900;

  if (timeLeft.total === 0) {
    return (
      <div
        className={cn(
          "flex items-center gap-2 bg-red-500/20 backdrop-blur-sm rounded-lg px-3 py-2",
          className
        )}
      >
        <AlertTriangle className="w-4 h-4 text-red-300" />
        <span className="font-medium text-sm text-white">Kadaluarsa</span>
      </div>
    );
  }

  if (variant === "compact") {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        <Clock
          className={cn("w-4 h-4", isUrgent ? "text-red-300" : "text-white/70")}
        />
        <span
          className={cn(
            "font-mono font-semibold text-sm",
            isUrgent ? "text-red-300" : "text-white"
          )}
        >
          {timeLeft.hours > 0 && `${formatTimeUnit(timeLeft.hours)}:`}
          {formatTimeUnit(timeLeft.minutes)}:{formatTimeUnit(timeLeft.seconds)}
        </span>
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col items-end", className)}>
      <div className="flex items-center gap-1 mb-1. 5 sm:mb-2">
        <Clock
          className={cn(
            "w-3.5 h-3.5 sm:w-4 sm:h-4",
            isUrgent ? "text-red-300" : "text-white/70"
          )}
        />
        <span className="text-[10px] sm:text-xs text-white/70">Sisa waktu</span>
      </div>

      <div className="flex items-center gap-1. 5 sm:gap-2">
        {timeLeft.hours > 0 && (
          <>
            <TimeUnitBox
              value={timeLeft.hours}
              label="jam"
              isUrgent={isUrgent}
              size={size}
            />
            <span className="text-white/50 font-bold text-sm sm:text-base">
              :
            </span>
          </>
        )}
        <TimeUnitBox
          value={timeLeft.minutes}
          label="mnt"
          isUrgent={isUrgent}
          size={size}
        />
        <span className="text-white/50 font-bold text-sm sm:text-base">:</span>
        <TimeUnitBox
          value={timeLeft.seconds}
          label="dtk"
          isUrgent={isUrgent}
          size={size}
        />
      </div>

      {isWarning && !isUrgent && (
        <p className="text-[10px] sm:text-xs text-yellow-300 mt-1. 5 sm:mt-2">
          ⚠️ Segera selesaikan pembayaran
        </p>
      )}
    </div>
  );
}
