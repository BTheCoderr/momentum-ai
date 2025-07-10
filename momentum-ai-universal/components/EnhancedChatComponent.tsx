import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, Alert } from 'react-native';
import { getContextualReply, trackUserInteraction, type RAGChatResponse } from '../lib/rag-client';
import universalStorage from '../lib/storage';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  context_used?: string[];
  confidence?: number;
}

export const EnhancedChatComponent: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [userId, setUserId] = useState<string>('');

  useEffect(() => {
    initializeChat();
  }, []);

  const initializeChat = async () => {
    try {
      const storedUserId = await universalStorage.getItem('userId') || 'demo-user';
      setUserId(storedUserId);
      
      // Add welcome message
      setMessages([{
        id: '1',
        text: "Hi! I'm your AI coach. I have context about your goals, check-ins, and progress. How can I help you today? 🚀",
        sender: 'ai',
        timestamp: new Date()
      }]);
    } catch (error) {
      console.error('Error initializing chat:', error);
    }
  };

  const sendMessage = async () => {
    if (!inputText.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    try {
      // 🚀 This is where the magic happens - RAG-powered response!
      const response = await getContextualReply(userId, inputText, 'general');
      
      // Track this interaction for future context
      await trackUserInteraction(userId, 'checkin', inputText);

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: response,
        sender: 'ai',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMessage]);

    } catch (error) {
      console.error('Error sending message:', error);
      
      // Fallback message
      const fallbackMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "I'm here to help! Tell me more about what's on your mind.",
        sender: 'ai',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, fallbackMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const renderMessage = (message: Message) => (
    <View key={message.id} style={[
      styles.messageContainer,
      message.sender === 'user' ? styles.userMessage : styles.aiMessage
    ]}>
      <Text style={[
        styles.messageText,
        message.sender === 'user' ? styles.userMessageText : styles.aiMessageText
      ]}>
        {message.text}
      </Text>
      {message.context_used && message.context_used.length > 0 && (
        <Text style={styles.contextInfo}>
          📊 Used context: {message.context_used.join(', ')}
        </Text>
      )}
      {message.confidence && (
        <Text style={styles.confidenceInfo}>
          🎯 Confidence: {(message.confidence * 100).toFixed(0)}%
        </Text>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <ScrollView style={styles.messagesContainer}>
        {messages.map(renderMessage)}
        {isLoading && (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>🧠 Getting personalized response...</Text>
          </View>
        )}
      </ScrollView>
      
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.textInput}
          value={inputText}
          onChangeText={setInputText}
          placeholder="Ask me anything about your goals, progress, or motivation..."
          multiline
          maxLength={500}
        />
        <TouchableOpacity 
          style={[styles.sendButton, isLoading && styles.sendButtonDisabled]}
          onPress={sendMessage}
          disabled={isLoading}
        >
          <Text style={styles.sendButtonText}>Send</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  messagesContainer: {
    flex: 1,
    padding: 16,
  },
  messageContainer: {
    marginVertical: 8,
    padding: 12,
    borderRadius: 12,
    maxWidth: '80%',
  },
  userMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#007AFF',
  },
  aiMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#E5E5EA',
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  userMessageText: {
    color: 'white',
  },
  aiMessageText: {
    color: '#000',
  },
  contextInfo: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
    fontStyle: 'italic',
  },
  confidenceInfo: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  loadingContainer: {
    alignSelf: 'flex-start',
    backgroundColor: '#E5E5EA',
    padding: 12,
    borderRadius: 12,
    marginVertical: 8,
  },
  loadingText: {
    color: '#666',
    fontStyle: 'italic',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginRight: 12,
    maxHeight: 100,
  },
  sendButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#ccc',
  },
  sendButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default EnhancedChatComponent; 