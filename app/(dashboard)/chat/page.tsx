'use client';

import React, { useState, useEffect } from 'react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  userId: string;
}

const ChatPage = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(true);

  // Load chat history on component mount
  useEffect(() => {
    loadChatHistory();
  }, []);

  const loadChatHistory = async () => {
    try {
      setLoadingHistory(true);
      const response = await fetch('/api/chat/history?userId=demo-user');
      const history = await response.json();
      
      if (Array.isArray(history)) {
        setMessages(history.map(msg => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        })));
      }
    } catch (error) {
      console.error('Error loading chat history:', error);
      // Set a default welcome message if no history exists
      setMessages([{
        id: '1',
        role: 'assistant',
        content: "Hi there! I'm here to chat about anything - your goals, challenges, thoughts, or just life in general. What's on your mind?",
        timestamp: new Date(),
        userId: 'demo-user'
      }]);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleSendMessage = async () => {
    if (!inputText.trim() || isLoading) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: inputText,
      timestamp: new Date(),
      userId: 'demo-user'
    };

    // Add user message to UI immediately
    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    try {
      // Send message to API
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: inputText,
          userId: 'demo-user'
        }),
      });

      const data = await response.json();
      
      if (data.success && data.response) {
        // Add AI response to UI
        const aiMessage: Message = {
          id: `ai-${Date.now()}`,
          role: 'assistant',
          content: data.response,
          timestamp: new Date(),
          userId: 'demo-user'
        };
        
        setMessages(prev => [...prev, aiMessage]);
      } else {
        // Handle error case
        console.error('Error from chat API:', data);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      // Add error message to UI
      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        role: 'assistant',
        content: "I'm having trouble connecting right now. Please try again in a moment.",
        timestamp: new Date(),
        userId: 'demo-user'
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  if (loadingHistory) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your chat history...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Chat</h1>
        <p className="text-gray-600 mt-2">Have a casual conversation about anything</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border h-[600px] flex flex-col">
        {/* Messages Area */}
        <div className="flex-1 p-6 overflow-y-auto">
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-3 rounded-lg ${
                    message.role === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-900'
                  }`}
                >
                  <p className="text-sm">{message.content}</p>
                  <p className={`text-xs mt-1 ${
                    message.role === 'user' ? 'text-blue-200' : 'text-gray-500'
                  }`}>
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="max-w-xs lg:max-w-md px-4 py-3 rounded-lg bg-gray-100">
                  <div className="flex items-center space-x-2">
                    <div className="animate-pulse flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                    </div>
                    <span className="text-xs text-gray-500">AI is thinking...</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Input Area */}
        <div className="border-t p-4">
          <div className="flex space-x-3">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="What's on your mind?"
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={isLoading}
            />
            <button
              onClick={handleSendMessage}
              disabled={!inputText.trim() || isLoading}
              className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                inputText.trim() && !isLoading
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              {isLoading ? 'Sending...' : 'Send'}
            </button>
          </div>
        </div>
      </div>

      {/* Conversation Starters */}
      <div className="mt-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">💬 Conversation Starters</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          <button
            onClick={() => setInputText("How has your day been so far?")}
            className="p-3 bg-gray-50 rounded-lg text-left hover:bg-gray-100 transition-colors text-sm"
            disabled={isLoading}
          >
            How's your day?
          </button>
          <button
            onClick={() => setInputText("I'm feeling a bit overwhelmed lately")}
            className="p-3 bg-gray-50 rounded-lg text-left hover:bg-gray-100 transition-colors text-sm"
            disabled={isLoading}
          >
            Feeling overwhelmed
          </button>
          <button
            onClick={() => setInputText("What should I focus on today?")}
            className="p-3 bg-gray-50 rounded-lg text-left hover:bg-gray-100 transition-colors text-sm"
            disabled={isLoading}
          >
            What to focus on?
          </button>
          <button
            onClick={() => setInputText("I had a great win today!")}
            className="p-3 bg-gray-50 rounded-lg text-left hover:bg-gray-100 transition-colors text-sm"
            disabled={isLoading}
          >
            Share a win
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatPage; 