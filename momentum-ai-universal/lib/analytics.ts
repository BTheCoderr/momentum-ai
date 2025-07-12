import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from './supabase';
import universalStorage from './storage';

// Generate a proper UUID v4
function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// Analytics events
export type AnalyticsEvent = 
  | 'app_launched'
  | 'user_signed_up'
  | 'user_signed_in'
  | 'goal_created'
  | 'checkin_completed'
  | 'message_sent'
  | 'insight_viewed'
  | 'share_progress'
  | 'coach_selected'
  | 'screen_viewed';

class AnalyticsService {
  private userId: string | null = null;
  private sessionId: string;
  private isInitialized = false;

  constructor() {
    this.sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  async initialize() {
    if (this.isInitialized) return;
    
    try {
      // Try to get authenticated user first
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user?.id) {
        this.userId = user.id;
        await universalStorage.setItem('userId', user.id);
      } else {
        // Check if we have a stored user ID
        const storedUserId = await universalStorage.getItem('userId');
        
        if (storedUserId && this.isValidUUID(storedUserId)) {
          this.userId = storedUserId;
        } else {
          // Generate a proper UUID for anonymous users
          const newUserId = generateUUID();
          this.userId = newUserId;
          await universalStorage.setItem('userId', newUserId);
        }
      }
      
      this.isInitialized = true;
      console.log('📊 Analytics initialized with user ID:', this.userId);
    } catch (error) {
      console.error('❌ Analytics initialization failed:', error);
      // Fallback to generating a new UUID
      const fallbackUserId = generateUUID();
      this.userId = fallbackUserId;
      await universalStorage.setItem('userId', fallbackUserId);
      this.isInitialized = true;
    }
  }

  private isValidUUID(uuid: string): boolean {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
  }

  async setUserId(userId: string) {
    if (!this.isValidUUID(userId)) {
      console.warn('⚠️ Invalid UUID provided to setUserId:', userId);
      return;
    }
    
    this.userId = userId;
    await universalStorage.setItem('userId', userId);
    console.log('📊 Analytics user ID updated:', userId);
  }

  async track(event: AnalyticsEvent, properties: Record<string, any> = {}) {
    if (!this.isInitialized) {
      await this.initialize();
    }

    const eventData = {
      event,
      userId: this.userId,
      sessionId: this.sessionId,
      timestamp: new Date().toISOString(),
      platform: 'mobile',
      version: '1.0.0',
      ...properties
    };

    try {
      console.log(`📊 [Analytics] ${event}:`, eventData);
      
      // Store locally for now (can be sent to analytics service later)
      const events = await this.getStoredEvents();
      events.push(eventData);
      
      // Keep only last 100 events
      if (events.length > 100) {
        events.splice(0, events.length - 100);
      }
      
      await AsyncStorage.setItem('analytics_events', JSON.stringify(events));
    } catch (error) {
      console.error('❌ Analytics tracking failed:', error);
    }
  }

  private async getStoredEvents(): Promise<any[]> {
    try {
      const stored = await AsyncStorage.getItem('analytics_events');
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('❌ Failed to get stored events:', error);
      return [];
    }
  }

  async getEvents(): Promise<any[]> {
    return this.getStoredEvents();
  }

  async clearEvents() {
    try {
      await AsyncStorage.removeItem('analytics_events');
    } catch (error) {
      console.error('❌ Failed to clear events:', error);
    }
  }

  getUserId(): string | null {
    return this.userId;
  }

  getSessionId(): string {
    return this.sessionId;
  }
}

const analytics = new AnalyticsService();

export default analytics;

// Convenience functions
export const track = (event: AnalyticsEvent, properties?: Record<string, any>) => {
  return analytics.track(event, properties);
};

export const setUserId = (userId: string) => {
  return analytics.setUserId(userId);
};

export const getUserId = () => {
  return analytics.getUserId();
};

export const getSessionId = () => {
  return analytics.getSessionId();
};