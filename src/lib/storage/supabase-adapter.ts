import type { SupabaseClient } from '@supabase/supabase-js';
import type { StorageAdapter } from '@/types';

/**
 * SupabaseAdapter — implements the StorageAdapter interface against a Supabase `kv_store` table.
 *
 * Schema expected:
 *   kv_store (id BIGSERIAL, org_id TEXT, key TEXT, value JSONB, UNIQUE(org_id, key))
 *
 * Row-level security on kv_store enforces org-scoped access at the database level.
 * App-level scoping (owner sees only their models) is handled by the existing hooks.
 */
export class SupabaseAdapter implements StorageAdapter {
  constructor(
    private readonly sb: SupabaseClient,
    private readonly orgId: string
  ) {}

  async get<T>(key: string): Promise<T | null> {
    const { data, error } = await this.sb
      .from('kv_store')
      .select('value')
      .eq('org_id', this.orgId)
      .eq('key', key)
      .maybeSingle();

    if (error) return null;
    return (data?.value as T) ?? null;
  }

  async set<T>(key: string, value: T): Promise<void> {
    const { error } = await this.sb.from('kv_store').upsert(
      {
        org_id: this.orgId,
        key,
        value,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'org_id,key' }
    );
    if (error) console.error('[SupabaseAdapter.set]', error.message);
  }

  async delete(key: string): Promise<void> {
    const { error } = await this.sb
      .from('kv_store')
      .delete()
      .eq('org_id', this.orgId)
      .eq('key', key);
    if (error) console.error('[SupabaseAdapter.delete]', error.message);
  }

  async list(prefix: string): Promise<string[]> {
    const { data, error } = await this.sb
      .from('kv_store')
      .select('key')
      .eq('org_id', this.orgId)
      .like('key', `${prefix}%`);

    if (error) return [];
    return (data ?? []).map((r) => r.key as string);
  }
}
