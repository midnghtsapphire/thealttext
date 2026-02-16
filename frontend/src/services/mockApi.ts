/**
 * TheAltText — Mock/Demo API Service
 * Provides demo data when no backend is running.
 * Uses OpenRouter API for real AI alt text generation when VITE_OPENROUTER_API_KEY is set.
 * A GlowStarLabs product by Audrey Evans.
 */

import type { User, AltTextResult, DashboardStats, ScanJob, Report, APIKeyData } from '../types';

// ── Simulated delay ─────────────────────────────────────────────────────────
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// ── Demo user ───────────────────────────────────────────────────────────────
const DEMO_USER: User = {
  id: 1,
  email: 'demo@thealttext.com',
  full_name: 'Demo User',
  organization: 'GlowStarLabs',
  tier: 'pro',
  monthly_usage: 12,
  preferred_language: 'en',
  preferred_tone: 'formal',
  created_at: new Date().toISOString(),
};

// ── Demo stats ──────────────────────────────────────────────────────────────
const DEMO_STATS: DashboardStats = {
  total_images_processed: 247,
  total_alt_texts_generated: 243,
  total_scans: 18,
  monthly_usage: 12,
  monthly_limit: -1,
  compliance_score_avg: 87,
  carbon_saved_mg: 1240,
  tier: 'pro',
};

const DEMO_CARBON = {
  co2_grams: 1.24,
  trees_equivalent_minutes: 0.42,
  message: 'Your AI usage is equivalent to a tree absorbing CO₂ for less than a minute. Keep it green!',
};

// ── Demo reports ────────────────────────────────────────────────────────────
const DEMO_REPORTS: Report[] = [
  {
    id: 1,
    title: 'meetaudreyevans.com Compliance Audit',
    report_type: 'website_scan',
    target_url: 'https://meetaudreyevans.com',
    total_images: 42,
    images_with_alt: 38,
    images_without_alt: 3,
    images_with_poor_alt: 1,
    compliance_score: 90,
    wcag_level: 'AAA',
    summary: 'Overall strong compliance. 3 images missing alt text on the portfolio page. 1 image has a generic "image" alt text that should be more descriptive.',
    carbon_total_mg: 320,
    created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
  {
    id: 2,
    title: 'glowstarlabs.com Compliance Audit',
    report_type: 'website_scan',
    target_url: 'https://glowstarlabs.com',
    total_images: 28,
    images_with_alt: 25,
    images_without_alt: 2,
    images_with_poor_alt: 1,
    compliance_score: 89,
    wcag_level: 'AA',
    summary: 'Good compliance overall. Missing alt text on 2 hero images and 1 icon with non-descriptive alt.',
    carbon_total_mg: 210,
    created_at: new Date(Date.now() - 7 * 86400000).toISOString(),
  },
];

// ── Demo scan jobs ──────────────────────────────────────────────────────────
const DEMO_SCAN_JOBS: ScanJob[] = [
  {
    id: 1,
    target_url: 'https://meetaudreyevans.com',
    status: 'completed',
    scan_depth: 3,
    pages_scanned: 12,
    images_found: 42,
    images_missing_alt: 3,
    error_message: null,
    created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
    completed_at: new Date(Date.now() - 2 * 86400000 + 45000).toISOString(),
  },
  {
    id: 2,
    target_url: 'https://glowstarlabs.com',
    status: 'completed',
    scan_depth: 2,
    pages_scanned: 8,
    images_found: 28,
    images_missing_alt: 2,
    error_message: null,
    created_at: new Date(Date.now() - 7 * 86400000).toISOString(),
    completed_at: new Date(Date.now() - 7 * 86400000 + 30000).toISOString(),
  },
];

// ── Demo API keys ───────────────────────────────────────────────────────────
let demoKeys: APIKeyData[] = [
  {
    id: 1,
    key_prefix: 'tat_demo_',
    name: 'Production Key',
    is_active: true,
    requests_count: 1247,
    last_used_at: new Date(Date.now() - 3600000).toISOString(),
    created_at: new Date(Date.now() - 30 * 86400000).toISOString(),
  },
];

// ── Demo alt text samples ───────────────────────────────────────────────────
const DEMO_ALT_TEXTS = [
  'A golden retriever sitting on a sunlit wooden porch, looking directly at the camera with a friendly expression. The dog has a shiny coat and wears a red collar.',
  'An aerial view of a winding river cutting through a dense forest of evergreen trees, with morning mist rising from the water surface.',
  'A close-up of hands typing on a laptop keyboard in a modern office space, with a cup of coffee and a notebook visible in the background.',
  'A vibrant sunset over the ocean, with shades of orange, pink, and purple reflected on the calm water surface. Silhouettes of palm trees frame the scene.',
  'A professional headshot of a person wearing a dark blazer, smiling confidently against a neutral gray background. The lighting is soft and even.',
];

// ── OpenRouter AI Integration ───────────────────────────────────────────────
const OPENROUTER_API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY || '';

async function generateAltTextWithAI(
  imageDataUrl: string,
  options: { language?: string; tone?: string; wcag_level?: string; context?: string }
): Promise<string> {
  const toneMap: Record<string, string> = {
    formal: 'professional and corporate-ready',
    casual: 'friendly and conversational',
    technical: 'precise and technically detailed',
    simple: 'simple, at a 6th-grade reading level',
  };

  const toneDesc = toneMap[options.tone || 'formal'] || 'professional';
  const langNote = options.language && options.language !== 'en' ? ` Respond in the language with code "${options.language}".` : '';
  const contextNote = options.context ? ` Context: ${options.context}.` : '';

  const prompt = `Generate a WCAG ${options.wcag_level || 'AAA'} compliant alt text description for this image. The tone should be ${toneDesc}. Keep it concise but descriptive (under 150 characters if possible). Do not start with "Image of" or "Picture of". Just provide the alt text, nothing else.${langNote}${contextNote}`;

  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': window.location.origin,
      'X-Title': 'TheAltText',
    },
    body: JSON.stringify({
      model: 'google/gemini-2.0-flash-exp:free',
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: prompt },
            { type: 'image_url', image_url: { url: imageDataUrl } },
          ],
        },
      ],
      max_tokens: 300,
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenRouter API error: ${response.status}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content?.trim() || 'Alt text generation failed';
}

