'use client';

import { Row } from '@tanstack/react-table';
import { MoreHorizontal, Pencil, Trash2, Eye, MapPin } from 'lucide-react';
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
import { AdminCountry } from '@/types/admin-location.types';
import { useState } from 'react';
import { CountryDetailsDialog } from './country-details-dialog';
import { DeleteCountryDialog } from './delete-country-dialog';

interface CountryTableRowActionsProps {
  row: Row<AdminCountry>;
}

export function CountryTableRowActions({ row }: CountryTableRowActionsProps) {
  const country = row.original;
  const router = useRouter();
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

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

          <DropdownMenuItem onClick={() => router.push(`/admin/locations/countries/${country.id}/edit`)}>
            <Pencil className="mr-2 h-4 w-4" />
            Edit Country
          </DropdownMenuItem>

          <DropdownMenuItem onClick={() => router.push(`/admin/locations/cities? countryId=${country.id}`)}>
            <MapPin className="mr-2 h-4 w-4" />
            View Cities
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuItem
            onClick={() => setShowDeleteDialog(true)}
            className="text-red-600 focus:text-red-600"
            disabled={(country._count?.cities || 0) > 0}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <CountryDetailsDialog
        country={country}
        open={showDetailsDialog}
        onOpenChange={setShowDetailsDialog}
      />

      <DeleteCountryDialog
        country={country}
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
      />
    </>
  );
}