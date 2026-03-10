import { useState } from 'react';
import { FiX, FiSave, FiRefreshCw } from 'react-icons/fi';
import { useReviewStore } from '../../features/review/store/reviewStore';
import { useNotesStore } from '../../features/notes/store/notesStore';
import { HypothesisAccuracy } from '../../features/review/types/review.types';

interface ReviewDialogProps {
  noteId: string;
  onClose: () => void;
}

export function ReviewDialog({ noteId, onClose }: ReviewDialogProps) {
  const [whatChanged, setWhatChanged] = useState('');
  const [whyChanged, setWhyChanged] = useState('');
  const [newInsights, setNewInsights] = useState('');
  const [actionItemsText, setActionItemsText] = useState('');
  const [accuracy, setAccuracy] = useState<HypothesisAccuracy | ''>('');
  const [lessonsLearned, setLessonsLearned] = useState('');
  const [saving, setSaving] = useState(false);

  const addReview = useReviewStore(state => state.addReview);
  const updateNote = useNotesStore(state => state.updateNote);
  const note = useNotesStore(state => state.getNoteById(noteId));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!whatChanged.trim()) return;

    setSaving(true);
    try {
      const actionItems = actionItemsText
        .split('\n')
        .map(s => s.trim())
        .filter(s => s.length > 0);

      await addReview({
        noteId,
        reviewDate: new Date(),
        reviewType: 'manual',
        whatChanged: whatChanged.trim(),
        whyChanged: whyChanged.trim(),
        newInsights: newInsights.trim(),
        actionItems,
        hypothesisAccuracy: accuracy || undefined,
        lessonsLearned: lessonsLearned.trim() || undefined,
      });

      // ノートの振り返り日時を更新
      await updateNote(noteId, {
        lastReviewedAt: new Date(),
      });

      onClose();
    } catch (error) {
      console.error('振り返り保存エラー:', error);
      alert('保存に失敗しました');
    } finally {
      setSaving(false);
    }
  };

  const accuracyOptions: { value: HypothesisAccuracy; label: string; color: string }[] = [
    { value: 'correct', label: '当たった', color: 'bg-green-100 text-green-700 border-green-300' },
    { value: 'partially_correct', label: '一部当たった', color: 'bg-yellow-100 text-yellow-700 border-yellow-300' },
    { value: 'wrong', label: '外れた', color: 'bg-red-100 text-red-700 border-red-300' },
    { value: 'too_early', label: 'まだ分からない', color: 'bg-gray-100 text-gray-700 border-gray-300' },
  ];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* ヘッダー */}
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FiRefreshCw className="w-6 h-6 text-purple-600" />
            <div>
              <h2 className="text-xl font-bold text-gray-900">振り返り</h2>
              {note && <p className="text-sm text-gray-500 mt-0.5">{note.title}</p>}
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <FiX className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* コンテンツ */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* 仮説の精度 */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              当初の仮説はどうでしたか？
            </label>
            <div className="flex gap-2 flex-wrap">
              {accuracyOptions.map(opt => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setAccuracy(accuracy === opt.value ? '' : opt.value)}
                  className={`px-4 py-2 text-sm font-medium rounded-lg border transition-all ${
                    accuracy === opt.value
                      ? opt.color + ' ring-2 ring-offset-1 ring-current'
                      : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* 何が変わったか */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              何が変わったか <span className="text-red-500">*</span>
            </label>
            <textarea
              value={whatChanged}
              onChange={e => setWhatChanged(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none min-h-[80px]"
              placeholder="株価、業績、市場環境などの変化..."
              required
            />
          </div>

          {/* なぜ変わったか */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              なぜ変わったか
            </label>
            <textarea
              value={whyChanged}
              onChange={e => setWhyChanged(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none min-h-[60px]"
              placeholder="変化の背景や原因..."
            />
          </div>

          {/* 新しい気づき */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              新しい気づき
            </label>
            <textarea
              value={newInsights}
              onChange={e => setNewInsights(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none min-h-[60px]"
              placeholder="この振り返りで得た新しい洞察..."
            />
          </div>

          {/* 学んだこと */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              学んだこと・教訓
            </label>
            <textarea
              value={lessonsLearned}
              onChange={e => setLessonsLearned(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none min-h-[60px]"
              placeholder="次回の投資判断に活かせること..."
            />
          </div>

          {/* 次のアクション */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              次のアクション（1行1項目）
            </label>
            <textarea
              value={actionItemsText}
              onChange={e => setActionItemsText(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none min-h-[60px]"
              placeholder="追加調査が必要な点&#10;ポジション調整の検討&#10;次の決算までに確認すること"
            />
          </div>
        </form>

        {/* フッター */}
        <div className="p-4 border-t border-gray-200 flex justify-end gap-3 bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-200 rounded-lg"
          >
            キャンセル
          </button>
          <button
            onClick={handleSubmit as any}
            disabled={!whatChanged.trim() || saving}
            className="flex items-center gap-2 px-6 py-2 text-sm bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            <FiSave className="w-4 h-4" />
            {saving ? '保存中...' : '振り返りを保存'}
          </button>
        </div>
      </div>
    </div>
  );
}
