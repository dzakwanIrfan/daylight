'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Download, FileSpreadsheet, FileText, Loader2 } from 'lucide-react';
import { analyticsService, type ExportFormat, type ExportType } from '@/services/analytics.service';
import { toast } from 'sonner';

interface ExportDialogProps {
  defaultStartDate?: Date;
  defaultEndDate?: Date;
}

const exportTypeOptions: { value: ExportType; label: string; description: string }[] = [
  { value: 'full_report', label: 'Full Report', description: 'Complete analytics report with all data' },
  { value: 'overview', label: 'Overview Summary', description: 'High-level metrics and KPIs' },
  { value: 'daily_summary', label: 'Daily Summary', description: 'Day-by-day traffic breakdown' },
  { value: 'page_views', label: 'Page Views Detail', description: 'Individual page view records' },
  { value: 'top_pages', label: 'Top Pages', description: 'Most visited pages ranking' },
  { value: 'top_referrers', label: 'Top Referrers', description: 'Traffic sources ranking' },
  { value: 'device_breakdown', label: 'Device Breakdown', description: 'Device, browser & OS stats' },
];

export function ExportDialog({ defaultStartDate, defaultEndDate }: ExportDialogProps) {
  const [open, setOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [format, setFormat] = useState<ExportFormat>('xlsx');
  const [exportType, setExportType] = useState<ExportType>('full_report');
  const [startDate, setStartDate] = useState(
    defaultStartDate?.toISOString().split('T')[0] ||
    new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [endDate, setEndDate] = useState(
    defaultEndDate?.toISOString().split('T')[0] ||
    new Date().toISOString().split('T')[0]
  );

  const handleExport = async () => {
    try {
      setIsExporting(true);

      const start = new Date(startDate);
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999); // Include full end day

      // Validate dates
      if (start > end) {
        toast.error('Start date must be before end date');
        return;
      }

      // Check date range
      const oneYearMs = 365 * 24 * 60 * 60 * 1000;
      if (end.getTime() - start.getTime() > oneYearMs) {
        toast.error('Date range cannot exceed 1 year');
        return;
      }

      await analyticsService.exportData(start, end, format, exportType);
      
      toast.success('Export downloaded successfully!');
      setOpen(false);
    } catch (error: any) {
      console.error('Export failed:', error);
      toast.error(error.message || 'Failed to export data');
    } finally {
      setIsExporting(false);
    }
  };

  const selectedType = exportTypeOptions.find(opt => opt.value === exportType);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Download className="h-4 w-4" />
          Export
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Export Analytics Data</DialogTitle>
          <DialogDescription>
            Download your analytics data in CSV or Excel format.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {/* Date Range */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                max={endDate}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate">End Date</Label>
              <Input
                id="endDate"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                min={startDate}
                max={new Date().toISOString().split('T')[0]}
              />
            </div>
          </div>

          {/* Export Type */}
          <div className="space-y-2">
            <Label>Export Type</Label>
            <Select value={exportType} onValueChange={(v) => setExportType(v as ExportType)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {exportTypeOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    <div className="flex flex-col">
                      <span>{option.label}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedType && (
              <p className="text-xs text-gray-500">{selectedType.description}</p>
            )}
          </div>

          {/* Format Selection */}
          <div className="space-y-2">
            <Label>File Format</Label>
            <div className="flex gap-4">
              <Button
                type="button"
                variant={format === 'xlsx' ? 'default' : 'outline'}
                className="flex-1 gap-2"
                onClick={() => setFormat('xlsx')}
              >
                <FileSpreadsheet className="h-4 w-4" />
                Excel (.xlsx)
              </Button>
              <Button
                type="button"
                variant={format === 'csv' ? 'default' : 'outline'}
                className="flex-1 gap-2"
                onClick={() => setFormat('csv')}
              >
                <FileText className="h-4 w-4" />
                CSV
              </Button>
            </div>
            <p className="text-xs text-gray-500">
              {format === 'xlsx'
                ? 'Excel format with multiple sheets (recommended for full reports)'
                : 'Simple CSV format, compatible with all spreadsheet apps'}
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={isExporting}>
            Cancel
          </Button>
          <Button onClick={handleExport} disabled={isExporting} className="gap-2">
            {isExporting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Exporting...
              </>
            ) : (
              <>
                <Download className="h-4 w-4" />
                Download
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}