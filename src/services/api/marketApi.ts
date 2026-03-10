// ============================================
// 市場データ API（モック）
// ============================================

export interface MarketIndex {
  name: string;
  value: number;
  change: number;
  changePercent: number;
}

export interface RankingItem {
  stockCode: string;
  stockName: string;
  value: number;
  change: number;
}

export interface DisclosureItem {
  id: string;
  stockCode: string;
  stockName: string;
  title: string;
  type: string;
  date: string;
}

export interface SectorSummary {
  name: string;
  change: number;
}

// ─── 市場指数 ─────────────────────────────

export async function getMarketIndices(): Promise<MarketIndex[]> {
  await delay(100);
  return [
    { name: '日経平均', value: 39872.15, change: 234.56, changePercent: 0.59 },
    { name: 'TOPIX', value: 2745.62, change: 12.34, changePercent: 0.45 },
    { name: 'グロース250', value: 687.43, change: -5.21, changePercent: -0.75 },
    { name: 'JPX日経400', value: 18234.51, change: 89.12, changePercent: 0.49 },
    { name: 'TOPIX Core30', value: 1423.78, change: 8.67, changePercent: 0.61 },
  ];
}

// ─── 値上がり率ランキング ──────────────────

export async function getTopGainers(): Promise<RankingItem[]> {
  await delay(100);
  return [
    { stockCode: '3994', stockName: 'マネーフォワード', value: 6830, change: 14.8 },
    { stockCode: '4478', stockName: 'フリー', value: 3925, change: 12.3 },
    { stockCode: '7342', stockName: 'ウェルスナビ', value: 1845, change: 9.7 },
    { stockCode: '4385', stockName: 'メルカリ', value: 2156, change: 8.2 },
    { stockCode: '6526', stockName: 'ソシオネクスト', value: 3450, change: 7.5 },
    { stockCode: '4755', stockName: '楽天グループ', value: 892, change: 6.8 },
    { stockCode: '9613', stockName: 'NTTデータ', value: 2345, change: 5.9 },
    { stockCode: '6723', stockName: 'ルネサスエレク', value: 2780, change: 5.4 },
    { stockCode: '4568', stockName: '第一三共', value: 4520, change: 4.8 },
    { stockCode: '6920', stockName: 'レーザーテック', value: 28450, change: 4.3 },
  ];
}

// ─── 値下がり率ランキング ──────────────────

export async function getTopLosers(): Promise<RankingItem[]> {
  await delay(100);
  return [
    { stockCode: '9101', stockName: '日本郵船', value: 3890, change: -8.5 },
    { stockCode: '9104', stockName: '商船三井', value: 4120, change: -7.2 },
    { stockCode: '5401', stockName: '日本製鉄', value: 3280, change: -5.8 },
    { stockCode: '8058', stockName: '三菱商事', value: 2456, change: -4.9 },
    { stockCode: '7201', stockName: '日産自動車', value: 587, change: -4.3 },
    { stockCode: '6752', stockName: 'パナソニックHD', value: 1234, change: -3.8 },
    { stockCode: '4502', stockName: '武田薬品', value: 4180, change: -3.2 },
    { stockCode: '8035', stockName: '東京エレク', value: 23450, change: -2.9 },
    { stockCode: '6501', stockName: '日立', value: 3670, change: -2.5 },
    { stockCode: '7267', stockName: 'ホンダ', value: 1540, change: -2.1 },
  ];
}

// ─── 出来高ランキング ──────────────────────

