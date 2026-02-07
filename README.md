# TL;DR — AI Page Summarizer

Chrome extension that summarizes any web page or YouTube video using AI, lets you refine the summary via chat, and saves everything to Notion. Opens in Chrome's side panel for a seamless reading experience.

## How It Works

1. **Summarize** — Get a structured summary of any web page or YouTube video with key takeaways, notable quotes, and tags
2. **Refine** — Chat with the AI to adjust the summary, ask follow-up questions, or dig deeper into specific topics
3. **Save** — Export to Notion with all metadata, tags, and source links preserved

## Features

- **Works everywhere** — articles, YouTube (transcripts + comments), Google Docs, any web page
- **Multiple AI providers** — OpenAI, Anthropic, Google Gemini, xAI, DeepSeek, or any self-hosted OpenAI-compatible endpoint (Ollama, vLLM, etc.)
- **Bring your own API key** — no subscription, no account, no backend server
- **Auto-translation** — summarize in your preferred language
- **Light, dark, and system themes**

## Install

### From Chrome Web Store
*Coming soon*

### From Source
```bash
git clone https://github.com/proshkin-aitkn/tldr.git
cd tldr
pnpm install
pnpm wxt build
```
Then load `.output/chrome-mv3/` as an unpacked extension in `chrome://extensions`.

## Usage

1. Navigate to any web page or YouTube video
2. Click the TL;DR icon in your toolbar to open the side panel
3. Press **Summarize** to generate a structured summary
4. Use the chat input to ask follow-up questions or refine the summary
5. Export to Notion with one click

## Configuration

Open the Settings drawer (gear icon) to:
- Select your AI provider and enter your API key
- Choose a model
- Set summary language and detail level
- Configure Notion export (see below)

## Notion Integration Setup

1. Go to [notion.so/my-integrations](https://www.notion.so/my-integrations) and click **New integration**
2. Name it (e.g. "TL;DR") and click **Submit**
3. Copy the **Internal Integration Secret** (starts with `ntn_`)
4. Paste it into TL;DR Settings > Notion API Key
5. Click **Save Settings**, then **Test Connection** to verify

On your first export, TL;DR will automatically create a "TL;DR Summaries" database in your Notion workspace. Subsequent exports will add pages to the same database.

Each exported page includes the summary, key takeaways, notable quotes, tags, source URL, and content metadata.

## Privacy

TL;DR has no backend server, no analytics, and no data collection. Your API keys are stored locally on your device. Page content is sent directly to the AI provider you choose.

See the full [Privacy Policy](PRIVACY_POLICY.md).

## Tech Stack

- [WXT](https://wxt.dev) — Chrome extension framework
- [Preact](https://preactjs.com) — UI rendering
- [TypeScript](https://www.typescriptlang.org) — type safety
- [Readability](https://github.com/mozilla/readability) — article extraction
- Material Design 3 — design system

## License

[MIT](LICENSE)
