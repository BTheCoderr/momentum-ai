import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy - Momentum AI',
  description: 'Privacy Policy for Momentum AI - Your AI Accountability Agent',
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Privacy Policy</h1>
          <p className="text-sm text-gray-600 mb-8">Last updated: January 2025</p>

          <div className="prose prose-lg max-w-none">
            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">Introduction</h2>
            <p className="text-gray-700 mb-6">
              Momentum AI ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy 
              explains how we collect, use, disclose, and safeguard your information when you use our mobile 
              application and web services.
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">Information We Collect</h2>
            
            <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">Information You Provide</h3>
            <ul className="list-disc pl-6 text-gray-700 mb-6">
              <li>Account information (email, name)</li>
              <li>Goals and objectives you set</li>
              <li>Daily check-ins and mood data</li>
              <li>Messages and interactions with AI coach</li>
              <li>Reflection journal entries</li>
              <li>Progress tracking data</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">Automatically Collected Information</h3>
            <ul className="list-disc pl-6 text-gray-700 mb-6">
              <li>Device information and identifiers</li>
              <li>App usage analytics</li>
              <li>Performance and crash data</li>
              <li>IP address and general location</li>
            </ul>

            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">How We Use Your Information</h2>
            <ul className="list-disc pl-6 text-gray-700 mb-6">
              <li>Provide personalized AI coaching and insights</li>
              <li>Track your progress and generate analytics</li>
              <li>Send notifications and reminders</li>
              <li>Improve our services and develop new features</li>
              <li>Provide customer support</li>
              <li>Ensure security and prevent fraud</li>
            </ul>

            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">Data Sharing and Disclosure</h2>
            <p className="text-gray-700 mb-4">
              <strong>We do not sell your personal data.</strong> We may share your information only in these limited circumstances:
            </p>
            <ul className="list-disc pl-6 text-gray-700 mb-6">
              <li>With your explicit consent</li>
              <li>To comply with legal obligations</li>
              <li>To protect our rights and safety</li>
              <li>With service providers who help us operate the app (under strict confidentiality agreements)</li>
            </ul>

            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">Data Security</h2>
            <p className="text-gray-700 mb-6">
              We implement industry-standard security measures to protect your data:
            </p>
            <ul className="list-disc pl-6 text-gray-700 mb-6">
              <li>End-to-end encryption for sensitive data</li>
              <li>Secure cloud storage with Supabase</li>
              <li>Regular security audits and updates</li>
              <li>Limited access to personal data by our team</li>
            </ul>

            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">Your Rights and Choices</h2>
            <p className="text-gray-700 mb-4">You have the right to:</p>
            <ul className="list-disc pl-6 text-gray-700 mb-6">
              <li>Access your personal data</li>
              <li>Correct inaccurate information</li>
              <li>Delete your account and data</li>
              <li>Export your data</li>
              <li>Opt out of marketing communications</li>
              <li>Control notification settings</li>
            </ul>

            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">Children's Privacy</h2>
            <p className="text-gray-700 mb-6">
              Our service is not intended for children under 13. We do not knowingly collect 
              personal information from children under 13.
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">International Users</h2>
            <p className="text-gray-700 mb-6">
              If you are located outside the United States, please note that we transfer, 
              store, and process your information in the United States. By using our service, 
              you consent to this transfer.
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">Changes to This Policy</h2>
            <p className="text-gray-700 mb-6">
              We may update this Privacy Policy from time to time. We will notify you of any 
              material changes by posting the new policy in the app and updating the "Last updated" date.
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">Contact Us</h2>
            <p className="text-gray-700 mb-4">
              If you have any questions about this Privacy Policy, please contact us:
            </p>
            <ul className="list-none text-gray-700 mb-6">
              <li>Email: privacy@momentum-ai.vercel.app</li>
              <li>Support: support@momentum-ai.vercel.app</li>
            </ul>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mt-8">
              <h3 className="text-lg font-semibold text-blue-900 mb-2">GDPR Compliance</h3>
              <p className="text-blue-800">
                For users in the European Union, we comply with GDPR requirements. 
                You have additional rights under GDPR, including data portability and the right to be forgotten. 
                Contact us at gdpr@momentum-ai.vercel.app for GDPR-related requests.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 