export async function getVolumeRanking(): Promise<RankingItem[]> {
  await delay(100);
  return [
    { stockCode: '9984', stockName: 'SBG', value: 8234, change: 2.1 },
    { stockCode: '6758', stockName: 'ソニーG', value: 15670, change: 1.3 },
    { stockCode: '7203', stockName: 'トヨタ', value: 2845, change: 0.8 },
    { stockCode: '8306', stockName: '三菱UFJFG', value: 1876, change: -0.4 },
    { stockCode: '4755', stockName: '楽天グループ', value: 892, change: 6.8 },
    { stockCode: '6920', stockName: 'レーザーテック', value: 28450, change: 4.3 },
    { stockCode: '9983', stockName: 'ファストリ', value: 42350, change: 0.5 },
    { stockCode: '8035', stockName: '東京エレク', value: 23450, change: -2.9 },
    { stockCode: '7201', stockName: '日産自動車', value: 587, change: -4.3 },
    { stockCode: '6861', stockName: 'キーエンス', value: 68920, change: 1.1 },
  ];
}

// ─── 最新開示情報 ──────────────────────────

export async function getLatestDisclosures(): Promise<DisclosureItem[]> {
  await delay(100);
  const today = new Date();
  const fmt = (d: Date) => `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')}`;
  const ago = (days: number) => { const d = new Date(today); d.setDate(d.getDate() - days); return fmt(d); };

  return [
    { id: '1', stockCode: '7203', stockName: 'トヨタ自動車', title: '2025年3月期 第3四半期決算短信', type: '決算短信', date: ago(0) },
    { id: '2', stockCode: '6758', stockName: 'ソニーグループ', title: '自己株式の取得状況に関するお知らせ', type: '適時開示', date: ago(0) },
    { id: '3', stockCode: '9984', stockName: 'ソフトバンクG', title: '有価証券報告書（2024年度）', type: '有報', date: ago(1) },
    { id: '4', stockCode: '6861', stockName: 'キーエンス', title: '2025年3月期 業績予想の修正に関するお知らせ', type: '業績修正', date: ago(1) },
    { id: '5', stockCode: '9983', stockName: 'ファストリテイリング', title: '月次国内ユニクロ事業売上推移に関するお知らせ', type: '適時開示', date: ago(1) },
    { id: '6', stockCode: '8306', stockName: '三菱UFJFG', title: '剰余金の配当に関するお知らせ', type: '配当', date: ago(2) },
    { id: '7', stockCode: '9432', stockName: 'NTT', title: '代表取締役の異動に関するお知らせ', type: '人事', date: ago(2) },
    { id: '8', stockCode: '4063', stockName: '信越化学工業', title: '2025年3月期 第3四半期決算短信', type: '決算短信', date: ago(3) },
    { id: '9', stockCode: '6098', stockName: 'リクルートHD', title: '連結子会社の吸収合併に関するお知らせ', type: '適時開示', date: ago(3) },
    { id: '10', stockCode: '6367', stockName: 'ダイキン工業', title: '新中期経営計画の策定に関するお知らせ', type: '経営計画', date: ago(4) },
    { id: '11', stockCode: '4568', stockName: '第一三共', title: '米国におけるENHERTU第III相試験結果', type: '適時開示', date: ago(4) },
    { id: '12', stockCode: '6920', stockName: 'レーザーテック', title: '2025年6月期 第2四半期決算短信', type: '決算短信', date: ago(5) },
    { id: '13', stockCode: '8035', stockName: '東京エレクトロン', title: '自己株式の消却に関するお知らせ', type: '適時開示', date: ago(5) },
    { id: '14', stockCode: '3994', stockName: 'マネーフォワード', title: '2024年11月期 決算短信', type: '決算短信', date: ago(6) },
    { id: '15', stockCode: '4385', stockName: 'メルカリ', title: '海外事業に関する進捗のお知らせ', type: '適時開示', date: ago(6) },
    { id: '16', stockCode: '5401', stockName: '日本製鉄', title: 'USスチール買収に関する進捗報告', type: '適時開示', date: ago(7) },
    { id: '17', stockCode: '7267', stockName: 'ホンダ', title: 'EV新モデル発表に関するお知らせ', type: '適時開示', date: ago(7) },
    { id: '18', stockCode: '6752', stockName: 'パナソニックHD', title: '事業再編に関するお知らせ', type: '適時開示', date: ago(8) },
    { id: '19', stockCode: '9101', stockName: '日本郵船', title: '2025年3月期 通期業績予想の修正', type: '業績修正', date: ago(9) },
    { id: '20', stockCode: '6501', stockName: '日立製作所', title: 'GlobalLogic事業に関する説明資料', type: '説明資料', date: ago(10) },
  ];
}

