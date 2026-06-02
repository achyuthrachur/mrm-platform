import type { StorageAdapter } from '@/types';

/**
 * localStorage adapter — fallback when IndexedDB is unavailable.
 * Keys are prefixed with 'mrm:' to avoid collisions.
 */
export class LocalStorageAdapter implements StorageAdapter {
  private prefix = 'mrm:';

  async get<T>(key: string): Promise<T | null> {
    try {
      const raw = localStorage.getItem(this.prefix + key);
      return raw ? (JSON.parse(raw) as T) : null;
    } catch {
      return null;
    }
  }

  async set<T>(key: string, value: T): Promise<void> {
    try {
      localStorage.setItem(this.prefix + key, JSON.stringify(value));
    } catch {
      // Storage quota exceeded — silently fail in demo context
    }
  }

  async delete(key: string): Promise<void> {
    localStorage.removeItem(this.prefix + key);
  }

  async list(prefix: string): Promise<string[]> {
    const fullPrefix = this.prefix + prefix;
    const keys: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k?.startsWith(fullPrefix)) {
        keys.push(k.slice(this.prefix.length));
      }
    }
    return keys;
  }
}
