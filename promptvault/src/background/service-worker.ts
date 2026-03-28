import ExtPay from 'extpay';
import { EXTENSION_ID } from '../lib/extensionpay';
import type { Prompt, VaultData } from '../lib/storage';

const MCP_BRIDGE = 'http://127.0.0.1:7427/vault';

async function pushToMCP(vault: VaultData): Promise<void> {
  try {
    await fetch(MCP_BRIDGE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(vault),
    });
  } catch { /* MCP server not running — silently ignore */ }
}

const extpay = ExtPay(EXTENSION_ID);
extpay.startBackground();

type AgentMessage =
  | { type: 'PV_STATUS' }
  | { type: 'PV_GET_ALL' }
  | { type: 'PV_SEARCH'; query: string }
  | { type: 'PV_GET_BY_CATEGORY'; category: string }
  | { type: 'PV_GET_BY_TAG'; tag: string };

// Push vault to MCP bridge whenever the session vault is written or updated
chrome.storage.session.onChanged.addListener((changes) => {
  if (changes['pv_session_vault']?.newValue) {
    try {
      const vault = JSON.parse(changes['pv_session_vault'].newValue as string) as VaultData;
      pushToMCP(vault);
    } catch { /* ignore parse errors */ }
  }
});

// On service worker startup, push any existing session vault (e.g. after SW restart)
chrome.storage.session.get('pv_session_vault', (result) => {
  if (result['pv_session_vault']) {
    try {
      const vault = JSON.parse(result['pv_session_vault'] as string) as VaultData;
      pushToMCP(vault);
    } catch { /* ignore */ }
  }
});

chrome.runtime.onMessageExternal.addListener(
  (message: AgentMessage, _sender, sendResponse) => {
    chrome.storage.session.get('pv_session_vault', (result) => {
      const raw = result['pv_session_vault'] as string | undefined;

      if (message.type === 'PV_STATUS') {
        if (!raw) {
          sendResponse({ locked: true, promptCount: 0 });
        } else {
          const vault = JSON.parse(raw) as VaultData;
          sendResponse({ locked: false, promptCount: vault.prompts.length });
        }
        return;
      }

      if (!raw) {
        sendResponse({ error: 'locked' });
        return;
      }

      const vault = JSON.parse(raw) as VaultData;
      let prompts: Prompt[] = vault.prompts;

      if (message.type === 'PV_SEARCH') {
        const q = message.query.toLowerCase();
        prompts = prompts.filter(
          (p) =>
            p.title.toLowerCase().includes(q) ||
            p.body.toLowerCase().includes(q) ||
            p.tags.some((t) => t.toLowerCase().includes(q))
        );
      } else if (message.type === 'PV_GET_BY_CATEGORY') {
        prompts = prompts.filter((p) => p.category === message.category);
      } else if (message.type === 'PV_GET_BY_TAG') {
        const tag = message.tag.toLowerCase();
        prompts = prompts.filter((p) => p.tags.some((t) => t.toLowerCase() === tag));
      }

      sendResponse({ prompts });
    });

    return true; // keep message channel open for async response
  }
);
