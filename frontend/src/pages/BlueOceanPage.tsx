/**
 * TheAltText — Blue Ocean Features Page
 * E-commerce SEO, Platform Integrations, WCAG AAA Checker, Competitor Analysis, Monthly Audits
 */
import React, { useState } from 'react';
import { ShoppingBag, Link as LinkIcon, Shield, TrendingUp, Calendar, FileText } from 'lucide-react';

export default function BlueOceanPage() {
  const [activeTab, setActiveTab] = useState<'seo' | 'platforms' | 'wcag' | 'competitor' | 'audits'>('seo');

  const features = [
    {
      id: 'seo' as const,
      name: 'E-Commerce SEO',
      icon: ShoppingBag,
      description: 'Generate keyword-rich alt text that boosts product rankings in Google Image Search',
      color: 'gold',
    },
    {
      id: 'platforms' as const,
      name: 'Platform Integrations',
      icon: LinkIcon,
      description: 'Connect Shopify, Amazon, WooCommerce stores for bulk alt text optimization',
      color: 'forest',
    },
    {
      id: 'wcag' as const,
      name: 'WCAG AAA Checker',
      icon: Shield,
      description: 'Deep compliance analysis with detailed reports covering all WCAG 2.1 AAA criteria',
      color: 'ember',
    },
    {
      id: 'competitor' as const,
      name: 'Competitor Analysis',
      icon: TrendingUp,
      description: 'Scan competitor sites for alt text gaps and identify ranking opportunities',
      color: 'gold',
    },
    {
      id: 'audits' as const,
      name: 'Monthly Audits',
      icon: Calendar,
      description: 'Automated monthly compliance audits with professional PDF reports',
      color: 'forest',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold text-earth-100">Blue Ocean Features</h1>
        <p className="text-earth-400 mt-1">
          Advanced features that set TheAltText apart — not just accessibility, but real competitive advantage.
        </p>
      </div>

      {/* Feature tabs */}
      <div className="glass-panel p-2">
        <div className="flex flex-wrap gap-2">
          {features.map((feature) => {
            const Icon = feature.icon;
            const isActive = activeTab === feature.id;
            return (
              <button
                key={feature.id}
                onClick={() => setActiveTab(feature.id)}
                className={`flex-1 min-w-[150px] flex items-center gap-2 px-4 py-3 rounded-xl transition-all duration-200 ${
                  isActive
                    ? 'bg-gold-500/20 border-2 border-gold-500/40 text-gold-300'
                    : 'bg-charcoal-900/30 border border-earth-800/20 text-earth-400 hover:bg-charcoal-800'
                }`}
                aria-pressed={isActive}
              >
                <Icon size={20} aria-hidden="true" />
                <span className="text-sm font-medium">{feature.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Feature content */}
      <div className="glass-panel p-8">
        {activeTab === 'seo' && <SEOTab />}
        {activeTab === 'platforms' && <PlatformsTab />}
        {activeTab === 'wcag' && <WCAGTab />}
        {activeTab === 'competitor' && <CompetitorTab />}
        {activeTab === 'audits' && <AuditsTab />}
      </div>
    </div>
  );
}

function SEOTab() {
  const [productName, setProductName] = useState('');
  const [keywords, setKeywords] = useState('');
  const [platform, setPlatform] = useState('shopify');

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-earth-100 mb-2">E-Commerce SEO Optimization</h2>
        <p className="text-earth-400">
          Generate alt text that's not just accessible — it's optimized for search rankings.
          Front-load keywords, avoid stuffing, and get real SEO impact.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm text-earth-400 mb-2">Product Name</label>
          <input
            type="text"
            value={productName}
            onChange={(e) => setProductName(e.target.value)}
            className="input-field"
            placeholder="Organic Cotton T-Shirt"
          />
        </div>
        <div>
          <label className="block text-sm text-earth-400 mb-2">Target Keywords (comma-separated)</label>
          <input
            type="text"
            value={keywords}
            onChange={(e) => setKeywords(e.target.value)}
            className="input-field"
            placeholder="organic, cotton, sustainable, eco-friendly"
          />
        </div>
        <div>
          <label className="block text-sm text-earth-400 mb-2">Platform</label>
          <select value={platform} onChange={(e) => setPlatform(e.target.value)} className="input-field">
            <option value="shopify">Shopify</option>
            <option value="amazon">Amazon</option>
            <option value="woocommerce">WooCommerce</option>
            <option value="etsy">Etsy</option>
            <option value="generic">Generic</option>
          </select>
        </div>
      </div>

      <div className="bg-forest-900/20 border border-forest-700/30 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-forest-300 mb-3">SEO Benefits</h3>
        <ul className="space-y-2 text-sm text-earth-300">
          <li>✓ Keyword-rich alt text improves Google Image Search rankings</li>
          <li>✓ Front-loaded keywords for maximum SEO impact</li>
          <li>✓ Platform-specific character limits (Shopify: 512, Amazon: 1000, WooCommerce: 420)</li>
          <li>✓ SEO quality score with actionable recommendations</li>
          <li>✓ Avoid keyword stuffing while maximizing relevance</li>
        </ul>
      </div>

      <button className="btn-forest">Generate SEO-Optimized Alt Text</button>
    </div>
  );
}

function PlatformsTab() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-earth-100 mb-2">Platform Integrations</h2>
        <p className="text-earth-400">
          Connect your e-commerce store to bulk-process product images and push optimized alt text directly.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        {['Shopify', 'WooCommerce', 'Amazon SP-API'].map((platform) => (
          <div key={platform} className="glass-panel-hover p-6">
            <h3 className="font-semibold text-earth-100 mb-2">{platform}</h3>
            <p className="text-sm text-earth-400 mb-4">
              {platform === 'Shopify' && 'OAuth integration for secure store access'}
              {platform === 'WooCommerce' && 'REST API with consumer key/secret'}
              {platform === 'Amazon SP-API' && 'Seller Partner API for catalog items'}
            </p>
            <button className="btn-secondary w-full text-sm">Connect {platform}</button>
          </div>
        ))}
      </div>

      <div className="bg-gold-900/20 border border-gold-700/30 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-gold-300 mb-3">How It Works</h3>
        <ol className="space-y-2 text-sm text-earth-300 list-decimal list-inside">
          <li>Connect your store with secure OAuth or API credentials</li>
          <li>Fetch all product images with existing alt text</li>
          <li>Generate SEO-optimized alt text for each image</li>
          <li>Review and approve changes in bulk</li>
          <li>Push updated alt text back to your store automatically</li>
        </ol>
      </div>
    </div>
  );
}

function WCAGTab() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-earth-100 mb-2">WCAG AAA Compliance Checker</h2>
        <p className="text-earth-400">
          Deep compliance analysis covering all WCAG 2.1 AAA criteria related to images and alt text.
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm text-earth-400 mb-2">URL to Check</label>
          <input type="url" className="input-field" placeholder="https://example.com" />
        </div>
        <div>
          <label className="block text-sm text-earth-400 mb-2">WCAG Level</label>
          <select className="input-field">
            <option value="A">Level A (Minimum)</option>
            <option value="AA">Level AA (Standard)</option>
            <option value="AAA" selected>Level AAA (Enhanced)</option>
          </select>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-ember-900/20 border border-ember-700/30 rounded-xl p-4">
          <h4 className="font-semibold text-ember-300 mb-2">Checks Performed</h4>
          <ul className="text-sm text-earth-300 space-y-1">
            <li>• Missing alt attributes</li>
            <li>• Empty alt on non-decorative images</li>
            <li>• Filename as alt text</li>
            <li>• Generic/non-descriptive alt</li>
            <li>• Redundant prefixes</li>
            <li>• SVG accessibility</li>
            <li>• Image map areas</li>
            <li>• Contrast ratios</li>
          </ul>
        </div>
        <div className="bg-forest-900/20 border border-forest-700/30 rounded-xl p-4">
          <h4 className="font-semibold text-forest-300 mb-2">Report Includes</h4>
          <ul className="text-sm text-earth-300 space-y-1">
            <li>• Overall compliance score</li>
            <li>• Issues by severity (critical/major/minor)</li>
            <li>• Issues by WCAG criterion</li>
            <li>• Specific fixes for each issue</li>
            <li>• SEO impact analysis</li>
            <li>• Prioritized recommendations</li>
          </ul>
        </div>
      </div>

      <button className="btn-forest">Run WCAG AAA Check</button>
    </div>
  );
}

