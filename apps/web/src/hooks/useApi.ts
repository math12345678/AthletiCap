import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../lib/api';
import { useToast } from '../components/ui';

/**
 * Hook for fetching dashboard data
 */
export const useDashboard = () => {
  return useQuery({
    queryKey: ['dashboard'],
    queryFn: () => apiClient.dashboard.getMetrics(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

/**
 * Hook for fetching expenses
 */
export const useExpenses = () => {
  return useQuery({
    queryKey: ['expenses'],
    queryFn: () => apiClient.expenses.getList(),
  });
};

/**
 * Hook for fetching contacts
 */
export const useContacts = () => {
  return useQuery({
    queryKey: ['contacts'],
    queryFn: () => apiClient.contacts.getList(),
  });
};

/**
 * Hook for fetching offers
 */
export const useOffers = () => {
  return useQuery({
    queryKey: ['offers'],
    queryFn: () => apiClient.offers.getList(),
  });
};

/**
 * Hook for fetching brand readiness
 */
export const useBrandReadiness = (athleteId: string) => {
  return useQuery({
    queryKey: ['brandReadiness', athleteId],
    queryFn: () => apiClient.influence.calculateBrandReadiness(athleteId),
  });
};

/**
 * Hook for creating an expense
 */
export const useCreateExpense = () => {
  const queryClient = useQueryClient();
  const { addToast } = useToast();

  return useMutation({
    mutationFn: (data: Parameters<typeof apiClient.expenses.create>[0]) =>
      apiClient.expenses.create(data),
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
    mutationFn: (data: Parameters<typeof apiClient.contacts.create>[0]) =>
      apiClient.contacts.create(data),
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
    mutationFn: (data: Parameters<typeof apiClient.offers.create>[0]) =>
      apiClient.offers.create(data),
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
