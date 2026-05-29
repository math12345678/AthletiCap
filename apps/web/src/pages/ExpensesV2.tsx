import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Layout from '../components/layout/Layout';
import { useToast, GlossaryTerm } from '../components/ui';
import { useProfile } from '../contexts/ProfileContext';
import { api } from '../lib/api';
import clsx from 'clsx';

// Modal Component
interface ModalProps {
  isOpen: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  actions?: { label: string; onClick: () => void; variant?: 'primary' | 'secondary' }[];
}

const Modal: React.FC<ModalProps> = ({ isOpen, title, onClose, children, actions }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-[#FFFFFF] rounded-DEFAULT border border-[#D8D5CC] max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-[#D8D5CC]">
          <h2 className="text-lg font-semibold text-[#1A1916]">{title}</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center text-[#5C5A54] hover:text-[#1A1916] transition-colors"
          >
            ✕
          </button>
        </div>

        <div className="p-6">{children}</div>

        {actions && actions.length > 0 && (
          <div className="flex gap-3 p-6 border-t border-[#D8D5CC] justify-end">
            {actions.map((action, idx) => (
              <button
                key={idx}
                onClick={action.onClick}
                className={clsx(
                  'px-4 py-2 rounded-DEFAULT text-sm font-semibold transition-opacity',
                  action.variant === 'primary'
                    ? 'bg-[#1A56DB] text-white hover:opacity-90'
                    : 'bg-[#F4F3EF] text-[#1A1916] border border-[#D8D5CC] hover:bg-white'
                )}
              >
                {action.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// Form Input Component
interface InputProps {
  label: string;
  type?: string;
  value: string | number;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  placeholder?: string;
  error?: string;
  options?: { label: string; value: string }[];
  step?: string;
}

const FormInput: React.FC<InputProps> = ({
  label,
  type = 'text',
  value,
  onChange,
  placeholder,
  error,
  options,
  step,
}) => {
  return (
    <div className="mb-4">
      <label className="block text-xs font-semibold text-[#1A1916] mb-2 uppercase tracking-wider">
        {label}
      </label>

      {options ? (
        <select
          value={value}
          onChange={onChange}
          className={clsx(
            'w-full px-3 py-2 rounded-DEFAULT border bg-white text-sm',
            error ? 'border-[#C0392B]' : 'border-[#D8D5CC]',
            'focus:border-[#1A56DB] focus:outline-none focus:ring-2 focus:ring-[#1A56DB] focus:ring-opacity-20'
          )}
        >
          <option value="">Select {label.toLowerCase()}</option>
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      ) : (
        <input
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          step={step}
          className={clsx(
            'w-full px-3 py-2 rounded-DEFAULT border bg-white text-sm',
            error ? 'border-[#C0392B]' : 'border-[#D8D5CC]',
            'focus:border-[#1A56DB] focus:outline-none focus:ring-2 focus:ring-[#1A56DB] focus:ring-opacity-20'
          )}
        />
      )}

      {error && <p className="text-xs text-[#C0392B] mt-1">{error}</p>}
    </div>
  );
};

// Expense Summary Card
interface CategoryCardProps {
  category: string;
  amount: number;
  count: number;
}

const CategoryCard: React.FC<CategoryCardProps> = ({ category, amount, count }) => (
  <div className="bg-white border border-[#D8D5CC] rounded-DEFAULT p-4 shadow-sm hover:shadow-md transition-shadow duration-200">
    <div className="text-xs font-mono uppercase tracking-widest text-[#5C5A54] mb-2">
      {category}
    </div>
    <div className="text-xl font-mono font-bold text-[#1A1916] mb-1">
      ${amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
    </div>
    <div className="text-xs text-[#8A8783]">
      {count} {count === 1 ? 'entry' : 'entries'}
    </div>
  </div>
);

// Expense Table Row
interface ExpenseRowProps {
  expense: any;
  onEdit: (expense: any) => void;
  onDelete: (id: number) => void;
  isDeleting?: boolean;
}

const ExpenseRow: React.FC<ExpenseRowProps> = ({ expense, onEdit, onDelete, isDeleting }) => (
  <tr className="border-b border-[#D8D5CC] hover:bg-[#F4F3EF] transition-colors duration-200">
    <td className="px-4 py-3">
      <div className="font-semibold text-sm text-[#1A1916]">{expense.date}</div>
    </td>
    <td className="px-4 py-3">
      <div className="font-semibold text-sm text-[#1A1916]">{expense.category}</div>
      {expense.description && (
        <div className="text-xs text-[#5C5A54]">{expense.description}</div>
      )}
    </td>
    <td className="px-4 py-3 text-sm text-[#5C5A54]">
      {expense.eventName || '-'}
    </td>
    <td className="px-4 py-3 text-right">
      <div className="font-mono font-bold text-sm text-[#1A1916]">
        ${expense.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
      </div>
    </td>
    <td className="px-4 py-3 text-right space-x-3">
      <button
        onClick={() => onEdit(expense)}
        className="text-xs text-[#1A56DB] hover:opacity-70 transition-opacity"
      >
        Edit
      </button>
      <button
        onClick={() => onDelete(expense.id)}
        disabled={isDeleting}
        className="text-xs text-[#C0392B] hover:opacity-70 transition-opacity disabled:opacity-50"
      >
        Delete
      </button>
    </td>
  </tr>
);

export default function ExpensesV2() {
  const { addToast } = useToast();
  const { currentProfile } = useProfile();
  const queryClient = useQueryClient();

  const [showModal, setShowModal] = useState(false);
  const [editingExpense, setEditingExpense] = useState<any>(null);
  const [form, setForm] = useState({
    amount: '',
    category: 'Travel',
    date: new Date().toISOString().split('T')[0],
    description: '',
    eventName: '',
  });

  // Queries
  const { data: expenses = [] } = useQuery<any>({
    queryKey: ['expenses'],
    queryFn: () => api.expenses.list(),
    enabled: !!currentProfile,
  }) as any;

  const { data: expenseSummary = [] } = useQuery<any>({
    queryKey: ['expenses', 'summary'],
    queryFn: () => api.expenses.getByCategorySum(),
    enabled: !!currentProfile,
  }) as any;

  // Mutations
  const createMutation = useMutation({
    mutationFn: (data: any) => api.expenses.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      addToast('Expense created', 'success');
      setShowModal(false);
      setForm({
        amount: '',
        category: 'Travel',
        date: new Date().toISOString().split('T')[0],
        description: '',
        eventName: '',
      });
    },
    onError: (error: any) => {
      addToast(`Error: ${error.message}`, 'error');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: any) => api.expenses.update(id.toString(), data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      addToast('Expense updated', 'success');
      setShowModal(false);
      setEditingExpense(null);
      setForm({
        amount: '',
        category: 'Travel',
        date: new Date().toISOString().split('T')[0],
        description: '',
        eventName: '',
      });
    },
    onError: (error: any) => {
      addToast(`Error: ${error.message}`, 'error');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.expenses.delete(id.toString()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      addToast('Expense deleted', 'success');
    },
    onError: (error: any) => {
      addToast(`Error: ${error.message}`, 'error');
    },
  });

  // Handlers
  const handleSave = () => {
    if (!form.amount || !form.category) {
      addToast('Please fill in required fields', 'error');
      return;
    }

    if (editingExpense) {
      updateMutation.mutate({ id: editingExpense.id, data: form });
    } else {
      createMutation.mutate(form);
    }
  };

  const handleEdit = (expense: any) => {
    setForm(expense);
    setEditingExpense(expense);
    setShowModal(true);
  };

  const handleNew = () => {
    setEditingExpense(null);
    setForm({
      amount: '',
      category: 'Travel',
      date: new Date().toISOString().split('T')[0],
      description: '',
      eventName: '',
    });
    setShowModal(true);
  };

  const totalSpend = useMemo(
    () => (expenses || []).reduce((sum: number, e: any) => sum + e.amount, 0),
    [expenses]
  );

  // Sort expenses by date descending
  const sortedExpenses = useMemo(
    () => [...expenses].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
    [expenses]
  );

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="inline-block w-8 h-8 border-2 border-[#1A56DB] border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-sm text-[#5C5A54]">Loading Recruitment CapEx...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-8">
        {/* Section 1: Expense Ledger */}
        <section>
          <div className="flex items-center justify-between mb-8 animate-slideUp">
            <h2 className="section-header">
              <span className="section-number"># [1]</span> EXPENSE LEDGER
            </h2>
            <button
              onClick={handleNew}
              className="px-4 py-2 bg-[#1A56DB] text-white rounded-DEFAULT text-sm font-semibold hover:bg-[#1540A8] transition-colors duration-200"
            >
              + Add Expense
            </button>
          </div>

          {/* Summary Cards */}
          {expenseSummary.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <div className="bg-white border border-[#D8D5CC] rounded-DEFAULT p-4 animate-slideUp shadow-sm hover:shadow-md transition-shadow duration-200" style={{ animationDelay: '0ms' }}>
                <div className="text-xs font-mono uppercase tracking-widest text-[#5C5A54] mb-2">
                  TOTAL CAPEX
                </div>
                <div className="text-2xl font-mono font-bold text-[#1A1916]">
                  ${totalSpend.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </div>
              </div>
              {(expenseSummary as any)?.map((cat: any, idx: number) => (
                <div key={cat.category} className="animate-slideUp" style={{ animationDelay: `${(idx + 1) * 100}ms` }}>
                  <CategoryCard
                    category={cat.category}
                    amount={cat.total}
                    count={cat.count}
                  />
                </div>
              ))}
            </div>
          )}

          {/* Expenses Table */}
          {expenses.length === 0 ? (
            <div className="bg-[#F4F3EF] border border-[#D8D5CC] rounded-DEFAULT p-12 text-center">
              <p className="text-sm text-[#5C5A54] mb-4">No expenses yet</p>
              <button
                onClick={handleNew}
                className="text-sm font-semibold text-[#1A56DB] hover:opacity-70 transition-opacity"
              >
                Add your first expense
              </button>
            </div>
          ) : (
            <div className="bg-white border border-[#D8D5CC] rounded-DEFAULT overflow-hidden animate-slideUp shadow-sm hover:shadow-md transition-shadow duration-200">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-[#F4F3EF] border-b border-[#D8D5CC]">
                      <th className="px-4 py-3 text-left text-xs font-semibold text-[#5C5A54] uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-[#5C5A54] uppercase tracking-wider">
                        Category
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-[#5C5A54] uppercase tracking-wider">
                        Event
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-[#5C5A54] uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-[#5C5A54] uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedExpenses.map((expense: any) => (
                      <ExpenseRow
                        key={expense.id}
                        expense={expense}
                        onEdit={handleEdit}
                        onDelete={(id) => deleteMutation.mutate(id)}
                        isDeleting={deleteMutation.isPending}
                      />
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </section>
      </div>

      {/* Add/Edit Modal */}
      <Modal
        isOpen={showModal}
        title={editingExpense ? 'Edit Expense' : 'Add Expense'}
        onClose={() => setShowModal(false)}
        actions={[
          { label: 'Cancel', onClick: () => setShowModal(false) },
          { label: 'Save', onClick: handleSave, variant: 'primary' },
        ]}
      >
        <FormInput
          label="Date"
          type="date"
          value={form.date}
          onChange={(e) => setForm({ ...form, date: e.target.value })}
        />
        <FormInput
          label="Category"
          options={[
            { label: 'Travel', value: 'Travel' },
            { label: 'Camp/Showcase', value: 'Camp/Showcase' },
            { label: 'Official Visit', value: 'Official Visit' },
            { label: 'Training', value: 'Training' },
            { label: 'Equipment', value: 'Equipment' },
            { label: 'Other', value: 'Other' },
          ]}
          value={form.category}
          onChange={(e) => setForm({ ...form, category: e.target.value })}
        />
        <FormInput
          label="Amount"
          type="number"
          value={form.amount}
          onChange={(e) => setForm({ ...form, amount: e.target.value })}
          placeholder="0.00"
          step="0.01"
        />
        <FormInput
          label="Event Name"
          value={form.eventName}
          onChange={(e) => setForm({ ...form, eventName: e.target.value })}
          placeholder="e.g., Northwestern Camp"
        />
        <FormInput
          label="Description"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          placeholder="Optional details"
        />
      </Modal>
    </Layout>
  );
}
