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
import type { Message as DBMessage } from '../lib/supabase';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'coach';
  timestamp: string;
  coachType?: CoachType;
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
  const [selectedCoach, setSelectedCoach] = useState<Coach>(COACHES[0]);
  const [showCoachSelect, setShowCoachSelect] = useState(false);
  
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    loadMessages();
  }, []);

  const loadMessages = async () => {
    try {
      const savedMessages = await messageServices.getAll();
      const formattedMessages: Message[] = savedMessages.map((msg: DBMessage) => ({
        id: msg.id,
        text: msg.content,
        sender: msg.sender as 'user' | 'coach',
        timestamp: msg.timestamp || new Date().toISOString(),
        coachType: msg.type as CoachType,
      }));
      setMessages(formattedMessages);
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const handleSend = async () => {
    if (!inputText.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText,
      sender: 'user',
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    Keyboard.dismiss();

    try {
      setIsLoading(true);
      const response = await messageServices.sendMessage(inputText);
      
      const coachMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: response,
        sender: 'coach',
        timestamp: new Date().toISOString(),
        coachType: selectedCoach.type,
      };

      setMessages(prev => [...prev, coachMessage]);
      flatListRef.current?.scrollToEnd();
    } catch (error) {
      console.error('Error sending message:', error);
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
        <Text style={styles.timestamp}>
          {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </Text>
      </View>
    </View>
  );

  const renderCoachSelect = () => (
    <View style={styles.coachSelectContainer}>
      <Text style={styles.coachSelectTitle}>Choose Your Coach</Text>
      {COACHES.map(coach => (
        <TouchableOpacity
          key={coach.type}
          style={[
            styles.coachOption,
            selectedCoach.type === coach.type && styles.selectedCoach
          ]}
          onPress={() => {
            setSelectedCoach(coach);
            setShowCoachSelect(false);
          }}
        >
          <Text style={styles.coachOptionAvatar}>{coach.avatar}</Text>
          <View style={styles.coachOptionInfo}>
            <Text style={styles.coachName}>{coach.name}</Text>
            <Text style={styles.coachDescription}>{coach.description}</Text>
            <Text style={styles.coachStyle}>Style: {coach.style}</Text>
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );

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
          />

          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
            style={styles.inputContainer}
          >
            <TextInput
              style={styles.input}
              placeholder="Type your message..."
              value={inputText}
              onChangeText={setInputText}
              multiline
              maxLength={500}
              returnKeyType="send"
              onSubmitEditing={handleSend}
              editable={!isLoading}
            />
            <TouchableOpacity
              style={[styles.sendButton, (!inputText.trim() || isLoading) && styles.disabledButton]}
              onPress={handleSend}
              disabled={!inputText.trim() || isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.sendButtonText}>Send</Text>
              )}
            </TouchableOpacity>
          </KeyboardAvoidingView>
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
    color: '#007AFF',
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
  input: {
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
    backgroundColor: '#007AFF',
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
  disabledButton: {
    opacity: 0.5,
  },
  coachSelectContainer: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  coachSelectTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  coachOption: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#f0f0f0',
    borderRadius: 12,
    marginBottom: 12,
  },
  selectedCoach: {
    backgroundColor: '#e3f2fd',
    borderColor: '#007AFF',
    borderWidth: 2,
  },
  coachOptionAvatar: {
    fontSize: 32,
    marginRight: 16,
  },
  coachOptionInfo: {
    flex: 1,
  },
  coachName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  coachDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  coachStyle: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
  },
}); 