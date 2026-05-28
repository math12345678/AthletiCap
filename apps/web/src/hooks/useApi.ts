import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import { useToast } from '../components/ui';

/**
 * Hook for fetching dashboard data
 */
export const useDashboard = () => {
  return useQuery({
    queryKey: ['dashboard'],
    queryFn: () => api.dashboard.getSummary(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

/**
 * Hook for fetching expenses
 */
export const useExpenses = () => {
  return useQuery({
    queryKey: ['expenses'],
    queryFn: () => api.expenses.list(),
  });
};

/**
 * Hook for fetching contacts
 */
export const useContacts = () => {
  return useQuery({
    queryKey: ['contacts'],
    queryFn: () => api.contacts.list(),
  });
};

/**
 * Hook for fetching offers
 */
export const useOffers = () => {
  return useQuery({
    queryKey: ['offers'],
    queryFn: () => api.offers.list(),
  });
};

/**
 * Hook for creating an expense
 */
export const useCreateExpense = () => {
  const queryClient = useQueryClient();
  const { addToast } = useToast();

  return useMutation({
    mutationFn: (data: Parameters<typeof api.expenses.create>[0]) =>
      api.expenses.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      addToast('Expense created successfully', 'success');
    },
    onError: () => {
      addToast('Failed to create expense', 'error');
    },
  });
};

/**
 * Hook for creating a contact
 */
export const useCreateContact = () => {
  const queryClient = useQueryClient();
  const { addToast } = useToast();

  return useMutation({
    mutationFn: (data: Parameters<typeof api.contacts.create>[0]) =>
      api.contacts.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      addToast('Contact created successfully', 'success');
    },
    onError: () => {
      addToast('Failed to create contact', 'error');
    },
  });
};

/**
 * Hook for creating an offer
 */
export const useCreateOffer = () => {
  const queryClient = useQueryClient();
  const { addToast } = useToast();

  return useMutation({
    mutationFn: (data: Parameters<typeof api.offers.create>[0]) =>
      api.offers.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['offers'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      addToast('Offer created successfully', 'success');
    },
    onError: () => {
      addToast('Failed to create offer', 'error');
    },
  });
};
