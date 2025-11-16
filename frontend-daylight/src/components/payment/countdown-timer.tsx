'use client';

import { useEffect, useState } from 'react';
import { Clock } from 'lucide-react';

interface CountdownTimerProps {
  expiredAt: string;
  onExpired?: () => void;
}

export function CountdownTimer({ expiredAt, onExpired }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [hasExpired, setHasExpired] = useState(false);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const expiry = new Date(expiredAt).getTime();
      const diff = Math.floor((expiry - now) / 1000);
      return diff > 0 ? diff : 0;
    };

    // Initial calculation
    setTimeLeft(calculateTimeLeft());

    // Update every second
    const interval = setInterval(() => {
      const newTimeLeft = calculateTimeLeft();
      setTimeLeft(newTimeLeft);

      if (newTimeLeft === 0 && !hasExpired) {
        setHasExpired(true);
        onExpired?.();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [expiredAt, hasExpired, onExpired]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    const parts = [];
    if (hours > 0) parts.push(`${hours}j`);
    if (minutes > 0 || hours > 0) parts.push(`${minutes}m`);
    parts.push(`${secs}s`);

    return parts.join(' ');
  };

  const getColorClass = () => {
    if (timeLeft > 3600) return 'bg-white/20 text-white';
    if (timeLeft > 300) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800 animate-pulse';
  };

  if (timeLeft === 0) {
    return (
      <div className="bg-red-100 text-red-800 rounded-lg px-4 py-2 flex items-center gap-2">
        <Clock className="w-4 h-4" />
        <span className="font-semibold text-sm">Expired</span>
      </div>
    );
  }

  return (
    <div className={`rounded-lg px-4 py-2 flex items-center gap-2 ${getColorClass()}`}>
      <Clock className="w-4 h-4" />
      <div className="text-sm">
        <div className="font-semibold">{formatTime(timeLeft)}</div>
        <div className="text-xs opacity-75">remaining</div>
      </div>
    </div>
  );
}