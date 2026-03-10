/**
 * AI分析自動生成サービス（モック実装）
 * 企業の財務データをもとに、各分析項目のコンテンツをBlockNote形式で自動生成する。
 * 実際のAI APIに接続する際はこのファイルを更新。
 */

import { getCompanyFinancials } from '../api/companyFinancialsApi';
import type { CompanyFinancials } from '../../features/company/types/financials.types';

// ============================================
// BlockNote ブロック生成ヘルパー
// ============================================

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type BNBlock = any;

function text(s: string) { return { type: 'text', text: s, styles: {} }; }
function bold(s: string) { return { type: 'text', text: s, styles: { bold: true } }; }
function paragraph(...parts: ReturnType<typeof text>[]): BNBlock {
  if (parts.length === 0) return { type: 'paragraph' };
  return { type: 'paragraph', content: parts };
}
function heading(s: string, level = 3): BNBlock {
  return { type: 'heading', props: { level }, content: [text(s)] };
}
function bullet(...parts: ReturnType<typeof text>[]): BNBlock {
  return { type: 'bulletListItem', content: parts };
}

function fmtCurrency(v: number): string {
  if (Math.abs(v) >= 1000000) return `${(v / 1000000).toFixed(1)}兆円`;
  if (Math.abs(v) >= 10000) return `${Math.round(v / 100)}億円`;
  return `${v.toLocaleString()}百万円`;
}

function fmtPct(v: number): string { return `${v.toFixed(1)}%`; }

function growthRate(newer: number, older: number): string {
  if (older === 0) return 'N/A';
  return fmtPct(((newer - older) / Math.abs(older)) * 100);
}

// ============================================
// メイン生成関数
// ============================================

export interface AiAnalysisResult {
  itemTitle: string;
  blocks: BNBlock[];
}

/**
 * 指定された銘柄・分析項目タイトルに対してAI分析を生成する
 */
export async function generateAnalysis(
  stockCode: string,
  itemTitle: string,
): Promise<BNBlock[]> {
  // 財務データ取得
  const financials = await getCompanyFinancials(stockCode);
  if (!financials) {
    return [paragraph(text(`${stockCode}の財務データが見つかりませんでした。`))];
  }

  // 100-400msの疑似遅延
  await new Promise((r) => setTimeout(r, 100 + Math.random() * 300));

  // タイトルからジェネレータを選択
  const gen = selectGenerator(itemTitle);
  return gen(financials);
}

/**
 * 複数の分析項目をまとめて生成する
 */
export async function generateBulkAnalysis(
  stockCode: string,
  itemTitles: string[],
): Promise<AiAnalysisResult[]> {
  const financials = await getCompanyFinancials(stockCode);
  if (!financials) {
    return itemTitles.map((t) => ({
      itemTitle: t,
      blocks: [paragraph(text(`${stockCode}の財務データが見つかりませんでした。`))],
    }));
  }

  // 全体で500-1500msの疑似遅延
  await new Promise((r) => setTimeout(r, 500 + Math.random() * 1000));

  return itemTitles.map((title) => ({
    itemTitle: title,
    blocks: selectGenerator(title)(financials),
  }));
}

// ============================================
// 総評 AI サマリー生成
// ============================================

export interface AnalysisOverviewSummary {
  /** 100-300文字の全体要約テキスト。{項目名}でリンクを埋め込む */
  text: string;
  /** テキスト中で言及された分析項目ID一覧 */
  mentionedItemIds: string[];
}

export interface OverviewSummaryInput {
  id: string;
  title: string;
  rating?: number;
  weight?: number;
  excerpt: string;
  checkPoints?: { text: string; isChecked: boolean; aiOutput?: string }[];
}

/**
 * 全分析項目のコンテンツからAI総評を生成する（モック実装）。
 * 各項目の rating + weight + チェックポイントをもとに要約文を作成し、
 * 項目名部分を {itemId:項目名} 形式でマークする。
 */
export async function generateOverviewSummary(
  items: OverviewSummaryInput[],
): Promise<AnalysisOverviewSummary> {
  // 疑似遅延
  await new Promise((r) => setTimeout(r, 400 + Math.random() * 400));

  const rated = items.filter(i => i.rating && i.rating > 0);
  const unrated = items.filter(i => !i.rating || i.rating === 0);

  // 強み(4-5)・普通(3)・課題(1-2)に分類
  const strengths = rated.filter(i => i.rating! >= 4);
  const warnings = rated.filter(i => i.rating! <= 2);
  const neutral = rated.filter(i => i.rating! === 3);

  const parts: string[] = [];

  // 総評の冒頭（加重平均で計算）
  if (rated.length === 0) {
    const itemMentions = items.slice(0, 3).map(i => `{${i.id}:${i.title}}`).join('、');
    parts.push(`${items.length}件の分析項目（${itemMentions}等）がありますが、まだ評価が付けられていません。各項目を評価して総合的な判断材料にしましょう。`);
  } else {
    // 加重平均スコア
    const weightedSum = rated.reduce((s, i) => s + (i.rating! * (i.weight || 5)), 0);
    const weightSum = rated.reduce((s, i) => s + (i.weight || 5), 0);
    const avg = weightedSum / weightSum;
    if (avg >= 4) {
      parts.push('総合的に高い評価となっています。');
    } else if (avg >= 3) {
      parts.push('総合的にはまずまずの評価です。');
    } else {
      parts.push('総合的にやや慎重な見方が必要です。');
    }

    // 強み（重要度の高い順）
    if (strengths.length > 0) {
      const sorted = [...strengths].sort((a, b) => (b.weight || 5) - (a.weight || 5));
      const refs = sorted.map(i => {
        const w = i.weight || 5;
        return `{${i.id}:${i.title}} ${i.rating}★` + (w !== 5 ? `(重要度${w})` : '');
      }).join('、');
      parts.push(`特に${refs}が高評価で、投資判断においてポジティブな材料です。`);
    }

    // 課題
    if (warnings.length > 0) {
      const sorted = [...warnings].sort((a, b) => (b.weight || 5) - (a.weight || 5));
      const refs = sorted.map(i => {
        const w = i.weight || 5;
        return `{${i.id}:${i.title}} ${i.rating}★` + (w !== 5 ? `(重要度${w})` : '');
      }).join('、');
      parts.push(`一方、${refs}には課題があり、リスク要因として注視が必要です。`);
    }

    // 重要度高いのに中立の項目
    const highWeightNeutral = neutral.filter(i => (i.weight || 5) >= 7);
    if (highWeightNeutral.length > 0) {
      const refs = highWeightNeutral.map(i => `{${i.id}:${i.title}}`).join('、');
      parts.push(`${refs}は重要度が高いにもかかわらず中立的な評価のため、追加調査を推奨します。`);
    } else if (neutral.length > 0 && neutral.length <= 2) {
      const refs = neutral.map(i => `{${i.id}:${i.title}}`).join('、');
      parts.push(`${refs}は現時点では中立的な評価です。`);
    }

    // チェックポイントサマリー（AI分析済みのものから要約）
    const itemsWithCpAnalysis = items.filter(i =>
      i.checkPoints && i.checkPoints.some(cp => cp.aiOutput)
    );
    if (itemsWithCpAnalysis.length > 0) {
      const cpSummaries: string[] = [];
      for (const item of itemsWithCpAnalysis.slice(0, 3)) {
        const analyzed = item.checkPoints!.filter(cp => cp.aiOutput);
        const checked = item.checkPoints!.filter(cp => cp.isChecked);
        cpSummaries.push(
          `{${item.id}:${item.title}}(${checked.length}/${item.checkPoints!.length}チェック済・${analyzed.length}件AI分析済)`
        );
      }
      parts.push(`チェックポイント分析状況: ${cpSummaries.join('、')}。`);
    }

    // 未評価
    if (unrated.length > 0) {
      // 重要度が高い未評価項目を優先表示
      const sortedUnrated = [...unrated].sort((a, b) => (b.weight || 5) - (a.weight || 5));
      const refs = sortedUnrated.slice(0, 2).map(i => `{${i.id}:${i.title}}`).join('、');
      parts.push(`${refs}${unrated.length > 2 ? `など${unrated.length}項目` : ''}はまだ未評価のため、評価を追加することでより精度の高い判断が可能になります。`);
    }
  }

  const fullText = parts.join('');

  // mentionedItemIds を抽出
  const mentionedIds: string[] = [];
  const regex = /\{([^:}]+):[^}]+\}/g;
  let match;
  while ((match = regex.exec(fullText)) !== null) {
    mentionedIds.push(match[1]);
  }

  return {
    text: fullText,
    mentionedItemIds: [...new Set(mentionedIds)],
  };
}