// ─── セクターサマリー ──────────────────────

export async function getSectorSummary(): Promise<SectorSummary[]> {
  await delay(100);
  return [
    { name: '水産・農林業', change: 0.3 },
    { name: '鉱業', change: -1.2 },
    { name: '建設業', change: 0.8 },
    { name: '食料品', change: 0.1 },
    { name: '繊維製品', change: -0.4 },
    { name: '化学', change: 0.6 },
    { name: '医薬品', change: 1.2 },
    { name: '石油・石炭', change: -0.8 },
    { name: 'ゴム製品', change: 0.2 },
    { name: '窯業', change: -0.1 },
    { name: '鉄鋼', change: -1.5 },
    { name: '非鉄金属', change: 0.9 },
    { name: '金属製品', change: 0.4 },
    { name: '機械', change: 0.7 },
    { name: '電気機器', change: 1.1 },
    { name: '輸送用機器', change: -0.3 },
    { name: '精密機器', change: 0.5 },
    { name: 'その他製品', change: 0.2 },
    { name: '電気・ガス', change: -0.6 },
    { name: '陸運業', change: 0.3 },
    { name: '海運業', change: -2.1 },
    { name: '空運業', change: 0.8 },
    { name: '倉庫・運輸', change: 0.1 },
    { name: '情報・通信', change: 1.4 },
    { name: '卸売業', change: -0.5 },
    { name: '小売業', change: 0.6 },
    { name: '銀行業', change: 0.3 },
    { name: '証券・先物', change: 1.0 },
    { name: '保険業', change: 0.7 },
    { name: 'その他金融', change: 0.4 },
    { name: '不動産業', change: -0.2 },
    { name: 'サービス業', change: 0.9 },
  ];
}

// ─── ヒートマップ用データ ──────────────────

export interface HeatmapStock {
  stockCode: string;
  stockName: string;
  shortName: string;
  marketCap: number; // 億円
  change: number; // %
}

export interface HeatmapSector {
  sector: string;
  stocks: HeatmapStock[];
}

