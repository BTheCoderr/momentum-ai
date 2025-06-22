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
} from 'react-native';
import { messageServices, aiServices } from '../lib/services';
import { Message } from '../lib/supabase';

interface CoachPersona {
  id: string;
  name: string;
  emoji: string;
  description: string;
  tone: string;
  systemPrompt: string;
}

const AICoachScreen = ({ navigation }: any) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedCoach, setSelectedCoach] = useState<CoachPersona>({
    id: 'supportive',
    name: 'Supportive Sam',
    emoji: '🤗',
    description: 'Warm, encouraging, and understanding',
    tone: 'supportive',
    systemPrompt: 'You are a supportive, warm AI coach. Be encouraging and understanding.'
  });
  const [showCoachSelector, setShowCoachSelector] = useState(false);
  const scrollViewRef = useRef<FlatList<Message>>(null);

  useEffect(() => {
    loadChatHistory();
  }, []);

  const loadChatHistory = async () => {
    try {
      setLoading(true);
      const history = await messageServices.getAll('demo-user');
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
      name: 'Supportive Sam',
      emoji: '🤗',
      description: 'Warm, encouraging, and understanding',
      tone: 'supportive',
      systemPrompt: 'You are a supportive, warm AI coach. Be encouraging and understanding. Focus on emotional support and gentle guidance.'
    },
    {
      id: 'motivational',
      name: 'Motivational Mike',
      emoji: '💪',
      description: 'High-energy and goal-focused',
      tone: 'motivational',
      systemPrompt: 'You are a high-energy, motivational AI coach. Push users to achieve their goals with enthusiasm and determination.'
    },
    {
      id: 'analytical',
      name: 'Analytical Anna',
      emoji: '🧠',
      description: 'Data-driven and strategic',
      tone: 'analytical',
      systemPrompt: 'You are an analytical, strategic AI coach. Focus on data, patterns, and logical approaches to problem-solving.'
    },
    {
      id: 'mindful',
      name: 'Mindful Maya',
      emoji: '🧘',
      description: 'Calm, reflective, and wise',
      tone: 'mindful',
      systemPrompt: 'You are a mindful, calm AI coach. Focus on reflection, mindfulness, and inner wisdom. Speak slowly and thoughtfully.'
    },
    {
      id: 'practical',
      name: 'Practical Pete',
      emoji: '🔧',
      description: 'Direct, actionable, and efficient',
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
      // Save user message
      await messageServices.create(userMessage);

      // Get AI response
      const aiResponse = await aiServices.sendMessage(text, {
        coach: selectedCoach,
        userId: 'demo-user'
      });

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: aiResponse,
        sender: 'ai',
        type: 'text',
        timestamp: new Date().toISOString(),
        user_id: 'demo-user',
      };

      setMessages(prev => [...prev, aiMessage]);
      
      // Save AI message
      await messageServices.create(aiMessage);

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

  const formatTime = (date: Date) => {
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
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.coachButton}
          onPress={() => setShowCoachSelector(!showCoachSelector)}
        >
          <Text style={styles.coachEmoji}>{selectedCoach.emoji}</Text>
          <Text style={styles.coachButtonText}>{selectedCoach.name}</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>AI Coach</Text>
        <TouchableOpacity 
          style={styles.settingsButton}
          onPress={() => navigation.navigate('Settings')}
        >
          <Text style={styles.settingsText}>⚙️</Text>
        </TouchableOpacity>
      </View>

      {/* Coach Selector */}
      {showCoachSelector && <CoachSelector />}

      {/* Messages */}
      <View style={styles.messagesContainer}>
        <FlatList
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={[
              styles.messageContainer,
              item.sender === 'user' ? styles.userMessage : styles.aiMessage
            ]}>
              <View style={[
                styles.messageBubble,
                item.sender === 'user' ? styles.userBubble : styles.aiBubble
              ]}>
                <Text style={[
                  styles.messageText,
                  item.sender === 'user' ? styles.userText : styles.aiText
                ]}>
                  {item.content}
                </Text>
                <Text style={[
                  styles.messageTime,
                  item.sender === 'user' ? styles.userTime : styles.aiTime
                ]}>
                  {formatTime(new Date(item.timestamp || new Date()))}
                </Text>
              </View>
            </View>
          )}
          showsVerticalScrollIndicator={false}
          ref={scrollViewRef}
          onContentSizeChange={() => {
            if (scrollViewRef.current && messages.length > 0) {
              scrollViewRef.current.scrollToEnd({ animated: true });
            }
          }}
        />
        
        {isTyping && <TypingIndicator />}
      </View>

      {/* Input */}
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.inputContainer}
      >
        <View style={styles.inputRow}>
          <TextInput
            style={styles.textInput}
            value={inputText}
            onChangeText={setInputText}
            placeholder={`Message ${selectedCoach.name}...`}
            placeholderTextColor="#999"
            multiline
            maxLength={500}
          />
          <TouchableOpacity 
            style={[styles.sendButton, !inputText.trim() && styles.sendButtonDisabled]}
            onPress={() => sendMessage(inputText)}
            disabled={!inputText.trim()}
          >
            <Text style={styles.sendButtonText}>Send</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  coachButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  coachEmoji: {
    fontSize: 20,
    marginRight: 6,
  },
  coachButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  settingsButton: {
    padding: 8,
  },
  settingsText: {
    fontSize: 20,
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
  coachName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
    marginTop: 4,
    textAlign: 'center',
  },
  coachDescription: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
    textAlign: 'center',
  },
  messagesContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  messageContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  userMessage: {
    justifyContent: 'flex-end',
  },
  aiMessage: {
    justifyContent: 'flex-start',
  },
  messageBubble: {
    maxWidth: '80%',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  userBubble: {
    backgroundColor: '#007AFF',
  },
  aiBubble: {
    backgroundColor: '#fff',
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
  userText: {
    color: '#fff',
  },
  aiText: {
    color: '#1a1a1a',
  },
  messageTime: {
    fontSize: 12,
    marginTop: 4,
  },
  userTime: {
    color: 'rgba(255,255,255,0.7)',
  },
  aiTime: {
    color: '#999',
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
  inputContainer: {
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    maxHeight: 100,
    marginRight: 12,
    backgroundColor: '#f8f9fa',
  },
  sendButton: {
    backgroundColor: '#007AFF',
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  sendButtonDisabled: {
    backgroundColor: '#ccc',
  },
  sendButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
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