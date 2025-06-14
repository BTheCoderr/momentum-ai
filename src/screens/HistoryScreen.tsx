import React, { useEffect, useState } from 'react';
import { View, SectionList, Text, StyleSheet, SafeAreaView, TouchableOpacity, RefreshControl } from 'react-native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { RootTabParamList } from '../navigation';
import api from '../api/axios';

type HistoryScreenNavigationProp = BottomTabNavigationProp<RootTabParamList, 'History'>;

interface Props {
  navigation: HistoryScreenNavigationProp;
}

interface Entry {
  id: string;
  date: string;
  content: string;
  type: 'chat' | 'reflection' | 'goal';
  preview: string;
}

interface Section {
  title: string;
  data: Entry[];
}

export default function HistoryScreen({ navigation }: Props) {
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchHistory = async () => {
    try {
      // Mock data for now - replace with actual API call
      const mockSections: Section[] = [
        {
          title: 'Today',
          data: [
            {
              id: '1',
              date: new Date().toISOString(),
              content: 'Had a great conversation about goal setting and daily habits...',
              type: 'chat',
              preview: 'Discussed morning routine and productivity tips'
            },
            {
              id: '2',
              date: new Date().toISOString(),
              content: 'Reflected on yesterday\'s challenges and wins...',
              type: 'reflection',
              preview: 'Identified key areas for improvement'
            }
          ]
        },
        {
          title: 'Yesterday',
          data: [
            {
              id: '3',
              date: new Date(Date.now() - 86400000).toISOString(),
              content: 'Set new fitness goals for the month...',
              type: 'goal',
              preview: 'Created workout schedule and nutrition plan'
            },
            {
              id: '4',
              date: new Date(Date.now() - 86400000).toISOString(),
              content: 'Long chat about work-life balance...',
              type: 'chat',
              preview: 'Explored strategies for managing stress'
            }
          ]
        },
        {
          title: 'This Week',
          data: [
            {
              id: '5',
              date: new Date(Date.now() - 172800000).toISOString(),
              content: 'Weekly reflection on progress and setbacks...',
              type: 'reflection',
              preview: 'Celebrated small wins and learned from challenges'
            }
          ]
        }
      ];
      setSections(mockSections);
    } catch (error) {
      console.log('Error fetching history:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchHistory();
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'chat': return '💬';
      case 'reflection': return '🤔';
      case 'goal': return '🎯';
      default: return '📝';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'chat': return '#4F46E5';
      case 'reflection': return '#059669';
      case 'goal': return '#DC2626';
      default: return '#6B7280';
    }
  };

  const renderEntry = ({ item }: { item: Entry }) => (
    <TouchableOpacity 
      style={styles.entryCard}
      onPress={() => {
        // Navigate to detailed view or chat with this context
        navigation.navigate('Chat', { initialPrompt: `Let's continue our conversation about: ${item.preview}` });
      }}
    >
      <View style={styles.entryHeader}>
        <View style={styles.entryType}>
          <Text style={styles.typeIcon}>{getTypeIcon(item.type)}</Text>
          <Text style={[styles.typeText, { color: getTypeColor(item.type) }]}>
            {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
          </Text>
        </View>
        <Text style={styles.entryTime}>
          {new Date(item.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </Text>
      </View>
      <Text style={styles.entryPreview}>{item.preview}</Text>
      <Text style={styles.entryContent} numberOfLines={2}>
        {item.content}
      </Text>
    </TouchableOpacity>
  );

  const renderSectionHeader = ({ section }: { section: Section }) => (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{section.title}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>History</Text>
        <View style={styles.placeholder} />
      </View>

      <SectionList
        style={styles.list}
        sections={sections}
        keyExtractor={(item) => item.id}
        renderSectionHeader={renderSectionHeader}
        renderItem={renderEntry}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        stickySectionHeadersEnabled={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    fontSize: 16,
    color: '#4F46E5',
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  placeholder: {
    width: 50,
  },
  list: {
    flex: 1,
  },
  listContent: {
    padding: 16,
  },
  sectionHeader: {
    backgroundColor: '#F9FAFB',
    paddingVertical: 8,
    marginTop: 16,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  entryCard: {
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
  entryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  entryType: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  typeIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  typeText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  entryTime: {
    fontSize: 12,
    color: '#6B7280',
  },
  entryPreview: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  entryContent: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
}); 