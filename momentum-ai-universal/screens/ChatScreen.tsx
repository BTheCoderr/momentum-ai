import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Keyboard,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { messageServices } from '../lib/services';
import { getContextualReply, trackUserInteraction } from '../lib/rag-client';
import universalStorage from '../lib/storage';
import type { Message as DBMessage } from '../lib/supabase';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'coach';
  timestamp: string;
  coachType?: CoachType;
  contextUsed?: string[];
  confidence?: number;
}

type CoachType = 'motivational' | 'analytical' | 'supportive';

interface Coach {
  type: CoachType;
  name: string;
  avatar: string;
  description: string;
  style: string;
}

const COACHES: Coach[] = [
  {
    type: 'motivational',
    name: 'Max Energy',
    avatar: '💪',
    description: 'High-energy coach focused on motivation and action',
    style: 'Energetic and inspiring',
  },
  {
    type: 'analytical',
    name: 'Dr. Logic',
    avatar: '🧠',
    description: 'Data-driven coach focused on strategy and planning',
    style: 'Analytical and strategic',
  },
  {
    type: 'supportive',
    name: 'Emma Care',
    avatar: '💝',
    description: 'Empathetic coach focused on emotional support',
    style: 'Supportive and understanding',
  },
];

export default function ChatScreen({ navigation }: any) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [selectedCoach, setSelectedCoach] = useState<Coach>(COACHES[0]);
  const [showCoachSelect, setShowCoachSelect] = useState(false);
  const [userId, setUserId] = useState<string>('');
  const [ragEnabled, setRagEnabled] = useState(true);
  
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    initializeChat();
  }, []);

  const initializeChat = async () => {
    try {
      setInitialLoading(true);
      
      // Get user ID
      const storedUserId = await universalStorage.getItem('userId') || 'demo-user';
      setUserId(storedUserId);
      
      // Load existing messages
      await loadMessages();
      
    } catch (error) {
      console.error('Error initializing chat:', error);
    } finally {
      setInitialLoading(false);
    }
  };

  const loadMessages = async () => {
    try {
      const savedMessages = await messageServices.getAll();
      
      if (savedMessages && savedMessages.length > 0) {
        const formattedMessages: Message[] = savedMessages.map((msg: DBMessage) => ({
          id: msg.id,
          text: msg.content,
          sender: msg.sender as 'user' | 'coach',
          timestamp: msg.timestamp || new Date().toISOString(),
          coachType: msg.type as CoachType,
        }));
        setMessages(formattedMessages);
      } else {
      // Add welcome message if no messages exist
        const welcomeMessage: Message = {
          id: 'welcome',
          text: "Hi! I'm your AI coach with memory. I remember your goals, check-ins, and progress. How can I help you today? 🚀",
          sender: 'coach',
          timestamp: new Date().toISOString(),
          coachType: selectedCoach.type,
        };
        setMessages([welcomeMessage]);
      }
    } catch (error) {
      console.error('Error loading messages:', error);
      // Show welcome message as fallback
      const welcomeMessage: Message = {
        id: 'welcome',
        text: "Hi! I'm your AI coach. How can I help you today? 🚀",
        sender: 'coach',
        timestamp: new Date().toISOString(),
        coachType: selectedCoach.type,
      };
      setMessages([welcomeMessage]);
    }
  };

  const handleSend = async () => {
    if (!inputText.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText,
      sender: 'user',
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMessage]);
    const messageText = inputText;
    setInputText('');
    Keyboard.dismiss();

    try {
      setIsLoading(true);
      
      let response: string;
      let contextUsed: string[] = [];
      let confidence: number = 0.8;

      if (ragEnabled) {
        try {
          // 🚀 RAG-POWERED RESPONSE with user context!
          console.log('🧠 Getting RAG response for user:', userId);
          
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
          
          const ragResponse = await fetch('http://localhost:8000/chat', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              message: messageText,
              userId: userId,
              coachingType: selectedCoach.type,
            }),
            signal: controller.signal,
          });

          clearTimeout(timeoutId);

          if (ragResponse.ok) {
            const ragData = await ragResponse.json();
            response = ragData.response;
            contextUsed = ragData.context_used || [];
            confidence = ragData.confidence || 0.8;
            
            console.log('✅ RAG Response received:', {
              response_length: response.length,
              context_types: contextUsed,
              confidence: confidence
            });
            
            // Track this interaction for future context (don't await to improve performance)
            trackUserInteraction(userId, 'checkin', messageText).catch(console.error);
            
          } else {
            throw new Error('RAG service unavailable');
          }
        } catch (ragError) {
          console.log('⚠️ RAG failed, falling back to regular service:', ragError);
          // Fallback to existing service
          response = await messageServices.sendMessage(messageText);
          contextUsed = [];
          confidence = 0.6;
        }
      } else {
        // Use existing service
        response = await messageServices.sendMessage(messageText);
      }
      
      // Add coach response
      const coachMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: response,
        sender: 'coach',
        timestamp: new Date().toISOString(),
        coachType: selectedCoach.type,
        contextUsed: contextUsed,
        confidence: confidence,
      };

      setMessages(prev => [...prev, coachMessage]);

    } catch (error) {
      console.error('Error sending message:', error);
      
      // Add error message
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "I'm having trouble responding right now. Please try again in a moment.",
        sender: 'coach',
        timestamp: new Date().toISOString(),
        coachType: selectedCoach.type,
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const renderMessage = ({ item }: { item: Message }) => (
    <View style={[
      styles.messageContainer,
      item.sender === 'user' ? styles.userMessage : styles.coachMessage
    ]}>
      {item.sender === 'coach' && (
        <Text style={styles.coachAvatar}>{selectedCoach.avatar}</Text>
      )}
      <View style={styles.messageContent}>
        <Text style={styles.messageText}>{item.text}</Text>
        
        {/* Show RAG context info for coach messages */}
        {item.sender === 'coach' && item.contextUsed && item.contextUsed.length > 0 && (
          <Text style={styles.contextInfo}>
            📊 Context: {item.contextUsed.join(', ')}
          </Text>
        )}
        
        {item.sender === 'coach' && item.confidence && (
          <Text style={styles.confidenceInfo}>
            🎯 Confidence: {(item.confidence * 100).toFixed(0)}%
          </Text>
        )}
        
        <Text style={styles.timestamp}>
          {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </Text>
      </View>
    </View>
  );

  const renderCoachSelect = () => (
    <View style={styles.coachSelectContainer}>
      <Text style={styles.coachSelectTitle}>Choose Your Coach</Text>
      {COACHES.map((coach) => (
        <TouchableOpacity
          key={coach.type}
          style={[
            styles.coachOption,
            selectedCoach.type === coach.type && styles.selectedCoachOption
          ]}
          onPress={() => {
            setSelectedCoach(coach);
            setShowCoachSelect(false);
          }}
        >
          <Text style={styles.coachOptionAvatar}>{coach.avatar}</Text>
          <View style={styles.coachOptionInfo}>
            <Text style={styles.coachOptionName}>{coach.name}</Text>
            <Text style={styles.coachOptionDescription}>{coach.description}</Text>
          </View>
        </TouchableOpacity>
      ))}
      
      {/* RAG Toggle */}
      <TouchableOpacity
        style={[styles.ragToggle, ragEnabled && styles.ragToggleEnabled]}
        onPress={() => setRagEnabled(!ragEnabled)}
      >
        <Text style={styles.ragToggleText}>
          🧠 Smart Memory: {ragEnabled ? 'ON' : 'OFF'}
        </Text>
        <Text style={styles.ragToggleSubtext}>
          {ragEnabled ? 'I remember your goals and progress' : 'Basic responses only'}
        </Text>
      </TouchableOpacity>
    </View>
  );

  if (initialLoading) {
    return null;
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.coachButton}
          onPress={() => setShowCoachSelect(!showCoachSelect)}
        >
          <Text style={styles.coachButtonAvatar}>{selectedCoach.avatar}</Text>
          <Text style={styles.coachButtonText}>{selectedCoach.name}</Text>
          {ragEnabled && <Text style={styles.ragIndicator}>🧠</Text>}
        </TouchableOpacity>
      </View>

      {showCoachSelect ? (
        renderCoachSelect()
      ) : (
        <>
          <FlatList
            ref={flatListRef}
            data={messages}
            renderItem={renderMessage}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.messagesList}
            onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
            removeClippedSubviews={true}
            maxToRenderPerBatch={10}
            windowSize={10}
          />
          
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.textInput}
              value={inputText}
              onChangeText={setInputText}
              placeholder="Ask your coach anything..."
              multiline
              maxLength={500}
              editable={!isLoading}
            />
            <TouchableOpacity
              style={[styles.sendButton, isLoading && styles.sendButtonDisabled]} 
              onPress={handleSend}
              disabled={isLoading || !inputText.trim()}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="#FFF" />
              ) : (
                <Text style={styles.sendButtonText}>Send</Text>
              )}
            </TouchableOpacity>
          </View>
        </>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    fontSize: 16,
    color: '#FF6B35',
  },
  coachButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
  },
  coachButtonAvatar: {
    fontSize: 20,
    marginRight: 8,
  },
  coachButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  ragIndicator: {
    fontSize: 16,
    marginLeft: 6,
  },
  coachSelectContainer: {
    padding: 16,
    backgroundColor: '#fff',
    flex: 1,
  },
  coachSelectTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  coachOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    marginBottom: 12,
  },
  selectedCoachOption: {
    backgroundColor: '#FF6B35',
  },
  coachOptionAvatar: {
    fontSize: 24,
    marginRight: 16,
  },
  coachOptionInfo: {
    flex: 1,
  },
  coachOptionName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  coachOptionDescription: {
    fontSize: 14,
    color: '#666',
  },
  ragToggle: {
    padding: 16,
    backgroundColor: '#f0f0f0',
    borderRadius: 12,
    marginTop: 20,
    borderWidth: 2,
    borderColor: '#ddd',
  },
  ragToggleEnabled: {
    backgroundColor: '#e8f5e8',
    borderColor: '#4CAF50',
  },
  ragToggleText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  ragToggleSubtext: {
    fontSize: 14,
    color: '#666',
  },
  messagesList: {
    padding: 16,
  },
  messageContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    maxWidth: '80%',
  },
  userMessage: {
    alignSelf: 'flex-end',
  },
  coachMessage: {
    alignSelf: 'flex-start',
  },
  coachAvatar: {
    fontSize: 24,
    marginRight: 8,
  },
  messageContent: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  messageText: {
    fontSize: 16,
    color: '#333',
  },
  contextInfo: {
    fontSize: 12,
    color: '#666',
    marginTop: 6,
    fontStyle: 'italic',
  },
  confidenceInfo: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  timestamp: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  textInput: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    fontSize: 16,
    maxHeight: 100,
  },
  sendButton: {
    backgroundColor: '#FF6B35',
    borderRadius: 20,
    width: 60,
    alignItems: 'center',
    justifyContent: 'center',
    height: 40,
  },
  sendButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  sendButtonDisabled: {
    backgroundColor: '#ccc',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
}); 