// ============================================
// チェックポイント単位のAI分析（モック）
// ============================================

/**
 * 個別チェックポイントに対してAI分析を生成する（モック）
 */
export async function generateCheckPointAnalysis(
  stockCode: string,
  itemTitle: string,
  checkPointText: string,
): Promise<string> {
  const financials = await getCompanyFinancials(stockCode);
  // 疑似遅延 200-600ms
  await new Promise((r) => setTimeout(r, 200 + Math.random() * 400));

  if (!financials) {
    return `${stockCode}の財務データが見つからないため、「${checkPointText}」の分析を実行できませんでした。`;
  }

  const s = financials.summary;
  const last = financials.annualResults[financials.annualResults.length - 1];
  const lastCf = financials.cashFlows[financials.cashFlows.length - 1];
  const lastBs = financials.balanceSheets[financials.balanceSheets.length - 1];

  // チェックポイントのキーワードに基づいてコンテキスト分析を生成
  const cp = checkPointText.toLowerCase();
  if (cp.includes('金利') || cp.includes('金融政策')) {
    return `【${s.stockName}への影響】現在の金利環境下で、${s.sector}セクターは${s.per > 20 ? '高PER銘柄として金利上昇の影響を受けやすい状況' : '比較的影響は限定的'}です。有利子負債は${lastBs ? fmtCurrency(lastBs.interestBearingDebt) : 'N/A'}で、金利1%上昇時の追加コストは約${lastBs ? Math.round(lastBs.interestBearingDebt * 0.01).toLocaleString() : 'N/A'}百万円と試算されます。`;
  }
  if (cp.includes('円安') || cp.includes('円高') || cp.includes('為替')) {
    return `【為替影響分析】${s.stockName}は${s.sector}セクターに属し、${['輸送用機器', '電気機器', '精密機器'].some(x => s.sector.includes(x)) ? '輸出比率が高く、円安が追い風になる傾向があります。直近の営業利益率' + fmtPct(last.operatingMargin) + 'は為替要因が含まれている可能性があります' : '内需型企業として為替の直接的影響は限定的ですが、輸入コスト面では円安がネガティブに作用する可能性があります'}。`;
  }
  if (cp.includes('gdp') || cp.includes('景気')) {
    return `【景気感応度】${s.stockName}の過去の業績推移を見ると、売上成長率は${last.revenueYoY != null ? fmtPct(last.revenueYoY) : 'N/A'}で、${last.revenueYoY != null && last.revenueYoY > 3 ? 'GDP成長率を上回る成長を実現しており、景気サイクルに対する耐性が比較的高いと言えます' : '景気動向との連動性が見られ、景気後退局面では業績への影響に注意が必要です'}。`;
  }
  if (cp.includes('インフレ') || cp.includes('コスト転嫁')) {
    return `【コスト転嫁力分析】${s.stockName}の営業利益率は${fmtPct(last.operatingMargin)}で、${last.operatingMargin > 10 ? '高い水準を維持しており、原材料コスト上昇に対する価格転嫁力があると推測されます' : '利益率が低めであり、コスト上昇を価格に転嫁する余地が限られている可能性があります'}。粗利率の推移を確認し、実際のコスト転嫁状況を精査することを推奨します。`;
  }
  if (cp.includes('売上') || cp.includes('成長')) {
    return `【売上成長分析】直近の売上高は${fmtCurrency(last.revenue)}、前年比${last.revenueYoY != null ? (last.revenueYoY > 0 ? '+' : '') + fmtPct(last.revenueYoY) : 'N/A'}です。${last.revenueYoY != null && last.revenueYoY > 5 ? '堅調な成長を維持しています。成長の持続性と質（オーガニック vs M&A）を確認しましょう' : '成長率が低迷しており、新たな成長ドライバーの有無を確認する必要があります'}。`;
  }
  if (cp.includes('利益率') || cp.includes('マージン') || cp.includes('営業利益')) {
    return `【利益率分析】営業利益率は${fmtPct(last.operatingMargin)}です。${last.operatingMargin > 10 ? '同業種内では高い水準を維持しており、競争優位性を示唆しています' : '改善余地があります。コスト構造の見直しや高付加価値商品へのシフトが鍵となります'}。`;
  }
  if (cp.includes('roe') || cp.includes('roa')) {
    return `【資本効率】ROE: ${fmtPct(last.roe)}、ROA: ${fmtPct(last.roa)}。${last.roe > 10 ? 'ROEは株主資本コストの一般的な目安(8%)を上回っており、価値創造企業と評価できます' : 'ROEの改善が求められます。DuPont分析で要因を分解し、改善ポイントを特定しましょう'}。`;
  }
  if (cp.includes('cf') || cp.includes('キャッシュ')) {
    return `【キャッシュフロー】直近の営業CF: ${lastCf ? fmtCurrency(lastCf.operatingCF) : 'N/A'}、FCF: ${lastCf ? fmtCurrency(lastCf.freeCF) : 'N/A'}。${lastCf && lastCf.operatingCF > 0 ? '本業からのキャッシュ創出は安定しています' : '営業CFの安定性に課題があります'}。`;
  }
  if (cp.includes('負債') || cp.includes('借入') || cp.includes('d/e')) {
    return `【負債分析】有利子負債: ${lastBs ? fmtCurrency(lastBs.interestBearingDebt) : 'N/A'}、自己資本比率: ${lastBs ? fmtPct(lastBs.equityRatio) : 'N/A'}。${lastBs && lastBs.equityRatio > 50 ? '財務基盤は健全で、追加の借入余力もあります' : lastBs && lastBs.equityRatio > 30 ? '標準的な財務水準です' : '財務レバレッジが高く、金利上昇リスクに注意が必要です'}。`;
  }
  if (cp.includes('per') || cp.includes('pbr') || cp.includes('バリュエーション')) {
    return `【バリュエーション】PER: ${s.per}倍、PBR: ${s.pbr}倍。${s.per > 20 ? '市場は高い成長期待を織り込んでいます。期待が裏切られた場合の下落リスクに注意' : s.per > 12 ? '適正水準のバリュエーションです' : '割安圏にあります。割安な理由を精査し、カタリストの有無を確認しましょう'}。`;
  }
  if (cp.includes('配当') || cp.includes('還元')) {
    return `【株主還元】配当利回り: ${s.dividendYield}%。${s.dividendYield > 3 ? '高配当銘柄に分類されます。配当の持続性をFCFから確認しましょう' : '配当利回りは標準的です。総還元性向（配当+自社株買い）も合わせて確認しましょう'}。`;
  }

  // 汎用フォールバック
  return `【${itemTitle}の観点から】${s.stockName}（${s.stockCode}）について「${checkPointText}」を分析しました。直近の業績では売上高${fmtCurrency(last.revenue)}（前年比${last.revenueYoY != null ? fmtPct(last.revenueYoY) : 'N/A'}）、営業利益率${fmtPct(last.operatingMargin)}、ROE ${fmtPct(last.roe)}です。この観点からの詳細な分析には、有価証券報告書や業界データの確認を推奨します。`;
}

