/**
 * TheAltText — Bulk Upload Page
 * Upload multiple images for batch alt text generation.
 */

import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, Loader2, CheckCircle, AlertCircle, ImageIcon, Trash2 } from 'lucide-react';
import { imageAPI } from '../services/api';
import { LANGUAGES, TONES } from '../types';
import type { Tone } from '../types';

export default function BulkUploadPage() {
  const [files, setFiles] = useState<File[]>([]);
  const [language, setLanguage] = useState('en');
  const [tone, setTone] = useState<Tone>('formal');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setFiles((prev) => [...prev, ...acceptedFiles].slice(0, 100));
    setResult(null);
    setError('');
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'image/webp': ['.webp'],
      'image/gif': ['.gif'],
    },
    maxFiles: 100,
    maxSize: 50 * 1024 * 1024,
  });

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (files.length === 0) return;
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const { data } = await imageAPI.bulkUpload(files, { language, tone, wcag_level: 'AAA' });
      setResult(data);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Bulk upload failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold text-earth-100">Bulk Upload</h1>
        <p className="text-earth-400 mt-1">
          Upload up to 100 images at once for batch alt text generation.
        </p>
      </div>

      {/* Options */}
      <div className="glass-panel p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="bulk-language" className="block text-sm text-earth-400 mb-1">Language</label>
            <select id="bulk-language" value={language} onChange={(e) => setLanguage(e.target.value)} className="input-field">
              {LANGUAGES.map((l) => <option key={l.code} value={l.code}>{l.name}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="bulk-tone" className="block text-sm text-earth-400 mb-1">Tone</label>
            <select id="bulk-tone" value={tone} onChange={(e) => setTone(e.target.value as Tone)} className="input-field">
              {TONES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Drop Zone */}
      <div
        {...getRootProps()}
        className={`glass-panel p-12 text-center cursor-pointer transition-all ${
          isDragActive ? 'border-gold-400 bg-gold-500/5' : 'hover:border-gold-500/30'
        }`}
        role="button"
        aria-label="Drop zone for bulk image upload. Drag and drop up to 100 images."
      >
        <input {...getInputProps()} aria-label="Choose multiple image files" />
        <Upload size={32} className="text-gold-400 mx-auto mb-3" aria-hidden="true" />
        <p className="text-earth-200 font-medium">Drag & drop images here</p>
        <p className="text-sm text-earth-500 mt-1">Up to 100 images per batch (JPEG, PNG, WebP, GIF)</p>
      </div>

      {/* File List */}
      {files.length > 0 && (
        <div className="glass-panel p-6" role="region" aria-label={`${files.length} files selected for upload`}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-earth-100">{files.length} file{files.length !== 1 ? 's' : ''} selected</h2>
            <button
              onClick={() => setFiles([])}
              className="text-sm text-ember-400 hover:text-ember-300 transition-colors"
              aria-label="Remove all selected files"
            >
              Clear All
            </button>
          </div>
          <ul className="space-y-2 max-h-60 overflow-y-auto" role="list">
            {files.map((file, i) => (
              <li key={`${file.name}-${i}`} className="flex items-center justify-between p-2 rounded-lg bg-charcoal-900/50">
                <div className="flex items-center gap-2">
                  <ImageIcon size={16} className="text-earth-500" aria-hidden="true" />
                  <span className="text-sm text-earth-300 truncate max-w-xs">{file.name}</span>
                  <span className="text-xs text-earth-600">{(file.size / 1024).toFixed(0)}KB</span>
                </div>
                <button onClick={() => removeFile(i)} className="text-earth-600 hover:text-ember-400" aria-label={`Remove ${file.name}`}>
                  <Trash2 size={14} aria-hidden="true" />
                </button>
              </li>
            ))}
          </ul>

          <button
            onClick={handleUpload}
            disabled={loading}
            className="btn-primary w-full mt-4 flex items-center justify-center gap-2"
            aria-label={`Process ${files.length} images for alt text generation`}
          >
            {loading ? (
              <>
                <Loader2 size={18} className="animate-spin" aria-hidden="true" />
                Processing {files.length} images...
              </>
            ) : (
              <>
                <Upload size={18} aria-hidden="true" />
                Generate Alt Text for {files.length} Images
              </>
            )}
          </button>
        </div>
      )}

      {/* Result */}
      {result && (
        <div className="glass-panel p-6" role="status" aria-live="polite">
          <div className="flex items-center gap-3 mb-4">
            {result.status === 'completed' ? (
              <CheckCircle size={24} className="text-forest-400" aria-hidden="true" />
            ) : (
              <AlertCircle size={24} className="text-gold-400" aria-hidden="true" />
            )}
            <h2 className="font-semibold text-earth-100">Bulk Processing Complete</h2>
          </div>
          <p className="text-earth-300">{result.message}</p>
          <div className="mt-3 text-sm text-earth-400">
            <p>Total processed: {result.total_images}</p>
            <p>Job ID: {result.job_id}</p>
          </div>
        </div>
      )}

      {error && (
        <div className="glass-panel p-6 border-ember-700/30" role="alert">
          <p className="text-ember-300">{error}</p>
        </div>
      )}
    </div>
  );
}
