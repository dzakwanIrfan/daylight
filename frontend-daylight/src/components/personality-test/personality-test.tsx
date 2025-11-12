'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
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

  const currentQuestionData = questions?.find(
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
      toast.error('Please select an answer');
      return;
    }

    if (currentQuestion < (questions?.length || 15)) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      // Move to context questions
      router.push('/personality-test/context');
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 1) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-brand" />
      </div>
    );
  }

  if (!currentQuestionData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground">Question not found</p>
      </div>
    );
  }

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
            onClick={() => router.push('/')}
          >
            Exit
          </Button>
        </div>

        {/* Progress */}
        <ProgressBar current={currentQuestion} total={questions?.length || 15} />

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
            className='border border-r-4 border-b-4 border-black rounded-full font-bold'
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Previous
          </Button>

          <Button
            onClick={handleNext}
            disabled={!selectedAnswer}
            className="bg-brand hover:bg-brand-orange-dark text-white border border-r-4 border-b-4 border-black rounded-full font-bold"
          >
            {currentQuestion === questions?.length ? 'Continue' : 'Next'}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}