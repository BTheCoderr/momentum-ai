import { useState } from 'react';
import { Send, Brain, AlertTriangle, CheckCircle, TrendingUp, MessageSquare } from 'lucide-react';
import { useSubscription } from '@/hooks/useSubscription';
import { TIER_DESCRIPTIONS, SubscriptionTier } from '@/config/subscription-tiers';

interface Message {
  id: string;
  type: 'insight' | 'encouragement' | 'question' | 'reminder';
  content: string;
  timestamp: string;
  isAI: boolean;
}

interface AICoachPanelProps {
  messages: Message[];
  onSendMessage: (message: string) => void;
  isTyping?: boolean;
}

export default function AICoachPanel({ messages, onSendMessage, isTyping = false }: AICoachPanelProps) {
  const { userTier, canAccessFeature, getFeatureLimit, checkDailyCheckInLimit } = useSubscription();
  const [dailyCheckIns, setDailyCheckIns] = useState(0);

  const getMessageIcon = (type: string) => {
    switch (type) {
      case 'insight': return <Brain className="w-4 h-4 text-purple-600" />;
      case 'encouragement': return <TrendingUp className="w-4 h-4 text-green-600" />;
      case 'question': return <MessageSquare className="w-4 h-4 text-blue-600" />;
      case 'reminder': return <AlertTriangle className="w-4 h-4 text-amber-600" />;
      default: return <MessageSquare className="w-4 h-4 text-gray-600" />;
    }
  };

  const getMessageStyle = (type: string) => {
    switch (type) {
      case 'insight': return 'bg-purple-50 border-purple-100 text-purple-700';
      case 'encouragement': return 'bg-green-50 border-green-100 text-green-700';
      case 'question': return 'bg-blue-50 border-blue-100 text-blue-700';
      case 'reminder': return 'bg-amber-50 border-amber-100 text-amber-700';
      default: return 'bg-gray-50 border-gray-100 text-gray-700';
    }
  };

  const handleSendMessage = async (message: string) => {
    if (!message.trim()) return;

    // Check if user has access to AI chat
    if (!canAccessFeature('aiCheckInsPerDay')) {
      onSendMessage(`Upgrade to ${TIER_DESCRIPTIONS['PRO'].name} to unlock AI coaching and personalized insights!`);
      return;
    }

    // Check daily limit
    if (!checkDailyCheckInLimit(dailyCheckIns)) {
      onSendMessage(`You've reached your daily AI coaching limit. Upgrade to ${TIER_DESCRIPTIONS['PRO'].name} for unlimited coaching!`);
      return;
    }

    const newMessage: Message = {
      id: Date.now().toString(),
      type: 'question',
      content: message,
      timestamp: new Date().toISOString(),
      isAI: false
    };

    onSendMessage(message);
    setDailyCheckIns(prev => prev + 1);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col h-[600px]">
      {/* Header */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">AI Coach</h2>
              <div className="flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                <span className="text-sm text-green-600">Active</span>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <div className="px-3 py-1 bg-purple-50 text-purple-700 rounded-full text-sm font-medium">Elite</div>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.isAI ? 'justify-start' : 'justify-end'}`}
          >
            <div className={`max-w-[80%] ${message.isAI ? 'mr-auto' : 'ml-auto'}`}>
              {message.isAI ? (
                <div className={`rounded-lg p-4 ${getMessageStyle(message.type)} border`}>
                  <div className="flex items-center space-x-2 mb-2">
                    {getMessageIcon(message.type)}
                    <span className="text-sm font-medium capitalize">{message.type}</span>
                  </div>
                  <p className="text-sm">{message.content}</p>
                </div>
              ) : (
                <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg p-4">
                  <p className="text-sm">{message.content}</p>
                </div>
              )}
              <div className="text-xs text-gray-500 mt-1">
                {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-gray-100 rounded-lg p-4 max-w-[80%]">
              <div className="flex space-x-2">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200"></div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="p-4 border-t border-gray-100">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const input = e.currentTarget.elements.namedItem('message') as HTMLInputElement;
            if (input.value.trim()) {
              handleSendMessage(input.value);
              input.value = '';
            }
          }}
          className="flex space-x-2"
        >
          <input
            type="text"
            name="message"
            placeholder="Type your message..."
            className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
} 