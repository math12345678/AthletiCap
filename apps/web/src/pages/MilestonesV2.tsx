import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import Layout from '../components/layout/Layout';
import { useToast } from '../components/ui';
import clsx from 'clsx';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface Milestone {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  priority: string;
  status: string;
  sport: string;
  progressPercent?: number;
  completedAt?: string;
  notes?: string;
}

export default function MilestonesV2() {
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [selectedMilestone, setSelectedMilestone] = useState<Milestone | null>(
    null
  );
  const [completeNotes, setCompleteNotes] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('dueDate');

  const { addToast } = useToast();

  useEffect(() => {
    loadMilestones();
  }, []);

  const loadMilestones = async () => {
    try {
      setLoading(true);
      const data = await api.milestones.list();
      setMilestones(data || []);
    } catch (err) {
      console.error('Error loading milestones:', err);
      addToast('Failed to load milestones', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteMilestone = async () => {
    if (!selectedMilestone) return;

    try {
      await api.milestones.complete(selectedMilestone.id, {
        notes: completeNotes,
      });
      addToast('Milestone completed! 🎉', 'success');
      setShowCompleteModal(false);
      setSelectedMilestone(null);
      setCompleteNotes('');
      loadMilestones();
    } catch (err) {
      console.error('Error completing milestone:', err);
      addToast('Failed to complete milestone', 'error');
    }
  };

  const getPriorityColor = (priority: string): string => {
    switch (priority) {
      case 'high':
        return 'bg-[#FCE0E0] text-[#C0392B] border-[#C0392B]';
      case 'medium':
        return 'bg-[#FFF3CD] text-[#B45309] border-[#B45309]';
      case 'low':
        return 'bg-[#E0E8FF] text-[#1A56DB] border-[#1A56DB]';
      default:
        return 'bg-[#F4F3EF] text-[#5C5A54]';
    }
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'complete':
        return 'text-[#2DD09A]';
      case 'incomplete':
        return 'text-[#1A56DB]';
      case 'overdue':
        return 'text-[#C0392B]';
      default:
        return 'text-[#5C5A54]';
    }
  };

  const getStatusIcon = (status: string): string => {
    switch (status) {
      case 'complete':
        return '✓';
      case 'overdue':
        return '!';
      default:
        return '→';
    }
  };

  const calculateDaysUntilDue = (dueDate: string): number => {
    const due = new Date(dueDate);
    const today = new Date();
    const diff = due.getTime() - today.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  const formatDueDate = (dueDate: string): string => {
    const date = new Date(dueDate);
    const diff = calculateDaysUntilDue(dueDate);

    if (diff < 0) {
      return `${Math.abs(diff)} days ago`;
    } else if (diff === 0) {
      return 'Today';
    } else if (diff === 1) {
      return 'Tomorrow';
    } else if (diff < 7) {
      return `In ${diff} days`;
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      });
    }
  };

  const sortMilestones = (items: Milestone[]) => {
    const sorted = [...items];

    // Primary sort: status (incomplete first, then overdue, then complete)
    const statusOrder = { incomplete: 0, overdue: 1, complete: 2 };
    sorted.sort(
      (a, b) =>
        (statusOrder[a.status as keyof typeof statusOrder] || 999) -
        (statusOrder[b.status as keyof typeof statusOrder] || 999)
    );

    // Secondary sort
    if (sortBy === 'dueDate') {
      sorted.sort((a, b) => {
        const aDate = new Date(a.dueDate).getTime();
        const bDate = new Date(b.dueDate).getTime();
        return aDate - bDate;
      });
    } else if (sortBy === 'priority') {
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      sorted.sort(
        (a, b) =>
          (priorityOrder[a.priority as keyof typeof priorityOrder] || 999) -
          (priorityOrder[b.priority as keyof typeof priorityOrder] || 999)
      );
    }

    return sorted;
  };

  const filterMilestones = (items: Milestone[]) => {
    if (filterStatus === 'all') return items;
    return items.filter((m) => m.status === filterStatus);
  };

  const displayedMilestones = sortMilestones(filterMilestones(milestones));

  const completedCount = milestones.filter(
    (m) => m.status === 'complete'
  ).length;
  const totalCount = milestones.length;
  const completionPercent =
    totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  const incompleteCount = milestones.filter(
    (m) => m.status === 'incomplete'
  ).length;
  const overdueCount = milestones.filter(
    (m) => m.status === 'overdue'
  ).length;

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-2 border-[#1A56DB] border-t-transparent mb-4" />
            <p className="text-[#5C5A54]">Loading your milestones...</p>
          </div>
        </div>
      </Layout>
    );
  }

  // Prepare data for status distribution chart
  const statusData = [
    { name: 'Completed', value: completedCount, fill: '#2DD09A' },
    { name: 'In Progress', value: incompleteCount, fill: '#1A56DB' },
    { name: 'Overdue', value: overdueCount, fill: '#C0392B' },
  ].filter((item) => item.value > 0);

  return (
    <Layout>
      <div className="space-y-8">
        {/* Section 1: Milestone Progress */}
        <section>
          <h2 className="section-header mb-6">
            <span className="section-number"># [1]</span> RECRUITMENT MILESTONE TRACKER
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Overall Progress */}
          <div className="bg-white border border-[#D8D5CC] rounded-sm p-6">
            <div className="text-[#8A8783] text-xs font-medium uppercase mb-2">
              Overall Progress
            </div>
            <div className="text-4xl font-serif font-bold text-[#1A56DB] mb-3">
              {completionPercent.toFixed(0)}%
            </div>
            <div className="w-full h-2 bg-[#F4F3EF] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#1A56DB] transition-all duration-300"
                style={{ width: `${completionPercent}%` }}
              />
            </div>
            <div className="text-xs text-[#5C5A54] mt-2">
              {completedCount} of {totalCount} complete
            </div>
          </div>

          {/* Incomplete */}
          <div className="bg-white border border-[#D8D5CC] rounded-sm p-6">
            <div className="text-[#8A8783] text-xs font-medium uppercase mb-2">
              In Progress
            </div>
            <div className="text-4xl font-serif font-bold text-[#1A56DB]">
              {incompleteCount}
            </div>
            <p className="text-xs text-[#5C5A54] mt-3">
              Milestones to complete
            </p>
          </div>

          {/* Overdue */}
          <div className="bg-white border border-[#D8D5CC] rounded-sm p-6">
            <div className="text-[#8A8783] text-xs font-medium uppercase mb-2">
              Overdue
            </div>
            <div
              className={clsx(
                'text-4xl font-serif font-bold',
                overdueCount > 0 ? 'text-[#C0392B]' : 'text-[#2DD09A]'
              )}
            >
              {overdueCount}
            </div>
            <p className="text-xs text-[#5C5A54] mt-3">
              {overdueCount === 0 ? 'All caught up!' : 'Need attention'}
            </p>
          </div>

          {/* Completed */}
          <div className="bg-white border border-[#D8D5CC] rounded-sm p-6">
            <div className="text-[#8A8783] text-xs font-medium uppercase mb-2">
              Achievements
            </div>
            <div className="text-4xl font-serif font-bold text-[#2DD09A]">
              {completedCount}
            </div>
            <p className="text-xs text-[#5C5A54] mt-3">Great job! Keep it up</p>
          </div>
        </section>

        {/* Section 2: Status Distribution */}
        {statusData.length > 0 && (
          <section className="bg-white border border-[#D8D5CC] rounded-DEFAULT p-6">
            <h3 className="section-header mb-6">
              <span className="section-number"># [2]</span> MILESTONE STATUS DISTRIBUTION
            </h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={statusData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#D8D5CC" />
                <XAxis dataKey="name" stroke="#5C5A54" />
                <YAxis stroke="#5C5A54" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#FFFFFF',
                    border: '1px solid #D8D5CC',
                    borderRadius: '2px',
                  }}
                />
                <Bar dataKey="value" fill="#1A56DB" radius={[2, 2, 0, 0]}>
                  {statusData.map((entry, index) => (
                    <Bar key={`bar-${index}`} dataKey="value" fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </section>
        )}

        {/* Section 3: Filters & Sort */}
        <section className="bg-white border border-[#D8D5CC] rounded-DEFAULT p-4">
          <div className="flex gap-4 items-center flex-wrap">
            <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-[#5C5A54]">
              Filter:
            </span>
            <div className="flex gap-2">
              {['all', 'incomplete', 'overdue', 'complete'].map((status) => (
                <button
                  key={status}
                  onClick={() => setFilterStatus(status)}
                  className={clsx(
                    'px-3 py-1 rounded-sm text-xs font-medium transition-colors',
                    filterStatus === status
                      ? 'bg-[#1A56DB] text-white'
                      : 'bg-[#F4F3EF] text-[#1A1916] hover:bg-[#E0E8FF]'
                  )}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </button>
              ))}
            </div>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <span className="text-xs font-semibold text-[#5C5A54]">
              Sort by:
            </span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-1 border border-[#D8D5CC] rounded-sm text-xs focus:outline-none focus:border-[#1A56DB]"
            >
              <option value="dueDate">Due Date</option>
              <option value="priority">Priority</option>
            </select>
            </div>
          </div>
        </section>

        {/* Section 4: Milestones List */}
        <section>
          <h3 className="section-header mb-6">
            <span className="section-number"># [3]</span> ACTIVE MILESTONES
          </h3>
          {displayedMilestones.length > 0 ? (
            <div className="space-y-3">
            {displayedMilestones.map((milestone) => (
              <div
                key={milestone.id}
                className={clsx(
                  'border rounded-sm p-6 transition-all',
                  milestone.status === 'complete'
                    ? 'bg-[#F4F3EF] border-[#D8D5CC] opacity-75'
                    : 'bg-white border-[#D8D5CC] hover:border-[#1A56DB]'
                )}
              >
                <div className="flex items-start gap-4">
                  {/* Checkbox */}
                  <div className="mt-1">
                    <button
                      onClick={() => {
                        setSelectedMilestone(milestone);
                        if (milestone.status !== 'complete') {
                          setShowCompleteModal(true);
                        }
                      }}
                      className={clsx(
                        'w-6 h-6 rounded-sm border-2 flex items-center justify-center transition-all text-lg font-bold',
                        milestone.status === 'complete'
                          ? 'bg-[#2DD09A] border-[#2DD09A] text-white'
                          : 'border-[#D8D5CC] hover:border-[#1A56DB] text-transparent'
                      )}
                    >
                      ✓
                    </button>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <div>
                        <h3
                          className={clsx(
                            'text-lg font-semibold',
                            milestone.status === 'complete'
                              ? 'text-[#5C5A54] line-through'
                              : 'text-[#1A1916]'
                          )}
                        >
                          {milestone.title}
                        </h3>
                        <p className="text-sm text-[#5C5A54] mt-1">
                          {milestone.description}
                        </p>
                      </div>
                      <div className="flex gap-2 flex-shrink-0">
                        <span
                          className={`px-3 py-1 rounded-sm text-xs font-semibold ${getPriorityColor(milestone.priority)}`}
                        >
                          {milestone.priority.charAt(0).toUpperCase() +
                            milestone.priority.slice(1)}{' '}
                          Priority
                        </span>
                      </div>
                    </div>

                    {/* Metadata */}
                    <div className="flex items-center gap-4 text-sm text-[#5C5A54] mt-3">
                      <span className="text-xs bg-[#E0E8FF] text-[#1A56DB] px-2 py-1 rounded-sm">
                        {milestone.sport}
                      </span>

                      <span
                        className={clsx(
                          'font-medium',
                          getStatusColor(milestone.status)
                        )}
                      >
                        {getStatusIcon(milestone.status)}{' '}
                        {milestone.status === 'complete'
                          ? 'Completed'
                          : milestone.status === 'overdue'
                            ? 'Overdue'
                            : 'Due'}{' '}
                        {formatDueDate(milestone.dueDate)}
                      </span>

                      {milestone.completedAt && (
                        <span className="text-xs text-[#2DD09A]">
                          ✓ Finished{' '}
                          {new Date(milestone.completedAt).toLocaleDateString(
                            'en-US',
                            {
                              month: 'short',
                              day: 'numeric',
                              year: '2-digit',
                            }
                          )}
                        </span>
                      )}
                    </div>

                    {/* Notes */}
                    {milestone.notes && (
                      <div className="mt-3 text-sm text-[#5C5A54] italic border-l-2 border-[#D8D5CC] pl-3">
                        "{milestone.notes}"
                      </div>
                    )}

                    {/* Progress Bar */}
                    {milestone.progressPercent !== undefined &&
                      milestone.progressPercent > 0 &&
                      milestone.status !== 'complete' && (
                        <div className="mt-3">
                          <div className="text-xs text-[#8A8783] mb-1">
                            Progress: {milestone.progressPercent}%
                          </div>
                          <div className="w-full h-1 bg-[#F4F3EF] rounded-full overflow-hidden">
                            <div
                              className="h-full bg-[#1A56DB]"
                              style={{ width: `${milestone.progressPercent}%` }}
                            />
                          </div>
                        </div>
                      )}
                  </div>
                </div>
              </div>
            ))}
          </div>
          ) : (
            <div className="bg-white border border-[#D8D5CC] rounded-DEFAULT p-12 text-center">
              <p className="text-lg text-[#5C5A54] mb-6">
                {filterStatus === 'all'
                  ? 'No milestones yet. Start tracking your progress through recruitment!'
                  : `No ${filterStatus} milestones to show.`}
              </p>
            </div>
          )}
        </section>

        {/* Section 4: Upcoming Timeline */}
        {milestones.length > 0 && (
          <section className="bg-white border border-[#D8D5CC] rounded-DEFAULT p-6">
            <h3 className="section-header mb-4">
              <span className="section-number"># [4]</span> NEXT 30 DAYS
            </h3>
            <div className="space-y-2">
              {sortMilestones(
                milestones.filter((m) => {
                  const daysUntil = calculateDaysUntilDue(m.dueDate);
                  return daysUntil > 0 && daysUntil <= 30 && m.status !== 'complete';
                })
              )
                .slice(0, 5)
                .map((milestone) => (
                  <div
                    key={milestone.id}
                    className="flex items-center justify-between p-3 bg-[#F4F3EF] rounded-sm"
                  >
                    <div>
                      <p className="text-sm font-semibold text-[#1A1916]">
                        {milestone.title}
                      </p>
                      <p className="text-xs text-[#5C5A54]">
                        {formatDueDate(milestone.dueDate)}
                      </p>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-sm text-xs font-semibold ${getPriorityColor(milestone.priority)}`}
                    >
                      {milestone.priority}
                    </span>
                  </div>
                ))}
            </div>
          </section>
        )}
      </div>

      {/* Complete Milestone Modal */}
      {showCompleteModal && selectedMilestone && (
        <div className="fixed inset-0 bg-[#1A1916] bg-opacity-40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-sm w-full max-w-md">
            {/* Modal Header */}
            <div className="border-b border-[#D8D5CC] p-6 flex justify-between items-center">
              <h2 className="text-2xl font-serif font-bold text-[#1A1916]">
                Complete Milestone
              </h2>
              <button
                onClick={() => {
                  setShowCompleteModal(false);
                  setSelectedMilestone(null);
                  setCompleteNotes('');
                }}
                className="text-[#8A8783] hover:text-[#1A1916] text-2xl"
              >
                ×
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-4">
              <div>
                <p className="text-lg font-semibold text-[#1A1916] mb-2">
                  {selectedMilestone.title}
                </p>
                <p className="text-sm text-[#5C5A54]">
                  {selectedMilestone.description}
                </p>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#5C5A54] mb-2">
                  Completion Notes (Optional)
                </label>
                <textarea
                  value={completeNotes}
                  onChange={(e) => setCompleteNotes(e.target.value)}
                  placeholder="Add notes about how you completed this milestone..."
                  className="w-full px-4 py-2 border border-[#D8D5CC] rounded-sm focus:border-[#1A56DB] focus:ring-2 focus:ring-[#1A56DB] focus:ring-opacity-10 outline-none text-sm"
                  rows={3}
                />
              </div>

              <div className="bg-[#D4EDDA] border border-[#0E7C50] rounded-sm p-4">
                <p className="text-sm text-[#0E7C50]">
                  🎉 Great job! Mark this milestone as complete to track your
                  progress.
                </p>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="border-t border-[#D8D5CC] p-6 flex gap-3 justify-end">
              <button
                onClick={() => {
                  setShowCompleteModal(false);
                  setSelectedMilestone(null);
                  setCompleteNotes('');
                }}
                className="px-6 py-2 border border-[#D8D5CC] text-[#1A1916] font-medium rounded-sm hover:bg-[#F4F3EF] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCompleteMilestone}
                className="px-6 py-2 bg-[#2DD09A] text-white font-medium rounded-sm hover:opacity-90 transition-opacity"
              >
                Mark as Complete
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
