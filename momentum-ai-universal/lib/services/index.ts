import { supabase } from '../supabase';
import { getApiUrl } from '../config';
import { handleError } from '../errors';
import universalStorage from '../storage';

// Message Services
export const messageServices = {
  async sendMessage(message: string) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No authenticated user');

      // Save message to database
      const { data, error } = await supabase
        .from('messages')
        .insert([{
          content: message,
          user_id: user.id,
          created_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  },

  async getAll() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No authenticated user');

      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error getting messages:', error);
      return [];
    }
  }
};

// Goal Services
export const goalServices = {
  async create(goalData: any) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No authenticated user');

      const { data, error } = await supabase
        .from('goals')
        .insert([{
          ...goalData,
          user_id: user.id,
          created_at: new Date().toISOString(),
          status: 'active'
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating goal:', error);
      throw error;
    }
  },

  async getAll() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No authenticated user');

      const { data, error } = await supabase
        .from('goals')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching goals:', error);
      return [];
    }
  }
};

// Checkin Services
export const checkinServices = {
  async create(checkinData: any) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No authenticated user');

      const { data, error } = await supabase
        .from('checkins')
        .insert([{
          ...checkinData,
          user_id: user.id,
          created_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating checkin:', error);
      throw error;
    }
  },

  async getRecent(limit = 30) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No authenticated user');

      const { data, error } = await supabase
        .from('checkins')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error getting recent checkins:', error);
      return [];
    }
  },

  async getAll() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No authenticated user');

      const { data, error } = await supabase
        .from('checkins')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error getting all checkins:', error);
      return [];
    }
  }
};

// Coach Services
export const coachServices = {
  async getCoachPersonality() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No authenticated user');

      const { data, error } = await supabase
        .from('coach_settings')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      
      return data || {
        name: 'Alex',
        personality: 'Empathetic AI coach focused on emotional support',
        style: 'supportive'
      };
    } catch (error) {
      console.error('Error getting coach personality:', error);
      return null;
    }
  }
}; 