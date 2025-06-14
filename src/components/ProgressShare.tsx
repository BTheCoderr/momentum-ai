import React, { useState } from 'react';
import { Share2, Download, Copy, Twitter, Facebook, Linkedin, CheckCircle } from 'lucide-react';

interface ProgressShareProps {
  goals: any[];
  weeklyStats: {
    habitsCompleted: number;
    avgMood: number;
    streakDays: number;
    completionRate: number;
  };
  onClose: () => void;
}

export default function ProgressShare({ goals, weeklyStats, onClose }: ProgressShareProps) {
  const [shareType, setShareType] = useState<'card' | 'report'>('card');
  const [copied, setCopied] = useState(false);

  const generateShareText = () => {
    if (shareType === 'card') {
      return `🎯 This week I completed ${weeklyStats.habitsCompleted} habits with a ${weeklyStats.completionRate}% success rate! 

My ${weeklyStats.streakDays}-day streak is keeping me motivated 🔥

Building momentum with @MomentumAI - my AI accountability coach that keeps me on track! 

#Goals #Accountability #Progress`;
    } else {
      return `📊 Weekly Progress Report:

🎯 Goals: ${goals.length} active
✅ Habits: ${weeklyStats.habitsCompleted} completed  
📈 Success Rate: ${weeklyStats.completionRate}%
🔥 Current Streak: ${weeklyStats.streakDays} days
😊 Avg Mood: ${weeklyStats.avgMood}/10

Staying accountable with AI coaching! 🤖

#WeeklyWins #GoalSetting #MomentumAI`;
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(generateShareText());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const shareToSocial = (platform: string) => {
    const text = encodeURIComponent(generateShareText());
    const url = encodeURIComponent('https://momentum-ai.com');
    
    let shareUrl = '';
    switch (platform) {
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=${text}`;
        break;
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}&quote=${text}`;
        break;
      case 'linkedin':
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${url}&summary=${text}`;
        break;
    }
    
    if (shareUrl) {
      window.open(shareUrl, '_blank', 'width=600,height=400');
    }
  };

  const downloadImage = () => {
    // In a real app, this would generate and download an image
    alert('Image download feature coming soon! For now, you can copy the text and create your own post.');
  };

  const renderProgressCard = () => (
    <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl p-6 text-white">
      <div className="text-center mb-6">
        <h3 className="text-2xl font-bold mb-2">Weekly Progress</h3>
        <p className="text-blue-100">Staying consistent with my goals! 🎯</p>
      </div>
      
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-white/20 rounded-lg p-4 text-center">
          <div className="text-3xl font-bold">{weeklyStats.habitsCompleted}</div>
          <div className="text-sm text-blue-100">Habits Completed</div>
        </div>
        <div className="bg-white/20 rounded-lg p-4 text-center">
          <div className="text-3xl font-bold">{weeklyStats.completionRate}%</div>
          <div className="text-sm text-blue-100">Success Rate</div>
        </div>
        <div className="bg-white/20 rounded-lg p-4 text-center">
          <div className="text-3xl font-bold">{weeklyStats.streakDays}</div>
          <div className="text-sm text-blue-100">Day Streak 🔥</div>
        </div>
        <div className="bg-white/20 rounded-lg p-4 text-center">
          <div className="text-3xl font-bold">{weeklyStats.avgMood}/10</div>
          <div className="text-sm text-blue-100">Avg Mood</div>
        </div>
      </div>
      
      <div className="text-center">
        <div className="text-sm text-blue-100 mb-2">Powered by</div>
        <div className="text-xl font-bold">Momentum AI</div>
        <div className="text-xs text-blue-200">Your AI Accountability Coach</div>
      </div>
    </div>
  );

  const renderWeeklyReport = () => (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="text-center mb-6">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Weekly Report</h3>
        <p className="text-gray-600">Here's how I did this week</p>
      </div>
      
      <div className="space-y-4 mb-6">
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center space-x-3">
            <CheckCircle className="w-5 h-5 text-green-500" />
            <span className="font-medium text-gray-900">Active Goals</span>
          </div>
          <span className="text-2xl font-bold text-blue-600">{goals.length}</span>
        </div>
        
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center space-x-3">
            <CheckCircle className="w-5 h-5 text-green-500" />
            <span className="font-medium text-gray-900">Habits Completed</span>
          </div>
          <span className="text-2xl font-bold text-green-600">{weeklyStats.habitsCompleted}</span>
        </div>
        
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center space-x-3">
            <CheckCircle className="w-5 h-5 text-green-500" />
            <span className="font-medium text-gray-900">Success Rate</span>
          </div>
          <span className="text-2xl font-bold text-purple-600">{weeklyStats.completionRate}%</span>
        </div>
        
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center space-x-3">
            <span className="text-orange-500">🔥</span>
            <span className="font-medium text-gray-900">Current Streak</span>
          </div>
          <span className="text-2xl font-bold text-orange-600">{weeklyStats.streakDays} days</span>
        </div>
      </div>
      
      <div className="text-center text-sm text-gray-500">
        Generated by Momentum AI - Your AI Accountability Coach
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Share Progress</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              ✕
            </button>
          </div>

          {/* Share Type Toggle */}
          <div className="flex bg-gray-100 rounded-lg p-1 mb-6">
            <button
              onClick={() => setShareType('card')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                shareType === 'card'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Progress Card
            </button>
            <button
              onClick={() => setShareType('report')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                shareType === 'report'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Weekly Report
            </button>
          </div>

          {/* Preview */}
          <div className="mb-6">
            {shareType === 'card' ? renderProgressCard() : renderWeeklyReport()}
          </div>

          {/* Share Options */}
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={copyToClipboard}
                className="flex items-center justify-center space-x-2 p-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                {copied ? <CheckCircle className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                <span className="text-sm font-medium">{copied ? 'Copied!' : 'Copy Text'}</span>
              </button>
              
              <button
                onClick={downloadImage}
                className="flex items-center justify-center space-x-2 p-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Download className="w-4 h-4" />
                <span className="text-sm font-medium">Download</span>
              </button>
            </div>

            <div className="border-t pt-4">
              <p className="text-sm text-gray-600 mb-3">Share on social media:</p>
              <div className="flex space-x-3">
                <button
                  onClick={() => shareToSocial('twitter')}
                  className="flex items-center justify-center w-10 h-10 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  <Twitter className="w-4 h-4" />
                </button>
                <button
                  onClick={() => shareToSocial('facebook')}
                  className="flex items-center justify-center w-10 h-10 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Facebook className="w-4 h-4" />
                </button>
                <button
                  onClick={() => shareToSocial('linkedin')}
                  className="flex items-center justify-center w-10 h-10 bg-blue-700 text-white rounded-lg hover:bg-blue-800 transition-colors"
                >
                  <Linkedin className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Text Preview */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-2">Preview text:</p>
            <p className="text-sm text-gray-800 whitespace-pre-line">{generateShareText()}</p>
          </div>
        </div>
      </div>
    </div>
  );
} 