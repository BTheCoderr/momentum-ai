'use client';

import React from 'react';
import { Target, Brain, Users, Calendar, Zap, CheckCircle, TrendingUp, Heart, MessageSquare, Trophy, Star } from 'lucide-react';

export default function LaunchPage() {
  const features = [
    {
      icon: Brain,
      title: 'AI-Powered Pattern Recognition',
      description: 'Discovers your personal productivity patterns and predicts motivation dips before they happen',
      highlight: 'Proprietary behavioral data that generic LLMs can\'t match'
    },
    {
      icon: Users,
      title: 'Accountability Pods',
      description: 'Join tiny 5-person groups for peer accountability and friendly competition',
      highlight: 'Real human social pressure that keeps you motivated'
    },
    {
      icon: Calendar,
      title: 'Smart Ecosystem Integration',
      description: 'Auto-schedule habits in your calendar, get Apple Watch reminders, connect to Slack',
      highlight: 'Seamless real-world integration beyond just chat'
    },
    {
      icon: Zap,
      title: 'Predictive Interventions',
      description: 'AI analyzes your patterns and intervenes proactively when you\'re likely to drift',
      highlight: 'Prevention is better than recovery'
    },
    {
      icon: TrendingUp,
      title: 'Longitudinal Insights',
      description: 'Track every check-in, mood, and context to surface insights like "you\'re 73% more successful at 9 AM"',
      highlight: 'Deep personalization that improves over time'
    },
    {
      icon: Heart,
      title: 'Emotional Connection',
      description: 'Focus on the deeper "why" behind your goals for lasting motivation',
      highlight: 'More than productivity - it\'s about life transformation'
    }
  ];

  const testimonials = [
    {
      name: 'Sarah K.',
      role: 'Entrepreneur',
      avatar: '👩‍💻',
      quote: 'Momentum AI predicted my motivation dip on Tuesday and sent me exactly the right nudge. It\'s like having a personal coach who knows me better than I know myself.',
      metric: '89% habit completion rate'
    },
    {
      name: 'Mike R.',
      role: 'Developer',
      avatar: '👨‍🎨',
      quote: 'The accountability pods changed everything. Knowing that 4 other people are counting on me makes skipping my coding practice impossible.',
      metric: '45-day coding streak'
    },
    {
      name: 'Emma L.',
      role: 'Writer',
      avatar: '👩‍🚀',
      quote: 'The calendar integration is genius. My writing time is automatically blocked, my phone goes to focus mode, and my coffee is ordered. It\'s like magic.',
      metric: '500 words daily for 67 days'
    }
  ];

  const stats = [
    { number: '73%', label: 'Average Success Rate', description: 'vs 23% for traditional habit trackers' },
    { number: '12x', label: 'Faster Goal Achievement', description: 'Through AI-powered interventions' },
    { number: '89%', label: 'User Retention', description: 'After 30 days (industry avg: 34%)' },
    { number: '5.2M', label: 'Data Points Analyzed', description: 'To create your personal patterns' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto text-center">
          <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700 px-6 py-3 rounded-full text-sm font-medium mb-8">
            <Trophy className="w-4 h-4" />
            <span>🚀 Launching on Product Hunt Today!</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-8">
            The AI Accountability Agent <br />
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              That Actually Works
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-600 mb-12 max-w-4xl mx-auto">
            Unlike generic habit trackers, Momentum AI learns your personal patterns, predicts when you'll drift, 
            and intervenes with the right nudge at the right time. It's like having a mini-therapist + detective 
            that keeps your dreams alive.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6 mb-16">
            <a 
              href="https://www.producthunt.com/posts/momentum-ai" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center space-x-3 px-8 py-4 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl font-bold text-lg hover:shadow-xl transition-all transform hover:scale-105"
            >
              <Trophy className="w-6 h-6" />
              <span>Hunt us on Product Hunt!</span>
            </a>
            <a 
              href="/" 
              className="flex items-center space-x-3 px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-bold text-lg hover:shadow-xl transition-all transform hover:scale-105"
            >
              <Target className="w-6 h-6" />
              <span>Try Momentum AI Free</span>
            </a>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-20">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-blue-600 mb-2">{stat.number}</div>
                <div className="text-lg font-semibold text-gray-900 mb-1">{stat.label}</div>
                <div className="text-sm text-gray-600">{stat.description}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Why Momentum AI Can't Be Replaced by ChatGPT
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We've built moats that generic LLMs simply can't match. Here's what makes us irreplaceable:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div key={index} className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-8 border border-gray-200 hover:border-blue-300 hover:shadow-xl transition-all">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center mb-6">
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">{feature.title}</h3>
                  <p className="text-gray-600 mb-4">{feature.description}</p>
                  <div className="bg-blue-50 rounded-lg p-3">
                    <p className="text-sm font-medium text-blue-800">💡 {feature.highlight}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-50 to-purple-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Real Results from Real Users
            </h2>
            <p className="text-xl text-gray-600">
              See how Momentum AI is transforming lives, one habit at a time
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200">
                <div className="flex items-center space-x-4 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-xl">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <div className="font-bold text-gray-900">{testimonial.name}</div>
                    <div className="text-sm text-gray-600">{testimonial.role}</div>
                  </div>
                </div>
                <p className="text-gray-700 mb-6 italic">"{testimonial.quote}"</p>
                <div className="bg-green-50 rounded-lg p-3">
                  <div className="text-sm font-medium text-green-800">📈 {testimonial.metric}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-8">
            Ready to Build Unstoppable Momentum?
          </h2>
          <p className="text-xl text-blue-100 mb-12">
            Join thousands of achievers who've discovered the power of AI-driven accountability
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6">
            <a 
              href="https://www.producthunt.com/posts/momentum-ai" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center space-x-3 px-8 py-4 bg-white text-blue-600 rounded-xl font-bold text-lg hover:shadow-xl transition-all transform hover:scale-105"
            >
              <Trophy className="w-6 h-6" />
              <span>Support us on Product Hunt</span>
            </a>
            <a 
              href="/" 
              className="flex items-center space-x-3 px-8 py-4 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl font-bold text-lg hover:shadow-xl transition-all transform hover:scale-105"
            >
              <Target className="w-6 h-6" />
              <span>Start Your Journey Free</span>
            </a>
          </div>

          <div className="mt-12 flex items-center justify-center space-x-8 text-blue-100">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5" />
              <span>Free to start</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5" />
              <span>No credit card required</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5" />
              <span>Cancel anytime</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 sm:px-6 lg:px-8 bg-gray-900">
        <div className="max-w-6xl mx-auto text-center">
          <div className="flex items-center justify-center space-x-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
              <Target className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-white">Momentum AI</h3>
          </div>
          <p className="text-gray-400 mb-8">
            Your AI Accountability Agent - Building the future of goal achievement
          </p>
          <div className="flex items-center justify-center space-x-8 text-gray-400">
            <a href="/" className="hover:text-white transition-colors">Home</a>
            <a href="/privacy" className="hover:text-white transition-colors">Privacy</a>
            <a href="/terms" className="hover:text-white transition-colors">Terms</a>
            <a href="/contact" className="hover:text-white transition-colors">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
} 