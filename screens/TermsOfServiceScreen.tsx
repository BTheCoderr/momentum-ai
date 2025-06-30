import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';

export const TermsOfServiceScreen = () => {
  const navigation = useNavigation();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Terms of Service</Text>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>1. Acceptance of Terms</Text>
          <Text style={styles.text}>
            By accessing and using Momentum AI, you agree to be bound by these Terms of Service
            and all applicable laws and regulations. If you do not agree with any of these terms,
            you are prohibited from using or accessing this app.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>2. Use License</Text>
          <Text style={styles.text}>
            Permission is granted to temporarily download one copy of the app for personal,
            non-commercial transitory viewing only. This is the grant of a license, not a
            transfer of title, and under this license you may not:
          </Text>
          <Text style={styles.bulletPoint}>• Modify or copy the materials</Text>
          <Text style={styles.bulletPoint}>• Use the materials for any commercial purpose</Text>
          <Text style={styles.bulletPoint}>• Remove any copyright or proprietary notations</Text>
          <Text style={styles.bulletPoint}>• Transfer the materials to another person</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>3. Data Usage</Text>
          <Text style={styles.text}>
            We collect and process your data as described in our Privacy Policy. By using
            Momentum AI, you agree to our data collection and processing practices.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>4. User Responsibilities</Text>
          <Text style={styles.text}>
            You are responsible for maintaining the confidentiality of your account and
            password. You agree to accept responsibility for all activities that occur under
            your account.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>5. Limitations</Text>
          <Text style={styles.text}>
            In no event shall Momentum AI be liable for any damages arising out of the use
            or inability to use the materials on Momentum AI's app, even if Momentum AI has
            been notified orally or in writing of the possibility of such damage.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>6. Updates</Text>
          <Text style={styles.text}>
            Momentum AI may revise these terms of service for its app at any time without
            notice. By using this app you are agreeing to be bound by the then current
            version of these terms of service.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>7. Governing Law</Text>
          <Text style={styles.text}>
            These terms and conditions are governed by and construed in accordance with
            the laws and you irrevocably submit to the exclusive jurisdiction of the courts
            in that location.
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
    marginRight: 16,
  },
  backButtonText: {
    color: '#FF6B35',
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 12,
  },
  text: {
    fontSize: 14,
    color: '#9ca3af',
    lineHeight: 22,
    marginBottom: 12,
  },
  bulletPoint: {
    fontSize: 14,
    color: '#9ca3af',
    lineHeight: 22,
    marginLeft: 16,
    marginBottom: 8,
  },
}); 