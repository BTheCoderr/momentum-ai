import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  TextInput, 
  TouchableOpacity, 
  ScrollView, 
  Text, 
  StyleSheet, 
  SafeAreaView,
  KeyboardAvoidingView,
  Platform 
} from 'react-native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { RouteProp } from '@react-navigation/native';
import { RootTabParamList } from '../navigation';
import api from '../api/axios';
import { goalsAPI, userAPI } from '../api/services';

type ChatScreenNavigationProp = BottomTabNavigationProp<RootTabParamList, 'Chat'>;
type ChatScreenRouteProp = RouteProp<RootTabParamList, 'Chat'>;

interface Props {
  navigation: ChatScreenNavigationProp;
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  type?: 'plan' | 'coaching' | 'insight' | 'regular';
  actionButtons?: { label: string; action: string }[];
}

interface UserProfile {
  name: string;
  primaryGoal: string;
  motivation: string;
  experience: string;
  preferredTime: string;
}

export default function ChatScreen({ navigation }: Props) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [userGoals, setUserGoals] = useState<any[]>([]);
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    initializeChat();
  }, []);

  const initializeChat = async () => {
    try {
      // Load user profile and goals
      const profile = await userAPI.getUserProfile();
      const goals = await goalsAPI.getGoals();
      
      setUserProfile(profile);
      setUserGoals(goals);

      // Generate personalized welcome message
      const welcomeMessage = generatePersonalizedWelcome(profile, goals);
      
      const initialMessage: Message = {
        id: '1',
        role: 'assistant',
        content: welcomeMessage,
        timestamp: new Date(),
        type: 'coaching',
        actionButtons: [
          { label: '📋 Create My Plan', action: 'create_plan' },
          { label: '💪 Daily Coaching', action: 'daily_coaching' },
          { label: '📊 Review Progress', action: 'review_progress' }
        ]
      };
      
      setMessages([initialMessage]);

      // Initial prompt handling removed for now - can be added back with proper navigation setup
    } catch (error) {
      console.log('Error initializing chat:', error);
      // Fallback to basic welcome
      const fallbackMessage: Message = {
        id: '1',
        role: 'assistant',
        content: "Hi! I'm your AI accountability coach. I'm here to help you create personalized plans and stay motivated. What would you like to work on today?",
        timestamp: new Date()
      };
      setMessages([fallbackMessage]);
    }
  };

  const generatePersonalizedWelcome = (profile: UserProfile, goals: any[]): string => {
    const { name, primaryGoal, motivation, experience, preferredTime } = profile;
    
    return `Hi ${name}! 👋 

I see you're working on "${primaryGoal}" and your motivation is "${motivation}". That's incredibly powerful! 

As your AI coach, I've analyzed your profile and current goals. Here's what I can help you with:

🎯 **Personalized Action Plans** - Step-by-step guides tailored to your ${experience} level
⏰ **Optimal Timing** - Coaching aligned with your ${preferredTime} preference  
💪 **Daily Motivation** - Reminders connected to your deeper "why"
📈 **Progress Tracking** - Smart insights based on your patterns

You currently have ${goals.length} active goal${goals.length !== 1 ? 's' : ''}. Ready to create a winning strategy together?`;
  };

  const handleInitialPrompt = async (prompt: string, profile: UserProfile, goals: any[]) => {
    // Handle specific prompts from other screens
    if (prompt.includes('create_plan')) {
      await handleActionButton('create_plan');
    } else if (prompt.includes('daily_coaching')) {
      await handleActionButton('daily_coaching');
    } else {
      setInput(prompt);
    }
  };

  const handleActionButton = async (action: string) => {
    setIsLoading(true);
    
    try {
      let response: Message;
      
      switch (action) {
        case 'create_plan':
          response = await generatePersonalizedPlan();
          break;
        case 'daily_coaching':
          response = await generateDailyCoaching();
          break;
        case 'review_progress':
          response = await generateProgressReview();
          break;
        case 'detailed_analytics':
          response = await generateDetailedAnalytics();
          break;
        case 'optimize_strategy':
          response = await generateOptimizationStrategy();
          break;
        case 'success_patterns':
          response = await generateSuccessPatterns();
          break;
        case 'acceleration_plan':
          response = await generateAccelerationPlan();
          break;
        default:
          response = {
            id: Date.now().toString(),
            role: 'assistant',
            content: "I'm not sure how to help with that. Can you tell me more about what you need?",
            timestamp: new Date()
          };
      }
      
      setMessages(prev => [...prev, response]);
    } catch (error) {
      console.log('Error handling action:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const generatePersonalizedPlan = async (): Promise<Message> => {
    if (!userProfile || !userGoals.length) {
      return {
        id: Date.now().toString(),
        role: 'assistant',
        content: "I need to learn more about your goals first. What would you like to achieve?",
        timestamp: new Date()
      };
    }

    const { name, primaryGoal, motivation, experience, preferredTime } = userProfile;
    const activeGoal = userGoals.find(g => g.status === 'on-track') || userGoals[0];
    
    const planContent = `🎯 **Your Personalized ${activeGoal.title} Plan**

**Your Why:** ${motivation}
**Experience Level:** ${experience}
**Best Time:** ${preferredTime}

## 📅 **Week 1-2: Foundation Building**
${experience === 'beginner' ? `
• Start with 2-3 sessions per week
• Focus on form and consistency over intensity
• Track every session (even 10 minutes counts!)
• Set up your environment for success
` : `
• Establish your new routine with 4-5 sessions
• Focus on progressive overload
• Track metrics and performance
• Optimize your current approach
`}

## 📅 **Week 3-4: Momentum Building**
• Increase frequency/intensity by 10-15%
• Add accountability check-ins
• Celebrate small wins
• Adjust based on what's working

## 📅 **Week 5-8: Habit Solidification**
• Make it automatic (same time, same place)
• Add variety to prevent boredom
• Plan for obstacles and setbacks
• Build your support system

## 🎯 **Daily Actions (${preferredTime}s)**
${preferredTime === 'morning' ? `
• 6:00 AM - Quick mindset prep (2 min)
• 6:30 AM - Main activity session
• 7:30 AM - Log progress and plan tomorrow
` : preferredTime === 'evening' ? `
• 6:00 PM - Transition from work mindset
• 6:30 PM - Main activity session  
• 8:00 PM - Reflect and plan tomorrow
` : `
• 12:00 PM - Quick energy boost
• 12:30 PM - Main activity session
• 1:00 PM - Log progress
`}

## 💪 **Your Success Triggers**
• Remember: "${motivation}" - this is your WHY
• Start small: 10 minutes is better than 0
• Stack habits: Link to existing routines
• Reward yourself: Celebrate every win

**Ready to start? I'll check in with you daily to keep you on track!**`;

    return {
      id: Date.now().toString(),
      role: 'assistant',
      content: planContent,
      timestamp: new Date(),
      type: 'plan',
      actionButtons: [
        { label: '✅ Start Plan', action: 'start_plan' },
        { label: '✏️ Customize Plan', action: 'customize_plan' },
        { label: '📱 Set Reminders', action: 'set_reminders' }
      ]
    };
  };

  const generateDailyCoaching = async (): Promise<Message> => {
    if (!userProfile) {
      return {
        id: Date.now().toString(),
        role: 'assistant',
        content: "Let me get to know you better first. What's your main goal right now?",
        timestamp: new Date()
      };
    }

    const { name, motivation, preferredTime } = userProfile;
    const currentHour = new Date().getHours();
    const isOptimalTime = (
      (preferredTime === 'morning' && currentHour < 12) ||
      (preferredTime === 'afternoon' && currentHour >= 12 && currentHour < 17) ||
      (preferredTime === 'evening' && currentHour >= 17)
    );

    const coachingContent = `💪 **Daily Coaching for ${name}**

${isOptimalTime ? 
  `🎯 Perfect timing! This is your optimal ${preferredTime} window.` :
  `⏰ I know ${preferredTime}s work best for you, but let's make the most of right now!`
}

## 🔥 **Today's Focus**
Remember why you started: **"${motivation}"**

That's not just words - that's your driving force. Every small action today builds toward that bigger purpose.

## ✅ **Your 3 Micro-Actions Today:**
1. **5-Minute Start** - Just begin, momentum will follow
2. **Progress Log** - Track one small win (even thinking about it counts!)
3. **Tomorrow Prep** - Set yourself up for success

## 🧠 **Mindset Shift**
Instead of "I have to..." try "I get to..."
- I GET TO work toward my goal
- I GET TO build discipline  
- I GET TO become the person I want to be

## 💡 **Quick Win Strategy**
If motivation is low: Do just 10% of your planned activity
If energy is high: Add 10% more than planned
If you're struggling: Focus on showing up, not performing

**What's your energy level right now? Let's adjust your approach accordingly!**`;

    return {
      id: Date.now().toString(),
      role: 'assistant',
      content: coachingContent,
      timestamp: new Date(),
      type: 'coaching',
      actionButtons: [
        { label: '🔥 High Energy', action: 'high_energy' },
        { label: '😐 Medium Energy', action: 'medium_energy' },
        { label: '😴 Low Energy', action: 'low_energy' }
      ]
    };
  };

  const generateProgressReview = async (): Promise<Message> => {
    const goals = userGoals;
    const totalProgress = goals.reduce((sum, goal) => sum + goal.progress, 0) / goals.length;
    
    // Advanced analytics calculations
    const highPerformers = goals.filter(goal => goal.progress > 70);
    const strugglingGoals = goals.filter(goal => goal.progress < 30);
    const totalStreaks = goals.reduce((sum, goal) => sum + (goal.currentStreak || 0), 0);
    const avgStreak = totalStreaks / goals.length;
    const completedGoals = goals.filter(goal => goal.progress >= 100);
    
    // Performance insights
    const momentumScore = totalProgress > 70 ? '🚀 Excellent' : totalProgress > 50 ? '⚡ Strong' : totalProgress > 30 ? '🌱 Building' : '💪 Starting';
    const consistencyRating = avgStreak > 7 ? 'Outstanding' : avgStreak > 3 ? 'Good' : 'Developing';
    
    const reviewContent = `📊 **Advanced Progress Analytics**

## 🎯 **Performance Dashboard**
**Overall Score: ${Math.round(totalProgress)}%** | **Momentum: ${momentumScore}**

📈 **Goal Breakdown:**
• Total Goals: ${goals.length}
• Completed: ${completedGoals.length} ✅
• High Performers: ${highPerformers.length} (${Math.round((highPerformers.length/goals.length)*100)}%)
• Need Focus: ${strugglingGoals.length}

🔥 **Consistency Metrics:**
• Average Streak: ${Math.round(avgStreak)} days
• Consistency Rating: ${consistencyRating}
• Total Active Days: ${totalStreaks}

${goals.map(goal => `
**${goal.title}**
Progress: ${goal.progress}% | Streak: ${goal.currentStreak || 0} days
Status: ${goal.status === 'on-track' ? '✅ On Track' : goal.status === 'at-risk' ? '⚠️ Needs Attention' : '🎉 Completed'}
Performance: ${goal.progress > 70 ? '🚀 Excellent' : goal.progress > 40 ? '⚡ Good' : '🌱 Growing'}
`).join('')}

## 🧠 **AI Insights:**
${totalProgress > 60 ? 
  `• Your ${userProfile?.preferredTime || 'daily'} routine is highly effective\n• Strong correlation between consistency and results\n• Ready for advanced optimization strategies` :
  totalProgress > 30 ?
  `• Building solid foundation with ${consistencyRating.toLowerCase()} consistency\n• Key patterns emerging in successful goals\n• Opportunity to scale what's working` :
  `• Early stage momentum building\n• Focus on habit formation over results\n• Small wins creating positive feedback loops`
}

## 🎯 **Strategic Recommendations:**
${totalProgress > 70 ? 
  '1. Scale successful patterns to other areas\n2. Add stretch goals for continued growth\n3. Consider mentoring others' :
  totalProgress > 40 ?
  '1. Double down on high-performing goals\n2. Simplify struggling areas\n3. Increase accountability touchpoints' :
  '1. Focus on 1-2 core goals only\n2. Build daily micro-habits\n3. Celebrate every small win'
}

## 🚀 **Next Level Actions:**
Ready to optimize your approach? I can help you:
• Analyze success patterns in detail
• Create personalized optimization strategies  
• Design advanced tracking systems
• Build momentum acceleration plans

**What area would you like to dive deeper into?**`;

    return {
      id: Date.now().toString(),
      role: 'assistant',
      content: reviewContent,
      timestamp: new Date(),
      type: 'insight',
      actionButtons: [
        { label: '📈 Deep Analytics', action: 'detailed_analytics' },
        { label: '🔧 Optimize Strategy', action: 'optimize_strategy' },
        { label: '🎯 Success Patterns', action: 'success_patterns' },
        { label: '🚀 Acceleration Plan', action: 'acceleration_plan' }
      ]
    };
  };

  const generateDetailedAnalytics = async (): Promise<Message> => {
    const goals = userGoals;
    const totalProgress = goals.reduce((sum, goal) => sum + goal.progress, 0) / goals.length;
    const totalStreaks = goals.reduce((sum, goal) => sum + (goal.currentStreak || 0), 0);
    
    // Time-based analytics
    const currentTime = new Date().getHours();
    const timeOptimization = userProfile?.preferredTime === 'morning' && currentTime < 12 ? 'Optimal' :
                           userProfile?.preferredTime === 'afternoon' && currentTime >= 12 && currentTime < 17 ? 'Optimal' :
                           userProfile?.preferredTime === 'evening' && currentTime >= 17 ? 'Optimal' : 'Sub-optimal';
    
    return {
      id: Date.now().toString(),
      role: 'assistant',
      content: `🔬 **Deep Analytics Report**

## 📊 **Performance Metrics**
• **Completion Rate:** ${Math.round(totalProgress)}%
• **Consistency Score:** ${Math.round((totalStreaks / goals.length) * 10)}/10
• **Time Optimization:** ${timeOptimization}
• **Goal Velocity:** ${totalProgress > 50 ? 'Accelerating' : 'Building'}

## 🎯 **Goal Performance Matrix**
${goals.map(goal => `
**${goal.title}**
• Progress: ${goal.progress}% (${goal.progress > 70 ? 'Excellent' : goal.progress > 40 ? 'Good' : 'Needs Focus'})
• Streak: ${goal.currentStreak || 0} days
• Momentum: ${goal.progress > goal.currentStreak * 5 ? '🚀 High' : '⚡ Steady'}
• Risk Level: ${goal.progress < 30 ? '🔴 High' : goal.progress < 60 ? '🟡 Medium' : '🟢 Low'}
`).join('')}

## 🧠 **Behavioral Insights**
• **Peak Performance Time:** ${userProfile?.preferredTime || 'Not set'}
• **Motivation Alignment:** ${totalProgress > 60 ? 'Strong' : 'Developing'}
• **Habit Formation:** ${totalStreaks > 21 ? 'Established' : 'In Progress'}

## 📈 **Trend Analysis**
• **Weekly Trajectory:** ${totalProgress > 70 ? 'Upward' : totalProgress > 40 ? 'Steady' : 'Building'}
• **Consistency Pattern:** ${totalStreaks > goals.length * 7 ? 'Highly Consistent' : 'Moderately Consistent'}
• **Success Probability:** ${totalProgress > 60 ? '85%' : totalProgress > 30 ? '70%' : '55%'}

Ready for specific optimizations based on this data?`,
      timestamp: new Date(),
      type: 'insight',
      actionButtons: [
        { label: '🎯 Goal Optimization', action: 'optimize_strategy' },
        { label: '⏰ Time Optimization', action: 'time_optimization' },
        { label: '🔄 Habit Optimization', action: 'habit_optimization' }
      ]
    };
  };

  const generateOptimizationStrategy = async (): Promise<Message> => {
    const goals = userGoals;
    const totalProgress = goals.reduce((sum, goal) => sum + goal.progress, 0) / goals.length;
    const strugglingGoals = goals.filter(goal => goal.progress < 40);
    const topGoal = goals.reduce((prev, current) => (prev.progress > current.progress) ? prev : current);
    
    return {
      id: Date.now().toString(),
      role: 'assistant',
      content: `🔧 **Strategic Optimization Plan**

## 🎯 **Priority Focus Areas**
${strugglingGoals.length > 0 ? `
**Immediate Attention Needed:**
${strugglingGoals.map(goal => `• ${goal.title} (${goal.progress}%) - Needs strategy adjustment`).join('\n')}
` : '**All goals performing well!** Ready for advanced optimization.'}

## 🚀 **Success Amplification**
**Top Performer:** ${topGoal.title} (${topGoal.progress}%)
• **What's Working:** Consistent ${userProfile?.preferredTime || 'daily'} routine
• **Scale Strategy:** Apply this approach to other goals
• **Next Level:** Increase intensity by 15%

## 🔄 **Optimization Strategies**

**For High Performers (>70%):**
• Add complexity or new challenges
• Become a mentor to others
• Set stretch goals

**For Moderate Performers (40-70%):**
• Identify and remove friction points
• Add accountability partners
• Optimize timing and environment

**For Struggling Goals (<40%):**
• Simplify to micro-habits
• Change approach completely
• Consider pausing to focus on winners

## 💡 **Personalized Recommendations**
Based on your ${userProfile?.experience || 'current'} level and "${userProfile?.motivation || 'goals'}":

1. **Double Down:** Focus 80% energy on top 2 goals
2. **Simplify:** Reduce struggling goals to 5-minute daily actions
3. **Stack:** Link new habits to existing successful routines
4. **Measure:** Track leading indicators, not just results

Ready to implement these optimizations?`,
      timestamp: new Date(),
      type: 'plan',
      actionButtons: [
        { label: '✅ Implement Plan', action: 'implement_optimization' },
        { label: '🎯 Focus Mode', action: 'focus_mode' },
        { label: '📊 Track Changes', action: 'track_optimization' }
      ]
    };
  };

  const generateSuccessPatterns = async (): Promise<Message> => {
    const goals = userGoals;
    const successfulGoals = goals.filter(goal => goal.progress > 60);
    const topGoal = goals.reduce((prev, current) => (prev.progress > current.progress) ? prev : current);
    
    return {
      id: Date.now().toString(),
      role: 'assistant',
      content: `🏆 **Your Success Pattern Analysis**

## 🎯 **What Makes You Successful**

**Your Winning Formula:**
• **Optimal Time:** ${userProfile?.preferredTime || 'Consistent timing'}
• **Motivation Driver:** "${userProfile?.motivation || 'Personal growth'}"
• **Experience Level:** ${userProfile?.experience || 'Adaptive'} approach
• **Success Rate:** ${Math.round((successfulGoals.length / goals.length) * 100)}%

## 🔥 **Top Performance Patterns**

**${topGoal.title}** - Your Star Performer (${topGoal.progress}%)
• **Why It Works:** Aligned with your core motivation
• **Key Success Factor:** Consistent ${userProfile?.preferredTime || 'daily'} execution
• **Replication Strategy:** Apply this exact approach to other goals

## 📈 **Success Indicators You Display**
✅ **Consistency Over Intensity** - You show up regularly
✅ **Progress Tracking** - You measure what matters
✅ **Motivation Clarity** - You know your "why"
✅ **Adaptive Approach** - You adjust when needed

## 🧬 **Your Success DNA**
${successfulGoals.length > 0 ? `
**Common Threads in Your Wins:**
${successfulGoals.map(goal => `• ${goal.title}: ${goal.progress}% - Strong ${goal.currentStreak || 0}-day streak`).join('\n')}

**Pattern Recognition:**
• You succeed when goals align with "${userProfile?.motivation || 'your values'}"
• ${userProfile?.preferredTime || 'Consistent timing'} works best for you
• ${userProfile?.experience || 'Your approach'} level strategies are most effective
` : `
**Early Stage Patterns:**
• You're building foundational habits
• Consistency is developing
• Success patterns are emerging
`}

## 🚀 **Replication Strategy**
1. **Clone Your Winner:** Use ${topGoal.title}'s approach for new goals
2. **Time Block:** Stick to ${userProfile?.preferredTime || 'your optimal'} windows
3. **Motivation Link:** Connect every goal to "${userProfile?.motivation || 'your core why'}"
4. **Track & Adjust:** Monitor progress weekly and adapt

**Ready to scale your success patterns?**`,
      timestamp: new Date(),
      type: 'insight',
      actionButtons: [
        { label: '🔄 Clone Success', action: 'clone_success' },
        { label: '📈 Scale Patterns', action: 'scale_patterns' },
        { label: '🎯 New Goal Design', action: 'design_goal' }
      ]
    };
  };

  const generateAccelerationPlan = async (): Promise<Message> => {
    const goals = userGoals;
    const totalProgress = goals.reduce((sum, goal) => sum + goal.progress, 0) / goals.length;
    const topGoals = goals.filter(goal => goal.progress > 50).slice(0, 2);
    
    return {
      id: Date.now().toString(),
      role: 'assistant',
      content: `🚀 **Momentum Acceleration Plan**

## ⚡ **Current Velocity Assessment**
• **Overall Momentum:** ${totalProgress > 60 ? '🚀 High Speed' : totalProgress > 30 ? '⚡ Building Speed' : '🌱 Starting Acceleration'}
• **Acceleration Potential:** ${100 - totalProgress}% room for growth
• **Ready for:** ${totalProgress > 60 ? 'Advanced strategies' : 'Momentum building'}

## 🎯 **Acceleration Targets**
${topGoals.length > 0 ? `
**Priority Accelerators:**
${topGoals.map(goal => `• ${goal.title} (${goal.progress}%) → Target: ${Math.min(goal.progress + 30, 100)}% in 30 days`).join('\n')}
` : `
**Foundation Building:**
• Focus on establishing 1-2 core habits first
• Build consistency before acceleration
`}

## 🔥 **30-Day Acceleration Protocol**

**Week 1: Momentum Ignition**
• Increase frequency by 25%
• Add accountability check-ins
• Optimize environment for success
• Track micro-wins daily

**Week 2: Velocity Building**
• Introduce progressive challenges
• Add social accountability
• Optimize timing and energy
• Celebrate milestone achievements

**Week 3: Breakthrough Phase**
• Push comfort zone boundaries
• Add advanced tracking metrics
• Implement success stacking
• Plan for obstacle navigation

**Week 4: Momentum Lock-In**
• Establish new baseline
• Plan next acceleration cycle
• Build sustainable systems
• Prepare for long-term success

## 💡 **Acceleration Multipliers**
🎯 **Focus:** Concentrate on top 2 goals only
⏰ **Timing:** Leverage your ${userProfile?.preferredTime || 'optimal'} energy windows
🤝 **Accountability:** Add external commitment devices
📊 **Measurement:** Track leading indicators daily
🔄 **Iteration:** Weekly strategy adjustments

## 🚨 **Acceleration Warnings**
• Don't sacrifice consistency for intensity
• Maintain connection to "${userProfile?.motivation || 'your why'}"
• Plan for setbacks and recovery
• Celebrate progress, not just results

**Ready to accelerate your momentum?**`,
      timestamp: new Date(),
      type: 'plan',
      actionButtons: [
        { label: '🚀 Start Acceleration', action: 'start_acceleration' },
        { label: '📋 Custom Plan', action: 'custom_acceleration' },
        { label: '⚠️ Safety Check', action: 'safety_check' }
      ]
    };
  };

  useEffect(() => {
    // Auto-scroll to bottom when new messages are added
    scrollRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const currentInput = input.trim();
    setInput('');
    setIsLoading(true);

    try {
      // Generate intelligent response based on user profile and context
      const aiResponse = await generateIntelligentResponse(currentInput);
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: aiResponse.content,
        timestamp: new Date(),
        type: aiResponse.type || 'regular',
        actionButtons: aiResponse.actionButtons
      };

      // Simulate typing delay for better UX
      setTimeout(() => {
        setMessages(prev => [...prev, assistantMessage]);
        setIsLoading(false);
      }, 1000);

    } catch (error) {
      console.log('Error sending message:', error);
      setIsLoading(false);
    }
  };

  const generateIntelligentResponse = async (userInput: string): Promise<{
    content: string;
    type?: 'plan' | 'coaching' | 'insight' | 'regular';
    actionButtons?: { label: string; action: string }[];
  }> => {
    const input = userInput.toLowerCase();
    const userName = userProfile?.name || 'friend';
    
    // Money/financial goals
    if (input.includes('money') || input.includes('$') || input.includes('financial') || input.includes('income') || input.includes('save')) {
      return {
        content: `Ah, ${userName}! Money goals - I love the ambition! 💰 

So you're thinking about financial growth? That's smart. Whether it's saving, earning more, or building wealth, the key is getting specific.

When you say "${userInput}" - what does that actually look like day-to-day? Like, are we talking about:
• Building a side hustle?
• Cutting expenses?  
• Investing consistently?
• Landing a higher-paying role?

The cool thing is, most money goals come down to either earning more or spending less (or both). And both of those are totally doable with the right plan.

What's your current situation? Are you looking to increase income or get better at saving?`,
        type: 'coaching',
        actionButtons: [
          { label: '💡 Get Advice', action: 'daily_coaching' },
          { label: '📋 Make Plan', action: 'create_plan' }
        ]
      };
    }

    // Plan/strategy requests
    if (input.includes('plan') || input.includes('strategy') || input.includes('how do i') || input.includes('help me')) {
      return {
        content: `Absolutely, ${userName}! I'm here to help you figure this out. 🎯

You asked about "${userInput}" - and honestly, that's exactly the kind of thinking that leads to real results. Most people just wish for things to change, but you're actually asking HOW to make it happen.

Here's what I'm thinking: every big goal breaks down into smaller, manageable pieces. The magic happens when we get specific about what you actually need to DO.

So let's dig in - what's the main thing you want to achieve here? And what's making it feel challenging right now?

I've got some ideas brewing, but I want to make sure I'm giving you advice that actually fits your situation.`,
        type: 'plan',
        actionButtons: [
          { label: '📋 Create Plan', action: 'create_plan' },
          { label: '💪 Daily Coaching', action: 'daily_coaching' }
        ]
      };
    }
    
    // Motivation/struggling
    if (input.includes('motivat') || input.includes('stuck') || input.includes('hard') || input.includes('difficult') || input.includes('struggling')) {
      return {
        content: `Hey ${userName}, I hear you. 💙

You know what? The fact that you're here talking about this stuff means you haven't given up. That's actually huge.

"${userInput}" - I get it. Sometimes the gap between where we are and where we want to be feels massive, right? But here's something I've learned: feeling stuck isn't a sign you're failing. It's usually a sign you're ready for the next level.

Think about it - you wouldn't feel frustrated if you didn't care. That frustration? That's your inner drive telling you that you're meant for more.

What's one tiny thing that used to feel impossible but now feels normal to you? I bet there's something. That's proof you can grow through challenges.

What's really at the heart of what's feeling hard right now?`,
        type: 'coaching',
        actionButtons: [
          { label: '💪 Boost Energy', action: 'daily_coaching' },
          { label: '🎯 Refocus', action: 'create_plan' }
        ]
      };
    }
    
    // Progress/tracking
    if (input.includes('progress') || input.includes('doing') || input.includes('track') || input.includes('how am i')) {
      return {
        content: `Great question, ${userName}! 📈

You're asking about progress - that's actually a really good sign. It means you're thinking like someone who gets results.

From what I can see, you've got ${userGoals.length} goals you're working on, and honestly? Just the fact that you're tracking and checking in puts you ahead of most people.

But let's get real about it - how do YOU feel about your progress? Sometimes the numbers don't tell the whole story. Are you feeling momentum? Are you seeing changes in your daily habits?

Progress isn't always linear. Sometimes it's two steps forward, one step back. Sometimes it's building foundation that doesn't show up in metrics yet.

What feels like it's working well for you right now? And what feels like it needs a tweak?`,
        type: 'insight',
        actionButtons: [
          { label: '📊 Full Review', action: 'review_progress' },
          { label: '🎉 Celebrate Wins', action: 'daily_coaching' }
        ]
      };
    }

    // Greetings and casual conversation
    if (input.includes('hi') || input.includes('hello') || input.includes('hey') || input.includes('what\'s up') || input.includes('how are you')) {
      return {
        content: `Hey ${userName}! 👋 

I'm doing great - always excited to help someone work toward their goals! How are YOU doing?

I was just thinking about your journey with "${userProfile?.primaryGoal || 'your goals'}" - how's that been going lately? 

You know what I love about our conversations? You actually show up and do the work. That's not as common as you might think.

What's on your mind today? Feeling motivated? Need some strategy? Or just want to chat about where you're at?`,
        type: 'regular',
        actionButtons: [
          { label: '💡 Get Advice', action: 'daily_coaching' },
          { label: '📋 Make Plan', action: 'create_plan' }
        ]
      };
    }
    
    // Default conversational response
    return {
      content: generateNaturalResponse(userInput),
      type: 'regular' as const,
      actionButtons: [
        { label: '💡 Get Advice', action: 'daily_coaching' },
        { label: '📋 Make Plan', action: 'create_plan' }
      ]
    };
  };

  const generateContextualPlan = async (userInput: string): Promise<string> => {
    if (!userProfile) return "Let me learn about your goals first. What would you like to achieve?";
    
    return `Based on your question about "${userInput}", here's a targeted approach:

🎯 **Immediate Actions (Next 24 hours):**
• Identify the specific challenge you're facing
• Break it down into 3 smaller steps
• Choose the easiest step to start with

📅 **This Week's Strategy:**
• Focus on consistency over perfection
• Track your progress daily
• Adjust based on what you learn

💪 **Long-term Success:**
• Remember your motivation: "${userProfile.motivation}"
• Build systems, not just goals
• Celebrate small wins along the way

What specific part would you like me to elaborate on?`;
  };

  const generateMotivationalResponse = (userInput: string): string => {
    if (!userProfile) return "I believe in you! What's your biggest challenge right now?";
    
    return `${userProfile.name}, I hear you. Feeling stuck is part of the journey, not a sign of failure.

🔥 **Remember Your Why:**
"${userProfile.motivation}" - This is bigger than today's struggle.

💪 **Truth Bomb:**
Every person who achieved something meaningful felt exactly like you do right now. The difference? They kept going anyway.

🎯 **Right Now Action:**
1. Take 3 deep breaths
2. Do ONE tiny thing toward your goal (even 1 minute counts)
3. Text someone who believes in you

You've got this. I believe in you. Your future self is counting on today's version of you to not give up.

What's one small thing you can do right now?`;
  };

  const generateProgressResponse = (userInput: string): string => {
    const totalGoals = userGoals.length;
    const avgProgress = userGoals.reduce((sum, goal) => sum + goal.progress, 0) / totalGoals;
    
    return `Looking at your progress, here's what I see:

📈 **The Numbers:**
• ${totalGoals} active goals
• ${Math.round(avgProgress)}% average progress
• Consistent tracking (that's huge!)

🎉 **What's Amazing:**
You're actually DOING the work. Most people just think about it.

🎯 **What's Next:**
Your momentum is building. Now let's optimize:
• Double down on what's working
• Adjust what isn't
• Add one small improvement

Progress isn't always linear. You're exactly where you need to be.

What feels like your biggest win lately?`;
  };

  const generateNaturalResponse = (userInput: string): string => {
    const userName = userProfile?.name || 'friend';
    const userGoal = userProfile?.primaryGoal || 'your goals';
    const userMotivation = userProfile?.motivation || 'your bigger purpose';
    
    const responses = [
      `Interesting, ${userName}! You mentioned "${userInput}" - that actually connects to something important about ${userGoal}. What's your take on that?`,
      
      `I hear you on that, ${userName}. When you think about "${userInput}", how does that relate to what you're trying to achieve overall?`,
      
      `That's a thoughtful point! You know, "${userInput}" makes me think about your motivation - "${userMotivation}". Do you see a connection there?`,
      
      `${userName}, that's exactly the kind of thinking that leads to breakthroughs! When you say "${userInput}", what comes up for you? What feels most important about that?`,
      
      `I love that you brought up "${userInput}" - it shows you're really thinking deeply about this stuff. What would it look like if you took that idea and ran with it?`,
      
      `You know what, ${userName}? "${userInput}" is actually pretty insightful. Most people don't think about it that way. How do you think that perspective could help you with ${userGoal}?`,
      
      `That's real talk, ${userName}. "${userInput}" - I can tell you're processing some important stuff here. What feels like the next step for you?`,
      
      `Hmm, "${userInput}" - that's got me thinking too! You know what's cool? You're asking the right questions. That's honestly half the battle. What's your gut telling you about this?`,
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  };

  const generateContextualResponse = (userInput: string): string => {
    const responses = [
      `That's a great insight! Based on your goal of "${userProfile?.primaryGoal || 'personal growth'}", how can we build on that?`,
      `I appreciate you sharing that. What would success look like for you in this situation?`,
      `That sounds challenging. What's one small step you could take today to move forward?`,
      `I can hear the determination in your words. What support do you need to achieve this?`,
      `That's an interesting perspective. How does this align with your motivation: "${userProfile?.motivation || 'your bigger purpose'}"?`,
      `Thank you for being so reflective. What patterns do you notice in your thinking here?`,
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  };

  const renderMessage = (message: Message) => (
    <View
      key={message.id}
      style={[
        styles.messageContainer,
        message.role === 'user' ? styles.userMessage : styles.aiMessage
      ]}
    >
      <Text
        style={[
          styles.messageText,
          message.role === 'user' ? styles.userMessageText : styles.aiMessageText
        ]}
      >
        {message.content}
      </Text>
      
      {message.actionButtons && (
        <View style={styles.actionButtonsContainer}>
          {message.actionButtons.map((button, index) => (
            <TouchableOpacity
              key={index}
              style={styles.actionButton}
              onPress={() => handleActionButton(button.action)}
            >
              <Text style={styles.actionButtonText}>{button.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
      
      <Text style={styles.messageTime}>
        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>AI Coach</Text>
        <View style={styles.placeholder} />
      </View>

      <KeyboardAvoidingView 
        style={styles.chatContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          ref={scrollRef}
          style={styles.messagesContainer}
          contentContainerStyle={styles.messagesContent}
          showsVerticalScrollIndicator={false}
        >
          {messages.map(renderMessage)}
          {isLoading && (
            <View style={[styles.messageContainer, styles.aiMessage]}>
              <Text style={styles.typingIndicator}>AI is thinking...</Text>
            </View>
          )}
        </ScrollView>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.textInput}
            value={input}
            onChangeText={setInput}
            placeholder="Ask for coaching, plans, or motivation..."
            multiline
            maxLength={500}
            onSubmitEditing={sendMessage}
            blurOnSubmit={false}
          />
          <TouchableOpacity
            style={[styles.sendButton, (!input.trim() || isLoading) && styles.sendButtonDisabled]}
            onPress={sendMessage}
            disabled={!input.trim() || isLoading}
          >
            <Text style={styles.sendButtonText}>Send</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    fontSize: 16,
    color: '#4F46E5',
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
  },
  placeholder: {
    width: 50,
  },
  chatContainer: {
    flex: 1,
  },
  messagesContainer: {
    flex: 1,
    padding: 16,
  },
  messagesContent: {
    paddingBottom: 20,
  },
  messageContainer: {
    marginBottom: 16,
    maxWidth: '85%',
  },
  userMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#4F46E5',
    borderRadius: 18,
    borderBottomRightRadius: 4,
    padding: 12,
  },
  aiMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#fff',
    borderRadius: 18,
    borderBottomLeftRadius: 4,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  userMessageText: {
    color: '#fff',
  },
  aiMessageText: {
    color: '#1F2937',
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 12,
    gap: 8,
  },
  actionButton: {
    backgroundColor: '#4F46E5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  messageTime: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
    textAlign: 'right',
  },
  typingIndicator: {
    fontSize: 14,
    color: '#6B7280',
    fontStyle: 'italic',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginRight: 12,
    maxHeight: 100,
    fontSize: 16,
  },
  sendButton: {
    backgroundColor: '#4F46E5',
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  sendButtonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  sendButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
}); 