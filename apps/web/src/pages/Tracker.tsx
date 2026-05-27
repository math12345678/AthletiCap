import React, { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { formatCurrency } from '../lib/utils';
import Layout from '../components/layout/Layout';

const EXPENSE_CATEGORIES = [
  'SHOWCASE_CAMP',
  'TOURNAMENT_ENTRY',
  'TRAVEL_AIRFARE',
  'TRAVEL_HOTEL',
  'TRAVEL_GROUND',
  'EQUIPMENT',
  'HIGHLIGHT_REEL',
  'RECRUITING_SERVICE',
  'TRAINING',
  'OTHER',
];

export default function Tracker() {
  const [expenses, setExpenses] = useState<any[]>([]);
  const [contacts, setContacts] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [showAddContact, setShowAddContact] = useState(false);

  const [formData, setFormData] = useState({
    label: '',
    amount: '',
    category: 'SHOWCASE_CAMP',
    date: new Date().toISOString().split('T')[0],
    notes: '',
  });

  const [contactData, setContactData] = useState({
    schoolName: '',
    coachName: '',
    divisionTier: 'D1_POWER4',
    contactType: 'REPLY_RECEIVED',
    contactDate: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        const [expensesRes, contactsRes, summaryRes] = await Promise.all([
          api.expenses.list(),
          api.contacts.list(),
          api.expenses.getSummary(),
        ]);
        setExpenses(expensesRes.expenses || []);
        setContacts(contactsRes || []);
        setSummary(summaryRes);
      } catch (err) {
        console.error('Error loading tracker data:', err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.expenses.create({
        ...formData,
        amount: parseFloat(formData.amount),
        date: new Date(formData.date),
      });
      setFormData({
        label: '',
        amount: '',
        category: 'SHOWCASE_CAMP',
        date: new Date().toISOString().split('T')[0],
        notes: '',
      });
      setShowAddExpense(false);
      // Reload data
      const [expensesRes, summaryRes] = await Promise.all([
        api.expenses.list(),
        api.expenses.getSummary(),
      ]);
      setExpenses(expensesRes.expenses || []);
      setSummary(summaryRes);
    } catch (err) {
      console.error('Error adding expense:', err);
    }
  };

  const handleAddContact = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.contacts.create({
        ...contactData,
        contactDate: new Date(contactData.contactDate),
      });
      setContactData({
        schoolName: '',
        coachName: '',
        divisionTier: 'D1_POWER4',
        contactType: 'REPLY_RECEIVED',
        contactDate: new Date().toISOString().split('T')[0],
      });
      setShowAddContact(false);
      // Reload data
      const contactsRes = await api.contacts.list();
      setContacts(contactsRes || []);
    } catch (err) {
      console.error('Error adding contact:', err);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="text-center py-12">Loading tracker...</div>
      </Layout>
    );
  }

  const budgetPercent = summary?.budgetGoal
    ? (summary.totalSpend / summary.budgetGoal) * 100
    : 0;

  return (
    <Layout>
      <div className="space-y-8">
        <div>
          <h1 className="text-4xl font-playfair text-gold mb-2">Recruitment Tracker</h1>
          <p className="text-text-secondary">Track your spending and coach contact strategy</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="card">
            <div className="text-sm text-text-secondary mb-2">Total Spending</div>
            <div className="text-3xl font-playfair text-gold mb-2">
              {formatCurrency(summary?.totalSpend || 0)}
            </div>
            <div className="w-full bg-border-color rounded-full h-2 overflow-hidden">
              <div
                className="bg-gold h-full transition-all"
                style={{ width: `${Math.min(budgetPercent, 100)}%` }}
              />
            </div>
            <p className="text-xs text-text-secondary mt-2">
              of {formatCurrency(summary?.budgetGoal || 5000)} budget
            </p>
          </div>

          <div className="card">
            <div className="text-sm text-text-secondary mb-2">Blended CAC</div>
            <div className="text-3xl font-playfair text-teal">
              ${summary?.cacResult?.blendedCAC ? summary.cacResult.blendedCAC.toFixed(0) : '—'}
            </div>
            <p className="text-xs text-text-secondary mt-2">per coach contact</p>
          </div>

          <div className="card">
            <div className="text-sm text-text-secondary mb-2">Quality-Weighted CAC</div>
            <div className="text-3xl font-playfair text-green">
              ${summary?.cacResult?.weightedCAC ? summary.cacResult.weightedCAC.toFixed(0) : '—'}
            </div>
            <p className="text-xs text-text-secondary mt-2">adjusted for division tier</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 border-b border-border-color">
          <button className="px-4 py-3 border-b-2 border-gold text-gold font-semibold">
            Expenses
          </button>
          <button className="px-4 py-3 text-text-secondary hover:text-text-primary">
            Coach Contacts
          </button>
        </div>

        {/* Expenses Section */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Expenses</h2>
            <button
              onClick={() => setShowAddExpense(!showAddExpense)}
              className="btn-primary text-sm"
            >
              {showAddExpense ? 'Cancel' : '+ Add Expense'}
            </button>
          </div>

          {showAddExpense && (
            <form onSubmit={handleAddExpense} className="card space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <input
                  type="text"
                  required
                  value={formData.label}
                  onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                  className="w-full bg-bg-primary border border-border-color rounded px-3 py-2 text-text-primary"
                  placeholder="e.g., Elite Showcase - Atlanta"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Amount ($)</label>
                  <input
                    type="number"
                    required
                    step="0.01"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    className="w-full bg-bg-primary border border-border-color rounded px-3 py-2 text-text-primary"
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Date</label>
                  <input
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full bg-bg-primary border border-border-color rounded px-3 py-2 text-text-primary"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full bg-bg-primary border border-border-color rounded px-3 py-2 text-text-primary"
                >
                  {EXPENSE_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat.replace(/_/g, ' ')}
                    </option>
                  ))}
                </select>
              </div>

              <button type="submit" className="btn-primary w-full">
                Save Expense
              </button>
            </form>
          )}

          <div className="space-y-2">
            {expenses.length > 0 ? (
              expenses.map((expense) => (
                <div
                  key={expense.id}
                  className="card-interactive flex justify-between items-center p-4"
                >
                  <div>
                    <h3 className="font-semibold">{expense.label}</h3>
                    <p className="text-sm text-text-secondary">
                      {new Date(expense.date).toLocaleDateString()} • {expense.category.replace(/_/g, ' ')}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="font-playfair text-lg font-bold text-gold">
                      {formatCurrency(expense.amount)}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="card text-center py-8 text-text-secondary">
                No expenses logged yet. Add your first expense to get started!
              </div>
            )}
          </div>
        </div>

        {/* Coach Contacts Section */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Coach Contacts</h2>
            <button
              onClick={() => setShowAddContact(!showAddContact)}
              className="btn-primary text-sm"
            >
              {showAddContact ? 'Cancel' : '+ Add Contact'}
            </button>
          </div>

          {showAddContact && (
            <form onSubmit={handleAddContact} className="card space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">School Name</label>
                <input
                  type="text"
                  required
                  value={contactData.schoolName}
                  onChange={(e) => setContactData({ ...contactData, schoolName: e.target.value })}
                  className="w-full bg-bg-primary border border-border-color rounded px-3 py-2 text-text-primary"
                  placeholder="e.g., University of California, Los Angeles"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Coach Name</label>
                  <input
                    type="text"
                    value={contactData.coachName}
                    onChange={(e) => setContactData({ ...contactData, coachName: e.target.value })}
                    className="w-full bg-bg-primary border border-border-color rounded px-3 py-2 text-text-primary"
                    placeholder="Coach name (optional)"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Division Tier</label>
                  <select
                    value={contactData.divisionTier}
                    onChange={(e) => setContactData({ ...contactData, divisionTier: e.target.value })}
                    className="w-full bg-bg-primary border border-border-color rounded px-3 py-2 text-text-primary"
                  >
                    <option value="D1_POWER4">D1 Power 4</option>
                    <option value="D1_MID_MAJOR">D1 Mid-Major</option>
                    <option value="D2">D2</option>
                    <option value="D3">D3</option>
                    <option value="NAIA">NAIA</option>
                    <option value="JUCO">JUCO</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Contact Type</label>
                <select
                  value={contactData.contactType}
                  onChange={(e) => setContactData({ ...contactData, contactType: e.target.value })}
                  className="w-full bg-bg-primary border border-border-color rounded px-3 py-2 text-text-primary"
                >
                  <option value="INITIAL_EMAIL_SENT">Initial Email Sent</option>
                  <option value="REPLY_RECEIVED">Reply Received</option>
                  <option value="PHONE_CALL">Phone Call</option>
                  <option value="OFFICIAL_VISIT">Official Visit</option>
                  <option value="OFFER_EXTENDED">Offer Extended</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Contact Date</label>
                <input
                  type="date"
                  required
                  value={contactData.contactDate}
                  onChange={(e) => setContactData({ ...contactData, contactDate: e.target.value })}
                  className="w-full bg-bg-primary border border-border-color rounded px-3 py-2 text-text-primary"
                />
              </div>

              <button type="submit" className="btn-primary w-full">
                Save Contact
              </button>
            </form>
          )}

          <div className="space-y-2">
            {contacts.length > 0 ? (
              contacts.map((contact) => (
                <div
                  key={contact.id}
                  className="card-interactive flex justify-between items-center p-4"
                >
                  <div>
                    <h3 className="font-semibold">{contact.schoolName}</h3>
                    <p className="text-sm text-text-secondary">
                      {contact.divisionTier.replace(/_/g, ' ')} • {contact.contactType.replace(/_/g, ' ')}
                    </p>
                  </div>
                  <div className="text-right">
                    {contact.isVerbal && (
                      <span className="inline-block bg-yellow/20 text-yellow text-xs px-2 py-1 rounded mb-2">
                        VERBAL
                      </span>
                    )}
                    <div className="text-sm text-text-secondary">
                      {new Date(contact.contactDate).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="card text-center py-8 text-text-secondary">
                No coach contacts logged yet. Add your first contact to get started!
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
