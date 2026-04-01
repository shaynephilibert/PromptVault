import { useState, useEffect, useRef } from 'react';
import { type VaultData, type Prompt } from '../../lib/storage';
import OnboardingOverlay from './OnboardingOverlay';
import CategoryFilter from './CategoryFilter';
import PromptCard from './PromptCard';
import AddPromptModal from './AddPromptModal';
import EditPromptModal from './EditPromptModal';
import SettingsModal from './SettingsModal';
import ManageCategoriesModal from './ManageCategoriesModal';
import UpgradeModal from './UpgradeModal';
import VariableFillModal from './VariableFillModal';

const FREE_PROMPT_LIMIT = 15;
const FREE_CATEGORY_LIMIT = 3;

type SortOrder = 'newest' | 'oldest' | 'az' | 'za' | 'popular';
type UpgradeReason = 'prompts' | 'categories';

interface Props {
  vault: VaultData;
  paid: boolean;
  onVaultChange: (updated: VaultData) => void;
  onLock: () => void;
}

function sortPrompts(prompts: Prompt[], order: SortOrder): Prompt[] {
  const pinned = prompts.filter((p) => p.pinned);
  const rest = prompts.filter((p) => !p.pinned);
  const sorted = [...rest].sort((a, b) => {
    if (order === 'newest') return b.createdAt - a.createdAt;
    if (order === 'oldest') return a.createdAt - b.createdAt;
    if (order === 'az') return a.title.localeCompare(b.title);
    if (order === 'za') return b.title.localeCompare(a.title);
    if (order === 'popular') return b.useCount - a.useCount;
    return 0;
  });
  return [...pinned, ...sorted];
}

