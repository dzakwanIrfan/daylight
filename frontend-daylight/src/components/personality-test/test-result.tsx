'use client';

import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { Loader2, Sparkles, Download, Share2, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import Image from 'next/image';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { personalityService } from '@/services/personality.service';
import { usePersonalityTestStore } from '@/store/personality-test-store';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

// Mapping archetype to image paths
const archetypeImages: Record<string, string> = {
  BRIGHT_MORNING: '/images/archetypes/bright-morning.png',
  CALM_DAWN: '/images/archetypes/calm-dawn.png',
  BOLD_NOON: '/images/archetypes/bold-noon.png',
  GOLDEN_HOUR: '/images/archetypes/golden-hour.png',
  QUIET_DUSK: '/images/archetypes/quiet-dusk.png',
  CLOUDY_DAY: '/images/archetypes/cloudy-day.png',
  SERENE_DRIZZLE: '/images/archetypes/serene-drizzle.png',
  BLAZING_NOON: '/images/archetypes/blazing-noon.png',
  STARRY_NIGHT: '/images/archetypes/starry-night.png',
  PERFECT_DAY: '/images/archetypes/perfect-day.png',
};

// Personality dimensions with bipolar labels (like MBTI)
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

// Function to get position label (like MBTI)
function getPositionLabel(score: number): 'Strong' | 'Moderate' | 'Slight' | 'Balanced' {
  const distance = Math.abs(score - 50);
  if (distance < 10) return 'Balanced';
  if (distance < 25) return 'Slight';
  if (distance < 40) return 'Moderate';
  return 'Strong';
}

// Function to get which side is dominant
function getDominantSide(score: number, leftLabel: string, rightLabel: string) {
  if (Math.abs(score - 50) < 10) {
    return { side: 'Balanced', label: `${leftLabel} / ${rightLabel}` };
  }
  return score > 50 
    ? { side: 'right', label: rightLabel }
    : { side: 'left', label: leftLabel };
}

export function TestResult() {
  const router = useRouter();
  const { sessionId, reset } = usePersonalityTestStore();

  const { data: result, isLoading } = useQuery({
    queryKey: ['personality-result', sessionId],
    queryFn: () => personalityService.getResult(sessionId),
    enabled: !!sessionId,
  });

  useEffect(() => {
    if (!sessionId) {
      router.push('/personality-test');
    }
  }, [sessionId, router]);

  const handleContinueToRegister = () => {
    
    if (!sessionId) {
      toast.error('Session expired', {
        description: 'Please take the test again.',
      });
      router.push('/personality-test');
      return;
    }
    
    router.push('/auth/register');
  };

  const handleShare = async () => {
    if (!result) return;
    
    try {
      if (navigator.share) {
        await navigator.share({
          title: `I'm a ${result.archetype.name} on DayLight!`,
          text: result.archetype.description,
          url: window.location.href,
        });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        toast.success('Link copied to clipboard!');
      }
    } catch (error) {
      toast.error('Share failed. Please try again later.');
    }
  };

  const handleDownload = () => {
    toast.info('Download feature coming soon!');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 animate-spin text-brand mx-auto" />
          <p className="text-muted-foreground font-medium">Analyzing your personality...</p>
          <p className="text-sm text-muted-foreground">Finding your perfect day ☀️</p>
        </div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center space-y-4">
          <p className="text-muted-foreground">No results found</p>
          <Button 
            onClick={() => router.push('/personality-test')}
            className="bg-brand hover:bg-brand-dark text-white"
          >
            Take the test
          </Button>
        </div>
      </div>
    );
  }

  const archetype = result.archetype;
  const archetypeImage = archetypeImages[archetype.type] || '/images/archetypes/default.png';

  return (
    <div className="min-h-screen bg-background py-8 md:py-12 px-4">
      <div className="max-w-4xl mx-auto space-y-6 md:space-y-8">
        {/* Header Actions */}
        <div className="flex justify-between items-center">
          <h1 className="text-xl md:text-2xl logo-text font-bold text-black">
            DayLight
          </h1>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleShare}
              className="border-2 border-black rounded-full hover:shadow-brutal-sm transition-all text-xs md:text-sm"
            >
              <Share2 className="w-3 h-3 md:w-4 md:h-4 md:mr-2" />
              <span className="hidden md:inline">Share</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownload}
              className="border-2 border-black rounded-full hover:shadow-brutal-sm transition-all text-xs md:text-sm"
            >
              <Download className="w-3 h-3 md:w-4 md:h-4 md:mr-2" />
              <span className="hidden md:inline">Download</span>
            </Button>
          </div>
        </div>

        {/* Main Result Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-2xl md:rounded-3xl border-4 border-black bg-white shadow-brutal-md"
        >
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,80,5,0.3),transparent_50%)]" />
          </div>

          <div className="relative z-10 p-6 md:p-12 space-y-6 md:space-y-8">
            {/* Archetype Image */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              className="flex justify-center"
            >
              <div className="relative w-72 h-72 mx-auto">
                <Image
                  src={archetypeImage}
                  alt={archetype.name}
                  fill
                  className="object-contain"
                />
              </div>
            </motion.div>

            {/* Archetype Info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-center space-y-3 md:space-y-4"
            >
              <div className="inline-flex items-center justify-center px-4 md:px-6 py-2 rounded-full bg-brand/10 border-2 border-brand">
                <span className="text-2xl md:text-3xl mr-2">{archetype.symbol}</span>
                <span className="text-xs md:text-sm font-bold text-brand uppercase tracking-wide">
                  Your Day Archetype
                </span>
              </div>

              <h1 className="text-4xl md:text-7xl font-heading font-black leading-none">
                <span className="text-brand">
                  {archetype.name}
                </span>
              </h1>

              <p className="text-lg md:text-2xl text-foreground/80 max-w-2xl mx-auto font-medium leading-relaxed px-4">
                {archetype.description}
              </p>

              {/* Traits */}
              <div className="flex flex-wrap justify-center gap-2 md:gap-3 pt-4">
                {archetype.traits.map((trait: string, index: number) => (
                  <motion.span
                    key={trait}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.4 + index * 0.1 }}
                    className="px-4 md:px-6 py-2 md:py-3 rounded-full bg-brand text-white font-bold text-sm md:text-lg border-2 border-black shadow-brutal-sm hover:shadow-none transition-all"
                  >
                    {trait}
                  </motion.span>
                ))}
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Personality Profile - MBTI Style */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="border-4 border-black shadow-brutal-md">
            <CardContent className="pt-6 md:pt-8 space-y-6">
              <div className="space-y-2">
                <h3 className="text-xl md:text-2xl font-black flex items-center gap-2">
                  <Sparkles className="w-5 h-5 md:w-6 md:h-6 text-brand" />
                  Your Personality Profile
                </h3>
                <p className="text-sm md:text-base text-muted-foreground">
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
                        <h4 className="font-bold text-base md:text-lg text-center md:text-left">
                          {!isBalanced && (
                            <>
                              <span className="text-brand">{strength}</span>
                              {' '}
                            </>
                          )}
                          {dominant.label}
                        </h4>
                        <p className="text-xs md:text-sm text-muted-foreground text-center md:text-left">
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

                        {/* Strength Indicator (if not balanced) */}
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
                    <h4 className="font-bold text-brand text-sm md:text-base">What This Means</h4>
                    <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">
                      Your personality profile helps us match you with people who complement your style. 
                      There's no "better" or "worse" — every profile brings unique value to connections and conversations.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="text-center space-y-4 md:space-y-6 pt-6 md:pt-8"
        >
          <div className="space-y-2 md:space-y-3 px-4">
            <h3 className="text-2xl md:text-4xl font-black">
              Ready to Meet Your Kind of People?
            </h3>
            <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto font-medium">
              Create your account to start connecting with compatible people who share your vibe
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center pt-4 px-4">
            <Button
              size="lg"
              className="w-full sm:w-auto bg-brand hover:bg-brand-dark text-white border-2 border-black rounded-full font-black text-base md:text-lg px-6 md:px-8 py-5 md:py-6 shadow-brutal-md hover:shadow-brutal transition-all"
              onClick={handleContinueToRegister}
            >
              Create Account & Join Events
              <ArrowRight className="ml-2 w-4 h-4 md:w-5 md:h-5" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => {
                reset();
                router.push('/personality-test');
              }}
              className="w-full sm:w-auto border-2 border-black rounded-full font-black text-base md:text-lg px-6 md:px-8 py-5 md:py-6 shadow-brutal-md hover:shadow-brutal transition-all"
            >
              Retake Test
            </Button>
          </div>

          <p className="text-xs md:text-sm text-muted-foreground pt-4 px-4">
            Your results are saved and will be linked to your account
          </p>
        </motion.div>
      </div>
    </div>
  );
}