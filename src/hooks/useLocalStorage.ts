import { useState, useEffect } from 'react';

export function useLocalStorage<T>(key: string, initialValue: T) {
  // State to store our value
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') {
      return initialValue;
    }
    
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  // Return a wrapped version of useState's setter function that persists the new value to localStorage
  const setValue = (value: T | ((val: T) => T)) => {
    try {
      // Allow value to be a function so we have the same API as useState
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      
      // Save state
      setStoredValue(valueToStore);
      
      // Save to local storage
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.warn(`Error setting localStorage key "${key}":`, error);
    }
  };

  return [storedValue, setValue] as const;
}

// Helper hook for goals specifically
export function usePersistedGoals() {
  const [goals, setGoals] = useLocalStorage<any[]>('momentum-ai-goals', []);
  
  const addGoal = (newGoal: any) => {
    const goalWithId = {
      ...newGoal,
      id: `goal-${Date.now()}`,
      progress: 0,
      status: 'active',
      createdAt: new Date().toISOString(),
      habits: newGoal.habits.map((habit: string, index: number) => ({
        id: `habit-${Date.now()}-${index}`,
        text: habit,
        completed: false,
        order: index
      }))
    };
    
    setGoals((prev: any[]) => [...prev, goalWithId]);
    return goalWithId;
  };
  
  const updateGoal = (goalId: string, updates: any) => {
    setGoals((prev: any[]) => 
      prev.map(goal => 
        goal.id === goalId ? { ...goal, ...updates } : goal
      )
    );
  };
  
  return { goals, setGoals, addGoal, updateGoal };
}

// Helper hook for messages specifically  
export function usePersistedMessages() {
  const [messages, setMessages] = useLocalStorage<any[]>('momentum-ai-messages', []);
  
  const addMessage = (message: any) => {
    const messageWithId = {
      ...message,
      id: `msg-${Date.now()}`,
      timestamp: new Date().toISOString()
    };
    
    setMessages((prev: any[]) => [...prev, messageWithId]);
    return messageWithId;
  };
  
  return { messages, setMessages, addMessage };
} 