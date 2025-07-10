'use client';

import React, { useState } from 'react';

const ReflectionPage = () => {
  const [reflectionText, setReflectionText] = useState('');
  const [gratitude, setGratitude] = useState(['', '', '']);
  const [selectedPrompt, setSelectedPrompt] = useState('');

  const reflectionPrompts = [
    "What went well today, and what could I improve tomorrow?",
    "What am I most grateful for right now?",
    "What challenges did I face today, and how did I handle them?",
    "What progress have I made toward my goals this week?",
    "How am I feeling about my current direction in life?",
    "What would I tell my past self from a month ago?",
    "What small wins can I celebrate today?",
    "What patterns do I notice in my thoughts and behaviors?",
  ];

  const handleGratitudeChange = (index: number, value: string) => {
    const newGratitude = [...gratitude];
    newGratitude[index] = value;
    setGratitude(newGratitude);
  };

  const handleSaveReflection = () => {
    // Here you would save to your database
    console.log('Saving reflection:', { reflectionText, gratitude, prompt: selectedPrompt });
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Reflection</h1>
        <p className="text-gray-600 mt-2">Take time to reflect on your thoughts, progress, and gratitude</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Reflection */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">🧘 Daily Reflection</h3>
          
          {/* Reflection Prompts */}
          <div className="mb-6">
            <h4 className="text-md font-medium text-gray-700 mb-3">Choose a prompt or write freely:</h4>
            <div className="grid grid-cols-1 gap-2 mb-4">
              {reflectionPrompts.map((prompt, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setSelectedPrompt(prompt);
                    setReflectionText(prompt + '\n\n');
                  }}
                  className="text-left p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors text-sm text-gray-700"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>

          {/* Reflection Text Area */}
          <div className="mb-4">
            <textarea
              value={reflectionText}
              onChange={(e) => setReflectionText(e.target.value)}
              placeholder="What's on your mind? Write about your thoughts, feelings, challenges, or anything you'd like to reflect on..."
              className="w-full h-48 p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
          </div>

          <button
            onClick={handleSaveReflection}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Save Reflection
          </button>
        </div>

        {/* Gratitude Journal */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">🙏 Gratitude Journal</h3>
            <p className="text-sm text-gray-600 mb-4">Write three things you're grateful for today:</p>
            
            <div className="space-y-3">
              {gratitude.map((item, index) => (
                <div key={index}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {index + 1}. I'm grateful for...
                  </label>
                  <input
                    type="text"
                    value={item}
                    onChange={(e) => handleGratitudeChange(index, e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="Something you appreciate today"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Mood Check */}
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">😊 Emotional Check-in</h3>
            <p className="text-sm text-gray-600 mb-4">How are you feeling after this reflection?</p>
            
            <div className="grid grid-cols-2 gap-3">
              {[
                { emoji: '😌', label: 'Peaceful' },
                { emoji: '😊', label: 'Happy' },
                { emoji: '🤔', label: 'Thoughtful' },
                { emoji: '😔', label: 'Sad' },
                { emoji: '😤', label: 'Frustrated' },
                { emoji: '😴', label: 'Tired' },
              ].map((mood) => (
                <button
                  key={mood.label}
                  className="p-3 border border-gray-200 rounded-lg hover:border-gray-300 hover:bg-gray-50 transition-colors"
                >
                  <div className="text-2xl mb-1">{mood.emoji}</div>
                  <div className="text-xs text-gray-600">{mood.label}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Previous Reflections */}
      <div className="mt-8 bg-white rounded-xl shadow-sm border p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">📚 Previous Reflections</h3>
        <div className="text-center py-12">
          <div className="text-4xl mb-4">📝</div>
          <p className="text-gray-600">Your previous reflections will appear here</p>
          <p className="text-sm text-gray-500 mt-2">Start reflecting regularly to build a meaningful journal</p>
        </div>
      </div>
    </div>
  );
};

export default ReflectionPage; 