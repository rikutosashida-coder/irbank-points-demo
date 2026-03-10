import { Note } from '../../features/notes/types/note.types';
import { InvestmentDecision } from '../../features/notes/types/investment.types';

export type ReviewPromptType = 'hypothesis_check' | 'decision_follow_up' | 'periodic_review';

export interface ReviewPrompt {
  noteId: string;
  promptType: ReviewPromptType;
  message: string;
  suggestedQuestions: string[];
  createdAt: Date;
}

/**
 * 定期的な振り返りプロンプトを生成
 */
export async function generateReviewPrompts(
  notes: Note[],
  decisions: InvestmentDecision[]
): Promise<ReviewPrompt[]> {
  const prompts: ReviewPrompt[] = [];
  const now = Date.now();

  // 3ヶ月前のノートで未レビュー
  const threeMonthsAgo = now - (90 * 24 * 60 * 60 * 1000);
  const oldUnreviewedNotes = notes.filter(note => {
    const createdTime = note.createdAt.getTime();
    return (
      createdTime < threeMonthsAgo &&
      (!note.lastReviewedAt || note.lastReviewedAt.getTime() < threeMonthsAgo)
    );
  });

  for (const note of oldUnreviewedNotes) {
    prompts.push({
      noteId: note.id,
      promptType: 'hypothesis_check',
      message: `3ヶ月前に書いた「${note.title}」の仮説、今どうですか？`,
      suggestedQuestions: [
        '当初の仮説は当たりましたか？',
        '何が変わりましたか？',
        '新しい情報で評価は変わりますか？'
      ],
      createdAt: new Date()
    });
  }

  // 見送った銘柄の追跡（1ヶ月後）
  const oneMonthAgo = now - (30 * 24 * 60 * 60 * 1000);
  const passDecisions = decisions.filter(d => {
    return (
      d.decisionType === 'pass' &&
      d.decisionDate.getTime() < oneMonthAgo
    );
  });

  for (const decision of passDecisions) {
    const note = notes.find(n => n.id === decision.noteId);
    if (!note) continue;

    // すでにレビュー済みかチェック
    if (note.lastReviewedAt && note.lastReviewedAt.getTime() > decision.decisionDate.getTime()) {
      continue;
    }

    prompts.push({
      noteId: note.id,
      promptType: 'decision_follow_up',
      message: `見送った「${note.title}」、その後どうなりました？`,
      suggestedQuestions: [
        '見送りは正しい判断でしたか？',
        '株価はどう動きましたか？',
        '今なら買いますか？'
      ],
      createdAt: new Date()
    });
  }

  // 次回レビュー予定日を過ぎたノート
  const scheduledReviews = notes.filter(note => {
    return note.nextReviewDate && note.nextReviewDate.getTime() < now;
  });

  for (const note of scheduledReviews) {
    prompts.push({
      noteId: note.id,
      promptType: 'periodic_review',
      message: `「${note.title}」の定期振り返り時期です`,
      suggestedQuestions: [
        '前回から何が変わりましたか？',
        '分析の精度はどうでしたか？',
        '次の行動は？'
      ],
      createdAt: new Date()
    });
  }

  return prompts;
}
