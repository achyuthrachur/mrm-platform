'use client';

import { useState, useMemo } from 'react';
import { DEPENDENCY_NODES, DEPENDENCY_EDGES } from '@/lib/data/dependencies';
import { useFindings } from '@/lib/store/findings-context';
import type { DependencyNode, DependencyEdge } from '@/types';
import Link from 'next/link';

const NODE_POSITIONS: Record<string, { x: number; y: number }> = {
  'n-cecl-001': { x: 100, y: 140 },
  'n-cecl-002': { x: 100, y: 260 },
  'n-cecl-003': { x: 100, y: 380 },
  'n-alm-001': { x: 290, y: 200 },
  'n-ppnr-001': { x: 460, y: 120 },
  'n-liq-001': { x: 290, y: 360 },
  'n-cap-001': { x: 630, y: 200 },
  'n-aml-001': { x: 630, y: 100 },
  'n-aml-002': { x: 460, y: 360 },
  'n-fraud-001': { x: 460, y: 450 },
  'n-fraud-002': { x: 630, y: 360 },
};

const TIER_COLOR: Record<number, string> = {
  1: '#E5376B',
  2: '#F5A800',
  3: '#0075C9',
};

const EDGE_STYLE: Record<string, { dash: string; color: string; label: string }> = {
  feeds: { dash: 'none', color: 'rgba(255,255,255,0.4)', label: 'Feeds' },
  informs: { dash: '6 4', color: 'rgba(245,168,0,0.5)', label: 'Informs' },
  overlaps: { dash: '2 4', color: 'rgba(84,192,232,0.4)', label: 'Overlaps' },
};

interface GraphNodeProps {
  node: DependencyNode;
  pos: { x: number; y: number };
  isSelected: boolean;
  isConnected: boolean;
  hasAlert: boolean;
  onClick: () => void;
}

function GraphNode({ node, pos, isSelected, isConnected, hasAlert, onClick }: GraphNodeProps) {
  const tierColor = TIER_COLOR[node.tier] ?? '#828282';
  const opacity = isSelected || isConnected ? 1 : 0.5;
  const r = 28;

  return (
    <g
      transform={`translate(${pos.x}, ${pos.y})`}
      style={{ cursor: 'pointer', opacity, transition: 'opacity 0.2s' }}
      onClick={onClick}
      role="button"
      aria-label={`${node.label} — Tier ${node.tier}, ${node.risk} Risk`}
      tabIndex={0}
      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onClick()}
    >
      {/* Alert ring */}
      {hasAlert && (
        <circle
          r={r + 6}
          fill="none"
          stroke="#E5376B"
          strokeWidth={2}
          strokeDasharray="4 3"
          opacity={0.8}
        />
      )}

      {/* Selection ring */}
      {isSelected && <circle r={r + 4} fill="none" stroke="#F5A800" strokeWidth={2.5} />}

      {/* Node circle */}
      <circle r={r} fill="#002E62" stroke={tierColor} strokeWidth={2.5} />

      {/* Tier label */}
      <text
        y={5}
        textAnchor="middle"
        fill="white"
        fontSize={12}
        fontWeight={700}
        fontFamily="inherit"
      >
        T{node.tier}
      </text>

      {/* Model name below */}
      <text
        y={r + 14}
        textAnchor="middle"
        fill="rgba(255,255,255,0.8)"
        fontSize={9}
        fontFamily="inherit"
        style={{ pointerEvents: 'none' }}
      >
        {node.label.length > 12 ? node.label.slice(0, 11) + '…' : node.label}
      </text>
    </g>
  );
}

