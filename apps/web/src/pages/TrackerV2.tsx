import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Layout from '../components/layout/Layout';
import { useToast } from '../components/ui';
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
      <div className="bg-[#FFFFFF] rounded-[2px] border border-[#D8D5CC] max-w-lg w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#D8D5CC]">
          <h2 className="text-[20px] font-[600] text-[#1A1916]">{title}</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center text-[#5C5A54] hover:text-[#1A1916] transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-6">{children}</div>

        {/* Footer */}
        {actions && actions.length > 0 && (
          <div className="flex gap-3 p-6 border-t border-[#D8D5CC] justify-end">
            {actions.map((action, idx) => (
              <button
                key={idx}
                onClick={action.onClick}
                className={clsx(
                  'px-4 py-2 rounded-[2px] text-[13px] font-[600] transition-opacity',
                  action.variant === 'primary'
                    ? 'bg-[#1A56DB] text-[#FFFFFF] hover:opacity-90'
                    : 'bg-[#F4F3EF] text-[#1A1916] border border-[#D8D5CC] hover:bg-[#FFFFFF]'
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
      <label className="block text-[12px] font-[600] text-[#1A1916] mb-2 uppercase tracking-wider">
        {label}
      </label>

      {options ? (
        <select
          value={value}
          onChange={onChange}
          className={clsx(
            'w-full px-3 py-2 rounded-[2px] border bg-[#FFFFFF] font-[400] text-[14px]',
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
            'w-full px-3 py-2 rounded-[2px] border bg-[#FFFFFF] font-[400] text-[14px]',
            error ? 'border-[#C0392B]' : 'border-[#D8D5CC]',
            'focus:border-[#1A56DB] focus:outline-none focus:ring-2 focus:ring-[#1A56DB] focus:ring-opacity-20'
          )}
        />
      )}

      {error && <p className="text-[12px] text-[#C0392B] mt-1">{error}</p>}
    </div>
  );
};

// Expense Table Row Component
interface ExpenseTableRowProps {
  expense: any;
  onEdit: (expense: any) => void;
  onDelete: (id: number) => void;
  isDeleting?: boolean;
}

const ExpenseTableRow: React.FC<ExpenseTableRowProps> = ({
  expense,
  onEdit,
  onDelete,
  isDeleting,
}) => {
  return (
    <tr className="border-b border-[#D8D5CC] hover:bg-[#F4F3EF] transition-colors">
      <td className="px-4 py-3">
        <div className="font-[600] text-[13px] text-[#1A1916]">{expense.category}</div>
        {expense.description && (
          <div className="text-[12px] text-[#5C5A54]">{expense.description}</div>
        )}
      </td>
      <td className="px-4 py-3 text-right">
        <div className="font-[700] font-mono text-[14px] text-[#1A56DB]">
          ${expense.amount.toFixed(2)}
        </div>
      </td>
      <td className="px-4 py-3 text-[12px] text-[#5C5A54]">
        {new Date(expense.date).toLocaleDateString()}
      </td>
      <td className="px-4 py-3 text-right space-x-2">
        <button
          onClick={() => onEdit(expense)}
          className="text-[12px] text-[#1A56DB] hover:text-opacity-70 transition-opacity"
        >
          Edit
        </button>
        <button
          onClick={() => onDelete(expense.id)}
          disabled={isDeleting}
          className="text-[12px] text-[#C0392B] hover:text-opacity-70 transition-opacity disabled:opacity-50"
        >
          Delete
        </button>
      </td>
    </tr>
  );
};

// Contact Card Component
interface ContactCardProps {
  contact: any;
  onEdit: (contact: any) => void;
  onDelete: (id: number) => void;
  isDeleting?: boolean;
}

const ContactCard: React.FC<ContactCardProps> = ({
  contact,
  onEdit,
  onDelete,
  isDeleting,
}) => {
  const stageColors: Record<string, string> = {
    'Initial Email Sent': '#D8D5CC',
    'Reply Received': '#E0E8FF',
    'Phone Call': '#E0E8FF',
    'Official Visit': '#D4EDDA',
    'Offer Extended': '#D4EDDA',
  };

  return (
    <div className="rounded-[2px] p-5 border border-[#D8D5CC] bg-[#F4F3EF] hover:bg-[#FFFFFF] transition-colors">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h4 className="text-[14px] font-[700] text-[#1A1916]">{contact.school}</h4>
          <div className="text-[13px] text-[#5C5A54]">{contact.coachName}</div>
          {contact.coachEmail && (
            <div className="text-[12px] text-[#8A8783] font-mono">{contact.coachEmail}</div>
          )}
        </div>

        <div className="flex gap-2 ml-4">
          <button
            onClick={() => onEdit(contact)}
            className="text-[12px] text-[#1A56DB] hover:opacity-70 transition-opacity"
          >
            Edit
          </button>
          <button
            onClick={() => onDelete(contact.id)}
            disabled={isDeleting}
            className="text-[12px] text-[#C0392B] hover:opacity-70 transition-opacity disabled:opacity-50"
          >
            Delete
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <span
          className="px-2 py-1 rounded-[2px] text-[11px] font-[600] font-mono text-[#5C5A54]"
          style={{ backgroundColor: stageColors[contact.stage] || '#D8D5CC' }}
        >
          {contact.division}
        </span>
        <span
          className="px-2 py-1 rounded-[2px] text-[11px] font-[600] font-mono"
          style={{ backgroundColor: '#D4EDDA', color: '#0E7C50' }}
        >
          {contact.stage}
        </span>
        {contact.verbalOffer && (
          <span className="px-2 py-1 rounded-[2px] text-[11px] font-[600] font-mono bg-[#FFF3CD] text-[#B45309]">
            ✓ Verbal Offer
          </span>
        )}
      </div>

      {contact.notes && (
        <div className="mt-3 pt-3 border-t border-[#D8D5CC]">
          <p className="text-[12px] text-[#5C5A54]">{contact.notes}</p>
        </div>
      )}
    </div>
  );
};

export default function TrackerV2() {
  const { addToast } = useToast();
  const { currentProfile } = useProfile();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState<'expenses' | 'contacts'>('expenses');
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [editingExpense, setEditingExpense] = useState<any>(null);
  const [editingContact, setEditingContact] = useState<any>(null);

  // Form state
  const [expenseForm, setExpenseForm] = useState({
    amount: '',
    category: 'Travel',
    date: new Date().toISOString().split('T')[0],
    description: '',
    eventName: '',
  });

  const [contactForm, setContactForm] = useState({
    school: '',
    coachName: '',
    coachEmail: '',
    division: 'D1 Power 4',
    stage: 'Initial Email Sent',
    verbalOffer: false,
    notes: '',
    contactDate: new Date().toISOString().split('T')[0],
    source: '',
  });

  // Queries
  const { data: expenses = [], isLoading: expensesLoading } = useQuery({
    queryKey: ['expenses'],
    queryFn: () => api.expenses.list(),
    enabled: !!currentProfile,
  });

  const { data: contacts = [], isLoading: contactsLoading } = useQuery({
    queryKey: ['contacts'],
    queryFn: () => api.contacts.list(),
    enabled: !!currentProfile,
  });

  const { data: expenseSummary = [] } = useQuery({
    queryKey: ['expenses', 'summary'],
    queryFn: () => api.expenses.getByCategorySum(),
    enabled: !!currentProfile,
  });

  const { data: contactPipeline = [] } = useQuery({
    queryKey: ['contacts', 'pipeline'],
    queryFn: () => api.contacts.getPipelineSummary(),
    enabled: !!currentProfile,
  });

  // Mutations
  const createExpenseMutation = useMutation({
    mutationFn: (data: any) => api.expenses.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      addToast('Expense created', 'success');
      setShowExpenseModal(false);
      setExpenseForm({
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

  const updateExpenseMutation = useMutation({
    mutationFn: ({ id, data }: any) => api.expenses.update(id.toString(), data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      addToast('Expense updated', 'success');
      setShowExpenseModal(false);
      setEditingExpense(null);
      setExpenseForm({
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

  const deleteExpenseMutation = useMutation({
    mutationFn: (id: number) => api.expenses.delete(id.toString()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      addToast('Expense deleted', 'success');
    },
    onError: (error: any) => {
      addToast(`Error: ${error.message}`, 'error');
    },
  });

  const createContactMutation = useMutation({
    mutationFn: (data: any) => api.contacts.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
      addToast('Contact created', 'success');
      setShowContactModal(false);
      setContactForm({
        school: '',
        coachName: '',
        coachEmail: '',
        division: 'D1 Power 4',
        stage: 'Initial Email Sent',
        verbalOffer: false,
        notes: '',
        contactDate: new Date().toISOString().split('T')[0],
        source: '',
      });
    },
    onError: (error: any) => {
      addToast(`Error: ${error.message}`, 'error');
    },
  });

  const updateContactMutation = useMutation({
    mutationFn: ({ id, data }: any) => api.contacts.update(id.toString(), data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
      addToast('Contact updated', 'success');
      setShowContactModal(false);
      setEditingContact(null);
      setContactForm({
        school: '',
        coachName: '',
        coachEmail: '',
        division: 'D1 Power 4',
        stage: 'Initial Email Sent',
        verbalOffer: false,
        notes: '',
        contactDate: new Date().toISOString().split('T')[0],
        source: '',
      });
    },
    onError: (error: any) => {
      addToast(`Error: ${error.message}`, 'error');
    },
  });

  const deleteContactMutation = useMutation({
    mutationFn: (id: number) => api.contacts.delete(id.toString()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
      addToast('Contact deleted', 'success');
    },
    onError: (error: any) => {
      addToast(`Error: ${error.message}`, 'error');
    },
  });

  // Handlers
  const handleSaveExpense = () => {
    if (!expenseForm.amount || !expenseForm.category) {
      addToast('Please fill in required fields', 'error');
      return;
    }

    if (editingExpense) {
      updateExpenseMutation.mutate({ id: editingExpense.id, data: expenseForm });
    } else {
      createExpenseMutation.mutate(expenseForm);
    }
  };

  const handleSaveContact = () => {
    if (!contactForm.school || !contactForm.coachName || !contactForm.division) {
      addToast('Please fill in required fields', 'error');
      return;
    }

    if (editingContact) {
      updateContactMutation.mutate({ id: editingContact.id, data: contactForm });
    } else {
      createContactMutation.mutate(contactForm);
    }
  };

  const handleEditExpense = (expense: any) => {
    setExpenseForm(expense);
    setEditingExpense(expense);
    setShowExpenseModal(true);
  };

  const handleEditContact = (contact: any) => {
    setContactForm(contact);
    setEditingContact(contact);
    setShowContactModal(true);
  };

  const totalSpend = (expenses || []).reduce((sum: number, e: any) => sum + e.amount, 0);

  return (
    <Layout>
      <main className="space-y-8">
        {/* Header */}
        <section>
          <h1 className="text-[36px] font-[700] font-serif text-[#1A1916] mb-2">
            Recruitment Tracker
          </h1>
          <p className="text-[14px] text-[#5C5A54]">
            Track your spending and manage your coaching pipeline
          </p>
        </section>

        {/* Quick Stats */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="rounded-[2px] p-6 border border-[#D8D5CC] bg-[#F4F3EF]">
            <div className="text-[12px] font-[600] font-mono text-[#5C5A54] uppercase tracking-wider mb-2">
              Total Spend
            </div>
            <div className="text-[32px] font-[700] font-mono text-[#1A1916]">
              ${totalSpend.toFixed(2)}
            </div>
            <div className="text-[12px] text-[#5C5A54] mt-2">
              {expenses.length} expenses logged
            </div>
          </div>

          <div className="rounded-[2px] p-6 border border-[#D8D5CC] bg-[#F4F3EF]">
            <div className="text-[12px] font-[600] font-mono text-[#5C5A54] uppercase tracking-wider mb-2">
              Pipeline Contacts
            </div>
            <div className="text-[32px] font-[700] font-mono text-[#1A1916]">
              {contacts.length}
            </div>
            <div className="text-[12px] text-[#5C5A54] mt-2">
              {contacts.filter((c: any) => c.verbalOffer).length} verbal offers
            </div>
          </div>

          <div className="rounded-[2px] p-6 border border-[#D8D5CC] bg-[#F4F3EF]">
            <div className="text-[12px] font-[600] font-mono text-[#5C5A54] uppercase tracking-wider mb-2">
              Average CAC
            </div>
            <div className="text-[32px] font-[700] font-mono text-[#1A1916]">
              ${(contacts as any)?.length > 0 ? Math.round(totalSpend / contacts.length) : 0}
            </div>
            <div className="text-[12px] text-[#5C5A54] mt-2">
              Cost per contact
            </div>
          </div>
        </section>

        {/* Tabs */}
        <section className="border-b border-[#D8D5CC]">
          <div className="flex gap-1">
            <button
              onClick={() => setActiveTab('expenses')}
              className={clsx(
                'px-4 py-3 text-[14px] font-[600] border-b-2 transition-colors',
                activeTab === 'expenses'
                  ? 'border-[#1A56DB] text-[#1A56DB]'
                  : 'border-transparent text-[#5C5A54] hover:text-[#1A1916]'
              )}
            >
              💰 Expenses {(expenses as any)?.length > 0 && `(${expenses.length})`}
            </button>
            <button
              onClick={() => setActiveTab('contacts')}
              className={clsx(
                'px-4 py-3 text-[14px] font-[600] border-b-2 transition-colors',
                activeTab === 'contacts'
                  ? 'border-[#1A56DB] text-[#1A56DB]'
                  : 'border-transparent text-[#5C5A54] hover:text-[#1A1916]'
              )}
            >
              📞 Coach Contacts {(contacts as any)?.length > 0 && `(${contacts.length})`}
            </button>
          </div>
        </section>

        {/* Expenses Tab */}
        {activeTab === 'expenses' && (
          <section className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-[20px] font-[600] text-[#1A1916]">Expenses</h2>
              <button
                onClick={() => {
                  setEditingExpense(null);
                  setExpenseForm({
                    amount: '',
                    category: 'Travel',
                    date: new Date().toISOString().split('T')[0],
                    description: '',
                    eventName: '',
                  });
                  setShowExpenseModal(true);
                }}
                className="px-4 py-2 rounded-[2px] bg-[#1A56DB] text-[#FFFFFF] text-[13px] font-[600] hover:opacity-90 transition-opacity"
              >
                + Add Expense
              </button>
            </div>

            {/* Expense Summary Grid */}
            {expenseSummary.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {(expenseSummary as any)?.map((cat: any) => (
                  <div key={cat.category} className="rounded-[2px] p-4 border border-[#D8D5CC] bg-[#F4F3EF]">
                    <div className="text-[12px] font-[600] text-[#5C5A54] mb-1">{cat.category}</div>
                    <div className="text-[20px] font-[700] font-mono text-[#1A56DB]">
                      ${cat.total.toFixed(2)}
                    </div>
                    <div className="text-[11px] text-[#8A8783] mt-1">
                      {cat.count} {cat.count === 1 ? 'entry' : 'entries'}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Expenses Table */}
            {expensesLoading ? (
              <div className="text-center py-8 text-[#5C5A54]">Loading expenses...</div>
            ) : expenses.length === 0 ? (
              <div className="rounded-[2px] p-12 bg-[#F4F3EF] border border-[#D8D5CC] text-center">
                <p className="text-[14px] text-[#5C5A54] mb-4">No expenses yet</p>
                <button
                  onClick={() => setShowExpenseModal(true)}
                  className="text-[13px] font-[600] text-[#1A56DB] hover:opacity-70 transition-opacity"
                >
                  Add your first expense
                </button>
              </div>
            ) : (
              <div className="rounded-[2px] border border-[#D8D5CC] bg-[#FFFFFF] overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[#D8D5CC] bg-[#F4F3EF]">
                      <th className="px-4 py-3 text-left text-[12px] font-[600] text-[#1A1916]">
                        Category
                      </th>
                      <th className="px-4 py-3 text-right text-[12px] font-[600] text-[#1A1916]">
                        Amount
                      </th>
                      <th className="px-4 py-3 text-left text-[12px] font-[600] text-[#1A1916]">
                        Date
                      </th>
                      <th className="px-4 py-3 text-right text-[12px] font-[600] text-[#1A1916]">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {(expenses as any)?.map((expense: any) => (
                      <ExpenseTableRow
                        key={expense.id}
                        expense={expense}
                        onEdit={handleEditExpense}
                        onDelete={(id) => deleteExpenseMutation.mutate(id)}
                        isDeleting={deleteExpenseMutation.isPending}
                      />
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        )}

        {/* Contacts Tab */}
        {activeTab === 'contacts' && (
          <section className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-[20px] font-[600] text-[#1A1916]">Coach Contacts</h2>
              <button
                onClick={() => {
                  setEditingContact(null);
                  setContactForm({
                    school: '',
                    coachName: '',
                    coachEmail: '',
                    division: 'D1 Power 4',
                    stage: 'Initial Email Sent',
                    verbalOffer: false,
                    notes: '',
                    contactDate: new Date().toISOString().split('T')[0],
                    source: '',
                  });
                  setShowContactModal(true);
                }}
                className="px-4 py-2 rounded-[2px] bg-[#1A56DB] text-[#FFFFFF] text-[13px] font-[600] hover:opacity-90 transition-opacity"
              >
                + Add Contact
              </button>
            </div>

            {/* Pipeline Breakdown */}
            {contactPipeline.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {(contactPipeline as any)?.map((stage: any) => (
                  <div key={stage.stage} className="rounded-[2px] p-4 text-center border border-[#D8D5CC] bg-[#F4F3EF]">
                    <div className="text-[24px] font-[700] font-mono text-[#1A56DB]">
                      {stage.count}
                    </div>
                    <div className="text-[11px] text-[#5C5A54] mt-1">{stage.stage}</div>
                  </div>
                ))}
              </div>
            )}

            {/* Contacts Grid */}
            {contactsLoading ? (
              <div className="text-center py-8 text-[#5C5A54]">Loading contacts...</div>
            ) : contacts.length === 0 ? (
              <div className="rounded-[2px] p-12 bg-[#F4F3EF] border border-[#D8D5CC] text-center">
                <p className="text-[14px] text-[#5C5A54] mb-4">No contacts yet</p>
                <button
                  onClick={() => setShowContactModal(true)}
                  className="text-[13px] font-[600] text-[#1A56DB] hover:opacity-70 transition-opacity"
                >
                  Add your first contact
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(contacts as any)?.map((contact: any) => (
                  <ContactCard
                    key={contact.id}
                    contact={contact}
                    onEdit={handleEditContact}
                    onDelete={(id) => deleteContactMutation.mutate(id)}
                    isDeleting={deleteContactMutation.isPending}
                  />
                ))}
              </div>
            )}
          </section>
        )}

        {/* Expense Modal */}
        <Modal
          isOpen={showExpenseModal}
          title={editingExpense ? 'Edit Expense' : 'Add Expense'}
          onClose={() => setShowExpenseModal(false)}
          actions={[
            {
              label: 'Cancel',
              onClick: () => setShowExpenseModal(false),
              variant: 'secondary',
            },
            {
              label: editingExpense ? 'Update' : 'Add',
              onClick: handleSaveExpense,
              variant: 'primary',
            },
          ]}
        >
          <FormInput
            label="Amount"
            type="number"
            value={expenseForm.amount}
            onChange={(e) => setExpenseForm({ ...expenseForm, amount: e.target.value })}
            step="0.01"
          />
          <FormInput
            label="Category"
            options={[
              { label: 'Travel', value: 'Travel' },
              { label: 'Camps', value: 'Camps' },
              { label: 'Visits', value: 'Visits' },
              { label: 'Official Visit', value: 'Official Visit' },
              { label: 'Coaching Fee', value: 'Coaching Fee' },
              { label: 'Film', value: 'Film' },
              { label: 'Other', value: 'Other' },
            ]}
            value={expenseForm.category}
            onChange={(e) => setExpenseForm({ ...expenseForm, category: e.target.value })}
          />
          <FormInput
            label="Date"
            type="date"
            value={expenseForm.date}
            onChange={(e) => setExpenseForm({ ...expenseForm, date: e.target.value })}
          />
          <FormInput
            label="Description"
            value={expenseForm.description}
            onChange={(e) => setExpenseForm({ ...expenseForm, description: e.target.value })}
            placeholder="Flight to campus visit, coaching session, etc."
          />
          <FormInput
            label="Event Name"
            value={expenseForm.eventName}
            onChange={(e) => setExpenseForm({ ...expenseForm, eventName: e.target.value })}
            placeholder="Stanford Camp, Spring Showcase, etc."
          />
        </Modal>

        {/* Contact Modal */}
        <Modal
          isOpen={showContactModal}
          title={editingContact ? 'Edit Contact' : 'Add Coach Contact'}
          onClose={() => setShowContactModal(false)}
          actions={[
            {
              label: 'Cancel',
              onClick: () => setShowContactModal(false),
              variant: 'secondary',
            },
            {
              label: editingContact ? 'Update' : 'Add',
              onClick: handleSaveContact,
              variant: 'primary',
            },
          ]}
        >
          <FormInput
            label="School Name"
            value={contactForm.school}
            onChange={(e) => setContactForm({ ...contactForm, school: e.target.value })}
          />
          <FormInput
            label="Coach Name"
            value={contactForm.coachName}
            onChange={(e) => setContactForm({ ...contactForm, coachName: e.target.value })}
          />
          <FormInput
            label="Coach Email"
            type="email"
            value={contactForm.coachEmail}
            onChange={(e) => setContactForm({ ...contactForm, coachEmail: e.target.value })}
          />
          <FormInput
            label="Division"
            options={[
              { label: 'D1 Power 4', value: 'D1 Power 4' },
              { label: 'D1 Mid-Major', value: 'D1 Mid-Major' },
              { label: 'D2', value: 'D2' },
              { label: 'D3', value: 'D3' },
              { label: 'NAIA', value: 'NAIA' },
              { label: 'JUCO', value: 'JUCO' },
            ]}
            value={contactForm.division}
            onChange={(e) => setContactForm({ ...contactForm, division: e.target.value })}
          />
          <FormInput
            label="Pipeline Stage"
            options={[
              { label: 'Initial Email Sent', value: 'Initial Email Sent' },
              { label: 'Reply Received', value: 'Reply Received' },
              { label: 'Phone Call', value: 'Phone Call' },
              { label: 'Official Visit', value: 'Official Visit' },
              { label: 'Offer Extended', value: 'Offer Extended' },
            ]}
            value={contactForm.stage}
            onChange={(e) => setContactForm({ ...contactForm, stage: e.target.value })}
          />
          <FormInput
            label="Contact Date"
            type="date"
            value={contactForm.contactDate}
            onChange={(e) => setContactForm({ ...contactForm, contactDate: e.target.value })}
          />
          <div className="mb-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={contactForm.verbalOffer}
                onChange={(e) => setContactForm({ ...contactForm, verbalOffer: e.target.checked })}
                className="w-4 h-4"
              />
              <span className="text-[13px] text-[#1A1916]">Verbal offer received</span>
            </label>
          </div>
          <FormInput
            label="Source"
            value={contactForm.source}
            onChange={(e) => setContactForm({ ...contactForm, source: e.target.value })}
            placeholder="Recruiting website, camp, referral, etc."
          />
          <FormInput
            label="Notes"
            value={contactForm.notes}
            onChange={(e) => setContactForm({ ...contactForm, notes: e.target.value })}
            placeholder="Communication history, follow-up plans, etc."
          />
        </Modal>
      </main>
    </Layout>
  );
}
