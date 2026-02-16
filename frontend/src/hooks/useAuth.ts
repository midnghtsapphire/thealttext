/**
 * TheAltText — Auth Hook
 * Manages authentication state.
 * Supports demo mode for GitHub Pages deployment.
 * A GlowStarLabs product by Audrey Evans.
 */

import { useState, useCallback } from 'react';
import { authAPI } from '../services/api';
import type { User } from '../types';

export function useAuth() {
  const [user, setUser] = useState<User | null>(() => {
    const stored = localStorage.getItem('thealttext_user');
    try {
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isAuthenticated = !!user && !!localStorage.getItem('thealttext_token');

  const login = useCallback(async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await authAPI.login({ email, password });
      localStorage.setItem('thealttext_token', data.access_token);
      localStorage.setItem('thealttext_user', JSON.stringify(data.user));
      setUser(data.user);
      return data.user;
    } catch (err: any) {
      const msg = err.response?.data?.detail || err.message || 'Login failed';
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  const register = useCallback(async (email: string, password: string, full_name?: string, organization?: string) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await authAPI.register({ email, password, full_name, organization });
      localStorage.setItem('thealttext_token', data.access_token);
      localStorage.setItem('thealttext_user', JSON.stringify(data.user));
      setUser(data.user);
      return data.user;
    } catch (err: any) {
      const msg = err.response?.data?.detail || err.message || 'Registration failed';
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('thealttext_token');
    localStorage.removeItem('thealttext_user');
    setUser(null);
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const { data } = await authAPI.getProfile();
      localStorage.setItem('thealttext_user', JSON.stringify(data));
      setUser(data);
    } catch {
      // Token may be expired — ignore in demo mode
    }
  }, []);

  return { user, isAuthenticated, loading, error, login, register, logout, refreshUser };
}
