import { describe, it, expect } from 'vitest';
import { execSync } from 'child_process';
import { existsSync, readFileSync } from 'fs';
import { resolve } from 'path';

const ROOT = resolve(__dirname, '..');
const DIST = resolve(ROOT, 'dist');

describe('production build', () => {
  it('tsc + vite build completes without errors', () => {
    execSync('npm run build', { cwd: ROOT, stdio: 'pipe' });
    expect(existsSync(DIST)).toBe(true);
  });

  it('produces all required output files', () => {
    const required = [
      'manifest.json',
      'popup/index.html',
      'popup/popup.js',
      'background/service-worker.js',
      'content/chatgpt.js',
      'content/claude.js',
      'content/gemini.js',
      'content/grok.js',
    ];

    for (const file of required) {
      expect(existsSync(resolve(DIST, file)), `missing: dist/${file}`).toBe(true);
    }
  });

  it('manifest.json is valid Manifest V3', () => {
    const manifest = JSON.parse(readFileSync(resolve(DIST, 'manifest.json'), 'utf-8'));

    expect(manifest.manifest_version).toBe(3);
    expect(manifest.name).toBeTruthy();
    expect(manifest.version).toBeTruthy();
  });

  it('manifest references files that exist on disk', () => {
    const manifest = JSON.parse(readFileSync(resolve(DIST, 'manifest.json'), 'utf-8'));

    // Popup HTML
    const popupHtml = manifest.action?.default_popup;
    if (popupHtml) {
      expect(existsSync(resolve(DIST, popupHtml)), `popup html missing: ${popupHtml}`).toBe(true);
    }

    // Service worker
    const sw = manifest.background?.service_worker;
    if (sw) {
      expect(existsSync(resolve(DIST, sw)), `service worker missing: ${sw}`).toBe(true);
    }

    // Content scripts
    for (const cs of manifest.content_scripts ?? []) {
      for (const js of cs.js ?? []) {
        expect(existsSync(resolve(DIST, js)), `content script missing: ${js}`).toBe(true);
      }
    }
  });

  it('manifest declares required permissions', () => {
    const manifest = JSON.parse(readFileSync(resolve(DIST, 'manifest.json'), 'utf-8'));
    const perms: string[] = manifest.permissions ?? [];

    expect(perms).toContain('storage');
    expect(perms).toContain('activeTab');
    expect(perms).toContain('tabs');
  });
});
