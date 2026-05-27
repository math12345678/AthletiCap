import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { expenseSchema, type ExpenseFormData } from '../../lib/validation';
import { Input, Select, Button } from '../ui';
import { useToast } from '../ui';

const EXPENSE_CATEGORIES = [
  { value: 'COACHING', label: 'Coaching' },
  { value: 'TRAVEL', label: 'Travel' },
  { value: 'TRAINING', label: 'Training & Facilities' },
  { value: 'EVENTS', label: 'Events & Camps' },
  { value: 'EQUIPMENT', label: 'Equipment' },
  { value: 'REGISTRATION', label: 'Registration Fees' },
  { value: 'OTHER', label: 'Other' },
];

interface ExpenseFormProps {
  onSubmit: (data: ExpenseFormData) => Promise<void>;
  isLoading?: boolean;
}

export const ExpenseForm: React.FC<ExpenseFormProps> = ({ onSubmit, isLoading = false }) => {
  const { addToast } = useToast();
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ExpenseFormData>({
    resolver: zodResolver(expenseSchema),
    defaultValues: {
      amount: 0,
      category: '',
      date: new Date().toISOString().split('T')[0],
      description: '',
    },
  });

  const onFormSubmit = async (data: ExpenseFormData) => {
    try {
      await onSubmit(data);
      reset();
    } catch (error) {
      addToast('Failed to create expense', 'error');
    }
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
      {/* Amount */}
      <Input
        label="Amount ($)"
        type="number"
        step="0.01"
        placeholder="0.00"
        error={errors.amount?.message}
        {...register('amount', { valueAsNumber: true })}
      />

      {/* Category */}
      <Select
        label="Category"
        options={EXPENSE_CATEGORIES}
        placeholder="Select a category"
        error={errors.category?.message}
        {...register('category')}
      />

      {/* Date */}
      <Input
        label="Date"
        type="date"
        error={errors.date?.message}
        {...register('date')}
      />

      {/* Description */}
      <Input
        label="Description"
        placeholder="e.g., Winter camp coaching sessions"
        error={errors.description?.message}
        {...register('description')}
      />

      {/* Submit Button */}
      <Button
        type="submit"
        fullWidth
        loading={isLoading}
        loadingText="Creating..."
      >
        Create Expense
      </Button>
    </form>
  );
};
