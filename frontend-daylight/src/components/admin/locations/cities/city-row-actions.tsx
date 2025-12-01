'use client';

import { Row } from '@tanstack/react-table';
import { MoreHorizontal, Pencil, Trash2, Eye, ToggleLeft, ToggleRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useRouter } from 'next/navigation';
import { AdminCity } from '@/types/admin-location.types';
import { useState } from 'react';
import { CityDetailsDialog } from './city-details-dialog';
import { DeleteCityDialog } from './delete-city-dialog';
import { useAdminCityMutations } from '@/hooks/use-admin-locations';

interface CityTableRowActionsProps {
  row: Row<AdminCity>;
}

export function CityTableRowActions({ row }: CityTableRowActionsProps) {
  const city = row.original;
  const router = useRouter();
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const { updateCity } = useAdminCityMutations();

  const handleToggleActive = () => {
    updateCity. mutate({
      id: city.id,
      data: { isActive: !city.isActive },
    });
  };

  const hasUsage = (city._count?.users || 0) > 0 || (city._count?.events || 0) > 0;

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            aria-label="Open menu"
            variant="ghost"
            className="flex h-8 w-8 p-0 data-[state=open]:bg-muted"
          >
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-[200px] bg-white">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuSeparator />

          <DropdownMenuItem onClick={() => setShowDetailsDialog(true)}>
            <Eye className="mr-2 h-4 w-4" />
            View Details
          </DropdownMenuItem>

          <DropdownMenuItem onClick={() => router.push(`/admin/locations/cities/${city.id}/edit`)}>
            <Pencil className="mr-2 h-4 w-4" />
            Edit City
          </DropdownMenuItem>

          <DropdownMenuItem onClick={handleToggleActive}>
            {city.isActive ?  (
              <>
                <ToggleLeft className="mr-2 h-4 w-4" />
                Deactivate
              </>
            ) : (
              <>
                <ToggleRight className="mr-2 h-4 w-4" />
                Activate
              </>
            )}
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuItem
            onClick={() => setShowDeleteDialog(true)}
            className="text-red-600 focus:text-red-600"
            disabled={hasUsage}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <CityDetailsDialog
        city={city}
        open={showDetailsDialog}
        onOpenChange={setShowDetailsDialog}
      />

      <DeleteCityDialog
        city={city}
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
      />
    </>
  );
}