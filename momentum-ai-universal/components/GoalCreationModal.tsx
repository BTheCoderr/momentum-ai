import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { goalServices } from '../lib/services';
import { supabase } from '../lib/supabase';

interface Milestone {
  title: string;
  completed: boolean;
}

interface Props {
  visible: boolean;
  onClose: () => void;
  onSuccess: (goalData: any) => void;
}

export const GoalCreationModal = ({ visible, onClose, onSuccess }: Props) => {
  const [step, setStep] = useState(1);
  const [goal, setGoal] = useState({
    title: '',
    description: '',
    category: 'Personal',
    target_date: new Date(),
    milestones: [] as Milestone[],
    priority: 'medium',
    reminder_frequency: 'daily',
  });
  const [newMilestone, setNewMilestone] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const categories = [
    'Personal', 'Professional', 'Health', 'Learning', 'Financial', 'Other'
  ];

  const priorities = [
    { value: 'low', label: 'Low 😌', color: '#4CAF50' },
    { value: 'medium', label: 'Medium ⚡️', color: '#FF9800' },
    { value: 'high', label: 'High 🔥', color: '#F44336' },
  ];

  const reminders = [
    { value: 'daily', label: 'Daily Check-in' },
    { value: 'weekly', label: 'Weekly Review' },
    { value: 'none', label: 'No Reminders' },
  ];

  const addMilestone = () => {
    if (!newMilestone.trim()) return;
    setGoal(prev => ({
      ...prev,
      milestones: [...prev.milestones, { title: newMilestone, completed: false }]
    }));
    setNewMilestone('');
  };

  const removeMilestone = (index: number) => {
    setGoal(prev => ({
      ...prev,
      milestones: prev.milestones.filter((_, i) => i !== index)
    }));
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setGoal(prev => ({ ...prev, target_date: selectedDate }));
    }
  };

  const validateStep = () => {
    switch (step) {
      case 1:
        if (!goal.title.trim()) {
          Alert.alert('Error', 'Please enter a goal title');
          return false;
        }
        if (!goal.category) {
          Alert.alert('Error', 'Please select a category');
          return false;
        }
        break;
      case 2:
        if (goal.milestones.length === 0) {
          Alert.alert('Error', 'Please add at least one milestone');
          return false;
        }
        if (goal.milestones.some(m => !m.title.trim())) {
          Alert.alert('Error', 'All milestones must have a title');
          return false;
        }
        break;
      case 3:
        if (!goal.target_date) {
          Alert.alert('Error', 'Please select a target date');
          return false;
        }
        if (!goal.priority) {
          Alert.alert('Error', 'Please select a priority level');
          return false;
        }
        if (!goal.reminder_frequency) {
          Alert.alert('Error', 'Please select a reminder frequency');
          return false;
        }
        // Validate target date is in the future
        if (goal.target_date < new Date()) {
          Alert.alert('Error', 'Target date must be in the future');
          return false;
        }
        break;
    }
    return true;
  };

  const handleNext = () => {
    if (validateStep()) {
      setStep(prev => prev + 1);
    }
  };

  const handleSubmit = async () => {
    if (!validateStep()) return;

    try {
      setIsSubmitting(true);
      
      // Check if user is authenticated
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        Alert.alert('Error', 'Please log in to create goals');
        return;
      }

      // Only include fields that are essential and likely to exist
      const goalData = {
        title: goal.title,
        description: goal.description || '',
        user_id: user.id,
        category: goal.category.toLowerCase(),
        status: 'active',
        priority: goal.priority || 'medium',
        target_date: goal.target_date.toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      // Try to create the goal with minimal data first
      const { data, error } = await supabase
        .from('goals')
        .insert([goalData])
        .select()
        .single();

      if (error) {
        console.error('Goal creation error:', error);
        Alert.alert('Error', `Failed to create goal: ${error.message}`);
        return;
      }

      Alert.alert('Success', 'Goal created successfully! +25 XP');
      onSuccess(data);
      onClose();
    } catch (error) {
      console.error('Error creating goal:', error);
      Alert.alert('Error', 'Failed to create goal. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>
              {step === 1 ? 'Create New Goal' : step === 2 ? 'Add Milestones' : 'Set Details'}
            </Text>
            <TouchableOpacity onPress={onClose} disabled={isSubmitting}>
              <Text style={[styles.closeButton, isSubmitting && styles.disabledText]}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.scrollContent}>
            {step === 1 && (
              <View style={styles.step}>
                <TextInput
                  style={styles.input}
                  placeholder="Goal Title"
                  value={goal.title}
                  onChangeText={text => setGoal(prev => ({ ...prev, title: text }))}
                />
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="Description (optional)"
                  multiline
                  numberOfLines={4}
                  value={goal.description}
                  onChangeText={text => setGoal(prev => ({ ...prev, description: text }))}
                />
                <View style={styles.categoryContainer}>
                  {categories.map(cat => (
                    <TouchableOpacity
                      key={cat}
                      style={[
                        styles.categoryButton,
                        goal.category === cat && styles.categoryButtonSelected
                      ]}
                      onPress={() => setGoal(prev => ({ ...prev, category: cat }))}
                    >
                      <Text style={[
                        styles.categoryText,
                        goal.category === cat && styles.categoryTextSelected
                      ]}>{cat}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            {step === 2 && (
              <View style={styles.step}>
                <Text style={styles.stepTitle}>Break down your goal into milestones</Text>
                <View style={styles.milestoneInput}>
                  <TextInput
                    style={styles.input}
                    placeholder="Add a milestone"
                    value={newMilestone}
                    onChangeText={setNewMilestone}
                    onSubmitEditing={addMilestone}
                  />
                  <TouchableOpacity style={styles.addButton} onPress={addMilestone}>
                    <Text style={styles.addButtonText}>+</Text>
                  </TouchableOpacity>
                </View>
                {goal.milestones.map((milestone, index) => (
                  <View key={index} style={styles.milestone}>
                    <Text style={styles.milestoneText}>{milestone.title}</Text>
                    <TouchableOpacity onPress={() => removeMilestone(index)}>
                      <Text style={styles.removeButton}>✕</Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}

            {step === 3 && (
              <View style={styles.step}>
                <Text style={styles.stepTitle}>Set goal details</Text>
                <TouchableOpacity
                  style={styles.dateButton}
                  onPress={() => setShowDatePicker(true)}
                >
                  <Text style={styles.dateButtonText}>
                    Target Date: {goal.target_date.toLocaleDateString()}
                  </Text>
                </TouchableOpacity>

                {showDatePicker && (
                  <DateTimePicker
                    value={goal.target_date}
                    mode="date"
                    display="default"
                    onChange={handleDateChange}
                    minimumDate={new Date()}
                  />
                )}

                <Text style={styles.sectionTitle}>Priority</Text>
                <View style={styles.priorityButtons}>
                  {priorities.map(priority => (
                    <TouchableOpacity
                      key={priority.value}
                      style={[
                        styles.priorityButton,
                        goal.priority === priority.value && { backgroundColor: priority.color }
                      ]}
                      onPress={() => setGoal(prev => ({ ...prev, priority: priority.value }))}
                    >
                      <Text style={[
                        styles.priorityText,
                        goal.priority === priority.value && styles.priorityTextSelected
                      ]}>{priority.label}</Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <Text style={styles.sectionTitle}>Reminders</Text>
                <View style={styles.reminderButtons}>
                  {reminders.map(reminder => (
                    <TouchableOpacity
                      key={reminder.value}
                      style={[
                        styles.reminderButton,
                        goal.reminder_frequency === reminder.value && styles.reminderButtonSelected
                      ]}
                      onPress={() => setGoal(prev => ({ ...prev, reminder_frequency: reminder.value }))}
                    >
                      <Text style={[
                        styles.reminderText,
                        goal.reminder_frequency === reminder.value && styles.reminderTextSelected
                      ]}>{reminder.label}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}
          </ScrollView>

          <View style={styles.footer}>
            {step > 1 && (
              <TouchableOpacity
                style={[styles.footerButton, styles.backButton]}
                onPress={() => setStep(prev => prev - 1)}
                disabled={isSubmitting}
              >
                <Text style={styles.footerButtonText}>Back</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={[styles.footerButton, styles.nextButton, isSubmitting && styles.disabledButton]}
              onPress={step === 3 ? handleSubmit : handleNext}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.footerButtonText}>
                  {step === 3 ? 'Create Goal' : 'Next'}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: '90%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  closeButton: {
    fontSize: 24,
    color: '#666',
  },
  scrollContent: {
    flex: 1,
    padding: 20,
  },
  step: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 15,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
    fontSize: 16,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  categoryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 10,
  },
  categoryButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
  },
  categoryButtonSelected: {
    backgroundColor: '#FF6B35',
  },
  categoryText: {
    color: '#666',
  },
  categoryTextSelected: {
    color: '#fff',
  },
  milestoneInput: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 15,
  },
  addButton: {
    backgroundColor: '#FF6B35',
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontSize: 24,
  },
  milestone: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
  },
  milestoneText: {
    flex: 1,
    fontSize: 16,
  },
  removeButton: {
    color: '#666',
    fontSize: 18,
    marginLeft: 10,
  },
  dateButton: {
    backgroundColor: '#f5f5f5',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
  },
  dateButtonText: {
    fontSize: 16,
    color: '#333',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 20,
    marginBottom: 10,
  },
  priorityButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
    marginBottom: 20,
  },
  priorityButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
  },
  priorityText: {
    fontSize: 14,
    color: '#333',
  },
  priorityTextSelected: {
    color: '#fff',
  },
  reminderButtons: {
    gap: 10,
  },
  reminderButton: {
    padding: 15,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
  },
  reminderButtonSelected: {
    backgroundColor: '#FF6B35',
  },
  reminderText: {
    fontSize: 16,
    color: '#333',
  },
  reminderTextSelected: {
    color: '#fff',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  footerButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButton: {
    backgroundColor: '#f0f0f0',
    marginRight: 8,
  },
  nextButton: {
    backgroundColor: '#FF6B35',
  },
  footerButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  disabledButton: {
    opacity: 0.5,
  },
  disabledText: {
    opacity: 0.5,
  },
});