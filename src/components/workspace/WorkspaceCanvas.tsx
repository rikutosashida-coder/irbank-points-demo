import { useCallback, useRef, useEffect, useMemo } from 'react';
import { useWorkspaceStore } from '../../features/workspace/store/workspaceStore';
import { FragmentCard } from './FragmentCard';
import { ConnectionLayer } from './ConnectionLayer';
import { GroupLayer } from './GroupLayer';

/**
 * 無限キャンバス。パン＆ズーム対応。
 * Fragment は HTML div、Connection は SVG、Group は背景 div で描画。
 */
export function WorkspaceCanvas() {
  const {
    fragments,
    viewport,
    interaction,
    toolMode,
    selectedFragmentIds,
    hoveredFragmentId,
    setViewport,
    setInteraction,
    createFragment,
    addConnection,
    createGroup,
    clearSelection,
    selectFragment,
  } = useWorkspaceStore();

  const canvasRef = useRef<HTMLDivElement>(null);

  // ── ズーム（ホイール） ──
  const handleWheel = useCallback((e: WheelEvent) => {
    e.preventDefault();
    const delta = -e.deltaY * 0.001;
    const newZoom = Math.max(0.3, Math.min(2.5, viewport.zoom + delta));

    // ズーム中心をカーソル位置にする
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const cx = e.clientX - rect.left;
    const cy = e.clientY - rect.top;

    const scale = newZoom / viewport.zoom;
    const newPanX = cx - (cx - viewport.panX) * scale;
    const newPanY = cy - (cy - viewport.panY) * scale;

    setViewport({ panX: newPanX, panY: newPanY, zoom: newZoom });
  }, [viewport, setViewport]);

  useEffect(() => {
    const el = canvasRef.current;
    if (!el) return;
    el.addEventListener('wheel', handleWheel, { passive: false });
    return () => el.removeEventListener('wheel', handleWheel);
  }, [handleWheel]);

  // ── マウスダウン（パン開始 / 矩形選択 / ドロップ受付） ──
  const handleCanvasMouseDown = useCallback((e: React.MouseEvent) => {
    // 左クリックのみ
    if (e.button !== 0) return;

    if (toolMode === 'pan') {
      setInteraction({
        type: 'panning',
        startX: e.clientX,
        startY: e.clientY,
        startPanX: viewport.panX,
        startPanY: viewport.panY,
      });
      return;
    }

    if (toolMode === 'select') {
      // 空白クリック → 選択解除
      clearSelection();

      // Shift で矩形選択開始
      if (e.shiftKey) {
        const rect = canvasRef.current?.getBoundingClientRect();
        if (!rect) return;
        const x = (e.clientX - rect.left - viewport.panX) / viewport.zoom;
        const y = (e.clientY - rect.top - viewport.panY) / viewport.zoom;
        setInteraction({
          type: 'selecting-rect',
          startX: x,
          startY: y,
          currentX: x,
          currentY: y,
        });
      }
    }
  }, [toolMode, viewport, setInteraction, clearSelection]);

  // ── グローバル mousemove / mouseup ──
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const { interaction } = useWorkspaceStore.getState();

      if (interaction.type === 'panning') {
        const dx = e.clientX - interaction.startX;
        const dy = e.clientY - interaction.startY;
        setViewport({
          panX: interaction.startPanX + dx,
          panY: interaction.startPanY + dy,
        });
        return;
      }

      if (interaction.type === 'connecting') {
        const rect = canvasRef.current?.getBoundingClientRect();
        if (!rect) return;
        setInteraction({
          ...interaction,
          cursorX: (e.clientX - rect.left - viewport.panX) / viewport.zoom,
          cursorY: (e.clientY - rect.top - viewport.panY) / viewport.zoom,
        });
        return;
      }

      if (interaction.type === 'selecting-rect') {
        const rect = canvasRef.current?.getBoundingClientRect();
        if (!rect) return;
        const x = (e.clientX - rect.left - viewport.panX) / viewport.zoom;
        const y = (e.clientY - rect.top - viewport.panY) / viewport.zoom;
        setInteraction({ ...interaction, currentX: x, currentY: y });
        return;
      }
    };

    const handleMouseUp = (e: MouseEvent) => {
      const store = useWorkspaceStore.getState();
      const { interaction } = store;

      if (interaction.type === 'panning') {
        setInteraction({ type: 'idle' });
        return;
      }

      if (interaction.type === 'connecting') {
        // カーソル位置のカードを探す
        const rect = canvasRef.current?.getBoundingClientRect();
        if (rect) {
          const worldX = (e.clientX - rect.left - viewport.panX) / viewport.zoom;
          const worldY = (e.clientY - rect.top - viewport.panY) / viewport.zoom;

          const target = Object.values(store.fragments).find(f =>
            f.id !== interaction.fromFragmentId &&
            worldX >= f.position.x && worldX <= f.position.x + f.size.width &&
            worldY >= f.position.y && worldY <= f.position.y + (f.size.height || 100)
          );

          if (target) {
            addConnection(interaction.fromFragmentId, target.id);
          }
        }
        setInteraction({ type: 'idle' });
        return;
      }

      if (interaction.type === 'selecting-rect') {
        // 矩形内の Fragment を選択
        const minX = Math.min(interaction.startX, interaction.currentX);
        const minY = Math.min(interaction.startY, interaction.currentY);
        const maxX = Math.max(interaction.startX, interaction.currentX);
        const maxY = Math.max(interaction.startY, interaction.currentY);

        Object.values(store.fragments).forEach(f => {
          const fx = f.position.x;
          const fy = f.position.y;
          const fw = f.size.width;
          const fh = f.size.height || 100;
          if (fx + fw > minX && fx < maxX && fy + fh > minY && fy < maxY) {
            selectFragment(f.id, true);
          }
        });

        setInteraction({ type: 'idle' });
        return;
      }

      if (interaction.type === 'extracting') {
        // ワークスペース上にドロップ
        const rect = canvasRef.current?.getBoundingClientRect();
        if (rect) {
          const worldX = (e.clientX - rect.left - viewport.panX) / viewport.zoom;
          const worldY = (e.clientY - rect.top - viewport.panY) / viewport.zoom;

          createFragment({
            sourceRef: interaction.sourceRef,
            excerptText: interaction.excerptText,
            position: { x: worldX - 120, y: worldY - 40 },
          });
        }
        setInteraction({ type: 'idle' });
        return;
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [viewport, setViewport, setInteraction, createFragment, addConnection, selectFragment]);

  // ── キーボードショートカット ──
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA') return;
        const store = useWorkspaceStore.getState();
        store.selectedFragmentIds.forEach(id => store.removeFragment(id));
        store.clearSelection();
      }

      // Ctrl+G: グループ化
      if ((e.ctrlKey || e.metaKey) && e.key === 'g') {
        e.preventDefault();
        const store = useWorkspaceStore.getState();
        if (store.selectedFragmentIds.size >= 2) {
          createGroup(Array.from(store.selectedFragmentIds));
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [createGroup]);

  // ── 矩形選択ボックスの描画 ──
  const selectionRect = useMemo(() => {
    if (interaction.type !== 'selecting-rect') return null;
    return {
      x: Math.min(interaction.startX, interaction.currentX),
      y: Math.min(interaction.startY, interaction.currentY),
      w: Math.abs(interaction.currentX - interaction.startX),
      h: Math.abs(interaction.currentY - interaction.startY),
    };
  }, [interaction]);

  const fragmentList = useMemo(() => Object.values(fragments), [fragments]);

  const cursorClass = toolMode === 'pan'
    ? (interaction.type === 'panning' ? 'cursor-grabbing' : 'cursor-grab')
    : interaction.type === 'connecting'
      ? 'cursor-crosshair'
      : interaction.type === 'extracting'
        ? 'cursor-copy'
        : 'cursor-default';

  return (
    <div
      ref={canvasRef}
      className={`relative w-full h-full overflow-hidden bg-gray-100 ${cursorClass}`}
      onMouseDown={handleCanvasMouseDown}
    >
      {/* ドットグリッド背景 */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 0 }}>
        <defs>
          <pattern
            id="dot-grid"
            x={viewport.panX % (16 * viewport.zoom)}
            y={viewport.panY % (16 * viewport.zoom)}
            width={16 * viewport.zoom}
            height={16 * viewport.zoom}
            patternUnits="userSpaceOnUse"
          >
            <circle cx={1} cy={1} r={0.8} fill="#d1d5db" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#dot-grid)" />
      </svg>

      {/* ワールド座標変換コンテナ */}
      <div
        className="absolute origin-top-left"
        style={{
          transform: `translate(${viewport.panX}px, ${viewport.panY}px) scale(${viewport.zoom})`,
          transformOrigin: '0 0',
        }}
      >
        {/* グループ背景 */}
        <GroupLayer />

        {/* 接続線 */}
        <ConnectionLayer />

        {/* 断片カード */}
        {fragmentList.map(frag => (
          <FragmentCard
            key={frag.id}
            fragment={frag}
            isSelected={selectedFragmentIds.has(frag.id)}
            isHovered={hoveredFragmentId === frag.id}
            zoom={viewport.zoom}
          />
        ))}

        {/* 矩形選択ボックス */}
        {selectionRect && (
          <div
            className="absolute border-2 border-blue-400 bg-blue-400/10 rounded pointer-events-none"
            style={{
              left: selectionRect.x,
              top: selectionRect.y,
              width: selectionRect.w,
              height: selectionRect.h,
            }}
          />
        )}
      </div>

      {/* 抽出中プレビュー */}
      {interaction.type === 'extracting' && (
        <div className="fixed pointer-events-none z-50 opacity-80 max-w-[200px] bg-blue-50 border border-blue-300 rounded-lg px-2.5 py-2 shadow-xl text-xs text-blue-800 truncate"
          style={{ left: 'var(--mouse-x, 50%)', top: 'var(--mouse-y, 50%)', transform: 'translate(10px, -50%)' }}
        >
          {interaction.excerptText.slice(0, 60)}{interaction.excerptText.length > 60 ? '...' : ''}
        </div>
      )}

      {/* ツールバーのヒント */}
      {fragmentList.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-center text-gray-400">
            <p className="text-sm font-medium">ワークスペース</p>
            <p className="text-xs mt-1">左のソースからテキストを切り出して配置</p>
          </div>
        </div>
      )}

      {/* ステータス */}
      <div className="absolute bottom-2 right-2 flex items-center gap-3 px-2 py-1 bg-white/80 rounded text-[10px] text-gray-500 backdrop-blur">
        <span>{Math.round(viewport.zoom * 100)}%</span>
        <span>断片: {fragmentList.length}</span>
      </div>
    </div>
  );
}
