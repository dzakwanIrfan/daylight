'use client';

import { useEffect, useState } from 'react';
import { Clock } from 'lucide-react';

interface CountdownTimerProps {
  expiredAt: string;
  onExpired?: () => void;
}

export function CountdownTimer({ expiredAt, onExpired }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState<number>(0);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const expiry = new Date(expiredAt).getTime();
      const difference = expiry - now;

      return Math.max(0, Math.floor(difference / 1000));
    };

    setTimeLeft(calculateTimeLeft());

    const timer = setInterval(() => {
      const newTimeLeft = calculateTimeLeft();
      setTimeLeft(newTimeLeft);

      if (newTimeLeft === 0) {
        clearInterval(timer);
        onExpired?.();
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [expiredAt, onExpired]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    const parts = [];
    if (hours > 0) parts.push(`${hours}h`);
    if (minutes > 0) parts.push(`${minutes}m`);
    parts.push(`${secs}s`);

    return parts.join(' ');
  };

  const getColorClass = () => {
    if (timeLeft <= 300) return 'text-red-600 bg-red-50'; // 5 minutes
    if (timeLeft <= 3600) return 'text-orange-600 bg-orange-50'; // 1 hour
    return 'text-brand bg-brand/10';
  };

  return (
    <div className={`flex items-center gap-2 px-4 py-2 rounded-full ${getColorClass()}`}>
      <Clock className="w-4 h-4" />
      <span className="font-semibold text-sm">{formatTime(timeLeft)}</span>
    </div>
  );
}