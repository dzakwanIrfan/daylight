'use client';

import { EventCategory } from '@/types/event.types';
import {
  UtensilsCrossed,
  Bus,
  HeartHandshake,
  Cloud,
  Grid3x3,
} from 'lucide-react';

interface CategoryFilterProps {
  selectedCategory: EventCategory | 'ALL';
  onCategoryChange: (category: EventCategory | 'ALL') => void;
}

const categories = [
  {
    value: 'ALL' as const,
    label: 'All Events',
    icon: Grid3x3,
    description: 'View all events',
  },
  {
    value: EventCategory.DAYBREAK,
    label: 'DayBreak',
    icon: UtensilsCrossed,
    description: 'Start fresh. Meet new people.',
  },
  {
    value: EventCategory.DAYTRIP,
    label: 'DayTrip',
    icon: Bus,
    description: 'Go out. Connect through adventure.',
  },
  {
    value: EventCategory.DAYCARE,
    label: 'DayCare',
    icon: HeartHandshake,
    description: 'A safe space to support each other.',
  },
  {
    value: EventCategory.DAYDREAM,
    label: 'DayDream',
    icon: Cloud,
    description: 'Share ideas. Inspire together.',
  },
];

export function CategoryFilter({
  selectedCategory,
  onCategoryChange,
}: CategoryFilterProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h2 className="text-lg font-semibold mb-4">Let's Get Started</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {categories.map((category) => {
          const Icon = category.icon;
          const isSelected = selectedCategory === category.value;

          return (
            <button
              key={category.value}
              onClick={() => onCategoryChange(category.value)}
              className={`flex items-center gap-3 p-4 border rounded-lg transition-all text-left ${
                isSelected
                  ? 'border-brand bg-brand/5 shadow-sm'
                  : 'border-gray-200 hover:border-brand/30 hover:bg-brand/5'
              }`}
            >
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                  isSelected ? 'bg-brand/20' : 'bg-brand/10'
                }`}
              >
                <Icon
                  className={`w-5 h-5 ${
                    isSelected ? 'text-brand' : 'text-brand/70'
                  }`}
                />
              </div>
              <div className="flex-1 min-w-0">
                <h4
                  className={`font-medium ${
                    isSelected ? 'text-brand' : 'text-gray-900'
                  }`}
                >
                  {category.label}
                </h4>
                <p className="text-sm text-muted-foreground line-clamp-1">
                  {category.description}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}