/**
 * AI分析の深掘り（モック）
 */
export async function generateDeepDive(
  stockCode: string,
  _itemTitle: string,
  _checkPointText: string,
  currentAnalysis: string,
): Promise<string> {
  const financials = await getCompanyFinancials(stockCode);
  await new Promise((r) => setTimeout(r, 300 + Math.random() * 500));

  if (!financials) return '深掘りデータが取得できませんでした。';

  const s = financials.summary;
  const d = financials.annualResults;
  const years = d.map(r => `${r.fiscalYear}: 営業利益率${fmtPct(r.operatingMargin)}, ROE${fmtPct(r.roe)}`).join(' / ');

  return `【深掘り分析】${currentAnalysis}\n\n▼ 時系列データ\n${years}\n\n▼ 追加観点\n・${s.sector}セクター内での相対的な位置付けを確認してください\n・過去の同様の局面で業績がどう推移したかを参照してください\n・経営陣の直近の発言やIR資料から、この項目に関する方針を確認することを推奨します`;
}

/**
 * AIへの自由質問（モック）
 */
export async function generateAiAnswer(
  stockCode: string,
  itemTitle: string,
  question: string,
): Promise<string> {
  const financials = await getCompanyFinancials(stockCode);
  await new Promise((r) => setTimeout(r, 200 + Math.random() * 400));

  if (!financials) return '回答を生成できませんでした。';

  const s = financials.summary;
  const last = financials.annualResults[financials.annualResults.length - 1];

  return `【${question}への回答】\n${s.stockName}（${s.stockCode}）の「${itemTitle}」の観点からお答えします。\n\n直近の業績データ（売上${fmtCurrency(last.revenue)}、営業利益率${fmtPct(last.operatingMargin)}、ROE${fmtPct(last.roe)}）を踏まえると、この質問に対しては以下のポイントが重要です：\n\n1. ${s.sector}セクターの特性を考慮する必要があります\n2. 同業他社との比較データを収集することを推奨します\n3. 有価証券報告書のセグメント情報で詳細を確認できます\n\nより正確な分析のためには、具体的な数値データを追加入力してください。`;
}

// ============================================
// タイトル → ジェネレータのマッピング
// ============================================

type Generator = (f: CompanyFinancials) => BNBlock[];

function selectGenerator(title: string): Generator {
  const t = title.toLowerCase();

  // PL系
  if (t.includes('売上') && t.includes('成長')) return genRevenueGrowth;
  if (t.includes('営業利益') && t.includes('成長')) return genProfitGrowth;
  if (t.includes('営業利益率')) return genOperatingMargin;
  if (t.includes('粗利') || t.includes('オペレーティングマージン')) return genGrossMargin;
  if (t.includes('販管費') && (t.includes('vs') || t.includes('比率'))) return genSgaAnalysis;
  if (t.includes('販管費')) return genSgaAnalysis;
  if (t.includes('レバレッジ') && t.includes('オペレーティング')) return genOperatingLeverage;

  // CF系
  if (t.includes('営業cf') && t.includes('安定')) return genOcfStability;
  if (t.includes('営業cf') && t.includes('乖離')) return genOcfVsProfit;
  if (t.includes('運転資本')) return genWorkingCapital;
  if (t.includes('投資cf') || t.includes('capex')) return genCapexAnalysis;
  if (t.includes('フリーcf') && t.includes('マージン')) return genFcfMargin;
  if (t.includes('フリーcf')) return genFcfTrend;

  // BS系
  if (t.includes('有利子負債')) return genDebtAnalysis;
  if (t.includes('自己資本') && t.includes('現金')) return genNetCash;
  if (t.includes('財務レバレッジ')) return genFinancialLeverage;
  if (t.includes('流動比率') || t.includes('自己資本比率')) return genLiquidityRatio;
  if (t.includes('dupont') || t.includes('デュポン')) return genDuPont;
  if (t.includes('棚卸') || t.includes('在庫')) return genInventoryRisk;

  // 収益性
  if (t.includes('roe') && t.includes('roa')) return genRoeRoa;
  if (t.includes('roic') && t.includes('wacc')) return genRoicVsWacc;
  if (t.includes('roic')) return genRoicAnalysis;
  if (t.includes('資本効率')) return genCapitalEfficiency;
  if (t.includes('回転率')) return genTurnoverRatios;

  // バリュエーション
  if (t.includes('per') && t.includes('レンジ')) return genHistoricalPer;
  if (t.includes('ev/ebitda')) return genEvEbitda;
  if (t.includes('dcf')) return genDcf;

  // 投資ストーリー
  if (t.includes('過去') && t.includes('業績')) return genPastPerformance;
  if (t.includes('現在') && t.includes('状況')) return genCurrentSituation;
  if (t.includes('将来') && t.includes('シナリオ')) return genFutureScenario;
  if (t.includes('株価評価') || t.includes('判断')) return genValuationJudgment;
  if (t.includes('リスク') && t.includes('サマリー')) return genRiskSummary;

  // リスク系
  if (t.includes('財務リスク')) return genFinancialRisk;
  if (t.includes('事業リスク')) return genBusinessRisk;
  if (t.includes('マクロ感応度')) return genMacroSensitivity;

  // 経営の質
  if (t.includes('経営陣')) return genManagementTrackRecord;
  if (t.includes('戦略') && t.includes('一貫性')) return genStrategyConsistency;
  if (t.includes('競争優位') || t.includes('moat')) return genMoatAnalysis;

  // その他のフォールバック
  if (t.includes('競合') || t.includes('ピア')) return genPeerComparison;
  if (t.includes('変化点') || t.includes('インフレクション')) return genInflectionPoint;
  if (t.includes('スクリーニング')) return genScreening;
  if (t.includes('ドライバー')) return genStockDriver;
  if (t.includes('イベント') || t.includes('決算')) return genEventAnalysis;

  // 完全フォールバック
  return genGenericAnalysis;
}

