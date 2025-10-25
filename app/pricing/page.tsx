// Pricing Page - Coming Soon with Early Access
'use client';

import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useRouter } from 'next/navigation';

export default function PricingPage() {
  const router = useRouter();

  const plans = [
    {
      name: 'FREE',
      subtitle: 'Open Source',
      price: '$0',
      period: 'forever',
      description: 'Self-hosted dengan API keys sendiri',
      features: [
        'Self-hosted (unlimited)',
        'Full source code access',
        'All core features',
        'Unlimited projects',
        'Unlimited nodes',
        'AI Agents (with your API key)',
        'Export JSON/Markdown',
        'Community support',
        'MIT License',
      ],
      cta: 'Clone from GitHub',
      ctaLink: 'https://github.com/XenchinRyu7/SkripsiMate',
      badge: null,
      available: true,
    },
    {
      name: 'STARTER',
      subtitle: 'Cloud Hosted',
      price: '$9',
      period: '/month',
      description: 'Cloud hosting tanpa setup',
      features: [
        'Everything in FREE, plus:',
        'Cloud hosting (no setup!)',
        'Managed infrastructure',
        'Auto-backups daily',
        'SSL & security',
        '5 projects',
        '500 nodes per project',
        'Email support',
        '1,000 API requests/month',
      ],
      cta: 'Coming Soon',
      ctaLink: null,
      badge: '☁️ No Setup',
      available: false,
    },
    {
      name: 'PRO',
      subtitle: 'Cloud Hosted',
      price: '$29',
      period: '/month',
      description: 'Untuk teams dan power users',
      features: [
        'Everything in STARTER, plus:',
        'Unlimited projects',
        '5,000 nodes per project',
        '3 team members',
        'Priority support (< 4h)',
        '10,000 API requests/month',
        '50GB storage',
        'Custom domain',
        'Advanced analytics',
      ],
      cta: 'Coming Soon',
      ctaLink: null,
      badge: '🔥 Best Value',
      available: false,
    },
    {
      name: 'ENTERPRISE',
      subtitle: 'Custom',
      price: 'Contact Us',
      period: '',
      description: 'Untuk universities & institutions',
      features: [
        'Everything in PRO, plus:',
        'Unlimited everything',
        'Unlimited team members',
        'Dedicated infrastructure',
        '99.9% SLA guarantee',
        '24/7 phone support',
        'Custom integrations',
        'White-label solution',
        'Training & onboarding',
      ],
      cta: 'Contact Sales',
      ctaLink: 'mailto:saefulrohman@example.com?subject=SkripsiMate Enterprise Inquiry',
      badge: '🏢 Custom',
      available: true,
    },
  ];

  return (
    <div className="min-h-screen gradient-bg">
      {/* Header */}
      <div className="container mx-auto px-4 py-8">
        <button
          onClick={() => router.back()}
          className="mb-6 flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </button>

        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Flexible Pricing for Everyone
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Start free with self-hosted, upgrade to cloud when you need managed infrastructure
          </p>
        </div>

        {/* Coming Soon Banner */}
        <Card variant="glass-card" className="max-w-4xl mx-auto mb-12 text-center">
          <div className="p-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 text-blue-700 font-semibold mb-4">
              🚀 Cloud Plans Coming Soon
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Early Access Available!
            </h2>
            <p className="text-gray-600 mb-6">
              Cloud-hosted plans (Starter, Pro, Enterprise) are currently in development.
              Interested in early access or have special requirements?
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                variant="primary"
                onClick={() => window.location.href = 'mailto:saefulrohman@example.com?subject=SkripsiMate Early Access Request'}
              >
                📧 Request Early Access
              </Button>
              <Button
                variant="glass"
                onClick={() => router.push('/dashboard')}
              >
                Try Free Version
              </Button>
            </div>
            <p className="text-sm text-gray-500 mt-4">
              💡 <strong>Self-Hosted is Always FREE:</strong> Clone the repo and host it yourself with unlimited everything!
            </p>
          </div>
        </Card>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
          {plans.map((plan) => (
            <Card
              key={plan.name}
              variant="glass-card"
              className={`relative ${plan.badge === '🔥 Best Value' ? 'ring-2 ring-blue-500' : ''}`}
            >
              {plan.badge && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-blue-600 to-blue-500 text-white text-sm font-semibold whitespace-nowrap">
                  {plan.badge}
                </div>
              )}
              
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-1">{plan.name}</h3>
                <p className="text-sm text-gray-600 mb-4">{plan.subtitle}</p>
                
                <div className="mb-6">
                  <span className="text-3xl font-bold text-gray-900">{plan.price}</span>
                  {plan.period && <span className="text-gray-600">{plan.period}</span>}
                  <p className="text-sm text-gray-600 mt-2">{plan.description}</p>
                </div>

                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm text-gray-700">
                      {feature.startsWith('Everything') ? (
                        <span className="font-semibold">{feature}</span>
                      ) : (
                        <>
                          <svg
                            className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          <span>{feature}</span>
                        </>
                      )}
                    </li>
                  ))}
                </ul>

                {plan.available ? (
                  <Button
                    variant={plan.name === 'FREE' ? 'glass' : 'primary'}
                    className="w-full"
                    onClick={() => {
                      if (plan.ctaLink) {
                        window.open(plan.ctaLink, '_blank');
                      }
                    }}
                  >
                    {plan.cta}
                  </Button>
                ) : (
                  <Button variant="glass" className="w-full" disabled>
                    {plan.cta}
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>

        {/* FAQ Section */}
        <div className="max-w-3xl mx-auto mt-16">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">
            Frequently Asked Questions
          </h2>
          <div className="space-y-4">
            <Card variant="glass-card">
              <div className="p-6">
                <h3 className="font-bold text-gray-900 mb-2">
                  🤔 When will cloud plans be available?
                </h3>
                <p className="text-gray-600">
                  We're actively developing cloud-hosted plans. Request early access to be notified when they launch!
                </p>
              </div>
            </Card>

            <Card variant="glass-card">
              <div className="p-6">
                <h3 className="font-bold text-gray-900 mb-2">
                  👥 Can I collaborate with my team on the free plan?
                </h3>
                <p className="text-gray-600">
                  Collaboration features (invite members, real-time sync) are coming soon and will be available on Starter plans and above.
                </p>
              </div>
            </Card>

            <Card variant="glass-card">
              <div className="p-6">
                <h3 className="font-bold text-gray-900 mb-2">
                  🎓 Do you have student or academic discounts?
                </h3>
                <p className="text-gray-600">
                  Yes! Contact us for special pricing for students, researchers, and educational institutions.
                </p>
              </div>
            </Card>

            <Card variant="glass-card">
              <div className="p-6">
                <h3 className="font-bold text-gray-900 mb-2">
                  📖 Is SkripsiMate really open source?
                </h3>
                <p className="text-gray-600">
                  Yes! Licensed under MIT. You can view the code, modify it, and even deploy your own version. Cloud plans are just for convenience.
                </p>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

