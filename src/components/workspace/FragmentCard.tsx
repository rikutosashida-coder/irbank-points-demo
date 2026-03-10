import { useState, useRef, useCallback, useEffect } from 'react';
import { FiMove, FiTrash2, FiEdit3 } from 'react-icons/fi';
import { useWorkspaceStore } from '../../features/workspace/store/workspaceStore';
import { FRAGMENT_COLORS } from '../../features/workspace/types/workspace.types';
import type { Fragment, FragmentColor } from '../../features/workspace/types/workspace.types';

interface FragmentCardProps {
  fragment: Fragment;
  isSelected: boolean;
  isHovered: boolean;
  zoom: number;
}

export function FragmentCard({ fragment, isSelected, isHovered, zoom }: FragmentCardProps) {
  const {
    moveFragment,
    removeFragment,
    updateFragmentNote,
    updateFragmentColor,
    selectFragment,
    setHoveredFragment,
    setInteraction,
    interaction,
    toolMode,
    _persistFragments,
  } = useWorkspaceStore();

  const [isEditingNote, setIsEditingNote] = useState(false);
  const [noteText, setNoteText] = useState(fragment.userNote);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const noteInputRef = useRef<HTMLTextAreaElement>(null);
  const persistTimer = useRef<NodeJS.Timeout | undefined>(undefined);

  useEffect(() => {
    setNoteText(fragment.userNote);
  }, [fragment.userNote]);

  useEffect(() => {
    if (isEditingNote && noteInputRef.current) {
      noteInputRef.current.focus();
    }
  }, [isEditingNote]);

  const colorInfo = FRAGMENT_COLORS.find(c => c.value === fragment.color) || FRAGMENT_COLORS[0];

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (toolMode === 'connect') {
      // 接続モード: 接続開始
      e.stopPropagation();
      setInteraction({
        type: 'connecting',
        fromFragmentId: fragment.id,
        cursorX: e.clientX,
        cursorY: e.clientY,
      });
      return;
    }

    // 選択モード: ドラッグ開始
    e.stopPropagation();
    selectFragment(fragment.id, e.shiftKey);
    setInteraction({
      type: 'dragging-fragment',
      fragmentId: fragment.id,
      offsetX: e.clientX / zoom - fragment.position.x,
      offsetY: e.clientY / zoom - fragment.position.y,
    });
  }, [fragment.id, fragment.position, toolMode, zoom, selectFragment, setInteraction]);

  const handleMouseUp = useCallback(() => {
    if (interaction.type === 'dragging-fragment') {
      setInteraction({ type: 'idle' });
      // debounced persist
      clearTimeout(persistTimer.current);
      persistTimer.current = setTimeout(() => _persistFragments(), 500);
    }
  }, [interaction, setInteraction, _persistFragments]);

  useEffect(() => {
    if (interaction.type === 'dragging-fragment' && interaction.fragmentId === fragment.id) {
      const handleMove = (e: MouseEvent) => {
        const newX = e.clientX / zoom - interaction.offsetX;
        const newY = e.clientY / zoom - interaction.offsetY;
        moveFragment(fragment.id, { x: newX, y: newY });
      };
      const handleUp = () => {
        setInteraction({ type: 'idle' });
        clearTimeout(persistTimer.current);
        persistTimer.current = setTimeout(() => _persistFragments(), 500);
      };
      window.addEventListener('mousemove', handleMove);
      window.addEventListener('mouseup', handleUp);
      return () => {
        window.removeEventListener('mousemove', handleMove);
        window.removeEventListener('mouseup', handleUp);
      };
    }
  }, [interaction, fragment.id, zoom, moveFragment, setInteraction, _persistFragments]);

  const handleNoteBlur = useCallback(() => {
    setIsEditingNote(false);
    if (noteText !== fragment.userNote) {
      updateFragmentNote(fragment.id, noteText);
      clearTimeout(persistTimer.current);
      persistTimer.current = setTimeout(() => _persistFragments(), 300);
    }
  }, [noteText, fragment.id, fragment.userNote, updateFragmentNote, _persistFragments]);

  const handleColorChange = useCallback((color: FragmentColor) => {
    updateFragmentColor(fragment.id, color);
    setShowColorPicker(false);
    clearTimeout(persistTimer.current);
    persistTimer.current = setTimeout(() => _persistFragments(), 300);
  }, [fragment.id, updateFragmentColor, _persistFragments]);

  const isDragging = interaction.type === 'dragging-fragment' && interaction.fragmentId === fragment.id;

  return (
    <div
      ref={cardRef}
      className={`absolute rounded-lg border shadow-sm transition-shadow duration-150 select-none
        ${colorInfo.bg} ${colorInfo.border}
        ${isSelected ? 'ring-2 ring-blue-500 shadow-lg' : ''}
        ${isHovered ? 'ring-1 ring-blue-300' : ''}
        ${isDragging ? 'shadow-xl opacity-90 cursor-grabbing' : 'cursor-grab'}
      `}
      style={{
        left: fragment.position.x,
        top: fragment.position.y,
        width: fragment.size.width,
        minHeight: 80,
        zIndex: isDragging ? 9999 : isSelected ? 100 : 10,
      }}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseEnter={() => setHoveredFragment(fragment.id)}
      onMouseLeave={() => setHoveredFragment(null)}
    >
      {/* ヘッダー */}
      <div className="flex items-center gap-1 px-2 py-1.5 border-b border-gray-200/60">
        <FiMove className="w-3 h-3 text-gray-400 flex-shrink-0" />
        <div className="flex-1" />

        {/* 色変更 */}
        <div className="relative">
          <button
            onClick={(e) => { e.stopPropagation(); setShowColorPicker(!showColorPicker); }}
            className={`w-3.5 h-3.5 rounded-full border border-gray-300 ${colorInfo.bg}`}
          />
          {showColorPicker && (
            <div className="absolute right-0 top-5 z-50 bg-white rounded-lg shadow-xl border p-1.5 flex gap-1">
              {FRAGMENT_COLORS.map(c => (
                <button
                  key={c.value}
                  onClick={(e) => { e.stopPropagation(); handleColorChange(c.value); }}
                  className={`w-5 h-5 rounded-full border-2 ${c.bg} ${fragment.color === c.value ? 'border-gray-600' : 'border-transparent'} hover:scale-110 transition-transform`}
                  title={c.label}
                />
              ))}
            </div>
          )}
        </div>

        {/* 削除 */}
        <button
          onClick={(e) => { e.stopPropagation(); removeFragment(fragment.id); }}
          className="p-0.5 text-gray-400 hover:text-red-500 transition-colors"
        >
          <FiTrash2 className="w-3 h-3" />
        </button>
      </div>

      {/* 引用テキスト */}
      <div className="px-2.5 py-2 text-xs text-gray-700 italic leading-relaxed border-b border-dashed border-gray-200/60 max-h-24 overflow-y-auto">
        {fragment.excerptText}
      </div>

      {/* ユーザーメモ */}
      <div className="px-2.5 py-1.5 min-h-[32px]">
        {isEditingNote ? (
          <textarea
            ref={noteInputRef}
            value={noteText}
            onChange={e => setNoteText(e.target.value)}
            onBlur={handleNoteBlur}
            onKeyDown={e => { if (e.key === 'Escape') handleNoteBlur(); }}
            onClick={e => e.stopPropagation()}
            onMouseDown={e => e.stopPropagation()}
            className="w-full text-xs bg-transparent border-none outline-none resize-none text-gray-800 placeholder-gray-400"
            placeholder="メモを入力..."
            rows={2}
          />
        ) : (
          <div
            className="flex items-start gap-1 cursor-text min-h-[24px]"
            onClick={(e) => { e.stopPropagation(); setIsEditingNote(true); }}
          >
            {fragment.userNote ? (
              <span className="text-xs text-gray-800 whitespace-pre-wrap">{fragment.userNote}</span>
            ) : (
              <span className="text-xs text-gray-400 flex items-center gap-1">
                <FiEdit3 className="w-3 h-3" />
                メモを追加...
              </span>
            )}
          </div>
        )}
      </div>

      {/* コネクションポート（ホバー時のみ表示） */}
      {(isHovered || isSelected) && toolMode === 'connect' && (
        <>
          <div className="absolute -left-1.5 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-blue-500 border-2 border-white shadow cursor-crosshair" />
          <div className="absolute -right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-blue-500 border-2 border-white shadow cursor-crosshair" />
          <div className="absolute left-1/2 -translate-x-1/2 -top-1.5 w-3 h-3 rounded-full bg-blue-500 border-2 border-white shadow cursor-crosshair" />
          <div className="absolute left-1/2 -translate-x-1/2 -bottom-1.5 w-3 h-3 rounded-full bg-blue-500 border-2 border-white shadow cursor-crosshair" />
        </>
      )}
    </div>
  );
}
