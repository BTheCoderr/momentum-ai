'use client'

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, Circle, Flame, Target, Heart, Zap, Mic } from 'lucide-react';
import VoiceInput from './VoiceInput';

interface Habit {
  id: string;
  text: string;
  completed: boolean;
}

interface Goal {
  id: string;
  title: string;
  habits: Habit[];
  currentStreak: number;
  progress?: number;
}

interface CheckInData {
  mood: number;
  energy: number;
  stress: number;
  wins: string[];
  challenges: string[];
  priorities: string[];
  reflection: string;
  goalProgress: { goalId: string; progress: number }[];
}

interface DailyCheckInModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CheckInData) => void;
  goals?: Goal[];
}

export default function DailyCheckInModal({ isOpen, onClose, onSubmit, goals = [] }: DailyCheckInModalProps) {
  const [step, setStep] = useState(1);
  const [checkInData, setCheckInData] = useState<CheckInData>({
    mood: 3,
    energy: 3,
    stress: 3,
    wins: [''],
    challenges: [''],
    priorities: [''],
    reflection: '',
    goalProgress: goals.map(g => ({ goalId: g.id, progress: g.progress || 0 }))
  });

  const totalSteps = 6;

  const handleNext = () => {
    if (step < totalSteps) setStep(step + 1);
  };

  const handlePrev = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = () => {
    // Filter out empty strings
    const cleanData = {
      ...checkInData,
      wins: checkInData.wins.filter(w => w.trim()),
      challenges: checkInData.challenges.filter(c => c.trim()),
      priorities: checkInData.priorities.filter(p => p.trim())
    };
    onSubmit(cleanData);
    onClose();
    setStep(1); // Reset for next time
  };

  const updateArrayField = (field: 'wins' | 'challenges' | 'priorities', index: number, value: string) => {
    const newArray = [...checkInData[field]];
    newArray[index] = value;
    setCheckInData({ ...checkInData, [field]: newArray });
  };

  const addArrayItem = (field: 'wins' | 'challenges' | 'priorities') => {
    if (checkInData[field].length < 5) {
      setCheckInData({ ...checkInData, [field]: [...checkInData[field], ''] });
    }
  };

  const removeArrayItem = (field: 'wins' | 'challenges' | 'priorities', index: number) => {
    const newArray = checkInData[field].filter((_, i) => i !== index);
    if (newArray.length === 0) newArray.push('');
    setCheckInData({ ...checkInData, [field]: newArray });
  };

  const ScaleSelector = ({ 
    value, 
    onChange, 
    labels, 
    emoji 
  }: { 
    value: number; 
    onChange: (val: number) => void; 
    labels: string[]; 
    emoji: string;
  }) => (
    <div className="space-y-4">
      <div className="text-center text-4xl mb-2">{emoji}</div>
      <div className="flex justify-between items-center space-x-2">
        {[1, 2, 3, 4, 5].map((num) => (
          <button
            key={num}
            onClick={() => onChange(num)}
            className={`w-12 h-12 rounded-full border-2 transition-all ${
              value === num
                ? 'bg-blue-500 border-blue-500 text-white scale-110'
                : 'border-gray-300 hover:border-blue-300 hover:scale-105'
            }`}
          >
            {num}
          </button>
        ))}
      </div>
      <div className="flex justify-between text-xs text-gray-500">
        <span>{labels[0]}</span>
        <span>{labels[1]}</span>
      </div>
    </div>
  );

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-xl font-semibold mb-2">How are you feeling today?</h3>
              <p className="text-gray-600">Your emotional state matters</p>
            </div>
            <ScaleSelector
              value={checkInData.mood}
              onChange={(mood) => setCheckInData({ ...checkInData, mood })}
              labels={['Struggling', 'Thriving']}
              emoji="😊"
            />
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-xl font-semibold mb-2">What's your energy level?</h3>
              <p className="text-gray-600">Energy fuels everything we do</p>
            </div>
            <ScaleSelector
              value={checkInData.energy}
              onChange={(energy) => setCheckInData({ ...checkInData, energy })}
              labels={['Drained', 'Energized']}
              emoji="⚡"
            />
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-xl font-semibold mb-2">How stressed do you feel?</h3>
              <p className="text-gray-600">Stress awareness helps us manage it</p>
            </div>
            <ScaleSelector
              value={checkInData.stress}
              onChange={(stress) => setCheckInData({ ...checkInData, stress })}
              labels={['Very Calm', 'Very Stressed']}
              emoji="🧘"
            />
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-xl font-semibold mb-2">What are your wins today?</h3>
              <p className="text-gray-600">Celebrate progress, no matter how small</p>
            </div>
            <div className="space-y-4">
              {checkInData.wins.map((win, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <div className="text-green-500">🎉</div>
                    <input
                      type="text"
                      value={win}
                      onChange={(e) => updateArrayField('wins', index, e.target.value)}
                      placeholder="What went well today?"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    {checkInData.wins.length > 1 && (
                      <button
                        onClick={() => removeArrayItem('wins', index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                  <VoiceInput
                    onTranscript={(text, isFinal) => {
                      if (isFinal) {
                        updateArrayField('wins', index, text);
                      }
                    }}
                    placeholder="Tap mic to speak your win..."
                    showTranscript={false}
                    className="ml-8"
                  />
                </div>
              ))}
              {checkInData.wins.length < 5 && (
                <button
                  onClick={() => addArrayItem('wins')}
                  className="text-blue-500 hover:text-blue-700 text-sm"
                >
                  + Add another win
                </button>
              )}
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-xl font-semibold mb-2">What challenges are you facing?</h3>
              <p className="text-gray-600">Acknowledging challenges helps us grow</p>
            </div>
            <div className="space-y-4">
              {checkInData.challenges.map((challenge, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <div className="text-orange-500">⚡</div>
                    <input
                      type="text"
                      value={challenge}
                      onChange={(e) => updateArrayField('challenges', index, e.target.value)}
                      placeholder="What's challenging you?"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    {checkInData.challenges.length > 1 && (
                      <button
                        onClick={() => removeArrayItem('challenges', index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                  <VoiceInput
                    onTranscript={(text, isFinal) => {
                      if (isFinal) {
                        updateArrayField('challenges', index, text);
                      }
                    }}
                    placeholder="Tap mic to speak your challenge..."
                    showTranscript={false}
                    className="ml-8"
                  />
                </div>
              ))}
              {checkInData.challenges.length < 5 && (
                <button
                  onClick={() => addArrayItem('challenges')}
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
              <h3 className="text-xl font-semibold mb-2">Any thoughts to share?</h3>
              <p className="text-gray-600">Reflection deepens self-awareness</p>
            </div>
            <div className="space-y-3">
              <textarea
                value={checkInData.reflection}
                onChange={(e) => setCheckInData({ ...checkInData, reflection: e.target.value })}
                placeholder="What's on your mind? Any insights, feelings, or thoughts you'd like to capture?"
                className="w-full h-32 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              />
              <VoiceInput
                onTranscript={(text, isFinal) => {
                  if (isFinal) {
                    setCheckInData({ ...checkInData, reflection: text });
                  }
                }}
                placeholder="Tap mic to speak your reflection..."
                showTranscript={false}
                className="w-full"
              />
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="bg-white rounded-2xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold">Daily Check-In</h2>
                <p className="text-sm text-gray-500">Step {step} of {totalSteps}</p>
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            
            {/* Progress Bar */}
            <div className="mt-3 bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(step / totalSteps) * 100}%` }}
              />
            </div>
          </div>

          {/* Content */}
          <div className="px-6 py-6">
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
                className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                Next
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
              >
                Complete Check-In
              </button>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
} 