'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { getStorageAdapter } from '@/lib/storage/factory';

interface FlagEntry {
  id: string;
  type: 'finding' | 'run';
  flaggedAt: string;
  flaggedBy: string;
}

interface FlagsContextValue {
  flags: FlagEntry[];
  isFlagged: (id: string) => boolean;
  flag: (entry: FlagEntry) => Promise<void>;
  unflag: (id: string) => Promise<void>;
}

const FlagsContext = createContext<FlagsContextValue>({
  flags: [],
  isFlagged: () => false,
  flag: async () => {},
  unflag: async () => {},
});

export function FlagsProvider({ children }: { children: React.ReactNode }) {
  const [flags, setFlags] = useState<FlagEntry[]>([]);

  useEffect(() => {
    async function load() {
      const adapter = getStorageAdapter();
      const keys = await adapter.list('flag:');
      const entries = await Promise.all(keys.map((k) => adapter.get<FlagEntry>(k)));
      setFlags(entries.filter((e): e is FlagEntry => e !== null));
    }
    load();
  }, []);

  function isFlagged(id: string): boolean {
    return flags.some((f) => f.id === id);
  }

  async function flag(entry: FlagEntry): Promise<void> {
    const adapter = getStorageAdapter();
    await adapter.set(`flag:${entry.id}`, entry);
    setFlags((prev) => [...prev.filter((f) => f.id !== entry.id), entry]);
  }

  async function unflag(id: string): Promise<void> {
    const adapter = getStorageAdapter();
    await adapter.delete(`flag:${id}`);
    setFlags((prev) => prev.filter((f) => f.id !== id));
  }

  return (
    <FlagsContext.Provider value={{ flags, isFlagged, flag, unflag }}>
      {children}
    </FlagsContext.Provider>
  );
}

export function useFlags(): FlagsContextValue {
  return useContext(FlagsContext);
}
