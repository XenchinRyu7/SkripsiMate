// Settings Page - Profile, Subscription, and Account
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthContext } from '@/contexts/AuthContext';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useToast } from '@/components/ui/Toast';
import AISettings from '@/components/settings/AISettings';
import { User, CreditCard, Settings as SettingsIcon, Bot, Cloud, Home } from 'lucide-react';

type TabType = 'profile' | 'subscription' | 'account' | 'ai';

export default function SettingsPage() {
  const router = useRouter();
  const { user, loading } = useAuthContext();
  const toast = useToast();
  
  // Check URL for tab parameter
  const [activeTab, setActiveTab] = useState<TabType>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const tab = params.get('tab');
      if (tab === 'subscription' || tab === 'account') {
        return tab as TabType;
      }
    }
    return 'profile';
  });
  
  // Profile state
  const [displayName, setDisplayName] = useState('');
  const [saving, setSaving] = useState(false);
  
  // Subscription state
  const [subscription, setSubscription] = useState<any>({
    plan: 'free',
    status: 'active',
    projects_count: 0,
    nodes_count: 0,
    max_projects: 0,
    max_nodes: 0,
    is_self_hosted: false,
  });
  const [couponCode, setCouponCode] = useState('');
  const [redeeming, setRedeeming] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      setDisplayName(user.displayName || user.email || '');
      loadSubscription();
    }
  }, [user]);

  const loadSubscription = async () => {
    if (!user) return;
    
    try {
      // Use check-limits API which includes deployment mode info
      const response = await fetch('/api/user/check-limits', {
        headers: {
          'x-user-id': user.uid,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setSubscription({
          plan: data.plan || 'free',
          status: data.status || 'active',
          projects_count: data.current_projects || 0,
          max_projects: data.max_projects || 0,
          max_nodes: data.max_nodes || 0,
          max_members: data.max_members || 0,
          is_self_hosted: data.is_self_hosted || false,
          is_active: data.is_active || false,
        });
      } else {
        console.error('Failed to load subscription:', response.status);
      }
    } catch (error) {
      console.error('Failed to load subscription:', error);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      // Firebase updateProfile would go here
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      toast.success('Profile updated successfully!');
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleRedeemCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim()) return;
    if (!user) {
      toast.error('User not authenticated');
      return;
    }

    setRedeeming(true);
    try {
      const response = await fetch('/api/user/redeem', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-user-id': user.uid,
        },
        body: JSON.stringify({ code: couponCode }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('🎉 Coupon redeemed successfully!');
        setCouponCode('');
        loadSubscription();
      } else {
        toast.error(data.error || 'Failed to redeem coupon');
      }
    } catch (error) {
      toast.error('Failed to redeem coupon. Please try again.');
    } finally {
      setRedeeming(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading settings...</p>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'profile' as TabType, label: 'Profile', icon: User },
    { id: 'subscription' as TabType, label: 'Subscription', icon: CreditCard },
    { id: 'account' as TabType, label: 'Account', icon: SettingsIcon },
    // AI Settings tab only for self-hosted
    ...(subscription.is_self_hosted ? [{ id: 'ai' as TabType, label: 'AI Settings', icon: Bot }] : []),
  ];

  return (
    <div className="min-h-screen gradient-bg">
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Settings</h1>
            <p className="text-gray-600 dark:text-gray-400">Manage your account and preferences</p>
          </div>
          <Button variant="glass" onClick={() => router.push('/dashboard')}>
            Back to Dashboard
          </Button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {tabs.map((tab) => {
            const IconComponent = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-3 rounded-lg font-medium transition-all flex items-center gap-2 ${
                  activeTab === tab.id
                    ? 'bg-white/90 dark:bg-gray-800/90 text-gray-900 dark:text-white shadow-md'
                    : 'bg-white/50 dark:bg-gray-800/50 text-gray-600 dark:text-gray-400 hover:bg-white/70 dark:hover:bg-gray-800/70'
                }`}
              >
                <IconComponent className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <Card variant="glass-card">
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-6">Profile Information</h2>
              
              <form onSubmit={handleSaveProfile} className="space-y-4">
                <div>
                  <Input
                    label="Email"
                    type="email"
                    value={user?.email || ''}
                    disabled
                    icon={
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                      </svg>
                    }
                  />
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Email cannot be changed</p>
                </div>

                <Input
                  label="Display Name"
                  placeholder="Your name"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  icon={
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  }
                />

                <div className="pt-4">
                  <Button type="submit" variant="primary" isLoading={saving} disabled={saving}>
                    Save Changes
                  </Button>
                </div>
              </form>
            </div>
          </Card>
        )}

        {/* Subscription Tab */}
        {activeTab === 'subscription' && (
          <div className="space-y-6">
            {/* Deployment Mode Info */}
            <Card variant="glass-card">
              <div className="p-6">
                <div className={`flex items-center gap-4 p-4 rounded-lg ${
                  process.env.NEXT_PUBLIC_DEPLOYMENT_MODE === 'cloud'
                    ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800'
                    : 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
                }`}>
                  <div className={`p-3 rounded-lg ${
                    process.env.NEXT_PUBLIC_DEPLOYMENT_MODE === 'cloud'
                      ? 'bg-blue-100 dark:bg-blue-900/40'
                      : 'bg-green-100 dark:bg-green-900/40'
                  }`}>
                    {process.env.NEXT_PUBLIC_DEPLOYMENT_MODE === 'cloud' 
                      ? <Cloud className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                      : <Home className="w-6 h-6 text-green-600 dark:text-green-400" />
                    }
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-1">
                      {process.env.NEXT_PUBLIC_DEPLOYMENT_MODE === 'cloud' 
                        ? 'Cloud Deployment' 
                        : 'Self-Hosted Deployment'
                      }
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {process.env.NEXT_PUBLIC_DEPLOYMENT_MODE === 'cloud'
                        ? 'Your usage is managed by subscription plans. Redeem coupon codes or upgrade to increase limits.'
                        : 'You have unlimited access to all features. No subscription or limits required for self-hosted deployments.'
                      }
                    </p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Current Plan */}
            <Card variant="glass-card">
              <div className="p-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-6">Current Plan</h2>
                
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-2xl font-bold text-gray-900 dark:text-gray-100 uppercase">
                        {subscription.plan}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                        subscription.status === 'active' 
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-700 dark:text-gray-300'
                      }`}>
                        {subscription.status === 'active' ? '● Active' : '● Inactive'}
                      </span>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400">
                      {subscription.is_self_hosted
                        ? 'Self-hosted deployment with unlimited access'
                        : subscription.plan === 'none'
                        ? 'No active subscription - Please redeem a coupon or upgrade'
                        : `Cloud-hosted with ${subscription.plan} plan`
                      }
                    </p>
                  </div>
                  
                  {/* Only show View Plans button in cloud mode */}
                  {process.env.NEXT_PUBLIC_DEPLOYMENT_MODE === 'cloud' && (
                    <Button 
                      variant="primary"
                      onClick={() => router.push('/pricing')}
                    >
                      View Plans
                    </Button>
                  )}
                </div>

                {/* Usage Stats */}
                <div className="grid md:grid-cols-3 gap-4 pt-6 border-t">
                  <div>
                    <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Projects</div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                      {subscription.projects_count}
                      <span className="text-sm font-normal text-gray-600 dark:text-gray-400 ml-2">
                        / {subscription.max_projects >= 999999 ? 'Unlimited' : subscription.max_projects}
                      </span>
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Max Nodes/Project</div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                      {subscription.max_nodes >= 999999 ? '∞' : subscription.max_nodes}
                      <span className="text-sm font-normal text-gray-600 dark:text-gray-400 ml-2">
                        {subscription.max_nodes >= 999999 ? 'Unlimited' : 'per project'}
                      </span>
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Team Members</div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                      {subscription.max_members >= 999999 ? '∞' : subscription.max_members}
                      <span className="text-sm font-normal text-gray-600 dark:text-gray-400 ml-2">
                        {subscription.max_members >= 999999 ? 'Unlimited' : 'max'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Redeem Coupon - Only in cloud mode */}
            {process.env.NEXT_PUBLIC_DEPLOYMENT_MODE === 'cloud' && (
              <Card variant="glass-card">
                <div className="p-6">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">Redeem Coupon</h2>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    Have a coupon code? Redeem it here for early access or special plans.
                  </p>
                  
                  <form onSubmit={handleRedeemCoupon} className="flex gap-3">
                    <Input
                      placeholder="Enter coupon code"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                      className="flex-1"
                    />
                    <Button 
                      type="submit" 
                      variant="primary"
                      isLoading={redeeming}
                      disabled={redeeming || !couponCode.trim()}
                    >
                      Redeem
                    </Button>
                  </form>
                  
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-3">
                    💡 Cloud-hosted plans are coming soon. Coupon codes for early access partners only.
                  </p>
                </div>
              </Card>
            )}
          </div>
        )}

        {/* Account Tab */}
        {activeTab === 'account' && (
          <div className="space-y-6">
            <Card variant="glass-card">
              <div className="p-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-6">Account Settings</h2>
                
                <div className="space-y-6">
                  {/* Deployment Mode */}
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Deployment Environment</h3>
                    <div className={`flex items-center gap-3 p-4 rounded-lg ${
                      process.env.NEXT_PUBLIC_DEPLOYMENT_MODE === 'cloud'
                        ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800'
                        : 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
                    }`}>
                      <div className={`p-2 rounded-lg ${
                        process.env.NEXT_PUBLIC_DEPLOYMENT_MODE === 'cloud'
                          ? 'bg-blue-100 dark:bg-blue-900/40'
                          : 'bg-green-100 dark:bg-green-900/40'
                      }`}>
                        {process.env.NEXT_PUBLIC_DEPLOYMENT_MODE === 'cloud' 
                          ? <Cloud className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                          : <Home className="w-5 h-5 text-green-600 dark:text-green-400" />
                        }
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold text-gray-900 dark:text-gray-100 mb-1">
                          {process.env.NEXT_PUBLIC_DEPLOYMENT_MODE === 'cloud' 
                            ? 'Cloud Mode' 
                            : 'Self-Hosted Mode'
                          }
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          {process.env.NEXT_PUBLIC_DEPLOYMENT_MODE === 'cloud'
                            ? 'Subscription limits enforced • Projects, nodes, and members are limited based on your plan'
                            : 'Unlimited access • No subscription required for self-hosted deployments'
                          }
                        </div>
                        {process.env.NEXT_PUBLIC_DEPLOYMENT_MODE === 'cloud' && (
                          <div className="mt-2 text-xs text-blue-600">
                            💡 Manage your subscription in the Subscription tab
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Provider Info */}
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Authentication Method</h3>
                    <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                      {user?.providerData[0]?.providerId === 'google.com' ? (
                        <>
                          <svg className="w-6 h-6" viewBox="0 0 24 24">
                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                          </svg>
                          <span className="text-gray-900 dark:text-gray-100">Signed in with Google</span>
                        </>
                      ) : (
                        <>
                          <svg className="w-6 h-6 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                          </svg>
                          <span className="text-gray-900 dark:text-gray-100">Signed in with Email</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* User ID */}
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">User ID</h3>
                    <div className="p-4 bg-gray-100 dark:bg-gray-800/50 rounded-lg">
                      <code className="text-sm text-gray-900 dark:text-gray-100 break-all font-mono">{user?.uid}</code>
                    </div>
                  </div>

                  {/* Danger Zone */}
                  <div className="pt-6 border-t">
                    <h3 className="font-semibold text-red-600 mb-4">Danger Zone</h3>
                    <div className="space-y-3">
                      <Button
                        variant="glass"
                        className="text-red-600 hover:bg-red-50"
                        onClick={() => {
                          if (confirm('Are you sure you want to sign out?')) {
                            router.push('/login');
                          }
                        }}
                      >
                        Sign Out
                      </Button>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-4">
                      ⚠️ Deleting your account is permanent and cannot be undone. Contact support if needed.
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* AI Settings Tab (Self-Hosted Only) */}
        {activeTab === 'ai' && subscription.is_self_hosted && (
          <Card variant="glass-card">
            <div className="p-6">
              <AISettings />
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}

