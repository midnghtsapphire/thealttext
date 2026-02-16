/**
 * TheAltText — Settings Page
 * User profile and preference management.
 */

import React, { useState } from 'react';
import { Settings, Save, Check } from 'lucide-react';
import { authAPI } from '../services/api';
import { LANGUAGES, TONES } from '../types';
import type { User, Tone } from '../types';

interface SettingsPageProps {
  user: User | null;
  onUpdate: () => void;
}

export default function SettingsPage({ user, onUpdate }: SettingsPageProps) {
  const [fullName, setFullName] = useState(user?.full_name || '');
  const [organization, setOrganization] = useState(user?.organization || '');
  const [language, setLanguage] = useState(user?.preferred_language || 'en');
  const [tone, setTone] = useState(user?.preferred_tone || 'formal');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await authAPI.updateProfile({
        full_name: fullName || undefined,
        organization: organization || undefined,
        preferred_language: language,
        preferred_tone: tone,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
      onUpdate();
    } catch (err) {
      console.error('Save failed:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold text-earth-100">Settings</h1>
        <p className="text-earth-400 mt-1">Manage your account and preferences.</p>
      </div>

      {/* Profile */}
      <div className="glass-panel p-6 space-y-4">
        <h2 className="font-semibold text-earth-100 flex items-center gap-2">
          <Settings size={18} className="text-gold-400" aria-hidden="true" />
          Profile
        </h2>

        <div>
          <label htmlFor="settings-name" className="block text-sm text-earth-400 mb-1">Full Name</label>
          <input
            id="settings-name"
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="input-field"
            aria-label="Your full name"
          />
        </div>

        <div>
          <label htmlFor="settings-org" className="block text-sm text-earth-400 mb-1">Organization</label>
          <input
            id="settings-org"
            type="text"
            value={organization}
            onChange={(e) => setOrganization(e.target.value)}
            className="input-field"
            aria-label="Your organization name"
          />
        </div>

        <div>
          <label htmlFor="settings-email" className="block text-sm text-earth-400 mb-1">Email</label>
          <input
            id="settings-email"
            type="email"
            value={user?.email || ''}
            disabled
            className="input-field opacity-60 cursor-not-allowed"
            aria-label="Your email address (cannot be changed)"
          />
        </div>
      </div>

      {/* Preferences */}
      <div className="glass-panel p-6 space-y-4">
        <h2 className="font-semibold text-earth-100">Default Preferences</h2>
        <p className="text-sm text-earth-500">These defaults will be used when generating alt text.</p>

        <div>
          <label htmlFor="pref-language" className="block text-sm text-earth-400 mb-1">Default Language</label>
          <select id="pref-language" value={language} onChange={(e) => setLanguage(e.target.value)} className="input-field">
            {LANGUAGES.map((l) => <option key={l.code} value={l.code}>{l.name}</option>)}
          </select>
        </div>

        <div>
          <label htmlFor="pref-tone" className="block text-sm text-earth-400 mb-1">Default Tone</label>
          <select id="pref-tone" value={tone} onChange={(e) => setTone(e.target.value)} className="input-field">
            {TONES.map((t) => <option key={t.value} value={t.value}>{t.label} — {t.description}</option>)}
          </select>
        </div>
      </div>

      {/* Save */}
      <button
        onClick={handleSave}
        disabled={saving}
        className="btn-primary flex items-center gap-2 disabled:opacity-50"
        aria-label="Save all settings changes"
      >
        {saved ? (
          <><Check size={18} aria-hidden="true" /> Saved!</>
        ) : saving ? (
          'Saving...'
        ) : (
          <><Save size={18} aria-hidden="true" /> Save Changes</>
        )}
      </button>
    </div>
  );
}
