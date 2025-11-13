'use client';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface PageHeaderProps {
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
    icon?: React.ReactNode;
  };
  children?: React.ReactNode;
  className?: string;
}

export function PageHeader({
  title,
  description,
  action,
  children,
  className,
}: PageHeaderProps) {
  return (
    <div
      className={cn(
        'bg-white border-b-4 border-black shadow-brutal px-4 py-6 md:px-6 lg:px-8',
        className
      )}
    >
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl md:text-3xl font-heading font-bold text-gray-900">
            {title}
          </h1>
          {description && <p className="text-gray-600">{description}</p>}
        </div>

        {action && (
          <Button
            onClick={action.onClick}
            className="bg-brand hover:bg-brand-dark text-white shadow-brutal-sm hover:shadow-brutal border-2 border-black"
          >
            {action.icon}
            {action.label}
          </Button>
        )}

        {children}
      </div>
    </div>
  );
}