// ============================================
// 個別ジェネレータ
// ============================================

function genRevenueGrowth(f: CompanyFinancials): BNBlock[] {
  const d = f.annualResults;
  if (d.length < 2) return [paragraph(text('データ不足'))];
  const first = d[0], last = d[d.length - 1];
  const cagr = (Math.pow(last.revenue / first.revenue, 1 / (d.length - 1)) - 1) * 100;

  return [
    heading(`${f.summary.stockName} 売上高成長率分析`),
    paragraph(bold('期間: '), text(`${first.fiscalYear} → ${last.fiscalYear}（${d.length}年間）`)),
    paragraph(),
    paragraph(bold('売上高推移')),
    ...d.map((r) => bullet(
      text(`${r.fiscalYear}: ${fmtCurrency(r.revenue)}`),
      text(r.revenueYoY != null ? ` (前年比 ${r.revenueYoY > 0 ? '+' : ''}${fmtPct(r.revenueYoY)})` : ''),
    )),
    paragraph(),
    paragraph(bold('分析結果')),
    bullet(text(`CAGR（年平均成長率）: ${fmtPct(cagr)}`)),
    bullet(text(`直近売上高: ${fmtCurrency(last.revenue)}`)),
    bullet(text(cagr > 10 ? '高成長企業に分類。成長の持続性を確認する必要あり。' :
      cagr > 5 ? '安定成長。業界平均と比較して成長率の妥当性を検証。' :
      cagr > 0 ? '低成長。成熟フェーズの可能性。新規事業の有無を確認。' :
      '売上減少トレンド。構造的な問題の有無を精査すべき。')),
    paragraph(),
    paragraph(text('※ユーザー追記欄: 成長の質（オーガニック/M&A）、地域別内訳などを補記してください。')),
  ];
}

function genProfitGrowth(f: CompanyFinancials): BNBlock[] {
  const d = f.annualResults;
  if (d.length < 2) return [paragraph(text('データ不足'))];
  const first = d[0], last = d[d.length - 1];

  return [
    heading(`${f.summary.stockName} 利益成長分析`),
    paragraph(bold('営業利益推移')),
    ...d.map((r) => bullet(
      text(`${r.fiscalYear}: ${fmtCurrency(r.operatingIncome)} (利益率 ${fmtPct(r.operatingMargin)})`),
    )),
    paragraph(),
    paragraph(bold('純利益推移')),
    ...d.map((r) => bullet(text(`${r.fiscalYear}: ${fmtCurrency(r.netIncome)}`))),
    paragraph(),
    paragraph(bold('分析結果')),
    bullet(text(`営業利益成長率: ${growthRate(last.operatingIncome, first.operatingIncome)}`)),
    bullet(text(`純利益成長率: ${growthRate(last.netIncome, first.netIncome)}`)),
    bullet(text(`利益の質: ${last.operatingMargin > first.operatingMargin ? 'マージン改善トレンド' : 'マージン悪化傾向 — 要因分析が必要'}`)),
    paragraph(),
  ];
}

function genOperatingMargin(f: CompanyFinancials): BNBlock[] {
  const d = f.annualResults;
  const first = d[0], last = d[d.length - 1];

  return [
    heading(`${f.summary.stockName} 営業利益率の推移`),
    ...d.map((r) => bullet(text(`${r.fiscalYear}: ${fmtPct(r.operatingMargin)}`))),
    paragraph(),
    paragraph(bold('トレンド判定')),
    bullet(text(`${first.fiscalYear} → ${last.fiscalYear}: ${fmtPct(first.operatingMargin)} → ${fmtPct(last.operatingMargin)}`)),
    bullet(text(last.operatingMargin > first.operatingMargin
      ? '改善トレンド: コスト効率化や高付加価値化が進んでいる可能性'
      : '悪化トレンド: 価格競争の激化やコスト増加の影響を精査')),
    bullet(text(`業界平均との比較が必要（※ユーザーが追記）`)),
    paragraph(),
  ];
}

function genGrossMargin(f: CompanyFinancials): BNBlock[] {
  return [
    heading(`${f.summary.stockName} 粗利益率分析`),
    paragraph(text('※このモックでは売上原価データが未提供のため、営業利益率から推定')),
    paragraph(bold('営業利益率の推移（参考）')),
    ...f.annualResults.map((r) => bullet(text(`${r.fiscalYear}: ${fmtPct(r.operatingMargin)}`))),
    paragraph(),
    paragraph(text('追記ポイント: 有価証券報告書から粗利益率を確認し、原価率の変動要因を分析してください。')),
  ];
}

function genSgaAnalysis(f: CompanyFinancials): BNBlock[] {
  const d = f.annualResults;
  return [
    heading(`${f.summary.stockName} 販管費分析`),
    paragraph(text('推定販管費率（= 粗利益率 − 営業利益率として概算）')),
    ...d.map((r) => {
      const estGross = r.operatingMargin + 15; // 粗利益率を概算
      const estSga = estGross - r.operatingMargin;
      return bullet(text(`${r.fiscalYear}: 推定SGA率 ${fmtPct(estSga)}, 営業利益率 ${fmtPct(r.operatingMargin)}`));
    }),
    paragraph(),
    paragraph(bold('判定フレームワーク')),
    bullet(text('SGA率↓ & 営業利益率↑ → 費用効率改善（良好）')),
    bullet(text('SGA率↑ & 営業利益率↓ → コスト膨張（要注意）')),
    bullet(text('SGA率↓ & 営業利益率↓ → 原価率悪化の可能性')),
    bullet(text('SGA率↑ & 営業利益率↑ → 成長投資が奏功')),
    paragraph(),
    paragraph(text('※実際の販管費データは有価証券報告書から取得し、上記概算を更新してください。')),
  ];
}

function genOperatingLeverage(f: CompanyFinancials): BNBlock[] {
  return [
    heading(`${f.summary.stockName} オペレーティングレバレッジ分析`),
    paragraph(text('売上変動に対する利益の感応度を評価')),
    paragraph(bold('推定固定費比率')),
    bullet(text(`営業利益率: ${fmtPct(f.summary.roe > 10 ? f.annualResults[f.annualResults.length - 1].operatingMargin : 5)}`)),
    bullet(text(`業種: ${f.summary.sector} — ${f.summary.sector === '銀行業' || f.summary.sector === '情報・通信業' ? '固定費比率が高い傾向' : '変動費比率が比較的高い傾向'}`)),
    paragraph(),
    paragraph(text('追記: 景気後退シナリオでの売上-10%時の利益影響をシミュレーションしてください。')),
  ];
}

