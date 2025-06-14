import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, SafeAreaView, RefreshControl } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation';
import api from '../api/axios';
import { LinearGradient } from 'expo-linear-gradient';
import MomentumLogo from '../components/MomentumLogo';

type HomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Home'>;

interface Props {
  navigation: HomeScreenNavigationProp;
}

interface Prompt {
  id: string;
  text: string;
  category: string;
}

export default function HomeScreen({ navigation }: Props) {
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchPrompts = async () => {
    try {
      // Mock data for now - replace with actual API call
      const mockPrompts: Prompt[] = [
        { id: '1', text: 'What are three things you want to accomplish today?', category: 'Goals' },
        { id: '2', text: 'How did you handle challenges yesterday?', category: 'Reflection' },
        { id: '3', text: 'What would make today feel successful?', category: 'Motivation' },
        { id: '4', text: 'What habit are you building this week?', category: 'Habits' },
        { id: '5', text: 'How can you support someone else today?', category: 'Community' },
      ];
      setPrompts(mockPrompts);
    } catch (error) {
      console.log('Error fetching prompts:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchPrompts();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchPrompts();
  };

  const renderPrompt = ({ item }: { item: Prompt }) => (
    <TouchableOpacity 
      style={styles.promptCard}
      onPress={() => navigation.navigate('Chat', { initialPrompt: item.text })}
    >
      <View style={styles.promptHeader}>
        <Text style={styles.promptCategory}>{item.category}</Text>
      </View>
      <Text style={styles.promptText}>{item.text}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#4F46E5', '#7C3AED']}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.headerContent}>
          <MomentumLogo size={50} color="#fff" />
          <Text style={styles.headerTitle}>Momentum AI</Text>
        </View>
        <Text style={styles.headerSubtitle}>Today's Reflection Prompts</Text>
      </LinearGradient>

      <FlatList
        data={prompts}
        keyExtractor={(item) => item.id}
        renderItem={renderPrompt}
        style={styles.list}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      />

      <View style={styles.bottomNav}>
        <TouchableOpacity 
          style={styles.navButton}
          onPress={() => navigation.navigate('Chat', {})}
        >
          <Text style={styles.navButtonText}>💬 Ask AI</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.navButton}
          onPress={() => navigation.navigate('History')}
        >
          <Text style={styles.navButtonText}>📚 History</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.navButton}
          onPress={() => navigation.navigate('Profile')}
        >
          <Text style={styles.navButtonText}>👤 Profile</Text>
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
    padding: 20,
    paddingTop: 40,
    alignItems: 'center',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginLeft: 12,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#E0E7FF',
  },
  list: {
    flex: 1,
  },
  listContent: {
    padding: 16,
    paddingBottom: 100,
  },
  promptCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  promptHeader: {
    marginBottom: 8,
  },
  promptCategory: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4F46E5',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  promptText: {
    fontSize: 16,
    color: '#1F2937',
    lineHeight: 24,
  },
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  navButton: {
    flex: 1,
    backgroundColor: '#4F46E5',
    paddingVertical: 12,
    borderRadius: 8,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  navButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
}); 