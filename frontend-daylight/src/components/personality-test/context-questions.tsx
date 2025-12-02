'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQuery } from '@tanstack/react-query';
import { ArrowLeft, Loader2, MapPin, Check } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { personalityService } from '@/services/personality.service';
import { locationService } from '@/services/location.service';
import { usePersonalityTestStore } from '@/store/personality-test-store';
import { cn } from '@/lib/utils';
import type { CityOption } from '@/types/admin-location.types';

const intentOptions = [
  { value: 'NEW_FRIENDS', label: 'New friends' },
  { value: 'NETWORKING', label: 'Networking or professional connection' },
  { value: 'HOBBIES', label: 'Shared hobbies & activities' },
  { value: 'OPEN', label: "I'm open to any positive experience" },
];

export function ContextQuestions() {
  const router = useRouter();
  const {
    sessionId,
    answers,
    relationshipStatus,
    intentOnDaylight,
    genderMixComfort,
    currentCityId,
    setContextData,
    setTestCompleted,
  } = usePersonalityTestStore();

  const [localRelationshipStatus, setLocalRelationshipStatus] = useState<'SINGLE' | 'MARRIED' | 'PREFER_NOT_SAY' | undefined>(relationshipStatus);
  const [localIntentOnDaylight, setLocalIntentOnDaylight] = useState<string[]>(intentOnDaylight || []);
  const [localGenderMixComfort, setLocalGenderMixComfort] = useState<'TOTALLY_FINE' | 'PREFER_SAME_GENDER' | 'DEPENDS' | undefined>(genderMixComfort);
  const [localCurrentCityId, setLocalCurrentCityId] = useState<string | undefined>(currentCityId);
  const [searchQuery, setSearchQuery] = useState('');

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

  // Wrap queryFn properly for React Query v5
  const { data: cityOptions, isLoading: isLoadingCities } = useQuery<CityOption[]>({
    queryKey: ['city-options'],
    queryFn: () => locationService.getCityOptions(),
  });

  // Filter and group cities
  const cities = useMemo(() => {
    if (!cityOptions) return [];
    return cityOptions.filter(
      (city): city is CityWithCountry => !!city.country
    );
  }, [cityOptions]);

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

  const selectedCity = cities.find((city) => city.id === localCurrentCityId);

  const submitMutation = useMutation({
    mutationFn: personalityService.submitTest,
    onSuccess: () => {
      setContextData({
        relationshipStatus: localRelationshipStatus,
        intentOnDaylight: localIntentOnDaylight,
        genderMixComfort: localGenderMixComfort,
        currentCityId: localCurrentCityId,
      });
      
      setTestCompleted();
      
      toast.success('Test completed!', {
        description: 'Create an account to see your full results and join events!',
      });
      
      router.push('/auth/register');
    },
    onError: (error: any) => {
      toast.error('Submission failed', {
        description: error.response?.data?.message || 'Please try again',
      });
    },
  });

  const handleSubmit = () => {
    if (!localRelationshipStatus) {
      toast.error('Please answer the relationship status question');
      return;
    }

    if (localIntentOnDaylight.length === 0) {
      toast.error('Please select at least one intent');
      return;
    }

    if (!localGenderMixComfort) {
      toast.error('Please answer the gender mix comfort question');
      return;
    }

    if (!localCurrentCityId) {
      toast.error('Please select your city');
      return;
    }

    submitMutation.mutate({
      sessionId,
      answers,
      relationshipStatus: localRelationshipStatus,
      intentOnDaylight: localIntentOnDaylight,
      genderMixComfort: localGenderMixComfort,
      currentCityId: localCurrentCityId,
    });
  };

  const handleIntentToggle = (value: string) => {
    setLocalIntentOnDaylight((prev) =>
      prev.includes(value)
        ? prev.filter((item) => item !== value)
        : [...prev, value]
    );
  };

  return (
    <div className="min-h-screen bg-background py-6 sm:py-8 px-4">
      <div className="max-w-3xl mx-auto space-y-6 sm:space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-xl sm:text-2xl logo-text font-bold text-brand">
            DayLight
          </h1>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8 sm:space-y-12"
        >
          <div className="text-center space-y-2">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-heading font-bold">
              Just a Few More Questions
            </h2>
            <p className="text-muted-foreground text-base sm:text-lg">
              Help us understand your preferences better
            </p>
          </div>

          {/* Question 1: Current City */}
          <div className="space-y-4">
            <Label className="text-base sm:text-lg font-semibold">
              Which city are you currently in? *
            </Label>
            
            <div className="space-y-3">
              {isLoadingCities ? (
                <div className="flex items-center justify-center py-12 border-2 border-gray-200 rounded-lg">
                  <Loader2 className="w-8 h-8 animate-spin text-brand" />
                </div>
              ) : (
                <>
                  <Command className="border-2 border-gray-200 rounded-lg overflow-hidden">
                    <CommandInput
                      placeholder="Search cities or countries..."
                      value={searchQuery}
                      onValueChange={setSearchQuery}
                      className="text-sm sm:text-base h-12 sm:h-14"
                    />
                    <CommandList className="max-h-[300px] sm:max-h-[400px]">
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
                              onSelect={() => setLocalCurrentCityId(city.id)}
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
                                {localCurrentCityId === city.id && (
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
                    <div className="bg-brand/5 border-2 border-brand/20 rounded-lg p-3 sm:p-4">
                      <p className="text-xs sm:text-sm text-muted-foreground mb-1">
                        Selected City:
                      </p>
                      <p className="font-semibold text-brand text-sm sm:text-base truncate">
                        {selectedCity.name}, {selectedCity.country.name}
                      </p>
                    </div>
                  )}

                  <p className="text-xs sm:text-sm text-muted-foreground">
                    We'll show you events happening in your city
                  </p>
                </>
              )}
            </div>
          </div>

          {/* Question 2: Relationship Status */}
          <div className="space-y-4">
            <Label className="text-base sm:text-lg font-semibold">
              What's your current relationship status?
            </Label>
            <RadioGroup
              value={localRelationshipStatus}
              onValueChange={(value: any) => setLocalRelationshipStatus(value)}
            >
              <div className="space-y-2 sm:space-y-3">
                {[
                  { value: 'SINGLE', label: 'Single' },
                  { value: 'MARRIED', label: 'Married / In a relationship' },
                  { value: 'PREFER_NOT_SAY', label: 'Prefer not to say' },
                ].map((option) => (
                  <div
                    key={option.value}
                    className={cn(
                      'flex items-center space-x-2 sm:space-x-3 p-3 sm:p-4 rounded-xl border-2 cursor-pointer transition-all active:scale-[0.98]',
                      localRelationshipStatus === option.value
                        ? 'border-brand bg-brand/10'
                        : 'border-border hover:border-brand/50'
                    )}
                    onClick={() => setLocalRelationshipStatus(option.value as any)}
                  >
                    <RadioGroupItem value={option.value} id={option.value} className="shrink-0" />
                    <Label
                      htmlFor={option.value}
                      className="flex-1 cursor-pointer font-medium text-sm sm:text-base"
                    >
                      {option.label}
                    </Label>
                  </div>
                ))}
              </div>
            </RadioGroup>
          </div>

          {/* Question 3: Intent on DayLight */}
          <div className="space-y-4">
            <Label className="text-base sm:text-lg font-semibold">
              What are you looking for on DayLight? (Select all that apply)
            </Label>
            <div className="space-y-2 sm:space-y-3">
              {intentOptions.map((option) => (
                <div
                  key={option.value}
                  className={cn(
                    'flex items-center space-x-2 sm:space-x-3 p-3 sm:p-4 rounded-xl border-2 cursor-pointer transition-all active:scale-[0.98]',
                    localIntentOnDaylight.includes(option.value)
                      ? 'border-brand bg-brand/10'
                      : 'border-border hover:border-brand/50'
                  )}
                  onClick={() => handleIntentToggle(option.value)}
                >
                  <Checkbox
                    id={option.value}
                    checked={localIntentOnDaylight.includes(option.value)}
                    onCheckedChange={() => handleIntentToggle(option.value)}
                    className="shrink-0"
                  />
                  <Label
                    htmlFor={option.value}
                    className="flex-1 cursor-pointer font-medium text-sm sm:text-base"
                  >
                    {option.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Question 4: Gender Mix Comfort */}
          <div className="space-y-4">
            <Label className="text-base sm:text-lg font-semibold">
              How comfortable are you in mixed-gender groups?
            </Label>
            <RadioGroup
              value={localGenderMixComfort}
              onValueChange={(value: any) => setLocalGenderMixComfort(value)}
            >
              <div className="space-y-2 sm:space-y-3">
                {[
                  { value: 'TOTALLY_FINE', label: 'Totally fine' },
                  { value: 'PREFER_SAME_GENDER', label: 'Prefer same-gender table' },
                  { value: 'DEPENDS', label: 'Depends on the vibe' },
                ].map((option) => (
                  <div
                    key={option.value}
                    className={cn(
                      'flex items-center space-x-2 sm:space-x-3 p-3 sm:p-4 rounded-xl border-2 cursor-pointer transition-all active:scale-[0.98]',
                      localGenderMixComfort === option.value
                        ? 'border-brand bg-brand/10'
                        : 'border-border hover:border-brand/50'
                    )}
                    onClick={() => setLocalGenderMixComfort(option.value as any)}
                  >
                    <RadioGroupItem value={option.value} id={option.value} className="shrink-0" />
                    <Label
                      htmlFor={option.value}
                      className="flex-1 cursor-pointer font-medium text-sm sm:text-base"
                    >
                      {option.label}
                    </Label>
                  </div>
                ))}
              </div>
            </RadioGroup>
          </div>
        </motion.div>

        {/* Navigation */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4 pt-6 sm:pt-8">
          <Button
            variant="outline"
            onClick={() => router.push('/personality-test')}
            className='border border-r-4 border-b-4 border-black rounded-full font-bold text-sm sm:text-base h-11 sm:h-12 w-full sm:w-auto'
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>

          <Button
            onClick={handleSubmit}
            disabled={
              !localRelationshipStatus ||
              localIntentOnDaylight.length === 0 ||
              !localGenderMixComfort ||
              !localCurrentCityId ||
              submitMutation.isPending
            }
            className="bg-brand hover:bg-brand-orange-dark border border-r-4 border-b-4 border-black rounded-full font-bold text-white text-sm sm:text-base h-11 sm:h-12 w-full sm:w-auto"
          >
            {submitMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              'Complete & Create Account'
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}