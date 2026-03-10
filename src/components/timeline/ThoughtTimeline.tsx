import { useMemo, useState, useCallback } from 'react';
import { FiFileText, FiTrendingUp, FiRefreshCw, FiBookOpen, FiArrowRight, FiSearch, FiChevronDown, FiChevronRight } from 'react-icons/fi';
import { useNotesStore } from '../../features/notes/store/notesStore';
import { useInvestmentDecisionStore } from '../../features/notes/store/investmentDecisionStore';
import { useReviewStore } from '../../features/review/store/reviewStore';
import { useNavigate } from 'react-router-dom';

type TimelineEventType = 'note_created' | 'decision_made' | 'review_done';

interface TimelineEvent {
  id: string;
  type: TimelineEventType;
  date: Date;
  title: string;
  description: string;
  noteId?: string;
  color: string;
  icon: React.ReactNode;
  tags?: string[];
}

const EVENT_TYPE_CONFIG: { id: TimelineEventType; label: string; color: string; dotClass: string }[] = [
  { id: 'note_created', label: 'ノート', color: 'blue', dotClass: 'bg-blue-500' },
  { id: 'decision_made', label: '投資判断', color: 'green', dotClass: 'bg-green-500' },
  { id: 'review_done', label: '振り返り', color: 'purple', dotClass: 'bg-purple-500' },
];

const DATE_RANGE_OPTIONS = [
  { value: 1, label: '1ヶ月' },
  { value: 3, label: '3ヶ月' },
  { value: 6, label: '6ヶ月' },
  { value: 12, label: '1年' },
  { value: 0, label: '全期間' },
];

const ITEMS_PER_MONTH = 5;

