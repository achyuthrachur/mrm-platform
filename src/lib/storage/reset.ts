import { getStorageAdapter } from './factory';

const STORAGE_PREFIXES = [
  'model:',
  'finding:',
  'run:',
  'freq-approval:',
  'threshold:',
  'flag:',
  'prefs:',
];

/**
 * Deletes all app-managed keys from the storage adapter, restoring the demo to its seed state.
 * Does not affect localStorage/IndexedDB keys not written by this app.
 */
export async function resetDemoData(): Promise<void> {
  const adapter = getStorageAdapter();
  for (const prefix of STORAGE_PREFIXES) {
    const keys = await adapter.list(prefix);
    await Promise.all(keys.map((k) => adapter.delete(k)));
  }
}
