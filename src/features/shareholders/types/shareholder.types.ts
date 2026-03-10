export type InvestorType = 'individual' | 'institution' | 'fund';

export interface MajorShareholder {
  id: string;
  name: string;
  nameEn?: string;
  type: InvestorType;
  biography: string;
  career: CareerItem[];
  totalAssets: number; // 億円
  estimatedProfit: number; // 推定含み益（通算） 億円
  profitByPeriod: ProfitByPeriod; // 期間別利益
  holdings: Shareholding[];
  filingHistory: FilingRecord[];
  profileImage?: string;
}

export type ProfitPeriod = '1m' | '3m' | '6m' | '1y' | '3y' | 'all';

export interface ProfitByPeriod {
  '1m': number;  // 1ヶ月 億円
  '3m': number;  // 3ヶ月
  '6m': number;  // 6ヶ月
  '1y': number;  // 1年
  '3y': number;  // 3年
  all: number;   // 通算
}

export interface CareerItem {
  year: string;
  description: string;
}

export interface Shareholding {
  stockCode: string;
  stockName: string;
  shares: number; // 株数
  percentage: number; // 保有比率 %
  marketValue: number; // 時価 億円
  acquiredDate: string;
  latestFilingDate: string;
}

export interface FilingRecord {
  id: string;
  date: string;
  stockCode: string;
  stockName: string;
  type: '取得' | '処分' | '変更報告';
  previousPercent: number;
  newPercent: number;
  shares: number;
  purpose: string;
}

export interface CompanyMajorHolder {
  shareholderId: string;
  name: string;
  type: InvestorType;
  percentage: number;
  shares: number;
  latestFilingDate: string;
}
