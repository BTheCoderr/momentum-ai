import { useState } from 'react';
import { X, Target, Heart, Calendar, AlertCircle } from 'lucide-react';

interface GoalCreationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (goal: any) => void;
}

export default function GoalCreationModal({ isOpen, onClose, onSave }: GoalCreationModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    deadline: '',
    emotionalContext: '',
    category: 'personal'
  });
  
  const [currentStep, setCurrentStep] = useState(1);
  const [errors, setErrors] = useState<string[]>([]);

  if (!isOpen) return null;

  const handleNext = () => {
    const newErrors: string[] = [];
    
    if (currentStep === 1) {
      if (!formData.title.trim()) newErrors.push('Goal title is required');
      if (!formData.description.trim()) newErrors.push('Goal description is required');
      if (!formData.deadline) newErrors.push('Deadline is required');
    } else if (currentStep === 2) {
      if (!formData.emotionalContext.trim()) newErrors.push('Please share why this goal matters to you');
    }

    setErrors(newErrors);
    
    if (newErrors.length === 0) {
      if (currentStep < 3) {
        setCurrentStep(currentStep + 1);
      } else {
        handleSave();
      }
    }
  };

  const handleSave = () => {
    const newGoal = {
      id: Date.now().toString(),
      ...formData,
      progress: 0,
      status: 'on-track' as const,
      createdAt: new Date().toISOString()
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
    setCurrentStep(1);
    setErrors([]);
  };

  const stepTitles = [
    "What's your goal?",
    "Why does this matter?",
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
                <p className="text-sm text-gray-600">Step {currentStep} of 3: {stepTitles[currentStep - 1]}</p>
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
              {[1, 2, 3].map((step) => (
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

          {/* Step 3: Review */}
          {currentStep === 3 && (
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

          {/* Errors */}
          {errors.length > 0 && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-start space-x-2">
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-semibold text-red-900 mb-1">Please fix the following:</h4>
                  <ul className="text-sm text-red-800 space-y-1">
                    {errors.map((error, index) => (
                      <li key={index}>• {error}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 flex justify-between">
          <button
            onClick={currentStep > 1 ? () => setCurrentStep(currentStep - 1) : onClose}
            className="px-6 py-3 text-gray-600 hover:text-gray-900 font-medium transition-colors"
          >
            {currentStep > 1 ? 'Back' : 'Cancel'}
          </button>
          
          <button
            onClick={handleNext}
            className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg hover:shadow-lg transition-shadow font-medium"
          >
            {currentStep === 3 ? 'Create Goal' : 'Next'}
          </button>
        </div>
      </div>
    </div>
  );
} 