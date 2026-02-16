/**
 * TheAltText — Auth Page
 * Login and Registration with glassmorphism design.
 */

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, ArrowRight, Leaf } from 'lucide-react';

interface AuthPageProps {
  mode: 'login' | 'register';
  onLogin: (email: string, password: string) => Promise<any>;
  onRegister: (email: string, password: string, fullName?: string, organization?: string) => Promise<any>;
}

export default function AuthPage({ mode, onLogin, onRegister }: AuthPageProps) {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [organization, setOrganization] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const isLogin = mode === 'login';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isLogin) {
        await onLogin(email, password);
      } else {
        await onRegister(email, password, fullName || undefined, organization || undefined);
      }
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-charcoal-950 bg-mesh flex items-center justify-center px-4 py-12">
      <a href="#auth-form" className="skip-link">Skip to form</a>

      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2" aria-label="Return to TheAltText home page">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gold-500 to-forest-600 flex items-center justify-center" aria-hidden="true">
              <span className="text-sm font-bold text-charcoal-950">AT</span>
            </div>
            <span className="font-display font-bold text-2xl text-gradient-gold">TheAltText</span>
          </Link>
          <p className="mt-2 text-earth-400 text-sm">
            {isLogin ? 'Welcome back' : 'Create your free account'}
          </p>
        </div>

        {/* Form */}
        <div className="glass-panel p-8" id="auth-form">
          <h1 className="font-display text-2xl font-bold text-earth-100 mb-6">
            {isLogin ? 'Log In' : 'Sign Up'}
          </h1>

          {error && (
            <div
              className="mb-4 p-3 rounded-xl bg-ember-900/30 border border-ember-700/30 text-ember-300 text-sm"
              role="alert"
              aria-live="polite"
            >
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            {!isLogin && (
              <>
                <div>
                  <label htmlFor="fullName" className="block text-sm font-medium text-earth-300 mb-1">
                    Full Name
                  </label>
                  <input
                    id="fullName"
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="input-field"
                    placeholder="Audrey Evans"
                    autoComplete="name"
                  />
                </div>
                <div>
                  <label htmlFor="organization" className="block text-sm font-medium text-earth-300 mb-1">
                    Organization <span className="text-earth-500">(optional)</span>
                  </label>
                  <input
                    id="organization"
                    type="text"
                    value={organization}
                    onChange={(e) => setOrganization(e.target.value)}
                    className="input-field"
                    placeholder="GlowStarLabs"
                    autoComplete="organization"
                  />
                </div>
              </>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-earth-300 mb-1">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field"
                placeholder="you@example.com"
                required
                autoComplete="email"
                aria-required="true"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-earth-300 mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field !pr-12"
                  placeholder={isLogin ? '••••••••' : 'Min 8 characters'}
                  required
                  minLength={8}
                  autoComplete={isLogin ? 'current-password' : 'new-password'}
                  aria-required="true"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-earth-400 hover:text-earth-200 transition-colors"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={18} aria-hidden="true" /> : <Eye size={18} aria-hidden="true" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              aria-busy={loading}
            >
              {loading ? (
                <span>Processing...</span>
              ) : (
                <>
                  {isLogin ? 'Log In' : 'Create Account'}
                  <ArrowRight size={18} aria-hidden="true" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-earth-400">
            {isLogin ? (
              <>
                Don't have an account?{' '}
                <Link to="/register" className="text-gold-400 hover:text-gold-300 font-medium">
                  Sign up free
                </Link>
              </>
            ) : (
              <>
                Already have an account?{' '}
                <Link to="/login" className="text-gold-400 hover:text-gold-300 font-medium">
                  Log in
                </Link>
              </>
            )}
          </div>

          {!isLogin && (
            <div className="mt-4 flex items-center justify-center gap-1.5 text-xs text-earth-500">
              <Leaf size={12} className="text-forest-500" aria-hidden="true" />
              <span>Free tier: 50 images/month. No credit card required.</span>
            </div>
          )}
        </div>

        {/* GlowStarLabs branding */}
        <div className="mt-6 text-center">
          <a
            href="https://meetaudreyevans.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-earth-600 hover:text-gold-400 transition-colors"
            aria-label="Visit GlowStarLabs hub (opens in new tab)"
          >
            A GlowStarLabs Product by Audrey Evans
          </a>
        </div>
      </div>
    </div>
  );
}
