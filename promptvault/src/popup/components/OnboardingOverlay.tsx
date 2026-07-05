import { useState } from 'react';

interface Props {
  onDismiss: () => void;
}

const STEPS = [
  {
    icon: (
      <svg viewBox="0 0 48 48" className="w-12 h-12" fill="none">
        <rect x="4" y="8" width="40" height="32" rx="6" fill="#4c1d95" />
        <rect x="4" y="8" width="40" height="32" rx="6" stroke="#7c3aed" strokeWidth="2" />
        <path d="M24 20v8M20 24h8" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
      </svg>
    ),
    title: 'Save your prompts',
    body: 'Click + Add to save any prompt with a title, category, and optional tags. Your vault is AES-encrypted — only you can read it.',
  },
  {
    icon: (
      <svg viewBox="0 0 48 48" className="w-12 h-12" fill="none">
        <rect x="4" y="10" width="40" height="28" rx="6" fill="#1e1b4b" stroke="#7c3aed" strokeWidth="2" />
        <rect x="10" y="18" width="28" height="6" rx="2" fill="#4c1d95" />
        <path d="M32 32l6 6" stroke="#7c3aed" strokeWidth="2.5" strokeLinecap="round" />
        <circle cx="20" cy="21" r="1.5" fill="#a78bfa" />
      </svg>
    ),
    title: 'Inject into any AI',
    body: 'Open ChatGPT, Claude, Gemini, or Grok and click Inject on any prompt — it lands directly in the input box.',
  },
  {
    icon: (
      <svg viewBox="0 0 48 48" className="w-12 h-12" fill="none">
        <rect x="6" y="6" width="24" height="30" rx="4" fill="#1e1b4b" stroke="#7c3aed" strokeWidth="2" />
        <rect x="18" y="12" width="24" height="30" rx="4" fill="#2e1065" stroke="#7c3aed" strokeWidth="2" />
        <path d="M24 24h10M24 30h7" stroke="#a78bfa" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
    title: 'Copy anywhere',
    body: 'Use the Copy button to grab any prompt to your clipboard. Works everywhere — docs, emails, Slack, anywhere you type.',
  },
];

export default function OnboardingOverlay({ onDismiss }: Props) {
  const [step, setStep] = useState(0);
  const current = STEPS[step];
  const isLast = step === STEPS.length - 1;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 px-4">
      <div className="bg-gray-900 rounded-xl p-6 w-full max-w-xs border border-gray-700 text-center">
        <div className="flex justify-center mb-4">{current.icon}</div>
        <h2 className="text-white font-bold text-base mb-2">{current.title}</h2>
        <p className="text-gray-400 text-sm leading-relaxed mb-6">{current.body}</p>

        {/* Step dots */}
        <div className="flex justify-center gap-1.5 mb-5">
          {STEPS.map((_, i) => (
            <div
              key={i}
              className={`w-1.5 h-1.5 rounded-full transition-colors ${
                i === step ? 'bg-violet-500' : 'bg-gray-700'
              }`}
            />
          ))}
        </div>

        <div className="flex gap-2">
          {isLast ? (
            <button
              onClick={onDismiss}
              className="flex-1 py-2 rounded-lg bg-violet-600 hover:bg-violet-700 text-white text-sm font-medium transition-colors"
            >
              Get started
            </button>
          ) : (
            <>
              <button
                onClick={onDismiss}
                className="px-4 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-500 text-sm transition-colors"
              >
                Skip
              </button>
              <button
                onClick={() => setStep((s) => s + 1)}
                className="flex-1 py-2 rounded-lg bg-violet-600 hover:bg-violet-700 text-white text-sm font-medium transition-colors"
              >
                Next
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
