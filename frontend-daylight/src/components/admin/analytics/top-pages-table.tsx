'use client';

import { FileText } from 'lucide-react';

interface TopPagesTableProps {
  pages: Array<{ path: string; views: number }>;
}

export function TopPagesTable({ pages }: TopPagesTableProps) {
  if (pages.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No page data available
      </div>
    );
  }

  const maxViews = Math.max(...pages.map((p) => p.views));

  return (
    <div className="space-y-3">
      {pages.map((page, index) => {
        const percentage = (page.views / maxViews) * 100;
        
        return (
          <div key={page.path} className="relative">
            <div 
              className="absolute inset-0 bg-brand/10 rounded-lg transition-all duration-300"
              style={{ width: `${percentage}%` }}
            />
            <div className="relative flex items-center justify-between p-3">
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-gray-400 w-6">
                  {index + 1}.
                </span>
                <FileText className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-700 truncate max-w-[200px]">
                  {page.path}
                </span>
              </div>
              <span className="text-sm font-semibold text-gray-900">
                {page.views.toLocaleString()}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}