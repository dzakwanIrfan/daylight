'use client';

import { motion } from 'framer-motion';

interface ProgressBarProps {
  current: number;
  total: number;
}

export function ProgressBar({ current, total }: ProgressBarProps) {
  const percentage = (current / total) * 100;

  return (
    <div className="w-full space-y-2">
      <div className="flex justify-between items-center text-sm">
        <span className="font-medium text-muted-foreground">
          Question {current} of {total}
        </span>
        <span className="font-semibold text-brand">{Math.round(percentage)}%</span>
      </div>
      <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
        <motion.div
          className="h-full brand-gradient"
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />
      </div>
    </div>
  );
}