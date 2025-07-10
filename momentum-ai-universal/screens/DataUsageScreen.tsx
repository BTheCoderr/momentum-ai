import React from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView } from 'react-native';
import { useNavigation } from '@react-navigation/native';

export const DataUsageScreen = () => {
  const navigation = useNavigation();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text onPress={() => navigation.goBack()} style={styles.backButton}>
          ← Back
        </Text>
        <Text style={styles.title}>Data Usage</Text>
      </View>
      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>App Data</Text>
          <View style={styles.dataItem}>
            <Text style={styles.dataLabel}>Profile Information</Text>
            <Text style={styles.dataValue}>2.5 MB</Text>
          </View>
          <View style={styles.dataItem}>
            <Text style={styles.dataLabel}>Goals & Progress</Text>
            <Text style={styles.dataValue}>1.8 MB</Text>
          </View>
          <View style={styles.dataItem}>
            <Text style={styles.dataLabel}>Chat History</Text>
            <Text style={styles.dataValue}>3.2 MB</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>AI Features</Text>
          <View style={styles.dataItem}>
            <Text style={styles.dataLabel}>AI Coach Data</Text>
            <Text style={styles.dataValue}>4.1 MB</Text>
          </View>
          <View style={styles.dataItem}>
            <Text style={styles.dataLabel}>Insights & Analysis</Text>
            <Text style={styles.dataValue}>2.7 MB</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Cache & Temporary Files</Text>
          <View style={styles.dataItem}>
            <Text style={styles.dataLabel}>Cache Size</Text>
            <Text style={styles.dataValue}>8.3 MB</Text>
          </View>
          <View style={styles.dataItem}>
            <Text style={styles.dataLabel}>Temporary Storage</Text>
            <Text style={styles.dataValue}>1.5 MB</Text>
          </View>
        </View>

        <View style={styles.infoBox}>
          <Text style={styles.infoTitle}>About Data Usage</Text>
          <Text style={styles.infoText}>
            Momentum AI stores data locally on your device and in the cloud to provide 
            personalized coaching and progress tracking. Data is encrypted and securely 
            stored. You can clear cache or export your data at any time.
          </Text>
        </View>
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
    color: '#FF6B35',
    fontSize: 16,
    marginRight: 16,
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
    backgroundColor: '#2a2b2e',
    borderRadius: 12,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 16,
  },
  dataItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#3a3b3e',
  },
  dataLabel: {
    fontSize: 16,
    color: '#9ca3af',
  },
  dataValue: {
    fontSize: 16,
    fontWeight: '500',
  },
  infoBox: {
    backgroundColor: '#2a2b2e',
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#9ca3af',
    lineHeight: 20,
  },
}); 