export function ThoughtTimeline() {
  const notes = useNotesStore(state => state.notes);
  const decisions = useInvestmentDecisionStore(state => state.decisions);
  const reviews = useReviewStore(state => state.reviews);
  const navigate = useNavigate();

  // フィルタ状態
  const [activeTypes, setActiveTypes] = useState<Set<TimelineEventType>>(
    new Set(['note_created', 'decision_made', 'review_done']),
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [dateRangeMonths, setDateRangeMonths] = useState(0); // 0 = 全期間
  const [collapsedMonths, setCollapsedMonths] = useState<Set<string>>(new Set());
  const [expandedMonths, setExpandedMonths] = useState<Set<string>>(new Set());

  // 全イベント生成
  const allEvents = useMemo<TimelineEvent[]>(() => {
    const evts: TimelineEvent[] = [];

    Object.values(notes).forEach(note => {
      const tags = [
        ...note.freeTags,
        ...note.anchorTags.filter(t => t.stockName).map(t => t.stockName!),
      ];
      evts.push({
        id: `note-${note.id}`,
        type: 'note_created',
        date: new Date(note.createdAt),
        title: note.title || '無題のノート',
        description: note.summary || `分析項目: ${note.analysisItems.length}件`,
        noteId: note.id,
        color: 'blue',
        icon: <FiFileText className="w-4 h-4" />,
        tags,
      });
    });

    decisions.forEach(decision => {
      const note = notes[decision.noteId];
      const typeLabel: Record<string, string> = {
        buy: '買い', sell: '売り', hold: '保有継続',
        watch: '様子見', pass: '見送り',
      };
      evts.push({
        id: `decision-${decision.id}`,
        type: 'decision_made',
        date: new Date(decision.decisionDate),
        title: `${typeLabel[decision.decisionType] || decision.decisionType}判断`,
        description: decision.reason || (note ? note.title : ''),
        noteId: decision.noteId,
        color: decision.decisionType === 'buy' ? 'green' : decision.decisionType === 'sell' ? 'red' : 'amber',
        icon: <FiTrendingUp className="w-4 h-4" />,
      });
    });

    reviews.forEach(review => {
      const note = notes[review.noteId];
      evts.push({
        id: `review-${review.id}`,
        type: 'review_done',
        date: new Date(review.reviewDate),
        title: '振り返り実施',
        description: review.whatChanged || (note ? note.title : ''),
        noteId: review.noteId,
        color: 'purple',
        icon: <FiRefreshCw className="w-4 h-4" />,
      });
    });

    return evts.sort((a, b) => b.date.getTime() - a.date.getTime());
  }, [notes, decisions, reviews]);

  // フィルタ適用
  const filteredEvents = useMemo(() => {
    const now = new Date();
    const cutoff = dateRangeMonths > 0
      ? new Date(now.getFullYear(), now.getMonth() - dateRangeMonths, now.getDate())
      : null;
    const query = searchQuery.trim().toLowerCase();

    return allEvents.filter(event => {
      if (!activeTypes.has(event.type)) return false;
      if (cutoff && event.date < cutoff) return false;
      if (query) {
        const matchesText = event.title.toLowerCase().includes(query)
          || event.description.toLowerCase().includes(query);
        const matchesTags = event.tags?.some(t => t.toLowerCase().includes(query));
        if (!matchesText && !matchesTags) return false;
      }
      return true;
    });
  }, [allEvents, activeTypes, dateRangeMonths, searchQuery]);

  // 統計
  const stats = useMemo(() => {
    const counts: Record<TimelineEventType, number> = {
      note_created: 0,
      decision_made: 0,
      review_done: 0,
    };
    for (const e of filteredEvents) counts[e.type]++;
    return counts;
  }, [filteredEvents]);

  // 月別グルーピング
  const grouped = useMemo(() => {
    return filteredEvents.reduce<Record<string, TimelineEvent[]>>((acc, event) => {
      const key = `${event.date.getFullYear()}年${event.date.getMonth() + 1}月`;
      if (!acc[key]) acc[key] = [];
      acc[key].push(event);
      return acc;
    }, {});
  }, [filteredEvents]);

  const toggleType = useCallback((type: TimelineEventType) => {
    setActiveTypes(prev => {
      const next = new Set(prev);
      if (next.has(type)) {
        if (next.size > 1) next.delete(type);
      } else {
        next.add(type);
      }
      return next;
    });
  }, []);

  const toggleCollapseMonth = useCallback((month: string) => {
    setCollapsedMonths(prev => {
      const next = new Set(prev);
      if (next.has(month)) next.delete(month);
      else next.add(month);
      return next;
    });
  }, []);

  const toggleExpandMonth = useCallback((month: string) => {
    setExpandedMonths(prev => {
      const next = new Set(prev);
      if (next.has(month)) next.delete(month);
      else next.add(month);
      return next;
    });
  }, []);

  const colorMap: Record<string, { bg: string; border: string; dot: string; text: string }> = {
    blue:   { bg: 'bg-blue-50',   border: 'border-blue-200',   dot: 'bg-blue-500',   text: 'text-blue-700' },
    green:  { bg: 'bg-green-50',  border: 'border-green-200',  dot: 'bg-green-500',  text: 'text-green-700' },
    red:    { bg: 'bg-red-50',    border: 'border-red-200',    dot: 'bg-red-500',    text: 'text-red-700' },
    amber:  { bg: 'bg-amber-50',  border: 'border-amber-200',  dot: 'bg-amber-500',  text: 'text-amber-700' },
    purple: { bg: 'bg-purple-50', border: 'border-purple-200', dot: 'bg-purple-500', text: 'text-purple-700' },
  };

  return (
    <div className="max-w-3xl mx-auto p-8">
      {/* ヘッダー */}
      <h1 className="text-3xl font-bold text-gray-900 mb-6 flex items-center gap-3">
        <FiBookOpen className="w-8 h-8" />
        思考の変遷タイムライン
      </h1>

      {/* フィルタバー */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 mb-6 space-y-3">
        {/* 検索 + 期間 */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="タイトル・説明文で検索..."
              className="w-full pl-10 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="flex gap-1">
            {DATE_RANGE_OPTIONS.map(opt => (
              <button
                key={opt.value}
                onClick={() => setDateRangeMonths(opt.value)}
                className={`px-2.5 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                  dateRangeMonths === opt.value
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* イベント種別 + 統計 */}
        <div className="flex items-center gap-2">
          {EVENT_TYPE_CONFIG.map(cfg => {
            const isActive = activeTypes.has(cfg.id);
            const count = stats[cfg.id];
            return (
              <button
                key={cfg.id}
                onClick={() => toggleType(cfg.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-full transition-colors ${
                  isActive
                    ? `${colorMap[cfg.color].bg} ${colorMap[cfg.color].text} border ${colorMap[cfg.color].border}`
                    : 'bg-gray-100 text-gray-400 border border-gray-200'
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${isActive ? cfg.dotClass : 'bg-gray-300'}`} />
                {cfg.label}
                <span className={`ml-0.5 ${isActive ? '' : 'text-gray-300'}`}>
                  {count}
                </span>
              </button>
            );
          })}
          <span className="ml-auto text-xs text-gray-400">
            全{filteredEvents.length}件
          </span>
        </div>
      </div>

      {/* 空状態 */}
      {filteredEvents.length === 0 && (
        <div className="text-center py-20 text-gray-500">
          <FiBookOpen className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          {allEvents.length === 0 ? (
            <>
              <p>まだイベントがありません</p>
              <p className="text-sm mt-2">ノートを作成すると、ここにタイムラインが表示されます</p>
            </>
          ) : (
            <>
              <p>条件に一致するイベントがありません</p>
              <p className="text-sm mt-2">フィルタや検索条件を変更してみてください</p>
            </>
          )}
        </div>
      )}

      {/* タイムライン */}
      <div className="space-y-8">
        {Object.entries(grouped).map(([monthLabel, monthEvents]) => {
          const isCollapsed = collapsedMonths.has(monthLabel);
          const isExpanded = expandedMonths.has(monthLabel);
          const visibleEvents = isExpanded
            ? monthEvents
            : monthEvents.slice(0, ITEMS_PER_MONTH);
          const hasMore = monthEvents.length > ITEMS_PER_MONTH && !isExpanded;

          return (
            <div key={monthLabel}>
              {/* 月ヘッダー（クリックで折りたたみ） */}
              <button
                onClick={() => toggleCollapseMonth(monthLabel)}
                className="flex items-center gap-2 text-lg font-bold text-gray-700 mb-3 sticky top-0 bg-gray-50 py-2 z-10 w-full text-left hover:text-gray-900 transition-colors"
              >
                {isCollapsed ? (
                  <FiChevronRight className="w-4 h-4 text-gray-400" />
                ) : (
                  <FiChevronDown className="w-4 h-4 text-gray-400" />
                )}
                {monthLabel}
                <span className="text-sm font-normal text-gray-400 ml-1">
                  ({monthEvents.length}件)
                </span>
              </button>

              {!isCollapsed && (
                <div className="relative pl-8 border-l-2 border-gray-200 space-y-3">
                  {visibleEvents.map(event => {
                    const c = colorMap[event.color] || colorMap.blue;
                    return (
                      <div key={event.id} className="relative">
                        <div className={`absolute -left-[25px] top-3 w-3.5 h-3.5 rounded-full ${c.dot} border-2 border-white shadow`} />
                        <div
                          className={`p-3.5 rounded-lg border ${c.bg} ${c.border} cursor-pointer hover:shadow-md transition-shadow`}
                          onClick={() => event.noteId && navigate(`/mypage/note/${event.noteId}`)}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 min-w-0">
                              <span className={c.text}>{event.icon}</span>
                              <span className={`font-semibold text-sm ${c.text} truncate`}>{event.title}</span>
                            </div>
                            <span className="text-xs text-gray-400 whitespace-nowrap ml-3">
                              {event.date.toLocaleDateString('ja-JP', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mt-1 line-clamp-1">{event.description}</p>
                          {event.tags && event.tags.length > 0 && (
                            <div className="flex gap-1 mt-1.5 flex-wrap">
                              {event.tags.slice(0, 3).map(tag => (
                                <span key={tag} className="px-1.5 py-0.5 text-[10px] bg-white/60 text-gray-500 rounded">
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}
                          {event.noteId && (
                            <div className="flex items-center gap-1 mt-1.5 text-xs text-gray-400 hover:text-blue-600">
                              <span>ノートを開く</span>
                              <FiArrowRight className="w-3 h-3" />
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}

                  {/* もっと見る */}
                  {hasMore && (
                    <button
                      onClick={() => toggleExpandMonth(monthLabel)}
                      className="ml-2 text-xs text-blue-600 hover:text-blue-800 font-medium py-1"
                    >
                      さらに {monthEvents.length - ITEMS_PER_MONTH} 件を表示
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