async function generateAltTextFromUrl(
  imageUrl: string,
  options: { language?: string; tone?: string; wcag_level?: string; context?: string }
): Promise<string> {
  const toneMap: Record<string, string> = {
    formal: 'professional and corporate-ready',
    casual: 'friendly and conversational',
    technical: 'precise and technically detailed',
    simple: 'simple, at a 6th-grade reading level',
  };

  const toneDesc = toneMap[options.tone || 'formal'] || 'professional';
  const langNote = options.language && options.language !== 'en' ? ` Respond in the language with code "${options.language}".` : '';
  const contextNote = options.context ? ` Context: ${options.context}.` : '';

  const prompt = `Generate a WCAG ${options.wcag_level || 'AAA'} compliant alt text description for this image. The tone should be ${toneDesc}. Keep it concise but descriptive (under 150 characters if possible). Do not start with "Image of" or "Picture of". Just provide the alt text, nothing else.${langNote}${contextNote}`;

  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': window.location.origin,
      'X-Title': 'TheAltText',
    },
    body: JSON.stringify({
      model: 'google/gemini-2.0-flash-exp:free',
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: prompt },
            { type: 'image_url', image_url: { url: imageUrl } },
          ],
        },
      ],
      max_tokens: 300,
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenRouter API error: ${response.status}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content?.trim() || 'Alt text generation failed';
}

// ── Helper: file to data URL ────────────────────────────────────────────────
function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// ── Mock API implementations ────────────────────────────────────────────────

