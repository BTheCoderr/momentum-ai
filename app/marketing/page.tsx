import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Marketing - Momentum AI',
  description: 'Momentum AI - Your AI Accountability Agent for building habits and achieving goals',
};

export default function MarketingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-8">
              Momentum AI
            </h1>
            <p className="text-2xl md:text-3xl text-gray-700 mb-6 font-light">
              Your AI Accountability Agent
            </p>
            <p className="text-lg text-gray-600 mb-12 max-w-3xl mx-auto">
              Transform your daily routine with the intelligent productivity coach that adapts to your unique lifestyle. 
              Build habits, crush goals, and create lasting positive change with AI-powered guidance.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6">
              <a 
                href="https://apps.apple.com/app/momentum-ai" 
                className="flex items-center space-x-3 px-8 py-4 bg-black text-white rounded-xl font-semibold text-lg hover:bg-gray-800 transition-all transform hover:scale-105"
              >
                <span>📱</span>
                <span>Download on App Store</span>
              </a>
              <a 
                href="https://play.google.com/store/apps/momentum-ai" 
                className="flex items-center space-x-3 px-8 py-4 bg-green-600 text-white rounded-xl font-semibold text-lg hover:bg-green-700 transition-all transform hover:scale-105"
              >
                <span>🤖</span>
                <span>Get it on Google Play</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-16">
            Why Choose Momentum AI?
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-8 bg-white rounded-2xl shadow-lg">
              <div className="text-4xl mb-6">🤖</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">AI-Powered Coaching</h3>
              <p className="text-gray-600">
                Get personalized guidance from 5 distinct AI coaches, each with unique personalities and expertise areas.
              </p>
            </div>
            
            <div className="text-center p-8 bg-white rounded-2xl shadow-lg">
              <div className="text-4xl mb-6">📈</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Smart Goal Tracking</h3>
              <p className="text-gray-600">
                Set meaningful goals and watch AI break them down into actionable steps with progress tracking.
              </p>
            </div>
            
            <div className="text-center p-8 bg-white rounded-2xl shadow-lg">
              <div className="text-4xl mb-6">🔥</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Streak Building</h3>
              <p className="text-gray-600">
                Build lasting habits with our gamified streak system that celebrates wins and motivates comebacks.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-12">
            Proven Results
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8 text-white">
            <div>
              <div className="text-5xl font-bold mb-2">3x</div>
              <p className="text-xl">Higher Goal Completion Rate</p>
            </div>
            <div>
              <div className="text-5xl font-bold mb-2">85%</div>
              <p className="text-xl">User Satisfaction</p>
            </div>
            <div>
              <div className="text-5xl font-bold mb-2">21</div>
              <p className="text-xl">Average Streak Length</p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-8">
            Ready to Build Unstoppable Momentum?
          </h2>
          <p className="text-xl text-gray-600 mb-12">
            Join thousands of achievers who've discovered the power of AI-driven accountability
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6">
            <a 
              href="/" 
              className="flex items-center space-x-3 px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-bold text-lg hover:shadow-xl transition-all transform hover:scale-105"
            >
              <span>🚀</span>
              <span>Start Your Journey Free</span>
            </a>
          </div>

          <div className="mt-8 flex items-center justify-center space-x-8 text-gray-500">
            <div className="flex items-center space-x-2">
              <span>✓</span>
              <span>Free to start</span>
            </div>
            <div className="flex items-center space-x-2">
              <span>✓</span>
              <span>No credit card required</span>
            </div>
            <div className="flex items-center space-x-2">
              <span>✓</span>
              <span>Cancel anytime</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-12 px-4 sm:px-6 lg:px-8 bg-gray-900">
        <div className="max-w-6xl mx-auto text-center">
          <h3 className="text-2xl font-bold text-white mb-4">Momentum AI</h3>
          <p className="text-gray-400 mb-8">
            Your AI Accountability Agent - Building the future of goal achievement
          </p>
          <div className="flex items-center justify-center space-x-8 text-gray-400">
            <a href="/" className="hover:text-white transition-colors">Home</a>
            <a href="/privacy" className="hover:text-white transition-colors">Privacy</a>
            <a href="/support" className="hover:text-white transition-colors">Support</a>
          </div>
        </div>
      </footer>
    </div>
  );
} 