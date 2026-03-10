import { Insight } from '../types/insight.types';
import { InvestorMetrics } from '../types/metrics.types';
import { Note } from '../../notes/types/note.types';
import { Review } from '../../review/types/review.types';
import { InvestmentDecision } from '../../notes/types/investment.types';

export function generateInsights(
  metrics: InvestorMetrics,
  notes: Note[],
  decisions: InvestmentDecision[],
  reviews: Review[],
): Insight[] {
  const insights: Insight[] = [];

  // 1. 業界別判断精度: anchorTagの業界でグループ化 → 精度50%未満を警告
  const sectorDecisions: Record<string, { correct: number; total: number }> = {};
  for (const decision of decisions) {
    const note = notes.find(n => n.id === decision.noteId);
    if (!note) continue;

    // レビューから判断精度を取得
    const relatedReviews = reviews.filter(r => r.noteId === decision.noteId);
    if (relatedReviews.length === 0) continue;
    const latestReview = relatedReviews.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )[0];
    if (!latestReview.hypothesisAccuracy || latestReview.hypothesisAccuracy === 'too_early') continue;

    const sectors = note.anchorTags
      .filter(t => t.sector)
      .map(t => t.sector!);
    for (const sector of sectors) {
      if (!sectorDecisions[sector]) {
        sectorDecisions[sector] = { correct: 0, total: 0 };
      }
      sectorDecisions[sector].total++;
      if (latestReview.hypothesisAccuracy === 'correct') {
        sectorDecisions[sector].correct++;
      }
    }
  }

  for (const [sector, data] of Object.entries(sectorDecisions)) {
    if (data.total >= 3 && data.correct / data.total < 0.5) {
      insights.push({
        id: `sector-accuracy-${sector}`,
        type: 'sector_accuracy',
        title: `${sector}セクターの判断精度が低下`,
        description: `${sector}セクターの判断精度が${Math.round((data.correct / data.total) * 100)}%です。過去の分析を振り返りましょう。`,
        severity: 'warning',
        actionLabel: '該当ノートを確認',
        actionRoute: `/search?q=${sector}`,
      });
    }
  }

  // 2. 得意/苦手セクター
  let bestSector: { name: string; accuracy: number } | null = null;
  let worstSector: { name: string; accuracy: number } | null = null;

  for (const [sector, data] of Object.entries(sectorDecisions)) {
    if (data.total < 2) continue;
    const accuracy = data.correct / data.total;
    if (!bestSector || accuracy > bestSector.accuracy) {
      bestSector = { name: sector, accuracy };
    }
    if (!worstSector || accuracy < worstSector.accuracy) {
      worstSector = { name: sector, accuracy };
    }
  }

  if (bestSector && bestSector.accuracy >= 0.7) {
    insights.push({
      id: 'best-sector',
      type: 'strength',
      title: `${bestSector.name}が得意分野です`,
      description: `${bestSector.name}セクターの判断精度は${Math.round(bestSector.accuracy * 100)}%。この強みを活かしましょう。`,
      severity: 'positive',
    });
  }

  // 3. レビューギャップ: 30日以上未レビューのノート数
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const activeNotes = notes.filter(n => !n.isArchived);
  const unreviewedNotes = activeNotes.filter(n => {
    const noteReviews = reviews.filter(r => r.noteId === n.id);
    if (noteReviews.length === 0) {
      // ノート作成から30日以上経過
      return new Date(n.createdAt) < thirtyDaysAgo;
    }
    const latestReview = noteReviews.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )[0];
    return new Date(latestReview.createdAt) < thirtyDaysAgo;
  });

  if (unreviewedNotes.length > 0) {
    insights.push({
      id: 'review-gap',
      type: 'review_gap',
      title: `${unreviewedNotes.length}件のノートが未振り返り`,
      description: '30日以上振り返りが行われていないノートがあります。定期的な振り返りで判断力を磨きましょう。',
      severity: 'warning',
      actionLabel: '振り返りを開始',
      actionRoute: unreviewedNotes[0] ? `/mypage/note/${unreviewedNotes[0].id}` : undefined,
    });
  }

  // 4. 分析深さトレンド: 最近のノートのテキスト量が減少傾向
  const recentNotes = activeNotes
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 10);

  if (recentNotes.length >= 5) {
    const recentAvgItems = recentNotes.slice(0, 5).reduce((sum, n) => sum + n.analysisItems.length, 0) / 5;
    const olderAvgItems = recentNotes.slice(5).reduce((sum, n) => sum + n.analysisItems.length, 0) / Math.min(5, recentNotes.slice(5).length);

    if (olderAvgItems > 0 && recentAvgItems < olderAvgItems * 0.6) {
      insights.push({
        id: 'depth-decline',
        type: 'depth_trend',
        title: '分析の深さが減少傾向',
        description: '最近のノートの分析項目数が以前より減っています。質の高い分析を心がけましょう。',
        severity: 'warning',
      });
    }
  }

  // 5. 判断精度の全体傾向
  const { decisionAccuracy } = metrics;
  if (decisionAccuracy.total >= 5) {
    const accuracy = decisionAccuracy.correct / (decisionAccuracy.correct + decisionAccuracy.wrong);
    if (accuracy >= 0.7) {
      insights.push({
        id: 'overall-accuracy',
        type: 'overall_accuracy',
        title: `判断精度${Math.round(accuracy * 100)}% — 好調です`,
        description: '投資判断の精度が高い水準を維持しています。この調子を続けましょう。',
        severity: 'positive',
      });
    }
  }

  // severity降順 (warning > info > positive) で上位3件を返す
  const severityOrder: Record<string, number> = { warning: 0, info: 1, positive: 2 };
  insights.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);

  return insights.slice(0, 3);
}
