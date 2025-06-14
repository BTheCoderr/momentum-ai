import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Alert,
  RefreshControl,
  Modal,
  TextInput,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SvgXml } from 'react-native-svg';
import { supabase, Goal } from './lib/supabase';

// Import the logo SVG content
const logoSvg = `<svg width="40" height="40" viewBox="0 0 400 400" fill="none" xmlns="http://www.w3.org/2000/svg">
<defs>
<linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="100%">
<stop offset="0%" style="stop-color:#2563EB;stop-opacity:1" />
<stop offset="100%" style="stop-color:#7C3AED;stop-opacity:1" />
</linearGradient>
</defs>
<path d="M50 150 L150 50 L250 150 L200 150 L200 200 L300 100 L350 150 L350 300 L300 300 L300 200 L200 300 L150 250 L100 300 L50 250 Z" fill="url(#gradient1)"/>
<rect x="320" y="180" width="20" height="20" fill="url(#gradient1)"/>
<rect x="360" y="160" width="15" height="15" fill="url(#gradient1)"/>
<path d="M50 320 Q 150 280 250 320" stroke="url(#gradient1)" stroke-width="8" fill="none"/>
</svg>`;

// Enhanced icons using text (we'll upgrade to proper icons later)
const Icon = ({ name, size = 24, color = '#000' }: { name: string; size?: number; color?: string }) => {
  const icons: { [key: string]: string } = {
    target: '🎯',
    brain: '🧠',
    users: '👥',
    trophy: '🏆',
    chart: '📊',
    plus: '➕',
    home: '🏠',
    settings: '⚙️',
    lightbulb: '💡',
    link: '🔗',
    star: '⭐',
    fire: '🔥',
    calendar: '📅',
    bell: '🔔',
    check: '✅',
    trending: '📈',
    medal: '🏅',
    rocket: '🚀',
  };
  
  return (
    <Text style={{ fontSize: size, color }}>
      {icons[name] || '❓'}
    </Text>
  );
};

