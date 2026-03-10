// ============================================
// Block Types (BlockNoteと互換性のある型)
// ============================================

export interface Block {
  id: string;
  type: 'paragraph' | 'heading' | 'bulletListItem' | 'numberedListItem' | 'quote' | 'image' | 'link' | 'code';
  content: BlockContent;
  children?: Block[];
  props?: Record<string, any>;
}

export interface BlockContent {
  text?: string;
  imageUrl?: string;
  linkUrl?: string;
  level?: number; // 見出しレベル (1-6)
  language?: string; // コードブロックの言語
}

// ============================================
// Tag Types
// ============================================

// メタタグ (自動付与)
export interface MetaTag {
  id: string;
  type: 'indicator' | 'chart' | 'news' | 'disclosure';
  sourceId: string; // 連携元のID
  sourceName: string; // 連携元の名前
  linkedAt: Date; // 連携日時
}

// アンカータグ
export interface AnchorTag {
  id: string;
  category: 'stock' | 'industry' | 'theme' | 'date';

  // 銘柄情報
  stockCode?: string; // 証券コード
  stockName?: string; // 銘柄名
  sector?: string; // 業種

  // 業界・テーマ
  industryName?: string;
  themeName?: string;
  indexName?: string;

  // 対象日時
  targetDate?: Date;
}

// 分析タグ
export interface AnalysisTag {
  id: string;

  // フェーズタグ
  phase: 'before_investment' | 'after_investment';

  // 判断タグ
  decision?: 'buy' | 'sell' | 'hold' | 'watch';
  confidence?: 'high' | 'medium' | 'low';
}

// ============================================
// Citation Types (引用)
// ============================================

export interface Citation {
  id: string;
  type: 'ai_navigator' | 'other_note' | 'track_record' | 'external' | 'chart' | 'news' | 'disclosure';
  sourceId: string;
  sourceName: string;
  excerpt: string; // 引用部分の抜粋
  url?: string;
}

// ============================================
// Analysis Item Types (分析項目)
// ============================================

export interface AnalysisVersion {
  id: string;
  content: Block[]; // ブロックエディタのコンテンツ
  createdAt: Date;
  createdBy: string;

  // 引用情報
  citations: Citation[];
}

export interface CheckPointItem {
  id: string;
  text: string;
  isChecked: boolean;
  isCustom: boolean; // true: ユーザー追加, false: フレームワークから
  aiOutput?: string; // AIによる分析アウトプット
}

export interface AnalysisItem {
  id: string;
  noteId: string;
  title: string; // 分析項目名
  order: number; // 表示順序
  createdAt: Date;
  updatedAt: Date;

  // 評価（1-5の5段階評価）
  rating?: number;

  // 重み付け（1-10の10段階、デフォルト: 5）
  weight?: number;

  // チェックポイント（カスタマイズ可能）
  checkPoints?: CheckPointItem[];

  // 履歴管理
  versions: AnalysisVersion[];
  currentVersionId: string;
}

// ============================================
// Note Section (ノートセクション)
// ============================================

export interface NoteSection {
  id: string;
  templateSectionId?: string;
  title: string;
  content: Block[];
  order: number;
}

// ============================================
// Analysis Depth (分析深度)
// ============================================

export type AnalysisDepth = 'quick' | 'standard' | 'deep';

// ============================================
// Note Type (ノート)
// ============================================

export type NoteType = 'note' | 'folder';

export interface Note {
  id: string;
  noteType: NoteType;
  title: string;
  content: Block[]; // BlockNoteのコンテンツ
  createdAt: Date;
  updatedAt: Date;

  // タグ
  metaTags: MetaTag[]; // 連携元情報(自動付与)
  anchorTags: AnchorTag[]; // 銘柄、業界、日時
  analysisTags: AnalysisTag[]; // フェーズ、判断
  freeTags: string[]; // 自由タグ

  // 分析項目
  analysisItems: AnalysisItem[];

  // 階層構造
  parentId: string | null;
  childrenIds: string[];

  // テンプレート・セクション
  templateId?: string; // 使用したテンプレート
  sections?: NoteSection[]; // セクション構造

  // 関連性
  relatedNoteIds?: string[]; // 関連ノート（手動）
  aiSuggestedRelatedNoteIds?: string[]; // AI提案の関連ノート

  // AI生成コンテンツ
  keywords?: string[]; // 自動抽出キーワード
  summary?: string; // AI生成サマリー

  // 振り返り
  lastReviewedAt?: Date; // 最終振り返り日時
  nextReviewDate?: Date; // 次回振り返り予定日

  // 分析深度
  analysisDepth?: AnalysisDepth;

  // その他
  isFavorite: boolean;
  isArchived: boolean;
}

// ============================================
// DTOs (Data Transfer Objects)
// ============================================

export interface CreateNoteDto {
  title: string;
  noteType?: NoteType;
  content?: Block[];
  anchorTags?: AnchorTag[];
  analysisTags?: AnalysisTag[];
  freeTags?: string[];
  parentId?: string | null;
  analysisDepth?: AnalysisDepth;
}

export interface UpdateNoteDto {
  title?: string;
  content?: Block[];
  metaTags?: MetaTag[];
  anchorTags?: AnchorTag[];
  analysisTags?: AnalysisTag[];
  freeTags?: string[];
  analysisItems?: AnalysisItem[];
  isFavorite?: boolean;
  isArchived?: boolean;
  parentId?: string | null;
  childrenIds?: string[];
  templateId?: string;
  sections?: NoteSection[];
  relatedNoteIds?: string[];
  aiSuggestedRelatedNoteIds?: string[];
  keywords?: string[];
  summary?: string;
  lastReviewedAt?: Date;
  nextReviewDate?: Date;
  analysisDepth?: AnalysisDepth;
}

// ============================================
// Stock Data Types (モックデータ用)
// ============================================

export interface StockData {
  code: string;
  name: string;
  sector: string;
  industry: string;
  market: 'Prime' | 'Standard' | 'Growth';
}

export interface NewsData {
  id: string;
  title: string;
  content: string;
  publishedAt: string;
  source: string;
  relatedStocks: string[];
  category: 'market' | 'company' | 'industry' | 'economy';
}

export interface DisclosureData {
  id: string;
  stockCode: string;
  title: string;
  content: string;
  publishedAt: string;
  category: 'earnings' | 'business' | 'governance' | 'other';
  pdfUrl?: string;
}

// ============================================
// Vocabulary Type (単語帳)
// ============================================
export type MasteryLevel = 0 | 1 | 2 | 3 | 4 | 5;

export interface VocabularyEntry {
  id: string;
  word: string; // 単語・用語
  meaning: string; // 意味・説明（30文字以内）
  formula?: string; // 数式
  context?: string; // 出現した文脈
  noteId?: string; // 関連するノートID
  sourceText?: string; // 元のテキスト
  createdAt: Date;
  updatedAt: Date;
  tags?: string[]; // カテゴリタグ
  isAIGenerated: boolean; // AI生成かどうか

  // 学習追跡
  masteryLevel?: MasteryLevel; // 0:未学習 → 5:習得済み
  reviewCount?: number; // 復習回数
  correctCount?: number; // 正解回数
  lastReviewedAt?: Date; // 最終復習日時
  nextReviewAt?: Date; // 次回復習予定（間隔反復）
}
