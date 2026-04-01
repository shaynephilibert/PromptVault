import { useRef, useState, useEffect } from 'react';
import { type VaultData, exportVault, importPrompts } from '../../lib/storage';
import { openPaymentPage, isDevBuild, DEV_PRO_KEY } from '../../lib/extensionpay';

interface Props {
  vault: VaultData;
  paid: boolean;
  onVaultChange: (updated: VaultData) => void;
  onLock: () => void;
  onClose: () => void;
}

export default function SettingsModal({ vault, paid, onVaultChange, onLock, onClose }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const devMode = isDevBuild();
  const [devPro, setDevPro] = useState(false);

  useEffect(() => {
    if (!devMode) return;
    chrome.storage.local.get(DEV_PRO_KEY, (result) => {
      setDevPro(result[DEV_PRO_KEY] === true);
    });
  }, [devMode]);

  function handleDevProToggle() {
    const next = !devPro;
    chrome.storage.local.set({ [DEV_PRO_KEY]: next }, () => window.location.reload());
  }

  function handleExport() {
    exportVault(vault);
  }

  function handleImportClick() {
    fileInputRef.current?.click();
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImportStatus(null);
    setImportError(null);

    importPrompts(
      file,
      vault,
      (merged) => {
        const added = merged.prompts.length - vault.prompts.length;
        onVaultChange(merged);
        setImportStatus(`Imported ${added} prompt${added !== 1 ? 's' : ''}.`);
        e.target.value = '';
      },
      (msg) => {
        setImportError(msg);
        e.target.value = '';
      }
    );
  }

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 px-4">
      <div className="bg-gray-900 rounded-xl p-5 w-full max-w-xs border border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-white font-bold text-sm">Settings</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-300 text-lg leading-none">
            ✕
          </button>
        </div>

        <div className="space-y-3">
          {/* Export */}
          <div className="bg-gray-800 rounded-lg p-3">
            <p className="text-white text-xs font-medium mb-1">Export Vault</p>
            <p className="text-gray-500 text-xs mb-3">
              Download all your prompts as a JSON file.
            </p>
            <button
              onClick={handleExport}
              className="w-full py-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-gray-300 text-xs font-medium transition-colors"
            >
              Download export.json
            </button>
          </div>

          {/* Import */}
          <div className="bg-gray-800 rounded-lg p-3">
            <p className="text-white text-xs font-medium mb-1">Import Prompts</p>
            <p className="text-gray-500 text-xs mb-3">
              Merge prompts from a PromptVault export file. Duplicates are skipped.
            </p>
            <button
              onClick={handleImportClick}
              className="w-full py-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-gray-300 text-xs font-medium transition-colors"
            >
              Choose file…
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleFileChange}
              className="hidden"
            />
            {importStatus && (
              <p className="text-green-400 text-xs mt-2">{importStatus}</p>
            )}
            {importError && (
              <p className="text-red-400 text-xs mt-2">{importError}</p>
            )}
          </div>

          {/* Lock */}
          <div className="bg-gray-800 rounded-lg p-3">
            <p className="text-white text-xs font-medium mb-1">Lock Vault</p>
            <p className="text-gray-500 text-xs mb-3">
              Require password on next open. Vault auto-locks when the browser closes.
            </p>
            <button
              onClick={onLock}
              className="w-full py-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-gray-300 text-xs font-medium transition-colors"
            >
              Lock now
            </button>
          </div>

          {/* Plan */}
          <div className="bg-gray-800 rounded-lg p-3">
            {paid ? (
              <>
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-white text-xs font-medium">PromptVault Pro</p>
                  <span className="text-violet-400 text-xs bg-violet-950/60 px-1.5 py-0.5 rounded">Active</span>
                </div>
                <p className="text-gray-500 text-xs mb-3">Manage billing, update payment, or cancel your subscription.</p>
                <button
                  onClick={openPaymentPage}
                  className="w-full py-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-gray-300 text-xs font-medium transition-colors"
                >
                  Manage subscription
                </button>
              </>
            ) : (
              <>
                <p className="text-white text-xs font-medium mb-1">Upgrade to Pro</p>
                <p className="text-gray-500 text-xs mb-3">Unlimited prompts &amp; categories for $6/mo.</p>
                <button
                  onClick={openPaymentPage}
                  className="w-full py-2 rounded-lg bg-violet-600 hover:bg-violet-700 text-white text-xs font-medium transition-colors"
                >
                  Upgrade — $6/mo
                </button>
              </>
            )}
          </div>

          {/* Stats */}
          <div className="text-center pt-1">
            <p className="text-gray-600 text-xs">
              {vault.prompts.length} prompt{vault.prompts.length !== 1 ? 's' : ''} · {vault.categories.length} categor{vault.categories.length !== 1 ? 'ies' : 'y'}
            </p>
          </div>

          {/* Dev-only: simulate Pro */}
          {devMode && (
            <div className="border border-dashed border-gray-700 rounded-lg p-3">
              <p className="text-gray-600 text-xs font-medium mb-2">Dev mode</p>
              <div className="flex items-center justify-between">
                <p className="text-gray-500 text-xs">Simulate Pro</p>
                <button
                  onClick={handleDevProToggle}
                  className={`relative w-8 h-4 rounded-full transition-colors ${devPro ? 'bg-violet-600' : 'bg-gray-600'}`}
                >
                  <span className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-transform ${devPro ? 'translate-x-4' : 'translate-x-0.5'}`} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
