import { useState } from 'react';
import { type VaultData } from '../../lib/storage';

interface Props {
  vault: VaultData;
  onVaultChange: (updated: VaultData) => void;
  onClose: () => void;
}

export default function ManageCategoriesModal({ vault, onVaultChange, onClose }: Props) {
  const [newName, setNewName] = useState('');
  const [renamingIndex, setRenamingIndex] = useState<number | null>(null);
  const [renameValue, setRenameValue] = useState('');

  function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    const name = newName.trim();
    if (!name || vault.categories.includes(name)) return;
    onVaultChange({ ...vault, categories: [...vault.categories, name] });
    setNewName('');
  }

  function handleDelete(cat: string) {
    // Re-assign prompts in deleted category to first remaining category
    const remaining = vault.categories.filter((c) => c !== cat);
    const fallback = remaining[0] ?? 'General';
    const prompts = vault.prompts.map((p) =>
      p.category === cat ? { ...p, category: fallback } : p
    );
    onVaultChange({ ...vault, categories: remaining, prompts });
  }

  function startRename(index: number) {
    setRenamingIndex(index);
    setRenameValue(vault.categories[index]);
  }

  function commitRename(index: number) {
    const name = renameValue.trim();
    if (!name || vault.categories.includes(name)) {
      setRenamingIndex(null);
      return;
    }
    const oldName = vault.categories[index];
    const categories = vault.categories.map((c, i) => (i === index ? name : c));
    const prompts = vault.prompts.map((p) =>
      p.category === oldName ? { ...p, category: name } : p
    );
    onVaultChange({ ...vault, categories, prompts });
    setRenamingIndex(null);
  }

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 px-4">
      <div className="bg-gray-900 rounded-xl p-5 w-full max-w-xs border border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-white font-bold text-sm">Manage Categories</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-300 text-lg leading-none">
            ✕
          </button>
        </div>

        <ul className="space-y-1.5 mb-4">
          {vault.categories.map((cat, i) => (
            <li key={cat} className="flex items-center gap-2">
              {renamingIndex === i ? (
                <input
                  autoFocus
                  value={renameValue}
                  onChange={(e) => setRenameValue(e.target.value)}
                  onBlur={() => commitRename(i)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') commitRename(i);
                    if (e.key === 'Escape') setRenamingIndex(null);
                  }}
                  className="flex-1 px-2 py-1 rounded bg-gray-800 text-white text-xs border border-violet-500 focus:outline-none"
                />
              ) : (
                <span className="flex-1 text-gray-300 text-xs truncate">{cat}</span>
              )}
              <button
                onClick={() => startRename(i)}
                className="text-gray-600 hover:text-gray-400 text-xs transition-colors"
                title="Rename"
              >
                ✎
              </button>
              <button
                onClick={() => handleDelete(cat)}
                disabled={vault.categories.length <= 1}
                className="text-gray-600 hover:text-red-400 disabled:opacity-30 text-xs transition-colors"
                title="Delete"
              >
                ✕
              </button>
            </li>
          ))}
        </ul>

        <form onSubmit={handleAdd} className="flex gap-2">
          <input
            type="text"
            placeholder="New category…"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            className="flex-1 px-2 py-1.5 rounded-lg bg-gray-800 text-white text-xs placeholder-gray-500 border border-gray-700 focus:outline-none focus:border-violet-500"
          />
          <button
            type="submit"
            className="px-3 py-1.5 rounded-lg bg-violet-600 hover:bg-violet-700 text-white text-xs font-medium transition-colors"
          >
            Add
          </button>
        </form>
      </div>
    </div>
  );
}
