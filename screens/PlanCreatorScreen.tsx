import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { supabase } from '../lib/supabase';

export const PlanCreatorScreen = () => {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState({
    title: '',
    description: '',
    duration: 'week',
    milestones: [''],
    reminders: true,
  });

  const handleAddMilestone = () => {
    setPlan(prev => ({
      ...prev,
      milestones: [...prev.milestones, ''],
    }));
  };

  const handleUpdateMilestone = (index: number, text: string) => {
    setPlan(prev => ({
      ...prev,
      milestones: prev.milestones.map((m, i) => i === index ? text : m),
    }));
  };

  const handleRemoveMilestone = (index: number) => {
    setPlan(prev => ({
      ...prev,
      milestones: prev.milestones.filter((_, i) => i !== index),
    }));
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      
      if (!plan.title.trim()) {
        Alert.alert('Error', 'Please enter a plan title');
        return;
      }

      if (plan.milestones.some(m => !m.trim())) {
        Alert.alert('Error', 'Please fill in all milestones');
        return;
      }

      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) throw new Error('No user found');

      const { error } = await supabase
        .from('plans')
        .insert({
          user_id: user.id,
          title: plan.title,
          description: plan.description,
          duration: plan.duration,
          milestones: plan.milestones,
          reminders_enabled: plan.reminders,
          created_at: new Date().toISOString(),
          status: 'active',
        });

      if (error) throw error;

      Alert.alert('Success', 'Plan created successfully!');
      navigation.goBack();
    } catch (error) {
      console.error('Error creating plan:', error);
      Alert.alert('Error', 'Failed to create plan. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Create Plan</Text>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.label}>Plan Title</Text>
          <TextInput
            style={styles.input}
            value={plan.title}
            onChangeText={(text) => setPlan(prev => ({ ...prev, title: text }))}
            placeholder="What's your plan called?"
            placeholderTextColor="#6b7280"
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Description</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={plan.description}
            onChangeText={(text) => setPlan(prev => ({ ...prev, description: text }))}
            placeholder="Describe your plan..."
            placeholderTextColor="#6b7280"
            multiline
            numberOfLines={4}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Duration</Text>
          <View style={styles.durationButtons}>
            {['day', 'week', 'month'].map((duration) => (
              <TouchableOpacity
                key={duration}
                style={[
                  styles.durationButton,
                  plan.duration === duration && styles.durationButtonActive
                ]}
                onPress={() => setPlan(prev => ({ ...prev, duration }))}
              >
                <Text style={[
                  styles.durationButtonText,
                  plan.duration === duration && styles.durationButtonTextActive
                ]}>
                  {duration.charAt(0).toUpperCase() + duration.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.milestonesHeader}>
            <Text style={styles.label}>Milestones</Text>
            <TouchableOpacity onPress={handleAddMilestone} style={styles.addButton}>
              <Text style={styles.addButtonText}>+ Add Milestone</Text>
            </TouchableOpacity>
          </View>
          
          {plan.milestones.map((milestone, index) => (
            <View key={index} style={styles.milestoneContainer}>
              <TextInput
                style={styles.milestoneInput}
                value={milestone}
                onChangeText={(text) => handleUpdateMilestone(index, text)}
                placeholder={`Milestone ${index + 1}`}
                placeholderTextColor="#6b7280"
              />
              {index > 0 && (
                <TouchableOpacity
                  onPress={() => handleRemoveMilestone(index)}
                  style={styles.removeButton}
                >
                  <Text style={styles.removeButtonText}>×</Text>
                </TouchableOpacity>
              )}
            </View>
          ))}
        </View>

        <TouchableOpacity
          style={styles.saveButton}
          onPress={handleSave}
          disabled={loading}
        >
          <Text style={styles.saveButtonText}>
            {loading ? 'Creating...' : 'Create Plan'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1b1e',
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#2a2b2e',
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginRight: 16,
  },
  backButtonText: {
    color: '#4F46E5',
    fontSize: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    color: '#fff',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#2a2b2e',
    borderRadius: 8,
    padding: 12,
    color: '#fff',
    fontSize: 16,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  durationButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  durationButton: {
    flex: 1,
    backgroundColor: '#2a2b2e',
    padding: 12,
    borderRadius: 8,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  durationButtonActive: {
    backgroundColor: '#4F46E5',
  },
  durationButtonText: {
    color: '#fff',
    fontSize: 14,
  },
  durationButtonTextActive: {
    fontWeight: 'bold',
  },
  milestonesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  addButton: {
    backgroundColor: '#2a2b2e',
    padding: 8,
    borderRadius: 8,
  },
  addButtonText: {
    color: '#4F46E5',
    fontSize: 14,
  },
  milestoneContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  milestoneInput: {
    flex: 1,
    backgroundColor: '#2a2b2e',
    borderRadius: 8,
    padding: 12,
    color: '#fff',
    fontSize: 16,
    marginRight: 8,
  },
  removeButton: {
    backgroundColor: '#2a2b2e',
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeButtonText: {
    color: '#ef4444',
    fontSize: 20,
  },
  saveButton: {
    backgroundColor: '#4F46E5',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 32,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
}); 