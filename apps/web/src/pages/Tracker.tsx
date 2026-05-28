import React, { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { formatCurrency } from '../lib/utils';
import Layout from '../components/layout/Layout';
import { Card, CardHeader, CardBody, Button, Badge, Modal, Loader } from '../components/ui';
import { MetricCard } from '../components/dashboard/MetricCard';
import { ExpenseForm } from '../components/forms/ExpenseForm';
import { CoachContactForm } from '../components/forms/CoachContactForm';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import clsx from 'clsx';

type TabType = 'expenses' | 'contacts' | 'analysis';

export default function Tracker() {
  const [expenses, setExpenses] = useState<any[]>([]);
  const [contacts, setContacts] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>('expenses');
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [submittingExpense, setSubmittingExpense] = useState(false);
  const [submittingContact, setSubmittingContact] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [expensesRes, contactsRes, summaryRes] = await Promise.all([
          api.expenses.list(),
          api.contacts.list(),
          api.expenses.getByCategorySum(),
        ]);
        setExpenses(expensesRes || []);
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

  const handleExpenseSubmit = async (data: any) => {
    setSubmittingExpense(true);
    try {
      await api.expenses.create({
        ...data,
        date: new Date(data.date),
      });
      setShowExpenseModal(false);
      // Reload data
      const [expensesRes, summaryRes] = await Promise.all([
        api.expenses.list(),
        api.expenses.getByCategorySum(),
      ]);
      setExpenses(expensesRes || []);
      setSummary(summaryRes);
    } catch (err) {
      console.error('Error adding expense:', err);
    } finally {
      setSubmittingExpense(false);
    }
  };

  const handleContactSubmit = async (data: any) => {
    setSubmittingContact(true);
    try {
      await api.contacts.create({
        ...data,
        date: new Date(data.date),
      });
      setShowContactModal(false);
      // Reload data
      const contactsRes = await api.contacts.list();
      setContacts(contactsRes || []);
    } catch (err) {
      console.error('Error adding contact:', err);
    } finally {
      setSubmittingContact(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <Loader fullscreen label="Loading your tracker..." />
      </Layout>
    );
  }

  const budgetPercent = summary?.budgetGoal
    ? (summary.totalSpend / summary.budgetGoal) * 100
    : 0;

  const tabs: Array<{ id: TabType; label: string; icon: string }> = [
    { id: 'expenses', label: 'Expenses', icon: '💰' },
    { id: 'contacts', label: 'Coach Contacts', icon: '📞' },
    { id: 'analysis', label: 'Analysis', icon: '📊' },
  ];

  return (
    <Layout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-playfair font-bold text-text-primary mb-2">
            Recruitment Tracker
          </h1>
          <p className="text-text-secondary">
            Track your spending and coach contact strategy
          </p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <MetricCard
            title="Total Spending"
            value={formatCurrency(summary?.totalSpend || 0)}
            color="gold"
            details={budgetPercent > 0 ? `${budgetPercent.toFixed(0)}% of budget` : 'Track your expenses'}
            animated
          />
          <MetricCard
            title="Blended CAC"
            value={summary?.cacResult?.blendedCAC ? `$${summary.cacResult.blendedCAC.toFixed(0)}` : '—'}
            color="teal"
            details="per coach contact"
            animated
          />
          <MetricCard
            title="Weighted CAC"
            value={summary?.cacResult?.weightedCAC ? `$${summary.cacResult.weightedCAC.toFixed(0)}` : '—'}
            color="success"
            details="adjusted for division"
            animated
          />
        </div>

        {/* Tabs */}
        <div className="flex gap-1 border-b border-border-color overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={clsx(
                'px-4 py-3 font-medium whitespace-nowrap transition-all border-b-2',
                activeTab === tab.id
                  ? 'border-gold text-gold'
                  : 'border-transparent text-text-secondary hover:text-text-primary'
              )}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'expenses' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold text-text-primary">
                Recent Expenses
              </h2>
              <Button onClick={() => setShowExpenseModal(true)}>
                + Add Expense
              </Button>
            </div>

            {expenses.length > 0 ? (
              <div className="grid gap-3">
                {expenses.map((expense) => (
                  <Card key={expense.id} hoverable className="p-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="font-semibold text-text-primary">
                          {expense.description || expense.label}
                        </h3>
                        <div className="flex items-center gap-2 mt-1 text-sm text-text-secondary">
                          <span>{new Date(expense.date).toLocaleDateString()}</span>
                          <span>•</span>
                          <Badge size="sm" variant="secondary">
                            {expense.category}
                          </Badge>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-gold font-playfair">
                          {formatCurrency(expense.amount)}
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="text-center py-12">
                <p className="text-lg text-text-secondary mb-4">No expenses logged yet</p>
                <Button onClick={() => setShowExpenseModal(true)}>
                  Create your first expense
                </Button>
              </Card>
            )}
          </div>
        )}

        {activeTab === 'contacts' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold text-text-primary">
                Coach Contacts
              </h2>
              <Button onClick={() => setShowContactModal(true)}>
                + Add Contact
              </Button>
            </div>

            {contacts.length > 0 ? (
              <div className="grid gap-3">
                {contacts.map((contact) => (
                  <Card key={contact.id} hoverable className="p-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-text-primary">
                            {contact.schoolName}
                          </h3>
                          {contact.isVerbal && (
                            <Badge variant="success" size="sm">
                              VERBAL OFFER
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-text-secondary">
                          <span>{contact.divisionTier.replace(/_/g, ' ')}</span>
                          <span>•</span>
                          <span>{contact.contactType.replace(/_/g, ' ')}</span>
                          <span>•</span>
                          <span>{new Date(contact.date).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="text-center py-12">
                <p className="text-lg text-text-secondary mb-4">No coach contacts logged yet</p>
                <Button onClick={() => setShowContactModal(true)}>
                  Create your first contact
                </Button>
              </Card>
            )}
          </div>
        )}

        {activeTab === 'analysis' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-text-primary">
              CAC Analysis
            </h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Expense by Category */}
              {expenses.length > 0 && (
                <Card>
                  <CardHeader title="Spending by Category" />
                  <CardBody>
                    <ResponsiveContainer width="100%" height={250}>
                      <PieChart>
                        <Pie
                          data={expenses.reduce((acc: any[], exp) => {
                            const existing = acc.find((e) => e.category === exp.category);
                            if (existing) {
                              existing.value += exp.amount;
                            } else {
                              acc.push({ category: exp.category, value: exp.amount });
                            }
                            return acc;
                          }, [])}
                          dataKey="value"
                          nameKey="category"
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                        >
                          {['#F0A500', '#0FB8A8', '#22C55E', '#F59E0B', '#5BA5D9'].map((color, index) => (
                            <Cell key={`cell-${index}`} fill={color} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => formatCurrency(value as number)} />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardBody>
                </Card>
              )}

              {/* Contact Distribution */}
              {contacts.length > 0 && (
                <Card>
                  <CardHeader title="Contacts by Division" />
                  <CardBody>
                    <ResponsiveContainer width="100%" height={250}>
                      <BarChart
                        data={contacts.reduce((acc: any[], contact) => {
                          const existing = acc.find((e) => e.division === contact.divisionTier);
                          if (existing) {
                            existing.count += 1;
                          } else {
                            acc.push({ division: contact.divisionTier, count: 1 });
                          }
                          return acc;
                        }, [])}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                        <XAxis dataKey="division" stroke="rgba(255,255,255,0.5)" />
                        <YAxis stroke="rgba(255,255,255,0.5)" />
                        <Tooltip />
                        <Bar dataKey="count" fill="#F0A500" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardBody>
                </Card>
              )}
            </div>
          </div>
        )}

        {/* Modals */}
        <Modal
          isOpen={showExpenseModal}
          onClose={() => setShowExpenseModal(false)}
          title="Add Expense"
          subtitle="Log a new recruitment expense"
          size="md"
        >
          <ExpenseForm
            onSubmit={handleExpenseSubmit}
            isLoading={submittingExpense}
          />
        </Modal>

        <Modal
          isOpen={showContactModal}
          onClose={() => setShowContactModal(false)}
          title="Add Coach Contact"
          subtitle="Log a new coach contact"
          size="md"
        >
          <CoachContactForm
            onSubmit={handleContactSubmit}
            isLoading={submittingContact}
          />
        </Modal>
      </div>
    </Layout>
  );
}
