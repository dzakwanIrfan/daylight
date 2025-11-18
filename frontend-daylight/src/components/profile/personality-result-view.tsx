'use client';

import { useQuery } from '@tanstack/react-query';
import { Loader2, Sparkles, Share2, ArrowRight, Eye } from 'lucide-react';
import { motion } from 'framer-motion';
import Image, { StaticImageData } from 'next/image';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { personalityService } from '@/services/personality.service';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

// Statically import images
import BRIGHT_MORNING_IMG from '../../../public/images/archetypes/bright-morning.png';
import CALM_DAWN_IMG from '../../../public/images/archetypes/calm-dawn.png';
import BOLD_NOON_IMG from '../../../public/images/archetypes/bold-noon.png';
import GOLDEN_HOUR_IMG from '../../../public/images/archetypes/golden-hour.png';
import QUIET_DUSK_IMG from '../../../public/images/archetypes/quiet-dusk.png';
import CLOUDY_DAY_IMG from '../../../public/images/archetypes/cloudy-day.png';
import SERENE_DRIZZLE_IMG from '../../../public/images/archetypes/serene-drizzle.png';
import BLAZING_NOON_IMG from '../../../public/images/archetypes/blazing-noon.png';
import STARRY_NIGHT_IMG from '../../../public/images/archetypes/starry-night.png';
import PERFECT_DAY_IMG from '../../../public/images/archetypes/perfect-day.png';
import DEFAULT_IMG from '../../../public/images/archetypes/default.png';

// Mapping archetype to image data
const archetypeImages: Record<string, StaticImageData> = {
  BRIGHT_MORNING: BRIGHT_MORNING_IMG,
  CALM_DAWN: CALM_DAWN_IMG,
  BOLD_NOON: BOLD_NOON_IMG,
  GOLDEN_HOUR: GOLDEN_HOUR_IMG,
  QUIET_DUSK: QUIET_DUSK_IMG,
  CLOUDY_DAY: CLOUDY_DAY_IMG,
  SERENE_DRIZZLE: SERENE_DRIZZLE_IMG,
  BLAZING_NOON: BLAZING_NOON_IMG,
  STARRY_NIGHT: STARRY_NIGHT_IMG,
  PERFECT_DAY: PERFECT_DAY_IMG,
};

// Personality dimensions
const personalityDimensions = [
  {
    key: 'energy',
    leftLabel: 'Extroverted',
    rightLabel: 'Introverted',
    leftIcon: '🌟',
    rightIcon: '🌙',
    description: 'How you energize and interact with the world',
  },
  {
    key: 'openness',
    leftLabel: 'Abstract',
    rightLabel: 'Practical',
    leftIcon: '🎨',
    rightIcon: '🔧',
    description: 'Your approach to ideas and experiences',
  },
  {
    key: 'structure',
    leftLabel: 'Flexible',
    rightLabel: 'Structured',
    leftIcon: '🌊',
    rightIcon: '📋',
    description: 'How you prefer to organize your life',
  },
  {
    key: 'affect',
    leftLabel: 'Feeling',
    rightLabel: 'Thinking',
    leftIcon: '❤️',
    rightIcon: '🧠',
    description: 'How you make decisions',
  },
  {
    key: 'comfort',
    leftLabel: 'Reserved',
    rightLabel: 'Outgoing',
    leftIcon: '🤝',
    rightIcon: '🎉',
    description: 'Your comfort with new people',
  },
  {
    key: 'lifestyle',
    leftLabel: 'Conscious',
    rightLabel: 'Premium',
    leftIcon: '☕',
    rightIcon: '🍷',
    description: 'Your lifestyle preferences',
  },
];

function getPositionLabel(score: number): 'Strong' | 'Moderate' | 'Slight' | 'Balanced' {
  const distance = Math.abs(score - 50);
  if (distance < 10) return 'Balanced';
  if (distance < 25) return 'Slight';
  if (distance < 40) return 'Moderate';
  return 'Strong';
}

function getDominantSide(score: number, leftLabel: string, rightLabel: string) {
  if (Math.abs(score - 50) < 10) {
    return { side: 'Balanced', label: `${leftLabel} / ${rightLabel}` };
  }
  return score > 50 
    ? { side: 'right', label: rightLabel }
    : { side: 'left', label: leftLabel };
}

