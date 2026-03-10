import { useMemo, useState, useCallback } from 'react';
import { useWorkspaceStore } from '../../features/workspace/store/workspaceStore';
import type { Connection } from '../../features/workspace/types/workspace.types';

interface LineData {
  conn: Connection;
  fromCx: number; fromCy: number;
  toCx: number; toCy: number;
  c1x: number; c1y: number;
  c2x: number; c2y: number;
  midX: number; midY: number;
}

/**
 * 2つの Fragment 間のベジェ曲線を SVG で描画するレイヤー。
 * WorkspaceCanvas のワールド座標系に配置される。
 */
export function ConnectionLayer() {
  const { fragments, connections, interaction, removeConnection, updateConnectionLabel } = useWorkspaceStore();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editLabel, setEditLabel] = useState('');
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const lines = useMemo<LineData[]>(() => {
    const result: LineData[] = [];
    for (const conn of Object.values(connections)) {
      const from = fragments[conn.fromFragmentId];
      const to = fragments[conn.toFragmentId];
      if (!from || !to) continue;

      const fromCx = from.position.x + from.size.width / 2;
      const fromCy = from.position.y + (from.size.height || 100) / 2;
      const toCx = to.position.x + to.size.width / 2;
      const toCy = to.position.y + (to.size.height || 100) / 2;

      const dx = Math.abs(toCx - fromCx) * 0.4;
      const c1x = fromCx + dx;
      const c1y = fromCy;
      const c2x = toCx - dx;
      const c2y = toCy;

      const midX = (fromCx + toCx) / 2;
      const midY = (fromCy + toCy) / 2;

      result.push({ conn, fromCx, fromCy, toCx, toCy, c1x, c1y, c2x, c2y, midX, midY });
    }
    return result;
  }, [connections, fragments]);

  // 接続中のプレビュー線
  const connectingLine = useMemo(() => {
    if (interaction.type !== 'connecting') return null;
    const from = fragments[interaction.fromFragmentId];
    if (!from) return null;
    const fromCx = from.position.x + from.size.width / 2;
    const fromCy = from.position.y + (from.size.height || 100) / 2;
    return { fromCx, fromCy, toCx: interaction.cursorX, toCy: interaction.cursorY };
  }, [interaction, fragments]);

  const handleLabelSubmit = useCallback((connId: string) => {
    updateConnectionLabel(connId, editLabel);
    setEditingId(null);
  }, [editLabel, updateConnectionLabel]);

  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ overflow: 'visible' }}>
      {lines.map(({ conn, fromCx, fromCy, toCx, toCy, c1x, c1y, c2x, c2y, midX, midY }) => (
        <g key={conn.id}>
          {/* ヒットエリア（太い透明線） */}
          <path
            d={`M ${fromCx} ${fromCy} C ${c1x} ${c1y}, ${c2x} ${c2y}, ${toCx} ${toCy}`}
            fill="none"
            stroke="transparent"
            strokeWidth={16}
            className="pointer-events-auto cursor-pointer"
            onMouseEnter={() => setHoveredId(conn.id)}
            onMouseLeave={() => setHoveredId(null)}
            onContextMenu={(e) => {
              e.preventDefault();
              removeConnection(conn.id);
            }}
            onDoubleClick={(e) => {
              e.stopPropagation();
              setEditingId(conn.id);
              setEditLabel(conn.label);
            }}
          />
          {/* 実際の線 */}
          <path
            d={`M ${fromCx} ${fromCy} C ${c1x} ${c1y}, ${c2x} ${c2y}, ${toCx} ${toCy}`}
            fill="none"
            stroke={hoveredId === conn.id ? '#3b82f6' : '#94a3b8'}
            strokeWidth={hoveredId === conn.id ? 2.5 : 1.5}
            strokeDasharray={conn.style === 'dashed' ? '6 4' : undefined}
            className="transition-all duration-150"
          />
          {/* ラベル */}
          {conn.label && editingId !== conn.id && (
            <g transform={`translate(${midX}, ${midY})`}>
              <rect
                x={-conn.label.length * 5 - 8}
                y={-10}
                width={conn.label.length * 10 + 16}
                height={20}
                rx={4}
                fill="white"
                stroke="#e2e8f0"
                strokeWidth={1}
                className="pointer-events-auto cursor-pointer"
                onDoubleClick={(e) => {
                  e.stopPropagation();
                  setEditingId(conn.id);
                  setEditLabel(conn.label);
                }}
              />
              <text
                textAnchor="middle"
                dominantBaseline="central"
                className="text-[10px] fill-gray-600 pointer-events-none"
              >
                {conn.label}
              </text>
            </g>
          )}
        </g>
      ))}

      {/* 接続中プレビュー */}
      {connectingLine && (
        <line
          x1={connectingLine.fromCx}
          y1={connectingLine.fromCy}
          x2={connectingLine.toCx}
          y2={connectingLine.toCy}
          stroke="#3b82f6"
          strokeWidth={2}
          strokeDasharray="6 4"
          className="pointer-events-none"
        />
      )}

      {/* ラベル編集 foreignObject */}
      {editingId && (() => {
        const line = lines.find(l => l.conn.id === editingId);
        if (!line) return null;
        return (
          <foreignObject
            x={line.midX - 60}
            y={line.midY - 14}
            width={120}
            height={28}
            className="pointer-events-auto"
          >
            <input
              type="text"
              value={editLabel}
              onChange={e => setEditLabel(e.target.value)}
              onBlur={() => handleLabelSubmit(editingId)}
              onKeyDown={e => { if (e.key === 'Enter') handleLabelSubmit(editingId); if (e.key === 'Escape') setEditingId(null); }}
              autoFocus
              className="w-full h-full px-2 text-[10px] border border-blue-300 rounded bg-white text-center outline-none focus:ring-1 focus:ring-blue-400"
              placeholder="ラベル..."
            />
          </foreignObject>
        );
      })()}
    </svg>
  );
}
