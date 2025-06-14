import React, { useState } from 'react';
import { CheckCircle, Circle, Flame, TrendingUp, Brain, Calendar } from 'lucide-react';

interface SmartCheckInProps {
  goals: any[];
  onComplete: (checkInData: any) => void;
  onClose: () => void;
}

export default function SmartCheckIn({ goals, onComplete, onClose }: SmartCheckInProps) {
  const [selectedHabits, setSelectedHabits] = useState<{ [goalId: string]: string[] }>({});
  const [mood, setMood] = useState(7);
  const [notes, setNotes] = useState('');
  const [currentStep, setCurrentStep] = useState(0);

  const steps = ['Habits', 'Mood', 'Reflection', 'AI Insights'];

  const toggleHabit = (goalId: string, habitId: string) => {
    setSelectedHabits(prev => ({
      ...prev,
      [goalId]: prev[goalId]?.includes(habitId)
        ? prev[goalId].filter(id => id !== habitId)
        : [...(prev[goalId] || []), habitId]
    }));
  };

  const calculateStreak = (goalId: string) => {
    // Mock streak calculation - in real app, this would come from database
    return Math.floor(Math.random() * 15) + 1;
  };

  const generateAIInsight = () => {
    const completedCount = Object.values(selectedHabits).flat().length;
    const totalHabits = goals.reduce((sum, goal) => sum + (goal.habits?.length || 0), 0);
    const completionRate = totalHabits > 0 ? (completedCount / totalHabits) * 100 : 0;

    if (completionRate >= 80) {
      return {
        type: 'celebration',
        title: 'Outstanding Consistency! 🎉',
        message: `You completed ${completedCount}/${totalHabits} habits today. This level of consistency is what separates achievers from dreamers. Keep this momentum going!`,
        action: 'Share your success with the community'
      };
    } else if (completionRate >= 50) {
      return {
        type: 'encouragement',
        title: 'Solid Progress 💪',
        message: `You're building good momentum with ${completedCount}/${totalHabits} habits completed. Tomorrow, try to add just one more habit to your routine.`,
        action: 'Set a reminder for your missed habit'
      };
    } else if (completionRate >= 25) {
      return {
        type: 'coaching',
        title: 'Let\'s Adjust Strategy 🎯',
        message: `${completedCount}/${totalHabits} habits completed. It seems like you might be overcommitted. Consider focusing on your top 2-3 most important habits first.`,
        action: 'Prioritize your habits'
      };
    } else {
      return {
        type: 'support',
        title: 'Tomorrow is a Fresh Start 🌅',
        message: `Today was challenging, but that's okay. Every expert was once a beginner. What's one small habit you can commit to tomorrow?`,
        action: 'Choose one habit for tomorrow'
      };
    }
  };

  const handleComplete = () => {
    const checkInData = {
      selectedHabits,
      mood,
      notes,
      timestamp: new Date().toISOString(),
      aiInsight: generateAIInsight()
    };
    onComplete(checkInData);
  };

  // Handler for AI insight actions
  const handleInsightAction = (insight: any) => {
    console.log(`Smart Check-in insight action: ${insight.action}`);
    
    switch (insight.type) {
      case 'celebration':
        alert(`🎉 ${insight.action}: Celebrating your success!`);
        break;
      case 'encouragement':
        alert(`💪 ${insight.action}: Building momentum!`);
        break;
      case 'coaching':
        alert(`🎯 ${insight.action}: Optimizing your approach!`);
        break;
      default:
        alert(`🌅 ${insight.action}: Taking action on your insight!`);
    }
  };

  const renderHabitsStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Daily Habits Check-in</h3>
        <p className="text-gray-600">Which habits did you complete today?</p>
      </div>

      <div className="space-y-6">
        {goals.map((goal) => (
          <div key={goal.id} className="bg-gray-50 rounded-xl p-4">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-semibold text-gray-900">{goal.title}</h4>
              <div className="flex items-center space-x-2 text-sm text-orange-600">
                <Flame className="w-4 h-4" />
                <span>{calculateStreak(goal.id)} day streak</span>
              </div>
            </div>
            
            <div className="space-y-3">
              {goal.habits?.map((habit: any) => (
                <div
                  key={habit.id}
                  onClick={() => toggleHabit(goal.id, habit.id)}
                  className="flex items-center space-x-3 p-3 bg-white rounded-lg cursor-pointer hover:bg-blue-50 transition-colors"
                >
                  {selectedHabits[goal.id]?.includes(habit.id) ? (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  ) : (
                    <Circle className="w-5 h-5 text-gray-400" />
                  )}
                  <span className={`flex-1 ${
                    selectedHabits[goal.id]?.includes(habit.id) 
                      ? 'text-green-700 line-through' 
                      : 'text-gray-700'
                  }`}>
                    {habit.text}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderMoodStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">How are you feeling?</h3>
        <p className="text-gray-600">Your emotional state affects your goal progress</p>
      </div>

      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6">
        <div className="text-center mb-6">
          <div className="text-4xl font-bold text-blue-600 mb-2">{mood}/10</div>
          <div className="text-lg text-gray-700">
            {mood >= 8 ? 'Feeling Great! 😊' : 
             mood >= 6 ? 'Pretty Good 🙂' : 
             mood >= 4 ? 'Okay 😐' : 
             'Struggling 😔'}
          </div>
        </div>

        <div className="space-y-4">
          <input
            type="range"
            min="1"
            max="10"
            value={mood}
            onChange={(e) => setMood(parseInt(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
          />
          <div className="flex justify-between text-sm text-gray-500">
            <span>1 - Very Low</span>
            <span>5 - Neutral</span>
            <span>10 - Excellent</span>
          </div>
        </div>
      </div>
    </div>
  );

  const renderReflectionStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Quick Reflection</h3>
        <p className="text-gray-600">What's on your mind about your progress?</p>
      </div>

      <div className="space-y-4">
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="How did today go? Any challenges or wins you want to note? (Optional)"
          rows={4}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
        />
        
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <Brain className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-blue-900 mb-1">AI Tip</h4>
              <p className="text-blue-700 text-sm">
                Reflecting on your daily progress helps build self-awareness and identifies patterns that lead to success.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderInsightsStep = () => {
    const insight = generateAIInsight();
    
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h3 className="text-2xl font-bold text-gray-900 mb-2">Your AI Insights</h3>
          <p className="text-gray-600">Based on today's check-in</p>
        </div>

        <div className={`rounded-xl p-6 ${
          insight.type === 'celebration' ? 'bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200' :
          insight.type === 'encouragement' ? 'bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200' :
          insight.type === 'coaching' ? 'bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200' :
          'bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200'
        }`}>
          <div className="flex items-start space-x-4">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
              insight.type === 'celebration' ? 'bg-green-100' :
              insight.type === 'encouragement' ? 'bg-blue-100' :
              insight.type === 'coaching' ? 'bg-yellow-100' :
              'bg-purple-100'
            }`}>
              {insight.type === 'celebration' ? '🎉' :
               insight.type === 'encouragement' ? '💪' :
               insight.type === 'coaching' ? '🎯' : '🌅'}
            </div>
            <div className="flex-1">
              <h4 className="text-lg font-semibold text-gray-900 mb-2">{insight.title}</h4>
              <p className="text-gray-700 mb-4">{insight.message}</p>
              <button 
                onClick={() => handleInsightAction(insight)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  insight.type === 'celebration' ? 'bg-green-600 hover:bg-green-700 text-white' :
                  insight.type === 'encouragement' ? 'bg-blue-600 hover:bg-blue-700 text-white' :
                  insight.type === 'coaching' ? 'bg-yellow-600 hover:bg-yellow-700 text-white' :
                  'bg-purple-600 hover:bg-purple-700 text-white'
                }`}
              >
                {insight.action}
              </button>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="font-medium text-gray-900 mb-2">Today's Summary</h4>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-blue-600">
                {Object.values(selectedHabits).flat().length}
              </div>
              <div className="text-sm text-gray-600">Habits Completed</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-600">{mood}/10</div>
              <div className="text-sm text-gray-600">Mood Score</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">
                {Math.round((Object.values(selectedHabits).flat().length / goals.reduce((sum, goal) => sum + (goal.habits?.length || 0), 0)) * 100) || 0}%
              </div>
              <div className="text-sm text-gray-600">Completion Rate</div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Progress Steps */}
          <div className="flex items-center justify-between mb-8">
            {steps.map((step, index) => (
              <div key={step} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  index <= currentStep 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-200 text-gray-600'
                }`}>
                  {index + 1}
                </div>
                <span className={`ml-2 text-sm ${
                  index <= currentStep ? 'text-blue-600 font-medium' : 'text-gray-500'
                }`}>
                  {step}
                </span>
                {index < steps.length - 1 && (
                  <div className={`w-8 h-0.5 mx-4 ${
                    index < currentStep ? 'bg-blue-600' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>

          {/* Step Content */}
          {currentStep === 0 && renderHabitsStep()}
          {currentStep === 1 && renderMoodStep()}
          {currentStep === 2 && renderReflectionStep()}
          {currentStep === 3 && renderInsightsStep()}

          {/* Navigation */}
          <div className="flex items-center justify-between pt-6 border-t mt-8">
            <button
              onClick={currentStep === 0 ? onClose : () => setCurrentStep(currentStep - 1)}
              className="px-6 py-2 text-gray-600 hover:text-gray-800 font-medium transition-colors"
            >
              {currentStep === 0 ? 'Cancel' : 'Back'}
            </button>
            
            <button
              onClick={currentStep === steps.length - 1 ? handleComplete : () => setCurrentStep(currentStep + 1)}
              className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-lg hover:from-blue-700 hover:to-purple-700 transition-colors"
            >
              {currentStep === steps.length - 1 ? 'Complete Check-in' : 'Next'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 