import React, { useState } from 'react';
import { Crown, Settings, CreditCard, Calendar, AlertCircle, CheckCircle, RefreshCw, Bell, Shield } from 'lucide-react';
import PremiumFeatures from './PremiumFeatures';
import PaymentIntegration from './PaymentIntegration';

interface SubscriptionManagerProps {
  onClose: () => void;
}

interface UserSubscription {
  plan: 'free' | 'pro' | 'enterprise';
  status: 'active' | 'canceled' | 'past_due' | 'trialing';
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  trialEnd?: string;
}

export default function SubscriptionManager({ onClose }: SubscriptionManagerProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'plans' | 'billing' | 'settings'>('overview');
  const [subscription, setSubscription] = useState<UserSubscription>({
    plan: 'free',
    status: 'active',
    currentPeriodEnd: '2024-02-01',
    cancelAtPeriodEnd: false
  });
  const [loading, setLoading] = useState(false);
  const [notifications, setNotifications] = useState({
    billing: true,
    features: true,
    marketing: false
  });

  const handlePlanUpgrade = async (newPlan: string) => {
    setLoading(true);
    
    try {
      console.log('Upgrading to plan:', newPlan);
      
      setTimeout(() => {
        setSubscription(prev => ({
          ...prev,
          plan: newPlan as 'free' | 'pro' | 'enterprise',
          status: newPlan === 'free' ? 'active' : 'trialing',
          trialEnd: newPlan !== 'free' ? '2024-01-21' : undefined
        }));
        setLoading(false);
        
        alert(`Successfully upgraded to ${newPlan} plan! ${newPlan !== 'free' ? 'Your 7-day free trial has started.' : ''}`);
      }, 2000);
    } catch (error) {
      console.error('Upgrade failed:', error);
      setLoading(false);
      alert('Upgrade failed. Please try again.');
    }
  };

  const handleCancelSubscription = async () => {
    if (!confirm('Are you sure you want to cancel your subscription?')) {
      return;
    }

    setLoading(true);
    
    try {
      setTimeout(() => {
        setSubscription(prev => ({
          ...prev,
          cancelAtPeriodEnd: true,
          status: 'canceled'
        }));
        setLoading(false);
        alert('Subscription canceled. You\'ll retain access until your current period ends.');
      }, 1500);
    } catch (error) {
      console.error('Cancellation failed:', error);
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100';
      case 'trialing': return 'text-blue-600 bg-blue-100';
      case 'canceled': return 'text-red-600 bg-red-100';
      case 'past_due': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getPlanFeatures = (plan: string) => {
    const features = {
      free: ['Up to 3 goals', 'Basic AI coaching', 'Community access'],
      pro: ['Unlimited goals', 'Advanced AI coaching', 'Predictive analytics', 'Priority support'],
      enterprise: ['Everything in Pro', 'Team management', 'Custom integrations', 'Dedicated support']
    };
    return features[plan as keyof typeof features] || [];
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Crown className="w-8 h-8" />
              <div>
                <h2 className="text-2xl font-bold">Subscription Management</h2>
                <p className="text-blue-100">Manage your plan, billing, and preferences</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 text-2xl font-bold"
            >
              ×
            </button>
          </div>

          {/* Tab Navigation */}
          <div className="flex space-x-6 mt-6">
            {[
              { id: 'overview', label: 'Overview', icon: Settings },
              { id: 'plans', label: 'Plans & Pricing', icon: Crown },
              { id: 'billing', label: 'Billing', icon: CreditCard },
              { id: 'settings', label: 'Settings', icon: Bell }
            ].map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                    activeTab === tab.id
                      ? 'bg-white bg-opacity-20 text-white'
                      : 'text-blue-100 hover:text-white hover:bg-white hover:bg-opacity-10'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Current Subscription Status */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Current Subscription</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Crown className="w-8 h-8 text-blue-600" />
                    </div>
                    <h4 className="font-semibold text-gray-900 capitalize">{subscription.plan} Plan</h4>
                    <p className="text-sm text-gray-600">Current plan</p>
                  </div>

                  <div className="text-center">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <CheckCircle className="w-8 h-8 text-green-600" />
                    </div>
                    <h4 className="font-semibold text-gray-900">
                      <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(subscription.status)}`}>
                        {subscription.status.charAt(0).toUpperCase() + subscription.status.slice(1)}
                      </span>
                    </h4>
                    <p className="text-sm text-gray-600">Status</p>
                  </div>

                  <div className="text-center">
                    <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Calendar className="w-8 h-8 text-purple-600" />
                    </div>
                    <h4 className="font-semibold text-gray-900">
                      {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
                    </h4>
                    <p className="text-sm text-gray-600">
                      {subscription.cancelAtPeriodEnd ? 'Cancels on' : 'Renews on'}
                    </p>
                  </div>
                </div>

                {/* Trial Notice */}
                {subscription.status === 'trialing' && subscription.trialEnd && (
                  <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center space-x-3">
                      <AlertCircle className="w-5 h-5 text-blue-600" />
                      <div>
                        <h4 className="font-medium text-blue-900">Free Trial Active</h4>
                        <p className="text-sm text-blue-700">
                          Your trial ends on {new Date(subscription.trialEnd).toLocaleDateString()}. 
                          Add a payment method to continue with premium features.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Current Plan Features */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Your Plan Features</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {getPlanFeatures(subscription.plan).map((feature, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <span className="text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>
                
                {subscription.plan === 'free' && (
                  <div className="mt-6 text-center">
                    <button
                      onClick={() => setActiveTab('plans')}
                      className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
                    >
                      Upgrade to Unlock More Features
                    </button>
                  </div>
                )}
              </div>

              {/* Quick Actions */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <button
                    onClick={() => setActiveTab('plans')}
                    className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                  >
                    <Crown className="w-6 h-6 text-blue-600" />
                    <div className="text-left">
                      <h4 className="font-medium text-gray-900">Change Plan</h4>
                      <p className="text-sm text-gray-600">Upgrade or downgrade</p>
                    </div>
                  </button>

                  <button
                    onClick={() => setActiveTab('billing')}
                    className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                  >
                    <CreditCard className="w-6 h-6 text-green-600" />
                    <div className="text-left">
                      <h4 className="font-medium text-gray-900">Billing</h4>
                      <p className="text-sm text-gray-600">Payment & invoices</p>
                    </div>
                  </button>

                  <button
                    onClick={() => setActiveTab('settings')}
                    className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                  >
                    <Settings className="w-6 h-6 text-purple-600" />
                    <div className="text-left">
                      <h4 className="font-medium text-gray-900">Settings</h4>
                      <p className="text-sm text-gray-600">Preferences</p>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'plans' && (
            <PremiumFeatures
              currentPlan={subscription.plan}
              onUpgrade={handlePlanUpgrade}
            />
          )}

          {activeTab === 'billing' && (
            <PaymentIntegration
              currentPlan={subscription.plan}
              onPlanChange={handlePlanUpgrade}
            />
          )}

          {activeTab === 'settings' && (
            <div className="space-y-6">
              {/* Notification Preferences */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Notification Preferences</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-gray-900">Billing Notifications</h4>
                      <p className="text-sm text-gray-600">Get notified about payments and billing issues</p>
                    </div>
                    <button
                      onClick={() => setNotifications(prev => ({ ...prev, billing: !prev.billing }))}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        notifications.billing ? 'bg-blue-600' : 'bg-gray-200'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          notifications.billing ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-gray-900">Feature Updates</h4>
                      <p className="text-sm text-gray-600">Get notified about new features and improvements</p>
                    </div>
                    <button
                      onClick={() => setNotifications(prev => ({ ...prev, features: !prev.features }))}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        notifications.features ? 'bg-blue-600' : 'bg-gray-200'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          notifications.features ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-gray-900">Marketing Communications</h4>
                      <p className="text-sm text-gray-600">Receive tips, guides, and promotional content</p>
                    </div>
                    <button
                      onClick={() => setNotifications(prev => ({ ...prev, marketing: !prev.marketing }))}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        notifications.marketing ? 'bg-blue-600' : 'bg-gray-200'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          notifications.marketing ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>

              {/* Account Actions */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Account Actions</h3>
                <div className="space-y-4">
                  {subscription.plan !== 'free' && !subscription.cancelAtPeriodEnd && (
                    <button
                      onClick={handleCancelSubscription}
                      disabled={loading}
                      className="w-full bg-red-100 text-red-700 py-3 px-4 rounded-lg hover:bg-red-200 disabled:opacity-50 flex items-center justify-center space-x-2"
                    >
                      {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <AlertCircle className="w-4 h-4" />}
                      <span>Cancel Subscription</span>
                    </button>
                  )}

                  <button className="w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-200">
                    Export Account Data
                  </button>

                  <button className="w-full bg-red-600 text-white py-3 px-4 rounded-lg hover:bg-red-700">
                    Delete Account
                  </button>
                </div>
              </div>

              {/* Support */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200 p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <Shield className="w-8 h-8 text-blue-600" />
                  <div>
                    <h3 className="text-lg font-bold text-blue-900">Need Help?</h3>
                    <p className="text-blue-700">Our support team is here to help</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <button className="bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700">
                    Contact Support
                  </button>
                  <button className="bg-white text-blue-600 border border-blue-600 py-2 px-4 rounded-lg hover:bg-blue-50">
                    View Help Center
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Loading Overlay */}
        {loading && (
          <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center">
            <div className="text-center">
              <RefreshCw className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-4" />
              <p className="text-gray-600">Processing your request...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 