export const mockAuthAPI = {
  register: async (data: { email: string; password: string; full_name?: string; organization?: string }) => {
    await delay(600);
    const user: User = {
      ...DEMO_USER,
      email: data.email,
      full_name: data.full_name || null,
      organization: data.organization || null,
      tier: 'free',
      monthly_usage: 0,
    };
    return { data: { access_token: 'demo_token_' + Date.now(), user } };
  },

  login: async (_data: { email: string; password: string }) => {
    await delay(600);
    return { data: { access_token: 'demo_token_' + Date.now(), user: DEMO_USER } };
  },

  getProfile: async () => {
    await delay(200);
    return { data: DEMO_USER };
  },

  updateProfile: async (data: { full_name?: string; organization?: string; preferred_language?: string; preferred_tone?: string }) => {
    await delay(400);
    Object.assign(DEMO_USER, {
      ...(data.full_name !== undefined && { full_name: data.full_name }),
      ...(data.organization !== undefined && { organization: data.organization }),
      ...(data.preferred_language !== undefined && { preferred_language: data.preferred_language }),
      ...(data.preferred_tone !== undefined && { preferred_tone: data.preferred_tone }),
    });
    return { data: DEMO_USER };
  },
};

export const mockImageAPI = {
  analyzeFile: async (file: File, options: { language?: string; tone?: string; wcag_level?: string; context?: string } = {}) => {
    const startTime = Date.now();
    let generatedText: string;
    let modelUsed: string;

    if (OPENROUTER_API_KEY) {
      try {
        const dataUrl = await fileToDataUrl(file);
        generatedText = await generateAltTextWithAI(dataUrl, options);
        modelUsed = 'google/gemini-2.0-flash-exp:free';
      } catch (err) {
        console.warn('OpenRouter API failed, using demo fallback:', err);
        generatedText = DEMO_ALT_TEXTS[Math.floor(Math.random() * DEMO_ALT_TEXTS.length)];
        modelUsed = 'demo/fallback';
      }
    } else {
      await delay(1500);
      generatedText = DEMO_ALT_TEXTS[Math.floor(Math.random() * DEMO_ALT_TEXTS.length)];
      modelUsed = 'demo/sample';
    }

    const processingTime = Date.now() - startTime;

    const result: AltTextResult = {
      id: Date.now(),
      image_id: Date.now(),
      generated_text: generatedText,
      language: options.language || 'en',
      tone: options.tone || 'formal',
      model_used: modelUsed,
      confidence_score: 0.94,
      wcag_level: options.wcag_level || 'AAA',
      character_count: generatedText.length,
      carbon_cost_mg: Math.round(Math.random() * 5 + 2),
      processing_time_ms: processingTime,
      created_at: new Date().toISOString(),
    };

    return { data: result };
  },

  analyzeUrl: async (data: { image_url: string; language?: string; tone?: string; wcag_level?: string; context?: string }) => {
    const startTime = Date.now();
    let generatedText: string;
    let modelUsed: string;

    if (OPENROUTER_API_KEY) {
      try {
        generatedText = await generateAltTextFromUrl(data.image_url, data);
        modelUsed = 'google/gemini-2.0-flash-exp:free';
      } catch (err) {
        console.warn('OpenRouter API failed, using demo fallback:', err);
        generatedText = DEMO_ALT_TEXTS[Math.floor(Math.random() * DEMO_ALT_TEXTS.length)];
        modelUsed = 'demo/fallback';
      }
    } else {
      await delay(1500);
      generatedText = DEMO_ALT_TEXTS[Math.floor(Math.random() * DEMO_ALT_TEXTS.length)];
      modelUsed = 'demo/sample';
    }

    const processingTime = Date.now() - startTime;

    const result: AltTextResult = {
      id: Date.now(),
      image_id: Date.now(),
      generated_text: generatedText,
      language: data.language || 'en',
      tone: data.tone || 'formal',
      model_used: modelUsed,
      confidence_score: 0.91,
      wcag_level: data.wcag_level || 'AAA',
      character_count: generatedText.length,
      carbon_cost_mg: Math.round(Math.random() * 5 + 2),
      processing_time_ms: processingTime,
      created_at: new Date().toISOString(),
    };

    return { data: result };
  },

  bulkUpload: async (files: File[], _options: { language?: string; tone?: string; wcag_level?: string } = {}) => {
    await delay(2000);
    return {
      data: {
        status: 'completed',
        message: `Successfully generated alt text for ${files.length} images.`,
        total_images: files.length,
        job_id: 'demo_bulk_' + Date.now(),
      },
    };
  },

  getHistory: async (_skip = 0, _limit = 50) => {
    await delay(300);
    return { data: [] };
  },
};

