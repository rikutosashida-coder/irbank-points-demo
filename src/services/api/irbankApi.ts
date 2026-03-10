/**
 * IRBANK API サービス（モック実装）
 * 実際のIRBANK APIに接続する際は、このファイルを更新します
 */

export interface StockPrice {
  date: Date;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

/**
 * 指定した銘柄コードと日付の株価（終値）を取得
 * @param stockCode 銘柄コード（例: "2371"）
 * @param date 日付
 * @returns 株価（終値）
 */
export async function getStockPrice(
  stockCode: string,
  date: Date
): Promise<number | null> {
  // モック実装: APIコールをシミュレート
  await new Promise((resolve) => setTimeout(resolve, 500));

  // TODO: 実際のIRBANK APIに接続する
  // const response = await fetch(`https://irbank.net/api/stock/${stockCode}/price?date=${date.toISOString()}`);
  // const data = await response.json();
  // return data.close;

  // モックデータ: 銘柄コードと日付に基づいて擬似的な株価を生成
  const basePrice = generateMockPrice(stockCode);
  const dateVariation = (date.getTime() % 1000) / 1000; // 日付による変動
  const mockPrice = Math.round(basePrice * (1 + (dateVariation - 0.5) * 0.1));

  return mockPrice;
}

/**
 * 銘柄コードから基準株価を生成（モック）
 */
function generateMockPrice(stockCode: string): number {
  // 銘柄コードの数値に基づいて基準価格を生成
  const codeNum = parseInt(stockCode, 10);

  // 典型的な株価レンジに収めるため
  if (codeNum < 2000) {
    return 500 + (codeNum % 500); // 500-1000円
  } else if (codeNum < 4000) {
    return 1000 + (codeNum % 1000); // 1000-2000円
  } else if (codeNum < 6000) {
    return 2000 + (codeNum % 2000); // 2000-4000円
  } else {
    return 3000 + (codeNum % 3000); // 3000-6000円
  }
}

/**
 * 指定期間の株価履歴を取得
 * @param stockCode 銘柄コード
 * @param startDate 開始日
 * @param endDate 終了日
 * @returns 株価履歴
 */
export async function getStockPriceHistory(
  _stockCode: string,
  _startDate: Date,
  _endDate: Date
): Promise<StockPrice[]> {
  // モック実装
  await new Promise((resolve) => setTimeout(resolve, 800));

  // TODO: 実際のIRBANK APIに接続する
  // const response = await fetch(`https://irbank.net/api/stock/${stockCode}/history?start=${startDate}&end=${endDate}`);
  // return response.json();

  return [];
}

/**
 * IRBANK APIのエラーハンドリング
 */
export class IRBankAPIError extends Error {
  constructor(
    message: string,
    public statusCode?: number
  ) {
    super(message);
    this.name = 'IRBankAPIError';
  }
}
