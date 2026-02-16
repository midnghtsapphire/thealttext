/**
 * TheAltText — Analyze Image Page
 * Single image analysis with drag-and-drop and URL input.
 */

import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import {
  Upload,
  Link2,
  Copy,
  Check,
  Loader2,
  ImageIcon,
  Sparkles,
  Leaf,
} from 'lucide-react';
import { imageAPI } from '../services/api';
import type { AltTextResult, Tone, WCAGLevel } from '../types';
import { LANGUAGES, TONES } from '../types';

export default function AnalyzePage() {
  const [mode, setMode] = useState<'upload' | 'url'>('upload');
  const [imageUrl, setImageUrl] = useState('');
  const [language, setLanguage] = useState('en');
  const [tone, setTone] = useState<Tone>('formal');
  const [wcagLevel, setWcagLevel] = useState<WCAGLevel>('AAA');
  const [context, setContext] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AltTextResult | null>(null);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;
    const file = acceptedFiles[0];

    // Show preview
    const reader = new FileReader();
    reader.onload = () => setPreviewUrl(reader.result as string);
    reader.readAsDataURL(file);

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const { data } = await imageAPI.analyzeFile(file, { language, tone, wcag_level: wcagLevel, context: context || undefined });
      setResult(data);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Analysis failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [language, tone, wcagLevel, context]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'image/webp': ['.webp'],
      'image/gif': ['.gif'],
      'image/svg+xml': ['.svg'],
      'image/bmp': ['.bmp'],
      'image/tiff': ['.tiff', '.tif'],
    },
    maxFiles: 1,
    maxSize: 50 * 1024 * 1024,
  });

  const handleUrlAnalyze = async () => {
    if (!imageUrl.trim()) return;
    setLoading(true);
    setError('');
    setResult(null);
    setPreviewUrl(imageUrl);

    try {
      const { data } = await imageAPI.analyzeUrl({
        image_url: imageUrl,
        language,
        tone,
        wcag_level: wcagLevel,
        context: context || undefined,
      });
      setResult(data);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Analysis failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async () => {
    if (!result) return;
    await navigator.clipboard.writeText(result.generated_text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold text-earth-100">Analyze Image</h1>
        <p className="text-earth-400 mt-1">
          Upload an image or provide a URL to generate WCAG-compliant alt text.
        </p>
      </div>

      {/* Options Panel */}
      <div className="glass-panel p-6 space-y-4">
        <h2 className="font-semibold text-earth-200 text-sm uppercase tracking-wider">Generation Options</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label htmlFor="language-select" className="block text-sm text-earth-400 mb-1">Language</label>
            <select
              id="language-select"
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="input-field"
              aria-label="Select output language for alt text"
            >
              {LANGUAGES.map((l) => (
                <option key={l.code} value={l.code}>{l.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="tone-select" className="block text-sm text-earth-400 mb-1">Tone</label>
            <select
              id="tone-select"
              value={tone}
              onChange={(e) => setTone(e.target.value as Tone)}
              className="input-field"
              aria-label="Select writing tone for alt text"
            >
              {TONES.map((t) => (
                <option key={t.value} value={t.value}>{t.label} — {t.description}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="wcag-select" className="block text-sm text-earth-400 mb-1">WCAG Level</label>
            <select
              id="wcag-select"
              value={wcagLevel}
              onChange={(e) => setWcagLevel(e.target.value as WCAGLevel)}
              className="input-field"
              aria-label="Select target WCAG compliance level"
            >
              <option value="A">Level A</option>
              <option value="AA">Level AA</option>
              <option value="AAA">Level AAA (Recommended)</option>
            </select>
          </div>
        </div>
        <div>
          <label htmlFor="context-input" className="block text-sm text-earth-400 mb-1">
            Context <span className="text-earth-600">(optional — helps AI understand the image purpose)</span>
          </label>
          <input
            id="context-input"
            type="text"
            value={context}
            onChange={(e) => setContext(e.target.value)}
            className="input-field"
            placeholder="e.g., Product photo for e-commerce listing, Team headshot for about page"
          />
        </div>
      </div>

      {/* Mode Tabs */}
      <div className="flex gap-2" role="tablist" aria-label="Image input method">
        <button
          role="tab"
          aria-selected={mode === 'upload'}
          onClick={() => setMode('upload')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
            mode === 'upload' ? 'bg-gold-500/10 text-gold-300 border border-gold-500/20' : 'text-earth-400 hover:text-earth-200'
          }`}
        >
          <Upload size={16} aria-hidden="true" /> Upload File
        </button>
        <button
          role="tab"
          aria-selected={mode === 'url'}
          onClick={() => setMode('url')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
            mode === 'url' ? 'bg-gold-500/10 text-gold-300 border border-gold-500/20' : 'text-earth-400 hover:text-earth-200'
          }`}
        >
          <Link2 size={16} aria-hidden="true" /> Image URL
        </button>
      </div>

      {/* Upload / URL Input */}
      <div role="tabpanel">
        {mode === 'upload' ? (
          <div
            {...getRootProps()}
            className={`glass-panel p-12 text-center cursor-pointer transition-all duration-200 ${
              isDragActive ? 'border-gold-400 bg-gold-500/5' : 'hover:border-gold-500/30'
            }`}
            role="button"
            aria-label="Drop zone: drag and drop an image file here, or click to browse"
          >
            <input {...getInputProps()} aria-label="Choose image file to analyze" />
            <div className="flex flex-col items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gold-500/10 flex items-center justify-center" aria-hidden="true">
                <ImageIcon size={32} className="text-gold-400" />
              </div>
              {isDragActive ? (
                <p className="text-gold-300 font-medium">Drop your image here...</p>
              ) : (
                <>
                  <p className="text-earth-200 font-medium">Drag & drop an image here</p>
                  <p className="text-sm text-earth-500">or click to browse. Supports JPEG, PNG, WebP, GIF, SVG, BMP, TIFF (max 50MB)</p>
                </>
              )}
            </div>
          </div>
        ) : (
          <div className="glass-panel p-6">
            <label htmlFor="image-url" className="block text-sm text-earth-400 mb-2">Image URL</label>
            <div className="flex gap-3">
              <input
                id="image-url"
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                className="input-field flex-1"
                placeholder="https://example.com/image.jpg"
                aria-label="Enter the public URL of the image to analyze"
              />
              <button
                onClick={handleUrlAnalyze}
                disabled={loading || !imageUrl.trim()}
                className="btn-primary flex items-center gap-2 disabled:opacity-50"
                aria-label="Analyze image from URL"
              >
                {loading ? <Loader2 size={18} className="animate-spin" aria-hidden="true" /> : <Sparkles size={18} aria-hidden="true" />}
                Analyze
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Loading */}
      {loading && (
        <div className="glass-panel p-8 text-center" role="status" aria-live="polite">
          <Loader2 size={32} className="animate-spin text-gold-400 mx-auto mb-3" aria-hidden="true" />
          <p className="text-earth-300">Generating WCAG-compliant alt text...</p>
          <p className="text-sm text-earth-500 mt-1">Using free-first AI model stack</p>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="glass-panel p-6 border-ember-700/30" role="alert" aria-live="assertive">
          <p className="text-ember-300">{error}</p>
        </div>
      )}

      {/* Result */}
      {result && (
        <div className="glass-panel p-6 space-y-4" role="region" aria-label="Generated alt text result">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-earth-100 flex items-center gap-2">
              <Sparkles size={18} className="text-gold-400" aria-hidden="true" />
              Generated Alt Text
            </h2>
            <button
              onClick={copyToClipboard}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-charcoal-800 hover:bg-charcoal-700 text-sm text-earth-300 transition-colors"
              aria-label={copied ? 'Alt text copied to clipboard' : 'Copy alt text to clipboard'}
            >
              {copied ? <Check size={14} className="text-forest-400" aria-hidden="true" /> : <Copy size={14} aria-hidden="true" />}
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>

          {/* Preview + Result */}
          <div className="flex flex-col md:flex-row gap-6">
            {previewUrl && (
              <div className="w-full md:w-48 flex-shrink-0">
                <img
                  src={previewUrl}
                  alt={result.generated_text}
                  className="w-full h-auto rounded-xl border border-earth-800/30 object-cover"
                />
              </div>
            )}
            <div className="flex-1 space-y-4">
              <div className="p-4 rounded-xl bg-charcoal-900/50 border border-gold-500/10">
                <p className="text-earth-100 leading-relaxed text-lg">"{result.generated_text}"</p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                <div>
                  <span className="text-earth-500 block">Language</span>
                  <span className="text-earth-200">{result.language.toUpperCase()}</span>
                </div>
                <div>
                  <span className="text-earth-500 block">Tone</span>
                  <span className="text-earth-200 capitalize">{result.tone}</span>
                </div>
                <div>
                  <span className="text-earth-500 block">WCAG Level</span>
                  <span className="text-earth-200">{result.wcag_level}</span>
                </div>
                <div>
                  <span className="text-earth-500 block">Characters</span>
                  <span className="text-earth-200">{result.character_count}</span>
                </div>
                <div>
                  <span className="text-earth-500 block">Confidence</span>
                  <span className="text-earth-200">{result.confidence_score ? `${(result.confidence_score * 100).toFixed(0)}%` : 'N/A'}</span>
                </div>
                <div>
                  <span className="text-earth-500 block">Model</span>
                  <span className="text-earth-200 text-xs">{result.model_used?.split('/').pop() || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-earth-500 block">Time</span>
                  <span className="text-earth-200">{result.processing_time_ms}ms</span>
                </div>
                <div>
                  <span className="text-earth-500 block flex items-center gap-1">
                    <Leaf size={12} className="text-forest-500" aria-hidden="true" /> CO₂
                  </span>
                  <span className="text-forest-300">{result.carbon_cost_mg}mg</span>
                </div>
              </div>
            </div>
          </div>

          {/* HTML snippet */}
          <div>
            <p className="text-sm text-earth-400 mb-2">Ready-to-use HTML:</p>
            <pre className="p-3 rounded-xl bg-charcoal-900 text-sm text-earth-300 overflow-x-auto">
              <code>{`<img src="your-image.jpg" alt="${result.generated_text}" />`}</code>
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}
