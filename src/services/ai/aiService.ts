/**
 * AI応答サービス（モック実装）
 * 将来的にAnthropic APIに接続する想定
 *
 * パーソナルAIメモリ（RAG）対応:
 * ユーザーの過去ノート・投資判断・振り返りを参照して応答
 */

import { personalMemory } from '../rag/personalMemory';

interface AIResponse {
  content: string;
  isStreaming?: boolean;
  memoryContext?: string; // RAGで取得したコンテキスト
}

// 金融・投資関連のFAQ
const financialFAQ: Record<string, string> = {
  'roe': 'ROE（自己資本利益率）は、企業が株主から預かった資本をどれだけ効率的に活用して利益を生み出しているかを示す指標です。ROE = 当期純利益 ÷ 自己資本 × 100 で計算されます。一般的に10%以上が優良企業の目安とされています。',
  'per': 'PER（株価収益率）は、株価が1株あたり純利益の何倍かを示す指標です。PER = 株価 ÷ 1株あたり純利益 で計算されます。PERが低いほど割安とされますが、業種や成長性によって適正値は異なります。',
  'pbr': 'PBR（株価純資産倍率）は、株価が1株あたり純資産の何倍かを示す指標です。PBR = 株価 ÷ 1株あたり純資産 で計算されます。PBRが1倍を下回ると、理論上は割安とされます。',
  'dcf': 'DCF法（ディスカウント・キャッシュフロー法）は、企業が将来生み出すキャッシュフローを現在価値に割り引いて企業価値を算出する手法です。事業計画に基づくため、成長企業の評価に適しています。',
  'ebitda': 'EBITDA（利払前・税引前・減価償却前利益）は、企業の本業の収益力を示す指標です。金利や税金、減価償却の影響を除外するため、国際比較や異業種比較に適しています。',
};

// キーワードマッチング
const findMatchingFAQ = (query: string): string | null => {
  const lowerQuery = query.toLowerCase().trim();

  for (const [keyword, answer] of Object.entries(financialFAQ)) {
    if (lowerQuery.includes(keyword)) {
      return answer;
    }
  }

  return null;
};

// 汎用応答パターン
const getGenericResponse = (query: string): string => {
  const lowerQuery = query.toLowerCase();

  if (lowerQuery.includes('ありがとう') || lowerQuery.includes('thanks')) {
    return 'どういたしまして。他にご質問があればお気軽にお尋ねください。';
  }

  if (lowerQuery.includes('こんにちは') || lowerQuery.includes('hello')) {
    return 'こんにちは！IRBANKアルファノートのAIナビゲーターです。投資分析や銘柄調査のサポートをいたします。何かお手伝いできることはありますか？';
  }

  if (lowerQuery.includes('分析') && lowerQuery.includes('方法')) {
    return '銘柄分析の基本的なステップをご紹介します：\n\n1. 財務諸表の確認（売上高、利益、ROE等）\n2. バリュエーション分析（PER、PBR、DCF等）\n3. 競合他社との比較\n4. 業界動向の把握\n5. リスク要因の洗い出し\n\nアルファノート機能を使って、これらの項目を体系的に記録することをお勧めします。';
  }

  if (lowerQuery.includes('タグ') || lowerQuery.includes('tag')) {
    return 'アルファノートのタグ機能について説明します：\n\n• アンカータグ: 銘柄、業界、テーマ、日付などの基本情報\n• 分析タグ: 投資判断のフェーズや結論\n• 自由タグ: 独自のカテゴリ分類\n\nタグを活用することで、過去のノートを効率的に検索・整理できます。';
  }

  return 'ご質問ありがとうございます。現在のモック版では限定的な応答となりますが、将来的にはより詳細な投資分析サポートを提供予定です。\n\n具体的な用語の説明（ROE、PER、DCF等）や、分析方法についてお答えできますので、お気軽にお尋ねください。';
};

/**
 * AI応答を生成（モック実装 + パーソナルメモリ対応）
 */
export async function generateAIResponse(
  userMessage: string,
  _context?: {
    noteTitle?: string;
    noteContent?: string;
  }
): Promise<AIResponse> {
  // APIコールをシミュレート
  await new Promise((resolve) => setTimeout(resolve, 800));

  // パーソナルメモリから関連情報を検索
  const memoryContext = personalMemory.getContextForQuery(userMessage);

  // FAQから該当する回答を検索
  const faqAnswer = findMatchingFAQ(userMessage);
  if (faqAnswer) {
    // メモリコンテキストがあれば付加
    if (memoryContext) {
      return {
        content: faqAnswer + '\n\n---\n**あなたのノートから:**\n' + formatMemoryHits(memoryContext),
        memoryContext,
      };
    }
    return { content: faqAnswer };
  }

  // パーソナルメモリに関連情報がある場合
  if (memoryContext && personalMemory.chunkCount > 0) {
    const results = personalMemory.search(userMessage, 3);
    if (results.length > 0) {
      let response = '過去のノートから関連する情報が見つかりました：\n\n';
      results.forEach(({ chunk, score }, i) => {
        response += `**${i + 1}. ${chunk.noteTitle}** (関連度: ${(score * 100).toFixed(0)}%)\n`;
        response += chunk.text.substring(0, 200) + (chunk.text.length > 200 ? '...' : '') + '\n\n';
      });
      response += 'より詳しく知りたい内容があれば、お気軽にお尋ねください。';
      return { content: response, memoryContext };
    }
  }

  // 汎用応答
  const response = getGenericResponse(userMessage);
  return { content: response };
}

/**
 * メモリコンテキストを読みやすくフォーマット
 */
function formatMemoryHits(context: string): string {
  // 最初の200文字だけ表示
  const lines = context.split('\n').filter(l => l.trim() && !l.startsWith('##'));
  return lines.slice(0, 3).join('\n');
}

/**
 * ストリーミング応答のシミュレーション（将来のAPI統合用）
 */
export async function* streamAIResponse(
  userMessage: string,
  context?: {
    noteTitle?: string;
    noteContent?: string;
  }
): AsyncGenerator<string, void, unknown> {
  const response = await generateAIResponse(userMessage, context);
  const words = response.content.split('');

  for (const char of words) {
    yield char;
    await new Promise((resolve) => setTimeout(resolve, 20));
  }
}