function genOcfStability(f: CompanyFinancials): BNBlock[] {
  const d = f.cashFlows;
  const allPositive = d.every((r) => r.operatingCF > 0);

  return [
    heading(`${f.summary.stockName} 営業CF安定性分析`),
    paragraph(bold('営業キャッシュフロー推移')),
    ...d.map((r) => bullet(text(`${r.fiscalYear}: ${fmtCurrency(r.operatingCF)}`))),
    paragraph(),
    paragraph(bold('判定')),
    bullet(text(allPositive ? '全期間プラス: 本業の現金創出力は安定' : '一部期間でマイナス: 運転資本の変動や特殊要因を確認')),
    bullet(text(`直近営業CF: ${fmtCurrency(d[d.length - 1].operatingCF)}`)),
    paragraph(),
  ];
}

function genOcfVsProfit(f: CompanyFinancials): BNBlock[] {
  const d = f.annualResults;
  const cf = f.cashFlows;
  return [
    heading(`${f.summary.stockName} 営業CF vs 営業利益`),
    ...d.map((r, i) => {
      const ocf = cf[i]?.operatingCF;
      return bullet(text(`${r.fiscalYear}: 営業利益 ${fmtCurrency(r.operatingIncome)} / 営業CF ${ocf != null ? fmtCurrency(ocf) : 'N/A'}`));
    }),
    paragraph(),
    paragraph(text('営業CFが営業利益を大幅に下回る場合、売掛金膨張や在庫積み上げの可能性あり。')),
  ];
}

function genWorkingCapital(f: CompanyFinancials): BNBlock[] {
  return [
    heading(`${f.summary.stockName} 運転資本分析`),
    paragraph(text('※モックデータでは運転資本の内訳（売掛金・在庫・買掛金）が未提供')),
    paragraph(bold('確認ポイント')),
    bullet(text('売掛金回転日数の推移')),
    bullet(text('棚卸資産回転日数の推移')),
    bullet(text('買掛金回転日数の推移')),
    bullet(text('CCC（Cash Conversion Cycle）の計算')),
    paragraph(),
    paragraph(text('有価証券報告書のBSデータから追記してください。')),
  ];
}

function genCapexAnalysis(f: CompanyFinancials): BNBlock[] {
  const cf = f.cashFlows;
  return [
    heading(`${f.summary.stockName} 投資CF（Capex）分析`),
    ...cf.map((r) => bullet(text(`${r.fiscalYear}: 投資CF ${fmtCurrency(r.investingCF)} / 営業CF ${fmtCurrency(r.operatingCF)}`))),
    paragraph(),
    paragraph(bold('Capex比率（投資CF/営業CF）')),
    ...cf.map((r) => {
      const ratio = r.operatingCF !== 0 ? Math.abs(r.investingCF / r.operatingCF) * 100 : 0;
      return bullet(text(`${r.fiscalYear}: ${fmtPct(ratio)}`));
    }),
    paragraph(),
    bullet(text('50%以下: 効率的な投資水準')),
    bullet(text('50-80%: やや積極投資')),
    bullet(text('80%超: 過剰投資の疑いあり — FCFへの影響を注視')),
  ];
}

function genFcfTrend(f: CompanyFinancials): BNBlock[] {
  const cf = f.cashFlows;
  const first = cf[0], last = cf[cf.length - 1];
  return [
    heading(`${f.summary.stockName} フリーCFトレンド`),
    ...cf.map((r) => bullet(text(`${r.fiscalYear}: FCF ${fmtCurrency(r.freeCF)}`))),
    paragraph(),
    paragraph(bold('トレンド')),
    bullet(text(`${first.fiscalYear} → ${last.fiscalYear}: ${fmtCurrency(first.freeCF)} → ${fmtCurrency(last.freeCF)}`)),
    bullet(text(last.freeCF > first.freeCF ? 'FCF成長トレンド: 企業価値の源泉が強化' : 'FCF低下傾向: Capex増加や営業CF悪化の影響を確認')),
    paragraph(),
  ];
}

function genFcfMargin(f: CompanyFinancials): BNBlock[] {
  const d = f.annualResults;
  const cf = f.cashFlows;
  return [
    heading(`${f.summary.stockName} FCFマージン推移`),
    ...d.map((r, i) => {
      const fcf = cf[i]?.freeCF;
      const margin = fcf != null && r.revenue > 0 ? (fcf / r.revenue) * 100 : 0;
      return bullet(text(`${r.fiscalYear}: FCFマージン ${fmtPct(margin)} (FCF ${fcf != null ? fmtCurrency(fcf) : 'N/A'})`));
    }),
    paragraph(),
    paragraph(text('FCFマージン10%超は高収益ビジネスモデル。5%未満は要注意。')),
  ];
}

function genDebtAnalysis(f: CompanyFinancials): BNBlock[] {
  const bs = f.balanceSheets;
  return [
    heading(`${f.summary.stockName} 有利子負債分析`),
    ...bs.map((r) => bullet(text(`${r.fiscalYear}: 有利子負債 ${fmtCurrency(r.interestBearingDebt)} / 純資産 ${fmtCurrency(r.netAssets)}`))),
    paragraph(),
    paragraph(bold('D/Eレシオ推移')),
    ...bs.map((r) => {
      const de = r.netAssets > 0 ? r.interestBearingDebt / r.netAssets : 0;
      return bullet(text(`${r.fiscalYear}: ${de.toFixed(2)}倍`));
    }),
    paragraph(),
    bullet(text('D/E < 0.5: 低レバレッジ（安全）')),
    bullet(text('D/E 0.5-1.0: 適正水準')),
    bullet(text('D/E > 1.0: 高レバレッジ（要注意）')),
  ];
}

function genNetCash(f: CompanyFinancials): BNBlock[] {
  const bs = f.balanceSheets;
  const cf = f.cashFlows;
  return [
    heading(`${f.summary.stockName} 現金・自己資本推移`),
    ...bs.map((r, i) => {
      const cash = cf[i]?.cashAndEquivalents;
      const netCash = cash != null ? cash - r.interestBearingDebt : null;
      return bullet(text(`${r.fiscalYear}: 現金等 ${cash != null ? fmtCurrency(cash) : 'N/A'} / 有利子負債 ${fmtCurrency(r.interestBearingDebt)}${netCash != null ? ` → ネット${netCash > 0 ? 'キャッシュ' : 'デット'} ${fmtCurrency(Math.abs(netCash))}` : ''}`));
    }),
    paragraph(),
    paragraph(bold('自己資本推移')),
    ...bs.map((r) => bullet(text(`${r.fiscalYear}: ${fmtCurrency(r.shareholdersEquity)} (自己資本比率 ${fmtPct(r.equityRatio)})`))),
  ];
}

