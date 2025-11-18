'use client';

import { useForm, useFieldArray } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { Loader2, Plus, Trash2 } from 'lucide-react';
import { CreatePersonaQuestionPayload } from '@/types/admin-persona-question.types';
import { useAdminPersonaQuestionMutations } from '@/hooks/use-admin-persona-questions';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export function CreateQuestionForm() {
  const router = useRouter();
  const { createQuestion } = useAdminPersonaQuestionMutations();

  const { register, handleSubmit, formState: { errors }, control, watch, setValue } = useForm<CreatePersonaQuestionPayload>({
    defaultValues: {
      questionNumber: 1,
      section: '',
      prompt: '',
      type: 'single-choice',
      isActive: true,
      order: 1,
      options: [
        { optionKey: 'A', text: '', traitImpacts: '{}' },
        { optionKey: 'B', text: '', traitImpacts: '{}' },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'options',
  });

  useEffect(() => {
    if (createQuestion.isSuccess) {
      router.push('/admin/persona-questions');
    }
  }, [createQuestion.isSuccess, router]);

  const onSubmit = (data: CreatePersonaQuestionPayload) => {
    // Parse traitImpacts JSON strings to objects
    const processedData = {
      ...data,
      options: data.options.map(option => {
        let traitImpacts = option.traitImpacts;
        
        // If it's a string, try to parse it
        if (typeof traitImpacts === 'string') {
          try {
            traitImpacts = JSON.parse(traitImpacts as string);
          } catch (e) {
            // If parsing fails, keep empty object
            traitImpacts = {};
          }
        }
        
        return {
          ...option,
          traitImpacts,
        };
      }),
    };

    createQuestion.mutate(processedData);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Basic Information */}
      <Card className="p-6 bg-white">
        <h3 className="text-lg font-semibold mb-4">Basic Information</h3>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="questionNumber">Question Number *</Label>
            <Input
              id="questionNumber"
              type="number"
              {...register('questionNumber', { 
                required: 'Question number is required',
                min: { value: 1, message: 'Must be at least 1' }
              })}
            />
            {errors.questionNumber && (
              <p className="text-xs text-red-600">{errors.questionNumber.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="order">Display Order *</Label>
            <Input
              id="order"
              type="number"
              {...register('order', { 
                required: 'Order is required',
                min: { value: 0, message: 'Must be at least 0' }
              })}
            />
            {errors.order && (
              <p className="text-xs text-red-600">{errors.order.message}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="section">Section *</Label>
            <Input
              id="section"
              placeholder="e.g., traits, preferences"
              {...register('section', { required: 'Section is required' })}
            />
            {errors.section && (
              <p className="text-xs text-red-600">{errors.section.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">Question Type *</Label>
            <Select
              value={watch('type')}
              onValueChange={(value) => setValue('type', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-white">
                <SelectItem value="single-choice">Single Choice</SelectItem>
                <SelectItem value="multiple-choice">Multiple Choice</SelectItem>
                <SelectItem value="scale">Scale</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2 mt-4">
          <Label htmlFor="prompt">Question Prompt *</Label>
          <Textarea
            id="prompt"
            placeholder="Enter the question..."
            rows={3}
            {...register('prompt', { required: 'Question prompt is required' })}
          />
          {errors.prompt && (
            <p className="text-xs text-red-600">{errors.prompt.message}</p>
          )}
        </div>

        <div className="space-y-2 mt-4">
          <Label htmlFor="isActive">Status</Label>
          <Select
            value={watch('isActive') ? 'active' : 'inactive'}
            onValueChange={(value) => setValue('isActive', value === 'active')}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-white">
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* Options */}
      <Card className="p-6 bg-white">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Answer Options</h3>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => append({ 
              optionKey: String.fromCharCode(65 + fields.length), 
              text: '', 
              traitImpacts: '{}' 
            })}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Option
          </Button>
        </div>

        <div className="space-y-4">
          {fields.map((field, index) => (
            <div key={field.id} className="p-4 border rounded-lg space-y-3 bg-gray-50">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-sm text-gray-700">Option {index + 1}</h4>
                {fields.length > 2 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => remove(index)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>

              <div className="grid grid-cols-4 gap-3">
                <div className="space-y-2">
                  <Label>Key</Label>
                  <Input
                    {...register(`options.${index}.optionKey`, { required: 'Required' })}
                    placeholder="A"
                  />
                </div>

                <div className="col-span-3 space-y-2">
                  <Label>Option Text *</Label>
                  <Input
                    {...register(`options.${index}.text`, { required: 'Required' })}
                    placeholder="Enter option text..."
                  />
                  {errors.options?.[index]?.text && (
                    <p className="text-xs text-red-600">{errors.options[index]?.text?.message}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Trait Impacts (JSON)</Label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-6 text-xs"
                    onClick={() => {
                      const currentValue = watch(`options.${index}.traitImpacts`);
                      try {
                        const parsed = typeof currentValue === 'string' 
                          ? JSON.parse(currentValue) 
                          : currentValue;
                        const formatted = JSON.stringify(parsed, null, 2);
                        setValue(`options.${index}.traitImpacts`, formatted);
                      } catch (e) {
                        // Already formatted or invalid
                      }
                    }}
                  >
                    Format JSON
                  </Button>
                </div>
                <Textarea
                  {...register(`options.${index}.traitImpacts`)}
                  placeholder='{"energy": 1, "openness": 0.5}'
                  rows={4}
                  className="font-mono text-xs"
                />
                <p className="text-xs text-gray-500">
                  Example: {`{"energy": 1, "openness": 0.5, "structure": -0.3}`}
                </p>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Actions */}
      <div className="flex items-center justify-end gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={createQuestion.isPending}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={createQuestion.isPending}
          className="bg-brand hover:bg-brand-dark border border-black text-white font-bold"
        >
          {createQuestion.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Create Question
        </Button>
      </div>
    </form>
  );
}