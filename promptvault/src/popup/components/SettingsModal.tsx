import { useRef, useState } from 'react';
import { type VaultData, exportVault, importPrompts } from '../../lib/storage';

interface Props {
  vault: VaultData;
  onVaultChange: (updated: VaultData) => void;
  onLock: () => void;
  onClose: () => void;
}

export default function SettingsModal({ vault, onVaultChange, onLock, onClose }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const [importError, setImportError] = useState<string | null>(null);

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

          {/* Stats */}
          <div className="text-center pt-1">
            <p className="text-gray-600 text-xs">
              {vault.prompts.length} prompt{vault.prompts.length !== 1 ? 's' : ''} · {vault.categories.length} categor{vault.categories.length !== 1 ? 'ies' : 'y'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
