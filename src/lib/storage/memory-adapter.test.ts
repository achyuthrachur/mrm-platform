import { describe, it, expect, beforeEach } from 'vitest';
import { MemoryAdapter } from './memory-adapter';

describe('MemoryAdapter', () => {
  let adapter: MemoryAdapter;

  beforeEach(() => {
    adapter = new MemoryAdapter();
  });

  it('set and get round-trips values', async () => {
    await adapter.set('model:CECL-2024-001', { id: 'CECL-2024-001', name: 'Test' });
    const result = await adapter.get('model:CECL-2024-001');
    expect(result).toEqual({ id: 'CECL-2024-001', name: 'Test' });
  });

  it('get returns null for unknown keys', async () => {
    expect(await adapter.get('unknown')).toBeNull();
  });

  it('delete removes a key', async () => {
    await adapter.set('finding:MRF-001', { id: 'MRF-001' });
    await adapter.delete('finding:MRF-001');
    expect(await adapter.get('finding:MRF-001')).toBeNull();
  });

  it('list returns keys with matching prefix', async () => {
    await adapter.set('model:A', 'a');
    await adapter.set('model:B', 'b');
    await adapter.set('finding:X', 'x');
    const keys = await adapter.list('model:');
    expect(keys.sort()).toEqual(['model:A', 'model:B']);
  });

  it('clear removes all entries', async () => {
    await adapter.set('k1', 'v1');
    await adapter.set('k2', 'v2');
    adapter.clear();
    expect(await adapter.get('k1')).toBeNull();
  });

  it('stores complex objects', async () => {
    const obj = { id: 'run-001', result: { metrics: [{ label: 'MAPE', value: '17.4%' }] } };
    await adapter.set('run:001', obj);
    expect(await adapter.get('run:001')).toEqual(obj);
  });
});
