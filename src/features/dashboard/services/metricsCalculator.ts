import { Note } from '../../notes/types/note.types';
import { InvestmentDecision } from '../../notes/types/investment.types';
import { Review } from '../../review/types/review.types';
import { InvestorMetrics, DataPoint, DecisionAccuracy } from '../types/metrics.types';
import { blocksToPlainText } from '../../../utils/blockNoteUtils';

/**
 * 投資家メトリクスを計算
 */
export async function calculateInvestorMetrics(
  userId: string,
  periodStart: Date,
  periodEnd: Date,
  notes: Note[],
  decisions: InvestmentDecision[],
  reviews: Review[]
): Promise<InvestorMetrics> {
  // 期間内のデータをフィルタ
  const periodNotes = notes.filter(n =>
    n.createdAt >= periodStart && n.createdAt <= periodEnd
  );

  const periodDecisions = decisions.filter(d =>
    d.decisionDate >= periodStart && d.decisionDate <= periodEnd
  );

  const periodReviews = reviews.filter(r =>
    r.reviewDate >= periodStart && r.reviewDate <= periodEnd
  );

  // キーワード頻度分析
  const keywordMap = new Map<string, number>();
  periodNotes.forEach(note => {
    (note.keywords || []).forEach(kw => {
      keywordMap.set(kw, (keywordMap.get(kw) || 0) + 1);
    });
  });

  const commonKeywords = Array.from(keywordMap.entries())
    .map(([keyword, count]) => ({ keyword, count, sentiment: 'neutral' as const }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 20);

  // リスクワード抽出
  const riskKeywords = ['リスク', '懸念', '不安', '課題', '問題'];
  const commonRisks = new Set<string>();

  periodNotes.forEach(note => {
    const text = blocksToPlainText(note.content);
    riskKeywords.forEach(kw => {
      if (text.includes(kw)) {
        const match = text.match(new RegExp(`${kw}[：:][^。\n]+`, 'g'));
        if (match) {
          match.forEach(m => commonRisks.add(m));
        }
      }
    });
  });

  // 業界分析
  const industryMap = new Map<string, number>();
  periodNotes.forEach(note => {
    note.anchorTags.forEach(tag => {
      if (tag.industryName) {
        industryMap.set(tag.industryName, (industryMap.get(tag.industryName) || 0) + 1);
      }
      if (tag.sector) {
        industryMap.set(tag.sector, (industryMap.get(tag.sector) || 0) + 1);
      }
    });
  });

  const favoriteIndustries = Array.from(industryMap.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name]) => name);

  // 判断精度
  const decisionAccuracy = calculateDecisionAccuracy(periodDecisions, periodReviews);

  // 分析の深さ推移（文字数ベース）
  const analysisDepthTrend = calculateDepthTrend(periodNotes);

  // 判断スピード推移
  const decisionSpeedTrend = calculateSpeedTrend(periodNotes, periodDecisions);

  // 振り返り頻度
  const reviewFrequency = periodNotes.length > 0 
    ? periodReviews.length / periodNotes.length 
    : 0;

  return {
    userId,
    periodStart,
    periodEnd,
    notesCreated: periodNotes.length,
    decisionsRecorded: periodDecisions.length,
    reviewsCompleted: periodReviews.length,
    decisionAccuracy,
    commonKeywords,
    commonRisks: Array.from(commonRisks).slice(0, 10),
    favoriteIndustries,
    analysisDepthTrend,
    decisionSpeedTrend,
    reviewFrequency,
  };
}

/**
 * 判断精度を計算
 */
function calculateDecisionAccuracy(
  decisions: InvestmentDecision[],
  reviews: Review[]
): DecisionAccuracy {
  const total = decisions.length;
  let correct = 0;
  let wrong = 0;
  let pending = 0;

  decisions.forEach(decision => {
    const relatedReviews = reviews.filter(r => r.noteId === decision.noteId);
    
    if (relatedReviews.length === 0) {
      pending++;
    } else {
      const latestReview = relatedReviews.sort((a, b) => 
        b.reviewDate.getTime() - a.reviewDate.getTime()
      )[0];

      if (latestReview.hypothesisAccuracy === 'correct') {
        correct++;
      } else if (latestReview.hypothesisAccuracy === 'wrong') {
        wrong++;
      } else {
        pending++;
      }
    }
  });

  return {
    total,
    correct,
    wrong,
    pending,
  };
}

/**
 * 分析の深さ推移を計算
 */
function calculateDepthTrend(notes: Note[]): DataPoint[] {
  const dataPoints: DataPoint[] = [];
  const sortedNotes = notes.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());

  sortedNotes.forEach(note => {
    const textLength = blocksToPlainText(note.content).length;
    dataPoints.push({
      date: note.createdAt,
      value: textLength,
    });
  });

  return dataPoints;
}

/**
 * 判断スピード推移を計算
 */
function calculateSpeedTrend(notes: Note[], decisions: InvestmentDecision[]): DataPoint[] {
  const dataPoints: DataPoint[] = [];

  decisions.forEach(decision => {
    const note = notes.find(n => n.id === decision.noteId);
    if (!note) return;

    const daysDiff = Math.floor(
      (decision.decisionDate.getTime() - note.createdAt.getTime()) / 
      (1000 * 60 * 60 * 24)
    );

    dataPoints.push({
      date: decision.decisionDate,
      value: daysDiff,
    });
  });

  return dataPoints.sort((a, b) => a.date.getTime() - b.date.getTime());
}
