'use client';

import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface QuestionOption {
  id: string;
  optionKey: string;
  text: string;
}

interface Question {
  id: string;
  questionNumber: number;
  section: string;
  prompt: string;
  options: QuestionOption[];
}

interface QuestionCardProps {
  question: Question;
  selectedOption?: string;
  onSelect: (optionKey: string) => void;
}

export function QuestionCard({
  question,
  selectedOption,
  onSelect,
}: QuestionCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="w-full max-w-3xl mx-auto space-y-8"
    >
      <div className="space-y-4">
        <div className="text-sm font-medium text-brand">
          {question.section}
        </div>
        <h2 className="text-3xl md:text-4xl font-extrabold leading-none">
          {question.prompt}
        </h2>
      </div>

      <div className="space-y-3">
        {question.options.map((option, index) => (
          <motion.button
            key={option.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            onClick={() => onSelect(option.optionKey)}
            className={cn(
              'w-full p-6 rounded-2xl border-2 transition-all duration-200',
              'text-left flex items-center justify-between group',
              'hover:border-brand hover:bg-brand/5',
              selectedOption === option.optionKey
                ? 'border-brand bg-brand/10'
                : 'border-border bg-card'
            )}
          >
            <div className="flex items-start gap-4 flex-1">
              <div
                className={cn(
                  'flex items-center justify-center w-8 h-8 rounded-full',
                  'border-2 transition-all duration-200 shrink-0',
                  selectedOption === option.optionKey
                    ? 'border-brand bg-brand text-white'
                    : 'border-border bg-background group-hover:border-brand'
                )}
              >
                {selectedOption === option.optionKey ? (
                  <Check className="w-5 h-5" />
                ) : (
                  <span className="text-sm font-semibold">
                    {option.optionKey}
                  </span>
                )}
              </div>
              <span className="text-lg font-medium flex-1">
                {option.text}
              </span>
            </div>
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
}