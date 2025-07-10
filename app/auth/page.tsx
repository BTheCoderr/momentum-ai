'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    primaryGoal: '',
  });
  const router = useRouter();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.email) {
      alert('Please enter your email');
      return;
    }

    if (!isLogin && !formData.name) {
      alert('Please enter your name');
      return;
    }

    try {
      setLoading(true);
      
      if (isLogin) {
        // Sign in with Supabase
        const { data, error } = await supabase.auth.signInWithOtp({
          email: formData.email,
          options: {
            emailRedirectTo: `${window.location.origin}/dashboard`
          }
        });

        if (error) {
          throw error;
        }

        alert('Check your email for the login link!');
      } else {
        // Sign up with Supabase
        const { data, error } = await supabase.auth.signUp({
          email: formData.email,
          password: 'temporary-password-' + Math.random().toString(36),
          options: {
            emailRedirectTo: `${window.location.origin}/dashboard`,
            data: {
              name: formData.name,
              phone: formData.phone,
              primaryGoal: formData.primaryGoal,
            }
          }
        });

        if (error) {
          throw error;
        }

        alert('Check your email to verify your account!');
      }
      
    } catch (error: any) {
      console.error('Auth error:', error);
      alert(error.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-100">
      {/* Mobile-style Header with Consistent Logo */}
      <div className="bg-gradient-to-br from-orange-500 via-orange-600 to-red-500 px-6 pt-16 pb-12 rounded-b-3xl shadow-xl">
        <div className="text-center">
          <div className="flex items-center justify-center mb-6">
            <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-lg overflow-hidden">
              <img 
                src="/images/icon.png"
                alt="Momentum AI"
                className="w-12 h-12 rounded-full"
              />
            </div>
          </div>
          <h1 className="text-white text-3xl font-bold mb-2">Momentum AI</h1>
          <span className="bg-white/20 text-white text-sm px-3 py-1 rounded-full font-medium backdrop-blur">
            BETA
          </span>
          <p className="text-white/90 text-lg mt-4">
            {isLogin ? 'Welcome back!' : 'Start your journey to greatness'}
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-6 -mt-8 relative z-10">
        {/* Auth Form Card */}
        <div className="bg-white rounded-3xl shadow-2xl p-8 mb-6 border border-orange-100">
          <form onSubmit={handleAuth} className="space-y-6">
            {!isLogin && (
              <div>
                <label className="block text-sm font-bold text-gray-800 mb-2">
                  What's your name?
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="Enter your name"
                  className="w-full px-6 py-4 border-2 border-gray-200 rounded-2xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all text-lg font-medium bg-gray-50 focus:bg-white"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-bold text-gray-800 mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                placeholder="Enter your email"
                className="w-full px-6 py-4 border-2 border-gray-200 rounded-2xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all text-lg font-medium bg-gray-50 focus:bg-white"
                required
              />
            </div>

            {!isLogin && (
              <>
                <div>
                  <label className="block text-sm font-bold text-gray-800 mb-2">
                    Phone Number (Optional)
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    placeholder="Enter your phone number"
                    className="w-full px-6 py-4 border-2 border-gray-200 rounded-2xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all text-lg font-medium bg-gray-50 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-800 mb-2">
                    What's your main goal? 🎯
                  </label>
                  <textarea
                    value={formData.primaryGoal}
                    onChange={(e) => setFormData({...formData, primaryGoal: e.target.value})}
                    placeholder="I want to..."
                    rows={3}
                    className="w-full px-6 py-4 border-2 border-gray-200 rounded-2xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all text-lg font-medium bg-gray-50 focus:bg-white resize-none"
                  />
                </div>
              </>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold py-5 px-8 rounded-2xl hover:from-orange-600 hover:to-red-600 transition-all duration-200 shadow-lg hover:shadow-xl text-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin mr-3"></div>
                  {isLogin ? 'Sending magic link...' : 'Creating your account...'}
                </div>
              ) : (
                <div className="flex items-center justify-center">
                  <span className="mr-2">{isLogin ? '🚀' : '✨'}</span>
                  {isLogin ? 'Sign In & Start Building Momentum' : 'Create Account & Get Started'}
                </div>
              )}
            </button>

            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="w-full text-orange-600 hover:text-orange-700 font-bold text-lg transition-colors py-2"
            >
              {isLogin 
                ? "New here? Create your account" 
                : "Already have an account? Sign in"
              }
            </button>
          </form>
        </div>

        {/* Features Preview - Duolingo Style */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-orange-100 text-center">
            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-2xl">🤖</span>
            </div>
            <div className="text-sm font-bold text-gray-800">AI Coach</div>
            <div className="text-xs text-gray-600 mt-1">Personal guidance</div>
          </div>
          
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-orange-100 text-center">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-2xl">📊</span>
            </div>
            <div className="text-sm font-bold text-gray-800">Progress</div>
            <div className="text-xs text-gray-600 mt-1">Track everything</div>
          </div>
          
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-orange-100 text-center">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-2xl">🔥</span>
            </div>
            <div className="text-sm font-bold text-gray-800">Streaks</div>
            <div className="text-xs text-gray-600 mt-1">Stay motivated</div>
          </div>
        </div>

        {/* Social Proof */}
        <div className="bg-white rounded-3xl shadow-lg p-8 mb-6 border border-orange-100">
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <div className="flex -space-x-2">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                  A
                </div>
                <div className="w-12 h-12 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                  M
                </div>
                <div className="w-12 h-12 bg-gradient-to-r from-pink-400 to-red-500 rounded-full flex items-center justify-center text-white font-bold">
                  S
                </div>
              </div>
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              Join thousands building momentum
            </h3>
            <p className="text-gray-600 text-sm">
              Over 10k+ users have achieved their goals with AI-powered coaching
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 