'use client';

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ArrowRight, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid';

import { Button } from '@/components/ui/button';
import { personalityService } from '@/services/personality.service';
import { usePersonalityTestStore } from '@/store/personality-test-store';
import { QuestionCard } from './question-card';
import { ProgressBar } from './progress-bar';

export function PersonalityTest() {
  const router = useRouter();
  const {
    sessionId,
    answers,
    currentQuestion,
    setSessionId,
    setAnswer,
    setCurrentQuestion,
  } = usePersonalityTestStore();

  // Initialize session ID
  useEffect(() => {
    if (!sessionId) {
      setSessionId(uuidv4());
    }
  }, [sessionId, setSessionId]);

  // Fetch questions
  const { data: questions, isLoading } = useQuery({
    queryKey: ['personality-questions'],
    queryFn: personalityService.getQuestions,
  });

  // ENHANCED: Filter only core questions (not context questions)
  const coreQuestions = questions?.filter((q: any) => q.questionNumber <= 12) || [];
  const totalQuestions = coreQuestions.length;

  const currentQuestionData = coreQuestions.find(
    (q: any) => q.questionNumber === currentQuestion
  );

  const selectedAnswer = answers.find(
    (a) => a.questionNumber === currentQuestion
  );

  const handleSelectOption = (optionKey: string) => {
    setAnswer(currentQuestion, optionKey);
  };

  const handleNext = () => {
    if (!selectedAnswer) {
      toast.error('Please select an answer', {
        description: 'Choose the option that best describes you',
      });
      return;
    }

    if (currentQuestion < totalQuestions) {
      setCurrentQuestion(currentQuestion + 1);
      // Smooth scroll to top
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      // All core questions answered, move to context questions
      router.push('/personality-test/context');
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 1) {
      setCurrentQuestion(currentQuestion - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center space-y-4">
          <Loader2 className="w-8 h-8 animate-spin text-brand mx-auto" />
          <p className="text-muted-foreground font-medium">Loading questions...</p>
        </div>
      </div>
    );
  }

  if (!currentQuestionData) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center space-y-4">
          <p className="text-muted-foreground">Question not found</p>
          <Button onClick={() => router.push('/')}>Go Home</Button>
        </div>
      </div>
    );
  }

  const progress = {
    current: currentQuestion,
    total: totalQuestions,
  };

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl logo-text font-bold text-black">
            DayLight
          </h1>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              if (confirm('Are you sure you want to exit? Your progress will be saved.')) {
                router.push('/');
              }
            }}
            className="font-bold"
          >
            Exit
          </Button>
        </div>

        {/* Progress */}
        <ProgressBar current={progress.current} total={progress.total} />

        {/* Question */}
        <QuestionCard
          question={currentQuestionData}
          selectedOption={selectedAnswer?.selectedOption}
          onSelect={handleSelectOption}
        />

        {/* Navigation */}
        <div className="flex items-center justify-between pt-8">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentQuestion === 1}
            className="border border-r-4 border-b-4 border-black rounded-full font-bold"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Previous
          </Button>

          <div className="text-sm text-muted-foreground font-medium">
            {currentQuestion === totalQuestions ? 'Last question!' : `${totalQuestions - currentQuestion} questions left`}
          </div>

          <Button
            onClick={handleNext}
            disabled={!selectedAnswer}
            className="bg-brand hover:bg-brand-orange-dark text-white border border-r-4 border-b-4 border-black rounded-full font-bold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {currentQuestion === totalQuestions ? 'Continue' : 'Next'}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}