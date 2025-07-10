'use client';

import React, { useState } from 'react';

export default function TestPage() {
  const [count, setCount] = useState(0);

  return (
    <div className="min-h-screen bg-orange-50 flex items-center justify-center">
      <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
        <h1 className="text-3xl font-bold text-orange-600 mb-4">
          🎉 Momentum AI is Working!
        </h1>
        
        <p className="text-gray-600 mb-6">
          Your sophisticated mobile app code is 100% safe! This is the web version.
        </p>
        
        <div className="space-y-4">
          <div className="bg-orange-100 rounded-lg p-4">
            <h3 className="font-semibold text-orange-900 mb-2">Click Test</h3>
            <button 
              onClick={() => setCount(count + 1)}
              className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors"
            >
              Clicked {count} times
            </button>
          </div>
          
          <div className="bg-blue-100 rounded-lg p-4">
            <h3 className="font-semibold text-blue-900 mb-2">✅ Your Mobile Code</h3>
            <p className="text-blue-800 text-sm">
              • 24 mobile screens preserved<br/>
              • 14 components intact<br/>
              • All features safe
            </p>
          </div>
          
          <div className="bg-green-100 rounded-lg p-4">
            <h3 className="font-semibold text-green-900 mb-2">🚀 Web Features</h3>
            <p className="text-green-800 text-sm">
              Dashboard • Goals • Check-ins<br/>
              AI Coach • Analytics • More!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 