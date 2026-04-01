import { useEffect, useState } from 'react';
import { vaultExists, loadVault, saveVault, saveSession, loadSession, clearSession, type VaultData } from '../lib/storage';
import { isPaidUser } from '../lib/extensionpay';
import SetPasswordScreen from './components/SetPasswordScreen';
import UnlockScreen from './components/UnlockScreen';
import MainScreen from './components/MainScreen';

type Screen = 'loading' | 'set-password' | 'unlock' | 'main';

export default function Popup() {
  const isUnlockTab = new URLSearchParams(window.location.search).get('unlock') === '1';
  const [screen, setScreen] = useState<Screen>('loading');
  const [vault, setVault] = useState<VaultData | null>(null);
  const [password, setPassword] = useState('');
  const [paid, setPaid] = useState(false);

  useEffect(() => {
    (async () => {
      const [session, paidStatus] = await Promise.all([loadSession(), isPaidUser()]);
      setPaid(paidStatus);
      if (session) {
        setPassword(session.password);
        setVault(session.vault);
        setScreen('main');
        return;
      }
      const exists = await vaultExists();
      setScreen(exists ? 'unlock' : 'set-password');
    })();
  }, []);

  async function handleSetPassword(pw: string) {
    const initial: VaultData = {
      prompts: [],
      categories: ['General', 'Writing', 'Coding', 'Research'],
    };
    await saveVault(initial, pw);
    await saveSession(pw, initial);
    setPassword(pw);
    setVault(initial);
    setScreen('main');
  }

  async function handleUnlock(pw: string): Promise<boolean> {
    const data = await loadVault(pw);
    if (!data) return false;
    await saveSession(pw, data);
    if (isUnlockTab) { window.close(); return true; }
    setPassword(pw);
    setVault(data);
    setScreen('main');
    return true;
  }

  async function handleVaultChange(updated: VaultData) {
    setVault(updated);
    await Promise.all([saveVault(updated, password), saveSession(password, updated)]);
  }

  async function handleLock() {
    await clearSession();
    setPassword('');
    setVault(null);
    setScreen('unlock');
  }

  if (screen === 'loading') {
    return (
      <div className="flex items-center justify-center h-full min-h-[500px] bg-gray-950">
        <div className="w-6 h-6 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (screen === 'set-password') {
    return <SetPasswordScreen onSet={handleSetPassword} />;
  }

  if (screen === 'unlock') {
    return <UnlockScreen onUnlock={handleUnlock} />;
  }

  return (
    <MainScreen
      vault={vault!}
      paid={paid}
      onVaultChange={handleVaultChange}
      onLock={handleLock}
    />
  );
}