export function PersonalityResultView() {
  const { data: result, isLoading, error } = useQuery({
    queryKey: ['my-personality-result'],
    queryFn: () => personalityService.getMyResult(),
    retry: false,
  });

  const handleShare = async () => {
    if (!result) return;
    
    try {
      const shareText = `I'm a ${result.archetype.name} on DayLight! ${result.archetype.description}`;
      
      if (navigator.share) {
        await navigator.share({
          title: `My DayLight Personality: ${result.archetype.name}`,
          text: shareText,
        });
      } else {
        await navigator.clipboard.writeText(shareText);
        toast.success('Copied to clipboard!');
      }
    } catch (error) {
      console.error('Share failed:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 animate-spin text-brand mx-auto" />
          <p className="text-muted-foreground font-medium">Loading your personality result...</p>
        </div>
      </div>
    );
  }

  if (error || !result) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
          <Eye className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-semibold mb-2">No Persona Test Results</h3>
        <p className="text-muted-foreground max-w-md mx-auto mb-6">
          You haven't completed the persona test yet. Take the test to discover your day archetype and get better event recommendations!
        </p>
        <Button
          onClick={() => window.open('/personality-test', '_blank')}
          className="bg-brand hover:bg-brand/90 shadow-brutal hover:shadow-brutal-sm border-2 border-black rounded-full font-bold text-white"
        >
          Take Persona Test
          <ArrowRight className="ml-2 w-4 h-4" />
        </Button>
      </div>
    );
  }

  const archetype = result.archetype;
  const archetypeImage: StaticImageData = archetypeImages[archetype.type] || DEFAULT_IMG;

  return (
    <div className="space-y-6">
      {/* Header with Share Button */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold mb-1">Your Personality Result</h3>
          <p className="text-sm text-muted-foreground">
            Taken on {new Date(result.createdAt).toLocaleDateString('en-US', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleShare}
          className="border-2 border-black rounded-full hover:shadow-brutal-sm transition-all"
        >
          <Share2 className="w-4 h-4 mr-2" />
          Share
        </Button>
      </div>

      {/* Main Result Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl border-4 border-black bg-white shadow-brutal-md"
      >
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,80,5,0.3),transparent_50%)]" />
        </div>

        <div className="relative z-10 p-8 space-y-6">
          {/* Archetype Image */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="flex justify-center"
          >
            <div className="relative w-56 h-56 mx-auto">
              <Image
                src={archetypeImage}
                alt={`${archetype.name} illustration`}
                fill
                priority
                placeholder="blur"
                sizes="14rem"
                quality={85}
                className="object-contain"
              />
            </div>
          </motion.div>

          {/* Archetype Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-center space-y-3"
          >
            <div className="inline-flex items-center justify-center px-6 py-2 rounded-full bg-brand/10 border-2 border-brand">
              <span className="text-2xl mr-2">{archetype.symbol}</span>
              <span className="text-sm font-bold text-brand uppercase tracking-wide">
                Your Day Archetype
              </span>
            </div>

            <h2 className="text-5xl font-heading font-black leading-none">
              <span className="text-brand">
                {archetype.name}
              </span>
            </h2>

            <p className="text-xl text-foreground/80 max-w-2xl mx-auto font-medium leading-relaxed">
              {archetype.description}
            </p>

            {/* Traits */}
            <div className="flex flex-wrap justify-center gap-2 pt-4">
              {archetype.traits.map((trait: string, index: number) => (
                <motion.span
                  key={trait}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.4 + index * 0.1 }}
                  className="px-5 py-2 rounded-full bg-brand text-white font-bold text-base border-2 border-black shadow-brutal-sm hover:shadow-none transition-all"
                >
                  {trait}
                </motion.span>
              ))}
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Personality Profile */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Card className="border-4 border-black shadow-brutal-md">
          <CardContent className="pt-8 space-y-6">
            <div className="space-y-2">
              <h3 className="text-2xl font-black flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-brand" />
                Your Personality Profile
              </h3>
              <p className="text-base text-muted-foreground">
                Understanding your unique characteristics and preferences
              </p>
            </div>

            <div className="space-y-8">
              {personalityDimensions.map((dimension, index) => {
                const scoreValue = result.scores[dimension.key as keyof typeof result.scores];
                const dominant = getDominantSide(scoreValue, dimension.leftLabel, dimension.rightLabel);
                const strength = getPositionLabel(scoreValue);
                const isBalanced = strength === 'Balanced';

                return (
                  <motion.div
                    key={dimension.key}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 + index * 0.1 }}
                    className="space-y-4"
                  >
                    {/* Dimension Header */}
                    <div className="space-y-0">
                      <h4 className="font-bold text-lg text-center md:text-left">
                        {!isBalanced && (
                          <>
                            <span className="text-brand">{strength}</span>
                            {' '}
                          </>
                        )}
                        {dominant.label}
                      </h4>
                      <p className="text-sm text-muted-foreground text-center md:text-left">
                        {dimension.description}
                      </p>
                    </div>

                    {/* Bipolar Scale Visualization */}
                    <div className="space-y-3">
                      {/* Desktop View - Horizontal */}
                      <div className="hidden md:flex items-center gap-3">
                        {/* Left Label */}
                        <div className={cn(
                          "flex items-center gap-2 px-4 py-2 rounded-lg border-2 transition-all min-w-40 justify-center",
                          scoreValue < 40 
                            ? "bg-brand/10 border-brand font-bold" 
                            : "bg-muted border-border"
                        )}>
                          <span className="text-lg">{dimension.leftIcon}</span>
                          <span className="text-sm font-medium whitespace-nowrap">{dimension.leftLabel}</span>
                        </div>

                        {/* Scale Bar */}
                        <div className="flex-1 relative h-3 bg-muted rounded-full border-2 border-black overflow-hidden min-w-[200px]">
                          {/* Center Line */}
                          <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-black z-10" />
                          
                          {/* Indicator */}
                          <motion.div
                            className="absolute top-1/2 -translate-y-1/2 w-6 h-6 bg-brand border-2 border-black rounded-full shadow-brutal-sm z-20"
                            initial={{ left: '50%' }}
                            animate={{ left: `${scoreValue}%` }}
                            transition={{ delay: 0.7 + index * 0.1, duration: 0.8, ease: 'easeOut' }}
                            style={{ marginLeft: '-12px' }}
                          />
                        </div>

                        {/* Right Label */}
                        <div className={cn(
                          "flex items-center gap-2 px-4 py-2 rounded-lg border-2 transition-all min-w-40 justify-center",
                          scoreValue > 60 
                            ? "bg-brand/10 border-brand font-bold" 
                            : "bg-muted border-border"
                        )}>
                          <span className="text-sm font-medium whitespace-nowrap">{dimension.rightLabel}</span>
                          <span className="text-lg">{dimension.rightIcon}</span>
                        </div>
                      </div>

                      {/* Mobile View - Vertical */}
                      <div className="md:hidden space-y-3">
                        {/* Labels Row */}
                        <div className="flex justify-between gap-2">
                          <div className={cn(
                            "flex items-center gap-1.5 px-3 py-2 rounded-lg border-2 transition-all flex-1 justify-center",
                            scoreValue < 40 
                              ? "bg-brand/10 border-brand font-bold" 
                              : "bg-muted border-border"
                          )}>
                            <span className="text-base">{dimension.leftIcon}</span>
                            <span className="text-xs font-medium">{dimension.leftLabel}</span>
                          </div>

                          <div className={cn(
                            "flex items-center gap-1.5 px-3 py-2 rounded-lg border-2 transition-all flex-1 justify-center",
                            scoreValue > 60 
                              ? "bg-brand/10 border-brand font-bold" 
                              : "bg-muted border-border"
                          )}>
                            <span className="text-xs font-medium">{dimension.rightLabel}</span>
                            <span className="text-base">{dimension.rightIcon}</span>
                          </div>
                        </div>

                        {/* Scale Bar */}
                        <div className="relative h-3 bg-muted rounded-full border-2 border-black overflow-hidden">
                          {/* Center Line */}
                          <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-black z-10" />
                          
                          {/* Indicator */}
                          <motion.div
                            className="absolute top-1/2 -translate-y-1/2 w-5 h-5 bg-brand border-2 border-black rounded-full shadow-brutal-sm z-20"
                            initial={{ left: '50%' }}
                            animate={{ left: `${scoreValue}%` }}
                            transition={{ delay: 0.7 + index * 0.1, duration: 0.8, ease: 'easeOut' }}
                            style={{ marginLeft: '-10px' }}
                          />
                        </div>
                      </div>

                      {/* Strength Indicator */}
                      {!isBalanced && (
                        <div className="text-center">
                          <span className="text-xs font-medium text-muted-foreground px-3 py-1 bg-muted rounded-full border border-border inline-block">
                            {strength} preference
                          </span>
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Compatibility Note */}
            <div className="pt-6 border-t-2 border-border">
              <div className="flex items-start gap-3 p-4 rounded-xl bg-brand/5 border-2 border-brand/20">
                <Sparkles className="w-5 h-5 text-brand mt-0.5 shrink-0" />
                <div className="space-y-1">
                  <h4 className="font-bold text-brand text-base">What This Means</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Your personality profile helps us match you with people who complement your style. 
                    There's no "better" or "worse" — every profile brings unique value to connections and conversations.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}