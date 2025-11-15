'use client';

import Link from 'next/link';
import { LucideIcon } from 'lucide-react';

interface CategoryCardProps {
  label: string;
  description: string;
  icon: LucideIcon;
  href: string;
  color: string;
}

export function CategoryCard({
  label,
  description,
  icon: Icon,
  href,
  color,
}: CategoryCardProps) {
  return (
    <Link href={href}>
      <div className="group flex items-center gap-4 p-4 bg-white border border-gray-200 rounded-xl hover:border-brand hover:shadow-md transition-all cursor-pointer hover:bg-linear-to-br from-brand/5 via-white to-brand/10">
        <div
          className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${color} group-hover:scale-110 transition-transform`}
        >
          <Icon className="w-6 h-6 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-gray-900 group-hover:text-brand transition-colors">
            {label}
          </h4>
          <p className="text-sm text-gray-600 line-clamp-1">{description}</p>
        </div>
      </div>
    </Link>
  );
}