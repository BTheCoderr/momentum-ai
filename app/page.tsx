'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const HomePage = () => {
  const router = useRouter();
  const [currentTime, setCurrentTime] = useState('');
  const [streak, setStreak] = useState(7);
  const [xp, setXP] = useState(2450);
  const [level, setLevel] = useState(5);
  const [progress, setProgress] = useState(85);
  const [activeGoals, setActiveGoals] = useState(2);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const timeStr = now.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
      });
      setCurrentTime(timeStr);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    const day = new Date().toLocaleDateString('en-US', { weekday: 'long' });
    
    if (hour < 12) return `Good morning! How's your ${day} going?`;
    if (hour < 17) return `Good afternoon! How's your ${day} going?`;
    return `Good evening! How's your ${day} going?`;
  };

  const continueStreak = () => {
    // Simulate streak continuation
    setStreak(prev => prev + 1);
    setXP(prev => prev + 50);
    alert('🔥 Streak continued! +50 XP');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="profile-header fade-in">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="profile-avatar">
              <img src="/images/icon.png" alt="Momentum AI" className="w-12 h-12 rounded-full" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Momentum AI</h1>
              <div className="flex items-center space-x-2 text-white/90">
                <span className="level-badge">Level {level}</span>
                <span className="text-sm">BETA</span>
              </div>
            </div>
          </div>
          <div className="text-right">
            <button 
              onClick={() => router.push('/profile')}
              className="profile-avatar hover:bg-white/30 transition-all duration-300"
            >
              👤
            </button>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6 pb-20">
        {/* Greeting */}
        <div className="slide-up">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {getGreeting()}
          </h2>
          <p className="text-gray-600">
            You're making great progress today! Keep the momentum going.
          </p>
        </div>

        {/* Main Streak Card */}
        <div className="duolingo-card slide-up" style={{ animationDelay: '0.1s' }}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="text-4xl streak-fire">🔥</div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900">
                  {streak} day streak! Keep it going!
                </h3>
                <p className="text-gray-600">
                  Your peak performance time is Tuesday mornings. Consider checking in then for best results.
                </p>
              </div>
            </div>
            <div className="text-4xl streak-fire animate-float">🔥</div>
          </div>
          
          <button 
            onClick={continueStreak}
            className="duolingo-button w-full"
          >
            Continue Streak 🎯
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="stat-card scale-in" style={{ animationDelay: '0.2s' }}>
            <div className="text-3xl mb-2">📈</div>
            <div className="text-3xl font-bold text-green-600">{progress}%</div>
            <div className="text-sm text-gray-600">Overall Progress</div>
            <div className="text-xs text-gray-500">77% success</div>
          </div>
          
          <div className="stat-card scale-in" style={{ animationDelay: '0.3s' }}>
            <div className="text-3xl mb-2">🎯</div>
            <div className="text-3xl font-bold text-blue-600">{activeGoals}</div>
            <div className="text-sm text-gray-600">Active Goals</div>
            <div className="text-xs text-gray-500">Currently tracking</div>
          </div>
        </div>

        {/* XP and Level Progress */}
        <div className="duolingo-card scale-in" style={{ animationDelay: '0.4s' }}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Your Progress</h3>
              <p className="text-gray-600">Level {level} • {xp} XP total</p>
            </div>
            <div className="xp-badge">
              +{xp % 500} XP
            </div>
          </div>
          
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${(xp % 500) / 500 * 100}%` }}
            ></div>
          </div>
          
          <div className="flex justify-between text-sm text-gray-600 mt-2">
            <span>Level {level}</span>
            <span>{500 - (xp % 500)} XP to Level {level + 1}</span>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
          
          <div className="grid grid-cols-2 gap-3">
            <button 
              onClick={() => router.push('/goals')}
              className="duolingo-card text-center hover:shadow-glow-orange transition-all duration-300 hover:scale-105"
            >
              <div className="text-3xl mb-2">🏠</div>
              <div className="font-semibold text-gray-900">Goals</div>
              <div className="text-sm text-gray-600">Track progress</div>
            </button>
            
            <button 
              onClick={() => router.push('/coach')}
              className="duolingo-card text-center hover:shadow-glow-orange transition-all duration-300 hover:scale-105"
            >
              <div className="text-3xl mb-2">🎯</div>
              <div className="font-semibold text-gray-900">AI Coach</div>
              <div className="text-sm text-gray-600">Get guidance</div>
            </button>
            
            <button 
              onClick={() => router.push('/analysis')}
              className="duolingo-card text-center hover:shadow-glow-orange transition-all duration-300 hover:scale-105"
            >
              <div className="text-3xl mb-2">🤖</div>
              <div className="font-semibold text-gray-900">Insights</div>
              <div className="text-sm text-gray-600">View analytics</div>
            </button>
            
            <button 
              onClick={() => router.push('/profile')}
              className="duolingo-card text-center hover:shadow-glow-orange transition-all duration-300 hover:scale-105"
            >
              <div className="text-3xl mb-2">📊</div>
              <div className="font-semibold text-gray-900">Profile</div>
              <div className="text-sm text-gray-600">Settings & stats</div>
            </button>
          </div>
        </div>

        {/* Today's Focus */}
        <div className="duolingo-card scale-in" style={{ animationDelay: '0.5s' }}>
          <h3 className="text-lg font-semibold text-gray-900 mb-3">🌟 Today's Focus</h3>
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
              <span className="text-gray-700">Complete daily workout (30 min)</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span className="text-gray-700">Practice meditation (10 min)</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-gray-700">Read for 20 minutes</span>
            </div>
          </div>
        </div>

        {/* Achievements */}
        <div className="duolingo-card scale-in" style={{ animationDelay: '0.6s' }}>
          <h3 className="text-lg font-semibold text-gray-900 mb-3">🏆 Recent Achievements</h3>
          <div className="grid grid-cols-3 gap-3">
            <div className="achievement-card earned">
              <div className="text-2xl mb-1">🥇</div>
              <div className="text-xs font-medium">First Goal</div>
            </div>
            <div className="achievement-card earned">
              <div className="text-2xl mb-1">🔥</div>
              <div className="text-xs font-medium">Week Streak</div>
            </div>
            <div className="achievement-card earned">
              <div className="text-2xl mb-1">⭐</div>
              <div className="text-xs font-medium">Level 5</div>
            </div>
          </div>
        </div>

        {/* Current Time */}
        <div className="text-center text-sm text-gray-500 mt-6">
          {currentTime}
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="bottom-nav">
        <div className="flex">
          <button className="bottom-nav-item active">
            <div className="text-2xl mb-1">🏠</div>
            <div className="text-xs">Home</div>
          </button>
          <button 
            className="bottom-nav-item"
            onClick={() => router.push('/goals')}
          >
            <div className="text-2xl mb-1">🎯</div>
            <div className="text-xs">Goals</div>
          </button>
          <button 
            className="bottom-nav-item"
            onClick={() => router.push('/coach')}
          >
            <div className="text-2xl mb-1">🤖</div>
            <div className="text-xs">AI Coach</div>
          </button>
          <button 
            className="bottom-nav-item"
            onClick={() => router.push('/analysis')}
          >
            <div className="text-2xl mb-1">📊</div>
            <div className="text-xs">Insights</div>
          </button>
          <button 
            className="bottom-nav-item"
            onClick={() => router.push('/profile')}
          >
            <div className="text-2xl mb-1">👤</div>
            <div className="text-xs">Profile</div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