export default function App() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showCreateGoalModal, setShowCreateGoalModal] = useState(false);
  const [newGoalTitle, setNewGoalTitle] = useState('');
  const [newGoalDescription, setNewGoalDescription] = useState('');
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [showProgressModal, setShowProgressModal] = useState(false);
  const [selectedGoalForProgress, setSelectedGoalForProgress] = useState<Goal | null>(null);
  const [newProgress, setNewProgress] = useState('');
  const [showDailyCheckIn, setShowDailyCheckIn] = useState(false);
  const [todaysHabits, setTodaysHabits] = useState<{[goalId: string]: string[]}>({});
  const [completedHabits, setCompletedHabits] = useState<{[habitId: string]: boolean}>({});
  const [checkInStreak, setCheckInStreak] = useState(7); // Mock streak
  const [lastCheckIn, setLastCheckIn] = useState<string | null>(null);
  const [chatMessages, setChatMessages] = useState<Array<{id: string, text: string, sender: 'user' | 'ai', timestamp: Date}>>([
    {
      id: '1',
      text: "Hi! I'm your AI accountability coach. How can I help you stay on track with your goals today?",
      sender: 'ai',
      timestamp: new Date()
    }
  ]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [isAITyping, setIsAITyping] = useState(false);

  // Authentication state
  const [user, setUser] = useState<any>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [authForm, setAuthForm] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: ''
  });
  const [authLoading, setAuthLoading] = useState(false);

  // Check for existing session on app start
  useEffect(() => {
    checkUserSession();
  }, []);

  const checkUserSession = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user);
      }
    } catch (error) {
      console.log('Session check error:', error);
    }
  };

  const handleAuth = async () => {
    if (authLoading) return;
    setAuthLoading(true);

    try {
      if (authMode === 'signup') {
        if (authForm.password !== authForm.confirmPassword) {
          Alert.alert('Error', 'Passwords do not match');
          return;
        }
        
        const { data, error } = await supabase.auth.signUp({
          email: authForm.email,
          password: authForm.password,
          options: {
            data: {
              name: authForm.name
            }
          }
        });
        
        if (error) throw error;
        
        if (data.user) {
          Alert.alert('Success', 'Account created! Please check your email to verify your account.');
          setAuthMode('login');
        }
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: authForm.email,
          password: authForm.password,
        });
        
        if (error) throw error;
        
        if (data.user) {
          setUser(data.user);
          setShowAuthModal(false);
          setAuthForm({ email: '', password: '', confirmPassword: '', name: '' });
        }
      }
    } catch (error: any) {
      Alert.alert('Authentication Error', error.message);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setActiveTab('dashboard');
    } catch (error: any) {
      Alert.alert('Sign Out Error', error.message);
    }
  };

  // Tab navigation with swipe gestures
  const tabs = ['dashboard', 'goals', 'coach', 'community', 'achievements', 'settings'];
  
  const getNextTab = (direction: 'left' | 'right') => {
    const currentIndex = tabs.indexOf(activeTab);
    if (direction === 'left' && currentIndex > 0) {
      return tabs[currentIndex - 1];
    }
    if (direction === 'right' && currentIndex < tabs.length - 1) {
      return tabs[currentIndex + 1];
    }
    return activeTab;
  };

  const handleSwipe = (direction: 'left' | 'right') => {
    const nextTab = getNextTab(direction);
    if (nextTab !== activeTab) {
      setActiveTab(nextTab);
    }
  };

  const fetchGoals = async () => {
    try {
      const { data, error } = await supabase
        .from('goals')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching goals:', error);
        Alert.alert('Error', 'Failed to fetch goals');
        return;
      }

      setGoals(data || []);
    } catch (error) {
      console.error('Error:', error);
      Alert.alert('Error', 'Something went wrong');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchGoals();
  };

  useEffect(() => {
    fetchGoals();
  }, []);

  const createGoal = async () => {
    if (!newGoalTitle.trim()) {
      Alert.alert('Error', 'Please enter a goal title');
      return;
    }

    try {
      const goalData = {
        id: `mobile-goal-${Date.now()}`,
        title: newGoalTitle.trim(),
        description: newGoalDescription.trim() || 'Created from mobile app',
        emotional_context: 'Mobile goal creation',
        progress: 0,
        status: 'active',
        user_id: 'mobile-user',
      };

      const { error } = await supabase
        .from('goals')
        .insert([goalData]);

      if (error) {
        console.error('Error creating goal:', error);
        Alert.alert('Error', 'Failed to create goal');
        return;
      }

      Alert.alert('Success!', 'Goal created successfully');
      setNewGoalTitle('');
      setNewGoalDescription('');
      setShowCreateGoalModal(false);
      fetchGoals();
    } catch (error) {
      console.error('Error:', error);
      Alert.alert('Error', 'Something went wrong');
    }
  };

  const updateGoal = async () => {
    if (!editingGoal || !newGoalTitle.trim()) {
      Alert.alert('Error', 'Please enter a goal title');
      return;
    }

    try {
      const { error } = await supabase
        .from('goals')
        .update({
          title: newGoalTitle.trim(),
          description: newGoalDescription.trim(),
          updated_at: new Date().toISOString()
        })
        .eq('id', editingGoal.id);

      if (error) {
        console.error('Error updating goal:', error);
        Alert.alert('Error', 'Failed to update goal');
        return;
      }

      Alert.alert('Success!', 'Goal updated successfully');
      setEditingGoal(null);
      setNewGoalTitle('');
      setNewGoalDescription('');
      setShowCreateGoalModal(false);
      fetchGoals();
    } catch (error) {
      console.error('Error:', error);
      Alert.alert('Error', 'Something went wrong');
    }
  };

  const deleteGoal = async (goal: Goal) => {
    Alert.alert(
      'Delete Goal',
      `Are you sure you want to delete "${goal.title}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const { error } = await supabase
                .from('goals')
                .delete()
                .eq('id', goal.id);

              if (error) {
                console.error('Error deleting goal:', error);
                Alert.alert('Error', 'Failed to delete goal');
                return;
              }

              Alert.alert('Success!', 'Goal deleted successfully');
              fetchGoals();
            } catch (error) {
              console.error('Error:', error);
              Alert.alert('Error', 'Something went wrong');
            }
          }
        }
      ]
    );
  };

  const updateProgress = async () => {
    if (!selectedGoalForProgress || !newProgress.trim()) {
      Alert.alert('Error', 'Please enter a progress value');
      return;
    }

    const progressValue = parseInt(newProgress);
    if (isNaN(progressValue) || progressValue < 0 || progressValue > 100) {
      Alert.alert('Error', 'Please enter a valid progress value (0-100)');
      return;
    }

    try {
      const { error } = await supabase
        .from('goals')
        .update({
          progress: progressValue,
          updated_at: new Date().toISOString()
        })
        .eq('id', selectedGoalForProgress.id);

      if (error) {
        console.error('Error updating progress:', error);
        Alert.alert('Error', 'Failed to update progress');
        return;
      }

      Alert.alert('Success!', 'Progress updated successfully');
      setSelectedGoalForProgress(null);
      setNewProgress('');
      setShowProgressModal(false);
      fetchGoals();
    } catch (error) {
      console.error('Error:', error);
      Alert.alert('Error', 'Something went wrong');
    }
  };

  const handleEditGoal = (goal: Goal) => {
    setEditingGoal(goal);
    setNewGoalTitle(goal.title);
    setNewGoalDescription(goal.description || '');
    setShowCreateGoalModal(true);
  };

  const handleUpdateProgress = (goal: Goal) => {
    setSelectedGoalForProgress(goal);
    setNewProgress(goal.progress.toString());
    setShowProgressModal(true);
  };

  // Mock habits for goals (in real app, this would come from database)
  const getHabitsForGoal = (goalId: string) => {
    const mockHabits = [
      { id: `${goalId}-habit-1`, text: 'Complete daily practice session', goalId },
      { id: `${goalId}-habit-2`, text: 'Review progress and take notes', goalId },
      { id: `${goalId}-habit-3`, text: 'Share update with accountability partner', goalId },
    ];
    return mockHabits;
  };

  const getAllTodaysHabits = () => {
    const allHabits: any[] = [];
    goals.forEach(goal => {
      const habits = getHabitsForGoal(goal.id);
      habits.forEach(habit => {
        allHabits.push({
          ...habit,
          goalTitle: goal.title,
          goalId: goal.id
        });
      });
    });
    return allHabits;
  };

  const handleHabitToggle = (habitId: string) => {
    setCompletedHabits(prev => ({
      ...prev,
      [habitId]: !prev[habitId]
    }));
  };

  const submitDailyCheckIn = async () => {
    try {
      const completedHabitIds = Object.keys(completedHabits).filter(id => completedHabits[id]);
      const totalHabits = getAllTodaysHabits().length;
      const completedCount = completedHabitIds.length;
      
      if (completedCount === 0) {
        Alert.alert('No Progress', 'Please complete at least one habit before checking in.');
        return;
      }

      // Update goal progress based on completed habits
      const habitsByGoal = {};
      getAllTodaysHabits().forEach(habit => {
        if (!habitsByGoal[habit.goalId]) {
          habitsByGoal[habit.goalId] = { total: 0, completed: 0 };
        }
        habitsByGoal[habit.goalId].total++;
        if (completedHabits[habit.id]) {
          habitsByGoal[habit.goalId].completed++;
        }
      });

      // Update each goal's progress
      for (const [goalId, stats] of Object.entries(habitsByGoal)) {
        const goal = goals.find(g => g.id === goalId);
        if (goal) {
          const habitProgress = (stats.completed / stats.total) * 20; // Each day contributes ~20% max
          const newProgress = Math.min(100, goal.progress + habitProgress);
          
          await supabase
            .from('goals')
            .update({
              progress: Math.round(newProgress),
              updated_at: new Date().toISOString()
            })
            .eq('id', goalId);
        }
      }

      // Update streak and last check-in
      const today = new Date().toISOString().split('T')[0];
      setLastCheckIn(today);
      setCheckInStreak(prev => prev + 1);

      Alert.alert(
        '🎉 Check-in Complete!', 
        `Great job! You completed ${completedCount} out of ${totalHabits} habits today. Keep up the momentum!`
      );
      
      setShowDailyCheckIn(false);
      setCompletedHabits({});
      fetchGoals(); // Refresh to show updated progress
    } catch (error) {
      console.error('Error submitting check-in:', error);
      Alert.alert('Error', 'Failed to submit check-in. Please try again.');
    }
  };

  const sendMessage = async () => {
    if (!currentMessage.trim()) return;

    const userMessage = {
      id: Date.now().toString(),
      text: currentMessage,
      sender: 'user' as const,
      timestamp: new Date()
    };

    setChatMessages(prev => [...prev, userMessage]);
    setCurrentMessage('');
    setIsAITyping(true);

    // Simulate AI response
    setTimeout(() => {
      const aiResponses = [
        "That's a great goal! Let me help you break it down into actionable steps.",
        "I noticed you've been consistent with your check-ins. That's excellent progress!",
        "Based on your patterns, I recommend focusing on your morning routine first.",
        "Remember, small consistent actions lead to big results. You've got this!",
        "Let's set up a specific plan. What time works best for you to work on this goal?",
        "Your consistency with the 7-day streak shows real commitment. How can I support your next milestone?"
      ];
      
      const aiMessage = {
        id: (Date.now() + 1).toString(),
        text: aiResponses[Math.floor(Math.random() * aiResponses.length)],
        sender: 'ai' as const,
        timestamp: new Date()
      };

      setChatMessages(prev => [...prev, aiMessage]);
      setIsAITyping(false);
    }, 1500);
  };

  const renderDashboard = () => (
    <ScrollView
      style={styles.content}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Header Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Icon name="target" size={20} color="#3B82F6" />
          <Text style={styles.statNumber}>{goals.length}</Text>
          <Text style={styles.statLabel}>Active Goals</Text>
        </View>
        
        <View style={styles.statCard}>
          <Icon name="chart" size={20} color="#10B981" />
          <Text style={styles.statNumber}>
            {goals.length > 0 ? Math.round(goals.reduce((acc, goal) => acc + goal.progress, 0) / goals.length) : 0}%
          </Text>
          <Text style={styles.statLabel}>Avg Progress</Text>
        </View>
        
        <View style={styles.statCard}>
          <Icon name="fire" size={20} color="#F59E0B" />
          <Text style={styles.statNumber}>{checkInStreak}</Text>
          <Text style={styles.statLabel}>Day Streak</Text>
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.quickActions}>
          <TouchableOpacity 
            style={styles.quickActionCard}
            onPress={() => setShowCreateGoalModal(true)}
          >
            <Icon name="plus" size={24} color="#4F46E5" />
            <Text style={styles.quickActionText}>New Goal</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.quickActionCard}
            onPress={() => setShowDailyCheckIn(true)}
          >
            <Icon name="check" size={24} color="#10B981" />
            <Text style={styles.quickActionText}>Check In</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.quickActionCard}>
            <Icon name="brain" size={24} color="#8B5CF6" />
            <Text style={styles.quickActionText}>AI Coach</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.quickActionCard}>
            <Icon name="trophy" size={24} color="#F59E0B" />
            <Text style={styles.quickActionText}>Achievements</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Goals List */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Your Goals</Text>
          <TouchableOpacity onPress={() => setShowCreateGoalModal(true)} style={styles.addButton}>
            <Icon name="plus" size={16} color="#fff" />
          </TouchableOpacity>
        </View>
        
        {goals.map((goal) => (
          <View key={goal.id} style={styles.goalCard}>
            <View style={styles.goalHeader}>
              <Text style={styles.goalTitle}>{goal.title}</Text>
              <Text style={styles.goalProgress}>{goal.progress}%</Text>
            </View>
            <Text style={styles.goalDescription}>{goal.description}</Text>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${goal.progress}%` }]} />
            </View>
            <Text style={styles.goalEmotion}>{goal.emotional_context}</Text>
            
            <View style={styles.goalActions}>
              <TouchableOpacity 
                style={styles.actionButton}
                onPress={() => handleUpdateProgress(goal)}
              >
                <Icon name="trending" size={16} color="#4F46E5" />
                <Text style={styles.actionButtonText}>Update</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.actionButton}
                onPress={() => handleEditGoal(goal)}
              >
                <Icon name="settings" size={16} color="#10B981" />
                <Text style={styles.actionButtonText}>Edit</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.actionButton, styles.deleteButton]}
                onPress={() => deleteGoal(goal)}
              >
                <Text style={{ fontSize: 16, color: '#EF4444' }}>🗑️</Text>
                <Text style={[styles.actionButtonText, { color: '#EF4444' }]}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
        
        {goals.length === 0 && !loading && (
          <View style={styles.emptyState}>
            <Icon name="target" size={48} color="#9CA3AF" />
            <Text style={styles.emptyText}>No goals yet</Text>
            <Text style={styles.emptySubtext}>Tap the + button to create your first goal</Text>
          </View>
        )}
      </View>

      {/* AI Insights */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>AI Insights</Text>
        <View style={styles.insightCard}>
          <View style={styles.insightHeader}>
            <Icon name="brain" size={20} color="#8B5CF6" />
            <Text style={styles.insightTitle}>Peak Performance</Text>
          </View>
          <Text style={styles.insightText}>
            You're 73% more successful when checking in between 9-11 AM
          </Text>
        </View>
        
        <View style={styles.insightCard}>
          <View style={styles.insightHeader}>
            <Icon name="trending" size={20} color="#10B981" />
            <Text style={styles.insightTitle}>Streak Recovery</Text>
          </View>
          <Text style={styles.insightText}>
            You typically recover from setbacks within 2 days when you restart immediately
          </Text>
        </View>
      </View>
    </ScrollView>
  );

  const renderGoals = () => (
    <ScrollView 
      style={styles.content}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
      showsVerticalScrollIndicator={true}
    >
      <TouchableOpacity onPress={() => setShowCreateGoalModal(true)} style={styles.createButton}>
        <Text style={styles.createButtonText}>Create New Goal</Text>
      </TouchableOpacity>
      
      {goals.map((goal) => (
        <View key={goal.id} style={styles.goalCard}>
          <Text style={styles.goalTitle}>{goal.title}</Text>
          <Text style={styles.goalDescription}>{goal.description}</Text>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${goal.progress}%` }]} />
          </View>
          <Text style={styles.goalProgress}>{goal.progress}% Complete</Text>
        </View>
      ))}
      
      {/* Add bottom padding for better scrolling */}
      <View style={{ height: 100 }} />
    </ScrollView>
  );

  const renderAICoach = () => (
    <View style={{ flex: 1 }}>
      {/* Chat Messages */}
      <ScrollView 
        style={styles.chatContainer}
        contentContainerStyle={styles.chatContentContainer}
        showsVerticalScrollIndicator={true}
        bounces={true}
        ref={(ref) => {
          if (ref) {
            setTimeout(() => ref.scrollToEnd({ animated: true }), 100);
          }
        }}
      >
        {chatMessages.map((message) => (
          <View key={message.id} style={[
            styles.messageContainer,
            message.sender === 'user' ? styles.userMessage : styles.aiMessage
          ]}>
            <Text style={[
              styles.messageText,
              message.sender === 'user' ? styles.userMessageText : styles.aiMessageText
            ]}>
              {message.text}
            </Text>
            <Text style={styles.messageTime}>
              {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </Text>
          </View>
        ))}
        
        {isAITyping && (
          <View style={[styles.messageContainer, styles.aiMessage]}>
            <Text style={styles.typingIndicator}>AI is typing...</Text>
          </View>
        )}
      </ScrollView>

      {/* Message Input */}
      <View style={styles.messageInputContainer}>
        <TextInput
          style={styles.messageInput}
          value={currentMessage}
          onChangeText={setCurrentMessage}
          placeholder="Ask your AI coach anything..."
          multiline
          maxLength={500}
        />
        <TouchableOpacity 
          style={styles.sendButton}
          onPress={sendMessage}
          disabled={!currentMessage.trim()}
        >
          <Text style={[styles.sendButtonText, !currentMessage.trim() && styles.sendButtonDisabled]}>
            Send
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderCommunity = () => (
    <ScrollView style={styles.content}>
      <Text style={styles.pageTitle}>Community</Text>
      <View style={styles.communityCard}>
        <Icon name="users" size={32} color="#3B82F6" />
        <Text style={styles.communityTitle}>Join the Momentum Community</Text>
        <Text style={styles.communityText}>
          Connect with like-minded individuals on their goal achievement journey.
        </Text>
      </View>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Leaderboard</Text>
        <View style={styles.leaderboardCard}>
          <View style={styles.leaderboardItem}>
            <Icon name="medal" size={20} color="#F59E0B" />
            <Text style={styles.leaderboardName}>Sarah M.</Text>
            <Text style={styles.leaderboardScore}>2,450 pts</Text>
          </View>
          <View style={styles.leaderboardItem}>
            <Icon name="medal" size={20} color="#9CA3AF" />
            <Text style={styles.leaderboardName}>You</Text>
            <Text style={styles.leaderboardScore}>1,890 pts</Text>
          </View>
          <View style={styles.leaderboardItem}>
            <Icon name="medal" size={20} color="#CD7F32" />
            <Text style={styles.leaderboardName}>Mike R.</Text>
            <Text style={styles.leaderboardScore}>1,720 pts</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );

  const renderAchievements = () => (
    <ScrollView style={styles.content}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recent Achievements</Text>
        
        <View style={styles.achievementCard}>
          <Icon name="fire" size={30} color="#F59E0B" />
          <Text style={styles.achievementTitle}>7-Day Streak</Text>
          <Text style={styles.achievementDesc}>Completed check-ins for 7 consecutive days</Text>
        </View>
        
        <View style={styles.achievementCard}>
          <Icon name="target" size={30} color="#10B981" />
          <Text style={styles.achievementTitle}>Goal Setter</Text>
          <Text style={styles.achievementDesc}>Created your first goal</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Progress Towards Next</Text>
        
        <View style={styles.progressCard}>
          <Icon name="rocket" size={24} color="#8B5CF6" />
          <Text style={styles.progressTitle}>Goal Crusher</Text>
          <Text style={styles.progressDesc}>Complete 5 goals (2/5)</Text>
                     <View style={styles.progressBarContainer}>
             <View style={[styles.progressBarFill, { width: '40%' }]} />
           </View>
        </View>
      </View>
    </ScrollView>
  );

  const renderSettings = () => (
    <ScrollView style={styles.content}>
      {/* Profile Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Profile</Text>
        
        <TouchableOpacity style={styles.settingItem}>
          <Icon name="users" size={20} color="#4F46E5" />
          <Text style={styles.settingText}>Edit Profile</Text>
          <Text style={styles.settingArrow}>›</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.settingItem}>
          <Icon name="bell" size={20} color="#10B981" />
          <Text style={styles.settingText}>Notifications</Text>
          <Text style={styles.settingArrow}>›</Text>
        </TouchableOpacity>
      </View>

      {/* Goal Settings */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Goal Settings</Text>
        
        <TouchableOpacity style={styles.settingItem}>
          <Icon name="calendar" size={20} color="#F59E0B" />
          <Text style={styles.settingText}>Reminder Times</Text>
          <Text style={styles.settingArrow}>›</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.settingItem}>
          <Icon name="chart" size={20} color="#8B5CF6" />
          <Text style={styles.settingText}>Progress Tracking</Text>
          <Text style={styles.settingArrow}>›</Text>
        </TouchableOpacity>
      </View>

      {/* AI Coach Settings */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>AI Coach</Text>
        
        <TouchableOpacity style={styles.settingItem}>
          <Icon name="brain" size={20} color="#EC4899" />
          <Text style={styles.settingText}>Coach Preferences</Text>
          <Text style={styles.settingArrow}>›</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.settingItem}>
          <Icon name="lightbulb" size={20} color="#06B6D4" />
          <Text style={styles.settingText}>Insight Frequency</Text>
          <Text style={styles.settingArrow}>›</Text>
        </TouchableOpacity>
      </View>

      {/* App Settings */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>App Settings</Text>
        
        <TouchableOpacity style={styles.settingItem}>
          <Icon name="link" size={20} color="#6366F1" />
          <Text style={styles.settingText}>Data & Privacy</Text>
          <Text style={styles.settingArrow}>›</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.settingItem}>
          <Text style={{ fontSize: 20 }}>ℹ️</Text>
          <Text style={styles.settingText}>About Momentum AI</Text>
          <Text style={styles.settingArrow}>›</Text>
        </TouchableOpacity>
      </View>

      {/* Authentication Section */}
      <View style={styles.authSection}>
        {user ? (
          <View style={styles.userInfo}>
            <Text style={styles.inputLabel}>Signed in as:</Text>
            <Text style={styles.userEmail}>{user.email}</Text>
            <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
              <Text style={styles.signOutText}>Sign Out</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity 
            style={styles.signInButton} 
            onPress={() => setShowAuthModal(true)}
          >
            <Text style={styles.signInText}>Sign In / Create Account</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Version Info */}
      <View style={styles.versionInfo}>
        <Text style={styles.versionText}>Momentum AI v1.0.0</Text>
        <Text style={styles.versionSubtext}>Your AI Accountability Agent</Text>
      </View>
    </ScrollView>
  );

  const renderIntegrations = () => (
    <ScrollView style={styles.content}>
      <Text style={styles.pageTitle}>Integrations</Text>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Available Integrations</Text>
        
        <View style={styles.integrationCard}>
          <Icon name="calendar" size={24} color="#4285F4" />
          <View style={styles.integrationContent}>
            <Text style={styles.integrationTitle}>Google Calendar</Text>
            <Text style={styles.integrationText}>Sync your goals with calendar events</Text>
          </View>
          <TouchableOpacity style={styles.connectButton}>
            <Text style={styles.connectButtonText}>Connect</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.integrationCard}>
          <Icon name="bell" size={24} color="#FF6B35" />
          <View style={styles.integrationContent}>
            <Text style={styles.integrationTitle}>Slack</Text>
            <Text style={styles.integrationText}>Get goal reminders in Slack</Text>
          </View>
          <TouchableOpacity style={styles.connectButton}>
            <Text style={styles.connectButtonText}>Connect</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#4F46E5" />
      
      {/* Header */}
      <LinearGradient
        colors={['#4F46E5', '#7C3AED']}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.headerContent}>
          <SvgXml xml={logoSvg} width={40} height={40} style={styles.logo} />
          <View style={styles.headerText}>
            <Text style={styles.headerTitle}>Momentum AI</Text>
            <Text style={styles.headerSubtitle}>Your AI Accountability Agent</Text>
          </View>
        </View>
      </LinearGradient>

      {/* Content */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      ) : (
        <>
          {activeTab === 'dashboard' && renderDashboard()}
          {activeTab === 'goals' && renderGoals()}
          {activeTab === 'coach' && renderAICoach()}
          {activeTab === 'community' && renderCommunity()}
          {activeTab === 'achievements' && renderAchievements()}
          {activeTab === 'settings' && renderSettings()}
          {activeTab === 'integrations' && renderIntegrations()}
        </>
      )}

      {/* Create Goal Modal */}
      <Modal
        visible={showCreateGoalModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowCreateGoalModal(false)}>
              <Text style={styles.modalCancel}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Create Goal</Text>
            <TouchableOpacity onPress={editingGoal ? updateGoal : createGoal}>
              <Text style={styles.modalSave}>Save</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.modalContent}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Goal Title</Text>
              <TextInput
                style={styles.textInput}
                value={newGoalTitle}
                onChangeText={setNewGoalTitle}
                placeholder="Enter your goal title"
                autoFocus
              />
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Description (Optional)</Text>
              <TextInput
                style={[styles.textInput, styles.textArea]}
                value={newGoalDescription}
                onChangeText={setNewGoalDescription}
                placeholder="Describe your goal..."
                multiline
                numberOfLines={4}
              />
            </View>
          </View>
        </SafeAreaView>
      </Modal>

      {/* Progress Update Modal */}
      <Modal
        visible={showProgressModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => {
              setShowProgressModal(false);
              setSelectedGoalForProgress(null);
              setNewProgress('');
            }}>
              <Text style={styles.modalCancel}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Update Progress</Text>
            <TouchableOpacity onPress={updateProgress}>
              <Text style={styles.modalSave}>Save</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.modalContent}>
            <Text style={styles.inputLabel}>Goal: {selectedGoalForProgress?.title}</Text>
            <Text style={styles.inputLabel}>Current Progress: {selectedGoalForProgress?.progress}%</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>New Progress (0-100):</Text>
              <TextInput
                style={styles.textInput}
                value={newProgress}
                onChangeText={setNewProgress}
                placeholder="Enter progress percentage"
                keyboardType="numeric"
              />
            </View>
          </View>
        </SafeAreaView>
      </Modal>

      {/* Daily Check-in Modal */}
      <Modal
        visible={showDailyCheckIn}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowDailyCheckIn(false)}>
              <Text style={styles.modalCancel}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Daily Check-in</Text>
            <TouchableOpacity onPress={submitDailyCheckIn}>
              <Text style={styles.modalSave}>Complete</Text>
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.modalContent}>
            {/* Streak Info */}
            <View style={styles.streakCard}>
              <Icon name="fire" size={24} color="#F59E0B" />
              <Text style={styles.streakText}>{checkInStreak} Day Streak</Text>
              <Text style={styles.streakSubtext}>Keep it going!</Text>
            </View>

            {/* Today's Habits */}
            <Text style={styles.checkInSectionTitle}>Today's Focus</Text>
            <Text style={styles.checkInSubtext}>Check off the habits you completed today</Text>
            
            {getAllTodaysHabits().map((habit) => (
              <View key={habit.id} style={styles.habitItem}>
                <TouchableOpacity 
                  style={styles.habitCheckbox}
                  onPress={() => handleHabitToggle(habit.id)}
                >
                  <View style={[
                    styles.checkbox,
                    completedHabits[habit.id] && styles.checkboxChecked
                  ]}>
                    {completedHabits[habit.id] && (
                      <Icon name="check" size={16} color="#fff" />
                    )}
                  </View>
                </TouchableOpacity>
                
                <View style={styles.habitContent}>
                  <Text style={[
                    styles.habitText,
                    completedHabits[habit.id] && styles.habitTextCompleted
                  ]}>
                    {habit.text}
                  </Text>
                  <Text style={styles.habitGoal}>Goal: {habit.goalTitle}</Text>
                </View>
              </View>
            ))}

            {/* Progress Summary */}
            <View style={styles.progressSummary}>
              <Text style={styles.progressSummaryTitle}>Today's Progress</Text>
              <Text style={styles.progressSummaryText}>
                {Object.values(completedHabits).filter(Boolean).length} of {getAllTodaysHabits().length} habits completed
              </Text>
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* Authentication Modal */}
      <Modal
        visible={showAuthModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowAuthModal(false)}>
              <Text style={styles.modalCancel}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>
              {authMode === 'login' ? 'Sign In' : 'Create Account'}
            </Text>
            <TouchableOpacity onPress={handleAuth} disabled={authLoading}>
              <Text style={[styles.modalSave, authLoading && { opacity: 0.5 }]}>
                {authLoading ? 'Loading...' : (authMode === 'login' ? 'Sign In' : 'Sign Up')}
              </Text>
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.modalContent}>
            {authMode === 'signup' && (
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Name</Text>
                <TextInput
                  style={styles.textInput}
                  value={authForm.name}
                  onChangeText={(text) => setAuthForm(prev => ({ ...prev, name: text }))}
                  placeholder="Enter your name"
                  autoCapitalize="words"
                />
              </View>
            )}
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Email</Text>
              <TextInput
                style={styles.textInput}
                value={authForm.email}
                onChangeText={(text) => setAuthForm(prev => ({ ...prev, email: text }))}
                placeholder="Enter your email"
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Password</Text>
              <TextInput
                style={styles.textInput}
                value={authForm.password}
                onChangeText={(text) => setAuthForm(prev => ({ ...prev, password: text }))}
                placeholder="Enter your password"
                secureTextEntry
              />
            </View>
            
            {authMode === 'signup' && (
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Confirm Password</Text>
                <TextInput
                  style={styles.textInput}
                  value={authForm.confirmPassword}
                  onChangeText={(text) => setAuthForm(prev => ({ ...prev, confirmPassword: text }))}
                  placeholder="Confirm your password"
                  secureTextEntry
                />
              </View>
            )}
            
            <TouchableOpacity 
              style={styles.switchAuthMode}
              onPress={() => setAuthMode(authMode === 'login' ? 'signup' : 'login')}
            >
              <Text style={styles.switchAuthText}>
                {authMode === 'login' 
                  ? "Don't have an account? Sign up" 
                  : "Already have an account? Sign in"
                }
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity
          style={[styles.navItem, activeTab === 'dashboard' && styles.navItemActive]}
          onPress={() => setActiveTab('dashboard')}
        >
          <Icon name="home" size={20} color={activeTab === 'dashboard' ? '#4F46E5' : '#9CA3AF'} />
          <Text style={[styles.navText, activeTab === 'dashboard' && styles.navTextActive]}>
            Dashboard
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.navItem, activeTab === 'goals' && styles.navItemActive]}
          onPress={() => setActiveTab('goals')}
        >
          <Icon name="target" size={20} color={activeTab === 'goals' ? '#4F46E5' : '#9CA3AF'} />
          <Text style={[styles.navText, activeTab === 'goals' && styles.navTextActive]}>
            Goals
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.navItem, activeTab === 'coach' && styles.navItemActive]}
          onPress={() => setActiveTab('coach')}
        >
          <Icon name="brain" size={20} color={activeTab === 'coach' ? '#4F46E5' : '#9CA3AF'} />
          <Text style={[styles.navText, activeTab === 'coach' && styles.navTextActive]}>
            AI Coach
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.navItem, activeTab === 'community' && styles.navItemActive]}
          onPress={() => setActiveTab('community')}
        >
          <Icon name="users" size={20} color={activeTab === 'community' ? '#4F46E5' : '#9CA3AF'} />
          <Text style={[styles.navText, activeTab === 'community' && styles.navTextActive]}>
            Community
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.navItem, activeTab === 'achievements' && styles.navItemActive]}
          onPress={() => setActiveTab('achievements')}
        >
          <Icon name="trophy" size={20} color={activeTab === 'achievements' ? '#4F46E5' : '#9CA3AF'} />
          <Text style={[styles.navText, activeTab === 'achievements' && styles.navTextActive]}>
            Awards
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.navItem, activeTab === 'settings' && styles.navItemActive]}
          onPress={() => setActiveTab('settings')}
        >
          <Icon name="settings" size={20} color={activeTab === 'settings' ? '#4F46E5' : '#9CA3AF'} />
          <Text style={[styles.navText, activeTab === 'settings' && styles.navTextActive]}>
            Settings
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    paddingTop: 40,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logo: {
    width: 40,
    height: 40,
    marginRight: 12,
  },
  headerText: {
    flexDirection: 'column',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#E0E7FF',
    marginTop: 4,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#6B7280',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    marginBottom: 24,
  },
  statCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  addButton: {
    backgroundColor: '#4F46E5',
    borderRadius: 20,
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  goalCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  goalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  goalTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    flex: 1,
  },
  goalProgress: {
    fontSize: 14,
    fontWeight: '500',
    color: '#4F46E5',
  },
  goalDescription: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 12,
  },
  progressBar: {
    height: 6,
    backgroundColor: '#E5E7EB',
    borderRadius: 3,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4F46E5',
    borderRadius: 3,
  },
  goalEmotion: {
    fontSize: 12,
    color: '#8B5CF6',
    fontStyle: 'italic',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '500',
    color: '#6B7280',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 8,
    textAlign: 'center',
  },
  insightCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  insightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  insightTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginLeft: 8,
  },
  insightText: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginTop: 20,
    marginBottom: 20,
  },
  createButton: {
    backgroundColor: '#4F46E5',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 20,
  },
  createButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  coachCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  coachTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginTop: 16,
    marginBottom: 8,
  },
  coachText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
  },
  communityCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  communityTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginTop: 16,
    marginBottom: 8,
  },
  communityText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
  },
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingVertical: 8,
    paddingBottom: 20,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
  navItemActive: {
    backgroundColor: '#EEF2FF',
    borderRadius: 8,
    marginHorizontal: 4,
  },
  navText: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 4,
  },
  navTextActive: {
    color: '#4F46E5',
    fontWeight: '500',
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  quickActionCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  quickActionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginTop: 8,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  modalCancel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#6B7280',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    flex: 1,
    textAlign: 'center',
  },
  modalSave: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4F46E5',
  },
  modalContent: {
    padding: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  textArea: {
    height: 120,
    textAlignVertical: 'top',
  },
  leaderboardCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  leaderboardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  leaderboardName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginLeft: 8,
    flex: 1,
  },
  leaderboardScore: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  achievementCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  achievementTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginTop: 12,
    marginBottom: 8,
    textAlign: 'center',
  },
  achievementDesc: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
  progressCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  progressTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  progressDesc: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },
     progressBarContainer: {
     backgroundColor: '#E5E7EB',
     borderRadius: 3,
     height: 6,
     flex: 1,
   },
   progressBarFill: {
     backgroundColor: '#4F46E5',
     borderRadius: 3,
     height: '100%',
   },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  settingText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    flex: 1,
  },
  settingArrow: {
    fontSize: 16,
    fontWeight: '500',
    color: '#6B7280',
  },
  versionInfo: {
    alignItems: 'center',
    padding: 16,
  },
  versionText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  versionSubtext: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 4,
  },
  integrationCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  integrationContent: {
    flex: 1,
    marginLeft: 12,
  },
  integrationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  integrationText: {
    fontSize: 14,
    color: '#6B7280',
  },
  connectButton: {
    backgroundColor: '#4F46E5',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  connectButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  goalActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderRadius: 6,
    backgroundColor: '#F3F4F6',
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 4,
    color: '#4B5563',
  },
  deleteButton: {
    backgroundColor: '#FEF2F2',
  },
  streakCard: {
    backgroundColor: '#FEF3C7',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  streakText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#92400E',
    marginLeft: 8,
  },
  streakSubtext: {
    fontSize: 12,
    color: '#92400E',
    marginLeft: 8,
  },
  checkInSectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  checkInSubtext: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 16,
  },
  habitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  habitCheckbox: {
    marginRight: 12,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#10B981',
    borderColor: '#10B981',
  },
  habitContent: {
    flex: 1,
  },
  habitText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1F2937',
    marginBottom: 4,
  },
  habitTextCompleted: {
    textDecorationLine: 'line-through',
    color: '#6B7280',
  },
  habitGoal: {
    fontSize: 12,
    color: '#8B5CF6',
    fontWeight: '500',
  },
  progressSummary: {
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    alignItems: 'center',
  },
  progressSummaryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  progressSummaryText: {
    fontSize: 14,
    color: '#6B7280',
  },
  chatContainer: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  chatContentContainer: {
    padding: 16,
    paddingBottom: 20,
  },
  messageContainer: {
    marginVertical: 4,
    maxWidth: '80%',
    padding: 12,
    borderRadius: 16,
  },
  userMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#4F46E5',
  },
  aiMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  userMessageText: {
    color: '#fff',
  },
  aiMessageText: {
    color: '#1F2937',
  },
  messageTime: {
    fontSize: 12,
    marginTop: 4,
    opacity: 0.7,
  },
  typingIndicator: {
    fontSize: 14,
    color: '#6B7280',
    fontStyle: 'italic',
  },
  messageInputContainer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    alignItems: 'flex-end',
  },
  messageInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginRight: 12,
    maxHeight: 100,
    fontSize: 16,
  },
  sendButton: {
    backgroundColor: '#4F46E5',
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  sendButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
  switchAuthMode: {
    alignItems: 'center',
    marginTop: 20,
    paddingVertical: 15,
  },
  switchAuthText: {
    color: '#4F46E5',
    fontSize: 16,
    fontWeight: '600',
  },
  authSection: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    marginTop: 20,
  },
  userInfo: {
    alignItems: 'center',
  },
  userEmail: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 10,
  },
  signOutButton: {
    backgroundColor: '#EF4444',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  signOutText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  signInButton: {
    backgroundColor: '#4F46E5',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  signInText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
}); 