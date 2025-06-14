import { useState, useEffect } from 'react';
import { Goal } from '@/types';

export function useGoals() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchGoals = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/goals');
      
      if (!response.ok) {
        throw new Error('Failed to fetch goals');
      }
      
      const data = await response.json();
      setGoals(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const createGoal = async (goalData: {
    title: string;
    description: string;
    emotionalContext?: string;
    deadline?: string;
    habits?: string[];
  }) => {
    try {
      const response = await fetch('/api/goals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(goalData),
      });

      if (!response.ok) {
        throw new Error('Failed to create goal');
      }

      const newGoal = await response.json();
      setGoals(prev => [newGoal, ...prev]);
      return newGoal;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create goal');
      throw err;
    }
  };

  const updateGoal = async (goalId: string, updates: Partial<Goal>) => {
    try {
      const response = await fetch('/api/goals', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: goalId, ...updates }),
      });

      if (!response.ok) {
        throw new Error('Failed to update goal');
      }

      const updatedGoal = await response.json();
      setGoals(prev => prev.map(goal => 
        goal.id === goalId ? updatedGoal : goal
      ));
      return updatedGoal;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update goal');
      throw err;
    }
  };

  const submitCheckIn = async (goalId: string, checkInData: {
    completedHabits: string[];
    mood?: number;
    notes?: string;
    motivationLevel?: number;
  }) => {
    try {
      const response = await fetch('/api/checkins', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ goalId, ...checkInData }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit check-in');
      }

      const { checkIn, updatedGoal } = await response.json();
      
      // Update the goal in our state
      setGoals(prev => prev.map(goal => 
        goal.id === goalId ? { ...goal, ...updatedGoal } : goal
      ));
      
      return { checkIn, updatedGoal };
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit check-in');
      throw err;
    }
  };

  useEffect(() => {
    fetchGoals();
  }, []);

  return {
    goals,
    loading,
    error,
    createGoal,
    updateGoal,
    submitCheckIn,
    refetch: fetchGoals,
  };
} 