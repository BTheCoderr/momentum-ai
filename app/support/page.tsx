import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Support - Momentum AI',
  description: 'Get help and support for Momentum AI - Your AI Accountability Agent',
};

export default function SupportPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Support Center</h1>
          <p className="text-lg text-gray-600 mb-8">
            Get help with Momentum AI - Your AI Accountability Agent
          </p>

          {/* Quick Actions */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
              <div className="text-3xl mb-4">📧</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Email Support</h3>
              <p className="text-gray-600 mb-4">Get personalized help from our team</p>
              <a 
                href="mailto:support@momentum-ai.vercel.app" 
                className="inline-block bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Contact Support
              </a>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
              <div className="text-3xl mb-4">💬</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">In-App Help</h3>
              <p className="text-gray-600 mb-4">Chat with our AI assistant</p>
              <a 
                href="/" 
                className="inline-block bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
              >
                Open App
              </a>
            </div>

            <div className="bg-purple-50 border border-purple-200 rounded-lg p-6 text-center">
              <div className="text-3xl mb-4">📚</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">FAQ</h3>
              <p className="text-gray-600 mb-4">Find answers to common questions</p>
              <a 
                href="#faq" 
                className="inline-block bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
              >
                View FAQ
              </a>
            </div>
          </div>

          {/* FAQ Section */}
          <div id="faq" className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-8">Frequently Asked Questions</h2>
            
            <div className="space-y-6">
              <div className="border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">How does the AI coach work?</h3>
                <p className="text-gray-700">
                  Our AI coach uses advanced machine learning to provide personalized guidance based on your goals, 
                  check-ins, and progress patterns. It learns from your interactions to give increasingly relevant advice.
                </p>
              </div>

              <div className="border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Is my data secure?</h3>
                <p className="text-gray-700">
                  Yes! We use end-to-end encryption and store your data securely with Supabase. We never sell your 
                  personal information and follow strict privacy practices.
                </p>
              </div>

              <div className="border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Can I export my data?</h3>
                <p className="text-gray-700">
                  Absolutely! You can export all your data at any time through the app settings.
                </p>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="bg-gray-50 rounded-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Contact Information</h2>
            <ul className="space-y-2 text-gray-700">
              <li><strong>General Support:</strong> support@momentum-ai.vercel.app</li>
              <li><strong>Privacy Questions:</strong> privacy@momentum-ai.vercel.app</li>
              <li><strong>Feature Requests:</strong> feedback@momentum-ai.vercel.app</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
} 