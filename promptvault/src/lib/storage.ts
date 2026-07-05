import { encrypt, decrypt } from './encryption';

export interface Prompt {
  id: string;
  title: string;
  body: string;
  category: string;
  tags: string[];
  pinned: boolean;
  useCount: number;
  createdAt: number;
}

export interface VaultData {
  prompts: Prompt[];
  categories: string[];
}

const STORAGE_KEY = 'promptvault_data';
const SESSION_PW_KEY = 'pv_session_pw';
const SESSION_VAULT_KEY = 'pv_session_vault';
const REMEMBER_KEY = 'pv_remember_pw';

export async function getRememberedPassword(): Promise<string | null> {
  const result = await chrome.storage.local.get(REMEMBER_KEY);
  return (result[REMEMBER_KEY] as string) ?? null;
}

export async function setRememberedPassword(password: string | null): Promise<void> {
  if (password) {
    await chrome.storage.local.set({ [REMEMBER_KEY]: password });
  } else {
    await chrome.storage.local.remove(REMEMBER_KEY);
  }
}

export async function saveSession(password: string, vault: VaultData): Promise<void> {
  await chrome.storage.session.set({
    [SESSION_PW_KEY]: password,
    [SESSION_VAULT_KEY]: JSON.stringify(vault),
  });
}

export async function loadSession(): Promise<{ password: string; vault: VaultData } | null> {
  const result = await chrome.storage.session.get([SESSION_PW_KEY, SESSION_VAULT_KEY]);
  if (!result[SESSION_PW_KEY] || !result[SESSION_VAULT_KEY]) return null;
  return {
    password: result[SESSION_PW_KEY] as string,
    vault: JSON.parse(result[SESSION_VAULT_KEY] as string) as VaultData,
  };
}

export async function clearSession(): Promise<void> {
  await chrome.storage.session.remove([SESSION_PW_KEY, SESSION_VAULT_KEY]);
}

export async function saveVault(data: VaultData, password: string): Promise<void> {
  const encrypted = encrypt(JSON.stringify(data), password);
  await chrome.storage.local.set({ [STORAGE_KEY]: encrypted });
}

export async function loadVault(password: string): Promise<VaultData | null> {
  const result = await chrome.storage.local.get(STORAGE_KEY);
  if (!result[STORAGE_KEY]) {
    return { prompts: [], categories: ['General', 'Writing', 'Coding', 'Research'] };
  }
  const decrypted = decrypt(result[STORAGE_KEY] as string, password);
  if (!decrypted) return null;
  return JSON.parse(decrypted) as VaultData;
}

export async function vaultExists(): Promise<boolean> {
  const result = await chrome.storage.local.get(STORAGE_KEY);
  return !!result[STORAGE_KEY];
}

export function exportVault(data: VaultData): void {
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `promptvault-export-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export function importPrompts(
  file: File,
  existing: VaultData,
  onComplete: (merged: VaultData) => void,
  onError: (msg: string) => void
): void {
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const parsed = JSON.parse(e.target?.result as string) as VaultData;
      if (!Array.isArray(parsed.prompts)) throw new Error('Invalid format');

      // Merge: skip prompts whose id already exists
      const existingIds = new Set(existing.prompts.map((p) => p.id));
      const newPrompts = parsed.prompts.filter((p) => !existingIds.has(p.id));
      const newCategories = parsed.categories?.filter(
        (c) => !existing.categories.includes(c)
      ) ?? [];

      onComplete({
        prompts: [...existing.prompts, ...newPrompts],
        categories: [...existing.categories, ...newCategories],
      });
    } catch {
      onError('Could not parse file. Make sure it is a valid PromptVault export.');
    }
  };
  reader.readAsText(file);
}
