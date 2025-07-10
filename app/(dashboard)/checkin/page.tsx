'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export default function CheckInPage() {
  const router = useRouter();
  const supabase = createClientComponentClient();
  const [loading, setLoading] = useState(false);
  const [mood, setMood] = useState(3);
  const [energy, setEnergy] = useState(3);
  const [stress, setStress] = useState(3);
  const [wins, setWins] = useState('');
  const [challenges, setChallenges] = useState('');
  const [reflection, setReflection] = useState('');
  const [priorities, setPriorities] = useState('');

  const moodEmojis = ['😔', '😕', '😐', '🙂', '😊'];
  const energyEmojis = ['🔋', '🪫', '⚡', '🔥', '⭐'];
  const stressEmojis = ['😌', '😐', '😰', '😫', '🤯'];
  const moodLabels = ['Terrible', 'Bad', 'Okay', 'Good', 'Amazing'];
  const energyLabels = ['Drained', 'Low', 'Moderate', 'High', 'Energized'];
  const stressLabels = ['Relaxed', 'Calm', 'Tense', 'Stressed', 'Overwhelmed'];

  const handleSubmit = async () => {
    if (!wins.trim() || !priorities.trim()) {
      alert('Please share at least your wins and priorities for tomorrow.');
      return;
    }

    try {
      setLoading(true);
      
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');

      const checkInData = {
        user_id: user.id,
        date: new Date().toISOString(),
        mood,
        energy,
        stress,
        wins: wins.trim(),
        challenges: challenges.trim(),
        reflection: reflection.trim(),
        priorities: priorities.trim(),
      };
      
      // Submit check-in
      const { error } = await supabase
        .from('checkins')
        .insert(checkInData);
      
      if (error) throw error;
      
      // Calculate XP reward based on streak (mock for now)
      const xpGained = Math.floor(Math.random() * 51) + 10; // 10-60 XP
      
      alert(`Check-in Complete! 🎉\n\nGreat job! You earned ${xpGained} XP`);
      router.push('/dashboard');
      
    } catch (error) {
      console.error('Check-in submission error:', error);
      alert('Unable to submit check-in right now. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const ScaleSelector = ({ 
    title, 
    value, 
    onChange, 
    emojis, 
    labels 
  }: {
    title: string;
    value: number;
    onChange: (val: number) => void;
    emojis: string[];
    labels: string[];
  }) => (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      <div className="grid grid-cols-5 gap-3">
        {[1, 2, 3, 4, 5].map((num) => (
          <button
            key={num}
            className={`p-4 rounded-xl transition-all duration-200 ${
              value === num
                ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg scale-105'
                : 'bg-gray-50 hover:bg-gray-100 text-gray-700'
            }`}
            onClick={() => onChange(num)}
          >
            <div className="text-2xl mb-1">{emojis[num - 1]}</div>
            <div className="text-xs font-medium">{labels[num - 1]}</div>
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-orange-100">
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Daily Check-In</h1>
          <p className="text-gray-600">Take a moment to reflect on your day and set intentions for tomorrow</p>
        </div>

        {/* Mood Scale */}
        <div className="mb-6">
          <ScaleSelector
            title="How are you feeling today?"
            value={mood}
            onChange={setMood}
            emojis={moodEmojis}
            labels={moodLabels}
          />
        </div>

        {/* Energy Scale */}
        <div className="mb-6">
          <ScaleSelector
            title="What's your energy level?"
            value={energy}
            onChange={setEnergy}
            emojis={energyEmojis}
            labels={energyLabels}
          />
        </div>

        {/* Stress Scale */}
        <div className="mb-6">
          <ScaleSelector
            title="How stressed do you feel?"
            value={stress}
            onChange={setStress}
            emojis={stressEmojis}
            labels={stressLabels}
          />
        </div>

        {/* Reflection Questions */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <label className="block text-lg font-semibold text-gray-900 mb-3">
              🏆 What were your wins today?
            </label>
            <textarea
              value={wins}
              onChange={(e) => setWins(e.target.value)}
              placeholder="Celebrate your achievements, big or small..."
              className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none h-24"
            />
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <label className="block text-lg font-semibold text-gray-900 mb-3">
              🌱 What challenges did you face?
            </label>
            <textarea
              value={challenges}
              onChange={(e) => setChallenges(e.target.value)}
              placeholder="What obstacles did you encounter? How did you handle them?"
              className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none h-24"
            />
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <label className="block text-lg font-semibold text-gray-900 mb-3">
              🧘 What did you learn about yourself?
            </label>
            <textarea
              value={reflection}
              onChange={(e) => setReflection(e.target.value)}
              placeholder="Reflect on your thoughts, feelings, and insights..."
              className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none h-24"
            />
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <label className="block text-lg font-semibold text-gray-900 mb-3">
              🎯 What are your priorities for tomorrow?
            </label>
            <textarea
              value={priorities}
              onChange={(e) => setPriorities(e.target.value)}
              placeholder="Set your intentions and focus areas for tomorrow..."
              className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none h-24"
            />
          </div>
        </div>

        {/* Submit Button */}
        <div className="mt-8">
          <button
            onClick={handleSubmit}
            disabled={loading}
            className={`w-full py-4 px-6 rounded-2xl font-semibold text-white transition-all duration-200 ${
              loading
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 shadow-lg hover:shadow-xl'
            }`}
          >
            {loading ? 'Submitting...' : 'Complete Check-In 🎉'}
          </button>
        </div>

        {/* XP Info */}
        <div className="mt-6 bg-orange-100 rounded-2xl p-4 text-center">
          <p className="text-sm text-orange-800">
            <span className="font-semibold">💡 Tip:</span> Daily check-ins earn you 10-60 XP based on your streak!
          </p>
        </div>
      </div>
    </div>
  );
} 