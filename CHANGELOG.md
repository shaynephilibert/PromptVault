# Changelog

All notable changes to PromptVault will be documented here.

## [1.0.3] — 2026-03-28

### Changed
- Injection into Claude, Gemini, and Grok is now available on the free plan — all 4 platforms unlocked for everyone
- Removed platform gate from upgrade modal; Pro value is now unlimited prompts/categories + prompt variables
- Updated onboarding overlay and README to reflect new free tier

---

## [1.0.2] — 2026-03-28

### Changed
- Replaced emoji-based lock icon with clean SVG path geometry — consistent rendering across all OS versions, no font dependency
- Regenerated all icon sizes (16, 48, 128px) from updated `scripts/generate-icons.mjs`

---

## [1.0.1] — 2026-03-27

### Changed
- Set ExtensionPay extension ID (store submission ready)
- Rewrote README with proper extension docs, privacy statement, and build instructions

---

## [1.0.0] — 2026-03-27

### Added
- Keyboard shortcuts — press `/` or `⌘K` (Ctrl+K on Windows) to focus search from anywhere in the popup; `Esc` closes any open modal
- Empty state illustrations — inline SVG art for empty vault ("Add your first prompt") and empty search results ("Clear search" shortcut)
- First-run onboarding overlay — 3-step walkthrough shown once on first unlock explaining Save, Inject, and Copy; persisted via `chrome.storage.local`

---

## [0.5.0] — 2026-03-27

### Added
- Usage tracking — inject and copy both increment a `useCount` on each prompt
- "Popular" sort option — sorts by most-used descending (pinned prompts still float to top)
- "★ Top" virtual tab — appears after first use; shows the 5 most-used prompts
- Usage nudge in UpgradeModal — displays total use count to reinforce upgrade value

---

## [0.4.0] — 2026-03-27

### Added
- Pin prompts — star icon on each card; pinned prompts always sort to the top (shown with violet border)
- Sort controls — dropdown in search bar to sort by Newest, Oldest, A→Z, Z→A
- Tags — comma-separated tags on prompts; displayed as clickable chips that filter the list via search
- Manage Categories modal — add, rename, and delete categories from the ✎ button next to the category tabs; deleting a category re-assigns its prompts to the next available one
- Free tier category limit enforced in ManageCategoriesModal

---

## [0.3.0] — 2026-03-27

### Added
- Export vault — downloads all prompts as a dated `.json` file from the Settings modal
- Import prompts — merge prompts from a PromptVault export file; duplicates (by id) are skipped
- Duplicate prompt — one-click clone of any prompt card (appends " (copy)" to title)
- Settings modal — accessible via gear icon (⚙) in the header

---

## [0.1.1] — 2026-03-27

### Added
- Edit prompt — edit button on each card opens a pre-filled modal to update title, body, and category
- New category flow in Add Prompt modal — users can create a custom category inline; free tier capped at 3

### Fixed
- Free tier 3-category limit now enforced; selecting "+ New category" on a free account triggers the upgrade modal
- Updated ChatGPT content script to target current ProseMirror `contenteditable` input (the old `#prompt-textarea` textarea no longer exists)

### Removed
- Stale Vite scaffold files (`index.html`, `public/favicon.svg`, `public/icons.svg`)

---

## [0.1.0] — 2026-03-27

### Added
- Initial build of PromptVault Chrome extension (Manifest V3)
- AES-encrypted local storage via `crypto-js` — no server, no account
- Password creation and unlock flow (`SetPasswordScreen`, `UnlockScreen`)
- Main popup UI with prompt list, search, and category filter tabs
- Add prompt modal with title, body, and category fields
- Copy and inject buttons on each prompt card
- One-click injection into ChatGPT (free tier); Claude, Gemini, Grok (paid tier)
- Freemium gating: 15-prompt and 3-category limits on free plan
- Upgrade modal wired to ExtensionPay ($6/mo)
- Background service worker for ExtensionPay event handling
- Content scripts for ChatGPT, Claude, Gemini, and Grok
- Prompt variable support via `{{variable}}` syntax (paid tier)
- SVG icon generation script (`scripts/generate-icons.mjs`)
- Vite + React + TypeScript + Tailwind CSS build pipeline
