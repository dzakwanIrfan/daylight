'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Download, FileSpreadsheet, FileText, Loader2 } from 'lucide-react';
import { analyticsService, type ExportFormat, type ExportType } from '@/services/analytics.service';
import { toast } from 'sonner';

interface QuickExportButtonsProps {
  startDate: Date;
  endDate: Date;
}

export function QuickExportButtons({ startDate, endDate }: QuickExportButtonsProps) {
  const [isExporting, setIsExporting] = useState<string | null>(null);

  const handleQuickExport = async (format: ExportFormat, type: ExportType, label: string) => {
    const key = `${format}-${type}`;
    try {
      setIsExporting(key);
      
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);

      await analyticsService.exportData(startDate, end, format, type);
      toast.success(`${label} exported successfully!`);
    } catch (error: any) {
      console.error('Export failed:', error);
      toast.error(error.message || 'Failed to export data');
    } finally {
      setIsExporting(null);
    }
  };

  const quickExports = [
    { format: 'xlsx' as ExportFormat, type: 'full_report' as ExportType, label: 'Full Report (Excel)', icon: FileSpreadsheet },
    { format: 'csv' as ExportFormat, type: 'full_report' as ExportType, label: 'Full Report (CSV)', icon: FileText },
    { format: 'xlsx' as ExportFormat, type: 'daily_summary' as ExportType, label: 'Daily Summary (Excel)', icon: FileSpreadsheet },
    { format: 'csv' as ExportFormat, type: 'page_views' as ExportType, label: 'Page Views Detail (CSV)', icon: FileText },
  ];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="gap-2">
          {isExporting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Download className="h-4 w-4" />
          )}
          Quick Export
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Quick Export Options</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {quickExports.map((item) => {
          const Icon = item.icon;
          const key = `${item.format}-${item.type}`;
          return (
            <DropdownMenuItem
              key={key}
              onClick={() => handleQuickExport(item.format, item.type, item.label)}
              disabled={isExporting !== null}
              className="cursor-pointer"
            >
              <Icon className="mr-2 h-4 w-4" />
              {item.label}
              {isExporting === key && (
                <Loader2 className="ml-auto h-4 w-4 animate-spin" />
              )}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}