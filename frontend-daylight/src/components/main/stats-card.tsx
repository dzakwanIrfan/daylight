import { LucideIcon } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  iconBgColor?: string;
  iconColor?: string;
  isLoading?: boolean;
  onClick?: () => void;
  clickable?: boolean;
}

export function StatsCard({
  title,
  value,
  subtitle,
  icon: Icon,
  iconBgColor = 'bg-brand/10',
  iconColor = 'text-brand',
  isLoading = false,
  onClick,
  clickable = false,
}: StatsCardProps) {
  if (isLoading) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-10 w-10 rounded-full" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-8 w-16" />
          <Skeleton className="h-3 w-32" />
        </div>
      </div>
    );
  }

  const baseClasses = "bg-white rounded-xl border border-gray-200 p-6 transition-all";
  const interactiveClasses = clickable 
    ? "cursor-pointer hover:border-brand/50 hover:shadow-md active:scale-[0.98]" 
    : "hover:border-brand/30";

  return (
    <div 
      className={`${baseClasses} ${interactiveClasses}`}
      onClick={clickable ? onClick : undefined}
      role={clickable ? "button" : undefined}
      tabIndex={clickable ? 0 : undefined}
      onKeyDown={clickable ? (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick?.();
        }
      } : undefined}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
        <div className={`w-10 h-10 rounded-full ${iconBgColor} flex items-center justify-center`}>
          <Icon className={`w-5 h-5 ${iconColor}`} />
        </div>
      </div>
      <div className="space-y-1">
        <div className="text-3xl font-bold">{value}</div>
        {subtitle && (
          <p className="text-xs text-muted-foreground">{subtitle}</p>
        )}
      </div>
    </div>
  );
}