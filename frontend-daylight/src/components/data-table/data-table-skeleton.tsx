import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface DataTableSkeletonProps {
  columnCount: number;
  rowCount?: number;
  searchableColumnCount?: number;
  filterableColumnCount?: number;
  showViewOptions?: boolean;
  cellWidths?: string[];
  withPagination?: boolean;
  shrinkZero?: boolean;
}

export function DataTableSkeleton({
  columnCount,
  rowCount = 10,
  searchableColumnCount = 0,
  filterableColumnCount = 0,
  showViewOptions = true,
  cellWidths = ['auto'],
  withPagination = true,
  shrinkZero = false,
}: DataTableSkeletonProps) {
  return (
    <div className="w-full space-y-3 overflow-auto">
      <div className="flex w-full items-center justify-between space-x-2 overflow-auto p-1">
        <div className="flex flex-1 items-center space-x-2">
          {searchableColumnCount > 0 &&
            Array.from({ length: searchableColumnCount }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-40 lg:w-60" />
            ))}
          {filterableColumnCount > 0 &&
            Array.from({ length: filterableColumnCount }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-18 border-dashed" />
            ))}
        </div>
        {showViewOptions && <Skeleton className="ml-auto h-10 w-18" />}
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {Array.from({ length: 1 }).map((_, i) => (
              <TableRow key={i} className="hover:bg-transparent">
                {Array.from({ length: columnCount }).map((_, j) => (
                  <TableHead
                    key={j}
                    style={{
                      width: cellWidths[j],
                      minWidth: shrinkZero ? cellWidths[j] : 'auto',
                    }}
                  >
                    <Skeleton className="h-6 w-full" />
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {Array.from({ length: rowCount }).map((_, i) => (
              <TableRow key={i} className="hover:bg-transparent">
                {Array.from({ length: columnCount }).map((_, j) => (
                  <TableCell
                    key={j}
                    style={{
                      width: cellWidths[j],
                      minWidth: shrinkZero ? cellWidths[j] : 'auto',
                    }}
                  >
                    <Skeleton className="h-6 w-full" />
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      {withPagination && (
        <div className="flex w-full items-center justify-between gap-4 overflow-auto px-2 py-1 sm:gap-8">
          <Skeleton className="h-8 w-40 shrink-0" />
          <div className="flex items-center gap-4 sm:gap-6 lg:gap-8">
            <div className="flex items-center space-x-2">
              <Skeleton className="h-8 w-24" />
              <Skeleton className="h-8 w-18" />
            </div>
            <div className="flex items-center justify-center text-sm font-medium">
              <Skeleton className="h-8 w-20" />
            </div>
            <div className="flex items-center space-x-2">
              <Skeleton className="hidden h-8 w-8 lg:block" />
              <Skeleton className="h-8 w-8" />
              <Skeleton className="h-8 w-8" />
              <Skeleton className="hidden h-8 w-8 lg:block" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}