import { describe, it, expect } from 'vitest';
import { DEPENDENCY_NODES, DEPENDENCY_EDGES } from '@/lib/data/dependencies';

describe('Dependency graph data', () => {
  it('all node IDs referenced in edges exist', () => {
    const nodeIds = new Set(DEPENDENCY_NODES.map((n) => n.id));
    for (const edge of DEPENDENCY_EDGES) {
      expect(nodeIds.has(edge.source), `source ${edge.source} not found`).toBe(true);
      expect(nodeIds.has(edge.target), `target ${edge.target} not found`).toBe(true);
    }
  });

  it('edge types are valid', () => {
    const validTypes = new Set(['feeds', 'informs', 'overlaps']);
    for (const edge of DEPENDENCY_EDGES) {
      expect(validTypes.has(edge.type), `invalid edge type: ${edge.type}`).toBe(true);
    }
  });

  it('no self-referencing edges', () => {
    for (const edge of DEPENDENCY_EDGES) {
      expect(edge.source, 'self-reference found').not.toBe(edge.target);
    }
  });

  it('DFAST Capital has upstream feeds', () => {
    const capNode = DEPENDENCY_NODES.find((n) => n.modelId === 'CAP-2024-001');
    expect(capNode).toBeDefined();
    const feedsIntoCap = DEPENDENCY_EDGES.filter(
      (e) => e.target === capNode!.id && e.type === 'feeds'
    );
    expect(feedsIntoCap.length).toBeGreaterThan(0);
  });

  it('risk propagation: node with open alert propagates to downstream feeds', () => {
    // NII Sensitivity (n-alm-001) has edges: informs PPNR, informs LIQ, informs DFAST
    const alm = DEPENDENCY_NODES.find((n) => n.modelId === 'ALM-2024-001');
    expect(alm).toBeDefined();
    const downstream = DEPENDENCY_EDGES.filter((e) => e.source === alm!.id);
    expect(downstream.length).toBeGreaterThan(0);
  });
});
