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
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { RootTabParamList } from '../navigation';
import api from '../api/axios';
import { goalsAPI, userAPI } from '../api/services';

type ChatScreenNavigationProp = NativeStackNavigationProp<RootTabParamList, 'Chat'>;
type ChatScreenRouteProp = RouteProp<RootTabParamList, 'Chat'>;

interface Props {
  navigation: ChatScreenNavigationProp;
  route: ChatScreenRouteProp;
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

export default function ChatScreen({ navigation, route }: Props) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [userGoals, setUserGoals] = useState<any[]>([]);
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    initializeChat();
  }, [route.params?.initialPrompt]);

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

      // If there's an initial prompt, handle it
      if (route.params?.initialPrompt) {
        handleInitialPrompt(route.params.initialPrompt, profile, goals);
      }
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
    
    const reviewContent = `📊 **Your Progress Review**

## 🎯 **Overall Performance: ${Math.round(totalProgress)}%**

${goals.map(goal => `
**${goal.title}**
Progress: ${goal.progress}% | Streak: ${goal.currentStreak} days
Status: ${goal.status === 'on-track' ? '✅ On Track' : goal.status === 'at-risk' ? '⚠️ Needs Attention' : '🎉 Completed'}
`).join('')}

## 💪 **What's Working Well:**
• You're showing up consistently
• Your streak building is impressive
• You're tracking progress regularly

## 🎯 **Areas for Growth:**
• Focus on the goal that needs most attention
• Consider adjusting strategies for better results
• Celebrate your wins more often!

## 🚀 **Next Week's Focus:**
Based on your patterns, I recommend:
1. Double down on what's working
2. Adjust struggling areas with new approach
3. Add one small habit to boost momentum

**Ready to level up? Let's create your next action plan!**`;

    return {
      id: Date.now().toString(),
      role: 'assistant',
      content: reviewContent,
      timestamp: new Date(),
      type: 'insight',
      actionButtons: [
        { label: '📈 Optimize Plan', action: 'optimize_plan' },
        { label: '🎯 Focus Mode', action: 'focus_mode' },
        { label: '🎉 Celebrate Wins', action: 'celebrate' }
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
    
    // Detect intent and provide contextual coaching
    if (input.includes('plan') || input.includes('strategy') || input.includes('how')) {
      return {
        content: await generateContextualPlan(userInput),
        type: 'plan',
        actionButtons: [
          { label: '📋 Detailed Plan', action: 'create_plan' },
          { label: '🎯 Quick Actions', action: 'quick_actions' }
        ]
      };
    }
    
    if (input.includes('motivat') || input.includes('stuck') || input.includes('hard')) {
      return {
        content: generateMotivationalResponse(userInput),
        type: 'coaching',
        actionButtons: [
          { label: '💪 Boost Energy', action: 'daily_coaching' },
          { label: '🎯 Refocus', action: 'refocus' }
        ]
      };
    }
    
    if (input.includes('progress') || input.includes('doing') || input.includes('track')) {
      return {
        content: generateProgressResponse(userInput),
        type: 'insight',
        actionButtons: [
          { label: '📊 Full Review', action: 'review_progress' },
          { label: '🎉 Celebrate', action: 'celebrate' }
        ]
      };
    }
    
         // Default intelligent response
     return {
       content: generateContextualResponse(userInput),
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