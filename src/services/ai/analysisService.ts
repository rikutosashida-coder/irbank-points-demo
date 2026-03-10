import { Block } from '../../features/notes/types/note.types';
import { blocksToPlainText } from '../../utils/blockNoteUtils';

export type Sentiment = 'bullish' | 'bearish' | 'neutral';

export interface ExtractedNumber {
  label: string;  // 'PER', 'ROE', '売上成長率' など
  value: number;
  unit: string;
  context: string;
}

export interface AIAnalysisResult {
  summary: string;  // 3行要約
  keywords: string[];  // 重要キーワード
  sentiment: Sentiment;
  keyNumbers: ExtractedNumber[];
  risks: string[];
  opportunities: string[];
}

/**
 * ノートコンテンツをAI分析して要約・キーワードを抽出
 * 
 * 注: この実装はモック版です。実際のプロダクションでは
 * Anthropic APIを呼び出してClaude Sonnetで分析します。
 */
export async function analyzeNoteContent(
  content: Block[],
  _context?: { noteTitle?: string; tags?: string[] }
): Promise<AIAnalysisResult> {
  const text = blocksToPlainText(content);

  // 500文字未満の場合は分析をスキップ
  if (text.length < 500) {
    return {
      summary: text.substring(0, 100) + (text.length > 100 ? '...' : ''),
      keywords: extractSimpleKeywords(text),
      sentiment: 'neutral',
      keyNumbers: [],
      risks: [],
      opportunities: [],
    };
  }

  // モック実装: 実際にはAnthropic APIを呼び出す
  // const response = await anthropic.messages.create({
  //   model: 'claude-sonnet-4-5',
  //   max_tokens: 2000,
  //   messages: [{ role: 'user', content: prompt }]
  // });

  // 簡易的なキーワード抽出（モック）
  const keywords = extractSimpleKeywords(text);
  const numbers = extractNumbers(text);
  const sentiment = detectSentiment(text);
  const risks = extractRisks(text);
  const opportunities = extractOpportunities(text);

  // 簡易要約（最初の3文）
  const sentences = text.split(/[。！？]/);
  const summary = sentences.slice(0, 3).join('。') + (sentences.length > 3 ? '。' : '');

  return {
    summary,
    keywords,
    sentiment,
    keyNumbers: numbers,
    risks,
    opportunities,
  };
}

/**
 * 簡易キーワード抽出（頻出単語）
 */
function extractSimpleKeywords(text: string): string[] {
  // ストップワード
  const stopWords = new Set([
    'の', 'に', 'は', 'を', 'が', 'と', 'で', 'や', 'から', 'まで',
    'より', 'として', 'について', 'において', 'による', 'ため',
    'こと', 'もの', 'これ', 'それ', 'あれ', 'この', 'その', 'あの',
    'する', 'なる', 'ある', 'いる', 'できる', 'ない'
  ]);

  // 単語を抽出（簡易的に空白・記号で分割）
  const words = text
    .split(/[\s、。！？「」『』（）\(\)\[\]【】・,\.\!\?]/)
    .filter(w => w.length >= 2 && !stopWords.has(w))
    .map(w => w.trim())
    .filter(w => w.length > 0);

  // 頻度カウント
  const freq = new Map<string, number>();
  words.forEach(w => freq.set(w, (freq.get(w) || 0) + 1));

  // 頻度順にソートして上位10個
  return Array.from(freq.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([word]) => word);
}

/**
 * 数値情報の抽出
 */
function extractNumbers(text: string): ExtractedNumber[] {
  const numbers: ExtractedNumber[] = [];

  // ROE, PER, PBR などの指標パターン
  const patterns = [
    { regex: /ROE[：:]\s*(\d+(?:\.\d+)?)%/gi, label: 'ROE', unit: '%' },
    { regex: /PER[：:]\s*(\d+(?:\.\d+)?)/gi, label: 'PER', unit: '倍' },
    { regex: /PBR[：:]\s*(\d+(?:\.\d+)?)/gi, label: 'PBR', unit: '倍' },
    { regex: /売上高[：:]\s*(\d+(?:,\d+)*)/gi, label: '売上高', unit: '億円' },
    { regex: /営業利益[：:]\s*(\d+(?:,\d+)*)/gi, label: '営業利益', unit: '億円' },
  ];

  patterns.forEach(({ regex, label, unit }) => {
    const matches = text.matchAll(regex);
    for (const match of matches) {
      const valueStr = match[1].replace(/,/g, '');
      const value = parseFloat(valueStr);
      if (!isNaN(value)) {
        numbers.push({
          label,
          value,
          unit,
          context: match[0],
        });
      }
    }
  });

  return numbers;
}

/**
 * センチメント判定（簡易版）
 */
function detectSentiment(text: string): Sentiment {
  const bullishKeywords = ['成長', '拡大', '増加', '好調', '強み', '優位', '機会'];
  const bearishKeywords = ['減少', '低下', 'リスク', '懸念', '課題', '問題', '不安'];

  const bullishCount = bullishKeywords.filter(kw => text.includes(kw)).length;
  const bearishCount = bearishKeywords.filter(kw => text.includes(kw)).length;

  if (bullishCount > bearishCount + 1) return 'bullish';
  if (bearishCount > bullishCount + 1) return 'bearish';
  return 'neutral';
}

/**
 * リスク抽出
 */
function extractRisks(text: string): string[] {
  const risks: string[] = [];
  const riskKeywords = ['リスク', '懸念', '不安', '課題', '問題'];

  riskKeywords.forEach(keyword => {
    const regex = new RegExp(`${keyword}[：:][^。\n]{1,50}`, 'g');
    const matches = text.match(regex);
    if (matches) {
      risks.push(...matches.slice(0, 3));
    }
  });

  return risks.slice(0, 5);
}

/**
 * 機会抽出
 */
function extractOpportunities(text: string): string[] {
  const opportunities: string[] = [];
  const oppKeywords = ['機会', 'チャンス', '成長', '拡大', '強み'];

  oppKeywords.forEach(keyword => {
    const regex = new RegExp(`${keyword}[：:][^。\n]{1,50}`, 'g');
    const matches = text.match(regex);
    if (matches) {
      opportunities.push(...matches.slice(0, 3));
    }
  });

  return opportunities.slice(0, 5);
}