export async function getHeatmapData(): Promise<HeatmapSector[]> {
  await delay(100);
  return [
    {
      sector: '電気機器',
      stocks: [
        { stockCode: '6758', stockName: 'ソニーグループ', shortName: 'ソニーG', marketCap: 18200, change: 1.3 },
        { stockCode: '6861', stockName: 'キーエンス', shortName: 'キーエンス', marketCap: 16800, change: 1.1 },
        { stockCode: '6920', stockName: 'レーザーテック', shortName: 'レーザーテック', marketCap: 3400, change: 4.3 },
        { stockCode: '6501', stockName: '日立製作所', shortName: '日立', marketCap: 11200, change: -2.5 },
        { stockCode: '6902', stockName: 'デンソー', shortName: 'デンソー', marketCap: 7800, change: 0.4 },
        { stockCode: '6723', stockName: 'ルネサスエレク', shortName: 'ルネサス', marketCap: 5100, change: 5.4 },
        { stockCode: '6752', stockName: 'パナソニックHD', shortName: 'パナHD', marketCap: 3200, change: -3.8 },
        { stockCode: '6594', stockName: '日本電産', shortName: '日本電産', marketCap: 3800, change: -1.2 },
        { stockCode: '6526', stockName: 'ソシオネクスト', shortName: 'ソシオネクスト', marketCap: 1200, change: 7.5 },
        { stockCode: '6857', stockName: 'アドバンテスト', shortName: 'アドバンテスト', marketCap: 4500, change: 2.1 },
      ],
    },
    {
      sector: '輸送用機器',
      stocks: [
        { stockCode: '7203', stockName: 'トヨタ自動車', shortName: 'トヨタ', marketCap: 42000, change: 0.8 },
        { stockCode: '7267', stockName: 'ホンダ', shortName: 'ホンダ', marketCap: 8500, change: -2.1 },
        { stockCode: '7201', stockName: '日産自動車', shortName: '日産', marketCap: 2800, change: -4.3 },
        { stockCode: '7269', stockName: 'スズキ', shortName: 'スズキ', marketCap: 3200, change: 0.6 },
        { stockCode: '7270', stockName: 'SUBARU', shortName: 'SUBARU', marketCap: 2400, change: -0.9 },
      ],
    },
    {
      sector: '情報・通信',
      stocks: [
        { stockCode: '9984', stockName: 'ソフトバンクG', shortName: 'SBG', marketCap: 12000, change: 2.1 },
        { stockCode: '9432', stockName: 'NTT', shortName: 'NTT', marketCap: 15200, change: -0.4 },
        { stockCode: '9433', stockName: 'KDDI', shortName: 'KDDI', marketCap: 10200, change: 0.3 },
        { stockCode: '9434', stockName: 'SB(通信)', shortName: 'SB', marketCap: 8100, change: 0.7 },
        { stockCode: '9613', stockName: 'NTTデータ', shortName: 'NTTデータ', marketCap: 3600, change: 5.9 },
        { stockCode: '4755', stockName: '楽天グループ', shortName: '楽天G', marketCap: 1800, change: 6.8 },
        { stockCode: '3994', stockName: 'マネーフォワード', shortName: 'マネフォ', marketCap: 1600, change: 14.8 },
        { stockCode: '4478', stockName: 'フリー', shortName: 'フリー', marketCap: 800, change: 12.3 },
      ],
    },
    {
      sector: '銀行業',
      stocks: [
        { stockCode: '8306', stockName: '三菱UFJFG', shortName: '三菱UFJ', marketCap: 18600, change: -0.4 },
        { stockCode: '8316', stockName: '三井住友FG', shortName: '三井住友', marketCap: 12400, change: 0.2 },
        { stockCode: '8411', stockName: 'みずほFG', shortName: 'みずほ', marketCap: 7600, change: -0.8 },
        { stockCode: '8308', stockName: 'りそなHD', shortName: 'りそな', marketCap: 2200, change: 1.1 },
      ],
    },
    {
      sector: '小売業',
      stocks: [
        { stockCode: '9983', stockName: 'ファストリテイリング', shortName: 'ファストリ', marketCap: 13500, change: 0.5 },
        { stockCode: '3382', stockName: '7&iHD', shortName: '7&i', marketCap: 5800, change: -1.4 },
        { stockCode: '8267', stockName: 'イオン', shortName: 'イオン', marketCap: 2800, change: 0.8 },
        { stockCode: '9843', stockName: 'ニトリHD', shortName: 'ニトリ', marketCap: 2100, change: -0.6 },
        { stockCode: '4385', stockName: 'メルカリ', shortName: 'メルカリ', marketCap: 1200, change: 8.2 },
      ],
    },
    {
      sector: '卸売業',
      stocks: [
        { stockCode: '8058', stockName: '三菱商事', shortName: '三菱商事', marketCap: 11000, change: -4.9 },
        { stockCode: '8031', stockName: '三井物産', shortName: '三井物産', marketCap: 8800, change: -2.3 },
        { stockCode: '8001', stockName: '伊藤忠', shortName: '伊藤忠', marketCap: 10200, change: -1.5 },
        { stockCode: '8053', stockName: '住友商事', shortName: '住友商事', marketCap: 4200, change: -3.1 },
        { stockCode: '8002', stockName: '丸紅', shortName: '丸紅', marketCap: 3600, change: -2.7 },
      ],
    },
    {
      sector: '医薬品',
      stocks: [
        { stockCode: '4568', stockName: '第一三共', shortName: '第一三共', marketCap: 10800, change: 4.8 },
        { stockCode: '4502', stockName: '武田薬品', shortName: '武田', marketCap: 7200, change: -3.2 },
        { stockCode: '4519', stockName: '中外製薬', shortName: '中外製薬', marketCap: 8600, change: 1.8 },
        { stockCode: '4523', stockName: 'エーザイ', shortName: 'エーザイ', marketCap: 2400, change: 2.4 },
        { stockCode: '4503', stockName: 'アステラス', shortName: 'アステラス', marketCap: 3100, change: -0.5 },
      ],
    },
    {
      sector: '化学',
      stocks: [
        { stockCode: '4063', stockName: '信越化学工業', shortName: '信越化学', marketCap: 11600, change: 0.6 },
        { stockCode: '4188', stockName: '三菱ケミカルG', shortName: '三菱ケミG', marketCap: 1500, change: -1.8 },
        { stockCode: '4005', stockName: '住友化学', shortName: '住友化', marketCap: 900, change: -2.4 },
        { stockCode: '4911', stockName: '資生堂', shortName: '資生堂', marketCap: 2800, change: 1.3 },
        { stockCode: '4452', stockName: '花王', shortName: '花王', marketCap: 3400, change: 0.9 },
      ],
    },
    {
      sector: '海運業',
      stocks: [
        { stockCode: '9101', stockName: '日本郵船', shortName: '日本郵船', marketCap: 2200, change: -8.5 },
        { stockCode: '9104', stockName: '商船三井', shortName: '商船三井', marketCap: 1600, change: -7.2 },
        { stockCode: '9107', stockName: '川崎汽船', shortName: '川崎汽船', marketCap: 1100, change: -5.8 },
      ],
    },
    {
      sector: '半導体装置',
      stocks: [
        { stockCode: '8035', stockName: '東京エレクトロン', shortName: '東京エレク', marketCap: 14200, change: -2.9 },
        { stockCode: '6146', stockName: 'ディスコ', shortName: 'ディスコ', marketCap: 4800, change: 3.2 },
        { stockCode: '7735', stockName: 'SCREENホールディングス', shortName: 'SCREEN', marketCap: 1200, change: 1.8 },
      ],
    },
    {
      sector: '機械',
      stocks: [
        { stockCode: '6367', stockName: 'ダイキン工業', shortName: 'ダイキン', marketCap: 8200, change: 0.7 },
        { stockCode: '6301', stockName: 'コマツ', shortName: 'コマツ', marketCap: 4400, change: -1.3 },
        { stockCode: '6273', stockName: 'SMC', shortName: 'SMC', marketCap: 5600, change: 0.4 },
        { stockCode: '6954', stockName: 'ファナック', shortName: 'ファナック', marketCap: 4100, change: -0.8 },
      ],
    },
    {
      sector: '保険業',
      stocks: [
        { stockCode: '8766', stockName: '東京海上HD', shortName: '東京海上', marketCap: 8400, change: 0.9 },
        { stockCode: '8750', stockName: '第一生命HD', shortName: '第一生命', marketCap: 3800, change: 1.2 },
        { stockCode: '8630', stockName: 'SOMPOホールディングス', shortName: 'SOMPO', marketCap: 3200, change: 0.5 },
      ],
    },
    {
      sector: '鉄鋼',
      stocks: [
        { stockCode: '5401', stockName: '日本製鉄', shortName: '日本製鉄', marketCap: 3100, change: -5.8 },
        { stockCode: '5411', stockName: 'JFEホールディングス', shortName: 'JFEHD', marketCap: 1200, change: -3.4 },
      ],
    },
    {
      sector: 'サービス業',
      stocks: [
        { stockCode: '6098', stockName: 'リクルートHD', shortName: 'リクルート', marketCap: 10600, change: 1.9 },
        { stockCode: '2413', stockName: 'エムスリー', shortName: 'エムスリー', marketCap: 1800, change: -2.1 },
        { stockCode: '7342', stockName: 'ウェルスナビ', shortName: 'ウェルスナビ', marketCap: 600, change: 9.7 },
      ],
    },
    {
      sector: '不動産業',
      stocks: [
        { stockCode: '8801', stockName: '三井不動産', shortName: '三井不動産', marketCap: 4200, change: -0.3 },
        { stockCode: '8802', stockName: '三菱地所', shortName: '三菱地所', marketCap: 3400, change: 0.2 },
        { stockCode: '8830', stockName: '住友不動産', shortName: '住友不動産', marketCap: 2100, change: -1.1 },
      ],
    },
    {
      sector: '陸運業',
      stocks: [
        { stockCode: '9020', stockName: 'JR東日本', shortName: 'JR東', marketCap: 3800, change: 0.4 },
        { stockCode: '9022', stockName: 'JR東海', shortName: 'JR東海', marketCap: 4200, change: 0.6 },
        { stockCode: '9021', stockName: 'JR西日本', shortName: 'JR西', marketCap: 1600, change: -0.2 },
      ],
    },
  ];
}