function EdgeLine({ edge }: { edge: DependencyEdge; nodes?: Map<string, DependencyNode> }) {
  const srcPos = NODE_POSITIONS[edge.source];
  const tgtPos = NODE_POSITIONS[edge.target];
  if (!srcPos || !tgtPos) return null;
  const style = EDGE_STYLE[edge.type] ?? EDGE_STYLE.feeds;

  // Offset slightly for parallel edges
  const dx = tgtPos.x - srcPos.x;
  const dy = tgtPos.y - srcPos.y;
  const len = Math.sqrt(dx * dx + dy * dy);
  const nx = (-dy / len) * 4;
  const ny = (dx / len) * 4;

  const x1 = srcPos.x + nx;
  const y1 = srcPos.y + ny;
  const x2 = tgtPos.x + nx;
  const y2 = tgtPos.y + ny;

  // Arrowhead
  const angle = Math.atan2(y2 - y1, x2 - x1);
  const arrowSize = 8;
  const arrowX = x2 - 30 * Math.cos(angle);
  const arrowY = y2 - 30 * Math.sin(angle);

  return (
    <g>
      <line
        x1={x1}
        y1={y1}
        x2={arrowX}
        y2={arrowY}
        stroke={style.color}
        strokeWidth={1.5}
        strokeDasharray={style.dash}
      />
      <polygon
        points={`${arrowX},${arrowY} ${arrowX - arrowSize * Math.cos(angle - 0.4)},${arrowY - arrowSize * Math.sin(angle - 0.4)} ${arrowX - arrowSize * Math.cos(angle + 0.4)},${arrowY - arrowSize * Math.sin(angle + 0.4)}`}
        fill={style.color}
      />
    </g>
  );
}

