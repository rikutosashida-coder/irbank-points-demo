import { create } from 'zustand';
import type {
  MajorShareholder,
  CompanyMajorHolder,
  FilingRecord,
  ProfitPeriod,
} from '../types/shareholder.types';

// ─── モックデータ: 大口投資家 ─────────────────────

const MOCK_SHAREHOLDERS: MajorShareholder[] = [
  {
    id: 'sh-1',
    name: '光通信株式会社',
    nameEn: 'Hikari Tsushin',
    type: 'institution',
    biography: '1988年設立。情報通信サービスの販売代理店として出発し、現在は投資事業も積極展開。上場企業を中心に広範なポートフォリオを保有する。代表の重田康光氏は日本有数の個人投資家としても知られる。',
    career: [
      { year: '1988', description: '光通信株式会社設立' },
      { year: '2000', description: '東証一部上場' },
      { year: '2005', description: '投資事業部門を本格化' },
      { year: '2015', description: '保有銘柄数100社超え' },
      { year: '2023', description: '投資ポートフォリオ時価総額1兆円突破' },
    ],
    totalAssets: 12500,
    estimatedProfit: 4800,
    profitByPeriod: { '1m': 320, '3m': 850, '6m': 1400, '1y': 2200, '3y': 3800, all: 4800 },
    holdings: [
      { stockCode: '7203', stockName: 'トヨタ自動車', shares: 45000000, percentage: 5.2, marketValue: 1200, acquiredDate: '2020-03-15', latestFilingDate: '2025-11-20' },
      { stockCode: '6758', stockName: 'ソニーグループ', shares: 32000000, percentage: 6.1, marketValue: 980, acquiredDate: '2019-06-10', latestFilingDate: '2025-10-05' },
      { stockCode: '9984', stockName: 'ソフトバンクグループ', shares: 28000000, percentage: 5.8, marketValue: 850, acquiredDate: '2021-01-20', latestFilingDate: '2025-12-15' },
      { stockCode: '8306', stockName: '三菱UFJフィナンシャル', shares: 55000000, percentage: 7.2, marketValue: 720, acquiredDate: '2018-09-01', latestFilingDate: '2026-01-10' },
      { stockCode: '6861', stockName: 'キーエンス', shares: 8000000, percentage: 5.5, marketValue: 650, acquiredDate: '2022-04-15', latestFilingDate: '2025-09-20' },
      { stockCode: '4063', stockName: '信越化学工業', shares: 12000000, percentage: 5.1, marketValue: 580, acquiredDate: '2023-02-28', latestFilingDate: '2025-08-15' },
    ],
    filingHistory: [
      { id: 'f1', date: '2026-01-10', stockCode: '8306', stockName: '三菱UFJフィナンシャル', type: '変更報告', previousPercent: 6.8, newPercent: 7.2, shares: 55000000, purpose: '純投資' },
      { id: 'f2', date: '2025-12-15', stockCode: '9984', stockName: 'ソフトバンクグループ', type: '取得', previousPercent: 4.9, newPercent: 5.8, shares: 28000000, purpose: '純投資' },
      { id: 'f3', date: '2025-11-20', stockCode: '7203', stockName: 'トヨタ自動車', type: '変更報告', previousPercent: 5.0, newPercent: 5.2, shares: 45000000, purpose: '純投資' },
      { id: 'f4', date: '2025-10-05', stockCode: '6758', stockName: 'ソニーグループ', type: '変更報告', previousPercent: 5.8, newPercent: 6.1, shares: 32000000, purpose: '純投資' },
      { id: 'f5', date: '2025-09-20', stockCode: '6861', stockName: 'キーエンス', type: '取得', previousPercent: 4.5, newPercent: 5.5, shares: 8000000, purpose: '純投資' },
      { id: 'f6', date: '2025-08-15', stockCode: '4063', stockName: '信越化学工業', type: '取得', previousPercent: 0, newPercent: 5.1, shares: 12000000, purpose: '純投資' },
    ],
  },
  {
    id: 'sh-2',
    name: '村上世彰',
    nameEn: 'Yoshiaki Murakami',
    type: 'individual',
    biography: '元通産省（現経産省）官僚。2000年前後から「物言う株主」として注目を集める。村上ファンド事件後も投資活動を継続し、現在はシンガポールを拠点に複数のファンドを通じて日本株に投資。コーポレートガバナンス改革の先駆者として知られる。',
    career: [
      { year: '1983', description: '通商産業省入省' },
      { year: '1999', description: 'M&Aコンサルティング設立（村上ファンド）' },
      { year: '2006', description: 'ニッポン放送株問題で注目' },
      { year: '2010', description: 'シンガポール拠点で投資活動再開' },
      { year: '2020', description: '複数のアクティビストファンド運営' },
      { year: '2024', description: '保有銘柄数50社以上' },
    ],
    totalAssets: 8200,
    estimatedProfit: 3500,
    profitByPeriod: { '1m': 180, '3m': 520, '6m': 980, '1y': 1650, '3y': 2900, all: 3500 },
    holdings: [
      { stockCode: '7203', stockName: 'トヨタ自動車', shares: 38000000, percentage: 5.5, marketValue: 980, acquiredDate: '2023-08-10', latestFilingDate: '2026-01-25' },
      { stockCode: '9202', stockName: 'ANAホールディングス', shares: 25000000, percentage: 8.3, marketValue: 750, acquiredDate: '2022-11-15', latestFilingDate: '2025-12-20' },
      { stockCode: '3382', stockName: 'セブン＆アイ', shares: 30000000, percentage: 6.7, marketValue: 620, acquiredDate: '2024-03-01', latestFilingDate: '2026-02-01' },
      { stockCode: '4502', stockName: '武田薬品工業', shares: 18000000, percentage: 5.2, marketValue: 540, acquiredDate: '2024-06-20', latestFilingDate: '2025-11-10' },
      { stockCode: '2801', stockName: 'キッコーマン', shares: 10000000, percentage: 7.1, marketValue: 480, acquiredDate: '2025-01-15', latestFilingDate: '2026-01-15' },
    ],
    filingHistory: [
      { id: 'f7', date: '2026-02-01', stockCode: '3382', stockName: 'セブン＆アイ', type: '変更報告', previousPercent: 6.2, newPercent: 6.7, shares: 30000000, purpose: '経営への提言' },
      { id: 'f8', date: '2026-01-25', stockCode: '7203', stockName: 'トヨタ自動車', type: '取得', previousPercent: 4.8, newPercent: 5.5, shares: 38000000, purpose: '純投資' },
      { id: 'f9', date: '2026-01-15', stockCode: '2801', stockName: 'キッコーマン', type: '変更報告', previousPercent: 6.5, newPercent: 7.1, shares: 10000000, purpose: '純投資・経営提言' },
      { id: 'f10', date: '2025-12-20', stockCode: '9202', stockName: 'ANAホールディングス', type: '変更報告', previousPercent: 7.8, newPercent: 8.3, shares: 25000000, purpose: '経営への提言' },
      { id: 'f11', date: '2025-11-10', stockCode: '4502', stockName: '武田薬品工業', type: '取得', previousPercent: 0, newPercent: 5.2, shares: 18000000, purpose: '純投資' },
    ],
  },
  {
    id: 'sh-3',
    name: 'エフィッシモ キャピタル マネジメント',
    nameEn: 'Effissimo Capital Management',
    type: 'fund',
    biography: 'シンガポールを拠点とするアクティビスト・ヘッジファンド。旧村上ファンドの元メンバーにより2006年に設立。日本の大型株を中心に集中投資を行い、株主提案を通じた企業価値向上を目指す。運用資産は推定2兆円超。',
    career: [
      { year: '2006', description: 'シンガポールで設立' },
      { year: '2008', description: '日本株投資を本格開始' },
      { year: '2017', description: '東芝株を大量取得、筆頭株主に' },
      { year: '2020', description: '運用資産1兆円突破' },
      { year: '2023', description: '複数の株主提案が可決' },
      { year: '2025', description: '運用資産2兆円超' },
    ],
    totalAssets: 21000,
    estimatedProfit: 8900,
    profitByPeriod: { '1m': 620, '3m': 1800, '6m': 3200, '1y': 5100, '3y': 7500, all: 8900 },
    holdings: [
      { stockCode: '7203', stockName: 'トヨタ自動車', shares: 52000000, percentage: 6.8, marketValue: 1380, acquiredDate: '2021-05-20', latestFilingDate: '2025-12-28' },
      { stockCode: '6501', stockName: '日立製作所', shares: 40000000, percentage: 8.5, marketValue: 1100, acquiredDate: '2020-09-10', latestFilingDate: '2026-01-20' },
      { stockCode: '8035', stockName: '東京エレクトロン', shares: 15000000, percentage: 7.2, marketValue: 950, acquiredDate: '2022-03-15', latestFilingDate: '2025-11-30' },
      { stockCode: '6902', stockName: 'デンソー', shares: 35000000, percentage: 9.1, marketValue: 820, acquiredDate: '2023-07-01', latestFilingDate: '2026-02-10' },
      { stockCode: '7267', stockName: '本田技研工業', shares: 42000000, percentage: 7.8, marketValue: 780, acquiredDate: '2024-01-10', latestFilingDate: '2025-10-15' },
      { stockCode: '4568', stockName: '第一三共', shares: 20000000, percentage: 6.3, marketValue: 720, acquiredDate: '2024-08-20', latestFilingDate: '2025-09-25' },
      { stockCode: '9432', stockName: '日本電信電話', shares: 60000000, percentage: 5.5, marketValue: 680, acquiredDate: '2025-02-01', latestFilingDate: '2026-01-05' },
    ],
    filingHistory: [
      { id: 'f12', date: '2026-02-10', stockCode: '6902', stockName: 'デンソー', type: '変更報告', previousPercent: 8.5, newPercent: 9.1, shares: 35000000, purpose: '株主価値向上のための提言' },
      { id: 'f13', date: '2026-01-20', stockCode: '6501', stockName: '日立製作所', type: '変更報告', previousPercent: 8.0, newPercent: 8.5, shares: 40000000, purpose: '純投資・経営提言' },
      { id: 'f14', date: '2026-01-05', stockCode: '9432', stockName: '日本電信電話', type: '取得', previousPercent: 4.8, newPercent: 5.5, shares: 60000000, purpose: '純投資' },
      { id: 'f15', date: '2025-12-28', stockCode: '7203', stockName: 'トヨタ自動車', type: '変更報告', previousPercent: 6.5, newPercent: 6.8, shares: 52000000, purpose: '純投資' },
      { id: 'f16', date: '2025-11-30', stockCode: '8035', stockName: '東京エレクトロン', type: '変更報告', previousPercent: 6.8, newPercent: 7.2, shares: 15000000, purpose: '株主価値向上のための提言' },
      { id: 'f17', date: '2025-10-15', stockCode: '7267', stockName: '本田技研工業', type: '取得', previousPercent: 0, newPercent: 7.8, shares: 42000000, purpose: '純投資' },
    ],
  },
  {
    id: 'sh-4',
    name: '旧村上ファンド系（シティインデックスイレブンス）',
    nameEn: 'City Index Elevenths',
    type: 'fund',
    biography: '村上世彰氏の関連ファンドの一つ。日本の中小型株を中心に、低PBR銘柄や株主還元余力のある企業に投資。株主提案を積極的に行い、自社株買いや増配を求めることが多い。',
    career: [
      { year: '2015', description: '設立' },
      { year: '2018', description: '投資先企業への株主提案を開始' },
      { year: '2021', description: '保有銘柄数30社超' },
      { year: '2024', description: '複数の株主提案が賛成多数で可決' },
    ],
    totalAssets: 4500,
    estimatedProfit: 1200,
    profitByPeriod: { '1m': 95, '3m': 280, '6m': 450, '1y': 780, '3y': 1050, all: 1200 },
    holdings: [
      { stockCode: '7203', stockName: 'トヨタ自動車', shares: 25000000, percentage: 5.1, marketValue: 650, acquiredDate: '2024-05-10', latestFilingDate: '2025-12-01' },
      { stockCode: '5411', stockName: 'JFEホールディングス', shares: 20000000, percentage: 8.5, marketValue: 420, acquiredDate: '2023-10-15', latestFilingDate: '2026-01-30' },
      { stockCode: '8604', stockName: '野村ホールディングス', shares: 35000000, percentage: 6.2, marketValue: 380, acquiredDate: '2024-07-20', latestFilingDate: '2025-11-15' },
    ],
    filingHistory: [
      { id: 'f18', date: '2026-01-30', stockCode: '5411', stockName: 'JFEホールディングス', type: '変更報告', previousPercent: 7.8, newPercent: 8.5, shares: 20000000, purpose: '自社株買い・増配の要求' },
      { id: 'f19', date: '2025-12-01', stockCode: '7203', stockName: 'トヨタ自動車', type: '取得', previousPercent: 0, newPercent: 5.1, shares: 25000000, purpose: '純投資' },
      { id: 'f20', date: '2025-11-15', stockCode: '8604', stockName: '野村ホールディングス', type: '取得', previousPercent: 4.5, newPercent: 6.2, shares: 35000000, purpose: '経営提言' },
    ],
  },
  {
    id: 'sh-5',
    name: 'ブラックロック・ジャパン',
    nameEn: 'BlackRock Japan',
    type: 'institution',
    biography: '世界最大の資産運用会社ブラックロックの日本法人。iSharesブランドのETFを中心に、日本の上場企業の多くで大量保有報告の対象となっている。パッシブ運用が中心だが、ESG投資やスチュワードシップ活動にも積極的。',
    career: [
      { year: '1988', description: 'ブラックロック設立（米国）' },
      { year: '2006', description: 'バークレイズ・グローバル・インベスターズ買収でiShares取得' },
      { year: '2010', description: '運用資産世界最大に' },
      { year: '2020', description: 'ESG投資を本格推進' },
      { year: '2025', description: '日本株運用資産50兆円超' },
    ],
    totalAssets: 52000,
    estimatedProfit: 15200,
    profitByPeriod: { '1m': 1050, '3m': 2800, '6m': 4500, '1y': 7200, '3y': 12800, all: 15200 },
    holdings: [
      { stockCode: '7203', stockName: 'トヨタ自動車', shares: 80000000, percentage: 8.2, marketValue: 2100, acquiredDate: '2015-01-01', latestFilingDate: '2026-02-05' },
      { stockCode: '6758', stockName: 'ソニーグループ', shares: 45000000, percentage: 8.5, marketValue: 1380, acquiredDate: '2015-01-01', latestFilingDate: '2026-01-28' },
      { stockCode: '8306', stockName: '三菱UFJフィナンシャル', shares: 70000000, percentage: 9.1, marketValue: 910, acquiredDate: '2015-01-01', latestFilingDate: '2026-02-12' },
      { stockCode: '6861', stockName: 'キーエンス', shares: 12000000, percentage: 8.3, marketValue: 980, acquiredDate: '2015-01-01', latestFilingDate: '2025-12-20' },
      { stockCode: '9984', stockName: 'ソフトバンクグループ', shares: 38000000, percentage: 7.9, marketValue: 1150, acquiredDate: '2015-01-01', latestFilingDate: '2026-01-15' },
    ],
    filingHistory: [
      { id: 'f21', date: '2026-02-12', stockCode: '8306', stockName: '三菱UFJフィナンシャル', type: '変更報告', previousPercent: 8.8, newPercent: 9.1, shares: 70000000, purpose: '運用（パッシブ）' },
      { id: 'f22', date: '2026-02-05', stockCode: '7203', stockName: 'トヨタ自動車', type: '変更報告', previousPercent: 8.0, newPercent: 8.2, shares: 80000000, purpose: '運用（パッシブ）' },
      { id: 'f23', date: '2026-01-28', stockCode: '6758', stockName: 'ソニーグループ', type: '変更報告', previousPercent: 8.2, newPercent: 8.5, shares: 45000000, purpose: '運用（パッシブ）' },
    ],
  },
  {
    id: 'sh-6',
    name: 'バンガード・グループ',
    nameEn: 'The Vanguard Group',
    type: 'institution',
    biography: '世界第2位の資産運用会社。インデックスファンドのパイオニア。低コスト運用を強みに日本株を含むグローバルな分散投資を展開。',
    career: [
      { year: '1975', description: 'ジョン・ボーグルにより設立' },
      { year: '1976', description: '初のインデックスファンドを個人投資家向けに販売' },
      { year: '2010', description: '日本市場での存在感拡大' },
      { year: '2024', description: '運用資産9兆ドル突破' },
    ],
    totalAssets: 38000,
    estimatedProfit: 11500,
    profitByPeriod: { '1m': 780, '3m': 2100, '6m': 3400, '1y': 5500, '3y': 9800, all: 11500 },
    holdings: [
      { stockCode: '7203', stockName: 'トヨタ自動車', shares: 65000000, percentage: 7.5, marketValue: 1700, acquiredDate: '2015-01-01', latestFilingDate: '2026-01-20' },
      { stockCode: '6758', stockName: 'ソニーグループ', shares: 35000000, percentage: 6.7, marketValue: 1080, acquiredDate: '2015-01-01', latestFilingDate: '2025-12-15' },
      { stockCode: '9432', stockName: '日本電信電話', shares: 50000000, percentage: 6.2, marketValue: 620, acquiredDate: '2015-01-01', latestFilingDate: '2026-01-30' },
    ],
    filingHistory: [
      { id: 'f24', date: '2026-01-30', stockCode: '9432', stockName: '日本電信電話', type: '変更報告', previousPercent: 5.9, newPercent: 6.2, shares: 50000000, purpose: '運用（パッシブ）' },
      { id: 'f25', date: '2026-01-20', stockCode: '7203', stockName: 'トヨタ自動車', type: '変更報告', previousPercent: 7.2, newPercent: 7.5, shares: 65000000, purpose: '運用（パッシブ）' },
    ],
  },
  {
    id: 'sh-7',
    name: '野村證券',
    nameEn: 'Nomura Securities',
    type: 'institution',
    biography: '日本最大の証券会社。自己売買部門およびグループ内ファンドを通じて多数の日本株を保有。機関投資家としてスチュワードシップ活動にも注力。',
    career: [
      { year: '1925', description: '野村證券設立' },
      { year: '2001', description: '野村ホールディングスとして持株会社体制に移行' },
      { year: '2020', description: 'ESG投資推進体制を整備' },
      { year: '2025', description: '自己勘定保有銘柄数200社超' },
    ],
    totalAssets: 15000,
    estimatedProfit: 3800,
    profitByPeriod: { '1m': 210, '3m': 620, '6m': 1100, '1y': 1800, '3y': 3200, all: 3800 },
    holdings: [
      { stockCode: '8306', stockName: '三菱UFJフィナンシャル', shares: 40000000, percentage: 5.2, marketValue: 520, acquiredDate: '2020-01-01', latestFilingDate: '2026-01-10' },
      { stockCode: '8316', stockName: '三井住友フィナンシャル', shares: 30000000, percentage: 5.8, marketValue: 480, acquiredDate: '2020-01-01', latestFilingDate: '2025-12-20' },
    ],
    filingHistory: [
      { id: 'f26', date: '2026-01-10', stockCode: '8306', stockName: '三菱UFJフィナンシャル', type: '変更報告', previousPercent: 5.0, newPercent: 5.2, shares: 40000000, purpose: '自己売買' },
    ],
  },
  {
    id: 'sh-8',
    name: '孫正義',
    nameEn: 'Masayoshi Son',
    type: 'individual',
    biography: 'ソフトバンクグループ創業者。日本を代表する起業家・投資家。ビジョンファンドを通じてテクノロジー企業への投資を世界規模で展開。個人としてもSBG株の筆頭株主。',
    career: [
      { year: '1981', description: '日本ソフトバンク設立' },
      { year: '2000', description: 'Alibaba Group に投資' },
      { year: '2006', description: 'ボーダフォン日本法人を買収' },
      { year: '2016', description: 'ARM Holdings を3.3兆円で買収' },
      { year: '2017', description: 'ソフトバンク・ビジョン・ファンド設立' },
      { year: '2023', description: 'AI投資に注力宣言' },
    ],
    totalAssets: 28000,
    estimatedProfit: 27500,
    profitByPeriod: { '1m': 1500, '3m': 4200, '6m': 6800, '1y': 9500, '3y': 18000, all: 27500 },
    holdings: [
      { stockCode: '9984', stockName: 'ソフトバンクグループ', shares: 520000000, percentage: 32.0, marketValue: 15800, acquiredDate: '1981-01-01', latestFilingDate: '2026-02-01' },
    ],
    filingHistory: [
      { id: 'f27', date: '2026-02-01', stockCode: '9984', stockName: 'ソフトバンクグループ', type: '変更報告', previousPercent: 31.5, newPercent: 32.0, shares: 520000000, purpose: '経営' },
    ],
  },
  {
    id: 'sh-9',
    name: 'ストラテジックキャピタル',
    nameEn: 'Strategic Capital',
    type: 'fund',
    biography: '旧村上ファンド出身の丸木強氏が率いるアクティビストファンド。日本の中小型株に集中投資し、株主提案を通じて企業価値の向上を図る。低PBR企業への提言が特に多い。',
    career: [
      { year: '2012', description: '設立' },
      { year: '2016', description: '初の株主提案を実施' },
      { year: '2020', description: '提案採択率が業界平均を大幅上回る' },
      { year: '2024', description: '保有銘柄数25社以上' },
    ],
    totalAssets: 3200,
    estimatedProfit: 950,
    profitByPeriod: { '1m': 85, '3m': 240, '6m': 380, '1y': 620, '3y': 850, all: 950 },
    holdings: [
      { stockCode: '1808', stockName: '長谷工コーポレーション', shares: 15000000, percentage: 8.2, marketValue: 280, acquiredDate: '2023-05-01', latestFilingDate: '2026-01-25' },
      { stockCode: '5406', stockName: '神戸製鋼所', shares: 20000000, percentage: 6.5, marketValue: 320, acquiredDate: '2024-02-15', latestFilingDate: '2025-12-10' },
      { stockCode: '6471', stockName: '日本精工', shares: 18000000, percentage: 7.8, marketValue: 250, acquiredDate: '2024-08-01', latestFilingDate: '2026-02-05' },
    ],
    filingHistory: [
      { id: 'f28', date: '2026-02-05', stockCode: '6471', stockName: '日本精工', type: '変更報告', previousPercent: 7.0, newPercent: 7.8, shares: 18000000, purpose: '株主価値向上のための提言' },
      { id: 'f29', date: '2026-01-25', stockCode: '1808', stockName: '長谷工コーポレーション', type: '変更報告', previousPercent: 7.5, newPercent: 8.2, shares: 15000000, purpose: '自社株買い・増配要求' },
    ],
  },
  {
    id: 'sh-10',
    name: '三井住友トラスト・アセットマネジメント',
    nameEn: 'Sumitomo Mitsui Trust Asset Management',
    type: 'institution',
    biography: '三井住友トラスト・ホールディングス傘下の資産運用会社。年金基金や機関投資家向けの運用を中心に、日本株の大量保有報告が多い。',
    career: [
      { year: '1986', description: '住友信託銀行投資顧問として設立' },
      { year: '2012', description: '三井住友トラスト・アセットマネジメントに社名変更' },
      { year: '2023', description: '運用資産80兆円突破' },
    ],
    totalAssets: 25000,
    estimatedProfit: 6200,
    profitByPeriod: { '1m': 420, '3m': 1150, '6m': 1900, '1y': 3100, '3y': 5200, all: 6200 },
    holdings: [
      { stockCode: '7203', stockName: 'トヨタ自動車', shares: 55000000, percentage: 6.3, marketValue: 1440, acquiredDate: '2010-01-01', latestFilingDate: '2026-01-15' },
      { stockCode: '6758', stockName: 'ソニーグループ', shares: 28000000, percentage: 5.3, marketValue: 860, acquiredDate: '2010-01-01', latestFilingDate: '2025-11-20' },
      { stockCode: '4063', stockName: '信越化学工業', shares: 15000000, percentage: 6.4, marketValue: 730, acquiredDate: '2010-01-01', latestFilingDate: '2025-12-05' },
    ],
    filingHistory: [
      { id: 'f30', date: '2026-01-15', stockCode: '7203', stockName: 'トヨタ自動車', type: '変更報告', previousPercent: 6.0, newPercent: 6.3, shares: 55000000, purpose: '運用' },
      { id: 'f31', date: '2025-12-05', stockCode: '4063', stockName: '信越化学工業', type: '変更報告', previousPercent: 6.1, newPercent: 6.4, shares: 15000000, purpose: '運用' },
    ],
  },
];

