/**
 * TheAltText Browser Extension — Background Service Worker
 * Adds context menu for generating alt text on right-click.
 * A GlowStarLabs product by Audrey Evans.
 */

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: 'generate-alt-text',
    title: 'Generate Alt Text with TheAltText',
    contexts: ['image'],
  });
});

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId === 'generate-alt-text' && info.srcUrl) {
    const { apiKey, apiUrl } = await chrome.storage.sync.get({
      apiKey: '',
      apiUrl: 'https://your-thealttext-instance.com',
    });

    if (!apiKey) {
      chrome.tabs.sendMessage(tab.id, {
        type: 'SHOW_NOTIFICATION',
        message: 'Please set your API key in the TheAltText extension settings.',
        level: 'warning',
      });
      return;
    }

    chrome.tabs.sendMessage(tab.id, {
      type: 'GENERATING',
      imageUrl: info.srcUrl,
    });

    try {
      const response = await fetch(`${apiUrl}/api/developer/v1/alt-text`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': apiKey,
        },
        body: JSON.stringify({
          image_url: info.srcUrl,
          language: 'en',
          tone: 'formal',
          wcag_level: 'AAA',
        }),
      });

      const data = await response.json();

      chrome.tabs.sendMessage(tab.id, {
        type: 'ALT_TEXT_RESULT',
        imageUrl: info.srcUrl,
        altText: data.alt_text || data.generated_text,
        confidence: data.confidence_score,
      });
    } catch (error) {
      chrome.tabs.sendMessage(tab.id, {
        type: 'SHOW_NOTIFICATION',
        message: 'Failed to generate alt text. Check your API key and connection.',
        level: 'error',
      });
    }
  }
});
