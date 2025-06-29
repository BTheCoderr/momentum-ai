import React from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView } from 'react-native';
import { useNavigation } from '@react-navigation/native';

export const PrivacyPolicyScreen = () => {
  const navigation = useNavigation();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text onPress={() => navigation.goBack()} style={styles.backButton}>
          ← Back
        </Text>
        <Text style={styles.title}>Privacy Policy</Text>
      </View>
      <ScrollView style={styles.content}>
        <Text style={styles.section}>1. Information We Collect</Text>
        <Text style={styles.text}>
          We collect information that you provide directly to us, including:
          {'\n'}- Account information (name, email, goals)
          {'\n'}- Usage data and activity
          {'\n'}- Device information
        </Text>

        <Text style={styles.section}>2. How We Use Your Information</Text>
        <Text style={styles.text}>
          We use the information we collect to:
          {'\n'}- Provide and improve our services
          {'\n'}- Personalize your experience
          {'\n'}- Send you updates and communications
          {'\n'}- Analyze app usage and trends
        </Text>

        <Text style={styles.section}>3. Data Storage and Security</Text>
        <Text style={styles.text}>
          Your data is stored securely using industry-standard encryption. We use Supabase 
          for data storage, which provides enterprise-grade security features.
        </Text>

        <Text style={styles.section}>4. Data Sharing</Text>
        <Text style={styles.text}>
          We do not sell your personal information. We may share anonymized, 
          aggregated data for analytics purposes.
        </Text>

        <Text style={styles.section}>5. Your Rights</Text>
        <Text style={styles.text}>
          You have the right to:
          {'\n'}- Access your personal data
          {'\n'}- Request data deletion
          {'\n'}- Opt out of communications
          {'\n'}- Export your data
        </Text>

        <Text style={styles.section}>6. Updates to Policy</Text>
        <Text style={styles.text}>
          We may update this policy periodically. We will notify you of any 
          significant changes via email or app notification.
        </Text>

        <Text style={styles.section}>7. Contact Us</Text>
        <Text style={styles.text}>
          If you have questions about this privacy policy or your data, 
          please contact us at support@momentum-ai.app
        </Text>
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
    color: '#4F46E5',
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
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 24,
    marginBottom: 12,
  },
  text: {
    fontSize: 16,
    color: '#9ca3af',
    lineHeight: 24,
  },
}); 