function genFinancialLeverage(f: CompanyFinancials): BNBlock[] {
  const bs = f.balanceSheets;
  return [
    heading(`${f.summary.stockName} 財務レバレッジ分析`),
    paragraph(bold('総資産/自己資本（財務レバレッジ倍率）')),
    ...bs.map((r) => {
      const lev = r.shareholdersEquity > 0 ? r.totalAssets / r.shareholdersEquity : 0;
      return bullet(text(`${r.fiscalYear}: ${lev.toFixed(1)}倍 (自己資本比率 ${fmtPct(r.equityRatio)})`));
    }),
    paragraph(),
    paragraph(text('レバレッジが高いとROEは高く見えるが、不況時のリスクが増大する。')),
  ];
}

function genLiquidityRatio(f: CompanyFinancials): BNBlock[] {
  const bs = f.balanceSheets;
  return [
    heading(`${f.summary.stockName} 流動性・自己資本比率`),
    paragraph(bold('自己資本比率推移')),
    ...bs.map((r) => bullet(text(`${r.fiscalYear}: ${fmtPct(r.equityRatio)}`))),
    paragraph(),
    paragraph(bold('判定基準')),
    bullet(text('50%以上: 極めて健全')),
    bullet(text('30-49%: 通常レベル')),
    bullet(text('20%以下: 財務リスク高')),
    paragraph(),
    paragraph(text('※流動比率は有価証券報告書の流動資産・流動負債から計算してください。')),
  ];
}

function genDuPont(f: CompanyFinancials): BNBlock[] {
  const d = f.annualResults;
  const bs = f.balanceSheets;
  return [
    heading(`${f.summary.stockName} DuPont分析`),
    paragraph(text('ROE = 利益率 × 総資産回転率 × 財務レバレッジ')),
    paragraph(),
    ...d.map((r, i) => {
      const b = bs[i];
      if (!b) return bullet(text(`${r.fiscalYear}: データ不足`));
      const profitMargin = r.revenue > 0 ? (r.netIncome / r.revenue) * 100 : 0;
      const assetTurnover = b.totalAssets > 0 ? r.revenue / b.totalAssets : 0;
      const leverage = b.shareholdersEquity > 0 ? b.totalAssets / b.shareholdersEquity : 0;
      return bullet(
        text(`${r.fiscalYear}: ROE ${fmtPct(r.roe)} = `),
        text(`利益率 ${fmtPct(profitMargin)} × 回転率 ${assetTurnover.toFixed(2)} × レバレッジ ${leverage.toFixed(1)}`),
      );
    }),
    paragraph(),
    paragraph(text('ROEが高い理由がレバレッジ依存の場合は危険信号。利益率主導の高ROEが理想。')),
  ];
}

function genInventoryRisk(f: CompanyFinancials): BNBlock[] {
  return [
    heading(`${f.summary.stockName} 棚卸資産（在庫）リスク分析`),
    paragraph(text(`業種: ${f.summary.sector} / ${f.summary.industry}`)),
    paragraph(),
    paragraph(bold('確認ポイント')),
    bullet(text('棚卸資産の増減推移（BS項目）')),
    bullet(text('在庫回転率（= 売上原価 / 棚卸資産）')),
    bullet(text('在庫が急増していないか（業績悪化の先行指標）')),
    paragraph(),
    paragraph(text(`${f.summary.industry}業界の特性: ${
      ['アパレル', '半導体', '電子部品'].some((s) => f.summary.industry.includes(s))
        ? '在庫が業績に直結しやすい業界。特に注意が必要。'
        : '比較的在庫リスクは低い業界だが、定期的なチェックは必要。'
    }`)),
    paragraph(),
    paragraph(text('※有価証券報告書のBS項目から在庫データを追記してください。')),
  ];
}

function genRoeRoa(f: CompanyFinancials): BNBlock[] {
  const d = f.annualResults;
  return [
    heading(`${f.summary.stockName} ROE・ROA推移`),
    ...d.map((r) => bullet(text(`${r.fiscalYear}: ROE ${fmtPct(r.roe)} / ROA ${fmtPct(r.roa)}`))),
    paragraph(),
    paragraph(bold('評価')),
    bullet(text(`直近ROE: ${fmtPct(d[d.length - 1].roe)} ${d[d.length - 1].roe >= 10 ? '（優良水準）' : d[d.length - 1].roe >= 8 ? '（平均的）' : '（低水準）'}`)),
    bullet(text(`直近ROA: ${fmtPct(d[d.length - 1].roa)} ${d[d.length - 1].roa >= 5 ? '（良好）' : '（改善余地あり）'}`)),
    bullet(text(d[d.length - 1].roe > d[0].roe ? 'ROE改善トレンド' : 'ROE低下トレンド — DuPont分析で要因分解を推奨')),
  ];
}

function genRoicAnalysis(f: CompanyFinancials): BNBlock[] {
  return [
    heading(`${f.summary.stockName} ROIC分析`),
    paragraph(text('ROIC = 税後営業利益(NOPAT) / 投下資本')),
    paragraph(),
    paragraph(bold('推定ROIC（概算）')),
    ...f.annualResults.map((r, i) => {
      const bs = f.balanceSheets[i];
      if (!bs) return bullet(text(`${r.fiscalYear}: データ不足`));
      const nopat = r.operatingIncome * 0.7; // 概算税率30%
      const investedCapital = bs.shareholdersEquity + bs.interestBearingDebt;
      const roic = investedCapital > 0 ? (nopat / investedCapital) * 100 : 0;
      return bullet(text(`${r.fiscalYear}: 推定ROIC ${fmtPct(roic)}`));
    }),
    paragraph(),
    paragraph(text('ROIC > WACC(通常5-8%) であれば価値創造企業。')),
    paragraph(text('※正確な計算は有価証券報告書のデータから行ってください。')),
  ];
}

function genCapitalEfficiency(f: CompanyFinancials): BNBlock[] {
  const d = f.annualResults;
  return [
    heading(`${f.summary.stockName} 資本効率の改善・悪化`),
    paragraph(bold('ROE推移から読む資本効率')),
    ...d.map((r) => bullet(text(`${r.fiscalYear}: ROE ${fmtPct(r.roe)} / ROA ${fmtPct(r.roa)}`))),
    paragraph(),
    paragraph(text(d[d.length - 1].roe > d[0].roe
      ? '資本効率改善トレンド: 営業利益率の改善または資産効率の向上が寄与'
      : '資本効率悪化トレンド: 成長鈍化または過剰投資の可能性')),
  ];
}

function genRoicVsWacc(f: CompanyFinancials): BNBlock[] {
  return [
    heading(`${f.summary.stockName} ROIC vs WACC分析`),
    paragraph(text('ROIC > WACC → 価値創造 / ROIC < WACC → 価値破壊')),
    paragraph(),
    paragraph(bold('推定WACC')),
    bullet(text(`市場: ${f.summary.market}`)),
    bullet(text(`想定WACC: 5-8%（日本企業の一般的なレンジ）`)),
    paragraph(),
    paragraph(text('ROICが安定的にWACCを上回る企業は長期的に株価が上昇する傾向。')),
    paragraph(text('※正確なWACC計算にはベータ値・リスクフリーレート・負債コスト等が必要です。')),
  ];
}

