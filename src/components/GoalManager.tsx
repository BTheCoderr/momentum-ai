import React, { useState, useEffect } from 'react';
import { Plus, Target, Calendar, Trash2, Edit3, CheckCircle, Clock, TrendingUp, Star } from 'lucide-react';
import VoiceInput from './VoiceInput';

interface Goal {
  id: string;
  title: string;
  description: string;
  progress: number;
  status: 'active' | 'completed' | 'paused' | 'archived';
  currentStreak: number;
  bestStreak: number;
  completionRate: number;
  deadline?: string;
  category: string;
  priority: 'low' | 'medium' | 'high';
  habits: string[];
  createdAt: string;
  updatedAt: string;
}

interface GoalManagerProps {
  userId?: string;
  onGoalUpdate?: (goal: Goal) => void;
}

export default function GoalManager({ userId = 'demo-user', onGoalUpdate }: GoalManagerProps) {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');

  useEffect(() => {
    fetchGoals();
  }, [userId]);

  const fetchGoals = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/goals?userId=${userId}`);
      const data = await response.json();
      
      if (response.ok) {
        setGoals(data.goals || []);
      } else {
        console.error('Failed to fetch goals:', data.error);
        showToast('Failed to load goals', 'error');
      }
    } catch (error) {
      console.error('Error fetching goals:', error);
      showToast('Failed to load goals', 'error');
    } finally {
      setLoading(false);
    }
  };

  const createGoal = async (goalData: Partial<Goal>) => {
    try {
      const response = await fetch('/api/goals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...goalData, userId })
      });

      const data = await response.json();

      if (response.ok) {
        setGoals(prev => [data.goal, ...prev]);
        showToast('Goal created successfully! 🎯', 'success');
        setShowCreateModal(false);
        onGoalUpdate?.(data.goal);
      } else {
        showToast(data.error || 'Failed to create goal', 'error');
      }
    } catch (error) {
      console.error('Error creating goal:', error);
      showToast('Failed to create goal', 'error');
    }
  };

  const updateGoal = async (id: string, updates: Partial<Goal>) => {
    try {
      const response = await fetch('/api/goals', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...updates })
      });

      const data = await response.json();

      if (response.ok) {
        setGoals(prev => prev.map(goal => 
          goal.id === id ? data.goal : goal
        ));
        showToast('Goal updated successfully! ✅', 'success');
        setEditingGoal(null);
        onGoalUpdate?.(data.goal);
      } else {
        showToast(data.error || 'Failed to update goal', 'error');
      }
    } catch (error) {
      console.error('Error updating goal:', error);
      showToast('Failed to update goal', 'error');
    }
  };

  const deleteGoal = async (id: string) => {
    if (!confirm('Are you sure you want to delete this goal?')) return;

    try {
      const response = await fetch(`/api/goals?id=${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setGoals(prev => prev.filter(goal => goal.id !== id));
        showToast('Goal deleted successfully', 'success');
      } else {
        const data = await response.json();
        showToast(data.error || 'Failed to delete goal', 'error');
      }
    } catch (error) {
      console.error('Error deleting goal:', error);
      showToast('Failed to delete goal', 'error');
    }
  };

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const event = new CustomEvent('showToast', {
      detail: { message, type }
    });
    window.dispatchEvent(event);
  };

  const filteredGoals = goals.filter(goal => {
    if (filter === 'all') return true;
    return goal.status === filter;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-100';
      case 'active': return 'text-blue-600 bg-blue-100';
      case 'paused': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        <span className="ml-2 text-gray-600">Loading goals...</span>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Your Goals</h1>
          <p className="text-gray-600">Track your progress and stay motivated</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Add Goal</span>
        </button>
      </div>

      {/* Filters */}
      <div className="flex space-x-4 mb-6">
        {['all', 'active', 'completed'].map((filterType) => (
          <button
            key={filterType}
            onClick={() => setFilter(filterType as any)}
            className={`px-4 py-2 rounded-lg capitalize transition-colors ${
              filter === filterType
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {filterType} ({goals.filter(g => filterType === 'all' || g.status === filterType).length})
          </button>
        ))}
      </div>

      {/* Goals Grid */}
      {filteredGoals.length === 0 ? (
        <div className="text-center py-12">
          <Target className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No goals yet</h3>
          <p className="text-gray-600 mb-4">Start by creating your first goal!</p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600"
          >
            Create Your First Goal
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredGoals.map((goal) => (
            <GoalCard
              key={goal.id}
              goal={goal}
              onEdit={() => setEditingGoal(goal)}
              onDelete={() => deleteGoal(goal.id)}
              onUpdateProgress={(progress) => updateGoal(goal.id, { progress })}
              onToggleStatus={() => updateGoal(goal.id, { 
                status: goal.status === 'completed' ? 'active' : 'completed' 
              })}
            />
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      {(showCreateModal || editingGoal) && (
        <GoalModal
          goal={editingGoal}
          onSave={(goalData) => {
            if (editingGoal) {
              updateGoal(editingGoal.id, goalData);
            } else {
              createGoal(goalData);
            }
          }}
          onClose={() => {
            setShowCreateModal(false);
            setEditingGoal(null);
          }}
        />
      )}
    </div>
  );
}

// Goal Card Component
function GoalCard({ 
  goal, 
  onEdit, 
  onDelete, 
  onUpdateProgress, 
  onToggleStatus 
}: {
  goal: Goal;
  onEdit: () => void;
  onDelete: () => void;
  onUpdateProgress: (progress: number) => void;
  onToggleStatus: () => void;
}) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-100';
      case 'active': return 'text-blue-600 bg-blue-100';
      case 'paused': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 mb-1">{goal.title}</h3>
          <p className="text-sm text-gray-600 line-clamp-2">{goal.description}</p>
        </div>
        <div className="flex space-x-1 ml-2">
          <button
            onClick={onEdit}
            className="p-1 text-gray-400 hover:text-blue-500"
          >
            <Edit3 className="w-4 h-4" />
          </button>
          <button
            onClick={onDelete}
            className="p-1 text-gray-400 hover:text-red-500"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Progress */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Progress</span>
          <span className="text-sm text-gray-600">{goal.progress}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${goal.progress}%` }}
          />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="text-center">
          <div className="text-lg font-bold text-gray-900">{goal.currentStreak}</div>
          <div className="text-xs text-gray-600">Current Streak</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold text-gray-900">{goal.bestStreak}</div>
          <div className="text-xs text-gray-600">Best Streak</div>
        </div>
      </div>

      {/* Tags */}
      <div className="flex flex-wrap gap-2 mb-4">
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(goal.status)}`}>
          {goal.status}
        </span>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(goal.priority)}`}>
          {goal.priority}
        </span>
      </div>

      {/* Actions */}
      <div className="flex space-x-2">
        <button
          onClick={onToggleStatus}
          className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
            goal.status === 'completed'
              ? 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              : 'bg-green-500 text-white hover:bg-green-600'
          }`}
        >
          {goal.status === 'completed' ? 'Reactivate' : 'Mark Complete'}
        </button>
        <button
          onClick={() => onUpdateProgress(Math.min(100, goal.progress + 10))}
          className="px-3 py-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 text-sm"
          disabled={goal.progress >= 100}
        >
          +10%
        </button>
      </div>
    </div>
  );
}

// Goal Modal Component
function GoalModal({ 
  goal, 
  onSave, 
  onClose 
}: {
  goal?: Goal | null;
  onSave: (goalData: Partial<Goal>) => void;
  onClose: () => void;
}) {
  const [formData, setFormData] = useState({
    title: goal?.title || '',
    description: goal?.description || '',
    category: goal?.category || 'personal',
    priority: goal?.priority || 'medium',
    deadline: goal?.deadline || '',
    habits: goal?.habits?.join(', ') || ''
  });

  const handleVoiceInput = (text: string, isFinal: boolean) => {
    if (isFinal) {
      // Simple voice command parsing
      if (text.toLowerCase().includes('title')) {
        const titleMatch = text.match(/title[:\s]+(.+)/i);
        if (titleMatch) {
          setFormData(prev => ({ ...prev, title: titleMatch[1].trim() }));
        }
      } else if (text.toLowerCase().includes('description')) {
        const descMatch = text.match(/description[:\s]+(.+)/i);
        if (descMatch) {
          setFormData(prev => ({ ...prev, description: descMatch[1].trim() }));
        }
      } else {
        // Default to title if no specific field mentioned
        setFormData(prev => ({ ...prev, title: text.trim() }));
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      alert('Title is required');
      return;
    }

    onSave({
      ...formData,
      habits: formData.habits.split(',').map(h => h.trim()).filter(Boolean)
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            {goal ? 'Edit Goal' : 'Create New Goal'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Voice Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Voice Input
              </label>
              <VoiceInput
                onTranscript={handleVoiceInput}
                placeholder="Say 'Title: My goal' or 'Description: My goal description'"
                className="mb-4"
              />
            </div>

            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter goal title..."
                required
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={3}
                placeholder="Describe your goal..."
              />
            </div>

            {/* Category and Priority */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="personal">Personal</option>
                  <option value="career">Career</option>
                  <option value="health">Health</option>
                  <option value="finance">Finance</option>
                  <option value="education">Education</option>
                  <option value="relationships">Relationships</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Priority
                </label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value as 'low' | 'medium' | 'high' }))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
            </div>

            {/* Deadline */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Deadline (Optional)
              </label>
              <input
                type="date"
                value={formData.deadline}
                onChange={(e) => setFormData(prev => ({ ...prev, deadline: e.target.value }))}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Actions */}
            <div className="flex space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-3 px-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                {goal ? 'Update Goal' : 'Create Goal'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 