export default function MainScreen({ vault, paid, onVaultChange, onLock }: Props) {
  const [activeCategory, setActiveCategory] = useState('All');
  const [sortOrder, setSortOrder] = useState<SortOrder>('newest');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showManageCategories, setShowManageCategories] = useState(false);
  const [editingPrompt, setEditingPrompt] = useState<Prompt | null>(null);
  const [upgradeReason, setUpgradeReason] = useState<UpgradeReason | null>(null);
  const [varFillTarget, setVarFillTarget] = useState<Prompt | null>(null);
  const [search, setSearch] = useState('');
  const [injectStatus, setInjectStatus] = useState<string | null>(null);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);

  // First-run onboarding check
  useEffect(() => {
    chrome.storage.local.get('promptvault_onboarded', (result) => {
      if (!result['promptvault_onboarded']) setShowOnboarding(true);
    });
  }, []);

  function dismissOnboarding() {
    chrome.storage.local.set({ promptvault_onboarded: true });
    setShowOnboarding(false);
  }

  // Keyboard shortcuts
  useEffect(() => {
    const anyModalOpen =
      showAddModal || showSettings || showManageCategories ||
      !!editingPrompt || !!upgradeReason || showOnboarding || !!varFillTarget;

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        if (showAddModal) setShowAddModal(false);
        else if (showSettings) setShowSettings(false);
        else if (showManageCategories) setShowManageCategories(false);
        else if (editingPrompt) setEditingPrompt(null);
        else if (upgradeReason) setUpgradeReason(null);
        else if (varFillTarget) setVarFillTarget(null);
        else if (showOnboarding) dismissOnboarding();
        return;
      }
      if (anyModalOpen) return;
      if (e.key === '/' || (e.key === 'k' && (e.metaKey || e.ctrlKey))) {
        e.preventDefault();
        searchRef.current?.focus();
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showAddModal, showSettings, showManageCategories, editingPrompt, upgradeReason, showOnboarding, varFillTarget]);

  const canAddPrompt = paid || vault.prompts.length < FREE_PROMPT_LIMIT;
  const canAddCategory = paid || vault.categories.length < FREE_CATEGORY_LIMIT;

  const TOP_COUNT = 5;
  const hasUsage = vault.prompts.some((p) => p.useCount > 0);

  const filtered = sortPrompts(
    vault.prompts.filter((p) => {
      if (activeCategory === 'Top') {
        const top = [...vault.prompts]
          .sort((a, b) => b.useCount - a.useCount)
          .slice(0, TOP_COUNT);
        if (!top.find((t) => t.id === p.id)) return false;
      } else {
        const matchCat = activeCategory === 'All' || p.category === activeCategory;
        if (!matchCat) return false;
      }
      return (
        !search ||
        p.title.toLowerCase().includes(search.toLowerCase()) ||
        p.body.toLowerCase().includes(search.toLowerCase()) ||
        p.tags.some((t) => t.toLowerCase().includes(search.replace(/^#/, '').toLowerCase()))
      );
    }),
    sortOrder
  );

  function handleAddClick() {
    if (!canAddPrompt) {
      setUpgradeReason('prompts');
      return;
    }
    setShowAddModal(true);
  }

  function handleAdd(data: Omit<Prompt, 'id' | 'createdAt'>) {
    const newPrompt: Prompt = {
      ...data,
      id: crypto.randomUUID(),
      useCount: 0,
      createdAt: Date.now(),
    };
    const isNewCategory = !vault.categories.includes(data.category);
    const categories = isNewCategory
      ? [...vault.categories, data.category]
      : vault.categories;
    onVaultChange({ ...vault, prompts: [...vault.prompts, newPrompt], categories });
  }

  function handleDelete(id: string) {
    onVaultChange({ ...vault, prompts: vault.prompts.filter((p) => p.id !== id) });
  }

  function handleEdit(updated: Prompt) {
    onVaultChange({
      ...vault,
      prompts: vault.prompts.map((p) => (p.id === updated.id ? updated : p)),
    });
  }

  function handleDuplicate(prompt: Prompt) {
    const copy: Prompt = {
      ...prompt,
      id: crypto.randomUUID(),
      title: `${prompt.title} (copy)`,
      pinned: false,
      createdAt: Date.now(),
    };
    onVaultChange({ ...vault, prompts: [...vault.prompts, copy] });
  }

  function handleIncrementUse(id: string) {
    onVaultChange({
      ...vault,
      prompts: vault.prompts.map((p) =>
        p.id === id ? { ...p, useCount: p.useCount + 1 } : p
      ),
    });
  }

  function handleTogglePin(id: string) {
    onVaultChange({
      ...vault,
      prompts: vault.prompts.map((p) =>
        p.id === id ? { ...p, pinned: !p.pinned } : p
      ),
    });
  }

  function handleInject(prompt: Prompt) {
    const vars = [...new Set([...prompt.body.matchAll(/\{\{(\w+)\}\}/g)].map((m) => m[1]))];
    if (vars.length > 0) {
      setVarFillTarget(prompt);
      return;
    }
    doInject(prompt.body, prompt);
  }

  async function handleVarFillSubmit(values: Record<string, string>) {
    if (!varFillTarget) return;
    let text = varFillTarget.body;
    for (const [k, v] of Object.entries(values)) {
      text = text.replaceAll(`{{${k}}}`, v);
    }
    setVarFillTarget(null);
    await doInject(text, varFillTarget);
  }

  async function doInject(text: string, prompt: Prompt) {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (!tab?.id || !tab.url) return;

      const url = tab.url;
      const isChatGPT = url.includes('chatgpt.com');
      const isClaude = url.includes('claude.ai');
      const isGemini = url.includes('gemini.google.com');
      const isGrok = url.includes('grok.com');
      if (!isChatGPT && !isClaude && !isGemini && !isGrok) {
        setInjectStatus('Navigate to ChatGPT, Claude, Gemini, or Grok first');
        setTimeout(() => setInjectStatus(null), 2500);
        return;
      }

      await chrome.tabs.sendMessage(tab.id, { type: 'INJECT_PROMPT', prompt: text });
      handleIncrementUse(prompt.id);
      setInjectStatus('Injected!');
      setTimeout(() => setInjectStatus(null), 1500);
    } catch {
      setInjectStatus('Injection failed — reload the page and try again');
      setTimeout(() => setInjectStatus(null), 3000);
    }
  }

  return (
    <div className="flex flex-col h-full min-h-[500px] max-h-[600px] bg-gray-950">
      {/* Header */}
      <div className="px-4 pt-4 pb-2">
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-white font-bold text-base">PromptVault</h1>
          <div className="flex items-center gap-2">
            {!paid && (
              <span className="text-xs text-gray-500">
                {vault.prompts.length}/{FREE_PROMPT_LIMIT} prompts
              </span>
            )}
            <button
              onClick={() => setShowSettings(true)}
              className="p-1 rounded-lg text-gray-500 hover:text-gray-300 hover:bg-gray-800 transition-colors"
              title="Settings"
            >
              <svg viewBox="0 0 20 20" className="w-4 h-4" fill="currentColor">
                <path fillRule="evenodd" clipRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" />
              </svg>
            </button>
            <button
              onClick={handleAddClick}
              className="px-3 py-1 rounded-lg bg-violet-600 hover:bg-violet-700 text-white text-xs font-medium transition-colors"
            >
              + Add
            </button>
          </div>
        </div>

        <div className="flex gap-2 mb-2">
          <input
            ref={searchRef}
            type="text"
            placeholder="Search prompts or #tag…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 px-3 py-1.5 rounded-lg bg-gray-800 text-white text-sm placeholder-gray-500 border border-gray-700 focus:outline-none focus:border-violet-500"
          />
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value as SortOrder)}
            className="px-2 py-1.5 rounded-lg bg-gray-800 text-gray-400 text-xs border border-gray-700 focus:outline-none focus:border-violet-500"
          >
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
            <option value="az">A→Z</option>
            <option value="za">Z→A</option>
            <option value="popular">Popular</option>
          </select>
        </div>

        <div className="flex items-center gap-1">
          <CategoryFilter
            categories={vault.categories}
            active={activeCategory}
            showTop={hasUsage}
            onChange={setActiveCategory}
          />
          <button
            onClick={() => setShowManageCategories(true)}
            className="shrink-0 text-gray-600 hover:text-gray-400 text-xs px-1 transition-colors"
            title="Manage categories"
          >
            ✎
          </button>
        </div>
      </div>

      {/* Inject status toast */}
      {injectStatus && (
        <div className="mx-4 mb-2 px-3 py-1.5 rounded-lg bg-gray-800 text-gray-300 text-xs text-center">
          {injectStatus}
        </div>
      )}

      {/* Prompt list */}
      <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-2">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-10 gap-3">
            {search ? (
              <>
                <svg viewBox="0 0 64 64" className="w-12 h-12 opacity-30" fill="none">
                  <circle cx="28" cy="28" r="18" stroke="#6d28d9" strokeWidth="3" />
                  <path d="M42 42l12 12" stroke="#6d28d9" strokeWidth="3" strokeLinecap="round" />
                  <path d="M22 28h12M28 22v12" stroke="#6d28d9" strokeWidth="2.5" strokeLinecap="round" opacity="0.5" />
                </svg>
                <p className="text-gray-600 text-sm">No prompts match your search.</p>
                <button onClick={() => setSearch('')} className="text-violet-500 text-xs hover:underline">
                  Clear search
                </button>
              </>
            ) : (
              <>
                <svg viewBox="0 0 64 64" className="w-14 h-14 opacity-30" fill="none">
                  <rect x="8" y="16" width="48" height="36" rx="6" stroke="#6d28d9" strokeWidth="3" />
                  <path d="M32 28v12M26 34h12" stroke="#6d28d9" strokeWidth="2.5" strokeLinecap="round" />
                  <path d="M20 16v-4a12 12 0 0124 0v4" stroke="#6d28d9" strokeWidth="3" strokeLinecap="round" />
                </svg>
                <p className="text-gray-600 text-sm">Your vault is empty.</p>
                <button
                  onClick={handleAddClick}
                  className="text-violet-500 text-xs hover:underline"
                >
                  Add your first prompt
                </button>
              </>
            )}
          </div>
        ) : (
          filtered.map((p) => (
            <PromptCard
              key={p.id}
              prompt={p}
              onDelete={handleDelete}
              onEdit={setEditingPrompt}
              onDuplicate={handleDuplicate}
              onTogglePin={handleTogglePin}
              onCopy={handleIncrementUse}
              onInject={handleInject}
              onTagClick={(tag) => setSearch(`#${tag}`)}
            />
          ))
        )}
      </div>

      {/* Modals */}
      {showAddModal && (
        <AddPromptModal
          categories={vault.categories}
          canAddCategory={canAddCategory}
          onAdd={handleAdd}
          onUpgrade={() => { setShowAddModal(false); setUpgradeReason('categories'); }}
          onClose={() => setShowAddModal(false)}
        />
      )}
      {showSettings && (
        <SettingsModal
          vault={vault}
          paid={paid}
          onVaultChange={onVaultChange}
          onLock={onLock}
          onClose={() => setShowSettings(false)}
        />
      )}
      {showManageCategories && (
        <ManageCategoriesModal
          vault={vault}
          paid={paid}
          onVaultChange={onVaultChange}
          onUpgrade={() => { setShowManageCategories(false); setUpgradeReason('categories'); }}
          onClose={() => setShowManageCategories(false)}
        />
      )}
      {editingPrompt && (
        <EditPromptModal
          prompt={editingPrompt}
          categories={vault.categories}
          onSave={handleEdit}
          onClose={() => setEditingPrompt(null)}
        />
      )}
      {upgradeReason && (
        <UpgradeModal
          reason={upgradeReason}
          totalUses={vault.prompts.reduce((sum, p) => sum + p.useCount, 0)}
          onClose={() => setUpgradeReason(null)}
        />
      )}
      {varFillTarget && (
        <VariableFillModal
          promptTitle={varFillTarget.title}
          variables={[...new Set([...varFillTarget.body.matchAll(/\{\{(\w+)\}\}/g)].map((m) => m[1]))]}
          onInject={handleVarFillSubmit}
          onClose={() => setVarFillTarget(null)}
        />
      )}
      {showOnboarding && <OnboardingOverlay onDismiss={dismissOnboarding} />}
    </div>
  );
}
