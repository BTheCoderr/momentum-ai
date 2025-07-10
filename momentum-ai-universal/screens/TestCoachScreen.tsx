import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Animated,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../components/ThemeProvider';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');

interface CoachPersona {
  id: string;
  name: string;
  emoji: string;
  description: string;
  tone: string;
  style: string;
}

interface TestMessage {
  id: string;
  text: string;
  sender: 'user' | 'coach';
  timestamp: Date;
}

interface QuickTest {
  id: string;
  prompt: string;
  icon: string;
  category: string;
}

export const TestCoachScreen = () => {
  const navigation = useNavigation();
  const { theme } = useTheme();
  const [currentCoach, setCurrentCoach] = useState<CoachPersona | null>(null);
  const [messages, setMessages] = useState<TestMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [selectedTest, setSelectedTest] = useState<string | null>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    loadCoachPersonality();
    
    // Smooth entrance animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const loadCoachPersonality = async () => {
    try {
      const savedPersonality = await AsyncStorage.getItem('coachPersonality');
      if (savedPersonality) {
        const personality = JSON.parse(savedPersonality);
        setCurrentCoach({
          id: personality.selectedStyle || 'encouraging',
          name: getCoachName(personality.selectedStyle || 'encouraging'),
          emoji: getCoachEmoji(personality.selectedStyle || 'encouraging'),
          description: getCoachDescription(personality.selectedStyle || 'encouraging'),
          tone: personality.selectedStyle || 'encouraging',
          style: `${personality.formality}% formal, ${personality.directness}% direct, ${personality.enthusiasm}% enthusiastic`,
        });
      } else {
        // Default coach
        setCurrentCoach({
          id: 'encouraging',
          name: 'Alex',
          emoji: '🤗',
          description: 'Supportive and encouraging',
          tone: 'encouraging',
          style: '50% formal, 30% direct, 80% enthusiastic',
        });
      }
    } catch (error) {
      console.error('Error loading coach personality:', error);
    }
  };

  const getCoachName = (style: string): string => {
    const names = {
      encouraging: 'Alex',
      strict: 'Max',
      motivational: 'Nova',
      analytical: 'Sage',
      friendly: 'Robin',
      'wise-mentor': 'Zen'
    };
    return names[style as keyof typeof names] || 'Alex';
  };

  const getCoachEmoji = (style: string): string => {
    const emojis = {
      encouraging: '🤗',
      strict: '💪',
      motivational: '🔥',
      analytical: '🧠',
      friendly: '😊',
      'wise-mentor': '🧘'
    };
    return emojis[style as keyof typeof emojis] || '🤗';
  };

  const getCoachDescription = (style: string): string => {
    const descriptions = {
      encouraging: 'Supportive and encouraging',
      strict: 'Direct and disciplined',
      motivational: 'High-energy motivator',
      analytical: 'Data-driven strategist',
      friendly: 'Warm and approachable',
      'wise-mentor': 'Thoughtful and wise'
    };
    return descriptions[style as keyof typeof descriptions] || 'Supportive and encouraging';
  };

  const quickTests: QuickTest[] = [
    {
      id: 'motivation',
      prompt: "I'm feeling unmotivated today. Help me get started.",
      icon: '🚀',
      category: 'Motivation'
    },
    {
      id: 'goal-stuck',
      prompt: "I'm stuck on one of my goals and don't know what to do next.",
      icon: '🎯',
      category: 'Goal Setting'
    },
    {
      id: 'stress',
      prompt: "I'm feeling overwhelmed with everything I need to do.",
      icon: '😰',
      category: 'Stress'
    },
    {
      id: 'celebration',
      prompt: "I just completed a major milestone! Let's celebrate!",
      icon: '🎉',
      category: 'Achievement'
    },
    {
      id: 'feedback',
      prompt: "Can you give me feedback on my progress this week?",
      icon: '📊',
      category: 'Feedback'
    },
    {
      id: 'planning',
      prompt: "Help me plan out my day to be more productive.",
      icon: '📅',
      category: 'Planning'
    }
  ];

  const generateCoachResponse = (prompt: string, coach: CoachPersona): string => {
    const responses = {
      encouraging: {
        motivation: "I hear you, and it's completely okay to feel this way sometimes! 🤗 You know what? Even small steps count. What's one tiny thing you could do right now - maybe just for 5 minutes? Remember, you've overcome challenges before, and I believe in you! ✨",
        'goal-stuck': "It sounds like you're at a crossroads, and that's actually a sign that you're thinking deeply about your path! 💙 Let's break this down together. What part of your goal feels most manageable right now? Sometimes the next step becomes clearer when we focus on just one small piece.",
        stress: "Take a deep breath with me for a moment... 🌸 You're feeling overwhelmed because you care deeply about doing well, and that shows your dedication. Let's prioritize together - what's the one most important thing that needs your attention today?",
        celebration: "YES! I'm so proud of you! 🎉✨ This is huge! Tell me more about what this milestone means to you. How does it feel to have accomplished this? You've earned every bit of this celebration!",
        feedback: "I'm so glad you asked! Your commitment to growth is inspiring. 💫 From what I can see, you're making steady progress. What feels like your biggest win this week? And is there one area where you'd like to focus more energy?",
        planning: "I love that you're being proactive about your day! 🌟 Let's create a plan that feels both productive and sustainable. What are your top 3 priorities today? And how are your energy levels typically throughout the day?"
      },
      strict: {
        motivation: "Listen, motivation comes and goes, but discipline is what creates results. 💪 Stop waiting to 'feel' motivated. Pick one task - right now - and do it for 15 minutes. No excuses. Your future self will thank you.",
        'goal-stuck': "Being stuck means you're not taking action. Period. 🎯 Break your goal down into smaller, specific tasks. What's the very next action you need to take? Stop overthinking and start doing. Clarity comes through action, not thinking.",
        stress: "Overwhelm is a choice. You're trying to do everything at once instead of focusing. ⚡ Write down everything, pick the top 3 priorities, and ignore the rest for today. Stop making your life harder than it needs to be.",
        celebration: "Good work, but don't get comfortable. 💪 What you've accomplished is proof that you're capable of more. What's the next milestone? Keep pushing forward - success is a habit, not a destination.",
        feedback: "Here's the truth: you're making progress, but you could be doing better. 📈 You're still leaving potential on the table. What are you avoiding? Address your weak points instead of just celebrating the easy wins.",
        planning: "Planning without execution is just wishful thinking. ⏰ Pick your top 3 tasks for today. Schedule them with specific times. No distractions, no multitasking. Focus and execute."
      },
      motivational: {
        motivation: "LET'S GO! 🔥 Every champion has days like this - it's what separates the winners from the wannabes! You've got GREATNESS inside you! Pick ONE thing right now and CRUSH it! Momentum builds momentum - start moving! 🚀",
        'goal-stuck': "This is where LEGENDS are made! 💥 When you're stuck, it means you're on the edge of a BREAKTHROUGH! What if the next action you take is the one that changes everything? Let's find that next step and ATTACK it with everything you've got! 🎯",
        stress: "You know what? This pressure is SHAPING you into something stronger! 💎 Champions thrive under pressure! Take that overwhelm and turn it into FUEL! What's the ONE thing that will move the needle most? Let's DOMINATE that first! 🏆",
        celebration: "YESSSS! 🎉🔥 I KNEW you had it in you! This is just the beginning! You've proven you can do ANYTHING! What mountain are we climbing next?! Your success story is just getting started! Keep this ENERGY going! ⚡",
        feedback: "You're absolutely CRUSHING it! 🌟 I can see the FIRE in your commitment! You're not just making progress - you're building UNSTOPPABLE momentum! What would make this week even MORE amazing? Let's push the limits! 🚀",
        planning: "Time to architect an EPIC day! 💪 You're not just planning - you're designing your SUCCESS! What would make today LEGENDARY? Let's build a schedule that gets you EXCITED to wake up! Champions plan like their life depends on it! 🏆"
      },
      analytical: {
        motivation: "Motivation is an emotional state with natural fluctuations. 📊 Research shows that breaking tasks into 15-minute segments increases completion rates by 80%. What's your most important outcome today? Let's create a systematic approach to achieving it.",
        'goal-stuck': "Obstacles indicate a need for strategic recalibration. 🧠 Let's analyze the data: What specific factors are creating this bottleneck? What resources do you have available? Often, the solution becomes clear through systematic problem decomposition.",
        stress: "Overwhelm typically stems from cognitive overload and unclear prioritization. 📈 Studies show that writing down tasks reduces mental burden by 40%. What's your current task-to-capacity ratio? Let's optimize your workflow for better efficiency.",
        celebration: "Excellent milestone achievement! 📊 This data point indicates strong execution capability. What patterns led to this success? Understanding your performance drivers will help replicate these results for future goals.",
        feedback: "Based on available performance metrics, I observe consistent progress trends. 📈 Your completion rate shows steady improvement. For optimization, consider: which strategies yielded the highest ROI this week? Let's identify patterns for scaling success.",
        planning: "Effective planning requires time-blocking based on your energy patterns and task complexity. ⏱️ What's your peak performance window? Let's structure your day around your biological productivity rhythms for maximum efficiency."
      },
      friendly: {
        motivation: "Hey there! 😊 We all have those days - you're definitely not alone in this! How about we start super small? Maybe just organize your desk or make a cup of tea? Sometimes the tiniest actions can shift our whole energy. What sounds doable right now? 🌈",
        'goal-stuck': "Oh, I totally get that feeling! 🤝 It's like being at a crossroads, right? Let's chat about it - sometimes talking it through helps so much! What part of your goal has been going well? Maybe we can build from there! 💝",
        stress: "Aw, that sounds really tough! 🫂 You're dealing with a lot right now. Want to just take a moment to breathe together? What if we picked just one thing to focus on today? You don't have to tackle everything at once, friend! 🌸",
        celebration: "OMG, that's AMAZING! 🎉😄 I'm literally so happy for you right now! Tell me everything - how are you feeling? What was the best part of reaching this milestone? This calls for a proper celebration! What are you gonna do to treat yourself? ✨",
        feedback: "Aww, I love that you're checking in! 🥰 You've been doing such great work! I've noticed you're really consistent with your efforts, and that's so admirable! What's been feeling good for you this week? And hey, what would make next week even better? 💫",
        planning: "Ooh, I love a good planning session! 📝✨ What kind of day are you hoping to create? Something productive but also enjoyable? Let's make sure we build in some fun too! What are you most excited about getting done today? 🌟"
      },
      'wise-mentor': {
        motivation: "Pause for a moment, dear one. 🧘 What you're experiencing is the natural ebb and flow of energy. Like seasons, our motivation has cycles. What is your body telling you right now? Sometimes rest is the most productive choice. What feels true for you in this moment? 🍃",
        'goal-stuck': "Being stuck is often wisdom in disguise. 🌱 Your intuition may be guiding you to pause and reflect. What if this pause is exactly what you need? Sit quietly with your goal - what arises? Sometimes the path reveals itself when we stop forcing. 🌸",
        stress: "Breathe deeply and come back to this moment. 🌊 Overwhelm lives in the future, but peace lives in the present. What is actually happening right now? What can you control in this very moment? Let go of what isn't yours to carry. 🕊️",
        celebration: "How wonderful to witness your growth. 🌺 Take time to truly feel this accomplishment in your body. What wisdom did you gain on this journey? How have you changed? Honor both the destination and the path that brought you here. 🙏",
        feedback: "Your journey shows beautiful unfolding. 🌿 Growth isn't always linear - it spirals upward like a plant reaching for light. What insights have you gained about yourself? What patterns do you notice in your own rhythm? Trust your inner wisdom. ✨",
        planning: "Today is a gift, hence the name 'present.' 🎁 Rather than forcing productivity, what if you moved in harmony with your natural energy? What would feel nourishing today? Plan from a place of self-compassion, not self-pressure. 🌙"
      }
    };

    const coachResponses = responses[coach.tone as keyof typeof responses] || responses.encouraging;
    return coachResponses[prompt as keyof typeof coachResponses] || "I'm here to support you in whatever way feels most helpful. What would you like to explore together?";
  };

  const runQuickTest = async (test: QuickTest) => {
    if (!currentCoach) return;

    setSelectedTest(test.id);
    setMessages([]);
    
    // Add user message
    const userMessage: TestMessage = {
      id: '1',
      text: test.prompt,
      sender: 'user',
      timestamp: new Date()
    };
    
    setMessages([userMessage]);
    setIsTyping(true);

    // Simulate typing delay
    setTimeout(() => {
      const coachResponse = generateCoachResponse(test.id, currentCoach);
      const coachMessage: TestMessage = {
        id: '2',
        text: coachResponse,
        sender: 'coach',
        timestamp: new Date()
      };
      
      setMessages([userMessage, coachMessage]);
      setIsTyping(false);
    }, 2000);
  };

  const resetTest = () => {
    setMessages([]);
    setSelectedTest(null);
    setIsTyping(false);
  };

  if (!currentCoach) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={[styles.loadingText, { color: theme.colors.text }]}>
            Loading your coach...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <LinearGradient
        colors={[theme.colors.primary, theme.colors.secondary]}
        style={styles.header}
      >
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        
        <Animated.View style={[styles.headerContent, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          <Text style={styles.headerTitle}>Test Your Coach</Text>
          <Text style={styles.headerSubtitle}>Preview how your AI coach will respond</Text>
        </Animated.View>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Coach Profile Card */}
        <Animated.View style={[styles.coachCard, { backgroundColor: theme.colors.surface, shadowColor: theme.colors.shadow, opacity: fadeAnim }]}>
          <View style={styles.coachHeader}>
            <View style={styles.coachAvatarContainer}>
              <Text style={styles.coachEmoji}>{currentCoach.emoji}</Text>
            </View>
            <View style={styles.coachInfo}>
              <Text style={[styles.coachName, { color: theme.colors.text }]}>{currentCoach.name}</Text>
              <Text style={[styles.coachDescription, { color: theme.colors.textSecondary }]}>{currentCoach.description}</Text>
              <Text style={[styles.coachStyle, { color: theme.colors.textSecondary }]}>{currentCoach.style}</Text>
            </View>
            <TouchableOpacity 
              style={[styles.editButton, { backgroundColor: theme.colors.primary }]}
              onPress={() => navigation.navigate('CoachPersonality' as never)}
            >
              <Text style={styles.editButtonText}>Edit</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* Quick Tests */}
        <Animated.View style={[{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Quick Tests</Text>
          <Text style={[styles.sectionSubtitle, { color: theme.colors.textSecondary }]}>
            Try these scenarios to see how your coach responds
          </Text>
          
          <View style={styles.testsGrid}>
            {quickTests.map((test, index) => (
              <TouchableOpacity
                key={test.id}
                style={[
                  styles.testCard,
                  { backgroundColor: theme.colors.surface, shadowColor: theme.colors.shadow },
                  selectedTest === test.id && { backgroundColor: theme.colors.primary }
                ]}
                onPress={() => runQuickTest(test)}
                disabled={isTyping}
              >
                <Text style={styles.testIcon}>{test.icon}</Text>
                <Text style={[
                  styles.testCategory, 
                  { color: selectedTest === test.id ? 'rgba(255,255,255,0.8)' : theme.colors.textSecondary }
                ]}>
                  {test.category}
                </Text>
                <Text style={[
                  styles.testPrompt, 
                  { color: selectedTest === test.id ? '#FFFFFF' : theme.colors.text }
                ]} numberOfLines={3}>
                  {test.prompt}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </Animated.View>

        {/* Conversation Preview */}
        {(messages.length > 0 || isTyping) && (
          <Animated.View style={[styles.conversationSection, { opacity: fadeAnim }]}>
            <View style={styles.conversationHeader}>
              <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Preview Conversation</Text>
              <TouchableOpacity onPress={resetTest} style={[styles.resetButton, { backgroundColor: theme.colors.border }]}>
                <Text style={[styles.resetButtonText, { color: theme.colors.text }]}>Reset</Text>
              </TouchableOpacity>
            </View>
            
            <View style={[styles.conversationContainer, { backgroundColor: theme.colors.surface }]}>
              {messages.map((message) => (
                <View
                  key={message.id}
                  style={[
                    styles.messageBubble,
                    message.sender === 'user' ? styles.userMessage : styles.coachMessage,
                    message.sender === 'user' 
                      ? { backgroundColor: theme.colors.secondary }
                      : { backgroundColor: theme.colors.primary }
                  ]}
                >
                  <Text style={styles.messageText}>{message.text}</Text>
                </View>
              ))}
              
              {isTyping && (
                <View style={[styles.typingIndicator, { backgroundColor: theme.colors.primary }]}>
                  <Text style={styles.typingText}>{currentCoach.name} is typing...</Text>
                  <View style={styles.typingDots}>
                    <View style={styles.dot} />
                    <View style={styles.dot} />
                    <View style={styles.dot} />
                  </View>
                </View>
              )}
            </View>
          </Animated.View>
        )}

        {/* Start Full Conversation Button */}
        {messages.length > 0 && !isTyping && (
          <Animated.View style={[styles.actionSection, { opacity: fadeAnim }]}>
            <TouchableOpacity
              style={[styles.startChatButton, { backgroundColor: theme.colors.primary }]}
              onPress={() => navigation.navigate('AICoach' as never)}
            >
              <Text style={styles.startChatButtonText}>💬 Start Full Conversation</Text>
            </TouchableOpacity>
          </Animated.View>
        )}

        <View style={styles.bottomPadding} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 8,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  backButton: {
    marginBottom: 16,
  },
  backButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
  headerContent: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  coachCard: {
    borderRadius: 20,
    padding: 20,
    marginTop: 20,
    marginBottom: 32,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  coachHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  coachAvatarContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 107, 53, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  coachEmoji: {
    fontSize: 28,
  },
  coachInfo: {
    flex: 1,
  },
  coachName: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  coachDescription: {
    fontSize: 16,
    marginBottom: 2,
  },
  coachStyle: {
    fontSize: 14,
    fontStyle: 'italic',
  },
  editButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
  },
  editButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 16,
    marginBottom: 20,
    lineHeight: 22,
  },
  testsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 32,
  },
  testCard: {
    width: (width - 64) / 2,
    borderRadius: 16,
    padding: 16,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  testIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  testCategory: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  testPrompt: {
    fontSize: 14,
    lineHeight: 18,
  },
  conversationSection: {
    marginBottom: 32,
  },
  conversationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  resetButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  resetButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  conversationContainer: {
    borderRadius: 16,
    padding: 16,
    minHeight: 120,
  },
  messageBubble: {
    maxWidth: '85%',
    padding: 12,
    borderRadius: 16,
    marginVertical: 4,
  },
  userMessage: {
    alignSelf: 'flex-end',
    borderBottomRightRadius: 4,
  },
  coachMessage: {
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 4,
  },
  messageText: {
    color: '#FFFFFF',
    fontSize: 15,
    lineHeight: 20,
  },
  typingIndicator: {
    alignSelf: 'flex-start',
    borderRadius: 16,
    borderBottomLeftRadius: 4,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
  },
  typingText: {
    color: '#FFFFFF',
    fontSize: 14,
    marginRight: 8,
  },
  typingDots: {
    flexDirection: 'row',
    gap: 3,
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#FFFFFF',
    opacity: 0.7,
  },
  actionSection: {
    marginBottom: 32,
  },
  startChatButton: {
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
  },
  startChatButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  bottomPadding: {
    height: 40,
  },
});

export default TestCoachScreen; 