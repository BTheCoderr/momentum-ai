import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';

interface Props {
  visible: boolean;
  onClose: () => void;
  onSubmit: (goalData: any) => Promise<void>;
}

export const GoalCreation = ({ visible, onClose, onSubmit }: Props) => {
  const [goal, setGoal] = useState({
    title: '',
    description: '',
    category: 'Personal',
  });

  const handleSubmit = async () => {
    if (!goal.title.trim()) {
      Alert.alert('Error', 'Please enter a goal title');
      return;
    }

    try {
      const goalData = {
        ...goal,
        progress: 0,
        status: 'active',
        created_at: new Date().toISOString(),
      };

      await onSubmit(goalData);
      setGoal({
        title: '',
        description: '',
        category: 'Personal',
      });
      onClose();
    } catch (error) {
      console.error('Error submitting goal:', error);
      Alert.alert('Error', 'Failed to create goal');
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
            <Text style={styles.headerTitle}>Create New Goal</Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.closeButton}>✕</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.form}>
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
          </View>

          <View style={styles.footer}>
            <TouchableOpacity
              style={styles.submitButton}
              onPress={handleSubmit}
            >
              <Text style={styles.submitButtonText}>Create Goal</Text>
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
  form: {
    flex: 1,
    padding: 20,
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
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  submitButton: {
    backgroundColor: '#FF6B35',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});
