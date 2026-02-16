/**
 * TheAltText — URL Scanner Page
 * Scan websites for ADA/WCAG alt text compliance.
 */

import React, { useState, useEffect } from 'react';
import { ScanLine, Loader2, Globe, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { scannerAPI } from '../services/api';
import type { ScanJob } from '../types';

export default function ScannerPage() {
  const [url, setUrl] = useState('');
  const [scanDepth, setScanDepth] = useState(1);
  const [loading, setLoading] = useState(false);
  const [currentScan, setCurrentScan] = useState<ScanJob | null>(null);
  const [history, setHistory] = useState<ScanJob[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    scannerAPI.listJobs().then(({ data }) => setHistory(data)).catch(() => {});
  }, []);

  const handleScan = async () => {
    if (!url.trim()) return;
    setLoading(true);
    setError('');
    setCurrentScan(null);

    try {
      const { data } = await scannerAPI.scan({ url, scan_depth: scanDepth });
      setCurrentScan(data);
      setHistory((prev) => [data, ...prev]);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Scan failed');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle size={16} className="text-forest-400" aria-hidden="true" />;
      case 'failed': return <XCircle size={16} className="text-ember-400" aria-hidden="true" />;
      case 'running': return <Loader2 size={16} className="text-gold-400 animate-spin" aria-hidden="true" />;
      default: return <AlertTriangle size={16} className="text-earth-400" aria-hidden="true" />;
    }
  };

  const getComplianceColor = (score: number) => {
    if (score >= 90) return 'text-forest-400';
    if (score >= 70) return 'text-gold-400';
    return 'text-ember-400';
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold text-earth-100">URL Scanner</h1>
        <p className="text-earth-400 mt-1">
          Scan any website to check image alt text compliance against WCAG standards.
        </p>
      </div>

      {/* Scan Form */}
      <div className="glass-panel p-6 space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <label htmlFor="scan-url" className="block text-sm text-earth-400 mb-1">Website URL</label>
            <input
              id="scan-url"
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="input-field"
              placeholder="https://example.com"
              aria-label="Enter website URL to scan for accessibility compliance"
            />
          </div>
          <div className="w-full sm:w-32">
            <label htmlFor="scan-depth" className="block text-sm text-earth-400 mb-1">Depth</label>
            <select
              id="scan-depth"
              value={scanDepth}
              onChange={(e) => setScanDepth(Number(e.target.value))}
              className="input-field"
              aria-label="Select how many levels deep to crawl the website"
            >
              <option value={1}>1 page</option>
              <option value={2}>2 levels</option>
              <option value={3}>3 levels</option>
              <option value={5}>5 levels</option>
            </select>
          </div>
        </div>
        <button
          onClick={handleScan}
          disabled={loading || !url.trim()}
          className="btn-forest flex items-center gap-2 disabled:opacity-50"
          aria-label="Start scanning the website for alt text compliance"
        >
          {loading ? (
            <><Loader2 size={18} className="animate-spin" aria-hidden="true" /> Scanning...</>
          ) : (
            <><ScanLine size={18} aria-hidden="true" /> Scan Website</>
          )}
        </button>
      </div>

      {error && (
        <div className="glass-panel p-6 border-ember-700/30" role="alert">
          <p className="text-ember-300">{error}</p>
        </div>
      )}

      {/* Current Scan Result */}
      {currentScan && (
        <div className="glass-panel p-6" role="region" aria-label="Scan results">
          <div className="flex items-center gap-3 mb-4">
            {getStatusIcon(currentScan.status)}
            <h2 className="font-semibold text-earth-100">Scan Results</h2>
            <span className="text-sm text-earth-400 capitalize">{currentScan.status}</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-3 rounded-xl bg-charcoal-900/50">
              <span className="text-xs text-earth-500 block">Pages Scanned</span>
              <span className="text-xl font-bold text-earth-100">{currentScan.pages_scanned}</span>
            </div>
            <div className="p-3 rounded-xl bg-charcoal-900/50">
              <span className="text-xs text-earth-500 block">Images Found</span>
              <span className="text-xl font-bold text-earth-100">{currentScan.images_found}</span>
            </div>
            <div className="p-3 rounded-xl bg-charcoal-900/50">
              <span className="text-xs text-earth-500 block">Missing Alt Text</span>
              <span className="text-xl font-bold text-ember-400">{currentScan.images_missing_alt}</span>
            </div>
            <div className="p-3 rounded-xl bg-charcoal-900/50">
              <span className="text-xs text-earth-500 block">Compliance</span>
              <span className={`text-xl font-bold ${
                currentScan.images_found > 0
                  ? getComplianceColor(((currentScan.images_found - currentScan.images_missing_alt) / currentScan.images_found) * 100)
                  : 'text-earth-400'
              }`}>
                {currentScan.images_found > 0
                  ? `${(((currentScan.images_found - currentScan.images_missing_alt) / currentScan.images_found) * 100).toFixed(0)}%`
                  : 'N/A'}
              </span>
            </div>
          </div>

          {currentScan.error_message && (
            <p className="mt-3 text-sm text-ember-400">{currentScan.error_message}</p>
          )}
        </div>
      )}

      {/* Scan History */}
      {history.length > 0 && (
        <div className="glass-panel p-6" role="region" aria-label="Scan history">
          <h2 className="font-semibold text-earth-100 mb-4">Scan History</h2>
          <div className="space-y-3">
            {history.map((job) => (
              <div key={job.id} className="flex items-center justify-between p-3 rounded-xl bg-charcoal-900/30">
                <div className="flex items-center gap-3">
                  {getStatusIcon(job.status)}
                  <div>
                    <p className="text-sm text-earth-200 truncate max-w-xs">{job.target_url}</p>
                    <p className="text-xs text-earth-500">{new Date(job.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="text-right text-sm">
                  <p className="text-earth-300">{job.images_found} images</p>
                  <p className="text-ember-400">{job.images_missing_alt} missing</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
