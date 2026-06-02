'use client';

import type { StorageAdapter } from '@/types';
import { IndexedDbAdapter } from './indexed-db-adapter';
import { LocalStorageAdapter } from './local-storage-adapter';
import { MemoryAdapter } from './memory-adapter';

let _adapter: StorageAdapter | null = null;

/** Returns the best available storage adapter. Memoized per session. */
export function getStorageAdapter(): StorageAdapter {
  if (_adapter) return _adapter;

  if (typeof window === 'undefined') {
    // SSR — return a no-op in-memory adapter; state is client-side only
    _adapter = new MemoryAdapter();
    return _adapter;
  }

  if (window.indexedDB) {
    _adapter = new IndexedDbAdapter();
  } else {
    _adapter = new LocalStorageAdapter();
  }

  return _adapter;
}

export function resetAdapterCache(): void {
  _adapter = null;
}
