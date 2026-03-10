/**
 * AI を使って単語の意味を自動生成する（モック実装）
 * 実際のAPIと統合する場合は、ここを実装します
 */
export async function generateMeaning(word: string, context?: string): Promise<string> {
  // モック実装: 簡易的な意味生成
  await new Promise((resolve) => setTimeout(resolve, 500)); // APIコールをシミュレート

  // 金融・投資関連の用語辞書（簡易版）
  const financialTerms: Record<string, string> = {
    'ROE': '自己資本利益率（Return on Equity）。企業が株主から預かった資本をどれだけ効率的に活用して利益を生み出しているかを示す指標。',
    'ROA': '総資産利益率（Return on Assets）。企業が保有する総資産をどれだけ効率的に活用して利益を生み出しているかを示す指標。',
    'PER': '株価収益率（Price Earnings Ratio）。株価が1株あたり純利益の何倍かを示す指標。',
    'PBR': '株価純資産倍率（Price Book-value Ratio）。株価が1株あたり純資産の何倍かを示す指標。',
    'EBITDA': '利払前・税引前・減価償却前利益。企業の本業の収益力を示す指標。',
    '営業CF': '営業活動によるキャッシュフロー。企業の本業による現金の増減を示す。',
    '投資CF': '投資活動によるキャッシュフロー。設備投資や有価証券投資による現金の増減を示す。',
    '財務CF': '財務活動によるキャッシュフロー。借入や返済、配当支払いによる現金の増減を示す。',
    'DCF': 'ディスカウント・キャッシュフロー法。将来のキャッシュフローを現在価値に割り引いて企業価値を算出する手法。',
    'WACC': '加重平均資本コスト（Weighted Average Cost of Capital）。企業が資金調達するために必要なコストの平均値。',
    '流動比率': '流動資産を流動負債で割った値。短期的な支払能力を示す指標。',
    '自己資本比率': '総資本に占める自己資本の割合。財務の安全性を示す指標。',
    'デューデリジェンス': '企業の買収や投資を行う際に実施する、対象企業の詳細調査。',
    'バリュエーション': '企業価値評価。企業の適正な価値を算出すること。',
    'IR': 'インベスター・リレーションズ。企業が投資家に対して行う広報活動。',
  };

  // 小文字に変換して検索
  const lowerWord = word.toLowerCase().trim();

  // 辞書にある場合はその定義を返す
  for (const [term, definition] of Object.entries(financialTerms)) {
    if (term.toLowerCase() === lowerWord || lowerWord.includes(term.toLowerCase())) {
      return definition;
    }
  }

  // 文脈がある場合は、それを考慮した意味を生成
  if (context) {
    return `「${word}」は、文脈「${context}」において使用されている用語です。具体的な意味については、専門家に確認することをお勧めします。`;
  }

  // デフォルトの応答
  return `「${word}」の意味を登録してください。AIによる自動生成は今後実装予定です。`;
}

/**
 * 選択されたテキストから文脈を抽出
 */
export function extractContext(fullText: string, selectedText: string, contextLength: number = 50): string {
  const index = fullText.indexOf(selectedText);
  if (index === -1) return selectedText;

  const start = Math.max(0, index - contextLength);
  const end = Math.min(fullText.length, index + selectedText.length + contextLength);

  let context = fullText.substring(start, end);

  // 前後に ... を追加
  if (start > 0) context = '...' + context;
  if (end < fullText.length) context = context + '...';

  return context;
}
