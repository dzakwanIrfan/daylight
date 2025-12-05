"use client";

import { useEffect, useState, useCallback } from "react";
import { Clock, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

// TYPES
interface CountdownTimerProps {
  expiredAt: string | Date;
  onExpired?: () => void;
  className?: string;
  size?: "sm" | "md" | "lg";
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
    sm: "w-10 h-10 text-sm",
    md: "w-14 h-14 text-lg",
    lg: "w-16 h-16 text-xl",
  };

  const labelSizes = {
    sm: "text-[10px]",
    md: "text-xs",
    lg: "text-sm",
  };

  return (
    <div className="flex flex-col items-center">
      <div
        className={cn(
          "rounded-xl font-mono font-bold flex items-center justify-center transition-all",
          sizeClasses[size],
          isUrgent
            ? "bg-red-500 text-white animate-pulse"
            : "bg-white/20 text-white backdrop-blur-sm"
        )}
      >
        {formatTimeUnit(value)}
      </div>
      <span className={cn("mt-1 text-white/70", labelSizes[size])}>
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

  const isUrgent = timeLeft.total > 0 && timeLeft.total <= 300; // Less than 5 minutes
  const isWarning = timeLeft.total > 300 && timeLeft.total <= 900; // 5-15 minutes

  if (timeLeft.total === 0) {
    return (
      <div
        className={cn(
          "flex items-center gap-2 bg-red-500/20 backdrop-blur-sm rounded-xl px-4 py-2",
          className
        )}
      >
        <AlertTriangle className="w-5 h-5 text-red-300" />
        <span className="font-semibold text-white">Expired</span>
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col items-end", className)}>
      <div className="flex items-center gap-1 mb-1">
        <Clock
          className={cn(
            "w-4 h-4",
            isUrgent ? "text-red-300 animate-pulse" : "text-white/70"
          )}
        />
        <span className="text-xs text-white/70">Time remaining</span>
      </div>

      <div className="flex items-center gap-2">
        {timeLeft.hours > 0 && (
          <>
            <TimeUnitBox
              value={timeLeft.hours}
              label="hrs"
              isUrgent={isUrgent}
              size={size}
            />
            <span className="text-white/50 font-bold text-lg">:</span>
          </>
        )}
        <TimeUnitBox
          value={timeLeft.minutes}
          label="min"
          isUrgent={isUrgent}
          size={size}
        />
        <span className="text-white/50 font-bold text-lg">:</span>
        <TimeUnitBox
          value={timeLeft.seconds}
          label="sec"
          isUrgent={isUrgent}
          size={size}
        />
      </div>

      {isWarning && !isUrgent && (
        <p className="text-xs text-yellow-300 mt-2">⚠️ Complete payment soon</p>
      )}
    </div>
  );
}