function CompetitorTab() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-earth-100 mb-2">Competitor Analysis</h2>
        <p className="text-earth-400">
          Scan competitor websites to find alt text gaps and identify SEO opportunities.
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm text-earth-400 mb-2">Your Website</label>
          <input type="url" className="input-field" placeholder="https://yoursite.com" />
        </div>
        <div>
          <label className="block text-sm text-earth-400 mb-2">Competitor URLs (one per line)</label>
          <textarea
            className="input-field"
            rows={4}
            placeholder="https://competitor1.com&#10;https://competitor2.com&#10;https://competitor3.com"
          />
        </div>
      </div>

      <div className="bg-gold-900/20 border border-gold-700/30 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-gold-300 mb-3">What You'll Discover</h3>
        <ul className="space-y-2 text-sm text-earth-300">
          <li>✓ Competitor compliance scores vs. yours</li>
          <li>✓ Pages with zero alt text coverage (easy wins)</li>
          <li>✓ Alt text quality comparison</li>
          <li>✓ SEO ranking opportunities</li>
          <li>✓ Accessibility leadership positioning</li>
          <li>✓ Specific gaps you can exploit</li>
        </ul>
      </div>

      <button className="btn-forest">Analyze Competitors</button>
    </div>
  );
}

function AuditsTab() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-earth-100 mb-2">Automated Monthly Audits</h2>
        <p className="text-earth-400">
          Schedule recurring audits with professional PDF reports for compliance documentation.
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm text-earth-400 mb-2">URLs to Monitor (one per line)</label>
          <textarea
            className="input-field"
            rows={4}
            placeholder="https://yoursite.com&#10;https://yoursite.com/products&#10;https://yoursite.com/about"
          />
        </div>
        <div>
          <label className="block text-sm text-earth-400 mb-2">Audit Frequency</label>
          <select className="input-field">
            <option value="monthly">Monthly (1st of each month)</option>
            <option value="weekly">Weekly (Every Monday)</option>
            <option value="quarterly">Quarterly</option>
          </select>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-forest-900/20 border border-forest-700/30 rounded-xl p-4">
          <h4 className="font-semibold text-forest-300 mb-2">PDF Report Includes</h4>
          <ul className="text-sm text-earth-300 space-y-1">
            <li>• Executive summary with compliance score</li>
            <li>• Issues categorized by severity</li>
            <li>• WCAG criterion breakdown</li>
            <li>• SEO impact analysis</li>
            <li>• Chain of custody for legal compliance</li>
            <li>• Actionable recommendations</li>
          </ul>
        </div>
        <div className="bg-ember-900/20 border border-ember-700/30 rounded-xl p-4">
          <h4 className="font-semibold text-ember-300 mb-2">Use Cases</h4>
          <ul className="text-sm text-earth-300 space-y-1">
            <li>• ADA compliance documentation</li>
            <li>• Legal protection against lawsuits</li>
            <li>• Track improvement over time</li>
            <li>• Executive reporting</li>
            <li>• Client deliverables (agencies)</li>
          </ul>
        </div>
      </div>

      <button className="btn-forest">Schedule Monthly Audits</button>
    </div>
  );
}