function genTurnoverRatios(f: CompanyFinancials): BNBlock[] {
  return [
    heading(`${f.summary.stockName} 回転率分析`),
    paragraph(text('※モックデータでは詳細なBS内訳が未提供')),
    paragraph(bold('確認すべき指標')),
    bullet(text('総資産回転率 = 売上高 / 総資産')),
    ...f.annualResults.map((r, i) => {
      const bs = f.balanceSheets[i];
      if (!bs) return bullet(text(`${r.fiscalYear}: データ不足`));
      const turnover = bs.totalAssets > 0 ? r.revenue / bs.totalAssets : 0;
      return bullet(text(`  ${r.fiscalYear}: ${turnover.toFixed(2)}回`));
    }),
    paragraph(),
    bullet(text('在庫回転率、売掛金回転率は有価証券報告書から追記してください。')),
  ];
}

function genHistoricalPer(f: CompanyFinancials): BNBlock[] {
  return [
    heading(`${f.summary.stockName} PER分析`),
    paragraph(bold('現在のバリュエーション')),
    bullet(text(`PER: ${f.summary.per}倍`)),
    bullet(text(`PBR: ${f.summary.pbr}倍`)),
    bullet(text(`配当利回り: ${f.summary.dividendYield}%`)),
    paragraph(),
    paragraph(text('過去PERレンジとの比較は、過去5年の株価データから算出してください。')),
    paragraph(text(`一般に${f.summary.sector}の平均PERと比較して${f.summary.per > 20 ? '割高水準' : f.summary.per > 12 ? '適正水準' : '割安水準'}。`)),
  ];
}

function genEvEbitda(f: CompanyFinancials): BNBlock[] {
  return [
    heading(`${f.summary.stockName} EV/EBITDA分析`),
    paragraph(text(`時価総額: ${(f.summary.marketCap).toLocaleString()}億円`)),
    paragraph(),
    paragraph(text('※EV/EBITDA = (時価総額 + 純有利子負債) / EBITDA')),
    paragraph(text('同業他社との相対比較に最も適した指標。')),
    paragraph(text('追記: 同業3-5社のEV/EBITDAを調べて比較してください。')),
  ];
}

function genDcf(f: CompanyFinancials): BNBlock[] {
  const lastFcf = f.cashFlows[f.cashFlows.length - 1]?.freeCF || 0;
  return [
    heading(`${f.summary.stockName} DCF分析（簡易版）`),
    paragraph(bold('前提条件（仮定）')),
    bullet(text(`直近FCF: ${fmtCurrency(lastFcf)}`)),
    bullet(text('割引率(WACC): 7%')),
    bullet(text('永久成長率: 2%')),
    paragraph(),
    paragraph(bold('簡易DCF推定')),
    bullet(text(`ターミナルバリュー = FCF × (1+g) / (WACC-g) = ${fmtCurrency(lastFcf * 1.02 / 0.05)}`)),
    paragraph(),
    paragraph(text('※これは極めて簡易的な計算です。実際の分析では5年間のFCF予測を行い、適切なWACCを適用してください。')),
  ];
}

// ============================================
// 投資ストーリー系
// ============================================

function genPastPerformance(f: CompanyFinancials): BNBlock[] {
  const d = f.annualResults;
  const first = d[0], last = d[d.length - 1];
  return [
    heading(`${f.summary.stockName} 過去の業績（事実）`),
    bullet(text(`売上高: ${fmtCurrency(first.revenue)} → ${fmtCurrency(last.revenue)} (${growthRate(last.revenue, first.revenue)})`)),
    bullet(text(`営業利益: ${fmtCurrency(first.operatingIncome)} → ${fmtCurrency(last.operatingIncome)}`)),
    bullet(text(`営業利益率: ${fmtPct(first.operatingMargin)} → ${fmtPct(last.operatingMargin)}`)),
    bullet(text(`ROE: ${fmtPct(first.roe)} → ${fmtPct(last.roe)}`)),
    paragraph(),
    paragraph(text('追記: 業績変動の主な要因（新製品、M&A、市場変化等）を記載してください。')),
  ];
}

function genCurrentSituation(f: CompanyFinancials): BNBlock[] {
  const s = f.summary;
  return [
    heading(`${s.stockName} 現在の企業状況`),
    bullet(text(`株価: ${s.currentPrice.toLocaleString()}円 / 時価総額: ${s.marketCap.toLocaleString()}億円`)),
    bullet(text(`PER: ${s.per}倍 / PBR: ${s.pbr}倍`)),
    bullet(text(`ROE: ${s.roe}% / ROA: ${s.roa}%`)),
    bullet(text(`配当利回り: ${s.dividendYield}%`)),
    bullet(text(`市場: ${s.market} / セクター: ${s.sector}`)),
    paragraph(),
    paragraph(text('追記: 直近の決算内容、経営課題、競争環境の変化を記載してください。')),
  ];
}

function genFutureScenario(f: CompanyFinancials): BNBlock[] {
  return [
    heading(`${f.summary.stockName} 将来シナリオ`),
    paragraph(bold('ブルケース（楽観）')),
    bullet(text('追記: 成長ドライバー、市場拡大、新規事業の成功シナリオ')),
    paragraph(bold('ベースケース（基本）')),
    bullet(text('追記: 現状維持〜緩やかな成長シナリオ')),
    paragraph(bold('ベアケース（悲観）')),
    bullet(text('追記: 競争激化、需要減退、規制リスクシナリオ')),
    paragraph(),
  ];
}

function genValuationJudgment(f: CompanyFinancials): BNBlock[] {
  return [
    heading(`${f.summary.stockName} 株価評価（判断）`),
    bullet(text(`現在PER: ${f.summary.per}倍 → ${f.summary.per > 20 ? '割高圏' : f.summary.per > 12 ? '適正圏' : '割安圏'}`)),
    bullet(text(`現在PBR: ${f.summary.pbr}倍`)),
    paragraph(),
    paragraph(text('追記: 目標株価、アップサイド/ダウンサイド、投資判断（買い/売り/保有）を記載してください。')),
  ];
}

function genRiskSummary(f: CompanyFinancials): BNBlock[] {
  return [
    heading(`${f.summary.stockName} リスクサマリー`),
    bullet(text(`財務リスク: 自己資本比率 ${f.balanceSheets[f.balanceSheets.length - 1]?.equityRatio ?? 'N/A'}%`)),
    bullet(text(`事業リスク: ${f.summary.sector}セクターの競争環境`)),
    bullet(text('マクロリスク: 為替・金利感応度')),
    bullet(text('規制リスク: 追記してください')),
    paragraph(),
    paragraph(text('各リスク要因の詳細と対策を補記してください。')),
  ];
}

// ============================================
// その他のジェネレータ
// ============================================

