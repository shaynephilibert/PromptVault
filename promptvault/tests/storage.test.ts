import { describe, it, expect } from 'vitest';

// importPrompts uses FileReader (browser API), so we test its merge logic directly
// by extracting the same logic used in the function.

interface Prompt {
  id: string;
  title: string;
  body: string;
  category: string;
  tags: string[];
  pinned: boolean;
  useCount: number;
  createdAt: number;
}

interface VaultData {
  prompts: Prompt[];
  categories: string[];
}

function mergeVaults(existing: VaultData, incoming: VaultData): VaultData {
  const existingIds = new Set(existing.prompts.map((p) => p.id));
  const newPrompts = incoming.prompts.filter((p) => !existingIds.has(p.id));
  const newCategories = incoming.categories?.filter(
    (c) => !existing.categories.includes(c)
  ) ?? [];

  return {
    prompts: [...existing.prompts, ...newPrompts],
    categories: [...existing.categories, ...newCategories],
  };
}

function makePrompt(overrides: Partial<Prompt> = {}): Prompt {
  return {
    id: crypto.randomUUID(),
    title: 'Test prompt',
    body: 'Test body',
    category: 'General',
    tags: [],
    pinned: false,
    useCount: 0,
    createdAt: Date.now(),
    ...overrides,
  };
}

describe('vault merge logic (importPrompts)', () => {
  it('merges new prompts into existing vault', () => {
    const existing: VaultData = {
      prompts: [makePrompt({ id: 'a', title: 'Existing' })],
      categories: ['General'],
    };
    const incoming: VaultData = {
      prompts: [makePrompt({ id: 'b', title: 'New' })],
      categories: ['General'],
    };

    const result = mergeVaults(existing, incoming);
    expect(result.prompts).toHaveLength(2);
    expect(result.prompts.map((p) => p.id)).toEqual(['a', 'b']);
  });

  it('skips duplicate prompts by id', () => {
    const existing: VaultData = {
      prompts: [makePrompt({ id: 'a', title: 'Original' })],
      categories: ['General'],
    };
    const incoming: VaultData = {
      prompts: [makePrompt({ id: 'a', title: 'Duplicate' })],
      categories: [],
    };

    const result = mergeVaults(existing, incoming);
    expect(result.prompts).toHaveLength(1);
    expect(result.prompts[0].title).toBe('Original');
  });

  it('merges new categories without duplicates', () => {
    const existing: VaultData = {
      prompts: [],
      categories: ['General', 'Writing'],
    };
    const incoming: VaultData = {
      prompts: [],
      categories: ['Writing', 'Coding', 'Research'],
    };

    const result = mergeVaults(existing, incoming);
    expect(result.categories).toEqual(['General', 'Writing', 'Coding', 'Research']);
  });

  it('handles empty incoming vault', () => {
    const existing: VaultData = {
      prompts: [makePrompt({ id: 'a' })],
      categories: ['General'],
    };
    const incoming: VaultData = { prompts: [], categories: [] };

    const result = mergeVaults(existing, incoming);
    expect(result.prompts).toHaveLength(1);
    expect(result.categories).toEqual(['General']);
  });

  it('handles empty existing vault', () => {
    const existing: VaultData = { prompts: [], categories: [] };
    const incoming: VaultData = {
      prompts: [makePrompt({ id: 'a' }), makePrompt({ id: 'b' })],
      categories: ['General', 'Coding'],
    };

    const result = mergeVaults(existing, incoming);
    expect(result.prompts).toHaveLength(2);
    expect(result.categories).toEqual(['General', 'Coding']);
  });
});
