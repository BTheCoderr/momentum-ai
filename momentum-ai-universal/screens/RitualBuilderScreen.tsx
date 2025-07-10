import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TextInput, 
  TouchableOpacity, 
  Alert,
  Modal
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../hooks/useAuth';
import { 
  createRitual, 
  getUserRituals, 
  updateRitual, 
  deleteRitual,
  completeRitual,
  getRitualProgress,
  defaultRitualTemplates,
  Ritual,
  RitualProgress
} from '../lib/rituals';

const timeOfDayOptions = [
  { value: 'morning', label: '🌅 Morning', emoji: '🌅' },
  { value: 'afternoon', label: '☀️ Afternoon', emoji: '☀️' },
  { value: 'evening', label: '🌙 Evening', emoji: '🌙' },
  { value: 'any', label: '⏰ Anytime', emoji: '⏰' }
];

const daysOfWeek = [
  { value: 0, label: 'Sun', short: 'S' },
  { value: 1, label: 'Mon', short: 'M' },
  { value: 2, label: 'Tue', short: 'T' },
  { value: 3, label: 'Wed', short: 'W' },
  { value: 4, label: 'Thu', short: 'T' },
  { value: 5, label: 'Fri', short: 'F' },
  { value: 6, label: 'Sat', short: 'S' }
];

