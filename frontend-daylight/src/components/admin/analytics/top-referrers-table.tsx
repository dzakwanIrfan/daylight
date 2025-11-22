'use client';

import { Link2, Globe } from 'lucide-react';

interface TopReferrersTableProps {
  referrers: Array<{ referrer: string; count: number }>;
}

export function TopReferrersTable({ referrers }: TopReferrersTableProps) {
  if (referrers.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No referrer data available
      </div>
    );
  }

  const maxCount = Math.max(...referrers.map((r) => r.count));

  const getDomain = (url: string): string => {
    try {
      if (!url.startsWith('http')) {
        url = 'https://' + url;
      }
      return new URL(url).hostname;
    } catch {
      return url;
    }
  };

  return (
    <div className="space-y-3">
      {referrers.map((referrer, index) => {
        const percentage = (referrer.count / maxCount) * 100;
        const domain = getDomain(referrer.referrer);
        const isDirectOrEmpty = !referrer.referrer || referrer.referrer === 'direct';
        
        return (
          <div key={referrer.referrer || 'direct'} className="relative">
            <div 
              className="absolute inset-0 bg-blue-50 rounded-lg transition-all duration-300"
              style={{ width: `${percentage}%` }}
            />
            <div className="relative flex items-center justify-between p-3">
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-gray-400 w-6">
                  {index + 1}.
                </span>
                {isDirectOrEmpty ? (
                  <Globe className="w-4 h-4 text-gray-400" />
                ) : (
                  <Link2 className="w-4 h-4 text-blue-500" />
                )}
                <span className="text-sm text-gray-700 truncate max-w-[200px]">
                  {isDirectOrEmpty ? 'Direct / None' : domain}
                </span>
              </div>
              <span className="text-sm font-semibold text-gray-900">
                {referrer.count.toLocaleString()}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}