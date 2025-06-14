import { useState, useEffect } from 'react';
import { Message } from '@/types';

export function useMessages() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isTyping, setIsTyping] = useState(false);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/messages');
      
      if (!response.ok) {
        throw new Error('Failed to fetch messages');
      }
      
      const data = await response.json();
      setMessages(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (content: string) => {
    try {
      setIsTyping(true);
      
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content,
          sender: 'user',
          type: 'question'
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      const { userMessage, aiMessage } = await response.json();
      
      // Add both user message and AI response to state
      setMessages(prev => [...prev, userMessage, aiMessage]);
      setError(null);
      
      return { userMessage, aiMessage };
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send message');
      throw err;
    } finally {
      setIsTyping(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  return {
    messages,
    loading,
    error,
    isTyping,
    sendMessage,
    refetch: fetchMessages,
  };
} 