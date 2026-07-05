interface Props {
  categories: string[];
  active: string;
  showTop: boolean;
  onChange: (category: string) => void;
}

export default function CategoryFilter({ categories, active, showTop, onChange }: Props) {
  return (
    <div className="flex gap-1.5 overflow-x-auto [&::-webkit-scrollbar]:hidden" style={{ scrollbarWidth: 'none' }}>
      <button
        onClick={() => onChange('All')}
        className={`shrink-0 px-3 py-1 rounded-full text-xs font-medium transition-colors ${
          active === 'All'
            ? 'bg-violet-600 text-white'
            : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
        }`}
      >
        All
      </button>
      {showTop && (
        <button
          onClick={() => onChange('Top')}
          className={`shrink-0 px-3 py-1 rounded-full text-xs font-medium transition-colors ${
            active === 'Top'
              ? 'bg-amber-600 text-white'
              : 'bg-gray-800 text-amber-500 hover:bg-gray-700'
          }`}
        >
          ★ Top
        </button>
      )}
      {categories.map((cat) => (
        <button
          key={cat}
          onClick={() => onChange(cat)}
          className={`shrink-0 px-3 py-1 rounded-full text-xs font-medium transition-colors ${
            active === cat
              ? 'bg-violet-600 text-white'
              : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
          }`}
        >
          {cat}
        </button>
      ))}
    </div>
  );
}
