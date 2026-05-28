import React, { useState, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Layout from '../components/layout/Layout';
import { useToast } from '../components/ui';
import { useProfile } from '../contexts/ProfileContext';
import { api } from '../lib/api';
import { STAGE_COLORS, DIVISION_COLORS } from '../lib/chart-colors';
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
      <div className="bg-white rounded-DEFAULT border border-[#D8D5CC] max-w-lg w-full max-h-[90vh] overflow-y-auto">
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
  value: string | number | boolean;
  onChange: (e: any) => void;
  placeholder?: string;
  error?: string;
  options?: { label: string; value: string }[];
  isCheckbox?: boolean;
}

const FormInput: React.FC<InputProps> = ({
  label,
  type = 'text',
  value,
  onChange,
  placeholder,
  error,
  options,
  isCheckbox = false,
}) => {
  if (isCheckbox) {
    return (
      <div className="mb-4 flex items-center">
        <input
          type="checkbox"
          checked={value as boolean}
          onChange={onChange}
          className="w-4 h-4 rounded border-[#D8D5CC] accent-[#1A56DB]"
        />
        <label className="ml-2 text-sm text-[#1A1916]">{label}</label>
      </div>
    );
  }

  return (
    <div className="mb-4">
      <label className="block text-xs font-semibold text-[#1A1916] mb-2 uppercase tracking-wider">
        {label}
      </label>

      {options ? (
        <select
          value={value as string}
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
          value={value as string}
          onChange={onChange}
          placeholder={placeholder}
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

// Pipeline Stage Card
interface StageCardProps {
  stage: string;
  count: number;
}

const StageCard: React.FC<StageCardProps> = ({ stage, count }) => (
  <div className="bg-white border border-[#D8D5CC] rounded-DEFAULT p-4 text-center flex-1">
    <div className="text-xs font-mono uppercase tracking-widest text-[#5C5A54] mb-2">
      {stage}
    </div>
    <div className="text-2xl font-mono font-bold text-[#1A56DB]">{count}</div>
  </div>
);

// Contact Card
interface ContactCardProps {
  contact: any;
  onEdit: (contact: any) => void;
  onDelete: (id: number) => void;
  isDeleting?: boolean;
}

const ContactCard: React.FC<ContactCardProps> = ({ contact, onEdit, onDelete, isDeleting }) => {
  const stageColors: Record<string, string> = {
    'Initial Email Sent': '#E0E8FF',
    'Reply Received': '#E0E8FF',
    'Phone Call': '#E0E8FF',
    'Official Visit': '#D4EDDA',
    'Offer Extended': '#FFF3CD',
  };

  return (
    <div className="bg-white border border-[#D8D5CC] rounded-DEFAULT p-5 hover:shadow-md transition-all">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h4 className="text-sm font-bold text-[#1A1916]">{contact.school}</h4>
          <div className="text-xs text-[#5C5A54] mt-1">{contact.coachName}</div>
          {contact.coachEmail && (
            <div className="text-xs text-[#8A8783] font-mono mt-1">{contact.coachEmail}</div>
          )}
        </div>

        <div className="flex gap-2 ml-4">
          <button
            onClick={() => onEdit(contact)}
            className="text-xs text-[#1A56DB] hover:opacity-70 transition-opacity"
          >
            Edit
          </button>
          <button
            onClick={() => onDelete(contact.id)}
            disabled={isDeleting}
            className="text-xs text-[#C0392B] hover:opacity-70 transition-opacity disabled:opacity-50"
          >
            Delete
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <span
          className="px-2 py-1 rounded-DEFAULT text-xs font-semibold font-mono text-[#5C5A54]"
          style={{ backgroundColor: '#F4F3EF' }}
        >
          {contact.division}
        </span>
        <span
          className="px-2 py-1 rounded-DEFAULT text-xs font-semibold font-mono text-[#0E7C50]"
          style={{ backgroundColor: stageColors[contact.stage] || '#D8D5CC' }}
        >
          {contact.stage}
        </span>
        {contact.verbalOffer && (
          <span className="px-2 py-1 rounded-DEFAULT text-xs font-semibold font-mono bg-[#FFF3CD] text-[#B45309]">
            ✓ Verbal Offer
          </span>
        )}
      </div>

      {contact.notes && (
        <div className="mt-3 pt-3 border-t border-[#D8D5CC]">
          <p className="text-xs text-[#5C5A54]">{contact.notes}</p>
        </div>
      )}
    </div>
  );
};

export default function ContactsV2() {
  const { addToast } = useToast();
  const { currentProfile } = useProfile();
  const queryClient = useQueryClient();

  const [showModal, setShowModal] = useState(false);
  const [editingContact, setEditingContact] = useState<any>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [stageFilter, setStageFilter] = useState('');
  const [form, setForm] = useState({
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
  const { data: contacts = [], isLoading } = useQuery({
    queryKey: ['contacts'],
    queryFn: () => api.contacts.list(),
    enabled: !!currentProfile,
  });

  const { data: pipeline = [] } = useQuery({
    queryKey: ['contacts', 'pipeline'],
    queryFn: () => api.contacts.getPipelineSummary(),
    enabled: !!currentProfile,
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: (data: any) => api.contacts.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
      addToast('Contact created', 'success');
      setShowModal(false);
      setForm({
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

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: any) => api.contacts.update(id.toString(), data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
      addToast('Contact updated', 'success');
      setShowModal(false);
      setEditingContact(null);
      setForm({
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

  const deleteMutation = useMutation({
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
  const handleSave = () => {
    if (!form.school || !form.coachName || !form.division) {
      addToast('Please fill in required fields', 'error');
      return;
    }

    if (editingContact) {
      updateMutation.mutate({ id: editingContact.id, data: form });
    } else {
      createMutation.mutate(form);
    }
  };

  // Calculate pipeline metrics for chart
  const calculatePipelineMetrics = (contactList: any[]) => {
    const stages = ['Initial Contact', 'Reply Received', 'Phone Call', 'Official Visit', 'Offer Extended'];

    return stages.map((stage) => {
      const stageContacts = contactList.filter((c) => c.stage === stage);
      const offers = stageContacts.filter((c) => c.verbalOffer).length;

      return {
        stage,
        total: stageContacts.length,
        offers,
      };
    });
  };

  // Calculate contacts by division for chart
  const calculateDivisionBreakdown = (contactList: any[]) => {
    const divisions = ['D1 Power 4', 'D1 Mid-Major', 'D2', 'D3', 'NAIA', 'JUCO'];

    return divisions.map((division) => {
      const divisionContacts = contactList.filter((c) => c.division === division);
      const offers = divisionContacts.filter((c) => c.verbalOffer).length;

      return {
        division,
        total: divisionContacts.length,
        offers,
      };
    });
  };

  const handleEdit = (contact: any) => {
    setForm(contact);
    setEditingContact(contact);
    setShowModal(true);
  };

  const handleNew = () => {
    setEditingContact(null);
    setForm({
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
    setShowModal(true);
  };

  // Filter contacts by stage
  const filteredContacts = useMemo(() => {
    if (!stageFilter) return contacts;
    return contacts.filter((c: any) => c.stage === stageFilter);
  }, [contacts, stageFilter]);

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="inline-block w-8 h-8 border-2 border-[#1A56DB] border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-sm text-[#5C5A54]">Loading Coach Intelligence...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-8">
        {/* Section 1: Contact Pipeline */}
        <section>
          <div className="flex items-center justify-between mb-8">
            <h2 className="section-header">
              <span className="section-number"># [1]</span> CONTACT PIPELINE
            </h2>
            <button
              onClick={handleNew}
              className="px-4 py-2 bg-[#1A56DB] text-white rounded-DEFAULT text-sm font-semibold hover:opacity-90 transition-opacity"
            >
              + Add Contact
            </button>
          </div>

          {/* Pipeline Stage Headers */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {pipeline.length > 0 ? (
              pipeline.map((stage: any) => (
                <StageCard key={stage.stage} stage={stage.stage} count={stage.count} />
              ))
            ) : (
              <div className="col-span-full text-center py-8 text-[#5C5A54]">
                No pipeline data available
              </div>
            )}
          </div>

          {/* Pipeline Analytics Charts */}
          {contacts.length > 0 && (
            <div className="space-y-6 mb-8">
              {/* Pipeline Funnel Chart */}
              <div className="bg-white border border-[#D8D5CC] rounded-sm p-6">
                <h3 className="text-sm font-semibold text-[#5C5A54] uppercase mb-4">
                  Pipeline Conversion Funnel
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart
                    data={calculatePipelineMetrics(contacts)}
                    margin={{ top: 20, right: 30, left: 0, bottom: 60 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                    <XAxis
                      dataKey="stage"
                      angle={-45}
                      textAnchor="end"
                      height={100}
                      tick={{ fill: '#5C5A54', fontSize: 12 }}
                    />
                    <YAxis
                      tick={{ fill: '#5C5A54', fontSize: 12 }}
                      label={{ value: 'Count', angle: -90, position: 'insideLeft' }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#FFFFFF',
                        border: '1px solid #D8D5CC',
                        borderRadius: '4px',
                      }}
                      labelStyle={{ color: '#1A1916' }}
                    />
                    <Legend />
                    <Bar dataKey="total" fill="#3B82F6" name="Total Contacts" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="offers" fill="#F59E0B" name="Verbal Offers" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Division Breakdown Chart */}
              <div className="bg-white border border-[#D8D5CC] rounded-sm p-6">
                <h3 className="text-sm font-semibold text-[#5C5A54] uppercase mb-4">
                  Contacts by Division
                </h3>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart
                    data={calculateDivisionBreakdown(contacts)}
                    margin={{ top: 20, right: 30, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                    <XAxis dataKey="division" tick={{ fill: '#5C5A54', fontSize: 12 }} />
                    <YAxis tick={{ fill: '#5C5A54', fontSize: 12 }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#FFFFFF',
                        border: '1px solid #D8D5CC',
                        borderRadius: '4px',
                      }}
                      labelStyle={{ color: '#1A1916' }}
                    />
                    <Legend />
                    <Bar dataKey="total" fill="#3B82F6" name="Contacts" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="offers" fill="#2DD09A" name="Offers" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* View Toggle */}
          <div className="flex items-center gap-2 mb-6">
            <span className="text-xs font-mono uppercase tracking-widest text-[#5C5A54]">
              VIEW:
            </span>
            <button
              onClick={() => setViewMode('grid')}
              className={clsx(
                'px-3 py-2 rounded-DEFAULT text-sm font-semibold transition-colors',
                viewMode === 'grid'
                  ? 'bg-[#1A56DB] text-white'
                  : 'bg-[#F4F3EF] text-[#1A1916] hover:bg-white'
              )}
            >
              KANBAN
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={clsx(
                'px-3 py-2 rounded-DEFAULT text-sm font-semibold transition-colors',
                viewMode === 'table'
                  ? 'bg-[#1A56DB] text-white'
                  : 'bg-[#F4F3EF] text-[#1A1916] hover:bg-white'
              )}
            >
              TABLE
            </button>
          </div>

          {/* Contacts Display */}
          {contacts.length === 0 ? (
            <div className="bg-[#F4F3EF] border border-[#D8D5CC] rounded-DEFAULT p-12 text-center">
              <p className="text-sm text-[#5C5A54] mb-4">No contacts yet</p>
              <button
                onClick={handleNew}
                className="text-sm font-semibold text-[#1A56DB] hover:opacity-70 transition-opacity"
              >
                Add your first contact
              </button>
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredContacts.map((contact: any) => (
                <ContactCard
                  key={contact.id}
                  contact={contact}
                  onEdit={handleEdit}
                  onDelete={(id) => deleteMutation.mutate(id)}
                  isDeleting={deleteMutation.isPending}
                />
              ))}
            </div>
          ) : (
            <div className="bg-white border border-[#D8D5CC] rounded-DEFAULT overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-[#F4F3EF] border-b border-[#D8D5CC]">
                      <th className="px-4 py-3 text-left text-xs font-semibold text-[#5C5A54] uppercase tracking-wider">
                        School
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-[#5C5A54] uppercase tracking-wider">
                        Coach
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-[#5C5A54] uppercase tracking-wider">
                        Division
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-[#5C5A54] uppercase tracking-wider">
                        Stage
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-[#5C5A54] uppercase tracking-wider">
                        Offer
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-[#5C5A54] uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredContacts.map((contact: any) => (
                      <tr key={contact.id} className="border-b border-[#D8D5CC] hover:bg-[#F4F3EF]">
                        <td className="px-4 py-3">{contact.school}</td>
                        <td className="px-4 py-3">
                          <div className="text-sm">{contact.coachName}</div>
                          {contact.coachEmail && (
                            <div className="text-xs text-[#8A8783] font-mono">{contact.coachEmail}</div>
                          )}
                        </td>
                        <td className="px-4 py-3 text-sm">{contact.division}</td>
                        <td className="px-4 py-3 text-sm">{contact.stage}</td>
                        <td className="px-4 py-3 text-center">
                          {contact.verbalOffer && (
                            <span className="text-lg">✓</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right space-x-3">
                          <button
                            onClick={() => handleEdit(contact)}
                            className="text-xs text-[#1A56DB] hover:opacity-70 transition-opacity"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => deleteMutation.mutate(contact.id)}
                            disabled={deleteMutation.isPending}
                            className="text-xs text-[#C0392B] hover:opacity-70 transition-opacity disabled:opacity-50"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
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
        title={editingContact ? 'Edit Contact' : 'Add Contact'}
        onClose={() => setShowModal(false)}
        actions={[
          { label: 'Cancel', onClick: () => setShowModal(false) },
          { label: 'Save', onClick: handleSave, variant: 'primary' },
        ]}
      >
        <FormInput
          label="School Name"
          value={form.school}
          onChange={(e) => setForm({ ...form, school: e.target.value })}
          placeholder="e.g., Northwestern University"
        />
        <FormInput
          label="Coach Name"
          value={form.coachName}
          onChange={(e) => setForm({ ...form, coachName: e.target.value })}
          placeholder="e.g., Coach Smith"
        />
        <FormInput
          label="Coach Email"
          type="email"
          value={form.coachEmail}
          onChange={(e) => setForm({ ...form, coachEmail: e.target.value })}
          placeholder="coach@school.edu"
        />
        <FormInput
          label="Division"
          options={[
            { label: 'D1 Power 4', value: 'D1 Power 4' },
            { label: 'D1', value: 'D1' },
            { label: 'D2', value: 'D2' },
            { label: 'D3', value: 'D3' },
            { label: 'NAIA', value: 'NAIA' },
            { label: 'Junior College', value: 'Junior College' },
          ]}
          value={form.division}
          onChange={(e) => setForm({ ...form, division: e.target.value })}
        />
        <FormInput
          label="Stage"
          options={[
            { label: 'Initial Email Sent', value: 'Initial Email Sent' },
            { label: 'Reply Received', value: 'Reply Received' },
            { label: 'Phone Call', value: 'Phone Call' },
            { label: 'Official Visit', value: 'Official Visit' },
            { label: 'Offer Extended', value: 'Offer Extended' },
          ]}
          value={form.stage}
          onChange={(e) => setForm({ ...form, stage: e.target.value })}
        />
        <FormInput
          label="Verbal Offer Received"
          isCheckbox
          value={form.verbalOffer}
          onChange={(e: any) => setForm({ ...form, verbalOffer: e.target.checked })}
        />
        <FormInput
          label="Notes"
          value={form.notes}
          onChange={(e) => setForm({ ...form, notes: e.target.value })}
          placeholder="Add any relevant notes"
        />
      </Modal>
    </Layout>
  );
}
