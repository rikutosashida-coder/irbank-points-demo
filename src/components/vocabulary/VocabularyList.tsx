import { useState } from 'react';
import { FiSearch, FiTrash2, FiEdit2, FiBook, FiZap, FiX } from 'react-icons/fi';
import { useVocabularyStore } from '../../features/notes/store/vocabularyStore';
import { VocabularyEntry } from '../../features/notes/types/note.types';

export function VocabularyList() {
  const [searchQuery, setSearchQuery] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editMeaning, setEditMeaning] = useState('');

  const entries = useVocabularyStore((state) => state.entries);
  const updateEntry = useVocabularyStore((state) => state.updateEntry);
  const deleteEntry = useVocabularyStore((state) => state.deleteEntry);
  const searchEntries = useVocabularyStore((state) => state.searchEntries);

  // 検索フィルタ適用
  const filteredEntries = searchQuery.trim()
    ? searchEntries(searchQuery)
    : entries;

  // 編集開始
  const handleStartEdit = (entry: VocabularyEntry) => {
    setEditingId(entry.id);
    setEditMeaning(entry.meaning);
  };

  // 編集保存
  const handleSaveEdit = async (id: string) => {
    if (editMeaning.trim()) {
      try {
        await updateEntry(id, { meaning: editMeaning.trim() });
        setEditingId(null);
        setEditMeaning('');
      } catch (error) {
        console.error('単語の更新に失敗しました:', error);
        alert('更新に失敗しました。もう一度お試しください。');
      }
    }
  };

  // 編集キャンセル
  const handleCancelEdit = () => {
    setEditingId(null);
    setEditMeaning('');
  };

  // 削除
  const handleDelete = async (id: string, word: string) => {
    if (confirm(`「${word}」を削除しますか？`)) {
      try {
        await deleteEntry(id);
      } catch (error) {
        console.error('単語の削除に失敗しました:', error);
        alert('削除に失敗しました。もう一度お試しください。');
      }
    }
  };

  return (
    <div className="space-y-4">
      {/* ヘッダー */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FiBook className="w-5 h-5 text-blue-600" />
          <h2 className="text-xl font-bold text-gray-900">単語帳</h2>
          <span className="text-sm text-gray-500">({filteredEntries.length}件)</span>
        </div>
      </div>

      {/* 検索バー */}
      <div className="relative">
        <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="単語や意味を検索..."
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* 単語リスト */}
      <div className="space-y-3">
        {filteredEntries.length === 0 ? (
          <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-lg">
            <FiBook className="w-12 h-12 mx-auto mb-3 text-gray-400" />
            <p className="text-sm">
              {searchQuery ? '検索結果が見つかりませんでした' : 'まだ単語が登録されていません'}
            </p>
            <p className="text-xs text-gray-400 mt-1">
              テキストを選択して単語を登録してください
            </p>
          </div>
        ) : (
          filteredEntries
            .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
            .map((entry) => (
              <div
                key={entry.id}
                className="p-4 bg-white border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
              >
                {/* 単語 */}
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg text-gray-900 flex items-center gap-2">
                      {entry.word}
                      {entry.isAIGenerated && (
                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full flex items-center gap-1">
                          <FiZap className="w-3 h-3" />
                          AI生成
                        </span>
                      )}
                    </h3>
                    {entry.tags && entry.tags.length > 0 && (
                      <div className="flex gap-1 mt-1">
                        {entry.tags.map((tag) => (
                          <span
                            key={tag}
                            className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* アクション */}
                  <div className="flex items-center gap-1">
                    {editingId === entry.id ? (
                      <>
                        <button
                          onClick={() => handleSaveEdit(entry.id)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="保存"
                        >
                          <FiEdit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
                          title="キャンセル"
                        >
                          <FiX className="w-4 h-4" />
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => handleStartEdit(entry)}
                          className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
                          title="編集"
                        >
                          <FiEdit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(entry.id, entry.word)}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          title="削除"
                        >
                          <FiTrash2 className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* 意味 */}
                {editingId === entry.id ? (
                  <textarea
                    value={editMeaning}
                    onChange={(e) => setEditMeaning(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[80px]"
                    autoFocus
                    maxLength={30}
                  />
                ) : (
                  <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {entry.meaning}
                  </p>
                )}

                {/* 数式 */}
                {entry.formula && (
                  <div className="mt-2 text-sm text-gray-700 bg-amber-50 p-2 rounded border border-amber-200 font-mono">
                    {entry.formula}
                  </div>
                )}

                {/* 文脈 */}
                {entry.context && (
                  <div className="mt-3 text-xs text-gray-600 bg-gray-50 p-2 rounded border border-gray-200">
                    <span className="font-medium">文脈:</span> {entry.context}
                  </div>
                )}

                {/* メタ情報 */}
                <div className="mt-3 flex items-center gap-3 text-xs text-gray-500">
                  <span>
                    登録日: {new Date(entry.createdAt).toLocaleDateString('ja-JP')}
                  </span>
                  {entry.updatedAt && entry.updatedAt.getTime() !== entry.createdAt.getTime() && (
                    <span>
                      更新日: {new Date(entry.updatedAt).toLocaleDateString('ja-JP')}
                    </span>
                  )}
                </div>
              </div>
            ))
        )}
      </div>
    </div>
  );
}
