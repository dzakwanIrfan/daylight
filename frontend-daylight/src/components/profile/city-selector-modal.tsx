"use client";

import { useState, useEffect, useMemo } from "react";
import { MapPin, Check, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Button } from "@/components/ui/button";
import { locationService } from "@/services/location.service";
import { userService } from "@/services/user.service";
import type { CityOption } from "@/types/admin-location.types";
import { toast } from "sonner";

interface CityWithCountry extends CityOption {
  country: {
    id: string;
    code: string;
    name: string;
  };
}

interface GroupedCities {
  [countryName: string]: CityWithCountry[];
}

interface CitySelectorModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentCityId?: string;
  onCityChanged?: () => void;
}

export function CitySelectorModal({
  open,
  onOpenChange,
  currentCityId,
  onCityChanged,
}: CitySelectorModalProps) {
  const [cities, setCities] = useState<CityWithCountry[]>([]);
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [selectedCityId, setSelectedCityId] = useState<string | undefined>(
    currentCityId
  );
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch cities when modal opens
  useEffect(() => {
    if (open) {
      fetchCities();
      setSelectedCityId(currentCityId);
    }
  }, [open, currentCityId]);

  const fetchCities = async () => {
    try {
      setLoading(true);
      const data = await locationService.getCityOptions();
      // Filter only cities with country data
      const citiesWithCountry = data.filter(
        (city): city is CityWithCountry => !!city.country
      );
      setCities(citiesWithCountry);
    } catch (error) {
      console.error("Failed to fetch cities:", error);
      toast.error("Failed to load cities. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Group cities by country and filter by search
  const groupedCities = useMemo(() => {
    const filtered = cities.filter((city) => {
      const query = searchQuery.toLowerCase();
      return (
        city.name.toLowerCase().includes(query) ||
        city.country.name.toLowerCase().includes(query) ||
        city.timezone.toLowerCase().includes(query)
      );
    });

    const grouped: GroupedCities = {};
    filtered.forEach((city) => {
      const countryName = city.country.name;
      if (!grouped[countryName]) {
        grouped[countryName] = [];
      }
      grouped[countryName].push(city);
    });

    // Sort cities within each country
    Object.keys(grouped).forEach((country) => {
      grouped[country].sort((a, b) => a.name.localeCompare(b.name));
    });

    return grouped;
  }, [cities, searchQuery]);

  // Get sorted country names
  const sortedCountries = useMemo(() => {
    return Object.keys(groupedCities).sort((a, b) => a.localeCompare(b));
  }, [groupedCities]);

  const handleUpdateCity = async () => {
    if (!selectedCityId || selectedCityId === currentCityId) {
      onOpenChange(false);
      return;
    }

    try {
      setUpdating(true);
      await userService.updateCurrentCity(selectedCityId);
      toast.success("City updated successfully!");
      onOpenChange(false);
      onCityChanged?.();
    } catch (error: any) {
      console.error("Failed to update city:", error);
      toast.error(
        error.response?.data?.message ||
          "Failed to update city. Please try again."
      );
    } finally {
      setUpdating(false);
    }
  };

  const selectedCity = cities.find((city) => city.id === selectedCityId);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-2xl border-2 border-black rounded-xl sm:rounded-2xl max-h-[90vh] sm:max-h-[85vh] flex flex-col p-4 sm:p-6">
        <DialogHeader className="shrink-0">
          <DialogTitle className="flex items-center gap-2 text-lg sm:text-xl">
            <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-brand shrink-0" />
            <span className="truncate">Select Your City</span>
          </DialogTitle>
          <DialogDescription className="text-xs sm:text-sm">
            Choose your current city to see events and activities near you
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 sm:space-y-4 flex-1 overflow-hidden flex flex-col">
          {loading ? (
            <div className="flex items-center justify-center py-12 sm:py-8">
              <Loader2 className="w-8 h-8 sm:w-10 sm:h-10 animate-spin text-brand" />
            </div>
          ) : (
            <>
              <Command className="border-2 border-gray-200 rounded-lg flex-1 flex flex-col overflow-hidden">
                <CommandInput
                  placeholder="Search cities or countries..."
                  value={searchQuery}
                  onValueChange={setSearchQuery}
                  className="text-sm sm:text-base"
                />
                <CommandList className="max-h-[40vh] sm:max-h-[400px] overflow-y-auto">
                  <CommandEmpty>
                    <div className="py-6 sm:py-8 text-center px-4">
                      <MapPin className="w-10 h-10 sm:w-12 sm:h-12 mx-auto text-gray-300 mb-2" />
                      <p className="text-xs sm:text-sm text-muted-foreground">
                        No cities found
                      </p>
                    </div>
                  </CommandEmpty>

                  {sortedCountries.map((countryName) => (
                    <CommandGroup
                      key={countryName}
                      heading={countryName}
                      className="**:[[cmdk-group-heading]]:text-brand **:[[cmdk-group-heading]]:font-semibold **:[[cmdk-group-heading]]:text-xs **:[[cmdk-group-heading]]:sm:text-sm **:[[cmdk-group-heading]]:sticky **:[[cmdk-group-heading]]:top-0 **:[[cmdk-group-heading]]:bg-white **:[[cmdk-group-heading]]:z-10"
                    >
                      {groupedCities[countryName].map((city) => (
                        <CommandItem
                          key={city.id}
                          value={`${city.name} ${city.country.name}`}
                          onSelect={() => setSelectedCityId(city.id)}
                          className="cursor-pointer py-2.5 sm:py-3 px-2 sm:px-3"
                        >
                          <div className="flex items-center justify-between w-full gap-2">
                            <div className="flex-1 min-w-0">
                              <div className="font-medium text-sm sm:text-base truncate">
                                {city.name}
                              </div>
                              <div className="text-xs text-muted-foreground truncate">
                                {city.timezone}
                              </div>
                            </div>
                            {selectedCityId === city.id && (
                              <Check className="w-4 h-4 text-brand shrink-0" />
                            )}
                          </div>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  ))}
                </CommandList>
              </Command>

              {selectedCity && (
                <div className="bg-brand/5 border-2 border-brand/20 rounded-lg p-3 sm:p-4 shrink-0">
                  <p className="text-xs sm:text-sm text-muted-foreground mb-1">
                    Selected City:
                  </p>
                  <p className="font-semibold text-brand text-sm sm:text-base truncate">
                    {selectedCity.name}, {selectedCity.country.name}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1 truncate">
                    Timezone: {selectedCity.timezone}
                  </p>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-2 shrink-0">
                <Button
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  className="w-full sm:flex-1 border-2 border-black rounded-full transition-all text-sm sm:text-base h-10 sm:h-11"
                  disabled={updating}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleUpdateCity}
                  disabled={
                    !selectedCityId ||
                    selectedCityId === currentCityId ||
                    updating
                  }
                  className="w-full sm:flex-1 bg-brand hover:bg-brand/90 text-white border-2 border-black rounded-full transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base h-10 sm:h-11"
                >
                  {updating ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      Updating...
                    </>
                  ) : (
                    "Update City"
                  )}
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
