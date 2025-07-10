'use client';

import React, { useState } from 'react';

const CoachPage = () => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'ai',
      text: "Hello! I'm your AI accountability coach. I'm here to help you stay motivated and on track with your goals. How can I support you today?",
      timestamp: new Date(),
    },
  ]);
  const [inputText, setInputText] = useState('');

  const handleSendMessage = () => {
    if (!inputText.trim()) return;

    const newMessage = {
      id: messages.length + 1,
      sender: 'user',
      text: inputText,
      timestamp: new Date(),
    };

    setMessages([...messages, newMessage]);
    setInputText('');

    // Simulate AI response
    setTimeout(() => {
      const aiResponse = {
        id: messages.length + 2,
        sender: 'ai',
        text: "I understand! Let me help you work through that. Can you tell me more about what specific challenges you're facing?",
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, aiResponse]);
    }, 1000);
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">AI Coach</h1>
        <p className="text-gray-600 mt-2">Your personal accountability partner, available 24/7</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border h-[600px] flex flex-col">
        {/* Messages Area */}
        <div className="flex-1 p-6 overflow-y-auto">
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-3 rounded-lg ${
                    message.sender === 'user'
                      ? 'bg-orange-600 text-white'
                      : 'bg-gray-100 text-gray-900'
                  }`}
                >
                  <p className="text-sm">{message.text}</p>
                  <p className={`text-xs mt-1 ${
                    message.sender === 'user' ? 'text-orange-200' : 'text-gray-500'
                  }`}>
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))}
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
              placeholder="Ask your AI coach anything..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
            <button
              onClick={handleSendMessage}
              disabled={!inputText.trim()}
              className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                inputText.trim()
                  ? 'bg-orange-600 text-white hover:bg-orange-700'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              Send
            </button>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <button
          onClick={() => setInputText("I'm feeling unmotivated today. Can you help?")}
          className="p-4 bg-blue-50 rounded-lg text-left hover:bg-blue-100 transition-colors"
        >
          <div className="text-blue-600 font-medium">💙 Need Motivation</div>
          <div className="text-sm text-blue-500 mt-1">Get a motivational boost</div>
        </button>
        <button
          onClick={() => setInputText("Can you help me plan my day?")}
          className="p-4 bg-green-50 rounded-lg text-left hover:bg-green-100 transition-colors"
        >
          <div className="text-green-600 font-medium">📅 Plan My Day</div>
          <div className="text-sm text-green-500 mt-1">Create a focused schedule</div>
        </button>
        <button
          onClick={() => setInputText("I'm struggling with my goals. What should I do?")}
          className="p-4 bg-purple-50 rounded-lg text-left hover:bg-purple-100 transition-colors"
        >
          <div className="text-purple-600 font-medium">🎯 Goal Guidance</div>
          <div className="text-sm text-purple-500 mt-1">Get help with your goals</div>
        </button>
      </div>
    </div>
  );
};

export default CoachPage; 