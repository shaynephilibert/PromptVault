import { describe, it, expect } from 'vitest';
import { encrypt, decrypt } from '../src/lib/encryption';

describe('encryption', () => {
  it('round-trips data with correct password', () => {
    const data = 'hello world';
    const password = 'secret123';
    const encrypted = encrypt(data, password);
    const decrypted = decrypt(encrypted, password);
    expect(decrypted).toBe(data);
  });

  it('returns null with wrong password', () => {
    const encrypted = encrypt('sensitive data', 'correct-password');
    const result = decrypt(encrypted, 'wrong-password');
    expect(result).toBeNull();
  });

  it('empty string encrypts but decrypts as null (CryptoJS treats empty as falsy)', () => {
    const encrypted = encrypt('', 'pw');
    const decrypted = decrypt(encrypted, 'pw');
    // CryptoJS returns empty string from toString(Utf8), which decrypt treats as null
    expect(decrypted).toBeNull();
  });

  it('produces different ciphertext each time (random IV)', () => {
    const data = 'same input';
    const pw = 'same-password';
    const a = encrypt(data, pw);
    const b = encrypt(data, pw);
    expect(a).not.toBe(b);
  });

  it('handles JSON round-trip (vault-like data)', () => {
    const vault = { prompts: [{ id: '1', title: 'test' }], categories: ['General'] };
    const json = JSON.stringify(vault);
    const encrypted = encrypt(json, 'vault-pw');
    const decrypted = decrypt(encrypted, 'vault-pw');
    expect(JSON.parse(decrypted!)).toEqual(vault);
  });
});
