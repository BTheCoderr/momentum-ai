import React, { useState } from 'react';
import { X, Plus, Target, Heart, Calendar } from 'lucide-react';

interface GoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (goal: any) => void;
}

export default function GoalModal({ isOpen, onClose, onSubmit }: GoalModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    emotionalContext: '',
    deadline: '',
    habits: ['']
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  if (!isOpen) return null;

  const addHabit = () => {
    setFormData(prev => ({
      ...prev,
      habits: [...prev.habits, '']
    }));
  };

  const updateHabit = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      habits: prev.habits.map((habit, i) => i === index ? value : habit)
    }));
  };

  const removeHabit = (index: number) => {
    setFormData(prev => ({
      ...prev,
      habits: prev.habits.filter((_, i) => i !== index)
    }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Goal title is required';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'Goal description is required';
    }
    
    if (!formData.emotionalContext.trim()) {
      newErrors.emotionalContext = 'Please share why this goal matters to you';
    }
    
    const validHabits = formData.habits.filter(h => h.trim());
    if (validHabits.length === 0) {
      newErrors.habits = 'Add at least one habit to track';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    const goalData = {
      ...formData,
      habits: formData.habits.filter(h => h.trim()),
      deadline: formData.deadline ? new Date(formData.deadline) : null
    };
    
    onSubmit(goalData);
    
    // Reset form
    setFormData({
      title: '',
      description: '',
      emotionalContext: '',
      deadline: '',
      habits: ['']
    });
    setErrors({});
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                <Target className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Create New Goal</h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Goal Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Goal Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="e.g., Launch my side business"
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.title ? 'border-red-300' : 'border-gray-300'
                }`}
              />
              {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
            </div>

            {/* Goal Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe what you want to achieve and how you'll measure success..."
                rows={3}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.description ? 'border-red-300' : 'border-gray-300'
                }`}
              />
              {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
            </div>

            {/* Emotional Context */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Heart className="w-4 h-4 inline mr-1" />
                Why does this matter to you? *
              </label>
              <textarea
                value={formData.emotionalContext}
                onChange={(e) => setFormData(prev => ({ ...prev, emotionalContext: e.target.value }))}
                placeholder="Share the deeper reason behind this goal. What will achieving it mean for your life?"
                rows={2}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.emotionalContext ? 'border-red-300' : 'border-gray-300'
                }`}
              />
              {errors.emotionalContext && <p className="text-red-500 text-sm mt-1">{errors.emotionalContext}</p>}
              <p className="text-sm text-gray-500 mt-1">This helps our AI provide more personalized coaching</p>
            </div>

            {/* Deadline */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="w-4 h-4 inline mr-1" />
                Target Deadline (Optional)
              </label>
              <input
                type="date"
                value={formData.deadline}
                onChange={(e) => setFormData(prev => ({ ...prev, deadline: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Habits */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Daily Habits to Track *
              </label>
              <div className="space-y-3">
                {formData.habits.map((habit, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={habit}
                      onChange={(e) => updateHabit(index, e.target.value)}
                      placeholder={`Habit ${index + 1} (e.g., "Work on project for 1 hour")`}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    {formData.habits.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeHabit(index)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addHabit}
                  className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 font-medium"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Another Habit</span>
                </button>
              </div>
              {errors.habits && <p className="text-red-500 text-sm mt-1">{errors.habits}</p>}
              <p className="text-sm text-gray-500 mt-1">These are the daily actions that will help you achieve your goal</p>
            </div>

            {/* Submit Buttons */}
            <div className="flex items-center justify-end space-x-3 pt-6 border-t">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2 text-gray-600 hover:text-gray-800 font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-lg hover:from-blue-700 hover:to-purple-700 transition-colors"
              >
                Create Goal
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 