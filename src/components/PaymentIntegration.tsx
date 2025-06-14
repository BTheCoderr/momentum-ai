import React, { useState, useEffect } from 'react';
import { CreditCard, Check, AlertCircle, Calendar, Download, RefreshCw, Crown, Shield, Zap } from 'lucide-react';

interface PaymentIntegrationProps {
  currentPlan: 'free' | 'pro' | 'enterprise';
  onPlanChange: (plan: string) => void;
}

interface BillingHistory {
  id: string;
  date: string;
  amount: number;
  plan: string;
  status: 'paid' | 'pending' | 'failed';
  invoice_url: string;
}

interface PaymentMethod {
  id: string;
  type: 'card';
  brand: string;
  last4: string;
  exp_month: number;
  exp_year: number;
  is_default: boolean;
}

export default function PaymentIntegration({ currentPlan, onPlanChange }: PaymentIntegrationProps) {
  const [loading, setLoading] = useState(false);
  const [showAddCard, setShowAddCard] = useState(false);
  const [billingHistory, setBillingHistory] = useState<BillingHistory[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [nextBillingDate, setNextBillingDate] = useState<string>('');

  // Mock data - in real app, fetch from API
  useEffect(() => {
    // Simulate API calls
    setBillingHistory([
      {
        id: 'inv_001',
        date: '2024-01-01',
        amount: 19.00,
        plan: 'Pro Monthly',
        status: 'paid',
        invoice_url: '#'
      },
      {
        id: 'inv_002',
        date: '2023-12-01',
        amount: 19.00,
        plan: 'Pro Monthly',
        status: 'paid',
        invoice_url: '#'
      },
      {
        id: 'inv_003',
        date: '2023-11-01',
        amount: 19.00,
        plan: 'Pro Monthly',
        status: 'paid',
        invoice_url: '#'
      }
    ]);

    setPaymentMethods([
      {
        id: 'pm_001',
        type: 'card',
        brand: 'visa',
        last4: '4242',
        exp_month: 12,
        exp_year: 2025,
        is_default: true
      }
    ]);

    setNextBillingDate('February 1, 2024');
  }, []);

  const handleStripeCheckout = async (planType: string, billingCycle: 'monthly' | 'yearly') => {
    setLoading(true);
    
    try {
      // In a real app, this would call your backend to create a Stripe checkout session
      const priceIds = {
        'pro-monthly': 'price_pro_monthly_id',
        'pro-yearly': 'price_pro_yearly_id',
        'enterprise-monthly': 'price_enterprise_monthly_id',
        'enterprise-yearly': 'price_enterprise_yearly_id'
      };

      const priceId = priceIds[`${planType}-${billingCycle}` as keyof typeof priceIds];
      
      // Simulate Stripe checkout
      console.log('Creating Stripe checkout session for:', { planType, billingCycle, priceId });
      
      // In real implementation:
      // const response = await fetch('/api/create-checkout-session', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ priceId, planType })
      // });
      // const { url } = await response.json();
      // window.location.href = url;

      // For demo, simulate success
      setTimeout(() => {
        alert(`Redirecting to Stripe checkout for ${planType} ${billingCycle} plan...`);
        onPlanChange(planType);
        setLoading(false);
      }, 2000);

    } catch (error) {
      console.error('Checkout error:', error);
      alert('Payment failed. Please try again.');
      setLoading(false);
    }
  };

  const handleCancelSubscription = async () => {
    if (!confirm('Are you sure you want to cancel your subscription? You\'ll lose access to premium features at the end of your billing period.')) {
      return;
    }

    setLoading(true);
    
    try {
      // In real app, call your backend to cancel subscription
      console.log('Canceling subscription...');
      
      setTimeout(() => {
        alert('Subscription canceled. You\'ll retain access until February 1, 2024.');
        setLoading(false);
      }, 1500);
    } catch (error) {
      console.error('Cancellation error:', error);
      alert('Failed to cancel subscription. Please contact support.');
      setLoading(false);
    }
  };

  const handleUpdatePaymentMethod = () => {
    // In real app, this would open Stripe's payment method update flow
    alert('Redirecting to update payment method...');
  };

  const downloadInvoice = (invoiceUrl: string) => {
    // In real app, this would download the actual invoice
    window.open(invoiceUrl, '_blank');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'text-green-600 bg-green-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'failed': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getBrandIcon = (brand: string) => {
    // In real app, you'd have actual brand icons
    return brand.toUpperCase();
  };

  return (
    <div className="space-y-8">
      {/* Current Subscription Status */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <Crown className="w-8 h-8 text-yellow-500" />
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Subscription</h2>
              <p className="text-gray-600">Manage your plan and billing</p>
            </div>
          </div>
          
          {currentPlan !== 'free' && (
            <div className="text-right">
              <div className="text-sm text-gray-500">Next billing date</div>
              <div className="font-semibold text-gray-900">{nextBillingDate}</div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Current Plan */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Zap className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Current Plan</h3>
                <p className="text-2xl font-bold text-blue-600 capitalize">{currentPlan}</p>
              </div>
            </div>
            
            {currentPlan === 'free' ? (
              <div className="space-y-3">
                <button
                  onClick={() => handleStripeCheckout('pro', 'monthly')}
                  disabled={loading}
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center space-x-2"
                >
                  {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Crown className="w-4 h-4" />}
                  <span>Upgrade to Pro</span>
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center space-x-2 text-green-600">
                  <Check className="w-4 h-4" />
                  <span className="text-sm">Active subscription</span>
                </div>
                <button
                  onClick={handleCancelSubscription}
                  disabled={loading}
                  className="w-full bg-red-100 text-red-700 py-2 px-4 rounded-lg hover:bg-red-200 disabled:opacity-50"
                >
                  Cancel Subscription
                </button>
              </div>
            )}
          </div>

          {/* Quick Upgrade Options */}
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-200">
            <h3 className="font-semibold text-gray-900 mb-4">Quick Upgrade</h3>
            <div className="space-y-3">
              <button
                onClick={() => handleStripeCheckout('pro', 'monthly')}
                disabled={loading || currentPlan === 'pro'}
                className="w-full bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 disabled:opacity-50 text-sm"
              >
                Pro Monthly - $19
              </button>
              <button
                onClick={() => handleStripeCheckout('pro', 'yearly')}
                disabled={loading || currentPlan === 'pro'}
                className="w-full bg-purple-100 text-purple-700 py-2 px-4 rounded-lg hover:bg-purple-200 disabled:opacity-50 text-sm"
              >
                Pro Yearly - $190 (Save 17%)
              </button>
            </div>
          </div>

          {/* Payment Method */}
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
            <h3 className="font-semibold text-gray-900 mb-4">Payment Method</h3>
            {paymentMethods.length > 0 ? (
              <div className="space-y-3">
                {paymentMethods.map((method) => (
                  <div key={method.id} className="flex items-center space-x-3">
                    <CreditCard className="w-5 h-5 text-gray-400" />
                    <div className="flex-1">
                      <div className="text-sm font-medium">
                        {getBrandIcon(method.brand)} •••• {method.last4}
                      </div>
                      <div className="text-xs text-gray-500">
                        Expires {method.exp_month}/{method.exp_year}
                      </div>
                    </div>
                  </div>
                ))}
                <button
                  onClick={handleUpdatePaymentMethod}
                  className="w-full bg-green-100 text-green-700 py-2 px-4 rounded-lg hover:bg-green-200 text-sm"
                >
                  Update Payment Method
                </button>
              </div>
            ) : (
              <div className="text-center">
                <CreditCard className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-gray-500 mb-3">No payment method</p>
                <button
                  onClick={() => setShowAddCard(true)}
                  className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 text-sm"
                >
                  Add Payment Method
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Billing History */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-900">Billing History</h3>
          <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
            View All
          </button>
        </div>

        {billingHistory.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Date</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Plan</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Amount</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Invoice</th>
                </tr>
              </thead>
              <tbody>
                {billingHistory.map((bill) => (
                  <tr key={bill.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 text-gray-900">
                      {new Date(bill.date).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 text-gray-900">{bill.plan}</td>
                    <td className="py-3 px-4 text-gray-900">${bill.amount.toFixed(2)}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(bill.status)}`}>
                        {bill.status.charAt(0).toUpperCase() + bill.status.slice(1)}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => downloadInvoice(bill.invoice_url)}
                        className="text-blue-600 hover:text-blue-700 flex items-center space-x-1"
                      >
                        <Download className="w-4 h-4" />
                        <span>Download</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8">
            <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No billing history yet</p>
            <p className="text-sm text-gray-400">Your invoices will appear here after your first payment</p>
          </div>
        )}
      </div>

      {/* Security & Trust */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-200">
        <div className="flex items-center space-x-4">
          <Shield className="w-12 h-12 text-blue-600" />
          <div>
            <h3 className="text-lg font-semibold text-blue-900">Secure Payments</h3>
            <p className="text-blue-700">
              All payments are processed securely through Stripe. We never store your payment information.
            </p>
          </div>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          <div className="text-center">
            <div className="w-12 h-8 bg-white rounded border flex items-center justify-center mx-auto mb-2">
              <span className="text-xs font-bold text-blue-600">VISA</span>
            </div>
            <span className="text-xs text-blue-700">Visa</span>
          </div>
          <div className="text-center">
            <div className="w-12 h-8 bg-white rounded border flex items-center justify-center mx-auto mb-2">
              <span className="text-xs font-bold text-red-600">MC</span>
            </div>
            <span className="text-xs text-blue-700">Mastercard</span>
          </div>
          <div className="text-center">
            <div className="w-12 h-8 bg-white rounded border flex items-center justify-center mx-auto mb-2">
              <span className="text-xs font-bold text-blue-600">AMEX</span>
            </div>
            <span className="text-xs text-blue-700">American Express</span>
          </div>
          <div className="text-center">
            <div className="w-12 h-8 bg-white rounded border flex items-center justify-center mx-auto mb-2">
              <span className="text-xs font-bold text-gray-600">SSL</span>
            </div>
            <span className="text-xs text-blue-700">256-bit SSL</span>
          </div>
        </div>
      </div>

      {/* Loading Overlay */}
      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 max-w-sm mx-4">
            <div className="text-center">
              <RefreshCw className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Processing...</h3>
              <p className="text-gray-600">Please wait while we process your request.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 