// ─── 銘柄別の大口保有者マッピング ─────────────────

function getHoldersForStock(stockCode: string): CompanyMajorHolder[] {
  const holders: CompanyMajorHolder[] = [];
  for (const sh of MOCK_SHAREHOLDERS) {
    const holding = sh.holdings.find(h => h.stockCode === stockCode);
    if (holding) {
      holders.push({
        shareholderId: sh.id,
        name: sh.name,
        type: sh.type,
        percentage: holding.percentage,
        shares: holding.shares,
        latestFilingDate: holding.latestFilingDate,
      });
    }
  }
  return holders.sort((a, b) => b.percentage - a.percentage);
}

function getFilingsForStock(stockCode: string): (FilingRecord & { holderName: string; holderId: string })[] {
  const filings: (FilingRecord & { holderName: string; holderId: string })[] = [];
  for (const sh of MOCK_SHAREHOLDERS) {
    for (const f of sh.filingHistory) {
      if (f.stockCode === stockCode) {
        filings.push({ ...f, holderName: sh.name, holderId: sh.id });
      }
    }
  }
  return filings.sort((a, b) => b.date.localeCompare(a.date));
}

// ─── Store ───────────────────────────────────────

interface ShareholderStore {
  shareholders: MajorShareholder[];
  followedIds: Set<string>;

