'use client';

import Link from 'next/link';
import { LucideIcon } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '../ui/tooltip';
import Image from 'next/image';

interface CategoryCardProps {
  label: string;
  description: string;
  icon: LucideIcon;
  href: string;
  color: string;
  disabled?: boolean;
  src: string;
}

export function CategoryCard({
  label,
  description,
  icon: Icon,
  href,
  color,
  disabled = false,
  src,
}: CategoryCardProps) {
  const content = (
    <div
      className={`group flex items-center gap-4 p-4 bg-white border border-gray-200 rounded-xl transition-all  ${
        disabled
          ? 'opacity-60'
          : 'hover:border-brand hover:shadow-md cursor-pointer hover:bg-linear-to-br from-brand/5 via-white to-brand/10'
      }`}
      aria-disabled={disabled}
    >
      <Image alt={label} width={48} height={48} src={src} className='rounded-full w-12 h-12 object-cover' onBlur={Image.apply} />
      {/* <div
        className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${color} ${
          disabled ? '' : 'group-hover:scale-110 transition-transform'
        }`}
      >
        <Icon className="w-6 h-6 text-white" />
      </div> */}
      <div className="flex-1 min-w-0">
        <h4
          className={`font-semibold text-gray-900 ${
            disabled ? '' : 'group-hover:text-brand transition-colors'
          }`}
        >
          {label}
        </h4>
        <p className="text-sm text-gray-600 line-clamp-1">{description}</p>
      </div>
    </div>
  );

  if (disabled) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>{content}</TooltipTrigger>
        <TooltipContent>
          <p>Coming Soon!</p>
        </TooltipContent>
      </Tooltip>
    ) 
  } 
  return <Link href={href}>{content}</Link>;
}