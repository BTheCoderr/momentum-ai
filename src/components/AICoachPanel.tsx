import { useState } from 'react';
import { Send, Brain, User, Lightbulb, Heart, Clock } from 'lucide-react';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  type?: 'insight' | 'encouragement' | 'question' | 'reminder';
}

export default function AICoachPanel() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: "Hi! I've been analyzing your progress and I noticed something interesting. You've been making great progress on your SaaS goal, but your fitness goal seems to be lagging. What's going on?",
      sender: 'ai',
      timestamp: new Date(Date.now() - 1000 * 60 * 5),
      type: 'question'
    },
    {
      id: '2', 
      content: "You're right. I've been so focused on my startup that I've been skipping workouts. I know it's important but I just can't find the time.",
      sender: 'user',
      timestamp: new Date(Date.now() - 1000 * 60 * 3)
    },
    {
      id: '3',
      content: "I understand that completely. Here's what I've learned about your patterns: you're most energetic in the mornings, and you mentioned that staying fit makes you feel confident and energetic for your family. What if we tried 15-minute morning workouts instead of hour-long gym sessions?",
      sender: 'ai', 
      timestamp: new Date(Date.now() - 1000 * 60 * 2),
      type: 'insight'
    },
    {
      id: '4',
      content: "That actually sounds doable! I could do that before I start coding.",
      sender: 'user',
      timestamp: new Date(Date.now() - 1000 * 60 * 1)
    },
    {
      id: '5',
      content: "Perfect! I'll set up a gentle reminder for 7 AM tomorrow. Remember, this isn't just about fitness - it's about feeling confident and energetic for your family. That's your deeper 'why', and it's what will keep you motivated when things get tough.",
      sender: 'ai',
      timestamp: new Date(),
      type: 'encouragement'
    }
  ]);

  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const newUserMessage: Message = {
      id: Date.now().toString(),
      content: inputValue,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, newUserMessage]);
    const currentMessage = inputValue;
    setInputValue('');
    setIsTyping(true);

    try {
      // Call our API endpoint
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: currentMessage,
          goals: [], // Would pass actual goals in real app
          userContext: {
            recentActivity: 'active',
            timeOfDay: new Date().getHours()
          }
        }),
      });

      const data = await response.json();
      
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: data.response,
        sender: 'ai',
        timestamp: new Date(),
        type: data.fallback ? 'question' : 'insight'
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Chat error:', error);
      
      // Fallback to local response if API fails
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: "I'm having some connection issues, but I'm still here to support you. What's on your mind about your goals?",
        sender: 'ai',
        timestamp: new Date(),
        type: 'question'
      };

      setMessages(prev => [...prev, aiMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const getMessageIcon = (type?: string) => {
    switch (type) {
      case 'insight': return <Lightbulb className="w-4 h-4 text-yellow-500" />;
      case 'encouragement': return <Heart className="w-4 h-4 text-pink-500" />;
      case 'reminder': return <Clock className="w-4 h-4 text-blue-500" />;
      default: return <Brain className="w-4 h-4 text-purple-500" />;
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 max-w-4xl mx-auto">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
            <Brain className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">AI Accountability Coach</h2>
            <p className="text-gray-600 text-sm">Your personal motivation detective</p>
          </div>
          <div className="ml-auto">
            <div className="flex items-center space-x-2 text-sm text-green-600">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span>Active</span>
            </div>
          </div>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="p-6 max-h-96 overflow-y-auto space-y-6">
        {messages.map((message) => (
          <div key={message.id} className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`flex space-x-3 max-w-xs lg:max-w-md ${message.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
              {/* Avatar */}
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                message.sender === 'user' 
                  ? 'bg-blue-100' 
                  : 'bg-gradient-to-r from-purple-500 to-pink-500'
              }`}>
                {message.sender === 'user' ? (
                  <User className="w-4 h-4 text-blue-600" />
                ) : (
                  <Brain className="w-4 h-4 text-white" />
                )}
              </div>

              {/* Message */}
              <div className={`rounded-xl p-4 ${
                message.sender === 'user'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-900'
              }`}>
                {message.sender === 'ai' && message.type && (
                  <div className="flex items-center space-x-2 mb-2 opacity-75">
                    {getMessageIcon(message.type)}
                    <span className="text-xs font-medium capitalize">{message.type}</span>
                  </div>
                )}
                <p className="text-sm leading-relaxed">{message.content}</p>
                <p className={`text-xs mt-2 opacity-75 ${
                  message.sender === 'user' ? 'text-blue-100' : 'text-gray-500'
                }`}>
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          </div>
        ))}

        {/* Typing Indicator */}
        {isTyping && (
          <div className="flex justify-start">
            <div className="flex space-x-3 max-w-xs lg:max-w-md">
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
                <Brain className="w-4 h-4 text-white" />
              </div>
              <div className="bg-gray-100 text-gray-900 rounded-xl p-4">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="p-6 border-t border-gray-200">
        <div className="flex space-x-3">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Share what's on your mind..."
            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={isTyping}
          />
          <button
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || isTyping}
            className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg hover:shadow-lg transition-shadow disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          Your AI coach is here to help you stay connected to your deeper motivations and overcome obstacles.
        </p>
      </div>
    </div>
  );
} 