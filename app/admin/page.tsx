// Admin Dashboard - Coupon Management & System Control
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthContext } from '@/contexts/AuthContext';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

interface Coupon {
  id: string;
  code: string;
  description: string;
  plan: string;
  duration_months: number;
  max_redemptions: number | null;
  current_redemptions: number;
  is_active: boolean;
  expires_at: string | null;
  created_at: string;
}

export default function AdminDashboard() {
  const router = useRouter();
  const { user, loading } = useAuthContext();
  const [isAdmin, setIsAdmin] = useState(false);
  const [checking, setChecking] = useState(true);
  
  // Coupon state
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loadingCoupons, setLoadingCoupons] = useState(true);
  
  // New coupon form
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newCoupon, setNewCoupon] = useState({
    code: '',
    description: '',
    plan: 'pro',
    duration_months: 3,
    max_redemptions: 10,
  });

  // Check if user is admin
  useEffect(() => {
    const checkAdmin = async () => {
      if (!user) {
        router.push('/login');
        return;
      }

      try {
        const response = await fetch('/api/admin/check');
        const data = await response.json();
        
        if (data.isAdmin) {
          setIsAdmin(true);
          loadCoupons();
        } else {
          alert('Access denied. Admin only.');
          router.push('/dashboard');
        }
      } catch (error) {
        console.error('Failed to check admin status:', error);
        router.push('/dashboard');
      } finally {
        setChecking(false);
      }
    };

    if (!loading) {
      checkAdmin();
    }
  }, [user, loading, router]);

  const loadCoupons = async () => {
    try {
      const response = await fetch('/api/admin/coupons');
      const data = await response.json();
      setCoupons(data.coupons || []);
    } catch (error) {
      console.error('Failed to load coupons:', error);
    } finally {
      setLoadingCoupons(false);
    }
  };

  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await fetch('/api/admin/coupons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCoupon),
      });

      const data = await response.json();

      if (response.ok) {
        alert('Coupon created successfully!');
        setShowCreateForm(false);
        setNewCoupon({
          code: '',
          description: '',
          plan: 'pro',
          duration_months: 3,
          max_redemptions: 10,
        });
        loadCoupons();
      } else {
        alert(`Failed: ${data.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Failed to create coupon:', error);
      alert('Failed to create coupon');
    }
  };

  const handleToggleCoupon = async (couponId: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/admin/coupons/${couponId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: !currentStatus }),
      });

      if (response.ok) {
        loadCoupons();
      } else {
        alert('Failed to update coupon');
      }
    } catch (error) {
      console.error('Failed to toggle coupon:', error);
    }
  };

  if (loading || checking) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Checking admin access...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen gradient-bg">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-gray-600">Manage coupons, users, and system settings</p>
          </div>
          <Button variant="glass" onClick={() => router.push('/dashboard')}>
            Back to Dashboard
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card variant="glass-card">
            <div className="p-6">
              <div className="text-sm text-gray-600 mb-2">Total Coupons</div>
              <div className="text-3xl font-bold text-gray-900">{coupons.length}</div>
            </div>
          </Card>
          <Card variant="glass-card">
            <div className="p-6">
              <div className="text-sm text-gray-600 mb-2">Active Coupons</div>
              <div className="text-3xl font-bold text-green-600">
                {coupons.filter(c => c.is_active).length}
              </div>
            </div>
          </Card>
          <Card variant="glass-card">
            <div className="p-6">
              <div className="text-sm text-gray-600 mb-2">Total Redemptions</div>
              <div className="text-3xl font-bold text-blue-600">
                {coupons.reduce((sum, c) => sum + c.current_redemptions, 0)}
              </div>
            </div>
          </Card>
          <Card variant="glass-card">
            <div className="p-6">
              <div className="text-sm text-gray-600 mb-2">Available Slots</div>
              <div className="text-3xl font-bold text-purple-600">
                {coupons.reduce((sum, c) => 
                  sum + ((c.max_redemptions || 0) - c.current_redemptions), 0
                )}
              </div>
            </div>
          </Card>
        </div>

        {/* Coupon Management */}
        <Card variant="glass-card" className="mb-8">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Coupon Codes</h2>
              <Button
                variant="primary"
                onClick={() => setShowCreateForm(!showCreateForm)}
              >
                {showCreateForm ? 'Cancel' : '+ Create Coupon'}
              </Button>
            </div>

            {/* Create Form */}
            {showCreateForm && (
              <form onSubmit={handleCreateCoupon} className="mb-6 p-4 bg-gray-50 rounded-lg">
                <div className="grid md:grid-cols-2 gap-4">
                  <Input
                    label="Coupon Code"
                    placeholder="JUDGE2024"
                    value={newCoupon.code}
                    onChange={(e) => setNewCoupon({ ...newCoupon, code: e.target.value.toUpperCase() })}
                    required
                  />
                  <Input
                    label="Description"
                    placeholder="Hackathon Judge Access"
                    value={newCoupon.description}
                    onChange={(e) => setNewCoupon({ ...newCoupon, description: e.target.value })}
                  />
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Plan
                    </label>
                    <select
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      value={newCoupon.plan}
                      onChange={(e) => setNewCoupon({ ...newCoupon, plan: e.target.value })}
                    >
                      <option value="starter">Starter</option>
                      <option value="pro">Pro</option>
                      <option value="enterprise">Enterprise</option>
                    </select>
                  </div>
                  <Input
                    type="number"
                    label="Duration (months)"
                    value={newCoupon.duration_months}
                    onChange={(e) => setNewCoupon({ ...newCoupon, duration_months: parseInt(e.target.value) })}
                    min={1}
                    required
                  />
                  <Input
                    type="number"
                    label="Max Redemptions"
                    value={newCoupon.max_redemptions}
                    onChange={(e) => setNewCoupon({ ...newCoupon, max_redemptions: parseInt(e.target.value) })}
                    min={1}
                    required
                  />
                </div>
                <Button type="submit" variant="primary" className="mt-4">
                  Create Coupon
                </Button>
              </form>
            )}

            {/* Coupons Table */}
            {loadingCoupons ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
              </div>
            ) : coupons.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No coupons yet. Create your first one!
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Code</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Description</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Plan</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Duration</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Used/Max</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {coupons.map((coupon) => (
                      <tr key={coupon.id} className="border-b hover:bg-gray-50">
                        <td className="px-4 py-3 font-mono text-sm font-bold">{coupon.code}</td>
                        <td className="px-4 py-3 text-sm text-gray-700">{coupon.description || '-'}</td>
                        <td className="px-4 py-3">
                          <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-700">
                            {coupon.plan.toUpperCase()}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm">{coupon.duration_months}mo</td>
                        <td className="px-4 py-3 text-sm">
                          <span className={coupon.current_redemptions >= (coupon.max_redemptions || 0) ? 'text-red-600 font-semibold' : ''}>
                            {coupon.current_redemptions}
                          </span>
                          {' / '}
                          {coupon.max_redemptions || '∞'}
                        </td>
                        <td className="px-4 py-3">
                          {coupon.is_active ? (
                            <span className="text-green-600 font-semibold">●Active</span>
                          ) : (
                            <span className="text-gray-400 font-semibold">● Inactive</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => handleToggleCoupon(coupon.id, coupon.is_active)}
                            className="text-sm text-blue-600 hover:underline"
                          >
                            {coupon.is_active ? 'Deactivate' : 'Activate'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </Card>

        {/* Instructions for Judges */}
        <Card variant="glass-card">
          <div className="p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">📋 Instructions for Judges</h2>
            <div className="space-y-3 text-gray-700">
              <p>1. Share the coupon code with hackathon judges or early access users</p>
              <p>2. They can redeem it at: Dashboard → Settings → Subscription → Redeem Coupon</p>
              <p>3. Each code can be used up to the max redemptions limit</p>
              <p>4. Monitor usage and create new codes as needed</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

