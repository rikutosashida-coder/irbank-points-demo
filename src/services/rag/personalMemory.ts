import { Note } from '../../features/notes/types/note.types';
import { InvestmentDecision } from '../../features/notes/types/investment.types';
import { Review } from '../../features/review/types/review.types';
import { blocksToPlainText } from '../../utils/blockNoteUtils';

/**
 * ノートをチャンクに分割
 */
interface TextChunk {
  id: string;
  noteId: string;
  noteTitle: string;
  text: string;
  type: 'note_content' | 'analysis_item' | 'decision' | 'review';
  createdAt: Date;
}

/**
 * 簡易的なTF-IDFベクトル化（モック）
 * 本番ではEmbedding APIを使用
 */
function tokenize(text: string): string[] {
  return text
    .split(/[\s、。！？「」『』（）\(\)\[\]【】・,\.\!\?\n]+/)
    .filter(w => w.length >= 2);
}

function cosineSimilarity(a: Map<string, number>, b: Map<string, number>): number {
  let dotProduct = 0;
  let magA = 0;
  let magB = 0;

  a.forEach((val, key) => {
    magA += val * val;
    if (b.has(key)) {
      dotProduct += val * b.get(key)!;
    }
  });
  b.forEach(val => { magB += val * val; });

  if (magA === 0 || magB === 0) return 0;
  return dotProduct / (Math.sqrt(magA) * Math.sqrt(magB));
}

function textToVector(text: string): Map<string, number> {
  const tokens = tokenize(text);
  const freq = new Map<string, number>();
  tokens.forEach(t => freq.set(t, (freq.get(t) || 0) + 1));
  // TF正規化
  const total = tokens.length;
  freq.forEach((v, k) => freq.set(k, v / total));
  return freq;
}

/**
 * パーソナルAIメモリ（RAG）
 *
 * ユーザーの全ノート・投資判断・振り返りをチャンク化し、
 * クエリに対して最も関連性の高いチャンクを検索する。
 */
export class PersonalMemory {
  private chunks: TextChunk[] = [];

  /**
   * 全データからチャンクを構築
   */
  buildIndex(
    notes: Record<string, Note>,
    decisions: InvestmentDecision[],
    reviews: Review[]
  ): void {
    this.chunks = [];

    // ノートコンテンツをチャンク化
    Object.values(notes).forEach(note => {
      const text = blocksToPlainText(note.content);
      if (text.trim().length > 0) {
        this.chunks.push({
          id: `note-${note.id}`,
          noteId: note.id,
          noteTitle: note.title,
          text,
          type: 'note_content',
          createdAt: note.createdAt,
        });
      }

      // 分析項目を個別チャンクに
      note.analysisItems.forEach(item => {
        const currentVersion = item.versions.find(v => v.id === item.currentVersionId);
        if (currentVersion) {
          const itemText = blocksToPlainText(currentVersion.content);
          if (itemText.trim().length > 0) {
            this.chunks.push({
              id: `analysis-${item.id}`,
              noteId: note.id,
              noteTitle: `${note.title} > ${item.title}`,
              text: `${item.title}: ${itemText}`,
              type: 'analysis_item',
              createdAt: item.createdAt,
            });
          }
        }
      });
    });

    // 投資判断をチャンク化
    decisions.forEach(decision => {
      const note = notes[decision.noteId];
      const typeLabel: Record<string, string> = {
        buy: '買い', sell: '売り', hold: '保有継続',
        watch: '様子見', pass: '見送り',
      };
      const text = `${typeLabel[decision.decisionType] || decision.decisionType}判断: ${decision.reason || ''}`;
      if (text.trim().length > 10) {
        this.chunks.push({
          id: `decision-${decision.id}`,
          noteId: decision.noteId,
          noteTitle: note ? note.title : '',
          text,
          type: 'decision',
          createdAt: decision.createdAt,
        });
      }
    });

    // 振り返りをチャンク化
    reviews.forEach(review => {
      const note = notes[review.noteId];
      const text = [
        review.whatChanged && `変化: ${review.whatChanged}`,
        review.whyChanged && `理由: ${review.whyChanged}`,
        review.newInsights && `気づき: ${review.newInsights}`,
        review.lessonsLearned && `教訓: ${review.lessonsLearned}`,
      ].filter(Boolean).join('\n');

      if (text.trim().length > 0) {
        this.chunks.push({
          id: `review-${review.id}`,
          noteId: review.noteId,
          noteTitle: note ? `${note.title}の振り返り` : '振り返り',
          text,
          type: 'review',
          createdAt: review.createdAt,
        });
      }
    });
  }

  /**
   * クエリに最も関連するチャンクを検索
   */
  search(query: string, topK: number = 5): { chunk: TextChunk; score: number }[] {
    if (this.chunks.length === 0) return [];

    const queryVector = textToVector(query);

    const scored = this.chunks.map(chunk => ({
      chunk,
      score: cosineSimilarity(queryVector, textToVector(chunk.text)),
    }));

    return scored
      .filter(s => s.score > 0.05)
      .sort((a, b) => b.score - a.score)
      .slice(0, topK);
  }

  /**
   * 検索結果をコンテキスト文字列に変換
   */
  getContextForQuery(query: string, maxChars: number = 3000): string {
    const results = this.search(query);
    if (results.length === 0) return '';

    let context = '## あなたの過去のノートから関連する情報:\n\n';
    let currentLength = context.length;

    for (const { chunk, score } of results) {
      const entry = `### ${chunk.noteTitle} (関連度: ${(score * 100).toFixed(0)}%)\n${chunk.text}\n\n`;
      if (currentLength + entry.length > maxChars) break;
      context += entry;
      currentLength += entry.length;
    }

    return context;
  }

  get chunkCount(): number {
    return this.chunks.length;
  }
}

// シングルトンインスタンス
export const personalMemory = new PersonalMemory();