export function DependencyGraph() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const { findings } = useFindings();

  // Models with open critical/high findings — propagate risk signal
  const modelsWithAlerts = useMemo(() => {
    const set = new Set<string>();
    findings
      .filter((f) => f.status !== 'Closed' && (f.sev === 'Critical' || f.sev === 'High'))
      .forEach((f) => {
        const node = DEPENDENCY_NODES.find((n) => n.modelId === f.modelId);
        if (node) set.add(node.id);
      });
    return set;
  }, [findings]);

  // Propagate: if a node that feeds another has an alert, mark downstream too
  const propagatedAlerts = useMemo(() => {
    const propagated = new Set(modelsWithAlerts);
    let changed = true;
    while (changed) {
      changed = false;
      for (const edge of DEPENDENCY_EDGES) {
        if (propagated.has(edge.source) && !propagated.has(edge.target)) {
          if (edge.type === 'feeds') {
            propagated.add(edge.target);
            changed = true;
          }
        }
      }
    }
    return propagated;
  }, [modelsWithAlerts]);

  // Connected nodes for selected
  const connectedIds = useMemo(() => {
    if (!selectedId) return new Set<string>();
    const set = new Set<string>([selectedId]);
    for (const edge of DEPENDENCY_EDGES) {
      if (edge.source === selectedId) set.add(edge.target);
      if (edge.target === selectedId) set.add(edge.source);
    }
    return set;
  }, [selectedId]);

  const selectedNode = selectedId ? DEPENDENCY_NODES.find((n) => n.id === selectedId) : null;

  const upstreamNodes = selectedId
    ? DEPENDENCY_EDGES.filter((e) => e.target === selectedId)
        .map((e) => DEPENDENCY_NODES.find((n) => n.id === e.source))
        .filter(Boolean)
    : [];

  const downstreamNodes = selectedId
    ? DEPENDENCY_EDGES.filter((e) => e.source === selectedId)
        .map((e) => DEPENDENCY_NODES.find((n) => n.id === e.target))
        .filter(Boolean)
    : [];

  function handleClick(id: string) {
    setSelectedId((prev) => (prev === id ? null : id));
  }

  return (
    <div className="space-y-4">
      <div
        className="relative overflow-hidden rounded-card"
        style={{ backgroundColor: '#011E41', boxShadow: 'var(--shadow-card)' }}
      >
        <svg
          viewBox="0 0 760 500"
          width="100%"
          style={{ display: 'block' }}
          role="img"
          aria-label="Model dependency network graph"
        >
          {/* Edges */}
          {DEPENDENCY_EDGES.map((edge, i) => (
            <EdgeLine key={i} edge={edge} />
          ))}

          {/* Nodes */}
          {DEPENDENCY_NODES.map((node) => {
            const pos = NODE_POSITIONS[node.id];
            if (!pos) return null;
            return (
              <GraphNode
                key={node.id}
                node={node}
                pos={pos}
                isSelected={selectedId === node.id}
                isConnected={selectedId ? connectedIds.has(node.id) : true}
                hasAlert={propagatedAlerts.has(node.id)}
                onClick={() => handleClick(node.id)}
              />
            );
          })}
        </svg>

        {/* Legend */}
        <div
          className="absolute bottom-3 left-3 flex flex-col gap-1 rounded p-2"
          style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
          aria-label="Graph legend"
        >
          {Object.entries(EDGE_STYLE).map(([type, style]) => (
            <div key={type} className="flex items-center gap-2">
              <svg width={24} height={6} aria-hidden="true">
                <line
                  x1={0}
                  y1={3}
                  x2={24}
                  y2={3}
                  stroke={style.color}
                  strokeWidth={1.5}
                  strokeDasharray={style.dash}
                />
              </svg>
              <span style={{ color: style.color, fontSize: 9 }}>{style.label}</span>
            </div>
          ))}
          <div className="mt-1 flex items-center gap-2">
            <svg width={24} height={14} aria-hidden="true">
              <circle
                cx={7}
                cy={7}
                r={6}
                fill="none"
                stroke="#E5376B"
                strokeWidth={1.5}
                strokeDasharray="3 2"
              />
            </svg>
            <span style={{ color: '#E5376B', fontSize: 9 }}>Risk alert</span>
          </div>
        </div>

        {/* Tier key */}
        <div
          className="absolute right-3 top-3 flex flex-col gap-1 rounded p-2"
          style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
        >
          {Object.entries(TIER_COLOR).map(([tier, color]) => (
            <div key={tier} className="flex items-center gap-1.5">
              <div
                className="h-3 w-3 rounded-full"
                style={{ backgroundColor: color }}
                aria-hidden="true"
              />
              <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: 9 }}>Tier {tier}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Selection detail */}
      {selectedNode && (
        <div
          className="rounded-card p-4"
          style={{ backgroundColor: 'var(--surface)', boxShadow: 'var(--shadow-card)' }}
        >
          <div className="mb-3 flex items-start justify-between">
            <div>
              <p className="text-small font-semibold text-ink">{selectedNode.label}</p>
              <p className="text-caption text-ink-muted">
                {selectedNode.modelId} · Tier {selectedNode.tier} · {selectedNode.risk} Risk
              </p>
              <p className="text-caption text-ink-muted">{selectedNode.status}</p>
            </div>
            <Link
              href={`/inventory/${selectedNode.modelId}`}
              className="rounded text-caption text-ink-muted transition-colors hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--ink)]"
            >
              View model →
            </Link>
          </div>

          {propagatedAlerts.has(selectedNode.id) && (
            <p
              className="mb-3 rounded px-2 py-1 text-caption font-medium"
              style={{ backgroundColor: 'var(--status-fail-bg)', color: 'var(--status-fail)' }}
            >
              ⚠ Risk signal — this model or an upstream dependency has open critical/high findings
            </p>
          )}

          <div className="grid grid-cols-2 gap-4">
            {upstreamNodes.length > 0 && (
              <div>
                <p className="mb-1.5 text-caption font-semibold uppercase tracking-wider text-ink-muted">
                  Upstream inputs
                </p>
                <ul className="space-y-1">
                  {upstreamNodes.map(
                    (n) =>
                      n && (
                        <li
                          key={n.id}
                          className="flex items-center gap-1.5 text-small text-ink-secondary"
                        >
                          <span
                            className="h-2 w-2 shrink-0 rounded-full"
                            style={{ backgroundColor: TIER_COLOR[n.tier] }}
                            aria-hidden="true"
                          />
                          {n.label}
                          {propagatedAlerts.has(n.id) && (
                            <span style={{ color: '#E5376B' }} title="Has risk alert">
                              ⚠
                            </span>
                          )}
                        </li>
                      )
                  )}
                </ul>
              </div>
            )}
            {downstreamNodes.length > 0 && (
              <div>
                <p className="mb-1.5 text-caption font-semibold uppercase tracking-wider text-ink-muted">
                  Downstream impacts
                </p>
                <ul className="space-y-1">
                  {downstreamNodes.map(
                    (n) =>
                      n && (
                        <li
                          key={n.id}
                          className="flex items-center gap-1.5 text-small text-ink-secondary"
                        >
                          <span
                            className="h-2 w-2 shrink-0 rounded-full"
                            style={{ backgroundColor: TIER_COLOR[n.tier] }}
                            aria-hidden="true"
                          />
                          {n.label}
                        </li>
                      )
                  )}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}

      {!selectedNode && (
        <p className="text-small text-ink-muted">
          Click a node to trace upstream inputs and downstream impacts.
        </p>
      )}
    </div>
  );
}
