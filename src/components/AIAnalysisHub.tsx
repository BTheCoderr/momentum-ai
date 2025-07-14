'use client';

import React, { useState, useEffect } from 'react';
import { useAnomalyDetection } from '../hooks/useAnomalyDetection';

interface AnalysisResult {
  type: 'sentiment' | 'personality' | 'forecast' | 'anomaly';
  result: any;
  timestamp: string;
  confidence: number;
}

export function AIAnalysisHub() {
  const [selectedAnalysis, setSelectedAnalysis] = useState<'sentiment' | 'personality' | 'forecast' | 'anomaly'>('sentiment');
  const [results, setResults] = useState<AnalysisResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [input, setInput] = useState('');
  const { detectAnomaly } = useAnomalyDetection();

  const analysisTypes = [
    { id: 'sentiment', label: 'Mood Analysis', icon: '😊', description: 'Analyze emotional tone and sentiment' },
    { id: 'personality', label: 'Personality Insights', icon: '🧠', description: 'Understand behavioral patterns' },
    { id: 'forecast', label: 'Progress Forecast', icon: '📈', description: 'Predict future trends' },
    { id: 'anomaly', label: 'Pattern Detection', icon: '🔍', description: 'Identify unusual patterns' },
  ];

  const handleAnalysis = async () => {
    if (!input.trim()) return;
    
    setLoading(true);
    try {
      let result;
      
      switch (selectedAnalysis) {
        case 'sentiment':
          const response = await fetch('/api/ai/analyze-sentiment', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text: input }),
          });
          result = await response.json();
          break;
          
        case 'personality':
          const personalityResponse = await fetch('/api/ai/analyze-personality', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text: input }),
          });
          result = await personalityResponse.json();
          break;
          
        case 'forecast':
          const forecastResponse = await fetch('/api/ai/forecast', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ timeseries: input }),
          });
          result = await forecastResponse.json();
          break;
          
        case 'anomaly':
          result = await detectAnomaly(input);
          break;
      }
      
      setResults(prev => [{
        type: selectedAnalysis,
        result,
        timestamp: new Date().toISOString(),
        confidence: result.confidence || 0.8,
      }, ...prev]);
      
    } catch (error) {
      console.error('Analysis error:', error);
      // Handle error appropriately
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">🧠 AI Analysis Hub</h2>
      
      {/* Analysis Type Selection */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {analysisTypes.map((type) => (
          <button
            key={type.id}
            onClick={() => setSelectedAnalysis(type.id as any)}
            className={`p-4 rounded-lg border transition-colors ${
              selectedAnalysis === type.id
                ? 'border-blue-500 bg-blue-50 text-blue-700'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="text-2xl mb-2">{type.icon}</div>
            <div className="font-medium mb-1">{type.label}</div>
            <div className="text-sm text-gray-600">{type.description}</div>
          </button>
        ))}
      </div>
      
      {/* Input Section */}
      <div className="mb-6">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={`Enter text for ${selectedAnalysis} analysis...`}
          className="w-full h-32 p-3 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
        />
        <button
          onClick={handleAnalysis}
          disabled={loading || !input.trim()}
          className={`mt-2 px-4 py-2 rounded-lg font-medium transition-colors ${
            loading || !input.trim()
              ? 'bg-gray-100 text-gray-400'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          {loading ? 'Analyzing...' : 'Run Analysis'}
        </button>
      </div>
      
      {/* Results Section */}
      <div className="space-y-4">
        {results.map((result, index) => (
          <div key={index} className="p-4 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <span className="text-xl">
                  {analysisTypes.find(t => t.id === result.type)?.icon}
                </span>
                <span className="font-medium">
                  {analysisTypes.find(t => t.id === result.type)?.label}
                </span>
              </div>
              <div className="text-sm text-gray-500">
                {new Date(result.timestamp).toLocaleString()}
              </div>
            </div>
            <div className="text-gray-600">
              {JSON.stringify(result.result, null, 2)}
            </div>
            <div className="mt-2 text-sm text-gray-500">
              Confidence: {(result.confidence * 100).toFixed(1)}%
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 