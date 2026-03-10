import { useMemo } from 'react';
import { useNotesStore } from '../features/notes/store/notesStore';
import { useReviewStore } from '../features/review/store/reviewStore';
import { Note } from '../features/notes/types/note.types';

export interface NextAction {
  id: string;
  message: string;
  actionLabel: string;
  scrollToId?: string;
  navigateTo?: string;
  priority: number;
}

interface UseNextActionOptions {
  context: 'editor' | 'dashboard';
  noteId?: string;
}

export function useNextAction({ context, noteId }: UseNextActionOptions): NextAction | null {
  const notes = useNotesStore(state => state.notes);
  const reviews = useReviewStore(state => state.reviews);

  return useMemo(() => {
    const actions: NextAction[] = [];

    if (context === 'editor' && noteId) {
      const note = notes[noteId];
      if (!note) return null;

      // 1. 分析項目が未評価
      const unratedItems = note.analysisItems.filter(item => !item.rating || item.rating === 0);
      if (unratedItems.length > 0) {
        actions.push({
          id: 'unrated-items',
          message: `${unratedItems.length}件の分析項目が未評価です`,
          actionLabel: '分析項目を評価しましょう',
          scrollToId: 'analysis-items-section',
          priority: 1,
        });
      }

      // 2. 最終レビュー3ヶ月超過
      const threeMonthsAgo = new Date();
      threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
      const noteReviews = reviews.filter(r => r.noteId === noteId);
      const latestReview = noteReviews.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )[0];

      if (
        noteReviews.length > 0 &&
        latestReview &&
        new Date(latestReview.createdAt) < threeMonthsAgo
      ) {
        actions.push({
          id: 'review-overdue',
          message: 'そろそろ振り返りの時期です',
          actionLabel: '振り返りを開始',
          priority: 2,
        });
      }

      // 3. 類似ノートあり（anchorTag一致）
      if (note.anchorTags.length > 0) {
        const stockCodes = note.anchorTags
          .filter(t => t.stockCode)
          .map(t => t.stockCode);

        const similarNotes = Object.values(notes).filter(
          (n: Note) =>
            n.id !== noteId &&
            n.anchorTags.some(t => t.stockCode && stockCodes.includes(t.stockCode))
        );

        if (similarNotes.length > 0) {
          actions.push({
            id: 'similar-notes',
            message: `過去に同じ銘柄の分析が${similarNotes.length}件あります`,
            actionLabel: '過去の分析を確認',
            navigateTo: `/search?q=${stockCodes[0]}`,
            priority: 3,
          });
        }
      }
    }

    if (context === 'dashboard') {
      // 4. 未レビューノートあり
      const allNotes = Object.values(notes);
      const now = new Date();

      const overdueNotes = allNotes.filter((note: Note) => {
        if (note.isArchived) return false;
        if (!note.nextReviewDate) return false;
        return new Date(note.nextReviewDate) < now;
      });

      if (overdueNotes.length > 0) {
        actions.push({
          id: 'overdue-reviews',
          message: `振り返り期限を過ぎたノートが${overdueNotes.length}件あります`,
          actionLabel: '振り返り未完了のノートを確認',
          navigateTo: `/mypage/note/${overdueNotes[0].id}`,
          priority: 1,
        });
      }

      // ノートが多いのに分析項目が少ない
      const activeNotes = allNotes.filter((n: Note) => !n.isArchived);
      const notesWithoutItems = activeNotes.filter(
        (n: Note) => n.analysisItems.length === 0 && n.content.length > 0
      );

      if (notesWithoutItems.length > 0) {
        actions.push({
          id: 'missing-analysis',
          message: `分析項目が未設定のノートが${notesWithoutItems.length}件あります`,
          actionLabel: '分析項目を追加しましょう',
          navigateTo: `/mypage/note/${notesWithoutItems[0].id}`,
          priority: 2,
        });
      }
    }

    // 優先度順でソートし、最も優先度の高いものを返す
    actions.sort((a, b) => a.priority - b.priority);
    return actions[0] || null;
  }, [context, noteId, notes, reviews]);
}
