import { useState } from 'react';
import { type Prompt } from '../../lib/storage';

interface Props {
  categories: string[];
  onAdd: (prompt: Omit<Prompt, 'id' | 'createdAt'>) => void;
  onClose: () => void;
}

const NEW_CATEGORY_SENTINEL = '__new__';

export default function AddPromptModal({ categories, onAdd, onClose }: Props) {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [category, setCategory] = useState(categories[0] ?? 'General');
  const [newCategory, setNewCategory] = useState('');
  const [addingNew, setAddingNew] = useState(false);
  const [tagsInput, setTagsInput] = useState('');

  function handleCategoryChange(val: string) {
    if (val === NEW_CATEGORY_SENTINEL) {
      setAddingNew(true);
      setCategory('');
    } else {
      setAddingNew(false);
      setCategory(val);
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !body.trim()) return;
    const finalCategory = addingNew ? newCategory.trim() : category;
    if (!finalCategory) return;
    const tags = tagsInput
      .split(',')
      .map((t) => t.trim().toLowerCase())
      .filter(Boolean);
    onAdd({ title: title.trim(), body: body.trim(), category: finalCategory, tags, pinned: false, useCount: 0 });
    onClose();
  }

  return (
    <div className="fixed inset-0 bg-black/70 flex items-end z-50">
      <div className="bg-gray-900 rounded-t-xl p-4 w-full border-t border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-white font-bold text-sm">Add Prompt</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-300 text-lg leading-none">
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="text"
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            autoFocus
            className="w-full px-3 py-2 rounded-lg bg-gray-800 text-white text-sm placeholder-gray-500 border border-gray-700 focus:outline-none focus:border-violet-500"
          />
          <textarea
            placeholder="Prompt body… use {{variable}} as a fill-in placeholder"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={4}
            className="w-full px-3 py-2 rounded-lg bg-gray-800 text-white text-sm placeholder-gray-500 border border-gray-700 focus:outline-none focus:border-violet-500 resize-none"
          />
          <input
            type="text"
            placeholder="Tags: writing, seo, emails  (comma-separated)"
            value={tagsInput}
            onChange={(e) => setTagsInput(e.target.value)}
            className="w-full px-3 py-2 rounded-lg bg-gray-800 text-white text-sm placeholder-gray-500 border border-gray-700 focus:outline-none focus:border-violet-500"
          />

          {addingNew ? (
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Category name"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                autoFocus
                className="flex-1 px-3 py-2 rounded-lg bg-gray-800 text-white text-sm placeholder-gray-500 border border-violet-500 focus:outline-none"
              />
              <button
                type="button"
                onClick={() => { setAddingNew(false); setCategory(categories[0] ?? 'General'); }}
                className="px-3 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-400 text-xs transition-colors"
              >
                Cancel
              </button>
            </div>
          ) : (
            <select
              value={category}
              onChange={(e) => handleCategoryChange(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-gray-800 text-white text-sm border border-gray-700 focus:outline-none focus:border-violet-500"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
              <option value={NEW_CATEGORY_SENTINEL}>+ New category</option>
            </select>
          )}

          <div className="flex gap-2 pt-1">
            <button
              type="submit"
              className="flex-1 py-2 rounded-lg bg-violet-600 hover:bg-violet-700 text-white text-sm font-medium transition-colors"
            >
              Save
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-400 text-sm transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
