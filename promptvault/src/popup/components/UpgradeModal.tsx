import { openPaymentPage } from '../../lib/extensionpay';

interface Props {
  reason: 'prompts' | 'categories';
  totalUses: number;
  onClose: () => void;
}

const MESSAGES = {
  prompts: "You've reached the 15-prompt limit on the free plan.",
  categories: "You've reached the 3-category limit on the free plan.",
};

export default function UpgradeModal({ reason, totalUses, onClose }: Props) {
  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 px-4">
      <div className="bg-gray-900 rounded-xl p-5 w-full max-w-xs border border-gray-700">
        <h2 className="text-white font-bold text-base mb-2">Upgrade to Pro</h2>
        <p className="text-gray-400 text-sm mb-3">{MESSAGES[reason]}</p>

        {totalUses > 0 && (
          <p className="text-violet-400 text-xs mb-4 bg-violet-950/50 rounded-lg px-3 py-2">
            You've used your prompts <span className="font-bold">{totalUses}</span> time{totalUses !== 1 ? 's' : ''} — unlock the full vault.
          </p>
        )}

        <ul className="text-sm text-gray-300 space-y-1 mb-5">
          <li>✓ Unlimited prompts &amp; categories</li>
          <li>✓ Priority support</li>
        </ul>

        <div className="flex gap-2">
          <button
            onClick={() => { openPaymentPage(); onClose(); }}
            className="flex-1 py-2 rounded-lg bg-violet-600 hover:bg-violet-700 text-white text-sm font-medium transition-colors"
          >
            Upgrade — $6/mo
          </button>
          <button
            onClick={onClose}
            className="px-3 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-400 text-sm transition-colors"
          >
            Later
          </button>
        </div>
      </div>
    </div>
  );
}
