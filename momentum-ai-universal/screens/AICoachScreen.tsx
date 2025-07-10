import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, FlatList } from 'react-native';
import { messageServices, coachServices } from '../lib/services';
import { LoadingState } from '../components/LoadingState';
import { showToast } from '../lib/utils';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'coach';
  created_at: string;
  user_id: string;
}

interface CoachPersonality {
  name: string;
  personality: string;
  style: string;
}

export const AICoachScreen = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [coachPersonality, setCoachPersonality] = useState<CoachPersonality | null>(null);

  useEffect(() => {
    loadMessages();
    loadCoachPersonality();
  }, []);

  const loadMessages = async () => {
    try {
      const data = await messageServices.getAll();
      setMessages(data);
    } catch (error) {
      console.error('Error loading messages:', error);
      showToast('Error loading messages');
    }
  };

  const loadCoachPersonality = async () => {
    try {
      const data = await coachServices.getCoachPersonality();
      setCoachPersonality(data);
    } catch (error) {
      console.error('Error loading coach personality:', error);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    setLoading(true);
    try {
      const response = await messageServices.sendMessage(newMessage);
      setMessages(prev => [...prev, response]);
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      showToast('Error sending message');
    } finally {
      setLoading(false);
    }
  };

  if (!coachPersonality) {
    return <LoadingState />;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{coachPersonality.name}</Text>
        <Text style={styles.subtitle}>{coachPersonality.personality}</Text>
      </View>

      <FlatList
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={[
            styles.messageContainer,
            item.sender === 'user' ? styles.userMessage : styles.aiMessage
          ]}>
            <Text style={styles.messageText}>{item.content}</Text>
            <Text style={styles.timestamp}>
              {new Date(item.created_at).toLocaleTimeString()}
            </Text>
          </View>
        )}
      />

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={newMessage}
          onChangeText={setNewMessage}
          placeholder="Type your message..."
          multiline
        />
        <TouchableOpacity 
          style={styles.sendButton}
          onPress={handleSendMessage}
          disabled={loading}
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
    backgroundColor: '#fff',
  },
  header: {
    padding: 15,
    backgroundColor: '#f8f8f8',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
  },
  messageContainer: {
    padding: 10,
    marginVertical: 5,
    marginHorizontal: 10,
    borderRadius: 10,
    maxWidth: '80%',
  },
  userMessage: {
    backgroundColor: '#007AFF',
    alignSelf: 'flex-end',
  },
  aiMessage: {
    backgroundColor: '#E9E9EB',
    alignSelf: 'flex-start',
  },
  messageText: {
    fontSize: 16,
    color: '#000',
  },
  timestamp: {
    fontSize: 12,
    color: '#666',
    marginTop: 5,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  input: {
    flex: 1,
    padding: 10,
    backgroundColor: '#f8f8f8',
    borderRadius: 20,
    marginRight: 10,
  },
  sendButton: {
    backgroundColor: '#007AFF',
    padding: 10,
    borderRadius: 20,
    justifyContent: 'center',
  },
  sendButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
}); 