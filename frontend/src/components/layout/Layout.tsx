/**
 * TheAltText — Main Layout
 * Responsive layout with navigation, WCAG AAA compliant.
 */

import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  ImageIcon,
  ScanLine,
  BarChart3,
  FileText,
  Settings,
  Code2,
  CreditCard,
  Leaf,
  Menu,
  X,
  LogOut,
  Home,
  Upload,
} from 'lucide-react';
import type { User } from '../../types';

interface LayoutProps {
  children: React.ReactNode;
  user: User | null;
  onLogout: () => void;
}

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: Home, description: 'View your dashboard overview' },
  { path: '/analyze', label: 'Analyze Image', icon: ImageIcon, description: 'Generate alt text for a single image' },
  { path: '/bulk', label: 'Bulk Upload', icon: Upload, description: 'Process multiple images at once' },
  { path: '/scanner', label: 'URL Scanner', icon: ScanLine, description: 'Scan websites for compliance' },
  { path: '/reports', label: 'Reports', icon: FileText, description: 'View compliance reports' },
  { path: '/developer', label: 'Developer API', icon: Code2, description: 'Manage API keys' },
  { path: '/billing', label: 'Billing', icon: CreditCard, description: 'Manage your subscription' },
  { path: '/settings', label: 'Settings', icon: Settings, description: 'Account settings' },
];

export default function Layout({ children, user, onLogout }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-charcoal-950 bg-mesh">
      {/* Skip to main content — WCAG AAA */}
      <a href="#main-content" className="skip-link" aria-label="Skip to main content">
        Skip to main content
      </a>

      {/* Top Navigation Bar */}
      <header
        className="fixed top-0 left-0 right-0 z-50 glass-panel border-b border-earth-800/20"
        role="banner"
        aria-label="Main navigation header"
      >
        <div className="flex items-center justify-between px-4 py-3 md:px-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-charcoal-800 transition-colors"
              aria-label={sidebarOpen ? 'Close navigation menu' : 'Open navigation menu'}
              aria-expanded={sidebarOpen}
            >
              {sidebarOpen ? <X size={20} aria-hidden="true" /> : <Menu size={20} aria-hidden="true" />}
            </button>

            <Link to="/dashboard" className="flex items-center gap-2" aria-label="TheAltText home">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-gold-500 to-forest-600 flex items-center justify-center" aria-hidden="true">
                <span className="text-xs font-bold text-charcoal-950">AT</span>
              </div>
              <span className="font-display font-bold text-lg text-gradient-gold hidden sm:inline">
                TheAltText
              </span>
            </Link>
          </div>

          <div className="flex items-center gap-4">
            {/* Carbon tracker badge */}
            <div
              className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-forest-900/30 border border-forest-700/20"
              role="status"
              aria-label="Eco-friendly carbon tracking active"
            >
              <Leaf size={14} className="text-forest-400" aria-hidden="true" />
              <span className="text-xs text-forest-300">Eco Mode</span>
            </div>

            {/* User info */}
            {user && (
              <div className="flex items-center gap-3">
                <div className="hidden sm:block text-right">
                  <p className="text-sm font-medium text-earth-200">{user.full_name || user.email}</p>
                  <p className="text-xs text-earth-400 capitalize">{user.tier} Plan</p>
                </div>
                <button
                  onClick={onLogout}
                  className="p-2 rounded-lg hover:bg-charcoal-800 transition-colors text-earth-400 hover:text-ember-400"
                  aria-label="Log out of your account"
                >
                  <LogOut size={18} aria-hidden="true" />
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="flex pt-14">
        {/* Sidebar Navigation */}
        <nav
          className={`fixed md:sticky top-14 left-0 z-40 h-[calc(100vh-3.5rem)] w-64 glass-panel border-r border-earth-800/20 transition-transform duration-300 ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
          }`}
          role="navigation"
          aria-label="Main navigation"
        >
          <div className="flex flex-col h-full p-4 overflow-y-auto">
            <ul className="space-y-1 flex-1" role="list">
              {navItems.map((item) => {
                const isActive = location.pathname === item.path;
                const Icon = item.icon;
                return (
                  <li key={item.path}>
                    <Link
                      to={item.path}
                      onClick={() => setSidebarOpen(false)}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 ${
                        isActive
                          ? 'bg-gold-500/10 text-gold-300 border border-gold-500/20'
                          : 'text-earth-300 hover:bg-charcoal-800 hover:text-earth-100'
                      }`}
                      aria-current={isActive ? 'page' : undefined}
                      aria-label={item.description}
                    >
                      <Icon size={18} aria-hidden="true" />
                      <span className="text-sm font-medium">{item.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>

            {/* Usage indicator */}
            {user && (
              <div className="mt-4 p-3 rounded-xl bg-charcoal-900/50 border border-earth-800/20" role="status" aria-label="Monthly usage status">
                <p className="text-xs text-earth-400 mb-2">Monthly Usage</p>
                <div className="w-full bg-charcoal-800 rounded-full h-2" role="progressbar" aria-valuenow={user.monthly_usage} aria-valuemin={0} aria-valuemax={user.tier === 'free' ? 50 : 100}>
                  <div
                    className="h-2 rounded-full bg-gradient-to-r from-gold-500 to-forest-500 transition-all duration-500"
                    style={{ width: `${user.tier === 'free' ? Math.min((user.monthly_usage / 50) * 100, 100) : Math.min(user.monthly_usage, 100)}%` }}
                  />
                </div>
                <p className="text-xs text-earth-300 mt-1">
                  {user.monthly_usage} / {user.tier === 'free' ? '50' : '∞'} images
                </p>
              </div>
            )}

            {/* GlowStarLabs branding */}
            <div className="mt-4 pt-4 border-t border-earth-800/20">
              <a
                href="https://meetaudreyevans.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-xs text-earth-500 hover:text-gold-400 transition-colors"
                aria-label="Visit GlowStarLabs hub at meetaudreyevans.com (opens in new tab)"
              >
                <span aria-hidden="true">✦</span>
                <span>A GlowStarLabs Product</span>
              </a>
            </div>
          </div>
        </nav>

        {/* Overlay for mobile sidebar */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-30 bg-black/50 md:hidden"
            onClick={() => setSidebarOpen(false)}
            aria-hidden="true"
          />
        )}

        {/* Main Content */}
        <main
          id="main-content"
          className="flex-1 min-h-[calc(100vh-3.5rem)] p-4 md:p-6 lg:p-8"
          role="main"
          aria-label="Main content area"
        >
          {children}
        </main>
      </div>
    </div>
  );
}
