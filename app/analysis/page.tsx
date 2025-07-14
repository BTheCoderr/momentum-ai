'use client';

import { AIAnalysisHub } from '../../components/AIAnalysisHub';

export default function AnalysisPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">AI Analysis Dashboard</h1>
      <AIAnalysisHub />
    </div>
  );
} 