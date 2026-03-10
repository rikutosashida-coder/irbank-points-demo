import { NoteTemplate } from '../features/notes/types/template.types';
import { v4 as uuidv4 } from 'uuid';

export const DEFAULT_TEMPLATES: NoteTemplate[] = [
  {
    id: 'stock-analysis-v1',
    name: '銘柄分析テンプレート',
    description: '個別銘柄の投資判断に必要な項目を網羅した標準テンプレート',
    category: 'stock_analysis',
    icon: '📊',
    sections: [
      {
        id: uuidv4(),
        title: '投資仮説',
        placeholder: 'この銘柄に注目する理由を一言で...\n例: クラウド移行需要の拡大により、今後3年で売上2倍が見込める',
        type: 'heading',
        required: true,
        order: 1,
        helpText: '最も重要な「なぜこの銘柄なのか」を簡潔に'
      },
      {
        id: uuidv4(),
        title: 'なぜ今注目したか',
        placeholder: '• きっかけとなった情報源\n• タイミングの背景\n• 市場の見落とし',
        type: 'bullet_list',
        required: true,
        order: 2,
        helpText: 'スクリーニング条件や発見のきっかけ'
      },
      {
        id: uuidv4(),
        title: 'ビジネスモデル',
        placeholder: '収益構造、主要事業、顧客セグメント、成長ドライバー...',
        type: 'text',
        required: true,
        order: 3,
        helpText: '「何で稼いでいるか」を理解する'
      },
      {
        id: uuidv4(),
        title: '競争優位性（Moat）',
        placeholder: '他社と比べた強みは？ それは持続可能か？',
        type: 'text',
        required: true,
        order: 4,
        helpText: 'ネットワーク効果、ブランド、コスト優位性など'
      },
      {
        id: uuidv4(),
        title: '数値分析',
        placeholder: '売上・利益・成長率・ROE・PER・PBR・フリーキャッシュフローなど',
        type: 'table',
        required: true,
        order: 5,
        helpText: '過去3-5年のトレンドと今後の予測'
      },
      {
        id: uuidv4(),
        title: 'リスク・反証',
        placeholder: '• この仮説が崩れるシナリオ\n• 懸念材料\n• 競合の動向',
        type: 'bullet_list',
        required: true,
        order: 6,
        helpText: '投資判断で最も重要な「逆サイド」の視点'
      },
      {
        id: uuidv4(),
        title: '想定シナリオ',
        placeholder: 'Bull / Base / Bear の3シナリオとそれぞれの株価目標',
        type: 'text',
        required: false,
        order: 7
      },
      {
        id: uuidv4(),
        title: '結論 & 取る行動',
        placeholder: '買う・見送る・継続ウォッチ / 目標株価 / エントリー条件',
        type: 'text',
        required: true,
        order: 8
      },
    ],
    suggestedTags: {
      analysisTags: [{ phase: 'before_investment' }]
    },
    suggestedAnalysisItems: [
      'ビジネスモデルの理解度',
      '競争優位性の強さ',
      '成長性・持続可能性',
      'バリュエーションの妥当性',
      'リスク評価'
    ],
    isDefault: true,
    isPublic: true,
    usageCount: 0,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'industry-research-v1',
    name: '業界分析テンプレート',
    description: '特定業界全体のトレンドと投資機会を分析',
    category: 'industry_research',
    icon: '🏭',
    sections: [
      {
        id: uuidv4(),
        title: '業界概要',
        placeholder: '市場規模、成長率、主要プレイヤー...',
        type: 'text',
        required: true,
        order: 1
      },
      {
        id: uuidv4(),
        title: '業界トレンド',
        placeholder: '• 技術革新\n• 規制変更\n• 消費者行動の変化',
        type: 'bullet_list',
        required: true,
        order: 2
      },
      {
        id: uuidv4(),
        title: '主要企業比較',
        placeholder: '各社の強み・弱み、市場シェア、財務指標の比較',
        type: 'table',
        required: true,
        order: 3
      },
      {
        id: uuidv4(),
        title: '投資機会',
        placeholder: 'この業界で注目すべき銘柄とその理由',
        type: 'text',
        required: true,
        order: 4
      },
    ],
    suggestedTags: {},
    isDefault: true,
    isPublic: true,
    usageCount: 0,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'investment-thesis-v1',
    name: '投資テーゼテンプレート',
    description: '長期的な投資テーマを深掘りするテンプレート',
    category: 'thesis',
    icon: '💡',
    sections: [
      {
        id: uuidv4(),
        title: 'テーゼの概要',
        placeholder: '例: 「脱炭素化により電動車両市場が今後10年で5倍に成長する」',
        type: 'heading',
        required: true,
        order: 1
      },
      {
        id: uuidv4(),
        title: '背景・根拠',
        placeholder: 'このテーゼを支持するマクロトレンド、データ、事例',
        type: 'text',
        required: true,
        order: 2
      },
      {
        id: uuidv4(),
        title: '恩恵を受ける企業',
        placeholder: 'このテーゼが実現した場合に成長する企業・セクター',
        type: 'bullet_list',
        required: true,
        order: 3
      },
      {
        id: uuidv4(),
        title: 'リスク要因',
        placeholder: 'テーゼが崩れる可能性、タイムラインの不確実性',
        type: 'text',
        required: true,
        order: 4
      },
    ],
    suggestedTags: {},
    isDefault: true,
    isPublic: true,
    usageCount: 0,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'review-template-v1',
    name: '振り返りテンプレート',
    description: '過去の分析や投資判断を振り返るためのテンプレート',
    category: 'review',
    icon: '🔄',
    sections: [
      {
        id: uuidv4(),
        title: '当初の仮説',
        placeholder: '元のノートで書いた投資仮説を要約',
        type: 'text',
        required: true,
        order: 1
      },
      {
        id: uuidv4(),
        title: '実際に何が起きたか',
        placeholder: '株価、業績、市場環境の変化',
        type: 'text',
        required: true,
        order: 2
      },
      {
        id: uuidv4(),
        title: '仮説との乖離',
        placeholder: '当たった点、外れた点、想定外の出来事',
        type: 'bullet_list',
        required: true,
        order: 3
      },
      {
        id: uuidv4(),
        title: '学んだこと',
        placeholder: '次回に活かせる教訓、自分の分析の弱点',
        type: 'text',
        required: true,
        order: 4
      },
      {
        id: uuidv4(),
        title: '次のアクション',
        placeholder: '追加調査が必要か、ポジション調整するか',
        type: 'text',
        required: false,
        order: 5
      },
    ],
    suggestedTags: {
      analysisTags: [{ phase: 'after_investment' }]
    },
    isDefault: true,
    isPublic: true,
    usageCount: 0,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'blank-template',
    name: '空白ノート',
    description: '自由形式で書きたい場合のシンプルなテンプレート',
    category: 'custom',
    icon: '📝',
    sections: [],
    suggestedTags: {},
    isDefault: true,
    isPublic: true,
    usageCount: 0,
    createdAt: new Date(),
    updatedAt: new Date()
  },
];