export const mockScannerAPI = {
  scan: async (data: { url: string; scan_depth?: number; generate_alt?: boolean; language?: string; tone?: string }) => {
    await delay(2500);
    const imagesFound = Math.floor(Math.random() * 30) + 10;
    const missingAlt = Math.floor(Math.random() * Math.ceil(imagesFound * 0.3));

    const job: ScanJob = {
      id: Date.now(),
      target_url: data.url,
      status: 'completed',
      scan_depth: data.scan_depth || 1,
      pages_scanned: Math.floor(Math.random() * 8) + 1,
      images_found: imagesFound,
      images_missing_alt: missingAlt,
      error_message: null,
      created_at: new Date().toISOString(),
      completed_at: new Date().toISOString(),
    };

    DEMO_SCAN_JOBS.unshift(job);
    return { data: job };
  },

  listJobs: async (_skip = 0, _limit = 20) => {
    await delay(300);
    return { data: DEMO_SCAN_JOBS };
  },

  getJob: async (jobId: number) => {
    await delay(200);
    const job = DEMO_SCAN_JOBS.find((j) => j.id === jobId) || DEMO_SCAN_JOBS[0];
    return { data: job };
  },
};

export const mockReportAPI = {
  list: async (_skip = 0, _limit = 20) => {
    await delay(400);
    return { data: DEMO_REPORTS };
  },

  get: async (reportId: number) => {
    await delay(200);
    const report = DEMO_REPORTS.find((r) => r.id === reportId) || DEMO_REPORTS[0];
    return { data: report };
  },

  export: async (reportId: number, format: string) => {
    await delay(300);
    const report = DEMO_REPORTS.find((r) => r.id === reportId) || DEMO_REPORTS[0];
    if (format === 'csv') {
      const csv = `title,score,total_images,missing_alt\n"${report.title}",${report.compliance_score},${report.total_images},${report.images_without_alt}`;
      return { data: csv };
    }
    return { data: report };
  },
};

export const mockDashboardAPI = {
  getStats: async () => {
    await delay(500);
    return { data: DEMO_STATS };
  },

  getCarbon: async () => {
    await delay(300);
    return { data: DEMO_CARBON };
  },
};

export const mockBillingAPI = {
  createCheckout: async (_data: { plan: string; success_url: string; cancel_url: string }) => {
    await delay(500);
    return { data: { checkout_url: '#demo-checkout' } };
  },

  getSubscription: async () => {
    await delay(300);
    return { data: { status: 'active', plan: 'pro', current_period_end: new Date(Date.now() + 30 * 86400000).toISOString() } };
  },

  cancel: async () => {
    await delay(500);
    return { data: { status: 'canceled' } };
  },
};

export const mockDeveloperAPI = {
  createKey: async (data: { name: string }) => {
    await delay(500);
    const newKey: APIKeyData = {
      id: Date.now(),
      key_prefix: 'tat_' + Math.random().toString(36).slice(2, 8),
      name: data.name,
      is_active: true,
      requests_count: 0,
      last_used_at: null,
      created_at: new Date().toISOString(),
      full_key: 'tat_demo_' + Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2),
    };
    demoKeys.unshift(newKey);
    return { data: newKey };
  },

  listKeys: async () => {
    await delay(300);
    return { data: demoKeys };
  },

  revokeKey: async (keyId: number) => {
    await delay(300);
    demoKeys = demoKeys.filter((k) => k.id !== keyId);
    return { data: { success: true } };
  },
};
