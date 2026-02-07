import { defineConfig } from 'wxt';
import preact from '@preact/preset-vite';

export default defineConfig({
  srcDir: 'src',
  manifest: {
    name: 'TLDR',
    description: 'Summarize web pages and YouTube videos with AI',
    icons: {
      16: 'icons/icon-16.png',
      32: 'icons/icon-32.png',
      48: 'icons/icon-48.png',
      128: 'icons/icon-128.png',
    },
    action: {
      default_icon: {
        16: 'icons/icon-16.png',
        32: 'icons/icon-32.png',
        48: 'icons/icon-48.png',
        128: 'icons/icon-128.png',
      },
    },
    permissions: ['sidePanel', 'activeTab', 'storage', 'scripting'],
    host_permissions: [
      'https://api.openai.com/*',
      'https://api.anthropic.com/*',
      'https://generativelanguage.googleapis.com/*',
      'https://api.x.ai/*',
      'https://api.deepseek.com/*',
      'http://localhost:*/*',
      'http://127.0.0.1:*/*',
      'https://api.notion.com/*',
      'https://www.youtube.com/*',
      'https://*.youtube.com/*',
      'https://*.googlevideo.com/*',
      'https://*.google.com/*',
    ],
    optional_host_permissions: ['https://*/*', 'http://*/*'],
  },
  vite: () => ({
    plugins: [preact()],
  }),
});
