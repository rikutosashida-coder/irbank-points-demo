import { AnchorTag, AnalysisTag } from './note.types';

export type TemplateCategory =
  | 'stock_analysis'
  | 'industry_research'
  | 'thesis'
  | 'review'
  | 'custom';

export type TemplateSectionType =
  | 'heading'
  | 'text'
  | 'bullet_list'
  | 'table'
  | 'analysis_item';

export interface TemplateSection {
  id: string;
  title: string;
  placeholder: string;
  type: TemplateSectionType;
  required: boolean;
  order: number;
  helpText?: string;
}

export interface NoteTemplate {
  id: string;
  name: string;
  description: string;
  category: TemplateCategory;
  icon: string;

  // テンプレート構造
  sections: TemplateSection[];

  // 推奨設定
  suggestedTags: {
    anchorTags?: Partial<AnchorTag>[];
    analysisTags?: Partial<AnalysisTag>[];
    freeTags?: string[];
  };
  suggestedAnalysisItems?: string[]; // タイトルのリスト

  isDefault: boolean;
  isPublic: boolean;
  createdBy?: string;
  usageCount: number;
  createdAt: Date;
  updatedAt: Date;
}
