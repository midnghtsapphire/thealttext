/**
 * TheAltText — Accessibility Mode Switcher
 * Quick access to WCAG AAA, ADHD, Dyslexic, ECO CODE, NEURO CODE modes
 */
import React, { useState } from 'react';
import { Eye, Brain, BookOpen, Leaf, Zap, Settings, X } from 'lucide-react';
import { useAccessibility, AccessibilityMode } from '../contexts/AccessibilityContext';

export default function AccessibilityMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const { settings, setMode } = useAccessibility();

  const modes = [
    {
      id: 'default' as AccessibilityMode,
      name: 'Default',
      icon: Settings,
      description: 'Standard interface',
      color: 'text-earth-300',
    },
    {
      id: 'wcag-aaa' as AccessibilityMode,
      name: 'WCAG AAA',
      icon: Eye,
      description: 'High contrast, enhanced focus, reduced motion',
      color: 'text-forest-400',
    },
    {
      id: 'adhd' as AccessibilityMode,
      name: 'ADHD Mode',
      icon: Brain,
      description: 'Simplified layout, reduced distractions',
      color: 'text-gold-400',
    },
    {
      id: 'dyslexic' as AccessibilityMode,
      name: 'Dyslexic Mode',
      icon: BookOpen,
      description: 'OpenDyslexic font, larger text, better spacing',
      color: 'text-ember-400',
    },
    {
      id: 'eco' as AccessibilityMode,
      name: 'ECO CODE',
      icon: Leaf,
      description: 'Reduced bandwidth, minimal animations, energy efficient',
      color: 'text-forest-300',
    },
    {
      id: 'neuro' as AccessibilityMode,
      name: 'NEURO CODE',
      icon: Zap,
      description: 'Neurodivergent-friendly: calm colors, clear structure',
      color: 'text-gold-300',
    },
  ];

  return (
    <>
      {/* Floating accessibility button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-gradient-to-br from-gold-500 to-forest-500 text-charcoal-950 shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center"
        aria-label="Open accessibility settings"
        title="Accessibility Settings"
      >
        <Eye size={24} aria-hidden="true" />
      </button>

      {/* Accessibility menu panel */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />

          {/* Panel */}
          <div
            className="fixed right-6 bottom-24 z-50 w-96 max-h-[80vh] overflow-y-auto glass-panel p-6 shadow-2xl"
            role="dialog"
            aria-label="Accessibility mode selector"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-earth-100">Accessibility Modes</h2>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 rounded-lg hover:bg-charcoal-800 transition-colors"
                aria-label="Close accessibility menu"
              >
                <X size={20} className="text-earth-400" aria-hidden="true" />
              </button>
            </div>

            <p className="text-sm text-earth-400 mb-4">
              Choose a mode optimized for your needs. Settings are saved automatically.
            </p>

            <div className="space-y-2">
              {modes.map((mode) => {
                const Icon = mode.icon;
                const isActive = settings.mode === mode.id;
                return (
                  <button
                    key={mode.id}
                    onClick={() => {
                      setMode(mode.id);
                      setIsOpen(false);
                    }}
                    className={`w-full text-left p-4 rounded-xl transition-all duration-200 ${
                      isActive
                        ? 'bg-gold-500/20 border-2 border-gold-500/40'
                        : 'bg-charcoal-900/50 border border-earth-800/20 hover:bg-charcoal-800'
                    }`}
                    aria-pressed={isActive}
                    aria-label={`Activate ${mode.name}: ${mode.description}`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`flex-shrink-0 ${mode.color}`}>
                        <Icon size={24} aria-hidden="true" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-earth-100">{mode.name}</h3>
                          {isActive && (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-forest-500/20 text-forest-300 border border-forest-500/30">
                              Active
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-earth-400 mt-1">{mode.description}</p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="mt-4 pt-4 border-t border-earth-800/20">
              <p className="text-xs text-earth-500 text-center">
                All modes are WCAG 2.1 compliant and tested with screen readers.
              </p>
            </div>
          </div>
        </>
      )}
    </>
  );
}
