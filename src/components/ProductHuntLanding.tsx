import React, { useState, useEffect } from 'react';
import { Target, Brain, Users, TrendingUp, Star, ArrowRight, CheckCircle, Zap, Heart, Calendar } from 'lucide-react';
import { analytics, trackUserJourney } from '@/lib/analytics';
import LoginButton from './LoginButton';

interface ProductHuntLandingProps {
  onGetStarted: () => void;
}

export default function ProductHuntLanding({ onGetStarted }: ProductHuntLandingProps) {
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  useEffect(() => {
    // Track Product Hunt landing page view
    analytics.track('product_hunt_landing_viewed', {
      timestamp: new Date().toISOString(),
      source: 'product_hunt'
    });
  }, []);

  const testimonials = [
    {
      text: "Finally, an app that gets WHY I want to achieve my goals, not just WHAT they are.",
      author: "Sarah K.",
      role: "Beta User #23",
      rating: 5
    },
    {
      text: "The AI coaching feels like having a therapist who actually remembers our conversations.",
      author: "Marcus T.",
      role: "Beta User #7",
      rating: 5
    },
    {
      text: "I've tried every habit app. This is the first one that made me cry (happy tears!).",
      author: "Jennifer L.",
      role: "Beta User #41",
      rating: 5
    }
  ];

  const features = [
    {
      icon: Brain,
      title: "AI Emotional Intelligence",
      description: "Your AI coach learns your emotional patterns and intervenes before you give up"
    },
    {
      icon: Users,
      title: "Tiny Accountability Pods",
      description: "Join 5-person groups for real human connection and peer support"
    },
    {
      icon: TrendingUp,
      title: "Predictive Insights",
      description: "Get warned 3 days before you're likely to quit based on your behavior patterns"
    },
    {
      icon: Heart,
      title: "Emotional Why Tracking",
      description: "Connect daily actions to your deeper motivations and life dreams"
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [testimonials.length]);

  const handleGetStarted = () => {
    trackUserJourney.signup('product_hunt');
    analytics.track('product_hunt_cta_clicked', {
      section: 'hero',
      timestamp: new Date().toISOString()
    });
    onGetStarted();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Product Hunt Badge */}
      <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white py-2">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="flex items-center justify-center space-x-2 text-sm font-medium">
            <span>🚀</span>
            <span>We're live on Product Hunt today!</span>
            <a 
              href="https://www.producthunt.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="underline hover:no-underline"
              onClick={() => analytics.track('product_hunt_badge_clicked')}
            >
              Support us →
            </a>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center space-x-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
              <Star className="w-4 h-4" />
              <span>Featured on Product Hunt</span>
            </div>
            
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              Your AI Accountability Agent <br />
              <span className="bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent">
                That Actually Cares
              </span>
            </h1>
            
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Unlike other apps that just track habits, Momentum AI understands the emotional "why" behind your goals. 
              It predicts when you'll give up and intervenes with personalized coaching before you do.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4 mb-12">
              <button
                onClick={handleGetStarted}
                className="flex items-center space-x-2 px-8 py-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl font-semibold text-lg hover:shadow-xl transition-all transform hover:scale-105"
              >
                <span>Start Free Beta</span>
                <ArrowRight className="w-5 h-5" />
              </button>
              
              <div className="flex items-center space-x-2 text-gray-600">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span>Free for first 100 users</span>
              </div>
            </div>

            {/* Social Proof */}
            <div className="flex items-center justify-center space-x-8 text-sm text-gray-500">
              <div className="flex items-center space-x-1">
                <span className="font-semibold text-gray-900">47</span>
                <span>beta users</span>
              </div>
              <div className="flex items-center space-x-1">
                <span className="font-semibold text-gray-900">4.9/5</span>
                <div className="flex space-x-1">
                  {[1,2,3,4,5].map(i => (
                    <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                  ))}
                </div>
              </div>
              <div className="flex items-center space-x-1">
                <span className="font-semibold text-gray-900">89%</span>
                <span>goal completion rate</span>
              </div>
            </div>
          </div>

          {/* Hero Visual */}
          <div className="relative">
            <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
              <div className="bg-gradient-to-r from-orange-500 to-orange-600 px-6 py-4">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                    <Target className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-white font-semibold">Momentum AI Dashboard</h3>
                </div>
              </div>
              
              <div className="p-6 space-y-4">
                <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                    <div>
                      <div className="font-medium text-gray-900">Write 500 words daily</div>
                      <div className="text-sm text-gray-600">12-day streak • 89% completion</div>
                    </div>
                  </div>
                  <div className="text-2xl">🔥</div>
                </div>
                
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-start space-x-3">
                    <Brain className="w-6 h-6 text-blue-600 mt-1" />
                    <div>
                      <div className="font-medium text-blue-900 mb-2">AI Insight</div>
                      <p className="text-blue-800 text-sm">
                        "I notice you write best at 6 AM when you're feeling inspired about sharing your story. 
                        Your completion rate drops 73% when you skip your morning coffee ritual. Want to protect that time?"
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Why Momentum AI Works When Others Don't
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Most apps focus on tracking. We focus on the emotional connection that keeps you going when motivation fades.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="p-6 rounded-xl border border-gray-200 hover:shadow-lg transition-shadow">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-gradient-to-r from-blue-50 to-purple-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-12">What Beta Users Are Saying</h2>
          
          <div className="relative">
            <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200">
              <div className="flex justify-center mb-4">
                {[1,2,3,4,5].map(i => (
                  <Star key={i} className="w-6 h-6 text-yellow-400 fill-current" />
                ))}
              </div>
              
              <blockquote className="text-xl text-gray-800 mb-6 italic">
                "{testimonials[currentTestimonial].text}"
              </blockquote>
              
              <div className="flex items-center justify-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold">
                    {testimonials[currentTestimonial].author.charAt(0)}
                  </span>
                </div>
                <div>
                  <div className="font-semibold text-gray-900">{testimonials[currentTestimonial].author}</div>
                  <div className="text-sm text-gray-600">{testimonials[currentTestimonial].role}</div>
                </div>
              </div>
            </div>
            
            {/* Testimonial indicators */}
            <div className="flex justify-center space-x-2 mt-6">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentTestimonial(index)}
                  className={`w-3 h-3 rounded-full transition-colors ${
                    index === currentTestimonial ? 'bg-blue-600' : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Stay Connected to Your Dreams?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join 47 beta users who are achieving their goals with AI that actually understands them.
          </p>
          
          <div className="space-y-4">
            <button
              onClick={handleGetStarted}
              className="inline-flex items-center space-x-2 px-8 py-4 bg-white text-blue-600 rounded-xl font-semibold text-lg hover:shadow-xl transition-all transform hover:scale-105"
            >
              <span>Start Your Free Beta</span>
              <ArrowRight className="w-5 h-5" />
            </button>
            
            <div className="flex items-center justify-center space-x-6 text-blue-100 text-sm">
              <div className="flex items-center space-x-1">
                <CheckCircle className="w-4 h-4" />
                <span>Free for first 100 users</span>
              </div>
              <div className="flex items-center space-x-1">
                <CheckCircle className="w-4 h-4" />
                <span>No credit card required</span>
              </div>
              <div className="flex items-center space-x-1">
                <CheckCircle className="w-4 h-4" />
                <span>Lifetime premium access</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <Target className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold">Momentum AI</span>
            </div>
            
            <div className="text-sm text-gray-400">
              © 2024 Momentum AI. Built with ❤️ for dreamers who don't give up.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
} 