'use client';

import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { Loader2, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { personalityService } from '@/services/personality.service';
import { usePersonalityTestStore } from '@/store/personality-test-store';

const archetypeEmojis: Record<string, string> = {
  BRIGHT_MORNING: '☀️',
  CALM_DAWN: '🌅',
  BOLD_NOON: '☀️',
  GOLDEN_HOUR: '🌇',
  QUIET_DUSK: '🌙',
  CLOUDY_DAY: '☁️',
  SERENE_DRIZZLE: '🌧️',
  BLAZING_NOON: '🔥',
  STARRY_NIGHT: '⭐',
  PERFECT_DAY: '🌈',
};

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
    router.push('/register');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 animate-spin text-brand mx-auto" />
          <p className="text-muted-foreground">Analyzing your personality...</p>
        </div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <p className="text-muted-foreground">No results found</p>
          <Button onClick={() => router.push('/personality-test')}>
            Take the test
          </Button>
        </div>
      </div>
    );
  }

  const archetype = result.archetype;
  const emoji = archetypeEmojis[archetype.type] || '🌟';

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
            className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-brand/10 mb-4"
          >
            <span className="text-6xl">{emoji}</span>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h1 className="text-4xl md:text-5xl font-heading font-bold mb-2">
              You're a{' '}
              <span className="text-brand">{archetype.name}</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              {archetype.description}
            </p>
          </motion.div>
        </div>

        {/* Traits */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="border-2">
            <CardContent>
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <Sparkles className="w-5 h-5 mr-2 text-brand" />
                Your Key Traits
              </h3>
              <div className="flex flex-wrap gap-2">
                {archetype.traits.map((trait: string, index: number) => (
                  <motion.span
                    key={trait}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.4 + index * 0.1 }}
                    className="px-4 py-2 rounded-full bg-brand/10 text-brand font-medium"
                  >
                    {trait}
                  </motion.span>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Scores */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="border-2">
            <CardContent className="pt-6 space-y-4">
              <h3 className="text-lg font-semibold mb-4">Your Profile Scores</h3>
              
              {[
                { label: 'Energy Level', value: result.scores.energy, key: 'energy' },
                { label: 'Openness', value: result.scores.openness, key: 'openness' },
                { label: 'Structure', value: result.scores.structure, key: 'structure' },
                { label: 'Emotional Expression', value: result.scores.affect, key: 'affect' },
                { label: 'Social Comfort', value: result.scores.comfort, key: 'comfort' },
                { label: 'Lifestyle Preference', value: result.scores.lifestyle, key: 'lifestyle' },
              ].map((score, index) => (
                <div key={score.key} className="space-y-2">
                  <div className="flex justify-between items-center text-sm">
                    <span className="font-medium">{score.label}</span>
                    <span className="text-muted-foreground">
                      {Math.round(score.value)}%
                    </span>
                  </div>
                  <div className="w-full border border-black h-2 bg-muted rounded-full overflow-hidden">
                    <motion.div
                      className="h-full brand-gradient"
                      initial={{ width: 0 }}
                      animate={{ width: `${score.value}%` }}
                      transition={{ delay: 0.6 + index * 0.1, duration: 0.8 }}
                    />
                  </div>
                </div>
              ))}

              <div className="pt-4 border-t">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-lg">Overall Profile Score</span>
                  <span className="text-2xl font-bold text-brand">
                    {Math.round(result.scores.profile)}%
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="text-center space-y-4 pt-8"
        >
          <h3 className="text-2xl font-extrabold">
            Ready to Meet Your Kind of People?
          </h3>
          <p className="text-muted-foreground">
            Create your account to start connecting with compatible people
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Button
              size="lg"
              className="bg-brand hover:bg-brand-orange-dark border border-r-4 border-b-4 border-black rounded-full font-bold text-white"
              onClick={handleContinueToRegister}
            >
              Create Account
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => {
                reset();
                router.push('/personality-test');
              }}
              className='border border-r-4 border-b-4 border-black rounded-full font-bold'
            >
              Retake Test
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}