  getShareholderById: (id: string) => MajorShareholder | undefined;
  getHoldersForStock: (stockCode: string) => CompanyMajorHolder[];
  getFilingsForStock: (stockCode: string) => (FilingRecord & { holderName: string; holderId: string })[];
  getAllShareholders: () => MajorShareholder[];
  getFollowedShareholders: () => MajorShareholder[];
  searchShareholders: (query: string) => MajorShareholder[];
  getRankedByAssets: () => MajorShareholder[];
  getRankedByHoldings: () => MajorShareholder[];
  getRankedByProfit: () => MajorShareholder[];
  getRankedByProfitPeriod: (period: ProfitPeriod) => MajorShareholder[];
  getRankedByFilings: () => MajorShareholder[];
  getRecentFilings: (limit?: number) => (FilingRecord & { holderName: string; holderId: string })[];
  toggleFollow: (id: string) => void;
  isFollowing: (id: string) => boolean;
}

export const useShareholderStore = create<ShareholderStore>((set, get) => ({
  shareholders: MOCK_SHAREHOLDERS,
  followedIds: new Set(['sh-1', 'sh-2']), // デフォルトで2人フォロー済み

  getShareholderById: (id) => {
    return get().shareholders.find(s => s.id === id);
  },

  getHoldersForStock: (stockCode) => {
    return getHoldersForStock(stockCode);
  },

  getFilingsForStock: (stockCode) => {
    return getFilingsForStock(stockCode);
  },

  getAllShareholders: () => {
    return get().shareholders;
  },

  getFollowedShareholders: () => {
    const { shareholders, followedIds } = get();
    return shareholders.filter(s => followedIds.has(s.id));
  },

  searchShareholders: (query: string) => {
    const q = query.toLowerCase();
    return get().shareholders.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        (s.nameEn && s.nameEn.toLowerCase().includes(q)) ||
        s.holdings.some(h => h.stockName.includes(q) || h.stockCode.includes(q)),
    );
  },

  getRankedByAssets: () => {
    return [...get().shareholders].sort((a, b) => b.totalAssets - a.totalAssets);
  },

  getRankedByHoldings: () => {
    return [...get().shareholders].sort((a, b) => b.holdings.length - a.holdings.length);
  },

  getRankedByProfit: () => {
    return [...get().shareholders].sort((a, b) => b.estimatedProfit - a.estimatedProfit);
  },

  getRankedByProfitPeriod: (period: ProfitPeriod) => {
    return [...get().shareholders].sort((a, b) => b.profitByPeriod[period] - a.profitByPeriod[period]);
  },

  getRankedByFilings: () => {
    return [...get().shareholders].sort((a, b) => b.filingHistory.length - a.filingHistory.length);
  },

  getRecentFilings: (limit = 15) => {
    const all: (FilingRecord & { holderName: string; holderId: string })[] = [];
    for (const sh of get().shareholders) {
      for (const f of sh.filingHistory) {
        all.push({ ...f, holderName: sh.name, holderId: sh.id });
      }
    }
    return all.sort((a, b) => b.date.localeCompare(a.date)).slice(0, limit);
  },

  toggleFollow: (id) => {
    set((s) => {
      const next = new Set(s.followedIds);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return { followedIds: next };
    });
  },

  isFollowing: (id) => {
    return get().followedIds.has(id);
  },
}));
