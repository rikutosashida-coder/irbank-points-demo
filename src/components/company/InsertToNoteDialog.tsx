import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiX, FiSearch, FiFileText, FiPlus, FiCheck } from 'react-icons/fi';
import { useNotesStore } from '../../features/notes/store/notesStore';

interface InsertToNoteDialogProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  blocks: any[];
  label: string;
  stockCode: string;
  stockName: string;
  onClose: () => void;
}

export function InsertToNoteDialog({
  blocks,
  label,
  stockCode,
  stockName,
  onClose,
}: InsertToNoteDialogProps) {
  const navigate = useNavigate();
  const { notes, updateNote, createNote } = useNotesStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [insertedNoteId, setInsertedNoteId] = useState<string | null>(null);

  const notesList = useMemo(() => {
    const all = Object.values(notes)
      .filter((n) => !n.isArchived)
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

    if (!searchQuery.trim()) return all;
    const q = searchQuery.toLowerCase();
    return all.filter((n) => n.title.toLowerCase().includes(q));
  }, [notes, searchQuery]);

  // 該当銘柄に関連するノートを優先表示
  const relatedNotes = useMemo(
    () => notesList.filter((n) => n.anchorTags.some((t) => t.stockCode === stockCode)),
    [notesList, stockCode]
  );
  const otherNotes = useMemo(
    () => notesList.filter((n) => !n.anchorTags.some((t) => t.stockCode === stockCode)),
    [notesList, stockCode]
  );

  const safeBlocks = Array.isArray(blocks) ? blocks : [];

  const handleInsert = async (noteId: string) => {
    try {
      const note = notes[noteId];
      if (!note) return;
      if (safeBlocks.length === 0) {
        alert('挿入するデータがありません。');
        return;
      }

      const existing = Array.isArray(note.content) ? note.content : [];
      const updatedContent = [...existing, ...safeBlocks];
      await updateNote(noteId, { content: updatedContent });
      setInsertedNoteId(noteId);

      // 1.5秒後にダイアログを閉じる
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err) {
      console.error('[InsertToNoteDialog] Insert failed:', err);
      alert('ノートへの挿入に失敗しました。もう一度お試しください。');
    }
  };

  const handleCreateAndInsert = async () => {
    try {
      const noteId = await createNote({
        title: `${stockName}（${stockCode}）分析ノート`,
        content: safeBlocks,
        anchorTags: [{
          id: crypto.randomUUID(),
          category: 'stock' as const,
          stockCode,
          stockName,
        }],
      });
      navigate(`/mypage/note/${noteId}`);
      onClose();
    } catch (err) {
      console.error('[InsertToNoteDialog] Create and insert failed:', err);
      alert('ノートの作成に失敗しました。もう一度お試しください。');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/30 flex items-start justify-end z-50 p-6">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[70vh] flex flex-col mt-4 mr-2">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div>
            <h3 className="text-lg font-bold text-gray-900">ノートに挿入</h3>
            <p className="text-xs text-gray-500 mt-0.5">
              「{label}」を挿入するノートを選択
            </p>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg">
            <FiX className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* New Note Button */}
        <div className="p-3 border-b border-gray-100">
          <button
            onClick={handleCreateAndInsert}
            className="w-full flex items-center gap-2 p-3 rounded-lg bg-primary-50 text-primary-700 hover:bg-primary-100 transition-colors text-sm font-medium"
          >
            <FiPlus className="w-4 h-4" />
            新しいノートを作成して挿入
          </button>
        </div>

        {/* Search */}
        <div className="px-3 pt-3">
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ノートを検索..."
              className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>

        {/* Note List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-1">
          {/* Related Notes */}
          {relatedNotes.length > 0 && (
            <>
              <p className="text-xs font-medium text-gray-500 px-2 py-1">
                {stockName}の関連ノート
              </p>
              {relatedNotes.map((note) => (
                <NoteItem
                  key={note.id}
                  title={note.title}
                  date={note.updatedAt}
                  isInserted={insertedNoteId === note.id}
                  onInsert={() => handleInsert(note.id)}
                  onOpenNote={() => { navigate(`/mypage/note/${note.id}`); onClose(); }}
                />
              ))}
            </>
          )}

          {/* Other Notes */}
          {otherNotes.length > 0 && (
            <>
              <p className="text-xs font-medium text-gray-500 px-2 py-1 mt-2">
                その他のノート
              </p>
              {otherNotes.map((note) => (
                <NoteItem
                  key={note.id}
                  title={note.title}
                  date={note.updatedAt}
                  isInserted={insertedNoteId === note.id}
                  onInsert={() => handleInsert(note.id)}
                  onOpenNote={() => { navigate(`/mypage/note/${note.id}`); onClose(); }}
                />
              ))}
            </>
          )}

          {notesList.length === 0 && (
            <div className="text-center py-8 text-gray-400 text-sm">
              <FiFileText className="w-8 h-8 mx-auto mb-2" />
              <p>ノートが見つかりません</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function NoteItem({
  title,
  date,
  isInserted,
  onInsert,
  onOpenNote,
}: {
  title: string;
  date: Date;
  isInserted: boolean;
  onInsert: () => void;
  onOpenNote: () => void;
}) {
  if (isInserted) {
    return (
      <div className="flex items-center gap-2 p-2.5 rounded-lg bg-green-50 border border-green-200">
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium text-gray-900 truncate">{title}</div>
          <div className="text-xs text-green-600 mt-0.5">
            <FiCheck className="w-3 h-3 inline mr-1" />
            挿入しました
          </div>
        </div>
        <button
          onClick={onOpenNote}
          className="flex-shrink-0 px-3 py-1.5 text-xs font-medium text-primary-600 bg-white border border-primary-300 rounded-lg hover:bg-primary-50 transition-colors"
        >
          ノートを開く
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={onInsert}
      className="w-full flex items-center gap-2 p-2.5 rounded-lg hover:bg-primary-50 hover:border-primary-200 border border-transparent transition-colors text-left"
    >
      <FiFileText className="w-4 h-4 text-gray-400 flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-gray-900 truncate">{title}</div>
        <div className="text-xs text-gray-500">
          {new Date(date).toLocaleDateString('ja-JP')}
        </div>
      </div>
      <span className="flex-shrink-0 text-xs text-primary-600 font-medium">
        挿入 →
      </span>
    </button>
  );
}
