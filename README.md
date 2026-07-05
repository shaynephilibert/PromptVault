# PromptVault — Private AI Prompt Manager

Save, organize, and inject prompts into ChatGPT, Claude, Gemini, and Grok with one click. All data is AES-encrypted locally with a password only you know — no server, no account, no data collection. Free, with every feature unlocked.

## How It Works

PromptVault is a Chrome extension (Manifest V3). Your prompts live in an encrypted vault inside `chrome.storage.local`. When you open the popup, you unlock the vault with your password; from there you can search, filter, copy, or inject any prompt straight into the chat input of a supported AI site.

## Features

- **Encrypted vault** — AES encryption via `crypto-js`; your password never leaves your device
- **One-click injection** — sends a prompt directly into the AI chat input on ChatGPT, Claude, Gemini, and Grok
- **Prompt variables** — use `{{variable}}` placeholders and fill them in via a modal at inject time
- **Organize** — categories, tags, pin-to-top, and sorting by newest, oldest, A–Z, or most used
- **Search** — press `/` or `⌘K` (Ctrl+K) to search from anywhere in the popup
- **Usage tracking** — inject/copy counts power a "★ Top" tab showing your 5 most-used prompts
- **Import / Export** — back up the vault to JSON and restore or merge from a file
- **Session unlock** — the vault stays unlocked for the browser session, with a "Lock now" button in Settings

## Privacy

- Prompt data is encrypted with your password before it is written to `chrome.storage.local`
- Your password is never stored or transmitted anywhere
- No analytics, no telemetry, no external network requests
- Uninstalling the extension deletes all stored data

See the full [privacy policy](docs/privacy.html).

## Repository Layout

```
promptvault/       Chrome extension source (React + TypeScript + Vite)
promptvault-mcp/   MCP server bridge for Claude Code (built, not yet shipped — see ROADMAP.md)
docs/              Privacy policy page
CHANGELOG.md       Release history
ROADMAP.md         Planned / in-progress work
Design.MD          Original build plan and design notes
```

## Development

```bash
cd promptvault
npm install
npm run build        # production build → dist/
npm test             # vitest suite (storage, encryption, build checks)
npm run lint
```

To load the extension in Chrome: open `chrome://extensions`, enable Developer mode, click **Load unpacked**, and select `promptvault/dist/`. After any source change, run `npm run build` and click the refresh icon on the extension card.

### Tech Stack

- React 19 + TypeScript + Vite
- Tailwind CSS v4
- `crypto-js` for AES encryption
- Chrome Manifest V3
- Vitest for tests

### Extension Source Structure

```
promptvault/src/
├── popup/
│   ├── components/     # UI components (prompt list, modals, settings, onboarding)
│   ├── Popup.tsx       # Root — password setup / unlock / main screen flow
│   └── main.tsx
├── content/            # Injection scripts, one per AI platform
├── background/         # Service worker
└── lib/
    ├── encryption.ts   # AES encrypt/decrypt helpers
    └── storage.ts      # Encrypted vault read/write, import/export
```

### A Note on Injection Selectors

Each content script targets the chat input element of its platform. These selectors break when a platform redesigns its UI — if injection stops working on a site, inspect the input element and update the corresponding script in `promptvault/src/content/`.

## MCP Server (Experimental)

`promptvault-mcp/` contains a companion Node.js MCP server that lets Claude Code (or any MCP-compatible agent) read your vault. When the extension is unlocked, it pushes the decrypted vault to a local bridge on `127.0.0.1:7427`, and the MCP server exposes tools like `promptvault_search` and `promptvault_get_by_tag`. This feature is built but intentionally held back from release pending in-extension discovery, a setup guide, and an opt-in toggle — details in [ROADMAP.md](ROADMAP.md).