export function RitualBuilderScreen() {
  const navigation = useNavigation();
  const { user } = useAuth();
  
  // Creation state
  const [isCreating, setIsCreating] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [title, setTitle] = useState('');
  const [steps, setSteps] = useState(['']);
  const [selectedTimeOfDay, setSelectedTimeOfDay] = useState<'morning' | 'afternoon' | 'evening' | 'any'>('any');
  const [selectedDays, setSelectedDays] = useState<number[]>([1, 2, 3, 4, 5]); // Weekdays by default
  
  // Display state
  const [rituals, setRituals] = useState<Ritual[]>([]);
  const [ritualProgress, setRitualProgress] = useState<Record<string, RitualProgress>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      loadRituals();
    }
  }, [user?.id]);

  const loadRituals = async () => {
    if (!user?.id) return;
    
    setLoading(true);
    try {
      const userRituals = await getUserRituals(user.id);
      setRituals(userRituals);
      
      // Load progress for each ritual
      const progressData: Record<string, RitualProgress> = {};
      for (const ritual of userRituals) {
        const progress = await getRitualProgress(user.id, ritual.id);
        progressData[ritual.id] = progress;
      }
      setRitualProgress(progressData);
    } catch (error) {
      console.error('Error loading rituals:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRitual = async () => {
    if (!user?.id || !title.trim() || steps.filter(s => s.trim()).length === 0) {
      Alert.alert('Required Fields', 'Please enter a title and at least one step.');
      return;
    }

    const validSteps = steps.filter(s => s.trim());
    const ritual = await createRitual(
      user.id,
      title.trim(),
      validSteps,
      selectedTimeOfDay,
      selectedDays
    );

    if (ritual) {
      Alert.alert('Success', 'Your ritual has been created!');
      resetForm();
      setIsCreating(false);
      loadRituals();
    } else {
      Alert.alert('Error', 'Failed to create ritual. Please try again.');
    }
  };

  const handleUseTemplate = (template: typeof defaultRitualTemplates[0]) => {
    setTitle(template.title);
    setSteps([...template.steps, '']);
    setSelectedTimeOfDay(template.time_of_day);
    setSelectedDays(template.repeat_days);
    setShowTemplates(false);
    setIsCreating(true);
  };

  const resetForm = () => {
    setTitle('');
    setSteps(['']);
    setSelectedTimeOfDay('any');
    setSelectedDays([1, 2, 3, 4, 5]);
  };

  const addStep = () => {
    setSteps([...steps, '']);
  };

  const updateStep = (index: number, value: string) => {
    const newSteps = [...steps];
    newSteps[index] = value;
    setSteps(newSteps);
  };

  const removeStep = (index: number) => {
    if (steps.length > 1) {
      const newSteps = steps.filter((_, i) => i !== index);
      setSteps(newSteps);
    }
  };

  const toggleDay = (day: number) => {
    setSelectedDays(prev => 
      prev.includes(day) 
        ? prev.filter(d => d !== day)
        : [...prev, day].sort()
    );
  };

  const handleCompleteRitual = async (ritualId: string) => {
    if (!user?.id) return;
    
    const success = await completeRitual(user.id, ritualId);
    if (success) {
      Alert.alert('Great Job! 🎉', 'Ritual completed for today!');
      loadRituals(); // Refresh to update progress
    }
  };

  const handleDeleteRitual = (ritual: Ritual) => {
    Alert.alert(
      'Delete Ritual',
      `Are you sure you want to delete "${ritual.title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const success = await deleteRitual(ritual.id);
            if (success) {
              loadRituals();
            }
          }
        }
      ]
    );
  };

  const renderRitual = (ritual: Ritual) => {
    const progress = ritualProgress[ritual.id];
    const timeEmoji = timeOfDayOptions.find(t => t.value === ritual.time_of_day)?.emoji || '⏰';
    const today = new Date().toISOString().split('T')[0];
    const completedToday = progress?.completed_dates.includes(today);

    return (
      <View key={ritual.id} style={styles.ritualCard}>
        <View style={styles.ritualHeader}>
          <Text style={styles.ritualTitle}>
            {timeEmoji} {ritual.title}
          </Text>
          <TouchableOpacity
            onPress={() => handleDeleteRitual(ritual)}
            style={styles.deleteButton}
          >
            <Text style={styles.deleteButtonText}>🗑️</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.ritualSteps}>
          {ritual.steps.map((step, index) => (
            <View key={index} style={styles.stepItem}>
              <Text style={styles.stepNumber}>{index + 1}.</Text>
              <Text style={styles.stepText}>{step}</Text>
            </View>
          ))}
        </View>

        <View style={styles.ritualFooter}>
          <View style={styles.progressInfo}>
            <Text style={styles.progressText}>
              🔥 {progress?.current_streak || 0} day streak
            </Text>
            <Text style={styles.progressSubtext}>
              Best: {progress?.best_streak || 0} days
            </Text>
          </View>

          <TouchableOpacity
            onPress={() => handleCompleteRitual(ritual.id)}
            style={[
              styles.completeButton,
              completedToday && styles.completedButton
            ]}
            disabled={completedToday}
          >
            <Text style={[
              styles.completeButtonText,
              completedToday && styles.completedButtonText
            ]}>
              {completedToday ? '✅ Done Today' : '✓ Complete'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.daysIndicator}>
          {daysOfWeek.map(day => (
            <View
              key={day.value}
              style={[
                styles.dayDot,
                ritual.repeat_days.includes(day.value) && styles.activeDayDot
              ]}
            >
              <Text style={[
                styles.dayText,
                ritual.repeat_days.includes(day.value) && styles.activeDayText
              ]}>
                {day.short}
              </Text>
            </View>
          ))}
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading your rituals...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>🕯️ Rituals</Text>
        <Text style={styles.subtitle}>Design routines that shape your days</Text>
      </View>

      <ScrollView style={styles.content}>
        {rituals.length === 0 && !isCreating ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>
              Create your first ritual to build powerful daily habits
            </Text>
            <TouchableOpacity
              style={styles.templateButton}
              onPress={() => setShowTemplates(true)}
            >
              <Text style={styles.templateButtonText}>Browse Templates</Text>
            </TouchableOpacity>
          </View>
        ) : (
          rituals.map(renderRitual)
        )}

        {isCreating && (
          <View style={styles.creationForm}>
            <Text style={styles.formTitle}>Create New Ritual</Text>
            
            <TextInput
              style={styles.titleInput}
              placeholder="Ritual name (e.g., Morning Momentum)"
              value={title}
              onChangeText={setTitle}
            />

            <Text style={styles.sectionLabel}>Steps</Text>
            {steps.map((step, index) => (
              <View key={index} style={styles.stepInputContainer}>
                <TextInput
                  style={styles.stepInput}
                  placeholder={`Step ${index + 1}`}
                  value={step}
                  onChangeText={(value) => updateStep(index, value)}
                />
                {steps.length > 1 && (
                  <TouchableOpacity
                    onPress={() => removeStep(index)}
                    style={styles.removeStepButton}
                  >
                    <Text style={styles.removeStepText}>✕</Text>
                  </TouchableOpacity>
                )}
              </View>
            ))}
            
            <TouchableOpacity onPress={addStep} style={styles.addStepButton}>
              <Text style={styles.addStepText}>+ Add Step</Text>
            </TouchableOpacity>

            <Text style={styles.sectionLabel}>Time of Day</Text>
            <View style={styles.timeSelector}>
              {timeOfDayOptions.map(option => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.timeOption,
                    selectedTimeOfDay === option.value && styles.selectedTimeOption
                  ]}
                  onPress={() => setSelectedTimeOfDay(option.value as any)}
                >
                  <Text style={styles.timeOptionText}>{option.label}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.sectionLabel}>Repeat Days</Text>
            <View style={styles.daySelector}>
              {daysOfWeek.map(day => (
                <TouchableOpacity
                  key={day.value}
                  style={[
                    styles.dayOption,
                    selectedDays.includes(day.value) && styles.selectedDayOption
                  ]}
                  onPress={() => toggleDay(day.value)}
                >
                  <Text style={[
                    styles.dayOptionText,
                    selectedDays.includes(day.value) && styles.selectedDayText
                  ]}>
                    {day.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.formActions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => {
                  resetForm();
                  setIsCreating(false);
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.createButton}
                onPress={handleCreateRitual}
              >
                <Text style={styles.createButtonText}>Create Ritual</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>

      {!isCreating && (
        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.newRitualButton}
            onPress={() => setIsCreating(true)}
          >
            <Text style={styles.newRitualButtonText}>+ New Ritual</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.templatesButton}
            onPress={() => setShowTemplates(true)}
          >
            <Text style={styles.templatesButtonText}>📝 Templates</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Templates Modal */}
      <Modal
        visible={showTemplates}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Ritual Templates</Text>
            <TouchableOpacity
              onPress={() => setShowTemplates(false)}
              style={styles.closeButton}
            >
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.templatesContainer}>
            {defaultRitualTemplates.map((template, index) => (
              <TouchableOpacity
                key={index}
                style={styles.templateCard}
                onPress={() => handleUseTemplate(template)}
              >
                <Text style={styles.templateTitle}>{template.title}</Text>
                <View style={styles.templateSteps}>
                  {template.steps.map((step, stepIndex) => (
                    <Text key={stepIndex} style={styles.templateStep}>
                      {stepIndex + 1}. {step}
                    </Text>
                  ))}
                </View>
                <Text style={styles.templateInfo}>
                  {timeOfDayOptions.find(t => t.value === template.time_of_day)?.emoji} {' '}
                  {template.time_of_day.charAt(0).toUpperCase() + template.time_of_day.slice(1)}
                </Text>
              </TouchableOpacity>
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
  content: {
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
  templateButton: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  templateButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  ritualCard: {
    backgroundColor: '#F8F9FA',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  ritualHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  ritualTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
  },
  deleteButton: {
    padding: 8,
  },
  deleteButtonText: {
    fontSize: 16,
  },
  ritualSteps: {
    marginBottom: 16,
  },
  stepItem: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  stepNumber: {
    fontSize: 14,
    color: '#666',
    marginRight: 8,
    minWidth: 20,
  },
  stepText: {
    fontSize: 14,
    flex: 1,
    lineHeight: 20,
  },
  ritualFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  progressInfo: {
    flex: 1,
  },
  progressText: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  progressSubtext: {
    fontSize: 12,
    color: '#666',
  },
  completeButton: {
    backgroundColor: '#34C759',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  completedButton: {
    backgroundColor: '#E5E5E5',
  },
  completeButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  completedButtonText: {
    color: '#666',
  },
  daysIndicator: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  dayDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#E5E5E5',
    marginHorizontal: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeDayDot: {
    backgroundColor: '#007AFF',
  },
  dayText: {
    fontSize: 10,
    color: '#666',
    fontWeight: '600',
  },
  activeDayText: {
    color: '#fff',
  },
  creationForm: {
    backgroundColor: '#F8F9FA',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  formTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  titleInput: {
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    marginBottom: 20,
    backgroundColor: '#fff',
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  stepInputContainer: {
    flexDirection: 'row',
    marginBottom: 12,
    alignItems: 'center',
  },
  stepInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    backgroundColor: '#fff',
  },
  removeStepButton: {
    marginLeft: 8,
    padding: 8,
  },
  removeStepText: {
    color: '#FF3B30',
    fontSize: 16,
  },
  addStepButton: {
    alignSelf: 'flex-start',
    marginBottom: 20,
  },
  addStepText: {
    color: '#007AFF',
    fontSize: 14,
    fontWeight: '600',
  },
  timeSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 20,
  },
  timeOption: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 8,
    padding: 12,
    marginRight: 8,
    marginBottom: 8,
  },
  selectedTimeOption: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  timeOptionText: {
    fontSize: 14,
    color: '#333',
  },
  daySelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 20,
  },
  dayOption: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 8,
    padding: 8,
    marginRight: 4,
    marginBottom: 8,
    minWidth: 45,
    alignItems: 'center',
  },
  selectedDayOption: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  dayOptionText: {
    fontSize: 12,
    color: '#333',
  },
  selectedDayText: {
    color: '#fff',
  },
  formActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#E5E5E5',
    borderRadius: 12,
    padding: 16,
    marginRight: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
  createButton: {
    flex: 1,
    backgroundColor: '#007AFF',
    borderRadius: 12,
    padding: 16,
    marginLeft: 8,
    alignItems: 'center',
  },
  createButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    padding: 20,
    paddingBottom: 40,
  },
  newRitualButton: {
    flex: 1,
    backgroundColor: '#007AFF',
    borderRadius: 12,
    padding: 16,
    marginRight: 8,
    alignItems: 'center',
  },
  newRitualButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  templatesButton: {
    flex: 1,
    backgroundColor: '#E5E5E5',
    borderRadius: 12,
    padding: 16,
    marginLeft: 8,
    alignItems: 'center',
  },
  templatesButtonText: {
    color: '#333',
    fontSize: 16,
    fontWeight: '600',
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
  templatesContainer: {
    flex: 1,
    padding: 20,
  },
  templateCard: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  templateTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  templateSteps: {
    marginBottom: 12,
  },
  templateStep: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  templateInfo: {
    fontSize: 12,
    color: '#999',
    textTransform: 'capitalize',
  },
}); 