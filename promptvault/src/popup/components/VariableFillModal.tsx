import { useState } from 'react';

interface Props {
  promptTitle: string;
  variables: string[];
  onInject: (values: Record<string, string>) => void;
  onClose: () => void;
}

export default function VariableFillModal({ promptTitle, variables, onInject, onClose }: Props) {
  const [values, setValues] = useState<Record<string, string>>(
    Object.fromEntries(variables.map((v) => [v, '']))
  );

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onInject(values);
  }

  return (
    <div className="fixed inset-0 bg-black/70 flex items-end z-50">
      <div className="bg-gray-900 rounded-t-xl p-4 w-full border-t border-gray-700">
        <div className="flex items-center justify-between mb-1">
          <h2 className="text-white font-bold text-sm">Fill in variables</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-300 text-lg leading-none">
            ✕
          </button>
        </div>
        <p className="text-gray-500 text-xs mb-4 truncate">{promptTitle}</p>

        <form onSubmit={handleSubmit} className="space-y-3">
          {variables.map((v, i) => (
            <div key={v}>
              <label className="block text-gray-400 text-xs mb-1 font-mono">{`{{${v}}}`}</label>
              <input
                type="text"
                value={values[v]}
                onChange={(e) => setValues((prev) => ({ ...prev, [v]: e.target.value }))}
                placeholder={v}
                autoFocus={i === 0}
                className="w-full px-3 py-2 rounded-lg bg-gray-800 text-white text-sm placeholder-gray-500 border border-gray-700 focus:outline-none focus:border-violet-500"
              />
            </div>
          ))}

          <div className="flex gap-2 pt-1">
            <button
              type="submit"
              className="flex-1 py-2 rounded-lg bg-violet-600 hover:bg-violet-700 text-white text-sm font-medium transition-colors"
            >
              Inject
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
