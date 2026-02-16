/**
 * TheAltText — Billing Page
 * Subscription management with Stripe integration.
 */

import React, { useEffect, useState } from 'react';
import { CreditCard, Check, Star, Zap } from 'lucide-react';
import { billingAPI } from '../services/api';
import type { User } from '../types';

interface BillingPageProps {
  user: User | null;
}

export default function BillingPage({ user }: BillingPageProps) {
  const [subscription, setSubscription] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    billingAPI.getSubscription().then(({ data }) => setSubscription(data)).catch(() => {});
  }, []);

  const handleUpgrade = async () => {
    setLoading(true);
    try {
      const { data } = await billingAPI.createCheckout({
        plan: 'pro',
        success_url: `${window.location.origin}/billing?success=true`,
        cancel_url: `${window.location.origin}/billing?canceled=true`,
      });
      window.location.href = data.checkout_url;
    } catch (err) {
      console.error('Checkout failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!confirm('Are you sure you want to cancel your Pro subscription?')) return;
    try {
      await billingAPI.cancel();
      const { data } = await billingAPI.getSubscription();
      setSubscription(data);
    } catch (err) {
      console.error('Cancellation failed:', err);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold text-earth-100">Billing & Subscription</h1>
        <p className="text-earth-400 mt-1">Manage your TheAltText subscription plan.</p>
      </div>

      {/* Current Plan */}
      <div className="glass-panel p-6" role="region" aria-label="Current subscription plan">
        <div className="flex items-center gap-3 mb-4">
          <CreditCard size={20} className="text-gold-400" aria-hidden="true" />
          <h2 className="font-semibold text-earth-100">Current Plan</h2>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-2xl font-bold text-gradient-gold capitalize">{user?.tier || 'Free'}</span>
          {subscription?.status && (
            <span className="px-2 py-1 rounded-full text-xs bg-forest-900/30 text-forest-300 capitalize">
              {subscription.status}
            </span>
          )}
        </div>
        <p className="text-sm text-earth-400 mt-2">
          {user?.tier === 'free'
            ? `${user?.monthly_usage || 0} of 50 images used this month`
            : 'Unlimited images per month'}
        </p>
      </div>

      {/* Plan Comparison */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Free Plan */}
        <div className={`glass-panel p-6 ${user?.tier === 'free' ? 'border-gold-500/30' : ''}`}>
          <h3 className="font-display text-xl font-bold text-earth-100">Free</h3>
          <p className="text-3xl font-bold text-gradient-gold mt-2">$0<span className="text-sm text-earth-400 font-normal">/month</span></p>
          <ul className="mt-4 space-y-2" role="list" aria-label="Free plan features">
            {['50 images/month', 'Single image analysis', 'URL scanner (1 page)', 'JSON/CSV export', '14+ languages', 'Carbon tracking'].map((f) => (
              <li key={f} className="flex items-center gap-2 text-sm text-earth-300">
                <Check size={14} className="text-forest-400 flex-shrink-0" aria-hidden="true" /> {f}
              </li>
            ))}
          </ul>
          {user?.tier === 'free' && (
            <div className="mt-4 px-4 py-2 rounded-xl bg-gold-500/10 text-center text-sm text-gold-300">
              Current Plan
            </div>
          )}
        </div>

        {/* Pro Plan */}
        <div className={`glass-panel p-6 ${user?.tier === 'pro' ? 'border-gold-500/30' : 'border-forest-500/20'}`}>
          <div className="flex items-center gap-2">
            <h3 className="font-display text-xl font-bold text-earth-100">Pro</h3>
            <Star size={16} className="text-gold-400" aria-hidden="true" />
          </div>
          <p className="text-3xl font-bold text-gradient-forest mt-2">$29<span className="text-sm text-earth-400 font-normal">/month</span></p>
          <ul className="mt-4 space-y-2" role="list" aria-label="Pro plan features">
            {['Unlimited images', 'Bulk upload (100/batch)', 'Deep scanning (5 levels)', 'PDF reports', 'Priority AI models', 'Developer API', 'Priority support', 'Carbon offset tracking'].map((f) => (
              <li key={f} className="flex items-center gap-2 text-sm text-earth-300">
                <Zap size={14} className="text-gold-400 flex-shrink-0" aria-hidden="true" /> {f}
              </li>
            ))}
          </ul>
          {user?.tier === 'pro' ? (
            <button
              onClick={handleCancel}
              className="mt-4 btn-secondary w-full text-sm"
              aria-label="Cancel Pro subscription"
            >
              Cancel Subscription
            </button>
          ) : (
            <button
              onClick={handleUpgrade}
              disabled={loading}
              className="mt-4 btn-forest w-full flex items-center justify-center gap-2"
              aria-label="Upgrade to Pro plan"
            >
              <Star size={16} aria-hidden="true" />
              {loading ? 'Redirecting to Stripe...' : 'Upgrade to Pro'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
