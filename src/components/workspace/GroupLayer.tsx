import { useMemo, useState, useCallback } from 'react';
import { FiX } from 'react-icons/fi';
import { useWorkspaceStore } from '../../features/workspace/store/workspaceStore';
import { FRAGMENT_COLORS } from '../../features/workspace/types/workspace.types';

const GROUP_PADDING = 20;

/**
 * グループの背景矩形を描画するレイヤー（最背面）。
 * 所属 Fragment の bounding box から自動計算。
 */
export function GroupLayer() {
  const { groups, fragments, updateGroupTitle, dissolveGroup } = useWorkspaceStore();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');

  const groupBounds = useMemo(() => {
    const result: Record<string, { x: number; y: number; w: number; h: number }> = {};

    for (const group of Object.values(groups)) {
      const members = Object.values(fragments).filter(f => f.groupId === group.id);
      if (members.length === 0) continue;

      let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
      for (const m of members) {
        minX = Math.min(minX, m.position.x);
        minY = Math.min(minY, m.position.y);
        maxX = Math.max(maxX, m.position.x + m.size.width);
        maxY = Math.max(maxY, m.position.y + (m.size.height || 100));
      }

      result[group.id] = {
        x: minX - GROUP_PADDING,
        y: minY - GROUP_PADDING - 24, // タイトル分のスペース
        w: maxX - minX + GROUP_PADDING * 2,
        h: maxY - minY + GROUP_PADDING * 2 + 24,
      };
    }
    return result;
  }, [groups, fragments]);

  const handleTitleSubmit = useCallback((groupId: string) => {
    updateGroupTitle(groupId, editTitle);
    setEditingId(null);
  }, [editTitle, updateGroupTitle]);

  return (
    <>
      {Object.values(groups).map(group => {
        const bounds = groupBounds[group.id];
        if (!bounds) return null;

        const colorInfo = FRAGMENT_COLORS.find(c => c.value === group.color) || FRAGMENT_COLORS[1];

        return (
          <div
            key={group.id}
            className={`absolute rounded-xl border-2 border-dashed ${colorInfo.border} pointer-events-none`}
            style={{
              left: bounds.x,
              top: bounds.y,
              width: bounds.w,
              height: bounds.h,
              backgroundColor: `${colorInfo.bg.includes('blue') ? 'rgba(59,130,246,0.06)' : colorInfo.bg.includes('green') ? 'rgba(34,197,94,0.06)' : colorInfo.bg.includes('yellow') ? 'rgba(234,179,8,0.06)' : colorInfo.bg.includes('red') ? 'rgba(239,68,68,0.06)' : colorInfo.bg.includes('purple') ? 'rgba(168,85,247,0.06)' : 'rgba(107,114,128,0.06)'}`,
            }}
          >
            {/* グループタイトル */}
            <div className="absolute top-1 left-2 flex items-center gap-1 pointer-events-auto">
              {editingId === group.id ? (
                <input
                  type="text"
                  value={editTitle}
                  onChange={e => setEditTitle(e.target.value)}
                  onBlur={() => handleTitleSubmit(group.id)}
                  onKeyDown={e => { if (e.key === 'Enter') handleTitleSubmit(group.id); if (e.key === 'Escape') setEditingId(null); }}
                  autoFocus
                  className="px-1.5 py-0.5 text-[11px] font-medium border border-blue-300 rounded bg-white outline-none focus:ring-1 focus:ring-blue-400 w-32"
                  placeholder="グループ名..."
                />
              ) : (
                <button
                  onClick={() => { setEditingId(group.id); setEditTitle(group.title); }}
                  className="px-1.5 py-0.5 text-[11px] font-medium text-gray-600 hover:text-gray-800 rounded hover:bg-white/60 transition-colors"
                >
                  {group.title || 'グループ名を入力...'}
                </button>
              )}
              <button
                onClick={() => dissolveGroup(group.id)}
                className="p-0.5 text-gray-400 hover:text-red-500 transition-colors"
                title="グループ解除"
              >
                <FiX className="w-3 h-3" />
              </button>
            </div>
          </div>
        );
      })}
    </>
  );
}
