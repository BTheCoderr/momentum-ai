import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface OnboardingData {
  name: string;
  primaryGoal: string;
  motivation: string;
  challenges: string[];
  preferredTone: 'supportive' | 'energetic' | 'thoughtful';
  checkInTime: string;
  why: string;
}

interface OnboardingFlowProps {
  isOpen: boolean;
  onComplete: (data: OnboardingData) => void;
}

export default function OnboardingFlow({ isOpen, onComplete }: OnboardingFlowProps) {
  const [step, setStep] = useState(1);
  const [data, setData] = useState<OnboardingData>({
    name: '',
    primaryGoal: '',
    motivation: '',
    challenges: [''],
    preferredTone: 'supportive',
    checkInTime: '9:00',
    why: ''
  });

  const totalSteps = 7;

  const handleNext = () => {
    if (step < totalSteps) setStep(step + 1);
  };

  const handlePrev = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleComplete = () => {
    const cleanData = {
      ...data,
      challenges: data.challenges.filter(c => c.trim())
    };
    onComplete(cleanData);
  };

  const updateChallenge = (index: number, value: string) => {
    const newChallenges = [...data.challenges];
    newChallenges[index] = value;
    setData({ ...data, challenges: newChallenges });
  };

  const addChallenge = () => {
    if (data.challenges.length < 5) {
      setData({ ...data, challenges: [...data.challenges, ''] });
    }
  };

  const removeChallenge = (index: number) => {
    const newChallenges = data.challenges.filter((_, i) => i !== index);
    if (newChallenges.length === 0) newChallenges.push('');
    setData({ ...data, challenges: newChallenges });
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="text-center space-y-6">
            <div className="text-6xl mb-4">👋</div>
            <h2 className="text-2xl font-bold text-gray-900">Welcome to Your Journey</h2>
            <p className="text-gray-600 text-lg max-w-md mx-auto">
              I'm not just another app. I'm here to grow alongside you, understand your patterns, 
              and become a trusted companion in achieving what matters most to you.
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-md mx-auto">
              <p className="text-blue-800 text-sm">
                This isn't about perfect systems or productivity hacks. 
                It's about building a relationship that helps you become who you want to be.
              </p>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <div className="text-4xl mb-4">🤝</div>
              <h2 className="text-xl font-bold text-gray-900">Let's start with your name</h2>
              <p className="text-gray-600">What would you like me to call you?</p>
            </div>
            <input
              type="text"
              value={data.name}
              onChange={(e) => setData({ ...data, name: e.target.value })}
              placeholder="Your name..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center text-lg"
              autoFocus
            />
            <p className="text-sm text-gray-500 text-center">
              I'll remember this and use it naturally in our conversations
            </p>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <div className="text-4xl mb-4">🎯</div>
              <h2 className="text-xl font-bold text-gray-900">
                What's the one thing you most want to achieve?
              </h2>
              <p className="text-gray-600">This doesn't have to be perfect - we can evolve it together</p>
            </div>
            <textarea
              value={data.primaryGoal}
              onChange={(e) => setData({ ...data, primaryGoal: e.target.value })}
              placeholder="I want to..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              rows={3}
            />
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <p className="text-green-800 text-sm">
                💡 This becomes our north star. Everything we do together will connect back to this.
              </p>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <div className="text-4xl mb-4">💫</div>
              <h2 className="text-xl font-bold text-gray-900">What's driving this goal?</h2>
              <p className="text-gray-600">The deeper reason often sustains us through challenges</p>
            </div>
            <textarea
              value={data.motivation}
              onChange={(e) => setData({ ...data, motivation: e.target.value })}
              placeholder="This matters to me because..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              rows={4}
            />
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <div className="text-4xl mb-4">⚡</div>
              <h2 className="text-xl font-bold text-gray-900">What usually gets in your way?</h2>
              <p className="text-gray-600">Understanding your patterns helps me support you better</p>
            </div>
            <div className="space-y-3">
              {data.challenges.map((challenge, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={challenge}
                    onChange={(e) => updateChallenge(index, e.target.value)}
                    placeholder="What typically challenges you?"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  {data.challenges.length > 1 && (
                    <button
                      onClick={() => removeChallenge(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
              {data.challenges.length < 5 && (
                <button
                  onClick={addChallenge}
                  className="text-blue-500 hover:text-blue-700 text-sm"
                >
                  + Add another challenge
                </button>
              )}
            </div>
          </div>
        );

      case 6:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <div className="text-4xl mb-4">💬</div>
              <h2 className="text-xl font-bold text-gray-900">How should I communicate with you?</h2>
              <p className="text-gray-600">I can adapt my style to what works best for you</p>
            </div>
            <div className="space-y-3">
              {[
                { 
                  id: 'supportive', 
                  title: 'Supportive & Understanding', 
                  description: 'Gentle encouragement, empathetic responses',
                  emoji: '🤗'
                },
                { 
                  id: 'energetic', 
                  title: 'Energetic & Motivating', 
                  description: 'High energy, action-focused, enthusiastic',
                  emoji: '🚀'
                },
                { 
                  id: 'thoughtful', 
                  title: 'Thoughtful & Reflective', 
                  description: 'Deep questions, philosophical, contemplative',
                  emoji: '🤔'
                }
              ].map((tone) => (
                <button
                  key={tone.id}
                  onClick={() => setData({ ...data, preferredTone: tone.id as any })}
                  className={`w-full p-4 border-2 rounded-lg text-left transition-all ${
                    data.preferredTone === tone.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <div className="text-2xl">{tone.emoji}</div>
                    <div>
                      <div className="font-semibold text-gray-900">{tone.title}</div>
                      <div className="text-sm text-gray-600">{tone.description}</div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        );

      case 7:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <div className="text-4xl mb-4">🌅</div>
              <h2 className="text-xl font-bold text-gray-900">When works best for daily check-ins?</h2>
              <p className="text-gray-600">I'll gently remind you at this time each day</p>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-center space-x-4">
                <label className="text-gray-700">Preferred time:</label>
                <input
                  type="time"
                  value={data.checkInTime}
                  onChange={(e) => setData({ ...data, checkInTime: e.target.value })}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h3 className="font-semibold text-yellow-800 mb-2">Why daily check-ins matter:</h3>
                <ul className="text-yellow-700 text-sm space-y-1">
                  <li>• They help me understand your patterns and moods</li>
                  <li>• You'll see trends you might otherwise miss</li>
                  <li>• Small daily awareness builds massive long-term growth</li>
                  <li>• It's how we stay connected to what matters most</li>
                </ul>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-lg font-semibold">Getting to know you</h1>
              <p className="text-sm text-gray-500">Step {step} of {totalSteps}</p>
            </div>
            <div className="text-2xl">✨</div>
          </div>
          
          {/* Progress Bar */}
          <div className="mt-3 bg-gray-200 rounded-full h-2">
            <motion.div
              className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${(step / totalSteps) * 100}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {renderStep()}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 flex justify-between">
          <button
            onClick={handlePrev}
            disabled={step === 1}
            className={`px-4 py-2 rounded-lg ${
              step === 1
                ? 'text-gray-400 cursor-not-allowed'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Previous
          </button>
          
          {step < totalSteps ? (
            <button
              onClick={handleNext}
              disabled={
                (step === 2 && !data.name.trim()) ||
                (step === 3 && !data.primaryGoal.trim()) ||
                (step === 4 && !data.motivation.trim())
              }
              className={`px-6 py-2 rounded-lg transition-colors ${
                (step === 2 && !data.name.trim()) ||
                (step === 3 && !data.primaryGoal.trim()) ||
                (step === 4 && !data.motivation.trim())
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:from-blue-600 hover:to-purple-600'
              }`}
            >
              Continue
            </button>
          ) : (
            <button
              onClick={handleComplete}
              className="px-6 py-2 bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-lg hover:from-green-600 hover:to-blue-600 transition-colors"
            >
              Begin Journey ✨
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
} 