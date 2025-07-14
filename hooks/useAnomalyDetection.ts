import { useState } from 'react';

export function useAnomalyDetection() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const detectAnomaly = async (data: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/ai/analyze-anomaly', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ logs: [data] }),
      });
      
      if (!response.ok) {
        throw new Error('Anomaly detection failed');
      }
      
      const result = await response.json();
      return result;
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    detectAnomaly,
    loading,
    error,
  };
} 