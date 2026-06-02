import { openDB, type IDBPDatabase } from 'idb';
import type { StorageAdapter } from '@/types';

const DB_NAME = 'mrm-platform';
const STORE_NAME = 'kv';
const DB_VERSION = 1;

async function getDB(): Promise<IDBPDatabase> {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    },
  });
}

/**
 * IndexedDB adapter — primary persistence layer.
 * Keys: model:<id>, finding:<id>, run:<id>, freq-approval:<id>,
 *       threshold:<id>, flag:<id>, prefs:<key>
 */
export class IndexedDbAdapter implements StorageAdapter {
  async get<T>(key: string): Promise<T | null> {
    try {
      const db = await getDB();
      const val = await db.get(STORE_NAME, key);
      return (val as T) ?? null;
    } catch {
      return null;
    }
  }

  async set<T>(key: string, value: T): Promise<void> {
    try {
      const db = await getDB();
      await db.put(STORE_NAME, value, key);
    } catch {
      // Silently fail in demo context
    }
  }

  async delete(key: string): Promise<void> {
    try {
      const db = await getDB();
      await db.delete(STORE_NAME, key);
    } catch {
      // Silently fail
    }
  }

  async list(prefix: string): Promise<string[]> {
    try {
      const db = await getDB();
      const allKeys = await db.getAllKeys(STORE_NAME);
      return (allKeys as string[]).filter((k) => k.startsWith(prefix));
    } catch {
      return [];
    }
  }
}
