/**
 * TheAltText — Developer API Page
 * API key management and documentation.
 */

import React, { useEffect, useState } from 'react';
import { Code2, Plus, Copy, Check, Trash2, Key, ExternalLink } from 'lucide-react';
import { developerAPI } from '../services/api';
import type { APIKeyData } from '../types';

export default function DeveloperPage() {
  const [keys, setKeys] = useState<APIKeyData[]>([]);
  const [newKeyName, setNewKeyName] = useState('');
  const [createdKey, setCreatedKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    developerAPI.listKeys().then(({ data }) => setKeys(data)).catch(() => {});
  }, []);

  const createKey = async () => {
    if (!newKeyName.trim()) return;
    setLoading(true);
    try {
      const { data } = await developerAPI.createKey({ name: newKeyName });
      setCreatedKey(data.full_key);
      setKeys((prev) => [data, ...prev]);
      setNewKeyName('');
    } catch (err) {
      console.error('Failed to create key:', err);
    } finally {
      setLoading(false);
    }
  };

  const revokeKey = async (keyId: number) => {
    try {
      await developerAPI.revokeKey(keyId);
      setKeys((prev) => prev.filter((k) => k.id !== keyId));
    } catch (err) {
      console.error('Failed to revoke key:', err);
    }
  };

  const copyKey = async () => {
    if (!createdKey) return;
    await navigator.clipboard.writeText(createdKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold text-earth-100">Developer API</h1>
        <p className="text-earth-400 mt-1">
          Integrate TheAltText into your applications with our RESTful API.
        </p>
      </div>

      {/* API Documentation Quick Reference */}
      <div className="glass-panel p-6">
        <h2 className="font-semibold text-earth-100 mb-4 flex items-center gap-2">
          <Code2 size={18} className="text-gold-400" aria-hidden="true" />
          Quick Start
        </h2>
        <div className="space-y-3">
          <div className="p-4 rounded-xl bg-charcoal-900 overflow-x-auto">
            <pre className="text-sm text-earth-300"><code>{`curl -X POST https://your-domain.com/api/developer/v1/alt-text \\
  -H "X-API-Key: tat_your_api_key_here" \\
  -H "Content-Type: application/json" \\
  -d '{
    "image_url": "https://example.com/photo.jpg",
    "language": "en",
    "tone": "formal",
    "wcag_level": "AAA"
  }'`}</code></pre>
          </div>
          <p className="text-sm text-earth-400">
            Full API documentation available at{' '}
            <a href="/docs" target="_blank" className="text-gold-400 hover:text-gold-300 inline-flex items-center gap-1" aria-label="Open full API documentation (opens in new tab)">
              /docs <ExternalLink size={12} aria-hidden="true" />
            </a>
          </p>
        </div>
      </div>

      {/* Create New Key */}
      <div className="glass-panel p-6">
        <h2 className="font-semibold text-earth-100 mb-4">Create API Key</h2>
        <div className="flex gap-3">
          <input
            type="text"
            value={newKeyName}
            onChange={(e) => setNewKeyName(e.target.value)}
            className="input-field flex-1"
            placeholder="Key name (e.g., Production, Development)"
            aria-label="Enter a name for the new API key"
          />
          <button
            onClick={createKey}
            disabled={loading || !newKeyName.trim()}
            className="btn-primary flex items-center gap-2 disabled:opacity-50"
            aria-label="Generate new API key"
          >
            <Plus size={18} aria-hidden="true" /> Create Key
          </button>
        </div>

        {createdKey && (
          <div className="mt-4 p-4 rounded-xl bg-forest-900/20 border border-forest-700/30" role="alert" aria-live="polite">
            <p className="text-sm text-forest-300 mb-2 font-medium">
              API key created! Copy it now — it won't be shown again.
            </p>
            <div className="flex items-center gap-2">
              <code className="flex-1 p-2 rounded bg-charcoal-900 text-sm text-earth-200 font-mono break-all">
                {createdKey}
              </code>
              <button
                onClick={copyKey}
                className="p-2 rounded-lg bg-charcoal-800 hover:bg-charcoal-700 transition-colors"
                aria-label={copied ? 'API key copied' : 'Copy API key to clipboard'}
              >
                {copied ? <Check size={16} className="text-forest-400" aria-hidden="true" /> : <Copy size={16} className="text-earth-400" aria-hidden="true" />}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Existing Keys */}
      <div className="glass-panel p-6">
        <h2 className="font-semibold text-earth-100 mb-4">Your API Keys</h2>
        {keys.length === 0 ? (
          <div className="text-center py-8">
            <Key size={32} className="text-earth-700 mx-auto mb-3" aria-hidden="true" />
            <p className="text-earth-500">No API keys yet. Create one above.</p>
          </div>
        ) : (
          <div className="space-y-3" role="list" aria-label="Your API keys">
            {keys.map((key) => (
              <div key={key.id} className="flex items-center justify-between p-3 rounded-xl bg-charcoal-900/30" role="listitem">
                <div>
                  <p className="text-sm font-medium text-earth-200">{key.name}</p>
                  <p className="text-xs text-earth-500 font-mono">{key.key_prefix}...</p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-xs text-earth-500">{key.requests_count} requests</span>
                  <button
                    onClick={() => revokeKey(key.id)}
                    className="p-1.5 rounded-lg hover:bg-ember-900/30 text-earth-600 hover:text-ember-400 transition-colors"
                    aria-label={`Revoke API key: ${key.name}`}
                  >
                    <Trash2 size={14} aria-hidden="true" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
