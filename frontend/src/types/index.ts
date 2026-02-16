/**
 * TheAltText — TypeScript Types
 */

export interface User {
  id: number;
  email: string;
  full_name: string | null;
  organization: string | null;
  tier: 'free' | 'pro' | 'enterprise';
  monthly_usage: number;
  preferred_language: string;
  preferred_tone: string;
  created_at: string;
}

export interface AltTextResult {
  id: number;
  image_id: number;
  generated_text: string;
  language: string;
  tone: string;
  model_used: string | null;
  confidence_score: number | null;
  wcag_level: string;
  character_count: number | null;
  carbon_cost_mg: number | null;
  processing_time_ms: number | null;
  created_at: string;
}

export interface ScanJob {
  id: number;
  target_url: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  scan_depth: number;
  pages_scanned: number;
  images_found: number;
  images_missing_alt: number;
  error_message: string | null;
  created_at: string;
  completed_at: string | null;
}

export interface Report {
  id: number;
  title: string;
  report_type: string;
  target_url: string | null;
  total_images: number;
  images_with_alt: number;
  images_without_alt: number;
  images_with_poor_alt: number;
  compliance_score: number;
  wcag_level: string;
  summary: string | null;
  carbon_total_mg: number;
  created_at: string;
}

export interface DashboardStats {
  total_images_processed: number;
  total_alt_texts_generated: number;
  total_scans: number;
  monthly_usage: number;
  monthly_limit: number;
  compliance_score_avg: number;
  carbon_saved_mg: number;
  tier: string;
}

export interface APIKeyData {
  id: number;
  key_prefix: string;
  name: string;
  is_active: boolean;
  requests_count: number;
  last_used_at: string | null;
  created_at: string;
  full_key?: string;
}

export type Tone = 'formal' | 'casual' | 'technical' | 'simple';
export type WCAGLevel = 'A' | 'AA' | 'AAA';

export const LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Spanish' },
  { code: 'fr', name: 'French' },
  { code: 'de', name: 'German' },
  { code: 'pt', name: 'Portuguese' },
  { code: 'ja', name: 'Japanese' },
  { code: 'ko', name: 'Korean' },
  { code: 'zh', name: 'Chinese' },
  { code: 'ar', name: 'Arabic' },
  { code: 'hi', name: 'Hindi' },
  { code: 'it', name: 'Italian' },
  { code: 'nl', name: 'Dutch' },
  { code: 'ru', name: 'Russian' },
  { code: 'haw', name: 'Hawaiian' },
];

export const TONES: { value: Tone; label: string; description: string }[] = [
  { value: 'formal', label: 'Formal', description: 'Professional, corporate-ready' },
  { value: 'casual', label: 'Casual', description: 'Friendly, blog-style' },
  { value: 'technical', label: 'Technical', description: 'Precise, detailed' },
  { value: 'simple', label: 'Simple', description: '6th-grade reading level' },
];
