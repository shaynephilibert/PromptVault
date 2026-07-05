import { useState } from 'react';
import { type Prompt } from '../../lib/storage';

interface Props {
  prompt: Prompt;
  onDelete: (id: string) => void;
  onEdit: (prompt: Prompt) => void;
  onDuplicate: (prompt: Prompt) => void;
  onTogglePin: (id: string) => void;
  onCopy: (id: string) => void;
  onInject: (prompt: Prompt) => void;
  onTagClick: (tag: string) => void;
}

export default function PromptCard({
  prompt,
  onDelete,
  onEdit,
  onDuplicate,
  onTogglePin,
  onCopy,
  onInject,
  onTagClick,
}: Props) {
  const [copied, setCopied] = useState(false);
  const hasVars = /\{\{[^}]+\}\}/.test(prompt.body);

  function renderBodyPreview(body: string) {
    const preview = body.slice(0, 100);
    const parts = preview.split(/(\{\{[^}]+\}\})/g);
    return parts.map((part, i) =>
      /^\{\{[^}]+\}\}$/.test(part)
        ? <span key={i} className="text-violet-400 font-mono">{part}</span>
        : <span key={i}>{part}</span>
    );
  }

  async function handleCopy() {
    await navigator.clipboard.writeText(prompt.body);
    onCopy(prompt.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className={`rounded-lg p-3 border transition-colors ${
      prompt.pinned
        ? 'bg-gray-800 border-violet-700'
        : 'bg-gray-800 border-gray-700 hover:border-gray-600'
    }`}>
      <div className="flex items-start justify-between gap-2 mb-1">
        <div className="flex items-center gap-1.5 min-w-0">
          <button
            onClick={() => onTogglePin(prompt.id)}
            className={`shrink-0 text-sm leading-none transition-colors ${
              prompt.pinned ? 'text-violet-400' : 'text-gray-600 hover:text-gray-400'
            }`}
            title={prompt.pinned ? 'Unpin' : 'Pin to top'}
          >
            {prompt.pinned ? '★' : '☆'}
          </button>
          <span className="text-white text-sm font-medium leading-tight truncate">{prompt.title}</span>
        </div>
        <span className="shrink-0 text-xs px-2 py-0.5 rounded-full bg-gray-700 text-gray-400">
          {prompt.category}
        </span>
      </div>

      <p className="text-gray-400 text-xs leading-relaxed mb-2 line-clamp-2 ml-5">
        {renderBodyPreview(prompt.body)}{prompt.body.length > 100 ? '…' : ''}
      </p>

      {prompt.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2 ml-5">
          {prompt.tags.map((tag) => (
            <button
              key={tag}
              onClick={() => onTagClick(tag)}
              className="text-xs px-1.5 py-0.5 rounded bg-gray-700 text-violet-400 hover:bg-gray-600 transition-colors"
            >
              #{tag}
            </button>
          ))}
        </div>
      )}

      <div className="flex gap-1.5">
        <button
          onClick={handleCopy}
          className="flex-1 py-1 rounded bg-gray-700 hover:bg-gray-600 text-gray-300 text-xs transition-colors"
        >
          {copied ? 'Copied!' : 'Copy'}
        </button>
        <button
          onClick={() => onInject(prompt)}
          className="flex-1 py-1 rounded bg-violet-700 hover:bg-violet-600 text-white text-xs transition-colors"
        >
          {hasVars ? 'Inject…' : 'Inject'}
        </button>
        <button
          onClick={() => onEdit(prompt)}
          className="py-1 px-2 rounded bg-gray-700 hover:bg-gray-600 text-gray-400 text-xs transition-colors"
        >
          Edit
        </button>
        <button
          onClick={() => onDuplicate(prompt)}
          className="py-1 px-2 rounded bg-gray-700 hover:bg-gray-600 text-gray-400 text-xs transition-colors"
          title="Duplicate"
        >
          ⧉
        </button>
        <button
          onClick={() => onDelete(prompt.id)}
          className="py-1 px-2 rounded bg-gray-700 hover:bg-red-900/50 text-gray-500 hover:text-red-400 text-xs transition-colors"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
