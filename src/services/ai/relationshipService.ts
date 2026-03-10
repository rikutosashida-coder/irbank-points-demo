import { Note } from '../../features/notes/types/note.types';

export type ConnectionType = 'similar_thesis' | 'contradicts' | 'follow_up' | 'related_stock';

export interface RelatedNoteSuggestion {
  noteId: string;
  relevanceScore: number;
  reason: string;
  connectionType: ConnectionType;
}

export interface Contradiction {
  pastNoteId: string;
  contradictionType: 'thesis_change' | 'valuation_change' | 'risk_assessment';
  description: string;
  severity: 'high' | 'medium' | 'low';
}

/**
 * 現在のノートと関連性の高いノートを提案
 * 
 * 注: モック実装。実際にはAnthropic APIで関連性を判定
 */
export async function suggestRelatedNotes(
  currentNote: Note,
  allNotes: Note[]
): Promise<RelatedNoteSuggestion[]> {
  const suggestions: RelatedNoteSuggestion[] = [];

  // 自分自身は除外
  const otherNotes = allNotes.filter(n => n.id !== currentNote.id);

  // キーワードベースの簡易マッチング
  const currentKeywords = new Set(currentNote.keywords || []);
  const currentStocks = currentNote.anchorTags
    .filter(tag => tag.stockCode)
    .map(tag => tag.stockCode);

  otherNotes.forEach(note => {
    let score = 0;
    let reason = '';
    let connectionType: ConnectionType = 'similar_thesis';

    // キーワードの重複
    const noteKeywords = note.keywords || [];
    const commonKeywords = noteKeywords.filter(kw => currentKeywords.has(kw));
    if (commonKeywords.length > 0) {
      score += commonKeywords.length * 0.3;
      reason = `共通キーワード: ${commonKeywords.join(', ')}`;
      connectionType = 'similar_thesis';
    }

    // 同じ銘柄
    const noteStocks = note.anchorTags
      .filter(tag => tag.stockCode)
      .map(tag => tag.stockCode);
    const commonStocks = currentStocks.filter(code => noteStocks.includes(code!));
    if (commonStocks.length > 0) {
      score += commonStocks.length * 0.5;
      reason = `同じ銘柄: ${commonStocks.join(', ')}`;
      connectionType = 'related_stock';
    }

    // フリータグの重複
    const commonTags = currentNote.freeTags.filter(tag => note.freeTags.includes(tag));
    if (commonTags.length > 0) {
      score += commonTags.length * 0.2;
    }

    if (score > 0.5) {
      suggestions.push({
        noteId: note.id,
        relevanceScore: Math.min(score, 1.0),
        reason,
        connectionType,
      });
    }
  });

  // スコア順にソートして上位3件
  return suggestions
    .sort((a, b) => b.relevanceScore - a.relevanceScore)
    .slice(0, 3);
}

/**
 * 矛盾する分析を検出
 */
export async function detectContradictions(
  currentNote: Note,
  pastNotes: Note[]
): Promise<Contradiction[]> {
  const contradictions: Contradiction[] = [];

  // 簡易実装: 同じ銘柄で異なる判断
  const currentStocks = currentNote.anchorTags
    .filter(tag => tag.stockCode)
    .map(tag => tag.stockCode);

  const currentDecisionTag = currentNote.analysisTags.find(tag => tag.decision);

  pastNotes.forEach(pastNote => {
    const pastStocks = pastNote.anchorTags
      .filter(tag => tag.stockCode)
      .map(tag => tag.stockCode);
    const pastDecisionTag = pastNote.analysisTags.find(tag => tag.decision);

    const commonStocks = currentStocks.filter(code => pastStocks.includes(code!));

    if (commonStocks.length > 0 && currentDecisionTag && pastDecisionTag) {
      if (currentDecisionTag.decision !== pastDecisionTag.decision) {
        contradictions.push({
          pastNoteId: pastNote.id,
          contradictionType: 'thesis_change',
          description: `「${pastNote.title}」では${pastDecisionTag.decision}だったが、今回は${currentDecisionTag.decision}に変更`,
          severity: 'high',
        });
      }
    }
  });

  return contradictions;
}
