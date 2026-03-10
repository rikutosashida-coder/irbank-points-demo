import { useMemo, useState } from 'react';
import { FiFileText, FiChevronRight, FiSearch, FiX, FiStar } from 'react-icons/fi';
import { useNotesStore } from '../../features/notes/store/notesStore';
import { computeWeightedRating } from '../../utils/noteRating';

interface RelatedNotesListProps {
  stockCode: string;
  stockName: string;
  onOpenNote?: (noteId: string) => void;
}

const DEPTH_LABELS: Record<string, string> = {
  quick: 'クイック',
  standard: 'スタンダード',
  deep: 'ディープ',
};

export function RelatedNotesList({ stockCode, stockName, onOpenNote }: RelatedNotesListProps) {
  const notes = useNotesStore((state) => state.notes);
  const [searchQuery, setSearchQuery] = useState('');
  const [depthFilter, setDepthFilter] = useState<string | null>(null);
  const [sortField, setSortField] = useState<'updatedAt' | 'rating'>('updatedAt');
  const [favOnly, setFavOnly] = useState(false);

  const relatedNotes = useMemo(() => {
    return Object.values(notes)
      .filter((note) =>
        note.anchorTags.some((tag) => tag.stockCode === stockCode)
      );
  }, [notes, stockCode]);

  const filteredNotes = useMemo(() => {
    let items = [...relatedNotes];

    // テキスト検索
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      items = items.filter(n =>
        n.title.toLowerCase().includes(q) ||
        n.freeTags.some(t => t.toLowerCase().includes(q))
      );
    }

    // 分析深度フィルタ
    if (depthFilter) {
      items = items.filter(n => n.analysisDepth === depthFilter);
    }

    // お気に入りフィルタ
    if (favOnly) {
      items = items.filter(n => n.isFavorite);
    }

    // ソート
    items.sort((a, b) => {
      if (sortField === 'rating') {
        const ra = computeWeightedRating(a.analysisItems || []) ?? 0;
        const rb = computeWeightedRating(b.analysisItems || []) ?? 0;
        return rb - ra;
      }
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });

    return items;
  }, [relatedNotes, searchQuery, depthFilter, sortField, favOnly]);

  // 利用可能な深度一覧
  const availableDepths = useMemo(() => {
    const depths = new Set<string>();
    relatedNotes.forEach(n => { if (n.analysisDepth) depths.add(n.analysisDepth); });
    return Array.from(depths);
  }, [relatedNotes]);

  const hasActiveFilters = searchQuery || depthFilter || favOnly;

  if (relatedNotes.length === 0) {
    return (
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <h3 className="text-sm font-medium text-gray-700 mb-3">
          {stockName}の分析ノート
        </h3>
        <div className="text-center py-8 text-gray-400">
          <FiFileText className="w-8 h-8 mx-auto mb-2" />
          <p className="text-sm">まだ分析ノートがありません</p>
          <p className="text-xs mt-1">「この銘柄を分析する」ボタンからノートを作成できます</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6">
      <h3 className="text-sm font-medium text-gray-700 mb-3">
        {stockName}の分析ノート ({relatedNotes.length}件)
      </h3>

      {/* フィルタバー */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        {/* 検索 */}
        <div className="relative flex-1 min-w-[160px] max-w-[240px]">
          <FiSearch className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 w-3.5 h-3.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="タイトルで検索..."
            className="w-full pl-8 pr-3 py-1.5 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>

        {/* 深度フィルタ */}
        {availableDepths.length > 1 && (
          <div className="flex gap-1">
            <button
              onClick={() => setDepthFilter(null)}
              className={`px-2 py-1 text-[11px] font-medium rounded-md transition-colors ${
                !depthFilter ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              全て
            </button>
            {availableDepths.map(d => (
              <button
                key={d}
                onClick={() => setDepthFilter(depthFilter === d ? null : d)}
                className={`px-2 py-1 text-[11px] font-medium rounded-md transition-colors ${
                  depthFilter === d ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {DEPTH_LABELS[d] || d}
              </button>
            ))}
          </div>
        )}

        {/* お気に入り */}
        <button
          onClick={() => setFavOnly(!favOnly)}
          className={`flex items-center gap-1 px-2 py-1 text-[11px] font-medium rounded-md transition-colors ${
            favOnly ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          <FiStar className={`w-3 h-3 ${favOnly ? 'fill-yellow-400' : ''}`} />
          お気に入り
        </button>

        {/* ソート */}
        <select
          value={sortField}
          onChange={(e) => setSortField(e.target.value as typeof sortField)}
          className="px-2 py-1 text-[11px] border border-gray-300 rounded-md bg-white"
        >
          <option value="updatedAt">更新日順</option>
          <option value="rating">評価順</option>
        </select>

        {/* クリア */}
        {hasActiveFilters && (
          <button
            onClick={() => { setSearchQuery(''); setDepthFilter(null); setFavOnly(false); }}
            className="flex items-center gap-1 text-[11px] text-gray-500 hover:text-gray-700"
          >
            <FiX className="w-3 h-3" />
            クリア
          </button>
        )}
      </div>

      {/* ノートリスト */}
      <div className="space-y-2">
        {filteredNotes.length === 0 ? (
          <div className="text-center py-6 text-gray-400 text-sm">
            条件に一致するノートがありません
          </div>
        ) : (
          filteredNotes.map((note) => {
            const rating = computeWeightedRating(note.analysisItems || []);
            return (
              <button
                key={note.id}
                onClick={() => onOpenNote?.(note.id)}
                className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors text-left group"
              >
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-900 truncate flex items-center gap-1.5">
                    {note.title}
                    {note.isFavorite && <FiStar className="w-3 h-3 text-yellow-500 fill-yellow-400 flex-shrink-0" />}
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-gray-500">
                      {new Date(note.updatedAt).toLocaleDateString('ja-JP')}
                    </span>
                    {note.analysisTags.map((tag) => (
                      <span
                        key={tag.id}
                        className="text-xs px-1.5 py-0.5 rounded bg-gray-100 text-gray-600"
                      >
                        {tag.decision === 'buy' ? '買い' :
                         tag.decision === 'sell' ? '売り' :
                         tag.decision === 'hold' ? '保有' :
                         tag.decision === 'watch' ? '注目' : tag.phase === 'before_investment' ? '投資前' : '投資後'}
                      </span>
                    ))}
                    {note.analysisDepth && (
                      <span className="text-xs px-1.5 py-0.5 rounded bg-blue-50 text-blue-600">
                        {DEPTH_LABELS[note.analysisDepth] || note.analysisDepth}
                      </span>
                    )}
                    {rating !== null && (
                      <span className="text-xs text-yellow-600 font-medium">
                        ★{rating.toFixed(1)}
                      </span>
                    )}
                  </div>
                </div>
                <FiChevronRight className="w-4 h-4 text-gray-400 group-hover:text-gray-600" />
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
