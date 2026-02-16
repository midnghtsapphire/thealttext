/**
 * TheAltText — Dashboard Page
 * Overview stats, usage, and quick actions.
 */

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ImageIcon,
  ScanLine,
  FileText,
  Leaf,
  TrendingUp,
  Zap,
  ArrowRight,
} from 'lucide-react';
import { dashboardAPI } from '../services/api';
import type { DashboardStats, User } from '../types';

interface DashboardPageProps {
  user: User | null;
}

export default function DashboardPage({ user }: DashboardPageProps) {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [carbon, setCarbon] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [statsRes, carbonRes] = await Promise.all([
          dashboardAPI.getStats(),
          dashboardAPI.getCarbon(),
        ]);
        setStats(statsRes.data);
        setCarbon(carbonRes.data);
      } catch (err) {
        console.error('Failed to load dashboard:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const statCards = stats
    ? [
        {
          label: 'Images Processed',
          value: stats.total_images_processed.toLocaleString(),
          icon: ImageIcon,
          color: 'text-gold-400',
          bgColor: 'bg-gold-500/10',
        },
        {
          label: 'Alt Texts Generated',
          value: stats.total_alt_texts_generated.toLocaleString(),
          icon: Zap,
          color: 'text-forest-400',
          bgColor: 'bg-forest-500/10',
        },
        {
          label: 'Website Scans',
          value: stats.total_scans.toLocaleString(),
          icon: ScanLine,
          color: 'text-ember-400',
          bgColor: 'bg-ember-500/10',
        },
        {
          label: 'Avg Compliance',
          value: `${stats.compliance_score_avg}%`,
          icon: TrendingUp,
          color: 'text-gold-400',
          bgColor: 'bg-gold-500/10',
        },
      ]
    : [];

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="font-display text-3xl font-bold text-earth-100">
          Welcome back{user?.full_name ? `, ${user.full_name.split(' ')[0]}` : ''}
        </h1>
        <p className="text-earth-400 mt-1">
          Here's your accessibility overview for this month.
        </p>
      </div>

      {/* Stats Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="glass-panel p-6 animate-pulse" aria-hidden="true">
              <div className="h-4 bg-charcoal-700 rounded w-24 mb-3" />
              <div className="h-8 bg-charcoal-700 rounded w-16" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" role="region" aria-label="Dashboard statistics">
          {statCards.map((card) => {
            const Icon = card.icon;
            return (
              <div key={card.label} className="stat-card">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-earth-400">{card.label}</span>
                  <div className={`w-8 h-8 rounded-lg ${card.bgColor} flex items-center justify-center`} aria-hidden="true">
                    <Icon size={16} className={card.color} />
                  </div>
                </div>
                <span className="text-2xl font-bold text-earth-100">{card.value}</span>
              </div>
            );
          })}
        </div>
      )}

      {/* Usage + Carbon Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Usage */}
        <div className="glass-panel p-6" role="region" aria-label="Monthly usage">
          <h2 className="font-semibold text-earth-100 mb-4">Monthly Usage</h2>
          {stats && (
            <>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-earth-400">
                  {stats.monthly_usage} / {stats.monthly_limit === -1 ? '∞' : stats.monthly_limit} images
                </span>
                <span className="text-sm font-medium capitalize text-gold-400">{stats.tier} Plan</span>
              </div>
              <div
                className="w-full bg-charcoal-800 rounded-full h-3"
                role="progressbar"
                aria-valuenow={stats.monthly_usage}
                aria-valuemin={0}
                aria-valuemax={stats.monthly_limit === -1 ? 100 : stats.monthly_limit}
                aria-label={`${stats.monthly_usage} of ${stats.monthly_limit === -1 ? 'unlimited' : stats.monthly_limit} images used this month`}
              >
                <div
                  className="h-3 rounded-full bg-gradient-to-r from-gold-500 via-forest-500 to-gold-500 transition-all duration-700"
                  style={{
                    width: `${stats.monthly_limit === -1 ? Math.min(stats.monthly_usage, 100) : Math.min((stats.monthly_usage / stats.monthly_limit) * 100, 100)}%`,
                  }}
                />
              </div>
              {stats.tier === 'free' && stats.monthly_usage >= 40 && (
                <p className="mt-3 text-sm text-ember-400">
                  Running low! <Link to="/billing" className="text-gold-400 hover:underline">Upgrade to Pro</Link> for unlimited images.
                </p>
              )}
            </>
          )}
        </div>

        {/* Carbon Tracking */}
        <div className="glass-panel p-6" role="region" aria-label="Carbon footprint tracking">
          <div className="flex items-center gap-2 mb-4">
            <Leaf size={18} className="text-forest-400" aria-hidden="true" />
            <h2 className="font-semibold text-earth-100">Eco Impact</h2>
          </div>
          {carbon && (
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-earth-400">Total CO₂</span>
                <span className="text-forest-300">{carbon.co2_grams}g</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-earth-400">Tree Equivalent</span>
                <span className="text-forest-300">{carbon.trees_equivalent_minutes} min absorption</span>
              </div>
              <p className="text-xs text-earth-500 mt-2 italic">{carbon.message}</p>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div role="region" aria-label="Quick actions">
        <h2 className="font-semibold text-earth-100 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Link to="/analyze" className="glass-panel-hover p-6 flex items-center gap-4 group">
            <div className="w-12 h-12 rounded-xl bg-gold-500/10 flex items-center justify-center flex-shrink-0" aria-hidden="true">
              <ImageIcon size={24} className="text-gold-400" />
            </div>
            <div className="flex-1">
              <h3 className="font-medium text-earth-100 group-hover:text-gold-300 transition-colors">Analyze Image</h3>
              <p className="text-sm text-earth-400">Upload or paste URL</p>
            </div>
            <ArrowRight size={18} className="text-earth-600 group-hover:text-gold-400 transition-colors" aria-hidden="true" />
          </Link>

          <Link to="/scanner" className="glass-panel-hover p-6 flex items-center gap-4 group">
            <div className="w-12 h-12 rounded-xl bg-forest-500/10 flex items-center justify-center flex-shrink-0" aria-hidden="true">
              <ScanLine size={24} className="text-forest-400" />
            </div>
            <div className="flex-1">
              <h3 className="font-medium text-earth-100 group-hover:text-forest-300 transition-colors">Scan Website</h3>
              <p className="text-sm text-earth-400">Check compliance</p>
            </div>
            <ArrowRight size={18} className="text-earth-600 group-hover:text-forest-400 transition-colors" aria-hidden="true" />
          </Link>

          <Link to="/reports" className="glass-panel-hover p-6 flex items-center gap-4 group">
            <div className="w-12 h-12 rounded-xl bg-ember-500/10 flex items-center justify-center flex-shrink-0" aria-hidden="true">
              <FileText size={24} className="text-ember-400" />
            </div>
            <div className="flex-1">
              <h3 className="font-medium text-earth-100 group-hover:text-ember-300 transition-colors">View Reports</h3>
              <p className="text-sm text-earth-400">Export compliance data</p>
            </div>
            <ArrowRight size={18} className="text-earth-600 group-hover:text-ember-400 transition-colors" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </div>
  );
}
