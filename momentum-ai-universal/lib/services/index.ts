import { supabase } from '../supabase';
import { aiService } from '../ai-service';
import { ragClient } from '../rag-client';
import { showToast } from '../utils';
import { AuthenticationError } from '../errors';

// Service initialization
export async function initializeServices() {
  try {
    // Initialize AI service
    await aiService.initialize();
    
    // Test Supabase connection
    const { data, error } = await supabase.from('checkins').select('count').limit(1);
    if (error) throw error;
    
    console.log('✅ Services initialized successfully');
    return true;
  } catch (error) {
    console.error('❌ Service initialization error:', error);
    return false;
  }
}

// Message Services
export const messageServices = {
  async getAll() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new AuthenticationError('No authenticated user');

      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('user_id', user.id)
        .order('timestamp', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error getting messages:', error);
      return [];
    }
  },

  async sendMessage(message: string) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new AuthenticationError('No authenticated user');

      // First try RAG-enhanced response
      try {
        const response = await ragClient.getContextualReply(user.id, message, 'general');
        
        // Save both messages
        const { data, error } = await supabase.from('messages').insert([
          {
            user_id: user.id,
            content: message,
            sender: 'user',
            timestamp: new Date().toISOString()
          },
          {
            user_id: user.id,
            content: response.response,
            sender: 'ai',
            timestamp: new Date().toISOString(),
            metadata: {
              context_used: response.context_used,
              confidence: response.confidence,
              coaching_type: response.coaching_type
            }
          }
        ]);

        if (error) throw error;
        return response.response;
      } catch (ragError) {
        console.error('RAG service error:', ragError);
        
        // Fallback to simple response
        const fallbackResponse = "I'm here to help! What's on your mind?";
        
        const { data, error } = await supabase.from('messages').insert([
          {
            user_id: user.id,
            content: message,
            sender: 'user',
            timestamp: new Date().toISOString()
          },
          {
            user_id: user.id,
            content: fallbackResponse,
            sender: 'ai',
            timestamp: new Date().toISOString()
          }
        ]);

        if (error) throw error;
        return fallbackResponse;
      }
    } catch (error) {
      console.error('Error sending message:', error);
      showToast('Error sending message');
      throw error;
    }
  }
};

// Coach Services
export const coachServices = {
  async getCoachPersonality() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new AuthenticationError('No authenticated user');

      const { data, error } = await supabase
        .from('coach_settings')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      
      return data || {
        name: 'Alex',
        personality: 'Empathetic AI coach focused on emotional support',
        style: 'supportive',
        primary_style: 'encouraging',
        communication_preferences: {
          formality: 40,
          directness: 50,
          enthusiasm: 70,
          supportiveness: 80
        },
        response_length: 'balanced',
        use_emojis: true,
        use_humor: false
      };
    } catch (error) {
      console.error('Error getting coach personality:', error);
      return null;
    }
  },

  async saveCoachPersonality(settings: any) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new AuthenticationError('No authenticated user');

      const { data, error } = await supabase
        .from('coach_settings')
        .upsert({
          user_id: user.id,
          ...settings
        });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error saving coach personality:', error);
      throw error;
    }
  }
};

// User Profile Services
export const userProfileServices = {
  async get() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new AuthenticationError('No authenticated user');

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error getting user profile:', error);
      return null;
    }
  },

  async update(profile: any) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new AuthenticationError('No authenticated user');

      const { data, error } = await supabase
        .from('profiles')
        .update(profile)
        .eq('id', user.id);

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }
  }
};

export { initializeServices as default }; 