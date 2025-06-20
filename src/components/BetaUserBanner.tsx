import React, { useState, useEffect } from 'react';
import { Star, Users, MessageSquare, X, Trophy, Zap } from 'lucide-react';
import { analytics } from '@/lib/analytics';

interface BetaUserBannerProps {
  userId?: string;
  userNumber?: number;
}

export default function BetaUserBanner({ userId = 'demo-user', userNumber }: BetaUserBannerProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);
  const [isClient, setIsClient] = useState(false);
  
  // Fix hydration mismatch by only showing dynamic content on client side
  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    analytics.track('beta_banner_dismissed', {}, userId);
  };

  const handleFeedbackClick = () => {
    setShowFeedbackForm(true);
    analytics.track('beta_feedback_opened', {}, userId);
  };

  const handleFeedbackSubmit = (feedback: string, rating: number) => {
    analytics.track('beta_feedback_submitted', { feedback, rating }, userId);
    setShowFeedbackForm(false);
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <>
      <div className="bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-3">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                  <Star className="w-4 h-4 text-yellow-300" />
                </div>
                <span className="font-semibold">
                  Beta User #{isClient ? (userNumber || 66) : 66}
                </span>
              </div>
              
              <div className="hidden sm:flex items-center space-x-6 text-sm">
                <div className="flex items-center space-x-1">
                  <Users className="w-4 h-4" />
                  <span>Exclusive early access</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Trophy className="w-4 h-4" />
                  <span>Shape the future</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Zap className="w-4 h-4" />
                  <span>Free premium features</span>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={handleFeedbackClick}
                className="flex items-center space-x-2 px-3 py-1 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-medium transition-colors"
              >
                <MessageSquare className="w-4 h-4" />
                <span className="hidden sm:inline">Share Feedback</span>
                <span className="sm:hidden">Feedback</span>
              </button>
              
              <button
                onClick={handleDismiss}
                className="text-white/70 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Feedback Modal */}
      {showFeedbackForm && (
        <FeedbackModal
          onSubmit={handleFeedbackSubmit}
          onClose={() => setShowFeedbackForm(false)}
          userId={userId}
        />
      )}
    </>
  );
}

interface FeedbackModalProps {
  onSubmit: (feedback: string, rating: number) => void;
  onClose: () => void;
  userId: string;
}

function FeedbackModal({ onSubmit, onClose, userId }: FeedbackModalProps) {
  const [feedback, setFeedback] = useState('');
  const [rating, setRating] = useState(5);
  const [category, setCategory] = useState('general');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(feedback, rating);
    
    // Also track detailed feedback
    analytics.track('detailed_feedback', {
      feedback,
      rating,
      category,
      feedbackLength: feedback.length
    }, userId);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-900">Beta Feedback</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Rating */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              How would you rate your experience so far?
            </label>
            <div className="flex space-x-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className={`w-8 h-8 ${
                    star <= rating ? 'text-yellow-400' : 'text-gray-300'
                  } hover:text-yellow-400 transition-colors`}
                >
                  <Star className="w-full h-full fill-current" />
                </button>
              ))}
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Feedback Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="general">General Experience</option>
              <option value="ui">User Interface</option>
              <option value="features">Features & Functionality</option>
              <option value="ai">AI Coaching</option>
              <option value="onboarding">Onboarding Process</option>
              <option value="bugs">Bug Reports</option>
              <option value="suggestions">Feature Suggestions</option>
            </select>
          </div>

          {/* Feedback Text */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Your Feedback
            </label>
            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="What's working well? What could be improved? Any bugs or suggestions?"
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              required
            />
          </div>

          {/* Submit */}
          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!feedback.trim()}
              className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Submit Feedback
            </button>
          </div>
        </form>

        {/* Incentive */}
        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-800">
            🎁 <strong>Thank you!</strong> Your feedback helps us build the best AI accountability agent. 
            Beta users get lifetime access to premium features!
          </p>
        </div>
      </div>
    </div>
  );
} 