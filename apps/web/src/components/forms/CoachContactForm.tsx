import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { coachContactSchema, type CoachContactFormData } from '../../lib/validation';
import { Input, Select, Button } from '../ui';
import { useToast } from '../ui';

const DIVISION_TIERS = [
  { value: 'D1_POWER4', label: 'Division 1 Power 4' },
  { value: 'D1_MID_MAJOR', label: 'Division 1 Mid-Major' },
  { value: 'D2', label: 'Division 2' },
  { value: 'D3', label: 'Division 3' },
  { value: 'NAIA', label: 'NAIA' },
  { value: 'JUCO', label: 'Junior College' },
];

const CONTACT_TYPES = [
  { value: 'REPLY_RECEIVED', label: 'Reply Received' },
  { value: 'PHONE_CALL', label: 'Phone Call' },
  { value: 'OFFICIAL_VISIT', label: 'Official Visit' },
  { value: 'OFFER_EXTENDED', label: 'Offer Extended' },
  { value: 'EMAIL', label: 'Email' },
  { value: 'CAMP', label: 'Camp Attendance' },
];

const OFFER_STATUSES = [
  { value: 'INTERESTED', label: 'Interested' },
  { value: 'CONSIDERING', label: 'Considering' },
  { value: 'VERBAL', label: 'Verbal Offer' },
  { value: 'COMMITTED', label: 'Committed' },
  { value: 'DECLINED', label: 'Declined' },
];

interface CoachContactFormProps {
  onSubmit: (data: CoachContactFormData) => Promise<void>;
  isLoading?: boolean;
}

export const CoachContactForm: React.FC<CoachContactFormProps> = ({
  onSubmit,
  isLoading = false,
}) => {
  const { addToast } = useToast();
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CoachContactFormData>({
    resolver: zodResolver(coachContactSchema),
    defaultValues: {
      schoolName: '',
      divisionTier: '',
      contactType: '',
      date: new Date().toISOString().split('T')[0],
      notes: '',
    },
  });

  const onFormSubmit = async (data: CoachContactFormData) => {
    try {
      await onSubmit(data);
      reset();
    } catch (error) {
      addToast('Failed to create contact', 'error');
    }
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
      {/* School Name */}
      <Input
        label="School Name"
        placeholder="e.g., University of Florida"
        error={errors.schoolName?.message}
        {...register('schoolName')}
      />

      {/* Division Tier */}
      <Select
        label="Division Tier"
        options={DIVISION_TIERS}
        placeholder="Select division"
        error={errors.divisionTier?.message}
        {...register('divisionTier')}
      />

      {/* Contact Type */}
      <Select
        label="Contact Type"
        options={CONTACT_TYPES}
        placeholder="How did you contact?"
        error={errors.contactType?.message}
        {...register('contactType')}
      />

      {/* Date */}
      <Input
        label="Date of Contact"
        type="date"
        error={errors.date?.message}
        {...register('date')}
      />

      {/* Coach Name */}
      <Input
        label="Coach Name (Optional)"
        placeholder="Head Coach Smith"
        {...register('coachName')}
      />

      {/* Coach Email */}
      <Input
        label="Coach Email (Optional)"
        type="email"
        placeholder="coach@university.edu"
        {...register('coachEmail')}
      />

      {/* Offer Status */}
      <Select
        label="Offer Status (Optional)"
        options={OFFER_STATUSES}
        placeholder="Select status"
        {...register('offerStatus')}
      />

      {/* Notes */}
      <Input
        label="Notes (Optional)"
        placeholder="Details about the contact..."
        error={errors.notes?.message}
        {...register('notes')}
      />

      {/* Submit Button */}
      <Button type="submit" fullWidth loading={isLoading} loadingText="Creating...">
        Create Contact
      </Button>
    </form>
  );
};
