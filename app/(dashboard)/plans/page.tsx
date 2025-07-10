'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

interface Plan {
  title: string;
  description: string;
  duration: 'day' | 'week' | 'month';
  milestones: string[];
  reminders: boolean;
}

export default function PlanCreatorPage() {
  const router = useRouter();
  const supabase = createClientComponentClient();
  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState<Plan>({
    title: '',
    description: '',
    duration: 'week',
    milestones: [''],
    reminders: true,
  });

  const handleAddMilestone = () => {
    setPlan(prev => ({
      ...prev,
      milestones: [...prev.milestones, ''],
    }));
  };

  const handleUpdateMilestone = (index: number, text: string) => {
    setPlan(prev => ({
      ...prev,
      milestones: prev.milestones.map((m, i) => i === index ? text : m),
    }));
  };

  const handleRemoveMilestone = (index: number) => {
    if (plan.milestones.length > 1) {
      setPlan(prev => ({
        ...prev,
        milestones: prev.milestones.filter((_, i) => i !== index),
      }));
    }
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      
      if (!plan.title.trim()) {
        alert('Please enter a plan title');
        return;
      }

      if (plan.milestones.some(m => !m.trim())) {
        alert('Please fill in all milestones');
        return;
      }

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');

      // In a real app, save to database
      const planData = {
        user_id: user.id,
        title: plan.title,
        description: plan.description,
        duration: plan.duration,
        milestones: plan.milestones,
        reminders_enabled: plan.reminders,
        created_at: new Date().toISOString(),
        status: 'active',
      };

      console.log('Plan created:', planData);
      
      alert('Plan created successfully! 🎉');
      router.push('/dashboard');
    } catch (error) {
      console.error('Error creating plan:', error);
      alert('Failed to create plan. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-orange-100 pb-20">
      <div className="max-w-2xl mx-auto p-6">
        
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.push('/dashboard')}
            className="flex items-center text-gray-600 hover:text-gray-800 mb-4"
          >
            <span className="mr-2">←</span>
            <span>Back to Dashboard</span>
          </button>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Create Your Plan</h1>
          <p className="text-gray-600">Structure your goals with clear milestones and timelines</p>
        </div>

        {/* Plan Title */}
        <div className="bg-white rounded-3xl p-6 shadow-lg border border-gray-100 mb-6">
          <label className="block text-lg font-semibold text-gray-900 mb-3">
            Plan Title
          </label>
          <input
            type="text"
            value={plan.title}
            onChange={(e) => setPlan(prev => ({ ...prev, title: e.target.value }))}
            placeholder="What's your plan called?"
            className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent text-lg"
          />
        </div>

        {/* Plan Description */}
        <div className="bg-white rounded-3xl p-6 shadow-lg border border-gray-100 mb-6">
          <label className="block text-lg font-semibold text-gray-900 mb-3">
            Description
          </label>
          <textarea
            value={plan.description}
            onChange={(e) => setPlan(prev => ({ ...prev, description: e.target.value }))}
            placeholder="Describe your plan in detail..."
            className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none h-32"
          />
        </div>

        {/* Duration Selection */}
        <div className="bg-white rounded-3xl p-6 shadow-lg border border-gray-100 mb-6">
          <label className="block text-lg font-semibold text-gray-900 mb-4">
            Duration
          </label>
          <div className="grid grid-cols-3 gap-3">
            {(['day', 'week', 'month'] as const).map((duration) => (
              <button
                key={duration}
                className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                  plan.duration === duration
                    ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white border-orange-500'
                    : 'bg-gray-50 text-gray-700 border-gray-200 hover:border-orange-300'
                }`}
                onClick={() => setPlan(prev => ({ ...prev, duration }))}
              >
                <div className="text-2xl mb-1">
                  {duration === 'day' ? '📅' : duration === 'week' ? '📆' : '🗓️'}
                </div>
                <div className="font-medium">
                  {duration.charAt(0).toUpperCase() + duration.slice(1)}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Milestones */}
        <div className="bg-white rounded-3xl p-6 shadow-lg border border-gray-100 mb-6">
          <div className="flex items-center justify-between mb-4">
            <label className="text-lg font-semibold text-gray-900">
              Milestones
            </label>
            <button
              onClick={handleAddMilestone}
              className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-xl transition-colors"
            >
              + Add Milestone
            </button>
          </div>
          
          <div className="space-y-3">
            {plan.milestones.map((milestone, index) => (
              <div key={index} className="flex items-center space-x-3">
                <div className="flex-shrink-0 w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 font-semibold text-sm">
                  {index + 1}
                </div>
                <input
                  type="text"
                  value={milestone}
                  onChange={(e) => handleUpdateMilestone(index, e.target.value)}
                  placeholder={`Milestone ${index + 1}`}
                  className="flex-1 p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
                {plan.milestones.length > 1 && (
                  <button
                    onClick={() => handleRemoveMilestone(index)}
                    className="flex-shrink-0 w-8 h-8 bg-red-100 hover:bg-red-200 text-red-600 rounded-full flex items-center justify-center transition-colors"
                  >
                    ×
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Reminders Toggle */}
        <div className="bg-white rounded-3xl p-6 shadow-lg border border-gray-100 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">Enable Reminders</h3>
              <p className="text-gray-600">Get notifications to keep you on track</p>
            </div>
            <button
              onClick={() => setPlan(prev => ({ ...prev, reminders: !prev.reminders }))}
              className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
                plan.reminders ? 'bg-orange-500' : 'bg-gray-300'
              }`}
            >
              <span
                className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                  plan.reminders ? 'translate-x-7' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Save Button */}
        <button
          onClick={handleSave}
          disabled={loading}
          className={`w-full py-4 px-6 rounded-2xl font-semibold text-white transition-all duration-200 ${
            loading
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 shadow-lg hover:shadow-xl'
          }`}
        >
          {loading ? 'Creating Plan...' : 'Create Plan 🚀'}
        </button>

        {/* Tips */}
        <div className="mt-6 bg-orange-100 rounded-2xl p-4">
          <h4 className="font-semibold text-orange-800 mb-2">💡 Pro Tips:</h4>
          <ul className="text-sm text-orange-700 space-y-1">
            <li>• Break large goals into smaller, manageable milestones</li>
            <li>• Set realistic timelines for each milestone</li>
            <li>• Review and adjust your plan weekly</li>
            <li>• Celebrate completing each milestone!</li>
          </ul>
        </div>
      </div>
    </div>
  );
} 