// ─── YouTube動画 ─────────────────────────

export interface YouTubeVideo {
  id: string;
  title: string;
  thumbnail: string;
  date: string;
  companyName: string;
  stockCode: string;
}

export async function getYouTubeVideos(): Promise<YouTubeVideo[]> {
  await delay(100);
  return [
    {
      id: 'v1',
      title: '【タイミー・小川嶺】辞任寸前から27歳上場／逆境を越え続ける秘訣／小川を救ったサイバー藤田晋の一言／時価総額1300億企業を生んだ"ある決断"',
      thumbnail: 'https://placehold.co/400x225/1a1a2e/ffffff?text=Timee%0A%E3%82%BF%E3%82%A4%E3%83%9F%E3%83%BC',
      date: '2026/01/30',
      companyName: 'タイミー',
      stockCode: '215A',
    },
    {
      id: 'v2',
      title: '【アース製薬・川端克宜】殺虫剤からオーラルケアまで／グローバル展開の裏側／研究開発投資の考え方／次の100年に向けた成長戦略',
      thumbnail: 'https://placehold.co/400x225/2d5016/ffffff?text=Earth%0A%E3%82%A2%E3%83%BC%E3%82%B9%E8%A3%BD%E8%96%AC',
      date: '2026/01/23',
      companyName: 'アース製薬',
      stockCode: '4985',
    },
    {
      id: 'v3',
      title: '【新日本空調・代表取締役】空調設備のリーディングカンパニー／データセンター需要の急拡大／技術者育成の取り組み／脱炭素社会への対応',
      thumbnail: 'https://placehold.co/400x225/1e3a5f/ffffff?text=SNK%0A%E6%96%B0%E6%97%A5%E6%9C%AC%E7%A9%BA%E8%AA%BF',
      date: '2026/01/16',
      companyName: '新日本空調',
      stockCode: '1952',
    },
    {
      id: 'v4',
      title: '【トヨタ自動車・豊田章男】EV戦略の全貌／全固体電池の開発進捗／ウーブンシティの未来像／マルチパスウェイ戦略の真意',
      thumbnail: 'https://placehold.co/400x225/cc0000/ffffff?text=TOYOTA%0A%E3%83%88%E3%83%A8%E3%82%BF',
      date: '2026/01/09',
      companyName: 'トヨタ自動車',
      stockCode: '7203',
    },
  ];
}

// ─── ユーティリティ ────────────────────────

function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
