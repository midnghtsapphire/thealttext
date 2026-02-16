/**
 * TheAltText — Landing Page
 * Public-facing page with features, pricing, and CTA.
 */

import React from 'react';
import { Link } from 'react-router-dom';
import {
  ImageIcon,
  ScanLine,
  Globe2,
  Zap,
  Shield,
  Code2,
  Leaf,
  FileText,
  ArrowRight,
  Check,
  Star,
} from 'lucide-react';

const features = [
  {
    icon: ImageIcon,
    title: 'AI Alt Text Generation',
    description: 'Generate descriptive, WCAG AAA compliant alt text for any image using advanced vision AI models.',
  },
  {
    icon: ScanLine,
    title: 'Website Scanner',
    description: 'Crawl entire websites to audit image accessibility and identify missing or poor alt text.',
  },
  {
    icon: Globe2,
    title: '14+ Languages',
    description: 'Generate alt text in English, Spanish, French, Japanese, Hawaiian, and many more languages.',
  },
  {
    icon: Zap,
    title: 'Bulk Processing',
    description: 'Upload entire folders of images for batch processing. Perfect for large catalogs.',
  },
  {
    icon: Code2,
    title: 'Developer API',
    description: 'RESTful API with simple authentication. Integrate alt text generation into any workflow.',
  },
  {
    icon: Leaf,
    title: 'Carbon Tracking',
    description: 'Monitor the environmental impact of your AI usage with built-in eco tracking.',
  },
  {
    icon: Shield,
    title: 'ADA Compliance',
    description: 'Meet ADA, Section 508, and WCAG 2.1 AAA standards. Avoid costly lawsuits.',
  },
  {
    icon: FileText,
    title: 'Export Reports',
    description: 'Generate detailed compliance reports in JSON, CSV, or PDF format for stakeholders.',
  },
];

