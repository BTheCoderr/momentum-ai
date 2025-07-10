import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  TextInput,
  Alert,
  Modal
} from 'react-native';
import { useAuth } from '../hooks/useAuth';
import { 
  getVaultEntries, 
  getVaultStats, 
  suggestVaultEntries,
  addToVault,
  deleteVaultEntry,
  searchVault,
  getAllVaultTags,
  VaultEntry,
  VaultStats,
  suggestedTags
} from '../lib/momentum-vault';

export function MomentumVaultScreen() {
  const { user } = useAuth();
  
  const [entries, setEntries] = useState<VaultEntry[]>([]);
  const [stats, setStats] = useState<VaultStats | null>(null);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [allTags, setAllTags] = useState<string[]>([]);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'checkin' | 'goal' | 'challenge' | 'ritual'>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(true);

  // Add modal state
  const [newHighlight, setNewHighlight] = useState('');
  const [selectedType, setSelectedType] = useState<VaultEntry['entry_type']>('checkin');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [customTag, setCustomTag] = useState('');

  useEffect(() => {
    if (user?.id) {
      loadVaultData();
    }
  }, [user?.id]);

  useEffect(() => {
    if (user?.id && (searchQuery || selectedFilter !== 'all')) {
      performSearch();
    } else if (user?.id) {
      loadEntries();
    }
  }, [searchQuery, selectedFilter, user?.id]);

  const loadVaultData = async () => {
    if (!user?.id) return;
    
    setLoading(true);
    try {
      const [entriesData, statsData, suggestionsData, tagsData] = await Promise.all([
        getVaultEntries(user.id),
        getVaultStats(user.id),
        suggestVaultEntries(user.id),
        getAllVaultTags(user.id)
      ]);
      
      setEntries(entriesData);
      setStats(statsData);
      setSuggestions(suggestionsData);
      setAllTags(tagsData);
    } catch (error) {
      console.error('Error loading vault data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadEntries = async () => {
    if (!user?.id) return;
    
    const filterType = selectedFilter === 'all' ? undefined : selectedFilter;
    const entriesData = await getVaultEntries(user.id, filterType);
    setEntries(entriesData);
  };

  const performSearch = async () => {
    if (!user?.id) return;
    
    const results = await searchVault(user.id, searchQuery);
    const filtered = selectedFilter === 'all' 
      ? results 
      : results.filter(entry => entry.entry_type === selectedFilter);
    
    setEntries(filtered);
  };

  const handleAddToVault = async () => {
    if (!user?.id || !newHighlight.trim()) {
      Alert.alert('Required', 'Please enter a highlight to save.');
      return;
    }

    const finalTags = [...selectedTags];
    if (customTag.trim()) {
      finalTags.push(customTag.trim());
    }

    const entry = await addToVault(
      user.id,
      selectedType,
      'manual_' + Date.now(), // Manual entries get unique ref_id
      newHighlight.trim(),
      finalTags
    );

    if (entry) {
      Alert.alert('Success', 'Added to your Momentum Vault!');
      resetAddModal();
      setShowAddModal(false);
      loadVaultData();
    } else {
      Alert.alert('Error', 'Failed to add to vault. Please try again.');
    }
  };

  const handleDeleteEntry = (entry: VaultEntry) => {
    Alert.alert(
      'Delete Entry',
      'Are you sure you want to remove this from your vault?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const success = await deleteVaultEntry(entry.id);
            if (success) {
              loadVaultData();
            }
          }
        }
      ]
    );
  };

  const handleAcceptSuggestion = async (suggestion: any) => {
    if (!user?.id) return;
    
    const entry = await addToVault(
      user.id,
      suggestion.type,
      suggestion.ref_id,
      suggestion.highlight,
      ['suggested']
    );

    if (entry) {
      Alert.alert('Added! ⭐', 'Great moment saved to your vault.');
      loadVaultData();
    }
  };

  const resetAddModal = () => {
    setNewHighlight('');
    setSelectedType('checkin');
    setSelectedTags([]);
    setCustomTag('');
  };

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return date.toLocaleDateString();
  };

  const getTypeIcon = (type: string) => {
    const icons: Record<string, string> = {
      checkin: '📝',
      goal: '🎯',
      challenge: '🏆',
      ritual: '🔄'
    };
    return icons[type] || '⭐';
  };

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      checkin: '#3B82F6',
      goal: '#10B981',
      challenge: '#F59E0B',
      ritual: '#8B5CF6'
    };
    return colors[type] || '#666';
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading your vault...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>🏛️ Momentum Vault</Text>
        <Text style={styles.subtitle}>Your collection of great moments</Text>
      </View>

      {/* Stats Section */}
      {stats && (
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{stats.total_entries}</Text>
            <Text style={styles.statLabel}>Total Memories</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{stats.recent_entries}</Text>
            <Text style={styles.statLabel}>This Week</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>
              {Math.max(...Object.values(stats.entries_by_type || {}), 0)}
            </Text>
            <Text style={styles.statLabel}>Best Category</Text>
          </View>
        </View>
      )}

      {/* Search and Filters */}
      <View style={styles.controlsContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search your vault..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filtersContainer}>
          {(['all', 'checkin', 'goal', 'challenge', 'ritual'] as const).map(filter => (
            <TouchableOpacity
              key={filter}
              style={[
                styles.filterButton,
                selectedFilter === filter && styles.activeFilterButton
              ]}
              onPress={() => setSelectedFilter(filter)}
            >
              <Text style={[
                styles.filterButtonText,
                selectedFilter === filter && styles.activeFilterButtonText
              ]}>
                {filter === 'all' ? 'All' : filter.charAt(0).toUpperCase() + filter.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Suggestions Banner */}
      {suggestions.length > 0 && (
        <TouchableOpacity
          style={styles.suggestionsBanner}
          onPress={() => setShowSuggestions(true)}
        >
          <Text style={styles.suggestionsText}>
            ✨ {suggestions.length} moments suggested for your vault
          </Text>
        </TouchableOpacity>
      )}

      {/* Entries List */}
      <ScrollView style={styles.entriesContainer}>
        {entries.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>
              Your vault is empty. Start collecting your great moments!
            </Text>
            <TouchableOpacity
              style={styles.addFirstButton}
              onPress={() => setShowAddModal(true)}
            >
              <Text style={styles.addFirstButtonText}>Add Your First Memory</Text>
            </TouchableOpacity>
          </View>
        ) : (
          entries.map(entry => (
            <View key={entry.id} style={styles.entryCard}>
              <View style={styles.entryHeader}>
                <View style={styles.entryTypeContainer}>
                  <Text style={styles.entryTypeIcon}>{getTypeIcon(entry.entry_type)}</Text>
                  <Text style={[styles.entryType, { color: getTypeColor(entry.entry_type) }]}>
                    {entry.entry_type.charAt(0).toUpperCase() + entry.entry_type.slice(1)}
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => handleDeleteEntry(entry)}
                  style={styles.deleteButton}
                >
                  <Text style={styles.deleteButtonText}>🗑️</Text>
                </TouchableOpacity>
              </View>
              
              <Text style={styles.entryHighlight}>{entry.highlight}</Text>
              
              {entry.tags.length > 0 && (
                <View style={styles.tagsContainer}>
                  {entry.tags.map(tag => (
                    <View key={tag} style={styles.tag}>
                      <Text style={styles.tagText}>{tag}</Text>
                    </View>
                  ))}
                </View>
              )}
              
              <Text style={styles.entryDate}>{formatDate(entry.created_at)}</Text>
            </View>
          ))
        )}
      </ScrollView>

      {/* Add Button */}
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => setShowAddModal(true)}
      >
        <Text style={styles.addButtonText}>+ Add Memory</Text>
      </TouchableOpacity>

      {/* Add Modal */}
      <Modal
        visible={showAddModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Add to Vault</Text>
            <TouchableOpacity
              onPress={() => {
                resetAddModal();
                setShowAddModal(false);
              }}
              style={styles.closeButton}
            >
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.modalContent}>
            <Text style={styles.sectionLabel}>What happened?</Text>
            <TextInput
              style={styles.highlightInput}
              placeholder="Describe this great moment..."
              value={newHighlight}
              onChangeText={setNewHighlight}
              multiline
            />
            
            <Text style={styles.sectionLabel}>Type</Text>
            <View style={styles.typeSelector}>
              {(['checkin', 'goal', 'challenge', 'ritual'] as const).map(type => (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.typeOption,
                    selectedType === type && styles.selectedTypeOption
                  ]}
                  onPress={() => setSelectedType(type)}
                >
                  <Text style={styles.typeOptionText}>
                    {getTypeIcon(type)} {type.charAt(0).toUpperCase() + type.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            
            <Text style={styles.sectionLabel}>Tags</Text>
            <View style={styles.tagSelector}>
              {suggestedTags[selectedType].map(tag => (
                <TouchableOpacity
                  key={tag}
                  style={[
                    styles.tagOption,
                    selectedTags.includes(tag) && styles.selectedTagOption
                  ]}
                  onPress={() => toggleTag(tag)}
                >
                  <Text style={[
                    styles.tagOptionText,
                    selectedTags.includes(tag) && styles.selectedTagText
                  ]}>
                    {tag}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            
            <TextInput
              style={styles.customTagInput}
              placeholder="Add custom tag..."
              value={customTag}
              onChangeText={setCustomTag}
            />
            
            <TouchableOpacity
              style={styles.saveButton}
              onPress={handleAddToVault}
            >
              <Text style={styles.saveButtonText}>Save to Vault</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </Modal>

      {/* Suggestions Modal */}
      <Modal
        visible={showSuggestions}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Suggested Memories</Text>
            <TouchableOpacity
              onPress={() => setShowSuggestions(false)}
              style={styles.closeButton}
            >
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.modalContent}>
            {suggestions.map((suggestion, index) => (
              <View key={index} style={styles.suggestionCard}>
                <View style={styles.suggestionHeader}>
                  <Text style={styles.suggestionType}>
                    {getTypeIcon(suggestion.type)} {suggestion.type}
                  </Text>
                  <Text style={styles.suggestionReason}>{suggestion.reason}</Text>
                </View>
                <Text style={styles.suggestionHighlight}>{suggestion.highlight}</Text>
                <TouchableOpacity
                  style={styles.acceptSuggestionButton}
                  onPress={() => handleAcceptSuggestion(suggestion)}
                >
                  <Text style={styles.acceptSuggestionText}>Add to Vault</Text>
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
  header: {
    padding: 20,
    paddingTop: 60,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    padding: 16,
    borderRadius: 12,
    marginHorizontal: 4,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  controlsContainer: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  searchInput: {
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    marginBottom: 12,
  },
  filtersContainer: {
    flexDirection: 'row',
  },
  filterButton: {
    backgroundColor: '#F0F0F0',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
  },
  activeFilterButton: {
    backgroundColor: '#007AFF',
  },
  filterButtonText: {
    fontSize: 14,
    color: '#666',
  },
  activeFilterButtonText: {
    color: '#fff',
  },
  suggestionsBanner: {
    backgroundColor: '#FFF8E1',
    margin: 20,
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#FF9500',
  },
  suggestionsText: {
    fontSize: 14,
    color: '#B8860B',
    fontWeight: '500',
  },
  entriesContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
  },
  addFirstButton: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  addFirstButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  entryCard: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  entryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  entryTypeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  entryTypeIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  entryType: {
    fontSize: 14,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  deleteButton: {
    padding: 4,
  },
  deleteButtonText: {
    fontSize: 16,
  },
  entryHighlight: {
    fontSize: 16,
    lineHeight: 22,
    marginBottom: 12,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  tag: {
    backgroundColor: '#E3F2FD',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginRight: 6,
    marginBottom: 4,
  },
  tagText: {
    fontSize: 12,
    color: '#1976D2',
  },
  entryDate: {
    fontSize: 12,
    color: '#999',
  },
  addButton: {
    backgroundColor: '#007AFF',
    borderRadius: 25,
    padding: 16,
    margin: 20,
    alignItems: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 8,
  },
  closeButtonText: {
    fontSize: 18,
    color: '#666',
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    marginTop: 20,
  },
  highlightInput: {
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  typeSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  typeOption: {
    backgroundColor: '#F0F0F0',
    borderRadius: 8,
    padding: 12,
    marginRight: 8,
    marginBottom: 8,
  },
  selectedTypeOption: {
    backgroundColor: '#007AFF',
  },
  typeOptionText: {
    fontSize: 14,
    color: '#333',
  },
  tagSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tagOption: {
    backgroundColor: '#F0F0F0',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 6,
    marginBottom: 6,
  },
  selectedTagOption: {
    backgroundColor: '#007AFF',
  },
  tagOptionText: {
    fontSize: 12,
    color: '#666',
  },
  selectedTagText: {
    color: '#fff',
  },
  customTagInput: {
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    marginTop: 8,
  },
  saveButton: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 32,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  suggestionCard: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  suggestionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  suggestionType: {
    fontSize: 14,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  suggestionReason: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
  },
  suggestionHighlight: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  acceptSuggestionButton: {
    backgroundColor: '#34C759',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  acceptSuggestionText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
}); 