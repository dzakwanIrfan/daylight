'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQuery } from '@tanstack/react-query';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
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

  // Wrap queryFn properly for React Query v5
  const { data: cityOptions, isLoading: isLoadingCities } = useQuery<CityOption[]>({
    queryKey: ['city-options'],
    queryFn: () => locationService.getCityOptions(),
  });

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
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-3xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl logo-text font-bold text-brand">
            DayLight
          </h1>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-12"
        >
          <div className="text-center space-y-2">
            <h2 className="text-3xl md:text-4xl font-heading font-bold">
              Just a Few More Questions
            </h2>
            <p className="text-muted-foreground text-lg">
              Help us understand your preferences better
            </p>
          </div>

          {/* Question 1: Current City */}
          <div className="space-y-4">
            <Label className="text-lg font-semibold">
              Which city are you currently in?  *
            </Label>
            <div className="flex flex-col space-y-2">
              <Select
                value={localCurrentCityId}
                onValueChange={setLocalCurrentCityId}
                disabled={isLoadingCities}
              >
                <SelectTrigger className={cn(
                  'w-full h-14 text-base',
                  localCurrentCityId ? 'border-brand' : ''
                )}>
                  <SelectValue placeholder={isLoadingCities ? 'Loading cities...' : 'Select your city'} />
                </SelectTrigger>
                <SelectContent>
                  {cityOptions && cityOptions.map((city) => (
                    <SelectItem key={city.id} value={city.id}>
                      {city.name}, {city.country?.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground">
                We'll show you events happening in your city
              </p>
            </div>
          </div>

          {/* Question 2: Relationship Status */}
          <div className="space-y-4">
            <Label className="text-lg font-semibold">
              What's your current relationship status?
            </Label>
            <RadioGroup
              value={localRelationshipStatus}
              onValueChange={(value: any) => setLocalRelationshipStatus(value)}
            >
              <div className="space-y-3">
                {[
                  { value: 'SINGLE', label: 'Single' },
                  { value: 'MARRIED', label: 'Married / In a relationship' },
                  { value: 'PREFER_NOT_SAY', label: 'Prefer not to say' },
                ].map((option) => (
                  <div
                    key={option.value}
                    className={cn(
                      'flex items-center space-x-3 p-4 rounded-xl border-2 cursor-pointer transition-all',
                      localRelationshipStatus === option.value
                        ? 'border-brand bg-brand/10'
                        : 'border-border hover:border-brand/50'
                    )}
                    onClick={() => setLocalRelationshipStatus(option.value as any)}
                  >
                    <RadioGroupItem value={option.value} id={option.value} />
                    <Label
                      htmlFor={option.value}
                      className="flex-1 cursor-pointer font-medium"
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
            <Label className="text-lg font-semibold">
              What are you looking for on DayLight? (Select all that apply)
            </Label>
            <div className="space-y-3">
              {intentOptions.map((option) => (
                <div
                  key={option.value}
                  className={cn(
                    'flex items-center space-x-3 p-4 rounded-xl border-2 cursor-pointer transition-all',
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
                  />
                  <Label
                    htmlFor={option.value}
                    className="flex-1 cursor-pointer font-medium"
                  >
                    {option.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Question 4: Gender Mix Comfort */}
          <div className="space-y-4">
            <Label className="text-lg font-semibold">
              How comfortable are you in mixed-gender groups?
            </Label>
            <RadioGroup
              value={localGenderMixComfort}
              onValueChange={(value: any) => setLocalGenderMixComfort(value)}
            >
              <div className="space-y-3">
                {[
                  { value: 'TOTALLY_FINE', label: 'Totally fine' },
                  { value: 'PREFER_SAME_GENDER', label: 'Prefer same-gender table' },
                  { value: 'DEPENDS', label: 'Depends on the vibe' },
                ].map((option) => (
                  <div
                    key={option.value}
                    className={cn(
                      'flex items-center space-x-3 p-4 rounded-xl border-2 cursor-pointer transition-all',
                      localGenderMixComfort === option.value
                        ? 'border-brand bg-brand/10'
                        : 'border-border hover:border-brand/50'
                    )}
                    onClick={() => setLocalGenderMixComfort(option.value as any)}
                  >
                    <RadioGroupItem value={option.value} id={option.value} />
                    <Label
                      htmlFor={option.value}
                      className="flex-1 cursor-pointer font-medium"
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
        <div className="flex items-center justify-between pt-8">
          <Button
            variant="outline"
            onClick={() => router.push('/personality-test')}
            className='border border-r-4 border-b-4 border-black rounded-full font-bold'
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
            className="bg-brand hover:bg-brand-orange-dark border border-r-4 border-b-4 border-black rounded-full font-bold text-white"
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