const pricingPlans = [
  {
    name: 'Free',
    price: '$0',
    period: '/month',
    description: 'Perfect for trying out TheAltText',
    features: [
      '50 images per month',
      'Single image analysis',
      'URL scanner (1 page)',
      'JSON/CSV export',
      '14+ languages',
      'All tone styles',
      'Carbon tracking',
    ],
    cta: 'Get Started Free',
    ctaLink: '/register',
    highlighted: false,
  },
  {
    name: 'Pro',
    price: '$29',
    period: '/month',
    description: 'For professionals and growing businesses',
    features: [
      'Unlimited images',
      'Bulk upload (100 at a time)',
      'Deep website scanning (5 levels)',
      'PDF compliance reports',
      'Priority AI models',
      'Developer API access',
      'Priority support',
      'Carbon offset tracking',
    ],
    cta: 'Start Pro Trial',
    ctaLink: '/register',
    highlighted: true,
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-charcoal-950 bg-mesh">
      {/* Skip link */}
      <a href="#main-landing" className="skip-link">Skip to main content</a>

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 glass-panel border-b border-earth-800/20" role="banner">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-4 py-3 md:px-8">
          <Link to="/" className="flex items-center gap-2" aria-label="TheAltText home">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-gold-500 to-forest-600 flex items-center justify-center" aria-hidden="true">
              <span className="text-xs font-bold text-charcoal-950">AT</span>
            </div>
            <span className="font-display font-bold text-xl text-gradient-gold">TheAltText</span>
          </Link>
          <nav className="flex items-center gap-4" aria-label="Landing page navigation">
            <a href="#features" className="text-sm text-earth-300 hover:text-gold-400 transition-colors hidden md:inline">Features</a>
            <a href="#pricing" className="text-sm text-earth-300 hover:text-gold-400 transition-colors hidden md:inline">Pricing</a>
            <Link to="/login" className="btn-secondary text-sm !px-4 !py-2">Log In</Link>
            <Link to="/register" className="btn-primary text-sm !px-4 !py-2">Sign Up Free</Link>
          </nav>
        </div>
      </header>

      <main id="main-landing" role="main">
        {/* Hero Section */}
        <section className="pt-32 pb-20 px-4 md:px-8" aria-labelledby="hero-heading">
          <div className="max-w-5xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gold-500/10 border border-gold-500/20 mb-8">
              <Star size={14} className="text-gold-400" aria-hidden="true" />
              <span className="text-sm text-gold-300">WCAG AAA Compliant Alt Text in Seconds</span>
            </div>

            <h1 id="hero-heading" className="font-display text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
              <span className="text-gradient-gold">AI-Powered</span>{' '}
              <span className="text-earth-100">Alt Text</span>
              <br />
              <span className="text-earth-100">for </span>
              <span className="text-gradient-forest">ADA Compliance</span>
            </h1>

            <p className="text-lg md:text-xl text-earth-300 max-w-3xl mx-auto mb-10 leading-relaxed">
              Generate descriptive, accessible alt text for every image on your website.
              Protect your business from ADA lawsuits. Support screen reader users.
              Practice what we preach — this entire app is WCAG AAA compliant.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/register" className="btn-primary text-lg !px-8 !py-4 flex items-center gap-2">
                Start Free — 50 Images/Month
                <ArrowRight size={18} aria-hidden="true" />
              </Link>
              <Link to="/login" className="btn-secondary text-lg !px-8 !py-4">
                Log In
              </Link>
            </div>

            <p className="mt-6 text-sm text-earth-500">
              No credit card required. Free tier includes 50 images per month.
            </p>
          </div>
        </section>

        {/* Features Grid */}
        <section id="features" className="py-20 px-4 md:px-8" aria-labelledby="features-heading">
          <div className="max-w-7xl mx-auto">
            <h2 id="features-heading" className="font-display text-3xl md:text-4xl font-bold text-center mb-4 text-gradient-gold">
              Everything You Need for Image Accessibility
            </h2>
            <p className="text-center text-earth-400 mb-12 max-w-2xl mx-auto">
              From single images to entire websites, TheAltText handles it all with AI precision.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {features.map((feature) => {
                const Icon = feature.icon;
                return (
                  <article key={feature.title} className="glass-panel-hover p-6">
                    <div className="w-12 h-12 rounded-xl bg-gold-500/10 flex items-center justify-center mb-4" aria-hidden="true">
                      <Icon size={24} className="text-gold-400" />
                    </div>
                    <h3 className="font-semibold text-earth-100 mb-2">{feature.title}</h3>
                    <p className="text-sm text-earth-400 leading-relaxed">{feature.description}</p>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section id="pricing" className="py-20 px-4 md:px-8" aria-labelledby="pricing-heading">
          <div className="max-w-4xl mx-auto">
            <h2 id="pricing-heading" className="font-display text-3xl md:text-4xl font-bold text-center mb-4 text-gradient-gold">
              Simple, Transparent Pricing
            </h2>
            <p className="text-center text-earth-400 mb-12">
              Start free. Upgrade when you need more.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {pricingPlans.map((plan) => (
                <article
                  key={plan.name}
                  className={`glass-panel p-8 ${plan.highlighted ? 'border-gold-500/30 ring-1 ring-gold-500/20' : ''}`}
                >
                  {plan.highlighted && (
                    <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-gold-500/10 text-gold-300 text-xs font-medium mb-4">
                      <Star size={12} aria-hidden="true" /> Most Popular
                    </div>
                  )}
                  <h3 className="font-display text-2xl font-bold text-earth-100">{plan.name}</h3>
                  <div className="flex items-baseline gap-1 mt-2 mb-4">
                    <span className="text-4xl font-bold text-gradient-gold">{plan.price}</span>
                    <span className="text-earth-400">{plan.period}</span>
                  </div>
                  <p className="text-earth-400 mb-6">{plan.description}</p>
                  <ul className="space-y-3 mb-8" role="list" aria-label={`${plan.name} plan features`}>
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-2 text-sm text-earth-300">
                        <Check size={16} className="text-forest-400 flex-shrink-0" aria-hidden="true" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Link
                    to={plan.ctaLink}
                    className={`block text-center ${plan.highlighted ? 'btn-primary' : 'btn-secondary'} w-full`}
                  >
                    {plan.cta}
                  </Link>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 px-4 md:px-8" aria-labelledby="cta-heading">
          <div className="max-w-3xl mx-auto text-center glass-panel p-12">
            <h2 id="cta-heading" className="font-display text-3xl font-bold mb-4 text-earth-100">
              Make Your Website Accessible Today
            </h2>
            <p className="text-earth-400 mb-8">
              Join thousands of businesses using TheAltText to meet ADA compliance standards
              and make the web accessible for everyone.
            </p>
            <Link to="/register" className="btn-primary text-lg !px-8 !py-4 inline-flex items-center gap-2">
              Get Started Free
              <ArrowRight size={18} aria-hidden="true" />
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-earth-800/20 py-12 px-4 md:px-8" role="contentinfo">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-gradient-to-br from-gold-500 to-forest-600 flex items-center justify-center" aria-hidden="true">
              <span className="text-[8px] font-bold text-charcoal-950">AT</span>
            </div>
            <span className="text-sm text-earth-400">
              TheAltText by{' '}
              <a href="https://meetaudreyevans.com" target="_blank" rel="noopener noreferrer" className="text-gold-400 hover:text-gold-300">
                GlowStarLabs
              </a>
            </span>
          </div>
          <div className="flex items-center gap-6 text-sm text-earth-500">
            <a href="https://meetaudreyevans.com" target="_blank" rel="noopener noreferrer" className="hover:text-gold-400 transition-colors">Hub</a>
            <a href="https://glowstarlabs.com" target="_blank" rel="noopener noreferrer" className="hover:text-gold-400 transition-colors">GlowStarLabs</a>
            <span>© {new Date().getFullYear()} Audrey Evans</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
