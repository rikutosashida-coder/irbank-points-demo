import { useState, useRef, useCallback, useEffect } from 'react';
import { FiX, FiMaximize2, FiMinimize2, FiExternalLink, FiEdit3, FiCheckSquare } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { useNotesStore } from '../../features/notes/store/notesStore';
import { BlockEditor } from '../editor/BlockEditor';
import { AnalysisItemsList } from '../note/AnalysisItemsList';
import { AnalysisItem } from '../../features/notes/types/note.types';

interface FloatingNotePanelProps {
  noteId: string;
  onClose: () => void;
}

const MIN_WIDTH = 400;
const MIN_HEIGHT = 300;
const DEFAULT_WIDTH = 560;
const DEFAULT_HEIGHT = 520;

export function FloatingNotePanel({ noteId, onClose }: FloatingNotePanelProps) {
  const navigate = useNavigate();
  const { getNoteById, updateNote } = useNotesStore();
  const note = getNoteById(noteId);

  const panelRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: window.innerWidth - DEFAULT_WIDTH - 32, y: 80 });
  const [size, setSize] = useState({ w: DEFAULT_WIDTH, h: DEFAULT_HEIGHT });
  const [isMaximized, setIsMaximized] = useState(false);
  const [preMaxState, setPreMaxState] = useState({ x: 0, y: 0, w: DEFAULT_WIDTH, h: DEFAULT_HEIGHT });

  // ドラッグ状態
  const dragState = useRef<{ dragging: boolean; startX: number; startY: number; origX: number; origY: number }>({
    dragging: false, startX: 0, startY: 0, origX: 0, origY: 0,
  });

  // リサイズ状態
  const resizeState = useRef<{ resizing: boolean; startX: number; startY: number; origW: number; origH: number; origX: number; origY: number; direction: string }>({
    resizing: false, startX: 0, startY: 0, origW: 0, origH: 0, origX: 0, origY: 0, direction: '',
  });

  const [title, setTitle] = useState(note?.title || '');
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'editor' | 'analysis'>('editor');

  // 外部からのコンテンツ変更を検知してエディタを再マウントする仕組み
  const [editorKey, setEditorKey] = useState(0);
  const isInternalUpdate = useRef(false);
  const prevUpdatedTime = useRef(note ? new Date(note.updatedAt).getTime() : 0);

  useEffect(() => {
    if (note) setTitle(note.title);
  }, [note]);

  // ストアの note.updatedAt が変わったとき、エディタ自身の変更でなければ再マウント
  useEffect(() => {
    if (!note) return;
    const t = new Date(note.updatedAt).getTime();
    if (t !== prevUpdatedTime.current) {
      if (!isInternalUpdate.current) {
        // 外部変更（InsertToNoteDialog等）→ エディタ再マウント
        setEditorKey((k) => k + 1);
      }
      prevUpdatedTime.current = t;
    }
  }, [note]);

  // ===== ドラッグ =====
  const onDragStart = useCallback((e: React.MouseEvent) => {
    if (isMaximized) return;
    e.preventDefault();
    dragState.current = { dragging: true, startX: e.clientX, startY: e.clientY, origX: position.x, origY: position.y };
  }, [position, isMaximized]);

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      const ds = dragState.current;
      if (ds.dragging) {
        const dx = e.clientX - ds.startX;
        const dy = e.clientY - ds.startY;
        setPosition({ x: ds.origX + dx, y: Math.max(0, ds.origY + dy) });
      }
      const rs = resizeState.current;
      if (rs.resizing) {
        const dx = e.clientX - rs.startX;
        const dy = e.clientY - rs.startY;
        const dir = rs.direction;

        let newW = rs.origW;
        let newH = rs.origH;
        let newX = rs.origX;
        let newY = rs.origY;

        if (dir.includes('e')) newW = Math.max(MIN_WIDTH, rs.origW + dx);
        if (dir.includes('w')) { newW = Math.max(MIN_WIDTH, rs.origW - dx); newX = rs.origX + (rs.origW - newW); }
        if (dir.includes('s')) newH = Math.max(MIN_HEIGHT, rs.origH + dy);
        if (dir.includes('n')) { newH = Math.max(MIN_HEIGHT, rs.origH - dy); newY = Math.max(0, rs.origY + (rs.origH - newH)); }

        setSize({ w: newW, h: newH });
        setPosition({ x: newX, y: newY });
      }
    };
    const onMouseUp = () => {
      dragState.current.dragging = false;
      resizeState.current.resizing = false;
    };
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, []);

  // ===== リサイズ =====
  const onResizeStart = useCallback((direction: string) => (e: React.MouseEvent) => {
    if (isMaximized) return;
    e.preventDefault();
    e.stopPropagation();
    resizeState.current = {
      resizing: true,
      startX: e.clientX, startY: e.clientY,
      origW: size.w, origH: size.h,
      origX: position.x, origY: position.y,
      direction,
    };
  }, [size, position, isMaximized]);

  // ===== 最大化 =====
  const toggleMaximize = () => {
    if (isMaximized) {
      setPosition({ x: preMaxState.x, y: preMaxState.y });
      setSize({ w: preMaxState.w, h: preMaxState.h });
      setIsMaximized(false);
    } else {
      setPreMaxState({ x: position.x, y: position.y, w: size.w, h: size.h });
      setPosition({ x: 16, y: 16 });
      setSize({ w: window.innerWidth - 32, h: window.innerHeight - 32 });
      setIsMaximized(true);
    }
  };

  // ===== ノート保存 =====
  const handleTitleChange = async (newTitle: string) => {
    setTitle(newTitle);
    setIsSaving(true);
    try { await updateNote(noteId, { title: newTitle }); } finally { setIsSaving(false); }
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleContentChange = async (content: any[]) => {
    isInternalUpdate.current = true;
    setIsSaving(true);
    try {
      await updateNote(noteId, { content });
    } finally {
      setIsSaving(false);
      // フラグを少し遅らせてリセット（ストア更新の伝搬を待つ）
      setTimeout(() => { isInternalUpdate.current = false; }, 300);
    }
  };

  const handleUpdateAnalysisItems = async (items: AnalysisItem[]) => {
    setIsSaving(true);
    try {
      await updateNote(noteId, { analysisItems: items });
    } finally {
      setIsSaving(false);
    }
  };

  const handleOpenFull = () => {
    navigate(`/mypage/note/${noteId}`);
    onClose();
  };

  if (!note) return null;

  const panelStyle = {
    left: position.x,
    top: position.y,
    width: size.w,
    height: size.h,
  };

  return (
    <div
      ref={panelRef}
      style={panelStyle}
      className="fixed z-50 flex flex-col bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden"
    >
      {/* ===== Title Bar ===== */}
      <div
        onMouseDown={onDragStart}
        className="flex items-center justify-between px-3 py-2 bg-gray-50 border-b border-gray-200 cursor-move select-none flex-shrink-0"
      >
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <span className="w-2 h-2 rounded-full bg-primary-400 flex-shrink-0" />
          <span className="text-sm font-medium text-gray-700 truncate">
            {title || '無題のノート'}
          </span>
          {isSaving && <span className="text-xs text-gray-400 flex-shrink-0">保存中...</span>}
        </div>
        <div className="flex items-center gap-0.5 flex-shrink-0 ml-2">
          <button
            onClick={handleOpenFull}
            className="p-1.5 text-gray-400 hover:text-primary-600 hover:bg-gray-100 rounded transition-colors"
            title="ノートをフルで開く"
          >
            <FiExternalLink className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={toggleMaximize}
            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"
            title={isMaximized ? '元のサイズに戻す' : '最大化'}
          >
            {isMaximized ? <FiMinimize2 className="w-3.5 h-3.5" /> : <FiMaximize2 className="w-3.5 h-3.5" />}
          </button>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
            title="閉じる"
          >
            <FiX className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* ===== Tab Bar ===== */}
      <div className="flex items-center border-b border-gray-200 px-3 flex-shrink-0">
        <button
          onClick={() => setActiveTab('editor')}
          className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'editor'
              ? 'border-primary-600 text-primary-700'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <FiEdit3 className="w-3.5 h-3.5" />
          エディタ
        </button>
        <button
          onClick={() => setActiveTab('analysis')}
          className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'analysis'
              ? 'border-primary-600 text-primary-700'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <FiCheckSquare className="w-3.5 h-3.5" />
          分析項目
          {note.analysisItems.length > 0 && (
            <span className={`ml-1 px-1.5 py-0.5 text-xs rounded-full ${
              activeTab === 'analysis'
                ? 'bg-primary-100 text-primary-700'
                : 'bg-gray-100 text-gray-600'
            }`}>
              {note.analysisItems.length}
            </span>
          )}
        </button>
      </div>

      {/* ===== Content ===== */}
      <div className="flex-1 overflow-auto p-4">
        {/* Title input */}
        <input
          type="text"
          value={title}
          onChange={(e) => handleTitleChange(e.target.value)}
          placeholder="ノートのタイトル"
          className="w-full text-xl font-bold border-none outline-none mb-4 placeholder-gray-300 bg-transparent"
        />

        {/* Tags preview */}
        {note.anchorTags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {note.anchorTags.map((tag) => (
              <span key={tag.id} className="px-2 py-0.5 text-xs rounded-full bg-blue-100 text-blue-700">
                {tag.stockName || tag.industryName || tag.themeName}
                {tag.stockCode && ` (${tag.stockCode})`}
              </span>
            ))}
          </div>
        )}

        {activeTab === 'editor' ? (
          /* Block Editor */
          <div className="prose max-w-none">
            <BlockEditor
              key={editorKey}
              initialContent={note.content}
              onChange={handleContentChange}
            />
          </div>
        ) : (
          /* Analysis Items */
          <AnalysisItemsList
            items={note.analysisItems}
            noteId={note.id}
            stockCode={note.anchorTags.find(t => t.stockCode)?.stockCode}
            analysisDepth={note.analysisDepth}
            onUpdate={handleUpdateAnalysisItems}
          />
        )}
      </div>

      {/* ===== Resize Handles ===== */}
      {!isMaximized && (
        <>
          {/* edges */}
          <div onMouseDown={onResizeStart('n')} className="absolute top-0 left-2 right-2 h-1 cursor-n-resize" />
          <div onMouseDown={onResizeStart('s')} className="absolute bottom-0 left-2 right-2 h-1 cursor-s-resize" />
          <div onMouseDown={onResizeStart('w')} className="absolute top-2 bottom-2 left-0 w-1 cursor-w-resize" />
          <div onMouseDown={onResizeStart('e')} className="absolute top-2 bottom-2 right-0 w-1 cursor-e-resize" />
          {/* corners */}
          <div onMouseDown={onResizeStart('nw')} className="absolute top-0 left-0 w-3 h-3 cursor-nw-resize" />
          <div onMouseDown={onResizeStart('ne')} className="absolute top-0 right-0 w-3 h-3 cursor-ne-resize" />
          <div onMouseDown={onResizeStart('sw')} className="absolute bottom-0 left-0 w-3 h-3 cursor-sw-resize" />
          <div onMouseDown={onResizeStart('se')} className="absolute bottom-0 right-0 w-3 h-3 cursor-se-resize" />
        </>
      )}
    </div>
  );
}
