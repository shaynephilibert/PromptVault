# PromptVault — Private AI Prompt Manager

Save, organize, and inject prompts into ChatGPT, Claude, Gemini, and Grok with one click. All data is AES-encrypted locally — no server, no account, no data collection.

## Features

- **Encrypted vault** — AES-256 via `crypto-js`. Your password never leaves your device.
- **One-click injection** — sends prompts directly into the AI input box
- **Organize** — categories, tags, pin to top, sort by newest/oldest/A-Z/popular
- **Import / Export** — back up your vault to JSON, restore from file
- **Usage tracking** — tracks inject + copy counts; surfaces your top 5 prompts
- **Freemium** — free tier (15 prompts, 3 categories, ChatGPT only); Pro via ExtensionPay ($6/mo)

## Supported Platforms

| Platform | Free | Pro |
|----------|------|-----|
| ChatGPT | ✓ | ✓ |
| Claude | ✓ | ✓ |
| Gemini | ✓ | ✓ |
| Grok | ✓ | ✓ |

## Tech Stack

- React 19 + TypeScript + Vite
- Tailwind CSS v4
- `crypto-js` (AES encryption)
- ExtensionPay (Stripe subscriptions, no backend)
- Chrome Manifest V3

## Development

```bash
cd promptvault
npm install
npm run build        # production build → dist/
```

Load unpacked extension in Chrome: `chrome://extensions` → Developer mode → Load unpacked → select `dist/`

After any source change, run `npm run build` and click the refresh icon on the extension card.

## ExtensionPay Setup

The ExtensionPay ID is set in `src/lib/extensionpay.ts`. To change it:

1. Register at [extensionpay.com](https://extensionpay.com)
2. Create a new extension, set price to $6/month
3. Replace the `EXTENSION_ID` value in `src/lib/extensionpay.ts`
4. Run `npm run build`

## Project Structure

```
src/
├── popup/
│   ├── components/     # All UI components
│   ├── Popup.tsx       # Root — handles auth flow
│   ├── main.tsx
│   └── index.html
├── content/            # Injection scripts (one per AI platform)
├── background/         # Service worker (ExtensionPay)
└── lib/
    ├── encryption.ts   # AES encrypt/decrypt
    ├── storage.ts      # Vault read/write + import/export
    └── extensionpay.ts # Payment status helpers
```

## Privacy

- All prompt data is encrypted with your password before being written to `chrome.storage.local`
- Your password is never stored or transmitted
- No analytics, no telemetry, no external requests (except ExtensionPay for payment status)
- Uninstalling the extension deletes all stored data
