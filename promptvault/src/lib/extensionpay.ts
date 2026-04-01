// Replace 'your-extension-id-here' with your actual ExtensionPay extension ID
// after registering at https://extensionpay.com
import ExtPay from 'extpay';

export const EXTENSION_ID = 'testiop';

export const extpay = ExtPay(EXTENSION_ID);

export const DEV_PRO_KEY = 'pv_dev_pro';

export function isDevBuild(): boolean {
  return !chrome.runtime.getManifest().update_url;
}

export async function isPaidUser(): Promise<boolean> {
  if (isDevBuild()) {
    const result = await chrome.storage.local.get(DEV_PRO_KEY);
    if (result[DEV_PRO_KEY] === true) return true;
  }
  try {
    const user = await extpay.getUser();
    return user.paid;
  } catch {
    return false;
  }
}

export function openPaymentPage(): void {
  extpay.openPaymentPage();
}
