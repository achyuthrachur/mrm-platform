'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { getModelsWithFxCounts, saveModel } from '@/lib/repo';
import type { Model } from '@/types';

interface ModelsContextValue {
  models: Model[];
  loading: boolean;
  getModel: (id: string) => Model | null;
  updateModel: (model: Model) => Promise<void>;
  refresh: () => Promise<void>;
}

const ModelsContext = createContext<ModelsContextValue>({
  models: [],
  loading: true,
  getModel: () => null,
  updateModel: async () => {},
  refresh: async () => {},
});

export function ModelsProvider({ children }: { children: React.ReactNode }) {
  const [models, setModels] = useState<Model[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    // Compute openFx dynamically from active findings — never use the stored integer
    const data = await getModelsWithFxCounts();
    setModels(data);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  function getModel(id: string): Model | null {
    return models.find((m) => m.id === id) ?? null;
  }

  async function updateModel(model: Model): Promise<void> {
    await saveModel(model);
    // After any model update, recompute openFx counts
    const refreshed = await getModelsWithFxCounts();
    setModels(refreshed);
  }

  return (
    <ModelsContext.Provider value={{ models, loading, getModel, updateModel, refresh: load }}>
      {children}
    </ModelsContext.Provider>
  );
}

export function useModels(): ModelsContextValue {
  return useContext(ModelsContext);
}
