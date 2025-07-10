'use client';

import React, { useState, useEffect } from 'react';

interface Goal {
  id: string;
  title: string;
  description: string;
  category: string;
  progress: number;
  created_at: string;
  target_date?: string;
  priority?: 'low' | 'medium' | 'high';
  milestones?: Array<{ title: string; completed: boolean; }>;
}

interface Stats {
  current_streak: number;
  best_streak: number;
  total_checkins: number;
  total_goals: number;
  completed_goals: number;
  totalXP: number;
  level: number;
  motivationScore: number;
}

const GoalsPage = () => {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [stats, setStats] = useState<Stats>({
    current_streak: 0,
    best_streak: 0,
    total_checkins: 0,
    total_goals: 0,
    completed_goals: 0,
    totalXP: 0,
    level: 1,
    motivationScore: 0,
  });
  const [loading, setLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newGoal, setNewGoal] = useState({
    title: '',
    description: '',
    category: 'personal',
    priority: 'medium' as 'low' | 'medium' | 'high',
    target_date: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      // Simulate loading goals and stats
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Mock data for demonstration
      setGoals([
        {
          id: '1',
          title: 'Daily Morning Workout',
          description: 'Exercise for 30 minutes every morning',
          category: 'fitness',
          progress: 65,
          created_at: new Date().toISOString(),
          priority: 'high',
          milestones: [
            { title: 'Week 1 Complete', completed: true },
            { title: 'Week 2 Complete', completed: true },
            { title: 'Week 3 Complete', completed: false },
          ]
        },
        {
          id: '2', 
          title: 'Learn Spanish',
          description: 'Practice Spanish for 15 minutes daily',
          category: 'education',
          progress: 30,
          created_at: new Date().toISOString(),
          priority: 'medium',
        }
      ]);
      
      setStats({
        current_streak: 7,
        best_streak: 14,
        total_checkins: 45,
        total_goals: 5,
        completed_goals: 2,
        totalXP: 1250,
        level: 3,
        motivationScore: 78,
      });
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newGoal.title.trim()) {
      alert('Please enter a goal title');
      return;
    }

    try {
      const goal: Goal = {
        id: Date.now().toString(),
        title: newGoal.title,
        description: newGoal.description,
        category: newGoal.category,
        progress: 0,
        created_at: new Date().toISOString(),
        target_date: newGoal.target_date,
        priority: newGoal.priority,
        milestones: []
      };

      setGoals(prev => [...prev, goal]);
      setShowAddModal(false);
      setNewGoal({
        title: '',
        description: '',
        category: 'personal',
        priority: 'medium',
        target_date: '',
      });
      
      // Update stats
      setStats(prev => ({
        ...prev,
        total_goals: prev.total_goals + 1,
        totalXP: prev.totalXP + 50
      }));
      
    } catch (error) {
      console.error('Error adding goal:', error);
      alert('Failed to add goal. Please try again.');
    }
  };

  const updateProgress = async (goalId: string, newProgress: number) => {
    try {
      setGoals(prev => prev.map(goal => 
        goal.id === goalId 
          ? { ...goal, progress: newProgress }
          : goal
      ));

      if (newProgress >= 100) {
        alert('🎉 Congratulations! Goal completed! +100 XP');
        setStats(prev => ({
          ...prev,
          completed_goals: prev.completed_goals + 1,
          totalXP: prev.totalXP + 100
        }));
      }
    } catch (error) {
      console.error('Error updating progress:', error);
    }
  };

  const deleteGoal = async (goalId: string) => {
    if (!confirm('Are you sure you want to delete this goal?')) {
      return;
    }

    try {
      setGoals(prev => prev.filter(goal => goal.id !== goalId));
    } catch (error) {
      console.error('Error deleting goal:', error);
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

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'fitness': return 'text-blue-600 bg-blue-100';
      case 'education': return 'text-purple-600 bg-purple-100';
      case 'career': return 'text-indigo-600 bg-indigo-100';
      case 'personal': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading goals...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Goals</h1>
          <p className="text-gray-600 mt-1">Track your progress and achieve your dreams</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-3 rounded-xl font-semibold hover:from-orange-600 hover:to-red-600 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
        >
          + Add Goal
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-xl p-4 shadow-sm border">
          <div className="text-2xl font-bold text-gray-900">{stats.total_goals}</div>
          <div className="text-sm text-gray-600">Total Goals</div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border">
          <div className="text-2xl font-bold text-green-600">{stats.completed_goals}</div>
          <div className="text-sm text-gray-600">Completed</div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border">
          <div className="text-2xl font-bold text-blue-600">{Math.round((stats.completed_goals / Math.max(stats.total_goals, 1)) * 100)}%</div>
          <div className="text-sm text-gray-600">Success Rate</div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border">
          <div className="text-2xl font-bold text-purple-600">{stats.totalXP}</div>
          <div className="text-sm text-gray-600">Total XP</div>
        </div>
      </div>

      {/* Goals List */}
      {goals.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border">
          <div className="p-12 text-center">
            <div className="text-6xl mb-4">🎯</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Set Your First Goal</h3>
            <p className="text-gray-600 mb-6">Define what you want to achieve and let AI help you get there</p>
            <button 
              onClick={() => setShowAddModal(true)}
              className="bg-orange-600 text-white px-6 py-3 rounded-lg hover:bg-orange-700 transition-colors"
            >
              Create New Goal
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {goals.map((goal) => (
            <div key={goal.id} className="bg-white rounded-xl shadow-sm border p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{goal.title}</h3>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(goal.priority || 'medium')}`}>
                      {goal.priority}
                    </span>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getCategoryColor(goal.category)}`}>
                      {goal.category}
                    </span>
                  </div>
                  <p className="text-gray-600 mb-3">{goal.description}</p>
                </div>
                <button
                  onClick={() => deleteGoal(goal.id)}
                  className="text-gray-400 hover:text-red-500 p-2"
                >
                  🗑️
                </button>
              </div>

              {/* Progress Bar */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Progress</span>
                  <span className="text-sm font-bold text-gray-900">{goal.progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className="bg-gradient-to-r from-orange-500 to-red-500 h-3 rounded-full transition-all duration-300"
                    style={{ width: `${goal.progress}%` }}
                  ></div>
                </div>
              </div>

              {/* Progress Controls */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => updateProgress(goal.id, Math.max(0, goal.progress - 10))}
                  className="px-3 py-1 text-sm bg-gray-200 hover:bg-gray-300 rounded transition-colors"
                  disabled={goal.progress === 0}
                >
                  -10%
                </button>
                <button
                  onClick={() => updateProgress(goal.id, Math.min(100, goal.progress + 10))}
                  className="px-3 py-1 text-sm bg-orange-500 text-white hover:bg-orange-600 rounded transition-colors"
                  disabled={goal.progress === 100}
                >
                  +10%
                </button>
                {goal.progress < 100 && (
                  <button
                    onClick={() => updateProgress(goal.id, 100)}
                    className="px-3 py-1 text-sm bg-green-500 text-white hover:bg-green-600 rounded transition-colors ml-2"
                  >
                    Complete
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Goal Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Create New Goal</h3>
            
            <form onSubmit={handleAddGoal} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Goal Title</label>
                <input
                  type="text"
                  value={newGoal.title}
                  onChange={(e) => setNewGoal({...newGoal, title: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="e.g., Daily morning workout"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={newGoal.description}
                  onChange={(e) => setNewGoal({...newGoal, description: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="Describe your goal..."
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select
                    value={newGoal.category}
                    onChange={(e) => setNewGoal({...newGoal, category: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  >
                    <option value="personal">Personal</option>
                    <option value="fitness">Fitness</option>
                    <option value="education">Education</option>
                    <option value="career">Career</option>
                    <option value="health">Health</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                  <select
                    value={newGoal.priority}
                    onChange={(e) => setNewGoal({...newGoal, priority: e.target.value as 'low' | 'medium' | 'high'})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Target Date (Optional)</label>
                <input
                  type="date"
                  value={newGoal.target_date}
                  onChange={(e) => setNewGoal({...newGoal, target_date: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                >
                  Create Goal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default GoalsPage; 