function genFinancialRisk(f: CompanyFinancials): BNBlock[] {
  const bs = f.balanceSheets[f.balanceSheets.length - 1];
  return [
    heading(`${f.summary.stockName} 財務リスク分析`),
    bullet(text(`自己資本比率: ${bs ? fmtPct(bs.equityRatio) : 'N/A'} ${bs && bs.equityRatio > 50 ? '（健全）' : bs && bs.equityRatio > 30 ? '（普通）' : '（要注意）'}`)),
    bullet(text(`有利子負債: ${bs ? fmtCurrency(bs.interestBearingDebt) : 'N/A'}`)),
    paragraph(),
    paragraph(text('追記: 金利上昇シナリオでの影響、返済スケジュール等。')),
  ];
}

function genBusinessRisk(f: CompanyFinancials): BNBlock[] {
  return [
    heading(`${f.summary.stockName} 事業リスク分析`),
    bullet(text(`セクター: ${f.summary.sector} / ${f.summary.industry}`)),
    bullet(text('確認ポイント: 顧客集中度、競争環境の変化、技術陳腐化リスク')),
    paragraph(),
    paragraph(text('追記: 具体的な事業リスク要因を記載してください。')),
  ];
}

function genMacroSensitivity(f: CompanyFinancials): BNBlock[] {
  return [
    heading(`${f.summary.stockName} マクロ感応度分析`),
    bullet(text(`業種: ${f.summary.sector} — ${f.summary.sector === '輸送用機器' ? '為替影響大（円安メリット）' : f.summary.sector === '銀行業' ? '金利感応度高' : '為替・金利の影響は限定的'}`)),
    paragraph(),
    paragraph(text('追記: 為替±10円、金利±1%時の業績シミュレーション。')),
  ];
}

function genManagementTrackRecord(f: CompanyFinancials): BNBlock[] {
  return [
    heading(`${f.summary.stockName} 経営陣の実績`),
    paragraph(text('追記ポイント:')),
    bullet(text('CEO/社長の在任期間と実績')),
    bullet(text('過去の中期経営計画の達成率')),
    bullet(text('株主還元の姿勢（増配・自社株買いの履歴）')),
    paragraph(),
  ];
}

function genStrategyConsistency(f: CompanyFinancials): BNBlock[] {
  return [
    heading(`${f.summary.stockName} 戦略の一貫性`),
    paragraph(text('追記ポイント:')),
    bullet(text('中期経営計画の方向性')),
    bullet(text('過去の戦略変更の頻度と理由')),
    bullet(text('資本配分の一貫性')),
    paragraph(),
  ];
}

function genMoatAnalysis(f: CompanyFinancials): BNBlock[] {
  const margin = f.annualResults[f.annualResults.length - 1]?.operatingMargin || 0;
  return [
    heading(`${f.summary.stockName} 競争優位性（Moat）分析`),
    paragraph(bold('利益率からの推定')),
    bullet(text(`営業利益率: ${fmtPct(margin)} ${margin > 20 ? '→ 強い価格決定力を示唆' : margin > 10 ? '→ 一定の競争優位性' : '→ 競争が激しい環境'}`)),
    paragraph(),
    paragraph(bold('Moatの種類（確認すべき項目）')),
    bullet(text('ネットワーク効果')),
    bullet(text('ブランド力')),
    bullet(text('スイッチングコスト')),
    bullet(text('コスト優位性（規模の経済）')),
    bullet(text('知的財産（特許等）')),
    paragraph(),
    paragraph(text('追記: どのMoatが該当するか、具体例とともに記載してください。')),
  ];
}

function genPeerComparison(f: CompanyFinancials): BNBlock[] {
  return [
    heading(`${f.summary.stockName} 競合比較`),
    paragraph(text(`セクター: ${f.summary.sector} / ${f.summary.industry}`)),
    paragraph(),
    paragraph(text('比較対象企業を3-5社選定し、以下の指標で比較:')),
    bullet(text('売上高成長率')),
    bullet(text('営業利益率')),
    bullet(text('ROE / ROIC')),
    bullet(text('PER / PBR / EV/EBITDA')),
    paragraph(),
    paragraph(text('追記: 比較データを記載してください。')),
  ];
}

function genInflectionPoint(f: CompanyFinancials): BNBlock[] {
  const d = f.annualResults;
  const last = d[d.length - 1], prev = d[d.length - 2];
  return [
    heading(`${f.summary.stockName} 変化点分析`),
    paragraph(bold('直近の変化')),
    bullet(text(`営業利益率: ${prev ? fmtPct(prev.operatingMargin) : 'N/A'} → ${fmtPct(last.operatingMargin)} ${prev && last.operatingMargin > prev.operatingMargin ? '（改善）' : '（悪化）'}`)),
    bullet(text(`ROE: ${prev ? fmtPct(prev.roe) : 'N/A'} → ${fmtPct(last.roe)}`)),
    paragraph(),
    paragraph(text('追記: 企業フェーズの変化（成長→成熟、構造改革等）を記載してください。')),
  ];
}

function genScreening(f: CompanyFinancials): BNBlock[] {
  const last = f.annualResults[f.annualResults.length - 1];
  return [
    heading(`${f.summary.stockName} スクリーニング結果`),
    bullet(text(`ROE: ${fmtPct(last.roe)} ${last.roe > 10 ? 'PASS' : 'FAIL'}`)),
    bullet(text(`営業利益成長: ${last.operatingIncomeYoY != null ? (last.operatingIncomeYoY > 0 ? 'PASS' : 'FAIL') : 'N/A'}`)),
    bullet(text(`営業CF: ${f.cashFlows[f.cashFlows.length - 1]?.operatingCF > 0 ? 'PASS' : 'FAIL'}`)),
    paragraph(),
  ];
}

function genStockDriver(f: CompanyFinancials): BNBlock[] {
  return [
    heading(`${f.summary.stockName} 株価ドライバー分析`),
    paragraph(text('追記: 株価を動かしている主要因を特定してください。')),
    bullet(text('売上成長 / 利益率変化 / EPS成長')),
    bullet(text('PER拡大・縮小の要因')),
    paragraph(),
  ];
}

function genEventAnalysis(f: CompanyFinancials): BNBlock[] {
  return [
    heading(`${f.summary.stockName} イベント分析`),
    paragraph(text('追記: 直近の重要イベントと株価への影響を記載してください。')),
    bullet(text('決算発表の株価反応')),
    bullet(text('ガイダンス修正')),
    bullet(text('自社株買い・増配')),
    bullet(text('M&A・提携')),
    paragraph(),
  ];
}

function genGenericAnalysis(f: CompanyFinancials): BNBlock[] {
  return [
    heading(`${f.summary.stockName} 分析`),
    paragraph(bold('基本情報')),
    bullet(text(`市場: ${f.summary.market} / セクター: ${f.summary.sector}`)),
    bullet(text(`時価総額: ${f.summary.marketCap.toLocaleString()}億円`)),
    bullet(text(`PER: ${f.summary.per}倍 / PBR: ${f.summary.pbr}倍`)),
    bullet(text(`ROE: ${f.summary.roe}% / ROA: ${f.summary.roa}%`)),
    paragraph(),
    paragraph(text('分析内容を追記してください。')),
  ];
}
