'use client';

import type { StorageAdapter } from '@/types';
import type { SupabaseClient } from '@supabase/supabase-js';
import { IndexedDbAdapter } from './indexed-db-adapter';
import { LocalStorageAdapter } from './local-storage-adapter';
import { MemoryAdapter } from './memory-adapter';
import { SupabaseAdapter } from './supabase-adapter';

let _adapter: StorageAdapter | null = null;

/**
 * Returns the best available storage adapter.
 *
 * Priority:
 *   1. SupabaseAdapter — when a Supabase client + org ID are provided (real session)
 *   2. IndexedDbAdapter — primary local persistence (offline / no Supabase)
 *   3. LocalStorageAdapter — fallback when IndexedDB unavailable
 *   4. MemoryAdapter — SSR-only (no persistence)
 */
export function getStorageAdapter(
  supabase?: SupabaseClient | null,
  orgId?: string | null
): StorageAdapter {
  if (supabase && orgId) {
    // Supabase session available — use cloud persistence
    return new SupabaseAdapter(supabase, orgId);
  }

  if (_adapter) return _adapter;

  if (typeof window === 'undefined') {
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
