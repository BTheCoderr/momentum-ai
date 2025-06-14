import { useState } from 'react';
import { X, Target, Heart, Calendar, AlertCircle, Plus, Trash2, CheckCircle, Lock } from 'lucide-react';
import { useSubscription } from '@/hooks/useSubscription';
import { TIER_DESCRIPTIONS, SubscriptionTier } from '@/config/subscription-tiers';

interface GoalCreationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (goal: any) => void;
  currentGoalCount: number;
}

export default function GoalCreationModal({ isOpen, onClose, onSave, currentGoalCount }: GoalCreationModalProps) {
  const { checkGoalLimit, userTier } = useSubscription();
  const canCreateGoal = checkGoalLimit(currentGoalCount);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    deadline: '',
    emotionalContext: '',
    category: 'personal'
  });

  const [habits, setHabits] = useState<string[]>(['', '', '']);
  
  const [currentStep, setCurrentStep] = useState(1);
  const [errors, setErrors] = useState<string[]>([]);

  if (!isOpen) return null;

  const handleNext = () => {
    if (!canCreateGoal) {
      setErrors(['You have reached your goal limit. Upgrade to create more goals.']);
      return;
    }

    const newErrors: string[] = [];
    
    if (currentStep === 1) {
      if (!formData.title.trim()) newErrors.push('Goal title is required');
      if (!formData.description.trim()) newErrors.push('Goal description is required');
      if (!formData.deadline) newErrors.push('Deadline is required');
    } else if (currentStep === 2) {
      if (!formData.emotionalContext.trim()) newErrors.push('Please share why this goal matters to you');
    } else if (currentStep === 3) {
      const validHabits = habits.filter(h => h.trim());
      if (validHabits.length === 0) newErrors.push('Please add at least one daily habit');
    }

    setErrors(newErrors);
    
    if (newErrors.length === 0) {
      if (currentStep < 4) {
        setCurrentStep(currentStep + 1);
      } else {
        handleSave();
      }
    }
  };

  const handleSave = () => {
    const validHabits = habits.filter(h => h.trim()).map((text, index) => ({
      id: `habit-${Date.now()}-${index}`,
      text: text.trim(),
      completed: false
    }));

    const newGoal = {
      id: Date.now().toString(),
      ...formData,
      progress: 0,
      status: 'on-track' as const,
      createdAt: new Date().toISOString(),
      currentStreak: 0,
      bestStreak: 0,
      completionRate: 0,
      lastCheckIn: new Date().toISOString(),
      habits: validHabits
    };
    
    onSave(newGoal);
    onClose();
    setFormData({
      title: '',
      description: '',
      deadline: '',
      emotionalContext: '',
      category: 'personal'
    });
    setHabits(['', '', '']);
    setCurrentStep(1);
    setErrors([]);
  };

  const addHabit = () => {
    setHabits([...habits, '']);
  };

  const removeHabit = (index: number) => {
    if (habits.length > 1) {
      setHabits(habits.filter((_, i) => i !== index));
    }
  };

  const updateHabit = (index: number, value: string) => {
    const newHabits = [...habits];
    newHabits[index] = value;
    setHabits(newHabits);
  };

  const stepTitles = [
    "What's your goal?",
    "Why does this matter?",
    "Break it into daily habits",
    "Review & Create"
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                <Target className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Create New Goal</h2>
                <p className="text-sm text-gray-600">Step {currentStep} of 4: {stepTitles[currentStep - 1]}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-gray-100 transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
          
          {/* Progress Bar */}
          <div className="mt-4">
            <div className="flex space-x-2">
              {[1, 2, 3, 4].map((step) => (
                <div
                  key={step}
                  className={`flex-1 h-2 rounded-full ${
                    step <= currentStep ? 'bg-blue-500' : 'bg-gray-200'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[60vh] overflow-y-auto">
          {!canCreateGoal ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Lock className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Goal Limit Reached</h3>
              <p className="text-gray-600 mb-6">
                You've reached the maximum number of goals for your {TIER_DESCRIPTIONS[userTier as SubscriptionTier].name} plan.
                Upgrade to create unlimited goals and unlock more features!
              </p>
              <div className="space-y-4">
                <a
                  href="#pricing"
                  className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                  onClick={() => {
                    onClose();
                    // Scroll to pricing section
                    document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                >
                  View Pricing Plans
                </a>
                <button
                  onClick={onClose}
                  className="block w-full text-gray-500 hover:text-gray-700"
                >
                  Maybe Later
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Step 1: Basic Goal Info */}
              {currentStep === 1 && (
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                      Goal Title
                    </label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="e.g., Launch my SaaS product"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                      Description
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Describe what you want to achieve..."
                      rows={3}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-2">
                        Target Deadline
                      </label>
                      <input
                        type="date"
                        value={formData.deadline}
                        onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-2">
                        Category
                      </label>
                      <select
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="personal">Personal</option>
                        <option value="professional">Professional</option>
                        <option value="health">Health & Fitness</option>
                        <option value="financial">Financial</option>
                        <option value="creative">Creative</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Emotional Context */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  <div className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-lg p-6 border border-pink-100">
                    <div className="flex items-start space-x-3">
                      <div className="w-10 h-10 bg-pink-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <Heart className="w-5 h-5 text-pink-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-2">Why This Goal Matters</h3>
                        <p className="text-sm text-gray-700 leading-relaxed">
                          This is the most important part. Your emotional connection to your goal is what will keep you motivated when things get tough. 
                          Be specific about the deeper reasons - how will achieving this goal make you feel? What will it mean for your life, your family, your future?
                        </p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                      Tell me why this goal matters to you
                    </label>
                    <textarea
                      value={formData.emotionalContext}
                      onChange={(e) => setFormData({ ...formData, emotionalContext: e.target.value })}
                      placeholder="e.g., This represents my dream of financial freedom so I can spend more time with my family and not worry about money. I want to prove to myself that I can build something meaningful..."
                      rows={6}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    />
                    <p className="text-xs text-gray-500 mt-2">
                      The more honest and specific you are, the better I can help you stay motivated.
                    </p>
                  </div>
                </div>
              )}

              {/* Step 3: Habit Breakdown */}
              {currentStep === 3 && (
                <div className="space-y-6">
                  <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-6 border border-green-100">
                    <div className="flex items-start space-x-3">
                      <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <Target className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-2">Break Your Goal Into Daily Habits</h3>
                        <p className="text-sm text-gray-700 leading-relaxed">
                          Big goals are achieved through small, consistent daily actions. What specific habits will you do every day to make progress?
                          These should be concrete, measurable actions that you can check off each day.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-4">
                      Daily Habits for "{formData.title}"
                    </label>
                    
                    <div className="space-y-3">
                      {habits.map((habit, index) => (
                        <div key={index} className="flex items-center space-x-3">
                          <div className="flex-1">
                            <input
                              type="text"
                              value={habit}
                              onChange={(e) => updateHabit(index, e.target.value)}
                              placeholder={`Daily habit ${index + 1} (e.g., "Code for 2 hours")`}
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                          </div>
                          
                          {habits.length > 1 && (
                            <button
                              onClick={() => removeHabit(index)}
                              className="p-3 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>

                    <button
                      onClick={addHabit}
                      className="mt-4 flex items-center space-x-2 text-blue-600 hover:text-blue-700 font-medium"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add Another Habit</span>
                    </button>

                    <div className="mt-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                      <div className="flex items-start space-x-2">
                        <CheckCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <h4 className="text-sm font-semibold text-yellow-900 mb-1">Pro Tips</h4>
                          <ul className="text-sm text-yellow-800 space-y-1">
                            <li>• Make habits specific and measurable</li>
                            <li>• Start with 2-4 habits (you can add more later)</li>
                            <li>• Focus on consistency over perfection</li>
                            <li>• Each habit should take 15-60 minutes</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 4: Review */}
              {currentStep === 4 && (
                <div className="space-y-6">
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h3 className="font-semibold text-gray-900 mb-4">Review Your Goal</h3>
                    
                    <div className="space-y-4">
                      <div>
                        <h4 className="text-sm font-medium text-gray-600 mb-1">Goal</h4>
                        <p className="text-gray-900">{formData.title}</p>
                      </div>
                      
                      <div>
                        <h4 className="text-sm font-medium text-gray-600 mb-1">Description</h4>
                        <p className="text-gray-900">{formData.description}</p>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <h4 className="text-sm font-medium text-gray-600 mb-1">Deadline</h4>
                          <p className="text-gray-900">{new Date(formData.deadline).toLocaleDateString()}</p>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-gray-600 mb-1">Category</h4>
                          <p className="text-gray-900 capitalize">{formData.category}</p>
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="text-sm font-medium text-gray-600 mb-1">Why It Matters</h4>
                        <p className="text-gray-900 italic">"{formData.emotionalContext}"</p>
                      </div>

                      <div>
                        <h4 className="text-sm font-medium text-gray-600 mb-2">Daily Habits</h4>
                        <div className="space-y-2">
                          {habits.filter(h => h.trim()).map((habit, index) => (
                            <div key={index} className="flex items-center space-x-2">
                              <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                              <span className="text-gray-900">{habit}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                    <div className="flex items-start space-x-3">
                      <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <AlertCircle className="w-4 h-4 text-blue-600" />
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-blue-900 mb-1">AI Coach Ready</h4>
                        <p className="text-sm text-blue-800">
                          Once you create this goal, I'll start tracking your patterns and provide personalized insights to help you stay motivated and on track.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Error Messages */}
        {errors.length > 0 && (
          <div className="px-6 py-4 bg-red-50 border-t border-red-100">
            {errors.map((error, index) => (
              <div key={index} className="flex items-center space-x-2 text-red-600">
                <AlertCircle className="w-4 h-4" />
                <span>{error}</span>
              </div>
            ))}
          </div>
        )}

        {/* Footer */}
        {canCreateGoal && (
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
            <div className="flex justify-between items-center">
              {currentStep > 1 && (
                <button
                  onClick={() => setCurrentStep(currentStep - 1)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-900"
                >
                  Back
                </button>
              )}
              <button
                onClick={handleNext}
                className="ml-auto px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
              >
                {currentStep === 4 ? 'Create Goal' : 'Continue'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 