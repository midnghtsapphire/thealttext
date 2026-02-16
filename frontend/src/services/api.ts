/**
 * TheAltText — API Service
 * Handles all communication with the FastAPI backend.
 * Falls back to mock/demo mode when no backend is running (e.g., GitHub Pages).
 * A GlowStarLabs product by Audrey Evans.
 */

import axios from 'axios';
import {
  mockAuthAPI,
  mockImageAPI,
  mockScannerAPI,
  mockReportAPI,
  mockDashboardAPI,
  mockBillingAPI,
  mockDeveloperAPI,
} from './mockApi';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

// ── Detect demo mode ────────────────────────────────────────────────────────
// Demo mode is active when:
// 1. VITE_DEMO_MODE is explicitly set to 'true', OR
// 2. We're running on GitHub Pages (*.github.io), OR
// 3. The protocol is file://
const isDemoMode = (): boolean => {
  if (import.meta.env.VITE_DEMO_MODE === 'true') return true;
  if (typeof window !== 'undefined') {
    const host = window.location.hostname;
    if (host.endsWith('.github.io')) return true;
    if (window.location.protocol === 'file:') return true;
  }
  return false;
};

const DEMO_MODE = isDemoMode();

// ── Axios instance for live backend ─────────────────────────────────────────
const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('thealttext_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 responses
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('thealttext_token');
      localStorage.removeItem('thealttext_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ── Auth ──────────────────────────────────────────────────────────────────────

export const authAPI = DEMO_MODE
  ? mockAuthAPI
  : {
      register: (data: { email: string; password: string; full_name?: string; organization?: string }) =>
        api.post('/auth/register', data),

      login: (data: { email: string; password: string }) =>
        api.post('/auth/login', data),

      getProfile: () => api.get('/auth/me'),

      updateProfile: (data: { full_name?: string; organization?: string; preferred_language?: string; preferred_tone?: string }) =>
        api.patch('/auth/me', data),
    };

// ── Images ───────────────────────────────────────────────────────────────────

export const imageAPI = DEMO_MODE
  ? mockImageAPI
  : {
      analyzeFile: (file: File, options: { language?: string; tone?: string; wcag_level?: string; context?: string } = {}) => {
        const formData = new FormData();
        formData.append('file', file);
        if (options.language) formData.append('language', options.language);
        if (options.tone) formData.append('tone', options.tone);
        if (options.wcag_level) formData.append('wcag_level', options.wcag_level);
        if (options.context) formData.append('context', options.context);
        return api.post('/images/analyze', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      },

      analyzeUrl: (data: { image_url: string; language?: string; tone?: string; wcag_level?: string; context?: string }) =>
        api.post('/images/analyze-url', data),

      bulkUpload: (files: File[], options: { language?: string; tone?: string; wcag_level?: string } = {}) => {
        const formData = new FormData();
        files.forEach((file) => formData.append('files', file));
        if (options.language) formData.append('language', options.language);
        if (options.tone) formData.append('tone', options.tone);
        if (options.wcag_level) formData.append('wcag_level', options.wcag_level);
        return api.post('/images/bulk-upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      },

      getHistory: (skip = 0, limit = 50) =>
        api.get(`/images/history?skip=${skip}&limit=${limit}`),
    };

// ── Scanner ──────────────────────────────────────────────────────────────────

export const scannerAPI = DEMO_MODE
  ? mockScannerAPI
  : {
      scan: (data: { url: string; scan_depth?: number; generate_alt?: boolean; language?: string; tone?: string }) =>
        api.post('/scanner/scan', data),

      listJobs: (skip = 0, limit = 20) =>
        api.get(`/scanner/jobs?skip=${skip}&limit=${limit}`),

      getJob: (jobId: number) => api.get(`/scanner/jobs/${jobId}`),
    };

// ── Reports ──────────────────────────────────────────────────────────────────

export const reportAPI = DEMO_MODE
  ? mockReportAPI
  : {
      list: (skip = 0, limit = 20) =>
        api.get(`/reports/?skip=${skip}&limit=${limit}`),

      get: (reportId: number) => api.get(`/reports/${reportId}`),

      export: (reportId: number, format: string) =>
        api.get(`/reports/${reportId}/export/${format}`, { responseType: format === 'csv' ? 'blob' : 'json' }),
    };

// ── Dashboard ────────────────────────────────────────────────────────────────

export const dashboardAPI = DEMO_MODE
  ? mockDashboardAPI
  : {
      getStats: () => api.get('/dashboard/stats'),
      getCarbon: () => api.get('/dashboard/carbon'),
    };

// ── Billing ──────────────────────────────────────────────────────────────────

export const billingAPI = DEMO_MODE
  ? mockBillingAPI
  : {
      createCheckout: (data: { plan: string; success_url: string; cancel_url: string }) =>
        api.post('/billing/checkout', data),

      getSubscription: () => api.get('/billing/subscription'),

      cancel: () => api.post('/billing/cancel'),
    };

// ── Developer ────────────────────────────────────────────────────────────────

export const developerAPI = DEMO_MODE
  ? mockDeveloperAPI
  : {
      createKey: (data: { name: string }) => api.post('/developer/keys', data),
      listKeys: () => api.get('/developer/keys'),
      revokeKey: (keyId: number) => api.delete(`/developer/keys/${keyId}`),
    };

export default api;
