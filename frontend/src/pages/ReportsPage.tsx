/**
 * TheAltText — Reports Page
 * View and export compliance reports.
 */

import React, { useEffect, useState } from 'react';
import { FileText, Download, BarChart3 } from 'lucide-react';
import { reportAPI } from '../services/api';
import type { Report } from '../types';

export default function ReportsPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    reportAPI.list().then(({ data }) => setReports(data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const handleExport = async (reportId: number, format: string) => {
    try {
      const { data } = await reportAPI.export(reportId, format);
      if (format === 'csv') {
        const blob = new Blob([data], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `thealttext_report_${reportId}.csv`;
        a.click();
      } else {
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `thealttext_report_${reportId}.json`;
        a.click();
      }
    } catch (err) {
      console.error('Export failed:', err);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-forest-400';
    if (score >= 70) return 'text-gold-400';
    return 'text-ember-400';
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold text-earth-100">Compliance Reports</h1>
        <p className="text-earth-400 mt-1">View and export your accessibility compliance reports.</p>
      </div>

      {loading ? (
        <div className="glass-panel p-8 text-center" aria-live="polite">
          <p className="text-earth-400">Loading reports...</p>
        </div>
      ) : reports.length === 0 ? (
        <div className="glass-panel p-12 text-center">
          <FileText size={48} className="text-earth-700 mx-auto mb-4" aria-hidden="true" />
          <h2 className="text-xl font-semibold text-earth-300 mb-2">No Reports Yet</h2>
          <p className="text-earth-500">Scan a website to generate your first compliance report.</p>
        </div>
      ) : (
        <div className="space-y-4" role="list" aria-label="Compliance reports">
          {reports.map((report) => (
            <article key={report.id} className="glass-panel p-6" role="listitem">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex-1">
                  <h2 className="font-semibold text-earth-100">{report.title}</h2>
                  <p className="text-sm text-earth-400 mt-1">{report.target_url}</p>
                  <p className="text-xs text-earth-500 mt-1">{new Date(report.created_at).toLocaleDateString()}</p>
                </div>

                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <span className={`text-2xl font-bold ${getScoreColor(report.compliance_score)}`}>
                      {report.compliance_score}%
                    </span>
                    <span className="text-xs text-earth-500 block">Score</span>
                  </div>

                  <div className="text-center">
                    <span className="text-lg font-bold text-earth-200">{report.total_images}</span>
                    <span className="text-xs text-earth-500 block">Images</span>
                  </div>

                  <div className="text-center">
                    <span className="text-lg font-bold text-ember-400">{report.images_without_alt}</span>
                    <span className="text-xs text-earth-500 block">Missing</span>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleExport(report.id, 'json')}
                      className="p-2 rounded-lg bg-charcoal-800 hover:bg-charcoal-700 text-earth-400 transition-colors"
                      aria-label={`Export report ${report.title} as JSON`}
                      title="Export JSON"
                    >
                      <Download size={16} aria-hidden="true" />
                    </button>
                    <button
                      onClick={() => handleExport(report.id, 'csv')}
                      className="p-2 rounded-lg bg-charcoal-800 hover:bg-charcoal-700 text-earth-400 transition-colors"
                      aria-label={`Export report ${report.title} as CSV`}
                      title="Export CSV"
                    >
                      <BarChart3 size={16} aria-hidden="true" />
                    </button>
                  </div>
                </div>
              </div>

              {report.summary && (
                <p className="mt-3 text-sm text-earth-400 border-t border-earth-800/20 pt-3">{report.summary}</p>
              )}
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
