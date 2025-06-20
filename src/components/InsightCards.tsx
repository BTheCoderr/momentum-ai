import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Crown, CheckSquare, Calendar, MessageCircle, Target, Plus, Zap } from 'lucide-react';
import { InsightCardStack } from './ShareableInsightCard';
import PremiumFeatureManager from './PremiumFeatureManager';

interface InsightData {
  id: string;
  text: string;
  type: 'motivation' | 'reflection' | 'challenge' | 'celebration' | 'wisdom';
  mood?: string;
  streak?: number;
  date: string;
  userName?: string;
  category: string;
  confidence: number;
  actionable: boolean;
  tags: string[];
}

interface InsightCardsProps {
  userId?: string;
  limit?: number;
  onInsightAction?: (action: string, insight: InsightData) => void;
}

export default function InsightCards({ 
  userId = 'demo-user', 
  limit = 10,
  onInsightAction 
}: InsightCardsProps) {
  const [insights, setInsights] = useState<InsightData[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    generatePersonalizedInsights();
  }, [userId]);

  const generatePersonalizedInsights = async () => {
    setLoading(true);
    try {
      // Simulate API call to generate insights
      const mockInsights = await generateMockInsights();
      setInsights(mockInsights);
    } catch (error) {
      console.error('Error generating insights:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateMockInsights = async (): Promise<InsightData[]> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    const insightTemplates = [
      {
        type: 'motivation' as const,
        templates: [
          "Your consistency is building something powerful. Every small action today is an investment in tomorrow's success.",
          "I've noticed you're strongest in the mornings. What if we tackled your biggest goal right after you wake up?",
          "You've shown up {streak} days in a row. That's not just a number—that's proof of who you're becoming.",
          "Your energy peaks around 10 AM based on your patterns. This is your golden hour for deep work.",
          "You're 73% more likely to follow through when you set intentions the night before. Tonight, choose tomorrow's win."
        ]
      },
      {
        type: 'reflection' as const,
        templates: [
          "I see you struggle most on Wednesdays. What's different about that day? Understanding this pattern could unlock your week.",
          "You've mentioned feeling stuck 3 times this month. Each time, you broke through by changing your environment. Remember this.",
          "Your mood improves by 40% after physical movement. Your body is trying to tell you something important.",
          "You celebrate others but rarely yourself. What would happen if you treated your wins like you treat your friends' victories?",
          "Your biggest breakthroughs happen when you're slightly uncomfortable. Comfort isn't your friend right now."
        ]
      },
      {
        type: 'challenge' as const,
        templates: [
          "You've mastered the basics. Ready for something that will stretch you? Try the 5-minute rule on your hardest task.",
          "Your comfort zone is getting too comfortable. What's one thing you've been avoiding that could change everything?",
          "You're ready for a bigger goal. Your current ones are too easy for who you've become.",
          "I dare you to do the thing you're most afraid of failing at. You're stronger than your fear.",
          "You've been playing it safe for 2 weeks. Time to take a calculated risk that excites and terrifies you."
        ]
      },
      {
        type: 'celebration' as const,
        templates: [
          "You just hit {streak} days! Do you realize how rare this level of consistency is? You're in the top 5% of people.",
          "Three months ago, you thought this goal was impossible. Look at you now. You didn't just achieve it—you made it look easy.",
          "Your growth is inspiring. Someone, somewhere, needs to see that transformation is possible. You're proof.",
          "You've turned showing up into an art form. This isn't luck—this is who you are now.",
          "Remember when you almost gave up at day 12? I'm so glad you didn't. Look how far you've come."
        ]
      },
      {
        type: 'wisdom' as const,
        templates: [
          "Progress isn't always visible. Sometimes it's happening in the spaces between your efforts—in your resilience, your patience, your faith.",
          "The person you're becoming is more important than the goal you're chasing. Goals end. Character lasts forever.",
          "Your biggest enemy isn't failure—it's the story you tell yourself about failure. Change the story, change your life.",
          "Consistency beats intensity every time. The tortoise doesn't win because it's fast. It wins because it doesn't stop.",
          "You don't need to be perfect. You just need to be persistent. Perfect is the enemy of progress."
        ]
      }
    ];

    const mockUserData = {
      streak: Math.floor(Math.random() * 50) + 1,
      userName: 'You',
      recentMoods: ['focused', 'motivated', 'tired', 'excited'],
      patterns: {
        bestTimeOfDay: 'morning',
        strugglingDay: 'Wednesday',
        energyBooster: 'physical movement'
      }
    };

    return insightTemplates.flatMap(category => 
      category.templates.slice(0, 2).map((template, index) => ({
        id: `${category.type}-${index}-${Date.now()}`,
        text: template.replace('{streak}', mockUserData.streak.toString()),
        type: category.type,
        mood: mockUserData.recentMoods[Math.floor(Math.random() * mockUserData.recentMoods.length)],
        streak: mockUserData.streak,
        date: new Date().toISOString(),
        userName: mockUserData.userName,
        category: category.type,
        confidence: Math.random() * 0.3 + 0.7, // 70-100% confidence
        actionable: Math.random() > 0.3, // 70% are actionable
        tags: [category.type, 'personalized', 'ai-generated']
      }))
    ).slice(0, limit);
  };

  const handleCardAction = (action: string, insight: InsightData) => {
    console.log(`User ${action}ed insight:`, insight);
    
    if (action === 'save') {
      // Save to user's favorites
      saveFavoriteInsight(insight);
    } else if (action === 'share') {
      // Track sharing for viral metrics
      trackInsightShare(insight);
    }
    
    onInsightAction?.(action, insight);
  };

  const saveFavoriteInsight = async (insight: InsightData) => {
    try {
      // In a real app, this would save to Supabase
      console.log('Saving insight to favorites:', insight.id);
      
      // Show success feedback
      const event = new CustomEvent('showToast', {
        detail: { message: 'Insight saved to your collection! 💾', type: 'success' }
      });
      window.dispatchEvent(event);
    } catch (error) {
      console.error('Error saving insight:', error);
    }
  };

  const trackInsightShare = async (insight: InsightData) => {
    try {
      // Analytics for viral growth
      console.log('Tracking insight share:', {
        insightId: insight.id,
        type: insight.type,
        category: insight.category,
        userId: userId,
        timestamp: new Date().toISOString()
      });
      
      // Show success feedback
      const event = new CustomEvent('showToast', {
        detail: { message: 'Insight shared! Spread the wisdom 🌟', type: 'success' }
      });
      window.dispatchEvent(event);
    } catch (error) {
      console.error('Error tracking share:', error);
    }
  };

  const refreshInsights = async () => {
    setRefreshing(true);
    try {
      const newInsights = await generateMockInsights();
      setInsights(newInsights);
      
      const event = new CustomEvent('showToast', {
        detail: { message: 'Fresh insights generated! ✨', type: 'success' }
      });
      window.dispatchEvent(event);
    } catch (error) {
      console.error('Error refreshing insights:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const handleActionableButton = (action: string, insight: InsightData) => {
    console.log(`Actionable button clicked: ${action}`, insight);
    
    switch (action) {
      case 'create-goal':
        createGoalFromInsight(insight);
        break;
      case 'schedule-reminder':
        scheduleReminder(insight);
        break;
      case 'start-habit':
        startHabitFromInsight(insight);
        break;
      case 'chat-coach':
        openCoachChat(insight);
        break;
      case 'track-progress':
        trackProgressFromInsight(insight);
        break;
      default:
        console.log('Unknown action:', action);
    }
  };

  const createGoalFromInsight = (insight: InsightData) => {
    // Extract goal suggestion from insight
    const goalTitle = extractGoalFromInsight(insight.text);
    
    const event = new CustomEvent('showToast', {
      detail: { message: `Goal created: "${goalTitle}" 🎯`, type: 'success' }
    });
    window.dispatchEvent(event);
    
    // In real app, would integrate with goal creation API
    console.log('Creating goal from insight:', goalTitle);
  };

  const scheduleReminder = (insight: InsightData) => {
    const event = new CustomEvent('showToast', {
      detail: { message: 'Reminder scheduled for tomorrow morning! ⏰', type: 'success' }
    });
    window.dispatchEvent(event);
  };

  const startHabitFromInsight = (insight: InsightData) => {
    const habitName = extractHabitFromInsight(insight.text);
    
    const event = new CustomEvent('showToast', {
      detail: { message: `Habit tracker started: "${habitName}" ✅`, type: 'success' }
    });
    window.dispatchEvent(event);
  };

  const openCoachChat = (insight: InsightData) => {
    const event = new CustomEvent('showToast', {
      detail: { message: 'Opening AI coach chat... 💬', type: 'info' }
    });
    window.dispatchEvent(event);
    
    // In real app, would open chat with this insight as context
    console.log('Opening coach chat with insight context:', insight);
  };

  const trackProgressFromInsight = (insight: InsightData) => {
    const event = new CustomEvent('showToast', {
      detail: { message: 'Progress tracking enabled! 📈', type: 'success' }
    });
    window.dispatchEvent(event);
  };

  const extractGoalFromInsight = (text: string): string => {
    // Simple extraction logic - in real app would use AI
    if (text.includes('tackle your biggest goal')) return 'Morning Deep Work Session';
    if (text.includes('physical movement')) return 'Daily Exercise Routine';
    if (text.includes('5-minute rule')) return 'Break Down Big Tasks';
    if (text.includes('calculated risk')) return 'Take On New Challenge';
    return 'Personal Growth Goal';
  };

  const extractHabitFromInsight = (text: string): string => {
    if (text.includes('morning')) return 'Morning Routine';
    if (text.includes('physical movement')) return 'Daily Movement';
    if (text.includes('intentions the night before')) return 'Evening Planning';
    if (text.includes('environment')) return 'Environment Change';
    return 'Daily Practice';
  };

  const getActionableButtons = (insight: InsightData) => {
    const buttons = [];
    
    // Different insights get different actionable buttons
    if (insight.type === 'motivation' || insight.type === 'challenge') {
      buttons.push({
        icon: <Target className="w-4 h-4" />,
        label: 'Create Goal',
        action: 'create-goal',
        isPremium: false
      });
    }
    
    if (insight.text.includes('morning') || insight.text.includes('time')) {
      buttons.push({
        icon: <Calendar className="w-4 h-4" />,
        label: 'Schedule',
        action: 'schedule-reminder',
        isPremium: true
      });
    }
    
    if (insight.type === 'wisdom' || insight.type === 'reflection') {
      buttons.push({
        icon: <MessageCircle className="w-4 h-4" />,
        label: 'Chat with Coach',
        action: 'chat-coach',
        isPremium: true
      });
    }
    
    if (insight.text.includes('consistency') || insight.text.includes('habit')) {
      buttons.push({
        icon: <CheckSquare className="w-4 h-4" />,
        label: 'Start Habit',
        action: 'start-habit',
        isPremium: false
      });
    }
    
    // Always include progress tracking for actionable insights
    if (insight.actionable) {
      buttons.push({
        icon: <Zap className="w-4 h-4" />,
        label: 'Track Progress',
        action: 'track-progress',
        isPremium: true
      });
    }
    
    return buttons.slice(0, 3); // Max 3 buttons per insight
  };

  if (loading) {
    return (
      <div className="w-full h-96 flex items-center justify-center">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="text-6xl mb-4"
          >
            🧠
          </motion.div>
          <div className="text-lg font-semibold text-gray-700 mb-2">
            Generating Your Insights...
          </div>
          <div className="text-sm text-gray-500">
            Analyzing your patterns and progress
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full">
      {/* Header */}
      <div className="absolute top-4 left-4 right-4 z-30 flex items-center justify-between">
        <div className="bg-black/20 backdrop-blur-sm rounded-full px-4 py-2">
          <span className="text-white text-sm font-medium">
            💡 Personal Insights
          </span>
        </div>
        
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={refreshInsights}
          disabled={refreshing}
          className="bg-white/20 backdrop-blur-sm rounded-full p-2 text-white hover:bg-white/30 transition-colors"
        >
          <motion.div
            animate={{ rotate: refreshing ? 360 : 0 }}
            transition={{ duration: 1, repeat: refreshing ? Infinity : 0, ease: "linear" }}
          >
            🔄
          </motion.div>
        </motion.button>
      </div>

      {/* Insight Cards Stack */}
      <InsightCardStack
        insights={insights}
        onCardAction={handleCardAction}
      />

      {/* Bottom Actions */}
      <div className="absolute bottom-4 left-4 right-4 z-30">
        <div className="bg-black/20 backdrop-blur-sm rounded-full px-6 py-3 flex items-center justify-center">
          <span className="text-white text-sm opacity-90">
            Swipe to explore • Tap ❤️ to save
          </span>
        </div>
      </div>
    </div>
  );
}

// Insight Categories Component
export function InsightCategories({ 
  onCategorySelect 
}: { 
  onCategorySelect: (category: string) => void;
}) {
  const categories = [
    { id: 'all', name: 'All Insights', emoji: '✨', color: 'from-purple-500 to-pink-500' },
    { id: 'motivation', name: 'Motivation', emoji: '🚀', color: 'from-orange-500 to-red-500' },
    { id: 'reflection', name: 'Reflection', emoji: '🤔', color: 'from-blue-500 to-purple-500' },
    { id: 'challenge', name: 'Challenges', emoji: '⚡', color: 'from-green-500 to-blue-500' },
    { id: 'celebration', name: 'Wins', emoji: '🎉', color: 'from-yellow-500 to-orange-500' },
    { id: 'wisdom', name: 'Wisdom', emoji: '💎', color: 'from-indigo-500 to-purple-500' }
  ];

  return (
    <div className="flex space-x-3 overflow-x-auto pb-2">
      {categories.map((category) => (
        <motion.button
          key={category.id}
          whileTap={{ scale: 0.95 }}
          onClick={() => onCategorySelect(category.id)}
          className={`
            flex-shrink-0 px-4 py-2 rounded-full text-white font-medium text-sm
            bg-gradient-to-r ${category.color} shadow-lg
            flex items-center space-x-2
          `}
        >
          <span className="text-lg">{category.emoji}</span>
          <span>{category.name}</span>
        </motion.button>
      ))}
    </div>
  );
}

// Insight Analytics Component
export function InsightAnalytics({ 
  insights 
}: { 
  insights: InsightData[];
}) {
  const getInsightStats = () => {
    const total = insights.length;
    const saved = insights.filter(i => i.actionable).length;
    const avgConfidence = insights.reduce((acc, i) => acc + i.confidence, 0) / total;
    
    const typeDistribution = insights.reduce((acc, insight) => {
      acc[insight.type] = (acc[insight.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return { total, saved, avgConfidence, typeDistribution };
  };

  const stats = getInsightStats();

  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        📊 Your Insight Journey
      </h3>
      
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="text-center p-3 bg-blue-50 rounded-lg">
          <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
          <div className="text-sm text-gray-600">Total Insights</div>
        </div>
        <div className="text-center p-3 bg-green-50 rounded-lg">
          <div className="text-2xl font-bold text-green-600">
            {Math.round(stats.avgConfidence * 100)}%
          </div>
          <div className="text-sm text-gray-600">Accuracy</div>
        </div>
      </div>

      <div className="space-y-2">
        <h4 className="font-medium text-gray-700">Insight Types</h4>
        {Object.entries(stats.typeDistribution).map(([type, count]) => (
          <div key={type} className="flex items-center justify-between">
            <span className="capitalize text-gray-600">{type}</span>
            <div className="flex items-center space-x-2">
              <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-blue-500 rounded-full"
                  style={{ width: `${(count / stats.total) * 100}%` }}
                />
              </div>
              <span className="text-sm text-gray-500">{count}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 