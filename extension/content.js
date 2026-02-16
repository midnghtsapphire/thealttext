/**
 * TheAltText Browser Extension — Content Script
 * Highlights images missing alt text and shows generated results.
 */

(() => {
  // Highlight images missing alt text
  function highlightMissingAlt() {
    const images = document.querySelectorAll('img');
    let missingCount = 0;

    images.forEach((img) => {
      const alt = img.getAttribute('alt');
      if (!alt || alt.trim() === '') {
        img.style.outline = '3px solid #c46356';
        img.style.outlineOffset = '2px';
        img.setAttribute('data-thealttext-missing', 'true');
        missingCount++;
      }
    });

    return { total: images.length, missing: missingCount };
  }

  // Show notification overlay
  function showNotification(message, level = 'info') {
    const existing = document.getElementById('thealttext-notification');
    if (existing) existing.remove();

    const colors = {
      info: { bg: '#1e3a1e', border: '#3a7d3a', text: '#7ab87a' },
      warning: { bg: '#3d300c', border: '#b09028', text: '#d4b880' },
      error: { bg: '#3d1313', border: '#b0443a', text: '#c46356' },
      success: { bg: '#132613', border: '#3a7d3a', text: '#7ab87a' },
    };

    const c = colors[level] || colors.info;

    const el = document.createElement('div');
    el.id = 'thealttext-notification';
    el.setAttribute('role', 'alert');
    el.setAttribute('aria-live', 'polite');
    el.style.cssText = `
      position: fixed; top: 16px; right: 16px; z-index: 999999;
      padding: 16px 20px; border-radius: 12px; max-width: 400px;
      background: ${c.bg}; border: 1px solid ${c.border}; color: ${c.text};
      font-family: Inter, system-ui, sans-serif; font-size: 14px;
      box-shadow: 0 8px 32px rgba(0,0,0,0.4);
      animation: thealttext-slide-in 0.3s ease-out;
    `;
    el.textContent = message;
    document.body.appendChild(el);

    setTimeout(() => el.remove(), 5000);
  }

  // Show alt text result overlay near the image
  function showResult(imageUrl, altText) {
    const img = document.querySelector(`img[src="${imageUrl}"]`);
    if (!img) return;

    img.style.outline = '3px solid #3a7d3a';
    img.style.outlineOffset = '2px';

    const overlay = document.createElement('div');
    overlay.setAttribute('role', 'tooltip');
    overlay.style.cssText = `
      position: absolute; z-index: 999998; padding: 12px 16px;
      background: rgba(30,26,24,0.95); backdrop-filter: blur(16px);
      border: 1px solid rgba(176,125,58,0.2); border-radius: 12px;
      color: #f5ead6; font-family: Inter, system-ui, sans-serif;
      font-size: 13px; max-width: 350px; line-height: 1.5;
      box-shadow: 0 8px 32px rgba(0,0,0,0.4);
    `;

    const label = document.createElement('div');
    label.style.cssText = 'font-size: 10px; text-transform: uppercase; letter-spacing: 0.05em; color: #d4b880; margin-bottom: 6px;';
    label.textContent = 'TheAltText — Generated Alt Text';
    overlay.appendChild(label);

    const text = document.createElement('div');
    text.textContent = `"${altText}"`;
    overlay.appendChild(text);

    const copyBtn = document.createElement('button');
    copyBtn.textContent = 'Copy to Clipboard';
    copyBtn.style.cssText = `
      margin-top: 8px; padding: 4px 12px; border-radius: 8px;
      background: linear-gradient(135deg, #b07d3a, #967820);
      color: #1e1a18; font-size: 12px; font-weight: 500;
      border: none; cursor: pointer;
    `;
    copyBtn.addEventListener('click', () => {
      navigator.clipboard.writeText(altText);
      copyBtn.textContent = 'Copied!';
      setTimeout(() => copyBtn.textContent = 'Copy to Clipboard', 2000);
    });
    overlay.appendChild(copyBtn);

    const rect = img.getBoundingClientRect();
    overlay.style.top = `${rect.bottom + window.scrollY + 8}px`;
    overlay.style.left = `${rect.left + window.scrollX}px`;
    document.body.appendChild(overlay);

    setTimeout(() => overlay.remove(), 15000);
  }

  // Listen for messages from background script
  chrome.runtime.onMessage.addListener((message) => {
    switch (message.type) {
      case 'GENERATING':
        showNotification('Generating alt text...', 'info');
        break;
      case 'ALT_TEXT_RESULT':
        showNotification('Alt text generated successfully!', 'success');
        showResult(message.imageUrl, message.altText);
        break;
      case 'SHOW_NOTIFICATION':
        showNotification(message.message, message.level);
        break;
      case 'SCAN_PAGE':
        const stats = highlightMissingAlt();
        showNotification(
          `Found ${stats.total} images. ${stats.missing} missing alt text.`,
          stats.missing > 0 ? 'warning' : 'success'
        );
        break;
    }
  });

  // Add CSS animation
  const style = document.createElement('style');
  style.textContent = `
    @keyframes thealttext-slide-in {
      from { transform: translateX(100%); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
  `;
  document.head.appendChild(style);
})();
