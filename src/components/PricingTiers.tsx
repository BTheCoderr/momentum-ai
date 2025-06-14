import { Check, Star } from 'lucide-react';

const tiers = [
  {
    name: 'Free',
    price: '0',
    description: 'Perfect for getting started with goal tracking',
    features: [
      'Basic goal tracking (up to 2 goals)',
      'Simple AI check-ins',
      'Basic progress dashboard',
      'Weekly insights summary',
      'Community read access'
    ],
    cta: 'Get Started',
    popular: false
  },
  {
    name: 'Pro',
    price: '9.99',
    description: 'For serious goal achievers who want AI guidance',
    features: [
      'Unlimited goals',
      'Daily AI coaching sessions',
      'Advanced analytics & insights',
      'Custom intervention scheduling',
      'Community participation',
      'Priority support'
    ],
    cta: 'Upgrade to Pro',
    popular: true
  },
  {
    name: 'Elite',
    price: '24.99',
    description: 'The ultimate AI-powered accountability system',
    features: [
      'Everything in Pro',
      'Personal AI strategy sessions',
      'Predictive goal forecasting',
      'Custom AI personality',
      '1-on-1 coaching sessions',
      'VIP community access'
    ],
    cta: 'Go Elite',
    popular: false
  }
];

export default function PricingTiers() {
  return (
    <div className="py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl mb-4">
            Choose Your Growth Path
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Select the perfect plan to amplify your goal achievement with AI-powered accountability
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {tiers.map((tier) => (
            <div
              key={tier.name}
              className={`relative rounded-2xl bg-white p-8 shadow-sm border ${
                tier.popular ? 'border-purple-200' : 'border-gray-200'
              }`}
            >
              {tier.popular && (
                <div className="absolute -top-4 left-0 right-0 mx-auto w-32">
                  <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-sm font-medium px-4 py-1 rounded-full flex items-center justify-center space-x-1">
                    <Star className="w-4 h-4" />
                    <span>Most Popular</span>
                  </div>
                </div>
              )}

              <div className="mb-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{tier.name}</h3>
                <div className="flex items-baseline mb-2">
                  <span className="text-4xl font-bold text-gray-900">${tier.price}</span>
                  <span className="text-gray-500 ml-1">/month</span>
                </div>
                <p className="text-gray-600">{tier.description}</p>
              </div>

              <ul className="space-y-4 mb-8">
                {tier.features.map((feature) => (
                  <li key={feature} className="flex items-start">
                    <div className={`flex-shrink-0 w-5 h-5 rounded-full ${
                      tier.popular ? 'bg-purple-100' : 'bg-blue-100'
                    } flex items-center justify-center mt-1`}>
                      <Check className={`w-3 h-3 ${
                        tier.popular ? 'text-purple-600' : 'text-blue-600'
                      }`} />
                    </div>
                    <span className="ml-3 text-gray-600">{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                className={`w-full py-3 px-6 rounded-lg text-center font-medium transition-colors ${
                  tier.popular
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600'
                    : tier.name === 'Free'
                    ? 'bg-gray-900 text-white hover:bg-gray-800'
                    : 'bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:from-blue-600 hover:to-purple-600'
                }`}
              >
                {tier.cta}
              </button>
            </div>
          ))}
        </div>

        {/* Features Comparison */}
        <div className="mt-16 text-center">
          <h3 className="text-2xl font-bold text-gray-900 mb-8">Compare All Features</h3>
          <div className="inline-flex items-center space-x-2 bg-purple-50 rounded-full px-4 py-2">
            <Star className="w-5 h-5 text-purple-600" />
            <span className="text-purple-700 font-medium">Pro features unlocked instantly</span>
          </div>
        </div>
      </div>
    </div>
  );
} 