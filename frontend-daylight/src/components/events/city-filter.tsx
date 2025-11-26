'use client';

import { MapPin, X } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';

interface CityFilterProps {
  cities: string[];
  selectedCity: string | undefined;
  onCityChange: (city: string | undefined) => void;
}

export function CityFilter({ cities, selectedCity, onCityChange }: CityFilterProps) {
  if (cities.length === 0) {
    return null;
  }

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-2">
        <MapPin className="w-4 h-4 text-muted-foreground" />
        <Select
          value={selectedCity || 'all'}
          onValueChange={(value) => onCityChange(value === 'all' ? undefined : value)}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by city" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Cities</SelectItem>
            {cities.map((city) => (
              <SelectItem key={city} value={city}>
                {city}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      {selectedCity && (
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => onCityChange(undefined)}
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Clear filter</span>
        </Button>
      )}
    </div>
  );
}