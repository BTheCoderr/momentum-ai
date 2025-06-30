import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  FlatList,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { messageServices, aiServices } from '../lib/services';
import { Message } from '../lib/supabase';
import { useTheme } from '../components/ThemeProvider';

interface CoachPersona {
  id: string;
  name: string;
  emoji: string;
  description: string;
  tone: string;
  systemPrompt: string;
}

const AICoachScreen = ({ navigation }: any) => {
  const { theme } = useTheme();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedCoach, setSelectedCoach] = useState<CoachPersona>({
    id: 'supportive',
    name: 'Alex (Supportive)',
    emoji: '🤗',
    description: 'Empathetic AI coach focused on emotional support',
    tone: 'supportive',
    systemPrompt: 'You are a supportive, warm AI coach. Be encouraging and understanding.'
  });
  const [showCoachSelector, setShowCoachSelector] = useState(false);
  const scrollViewRef = useRef<FlatList<Message>>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    loadChatHistory();
  }, []);

  const loadChatHistory = async () => {
    try {
      setLoading(true);
      // Load existing conversation
      const history = await messageServices.getAll();
      setMessages(history);
    } catch (error) {
      console.error('Error loading chat history:', error);
    } finally {
      setLoading(false);
    }
  };

  const coachPersonas: CoachPersona[] = [
    {
      id: 'supportive',
      name: 'Alex (Supportive)',
      emoji: '🤗',
      description: 'Empathetic AI coach focused on emotional support',
      tone: 'supportive',
      systemPrompt: 'You are a supportive, warm AI coach. Be encouraging and understanding. Focus on emotional support and gentle guidance.'
    },
    {
      id: 'motivational',
      name: 'Max (Motivational)',
      emoji: '💪',
      description: 'High-energy AI coach that drives results',
      tone: 'motivational',
      systemPrompt: 'You are a high-energy, motivational AI coach. Push users to achieve their goals with enthusiasm and determination.'
    },
    {
      id: 'analytical',
      name: 'Nova (Analytical)',
      emoji: '🧠',
      description: 'Data-driven AI coach for strategic insights',
      tone: 'analytical',
      systemPrompt: 'You are an analytical, strategic AI coach. Focus on data, patterns, and logical approaches to problem-solving.'
    },
    {
      id: 'mindful',
      name: 'Zen (Mindful)',
      emoji: '🧘',
      description: 'Mindfulness-focused AI coach for inner wisdom',
      tone: 'mindful',
      systemPrompt: 'You are a mindful, calm AI coach. Focus on reflection, mindfulness, and inner wisdom. Speak slowly and thoughtfully.'
    },
    {
      id: 'practical',
      name: 'Swift (Practical)',
      emoji: '🎯',
      description: 'No-nonsense AI coach for actionable solutions',
      tone: 'practical',
      systemPrompt: 'You are a practical, no-nonsense AI coach. Give direct, actionable advice. Be efficient and solution-focused.'
    }
  ];

  const sendMessage = async (text: string) => {
    if (!text.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: text,
      sender: 'user',
      type: 'text',
      timestamp: new Date().toISOString(),
      user_id: 'demo-user',
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsTyping(true);

    try {
      // Get AI response using messageServices.sendMessage
      const aiResponse = await messageServices.sendMessage(text);

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: aiResponse,
        sender: 'ai',
        type: 'text',
        timestamp: new Date().toISOString(),
        user_id: 'demo-user',
      };

      setMessages(prev => [...prev, aiMessage]);

    } catch (error) {
      console.error('Error sending message:', error);
      
      // Add fallback AI response
      const fallbackMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: "I'm having trouble connecting right now, but I'm still here for you! What's on your mind?",
        sender: 'ai',
        type: 'text',
        timestamp: new Date().toISOString(),
        user_id: 'demo-user',
      };
      
      setMessages(prev => [...prev, fallbackMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const generateAIResponse = (userInput: string, coach: CoachPersona): string => {
    // This is a simple response generator - in production, you'd call your AI API
    const responses = {
      supportive: [
        "I hear you, and I want you to know that what you're feeling is completely valid. 🤗",
        "You're being so brave by sharing this with me. Let's work through this together.",
        "Remember, progress isn't always linear. You're doing better than you think! 💙"
      ],
      motivational: [
        "Let's GO! You've got this! 💪 What's the first step you can take right now?",
        "Champions aren't made in comfort zones! Time to push through! 🔥",
        "Every expert was once a beginner. Keep pushing forward! 🚀"
      ],
      analytical: [
        "Let's break this down systematically. What patterns do you notice? 📊",
        "Based on your previous check-ins, I see some interesting trends we should explore.",
        "What data points would help us measure progress on this goal? 📈"
      ],
      mindful: [
        "Take a deep breath with me... What does your intuition tell you about this? 🧘",
        "Sometimes the answer comes when we stop searching so hard. What arises for you in stillness?",
        "Notice what you're feeling right now, without judgment. What is your body telling you? 🌱"
      ],
      practical: [
        "Here's what I recommend: Break this into 3 concrete steps. What's step 1? 🔧",
        "Let's focus on what you can control. What's one action you can take today?",
        "Time is precious. What's the most efficient way to tackle this? ⚡"
      ]
    };

    const coachResponses = responses[coach.id as keyof typeof responses] || responses.supportive;
    return coachResponses[Math.floor(Math.random() * coachResponses.length)];
  };

  const formatTime = (date: Date | undefined) => {
    if (!date) return '';
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const TypingIndicator = () => (
    <View style={styles.typingContainer}>
      <View style={styles.typingBubble}>
        <Text style={styles.typingText}>
          {selectedCoach.name} is typing...
        </Text>
        <View style={styles.typingDots}>
          <View style={[styles.dot, styles.dot1]} />
          <View style={[styles.dot, styles.dot2]} />
          <View style={[styles.dot, styles.dot3]} />
        </View>
      </View>
    </View>
  );

  const CoachSelector = () => (
    <View style={styles.coachSelectorContainer}>
      <Text style={styles.coachSelectorTitle}>Choose Your Coach</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {coachPersonas.map((coach) => (
          <TouchableOpacity
            key={coach.id}
            style={[
              styles.coachCard,
              selectedCoach.id === coach.id && styles.selectedCoachCard
            ]}
            onPress={() => {
              setSelectedCoach(coach);
              setShowCoachSelector(false);
            }}
          >
            <Text style={styles.coachEmoji}>{coach.emoji}</Text>
            <Text style={styles.coachName}>{coach.name}</Text>
            <Text style={styles.coachDescription}>{coach.description}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const renderMessage = ({ item }: { item: Message }) => {
    const isAI = item.sender === 'ai';
    return (
      <View style={[
        styles.messageBubble,
        isAI ? [styles.aiMessage, { backgroundColor: theme.colors.primary }] : [styles.userMessage, { backgroundColor: theme.colors.secondary }]
      ]}>
        <Text style={[
          styles.messageText,
          { color: isAI ? '#FFFFFF' : theme.colors.text }
        ]}>
          {item.content}
        </Text>
        <Text style={[
          styles.timestamp,
          { color: isAI ? 'rgba(255,255,255,0.7)' : theme.colors.textSecondary }
        ]}>
          {item.timestamp ? formatTime(new Date(item.timestamp)) : ''}
        </Text>
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#fff" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Loading your conversation...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar barStyle="light-content" />
      
      <LinearGradient
        colors={[theme.colors.primary, theme.colors.secondary]}
        style={styles.header}
      >
        <TouchableOpacity
          style={styles.coachSelector}
          onPress={() => setShowCoachSelector(true)}
        >
          <Text style={styles.coachEmoji}>{selectedCoach.emoji}</Text>
          <View>
            <Text style={[styles.coachName, { color: theme.colors.text }]}>
              {selectedCoach.name}
            </Text>
            <Text style={[styles.coachDescription, { color: theme.colors.textSecondary }]}>
              {selectedCoach.description}
            </Text>
          </View>
        </TouchableOpacity>
      </LinearGradient>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoid}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <FlatList
          ref={scrollViewRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.messageList}
          onContentSizeChange={() => scrollViewRef.current?.scrollToEnd()}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text style={[styles.emptyStateText, { color: theme.colors.textSecondary }]}>
                👋 Hi! I'm your AI productivity coach. How can I help you today?
              </Text>
            </View>
          }
        />

        <View style={[styles.inputContainer, { backgroundColor: theme.colors.card }]}>
          <TextInput
            style={[styles.input, { color: theme.colors.text, backgroundColor: theme.colors.surface }]}
            value={inputText}
            onChangeText={setInputText}
            placeholder="Type your message..."
            placeholderTextColor={theme.colors.textSecondary}
            multiline
          />
          <TouchableOpacity
            style={[
              styles.sendButton,
              { backgroundColor: inputText.trim() ? theme.colors.primary : theme.colors.border }
            ]}
            onPress={() => sendMessage(inputText)}
            disabled={!inputText.trim()}
          >
            <Text style={styles.sendButtonText}>Send</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      {isTyping && <TypingIndicator />}
      
      {showCoachSelector && (
        <CoachSelector />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  coachSelector: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  coachEmoji: {
    fontSize: 24,
    marginRight: 8,
  },
  coachName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  coachDescription: {
    fontSize: 12,
  },
  keyboardAvoid: {
    flex: 1,
  },
  messageList: {
    padding: 16,
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 16,
    marginVertical: 4,
  },
  aiMessage: {
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 4,
  },
  userMessage: {
    alignSelf: 'flex-end',
    borderBottomRightRadius: 4,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  timestamp: {
    fontSize: 10,
    marginTop: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 8,
    alignItems: 'center',
  },
  input: {
    flex: 1,
    padding: 12,
    borderRadius: 20,
    marginRight: 8,
    maxHeight: 100,
  },
  sendButton: {
    padding: 12,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyStateText: {
    textAlign: 'center',
    fontSize: 16,
    lineHeight: 24,
  },
  typingContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginBottom: 16,
  },
  typingBubble: {
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  typingText: {
    fontSize: 14,
    color: '#666',
    marginRight: 8,
  },
  typingDots: {
    flexDirection: 'row',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#666',
    marginHorizontal: 1,
  },
  dot1: {
    opacity: 0.4,
  },
  dot2: {
    opacity: 0.7,
  },
  dot3: {
    opacity: 1,
  },
  coachSelectorContainer: {
    backgroundColor: '#fff',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  coachSelectorTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 12,
    paddingHorizontal: 20,
  },
  coachCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    marginLeft: 20,
    minWidth: 120,
    alignItems: 'center',
  },
  selectedCoachCard: {
    backgroundColor: '#007AFF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
});

export default AICoachScreen; 