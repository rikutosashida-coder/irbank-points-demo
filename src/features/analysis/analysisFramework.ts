/**
 * ファンダメンタル分析フレームワーク
 * 投資家の実務フローに沿った分析項目の定義
 * 各項目に「なぜ重要か」「何を見るか」「具体例」を含む教育的ガイド付き
 */

export interface AnalysisSubItem {
  id: string;
  title: string;
  description: string;
  /** どの深度から推奨か */
  recommendedDepth: 'quick' | 'standard' | 'deep';
  /** なぜこの分析が重要なのか（投資判断への影響） */
  whyItMatters: string;
  /** 具体的に何を見ればいいか（チェックポイント） */
  checkPoints: string[];
  /** 具体例（実際の企業を想定した例） */
  example?: string;
}

export interface AnalysisCategory {
  id: string;
  emoji: string;
  title: string;
  description: string;
  subItems: AnalysisSubItem[];
}

/** 目的別プリセット */
export interface AnalysisGoal {
  id: string;
  emoji: string;
  title: string;
  description: string;
  /** この目的に必要な分析項目ID群 */
  subItemIds: string[];
}

export const ANALYSIS_GOALS: AnalysisGoal[] = [
  {
    id: 'first_analysis',
    emoji: '🔰',
    title: '初めての銘柄分析',
    description: '最低限これだけ見ればOK。まずはここから始めましょう',
    subItemIds: [
      'revenue_growth', 'profit_growth', 'operating_margin',
      'ocf_stability', 'debt_analysis', 'roe_roa_trend',
      'historical_per', 'financial_risk',
      'past_performance', 'current_situation',
    ],
  },
  {
    id: 'is_it_buy',
    emoji: '🛒',
    title: 'この銘柄は買い？',
    description: '投資判断に必要な項目を網羅的にチェック',
    subItemIds: [
      'revenue_growth', 'profit_growth', 'operating_margin', 'gross_margin',
      'ocf_stability', 'fcf_trend',
      'debt_analysis', 'net_cash', 'liquidity_ratio',
      'roe_roa_trend', 'roic_analysis',
      'historical_per', 'peer_ev_ebitda',
      'peer_growth_margin', 'peer_valuation',
      'financial_risk', 'business_risk',
      'past_performance', 'current_situation', 'future_scenario', 'valuation_judgment', 'risk_summary',
    ],
  },
  {
    id: 'growth_check',
    emoji: '🚀',
    title: '成長性を評価したい',
    description: '売上・利益は伸びる？成長ドライバーは何？',
    subItemIds: [
      'revenue_growth', 'profit_growth', 'operating_margin', 'gross_margin', 'sga_analysis',
      'ocf_stability', 'fcf_trend', 'capex_analysis',
      'roe_roa_trend', 'roic_analysis', 'capital_efficiency',
      'revenue_acceleration', 'margin_reversal',
      'peer_growth_margin',
      'future_scenario',
    ],
  },
  {
    id: 'value_check',
    emoji: '💰',
    title: '割安かどうか知りたい',
    description: '今の株価は適正？割安なら買い時かも',
    subItemIds: [
      'historical_per', 'peer_ev_ebitda', 'peer_valuation',
      'price_vs_revenue', 'price_vs_margin', 'eps_driver', 'per_expansion',
      'peer_growth_margin', 'peer_position',
      'rerating_catalyst',
      'valuation_judgment',
    ],
  },
  {
    id: 'risk_check',
    emoji: '🛡️',
    title: 'リスクを確認したい',
    description: '見落としがちなリスクを事前にチェック',
    subItemIds: [
      'debt_analysis', 'net_cash', 'financial_leverage', 'liquidity_ratio',
      'ocf_vs_profit', 'working_capital', 'inventory_risk',
      'financial_risk', 'business_risk', 'macro_sensitivity', 'regulatory_risk',
      'inventory_surge',
      'risk_summary',
    ],
  },
  {
    id: 'dividend_check',
    emoji: '🎁',
    title: '配当・還元を重視',
    description: '配当は安定している？増配の余地は？',
    subItemIds: [
      'ocf_stability', 'fcf_trend', 'fcf_margin',
      'debt_analysis', 'net_cash',
      'roe_roa_trend',
      'financial_risk',
      'buyback_dividend',
      'past_performance', 'current_situation',
      'historical_per',
    ],
  },
];

export const ANALYSIS_FRAMEWORK: AnalysisCategory[] = [
  {
    id: 'market_overview',
    emoji: '\u{1F9E9}',
    title: '市場全体（トップダウン分析）',
    description: 'マクロ環境・セクター動向・景気サイクルの把握',
    subItems: [
      {
        id: 'macro_env',
        title: 'マクロ環境分析',
        description: 'GDP・インフレ・金利・為替の把握',
        recommendedDepth: 'standard',
        whyItMatters: '金利上昇局面ではグロース株が売られやすく、景気後退期にはディフェンシブ銘柄が強い。マクロ環境を知ることで「今この銘柄を買うタイミングか？」が判断できる。',
        checkPoints: [
          '日銀の金融政策（利上げ・利下げ）の方向',
          '円安/円高のトレンドと企業への影響',
          'GDP成長率の推移（景気拡大か後退か）',
          'インフレ率と企業のコスト転嫁力',
        ],
        example: '例: 円安が進むと輸出企業（トヨタ等）は増益、輸入企業（電力等）は減益になる傾向',
      },
      {
        id: 'sector_flow',
        title: 'セクター資金流入',
        description: 'セクターごとの資金循環を把握',
        recommendedDepth: 'deep',
        whyItMatters: '機関投資家の資金がどのセクターに向かっているかを知ると、追い風・逆風のセクターが分かる。個別銘柄の良し悪し以前に、セクター全体の流れに逆らうのは難しい。',
        checkPoints: [
          'セクター別ETFの資金流出入データ',
          '業種別の株価騰落率ランキング',
          '外国人投資家の売買動向（セクター別）',
        ],
      },
      {
        id: 'industry_trend',
        title: '業界トレンド',
        description: '業界の成長・衰退の方向性',
        recommendedDepth: 'standard',
        whyItMatters: '衰退する業界の優良企業より、成長する業界の普通の企業の方がリターンが高いことが多い。「業界自体が伸びているか？」は銘柄選び以前の大前提。',
        checkPoints: [
          '業界全体の市場規模の推移と予測',
          '新規参入・撤退企業の動向',
          '技術革新やDXによる構造変化',
          '規制環境の変化（追い風か逆風か）',
        ],
        example: '例: EV化の流れで自動車部品メーカーはエンジン系が衰退、電装系が成長',
      },
      {
        id: 'business_cycle',
        title: '景気サイクル分析',
        description: '景気サイクルと業種の関係性',
        recommendedDepth: 'deep',
        whyItMatters: '景気サイクルの局面によって強い業種が変わる。今がサイクルのどこにいるかを把握すれば、半年〜1年後に強くなるセクターに先回りできる。',
        checkPoints: [
          '景気先行指標（日銀短観DIなど）の動向',
          'サイクルの4局面（回復→拡大→後退→底打ち）のどこか',
          '対象企業の業績が景気に連動するか（シクリカルか）',
        ],
      },
    ],
  },
  {
    id: 'pl_analysis',
    emoji: '\u{1F4C8}',
    title: '業績トレンド（PL）',
    description: '売上・利益の成長率、マージン推移、費用構造',
    subItems: [
      {
        id: 'revenue_growth',
        title: '売上高成長率',
        description: '売上の成長率・トレンドを確認',
        recommendedDepth: 'quick',
        whyItMatters: '売上が伸びていない企業は、いくらコストカットしても成長に限界がある。売上成長は企業の「体力」そのもの。',
        checkPoints: [
          '過去5年の売上高と前年比成長率',
          '成長率が加速しているか、鈍化しているか',
          '売上成長の要因（数量増？単価上昇？新規事業？M&A？）',
        ],
        example: '例: 売上成長率が10%→8%→5%→3%と鈍化していたら、成長フェーズの終わりかも',
      },
      {
        id: 'profit_growth',
        title: '営業利益・経常利益の成長率',
        description: '利益の増減トレンド',
        recommendedDepth: 'quick',
        whyItMatters: '売上が伸びても利益が伸びなければ株価は上がらない。「稼ぐ力」が向上しているかが最も株価に直結する。',
        checkPoints: [
          '営業利益の過去5年推移と前年比',
          '売上成長率と利益成長率の差（利益の方が速く伸びていれば◎）',
          '一時的要因（特別利益/損失）を除いた実力利益',
        ],
        example: '例: 売上+5%なのに営業利益+15%なら、利益率が改善している良いサイン',
      },
      {
        id: 'operating_margin',
        title: '営業利益率の推移',
        description: 'マージンの改善・悪化トレンド',
        recommendedDepth: 'quick',
        whyItMatters: '営業利益率は企業の「稼ぐ効率」を示す最重要指標。利益率が改善中の企業は株式市場で高く評価される。',
        checkPoints: [
          '営業利益率の過去5年の推移（改善？悪化？横ばい？）',
          '同業他社と比べて高いか低いか',
          '利益率の変動が大きい場合、その理由',
        ],
        example: '例: 営業利益率が5%→7%→9%と改善中なら、コスト削減や高付加価値化が進んでいる',
      },
      {
        id: 'gross_margin',
        title: '粗利益率・オペレーティングマージン',
        description: '売上総利益率と営業利益の関係',
        recommendedDepth: 'standard',
        whyItMatters: '粗利率は「製品・サービスの競争力」、営業利益率は「会社全体の効率」。粗利率が下がっていたら、価格競争に巻き込まれている危険信号。',
        checkPoints: [
          '粗利率の推移（価格転嫁力があるか）',
          '粗利率と営業利益率の差（=販管費率）の推移',
          '原材料費高騰時に粗利率が維持できているか',
        ],
      },
      {
        id: 'sga_analysis',
        title: '販管費分析',
        description: '販管費率の推移、費用構造の変化',
        recommendedDepth: 'standard',
        whyItMatters: '販管費は企業が最もコントロールしやすいコスト。販管費率が上がっていれば「コスト肥大化」、下がっていれば「経営効率化」のサイン。',
        checkPoints: [
          '販管費/売上高（販管費率）の推移',
          '人件費・広告費・研究開発費の内訳変化',
          '売上が減っても販管費を削減できているか',
        ],
        example: '例: 売上成長率3%なのに販管費成長率8%なら、コスト膨張で利益が圧迫される',
      },
      {
        id: 'sga_vs_margin',
        title: 'SGA比率 vs 営業利益率',
        description: '費用効率とコスト戦略の分析',
        recommendedDepth: 'deep',
        whyItMatters: 'SGA（販管費）と営業利益率の関係を見ると、企業が「攻め（投資）」と「守り（効率化）」のどちらの局面にいるか分かる。',
        checkPoints: [
          'SGA比率が下がり営業利益率が上がっていれば「効率化フェーズ」',
          'SGA比率が上がり営業利益率も上がっていれば「投資回収フェーズ」',
          'SGA比率が上がり営業利益率が下がっていれば「危険信号」',
        ],
      },
      {
        id: 'sga_vs_revenue_growth',
        title: 'SGA成長率 vs 売上成長率',
        description: 'スケールメリット・コスト膨張の判断',
        recommendedDepth: 'deep',
        whyItMatters: '売上成長率 > SGA成長率なら「スケールメリットが効いている」。逆なら「売上を取るためにコストがかさんでいる」危険信号。',
        checkPoints: [
          '売上成長率とSGA成長率のギャップの推移',
          'ギャップが広がっているか縮まっているか',
          '研究開発費の増加は将来への投資として許容',
        ],
      },
      {
        id: 'operating_leverage',
        title: 'オペレーティングレバレッジ',
        description: '景気悪化時の耐性、固定費の弾力性',
        recommendedDepth: 'deep',
        whyItMatters: '固定費が大きい企業は、売上が少し減っただけで利益が大きく減る。逆に売上回復局面では利益が急回復する「てこの原理」。',
        checkPoints: [
          '固定費と変動費の比率',
          '売上10%減少時に営業利益がどれくらい減るか（感応度）',
          '過去の景気悪化時にどの程度利益が落ちたか',
        ],
        example: '例: 航空会社は固定費が大きく、コロナ禍で売上-50%→営業利益は赤字転落',
      },
    ],
  },
  {
    id: 'cf_analysis',
    emoji: '\u{1F4B0}',
    title: 'キャッシュフロー（CF）',
    description: '営業CF・投資CF・FCFの分析',
    subItems: [
      {
        id: 'ocf_stability',
        title: '営業CFの安定性',
        description: '本業のキャッシュ創出力',
        recommendedDepth: 'quick',
        whyItMatters: '利益は「会計上の数字」に過ぎないが、営業CFは「実際に入ってきたお金」。営業CFが安定してプラスなら、企業の稼ぐ力は本物。',
        checkPoints: [
          '営業CFが過去5年間安定してプラスか',
          '営業CFが年々増加しているか',
          '営業CFがマイナスの年があれば、その原因',
        ],
        example: '例: 営業利益は黒字なのに営業CFがマイナスなら、売掛金の回収が遅れている可能性',
      },
      {
        id: 'ocf_vs_profit',
        title: '営業CF vs 営業利益の乖離',
        description: '利益の質をCFで検証',
        recommendedDepth: 'standard',
        whyItMatters: '営業利益と営業CFが大きく乖離していたら「利益の質」に問題がある。会計上の利益操作（粉飾とは言わないまでも）を見抜くための最重要チェック。',
        checkPoints: [
          '営業CF ÷ 営業利益 の比率（1.0以上が理想）',
          '比率が急低下した年はないか',
          '乖離が大きい場合、減価償却・在庫変動・売掛金変動を確認',
        ],
        example: '例: 営業利益100億、営業CF40億 → CF/利益=0.4 → 利益の質に疑問あり',
      },
      {
        id: 'working_capital',
        title: '運転資本の変化',
        description: '在庫・売掛金がCFに与える影響',
        recommendedDepth: 'standard',
        whyItMatters: '在庫や売掛金が膨らむと、利益は出ていてもキャッシュが足りなくなる。特に在庫増は「売れ残りリスク」の先行指標。',
        checkPoints: [
          '売掛金の対売上比率の推移（増加は回収悪化の兆候）',
          '棚卸資産の対売上比率の推移（増加は売れ残りリスク）',
          '買掛金の変化（支払い条件の変更）',
        ],
      },
      {
        id: 'capex_analysis',
        title: '投資CF（Capex）の増減',
        description: '設備投資の妥当性・効率性',
        recommendedDepth: 'standard',
        whyItMatters: '設備投資は将来の成長の源泉。投資が少なすぎると競争力低下、多すぎると資金ショートのリスク。「適切な投資をしているか」は企業の将来を左右する。',
        checkPoints: [
          '設備投資額の推移と対売上比率',
          '減価償却費と設備投資の比率（1以上なら維持投資以上に投資）',
          '投資の内容（成長投資か維持補修か）',
        ],
      },
      {
        id: 'fcf_trend',
        title: 'フリーCFのトレンド',
        description: 'FCFの成長・悪化パターン',
        recommendedDepth: 'quick',
        whyItMatters: 'FCF（フリーキャッシュフロー）= 営業CF − 設備投資。企業が自由に使えるお金。配当・自社株買い・借金返済の原資。FCFが安定して出ていない企業は、還元も成長投資もできない。',
        checkPoints: [
          'FCFが過去5年間プラスを維持しているか',
          'FCFのトレンド（増加傾向か減少傾向か）',
          '大型投資年にFCFがマイナスになるのは許容（翌年回復すればOK）',
        ],
        example: '例: FCFが毎年100億以上出ている企業は、配当増や自社株買いの余力がある',
      },
      {
        id: 'fcf_margin',
        title: 'FCFマージンの推移',
        description: 'FCF/売上高で真のキャッシュ収益力を評価',
        recommendedDepth: 'deep',
        whyItMatters: 'FCFマージン（FCF÷売上高）は企業の「真のキャッシュ収益力」。営業利益率よりもごまかしが効かない。FCFマージン10%以上なら優良企業。',
        checkPoints: [
          'FCFマージンの過去5年推移',
          '同業他社とのFCFマージン比較',
          'FCFマージンと営業利益率の差が開いていないか',
        ],
      },
    ],
  },
  {
    id: 'bs_analysis',
    emoji: '\u{1F3E6}',
    title: '財務の健全性（BS）',
    description: '負債・自己資本・レバレッジ・在庫の分析',
    subItems: [
      {
        id: 'debt_analysis',
        title: '有利子負債の増減',
        description: '借入金の推移と返済能力',
        recommendedDepth: 'quick',
        whyItMatters: '借金が多すぎる企業は、金利上昇や業績悪化で一気に経営危機に陥る。逆に無借金経営は安心だが、レバレッジを効かせていない可能性も。',
        checkPoints: [
          '有利子負債の推移（増加？減少？）',
          '有利子負債÷EBITDA（返済能力の目安。3倍以下が理想）',
          'D/Eレシオ（有利子負債÷純資産。1倍以下が安全圏）',
        ],
        example: '例: 有利子負債/EBITDA=5倍 → 今の利益水準で返済に5年かかる → やや重い',
      },
      {
        id: 'net_cash',
        title: '自己資本・現金残高の推移',
        description: 'ネットキャッシュ/ネットデットの判定',
        recommendedDepth: 'quick',
        whyItMatters: '現金 > 借金（ネットキャッシュ）なら財務は安全。倒産リスクほぼゼロ。逆に借金 > 現金（ネットデット）なら注意が必要。',
        checkPoints: [
          '現金等の推移',
          'ネットキャッシュ＝現金 − 有利子負債 がプラスか',
          '現金が急増/急減した理由（M&A？増資？事業からの蓄積？）',
        ],
      },
      {
        id: 'financial_leverage',
        title: '財務レバレッジの変化',
        description: 'レバレッジ依存のリスク評価',
        recommendedDepth: 'standard',
        whyItMatters: 'ROEが高くても、借金を増やして見かけ上高くしているだけかもしれない。レバレッジの変化を見ると、ROEの「質」が分かる。',
        checkPoints: [
          '総資産÷自己資本（財務レバレッジ）の推移',
          'レバレッジが上昇中ならROEの改善は本物か疑う',
          '自己資本比率の推移（低すぎないか）',
        ],
      },
      {
        id: 'liquidity_ratio',
        title: '流動比率・自己資本比率',
        description: '短期支払い能力と財務安定性',
        recommendedDepth: 'standard',
        whyItMatters: '流動比率が100%未満だと、1年以内に支払うお金が足りなくなる可能性。自己資本比率が低すぎると景気悪化時に債務超過の危険。',
        checkPoints: [
          '流動比率（流動資産÷流動負債）が150%以上あるか',
          '自己資本比率が30%以上あるか',
          '急激な悪化がないか（前年比で大きく低下していないか）',
        ],
      },
      {
        id: 'dupont_analysis',
        title: 'ROE/ROAのDuPont分析',
        description: 'ROEの構成要素を分解して質を評価',
        recommendedDepth: 'deep',
        whyItMatters: 'ROE = 利益率 × 資産回転率 × 財務レバレッジ。同じROE15%でも「高利益率で稼いでいる」のか「借金で膨らませている」のかで意味が全く違う。',
        checkPoints: [
          'ROEを3要素に分解: 純利益率 × 総資産回転率 × 財務レバレッジ',
          'どの要素がROEの主な推進力か',
          '利益率主導のROE向上が最も質が高い',
        ],
        example: '例: A社ROE15%（利益率10%×回転率1.0×レバレッジ1.5）→ 利益率主導で健全',
      },
      {
        id: 'inventory_risk',
        title: '棚卸資産の増減',
        description: '在庫リスクと景気先行指標としての活用',
        recommendedDepth: 'deep',
        whyItMatters: '在庫が売上を大幅に上回って増加していたら、需要が減っているのに作りすぎている可能性。在庫の急増は業績悪化の先行シグナル。',
        checkPoints: [
          '棚卸資産÷売上高の比率推移',
          '在庫増加率 vs 売上増加率（在庫の方が速く増えていたら危険）',
          '在庫の内訳（原材料？仕掛品？製品？）',
        ],
      },
    ],
  },
  {
    id: 'profitability',
    emoji: '\u{1F4B9}',
    title: '収益性・効率性',
    description: 'ROE/ROA/ROIC、資本効率、WACC比較',
    subItems: [
      {
        id: 'roe_roa_trend',
        title: 'ROE・ROAの推移',
        description: '株主リターンと資産効率の時系列分析',
        recommendedDepth: 'quick',
        whyItMatters: 'ROE（株主が預けたお金でどれだけ稼いだか）は株式投資の最重要指標の一つ。ROE8%以上が株主資本コストの目安。10%超なら優良。',
        checkPoints: [
          'ROEの過去5年推移（改善傾向？）',
          'ROEが8%以上を安定的に維持しているか',
          'ROAも並行して確認（資産全体の効率性）',
        ],
        example: '例: ROE 12% → 企業は株主の100万円で12万円稼いでいる。銀行預金より遥かに高い',
      },
      {
        id: 'roic_analysis',
        title: 'ROIC分析',
        description: '投下資本利益率で事業の本質的収益力を評価',
        recommendedDepth: 'standard',
        whyItMatters: 'ROICは「事業に投下した資本（株主資本+有利子負債）からどれだけ利益を上げたか」。財務レバレッジの影響を受けないため、ROEより正確に稼ぐ力を測れる。',
        checkPoints: [
          'ROIC = 税引後営業利益 ÷ 投下資本 の推移',
          'ROICが7%以上か（一般的なWACCの目安）',
          'ROIC > WACC なら価値創造、ROIC < WACC なら価値破壊',
        ],
      },
      {
        id: 'capital_efficiency',
        title: '資本効率の改善・悪化',
        description: '成長フェーズと効率変化の関係',
        recommendedDepth: 'standard',
        whyItMatters: '成長投資をしている時期はROE/ROICが一時的に低下することがある。投資回収フェーズに入れば効率が改善するはず。「今の効率低下は将来のためか」を見極める。',
        checkPoints: [
          'ROE/ROICの変化と設備投資額の関係',
          '大型投資後にROEが回復しているか',
          '同業他社と比べた資本効率の位置',
        ],
      },
      {
        id: 'roic_vs_wacc',
        title: 'ROIC vs WACC',
        description: '価値創造か価値破壊かの判定',
        recommendedDepth: 'deep',
        whyItMatters: 'ROIC > WACC（資本コスト）なら企業は「価値を創造」している。逆なら株主のお金を毀損している。この判定が企業の本質的な価値を決める。',
        checkPoints: [
          'WACC（加重平均資本コスト）の推定値',
          'ROIC - WACC のスプレッドの推移',
          'スプレッドが拡大傾向か縮小傾向か',
        ],
      },
      {
        id: 'turnover_ratios',
        title: '在庫/売掛金/仕入れ回転率',
        description: '運転資本の効率性を評価',
        recommendedDepth: 'deep',
        whyItMatters: '回転率が高い＝少ない資産で効率よく売上を上げている。回転率の悪化は経営効率の低下や在庫リスクの先行指標。',
        checkPoints: [
          '在庫回転日数（少ない方が◎）',
          '売掛金回転日数（少ない方が◎、取引先の信用力も影響）',
          '買掛金回転日数（交渉力の指標）',
          'CCC（キャッシュコンバージョンサイクル）の推移',
        ],
      },
    ],
  },
  {
    id: 'stock_driver',
    emoji: '\u{1F4CA}',
    title: '株価ドライバー分析',
    description: '株価を動かしている真の要因の特定',
    subItems: [
      {
        id: 'price_vs_revenue',
        title: '株価 vs 売上成長',
        description: '株価が売上成長に反応しているか',
        recommendedDepth: 'standard',
        whyItMatters: '株価が何に連動して動いているかを特定すれば、「次にこの数字が改善/悪化したら株価がどう動くか」を予測できる。',
        checkPoints: [
          '過去5年の売上成長率と株価騰落率の相関',
          '売上成長が加速した時に株価が反応したか',
          '売上鈍化時に株価がどの程度下落したか',
        ],
      },
      {
        id: 'price_vs_margin',
        title: '株価 vs 利益率変化',
        description: '利益率の変動と株価の連動',
        recommendedDepth: 'standard',
        whyItMatters: 'グロース株は売上成長、バリュー株は利益率改善に株価が反応しやすい。対象企業の「ドライバー」を特定して投資判断に活かす。',
        checkPoints: [
          '営業利益率の変化と株価変動の時系列比較',
          '利益率改善時の株価反応の大きさ',
          '利益率悪化時の株価下落の大きさ',
        ],
      },
      {
        id: 'eps_driver',
        title: 'EPS・営業利益と株価の関係',
        description: '主要ドライバーの特定',
        recommendedDepth: 'standard',
        whyItMatters: 'EPS（1株利益）は株価の最も基本的なドライバー。EPS × PER = 株価 なので、EPSの成長予測が株価予測の基盤になる。',
        checkPoints: [
          'EPS成長率と株価騰落率の関係',
          'EPS成長の内訳（増益？自社株買い？）',
          'コンセンサスEPS予想と実績の乖離',
        ],
      },
      {
        id: 'per_expansion',
        title: 'PERの拡大・縮小の要因',
        description: 'バリュエーション変動の分析',
        recommendedDepth: 'deep',
        whyItMatters: '株価 = EPS × PER。EPSが横ばいでもPERが拡大すれば株価は上がる。PERが拡大する条件（成長期待、金利低下、セクターの人気化）を理解する。',
        checkPoints: [
          'PERの過去5年レンジと現在位置',
          'PER拡大/縮小のタイミングと要因',
          '金利環境とPERの関係',
        ],
      },
      {
        id: 'price_correlation',
        title: '株価と財務指標の相関',
        description: '各指標との相関分析',
        recommendedDepth: 'deep',
        whyItMatters: '企業ごとに株価と最も相関が高い指標は異なる。相関が高い指標を見つければ、その指標の予測から株価の方向性を見通せる。',
        checkPoints: [
          '売上・利益・CF・ROE等の各指標と株価の相関係数',
          '最も相関が高い指標はどれか',
          'その指標の今後の見通し',
        ],
      },
    ],
  },
  {
    id: 'inflection_point',
    emoji: '\u{1F50D}',
    title: '変化点（インフレクションポイント）',
    description: '企業フェーズの転換点を早期発見',
    subItems: [
      {
        id: 'revenue_acceleration',
        title: '売上成長の加速・減速',
        description: '成長率のモメンタム変化',
        recommendedDepth: 'standard',
        whyItMatters: '成長率の「変化の方向」は株価に最も影響する。成長率10%→15%（加速）は株価上昇、成長率15%→10%（減速）は株価下落を招きやすい。',
        checkPoints: [
          '四半期ごとの売上成長率の推移',
          '成長率が上向き始めた（底打ち）か、下向き始めた（ピークアウト）か',
          '加速/減速の要因',
        ],
        example: '例: 3四半期連続で成長率が加速 → 株価のモメンタム転換の可能性',
      },
      {
        id: 'margin_reversal',
        title: '利益率の反転',
        description: 'マージン改善・悪化の転換点',
        recommendedDepth: 'standard',
        whyItMatters: '利益率が底を打って改善に転じるタイミングが、株価の絶好の買い場になることが多い。「トレンド転換」を見つけるのが投資の醍醐味。',
        checkPoints: [
          '営業利益率が2-3四半期連続で改善し始めたか',
          '改善の要因（コスト削減？単価上昇？ミックス改善？）',
          '一時的か構造的かの判断',
        ],
      },
      {
        id: 'roe_peak',
        title: 'ROE/ROICのピークアウト',
        description: '効率指標の天井・底の発見',
        recommendedDepth: 'deep',
        whyItMatters: 'ROEがピークアウトする兆候があれば、そこから利益成長も鈍化する可能性。逆にROEが底打ちすれば回復の起点。',
        checkPoints: [
          'ROEの四半期推移（ピークアウトの兆候？）',
          'ROE低下の原因（利益率？回転率？レバレッジ？）',
          '同業他社のROEトレンドとの比較',
        ],
      },
      {
        id: 'fcf_bottoming',
        title: 'FCFの底打ち',
        description: 'キャッシュフロー回復の兆候',
        recommendedDepth: 'deep',
        whyItMatters: '大型投資期でFCFがマイナスだった企業が、投資一巡でFCFが回復し始めるタイミングは絶好の投資機会。',
        checkPoints: [
          'FCFが2-3四半期連続で改善しているか',
          '設備投資のピーク越えの兆候',
          '営業CFの改善トレンド',
        ],
      },
      {
        id: 'inventory_surge',
        title: '在庫急増の検知',
        description: '業績悪化の先行シグナル',
        recommendedDepth: 'standard',
        whyItMatters: '在庫が売上を大幅に上回るペースで増加していたら、需要減退の先行シグナル。業績悪化の3-6ヶ月前に在庫に兆候が出ることが多い。',
        checkPoints: [
          '在庫増加率が売上増加率を上回っていないか',
          '在庫回転日数が急増していないか',
          '製品在庫（売れ残り）が増えていないか',
        ],
        example: '例: 売上+3%なのに在庫+20% → 来期の売上減少・在庫評価損のリスク',
      },
      {
        id: 'strategy_shift',
        title: '経営戦略の転換点',
        description: '新規事業・構造改革の効果検証',
        recommendedDepth: 'deep',
        whyItMatters: '構造改革や新規事業への転換を発表した企業は、短期的には費用増で利益圧迫されるが、成功すれば大きな株価上昇が期待できる。',
        checkPoints: [
          '中期経営計画の進捗状況',
          '新規事業の売上構成比の変化',
          '構造改革の効果が数字に表れているか',
        ],
      },
    ],
  },
  {
    id: 'peer_comparison',
    emoji: '\u{1F19A}',
    title: '競合比較（ピア分析）',
    description: '同業他社との相対的な強み・弱みの把握',
    subItems: [
      {
        id: 'peer_growth_margin',
        title: '売上成長・利益率比較',
        description: '同業3-5社との成長・利益率比較',
        recommendedDepth: 'standard',
        whyItMatters: '同業他社と比べて成長率や利益率が高いなら、その企業は「競争優位」を持っている可能性が高い。低いなら何が弱いのか要因分析が必要。',
        checkPoints: [
          '同業3-5社の売上成長率を比較',
          '営業利益率の比較（高い方が競争力がある）',
          '利益率の差の要因（コスト構造？価格決定力？規模の経済？）',
        ],
      },
      {
        id: 'peer_position',
        title: '業界内ポジション',
        description: '高利益率型 vs 高成長型の分類',
        recommendedDepth: 'standard',
        whyItMatters: '企業が業界内でどういうポジションにいるかで、投資の性格が変わる。高利益率型は安定配当、高成長型はキャピタルゲイン狙い。',
        checkPoints: [
          '成長率×利益率のマッピングでの位置',
          '業界シェアの推移',
          '差別化要因の特定',
        ],
      },
      {
        id: 'peer_roe_roic',
        title: 'ROE・ROIC比較',
        description: '競合との資本効率差',
        recommendedDepth: 'standard',
        whyItMatters: '同業でROEに差があるなら、その差の原因（利益率？回転率？レバレッジ？）を分解すると、企業の「稼ぐ仕組み」の違いが分かる。',
        checkPoints: [
          '同業のROE/ROICランキング',
          'DuPont分析で差の要因を分解',
          'ROEの差が縮小傾向か拡大傾向か',
        ],
      },
      {
        id: 'peer_cost_structure',
        title: 'コスト構造比較',
        description: 'SGA比率・原価率の差異分析',
        recommendedDepth: 'deep',
        whyItMatters: '利益率の差がコスト構造のどこから来ているかを特定すると、改善余地や構造的な強さが分かる。',
        checkPoints: [
          '原価率（売上原価÷売上高）の比較',
          'SGA比率（販管費÷売上高）の比較',
          '研究開発費比率の比較',
          'コスト差の原因（規模？効率？人件費？）',
        ],
      },
      {
        id: 'peer_valuation',
        title: 'PER/PBR/EV/EBITDA相対比較',
        description: 'バリュエーション面での割安・割高',
        recommendedDepth: 'standard',
        whyItMatters: '同業他社と比べてPERが低ければ「割安」、高ければ「割高」。ただし低PERには理由がある（成長性が低い等）ので、なぜ差があるかを考えることが重要。',
        checkPoints: [
          'PER/PBRの同業他社比較',
          'EV/EBITDAの比較（負債構造が異なる場合に有効）',
          'バリュエーション差の理由（成長性？利益の質？リスク？）',
        ],
      },
    ],
  },
  {
    id: 'valuation',
    emoji: '\u{1F4B5}',
    title: 'バリュエーション評価',
    description: '株価が割安か割高かの総合判断',
    subItems: [
      {
        id: 'historical_per',
        title: '過去PERレンジとの比較',
        description: '過去の評価水準に対する現在位置',
        recommendedDepth: 'quick',
        whyItMatters: '過去5年のPERレンジ（例:10-20倍）の中で、今のPERが低い位置にあれば「過去と比べて割安」、高い位置にあれば「割高」の目安。最も簡単なバリュエーション評価法。',
        checkPoints: [
          '過去5年のPERレンジ（最低〜最高）',
          '現在のPERはレンジのどの位置か',
          '過去の低PER時と高PER時に何があったか',
        ],
        example: '例: 過去5年PER 12-25倍、現在14倍 → レンジ下限に近く、割安圏の可能性',
      },
      {
        id: 'peer_ev_ebitda',
        title: '同業EV/EBITDA比較',
        description: '企業価値ベースでの相対評価',
        recommendedDepth: 'standard',
        whyItMatters: 'EV/EBITDAは負債構造や税率の違いを排除した比較指標。M&Aの目安にもなり、「この企業を丸ごと買ったら何年で元が取れるか」の概算。',
        checkPoints: [
          '同業他社のEV/EBITDA倍率一覧',
          '平均値からの乖離',
          '低い場合→割安か、利益の質に問題があるか',
        ],
      },
      {
        id: 'dcf_analysis',
        title: 'DCF分析',
        description: '将来キャッシュフローに基づく企業価値算定',
        recommendedDepth: 'deep',
        whyItMatters: '理論上最も正確な企業価値算定法。将来のFCFを現在価値に割り引いて「企業が本来いくらの価値があるか」を計算する。',
        checkPoints: [
          '今後5-10年のFCF予測',
          '割引率（WACC）の設定',
          'ターミナルバリューの前提（永久成長率）',
          '算出された理論株価と現在株価の比較',
        ],
      },
      {
        id: 'rerating_catalyst',
        title: '再評価のカタリスト',
        description: '何が変われば再評価されるかの探索',
        recommendedDepth: 'deep',
        whyItMatters: '割安に見えても、カタリスト（株価を動かすきっかけ）がなければ株価は上がらない。「何がトリガーになるか」を考えることが投資成功の鍵。',
        checkPoints: [
          '次の決算で何がサプライズになりうるか',
          '中期経営計画の達成で評価が変わるか',
          '業界再編やM&Aの可能性',
          '自社株買いや増配の発表の可能性',
        ],
      },
    ],
  },
  {
    id: 'risk_analysis',
    emoji: '\u{26A0}\u{FE0F}',
    title: 'リスク分析',
    description: '投資を阻む可能性のあるリスク要因',
    subItems: [
      {
        id: 'financial_risk',
        title: '財務リスク',
        description: '負債過多・キャッシュ不足の評価',
        recommendedDepth: 'quick',
        whyItMatters: 'どんなに良い企業でも資金ショートすれば終わり。最悪のシナリオ（業績急悪化+資金繰り悪化）でも耐えられるかをチェック。',
        checkPoints: [
          '有利子負債比率は過大ではないか',
          '手元現金で1年以上の運転資金は賄えるか',
          '大型の社債償還が近い時期にないか',
          'インタレストカバレッジレシオ（営業利益÷支払利息）は十分か',
        ],
      },
      {
        id: 'business_risk',
        title: '事業リスク',
        description: '競争悪化・顧客集中度の評価',
        recommendedDepth: 'standard',
        whyItMatters: '売上の50%が1社の顧客に依存していたら、その顧客を失うだけで業績半減。事業リスクの集中度は見落としやすいが致命的。',
        checkPoints: [
          '主要顧客への売上依存度',
          '競合の参入状況（新規参入の脅威）',
          '技術の陳腐化リスク',
          '主力製品のライフサイクルの段階',
        ],
      },
      {
        id: 'macro_sensitivity',
        title: 'マクロ感応度',
        description: '為替・金利・景気への感応度',
        recommendedDepth: 'standard',
        whyItMatters: '為替が1円動くと利益が何億変動するか。金利が0.5%上がったら借入コストがどう変わるか。マクロ環境の変化に対する感度を知る。',
        checkPoints: [
          '為替感応度（1円の変動による営業利益への影響額）',
          '金利感応度（変動金利の借入比率）',
          '景気感応度（過去の景気後退時の業績推移）',
        ],
        example: '例: トヨタは1円の円安で約500億円の営業利益増。為替に大きく左右される',
      },
      {
        id: 'regulatory_risk',
        title: '制度・規制リスク',
        description: '規制変更が業績に与える影響',
        recommendedDepth: 'deep',
        whyItMatters: '規制の変更は突然来て、しかも影響が甚大。環境規制、薬事規制、金融規制などは業界のゲームチェンジャーになりうる。',
        checkPoints: [
          '現在議論されている規制変更',
          '規制変更による影響の大きさ',
          '対応に必要なコストと時間',
        ],
      },
      {
        id: 'supply_chain_risk',
        title: 'サプライチェーンリスク',
        description: '調達・生産の集中度リスク',
        recommendedDepth: 'deep',
        whyItMatters: '特定の部品を1社からしか調達できない場合、その供給が途絶えると生産停止になる。コロナ禍で多くの企業がこのリスクを痛感した。',
        checkPoints: [
          '主要原材料の調達先の分散度',
          '生産拠点の地理的集中度',
          '代替調達先の有無',
        ],
      },
    ],
  },
  {
    id: 'management_quality',
    emoji: '\u{1F4D1}',
    title: '経営の質',
    description: '経営陣の実績・戦略・ガバナンスの定性評価',
    subItems: [
      {
        id: 'mgmt_track_record',
        title: '経営陣の実績',
        description: '過去の業績達成度・戦略成功率',
        recommendedDepth: 'standard',
        whyItMatters: '過去の中期経営計画を達成してきた経営陣は信頼できる。逆に毎回未達だと「今回も未達になるのでは」と市場に疑われ、バリュエーションが低くなる。',
        checkPoints: [
          '過去の中期経営計画の達成率',
          '経営陣交代の前後で業績がどう変わったか',
          'CEO/CFOの発言と実績の整合性',
        ],
      },
      {
        id: 'strategy_consistency',
        title: '戦略の一貫性',
        description: '中期経営計画との整合性',
        recommendedDepth: 'standard',
        whyItMatters: '戦略がころころ変わる企業は市場の信頼を得られない。一貫した戦略を実行し続けている企業は、投資家からのプレミアムが付きやすい。',
        checkPoints: [
          '中期経営計画の主要KPIの進捗',
          '戦略の方向性が前回から大きく変わっていないか',
          '投資配分が戦略と整合しているか',
        ],
      },
      {
        id: 'guidance_reliability',
        title: '業績ガイダンスの信頼性',
        description: '過去のガイダンス精度',
        recommendedDepth: 'deep',
        whyItMatters: '業績予想（ガイダンス）が毎回正確な企業は、経営の予見可能性が高く信頼できる。保守的すぎても楽観的すぎても問題。',
        checkPoints: [
          '過去5年の期初予想と実績の乖離率',
          '上方修正/下方修正の頻度とタイミング',
          '保守的傾向か楽観的傾向か',
        ],
      },
      {
        id: 'moat_analysis',
        title: '競争優位性（Moat）分析',
        description: '参入障壁・ネットワーク効果・ブランド力',
        recommendedDepth: 'standard',
        whyItMatters: '強い競争優位性（堀=Moat）を持つ企業は、長期にわたって高い利益率を維持できる。バフェットが最も重視する分析ポイント。',
        checkPoints: [
          '参入障壁の有無と強さ（規模、特許、規制、ブランド）',
          'ネットワーク効果はあるか',
          '切り替えコスト（顧客が他社に乗り換えにくいか）',
          '競争優位が過去10年で強まっているか弱まっているか',
        ],
        example: '例: キーエンスは「高収益+独自販売体制+ニッチ市場」の堀で営業利益率50%超を維持',
      },
    ],
  },
  {
    id: 'event_analysis',
    emoji: '\u{1F4C5}',
    title: 'イベント分析',
    description: '決算発表・M&A等のイベントと株価の関係',
    subItems: [
      {
        id: 'earnings_reaction',
        title: '決算発表と株価反応',
        description: '決算サプライズと株価変動の分析',
        recommendedDepth: 'standard',
        whyItMatters: '決算発表は最大の株価変動イベント。良い決算でも株価が下がることがある（既に織り込み済み）。過去の反応パターンを知ると、次の決算前の戦略が立てられる。',
        checkPoints: [
          '過去4-8回の決算発表日の株価変動',
          'コンセンサス予想とのサプライズの度合い',
          '「良い決算→株価下落」のパターンがないか（期待値が高すぎた）',
        ],
      },
      {
        id: 'guidance_impact',
        title: 'ガイダンス修正の影響',
        description: '業績予想修正と市場反応',
        recommendedDepth: 'standard',
        whyItMatters: '上方修正は好材料、下方修正は悪材料。特に上方修正が連続する銘柄は「アナリストの期待を常に上回る実力企業」として評価される。',
        checkPoints: [
          '過去の上方修正/下方修正の頻度',
          '修正幅の大きさと株価への影響',
          '修正のタイミング（期初？期中？期末？）',
        ],
      },
      {
        id: 'buyback_dividend',
        title: '自社株買い・増配の効果',
        description: '資本政策と株価パフォーマンス',
        recommendedDepth: 'deep',
        whyItMatters: '自社株買いはEPSを増加させ、株価の下支えになる。増配は安定株主を呼び込む。経営陣が「株価は割安」と判断しているサインでもある。',
        checkPoints: [
          '過去の自社株買い実績（金額、タイミング）',
          '配当性向の推移と増配余力',
          '総還元性向（配当+自社株買い÷純利益）',
        ],
      },
      {
        id: 'ma_reaction',
        title: 'M&Aの株価反応',
        description: '大型案件の市場評価',
        recommendedDepth: 'deep',
        whyItMatters: 'M&Aは企業の将来を大きく変える。買収側の株価が下がる「買い手の呪い」が多いが、戦略的に正しいM&Aは長期的に大きなリターンをもたらす。',
        checkPoints: [
          '過去のM&A実績と買収後の業績変化',
          '買収価格の妥当性（EV/EBITDA倍率）',
          '統合シナジーの実現度',
        ],
      },
    ],
  },
  {
    id: 'screening',
    emoji: '\u{1F9EE}',
    title: 'スクリーニング',
    description: '条件に合う銘柄の発掘・絞り込み',
    subItems: [
      {
        id: 'quality_screen',
        title: '収益性スクリーニング',
        description: 'ROE > 10%、営業CF+、利益成長率+',
        recommendedDepth: 'quick',
        whyItMatters: '質の高い企業だけを対象にすることで、大外れを避けられる。最低限の収益性・キャッシュ創出力フィルターは投資の第一歩。',
        checkPoints: [
          'ROE 10%以上か',
          '営業CFが3年連続プラスか',
          '営業利益が前年比でプラスか',
          '自己資本比率30%以上か',
        ],
      },
      {
        id: 'fcf_improvement',
        title: 'FCF改善銘柄の発掘',
        description: 'FCFが改善し始めた企業',
        recommendedDepth: 'standard',
        whyItMatters: 'FCFが底打ちして改善に転じた銘柄は、投資回収フェーズに入った可能性。株価に反映される前に発見できれば大きなリターンが狙える。',
        checkPoints: [
          'FCFが前年比で改善しているか',
          '設備投資のピークが過ぎたか',
          '営業CFが安定して増加しているか',
        ],
      },
      {
        id: 'margin_improvement',
        title: '利益率改善トレンド',
        description: '3四半期連続改善した銘柄',
        recommendedDepth: 'standard',
        whyItMatters: '利益率が改善トレンドにある銘柄は、株式市場で最も評価されるパターンの一つ。特に「底打ちから改善に転じた」タイミングは投資妙味が高い。',
        checkPoints: [
          '営業利益率が3四半期連続改善しているか',
          '改善の持続可能性（一時的要因ではないか）',
          'アナリストの利益率見通しとの比較',
        ],
      },
      {
        id: 'relative_value',
        title: '相対割安銘柄の発掘',
        description: '競合より割安な企業',
        recommendedDepth: 'standard',
        whyItMatters: '同業で利益率やROEが似ているのにPERが半分の企業があれば、市場が見落としている可能性。割安の理由を確認した上で投資判断。',
        checkPoints: [
          '同業他社とのPER/PBR比較で突出して低い銘柄',
          '割安の理由（正当な理由？市場の見落とし？）',
          '業績改善のカタリストがあるか',
        ],
      },
    ],
  },
  {
    id: 'investment_story',
    emoji: '\u{1F3AF}',
    title: '投資ストーリー構築',
    description: '最終的な投資判断のためのストーリー作成',
    subItems: [
      {
        id: 'past_performance',
        title: '過去の業績（事実）',
        description: '業績の推移と実績の整理',
        recommendedDepth: 'quick',
        whyItMatters: '投資判断は「過去→現在→未来」の3ステップで考える。まず過去の事実を正確に把握することが出発点。',
        checkPoints: [
          '過去5年の売上・営業利益・純利益の推移',
          '成長率と利益率のトレンド',
          '特殊要因（M&A、リストラ等）の有無と影響',
        ],
      },
      {
        id: 'current_situation',
        title: '現在の企業状況（現実）',
        description: '直近の事業環境・財務状態',
        recommendedDepth: 'quick',
        whyItMatters: '「今」の企業の状態を正確に把握する。直近の四半期決算の進捗、受注状況、業界環境を踏まえて「今、強いのか弱いのか」を判断。',
        checkPoints: [
          '直近四半期の業績進捗率（通期計画に対して）',
          '受注残・バックログの状況',
          '経営陣の直近のコメント・発言',
        ],
      },
      {
        id: 'future_scenario',
        title: '将来のシナリオ（予想）',
        description: '成長ドライバーとリスクシナリオ',
        recommendedDepth: 'standard',
        whyItMatters: '「この企業が成長する理由」を3行で説明できなければ投資すべきではない。成長ドライバーとリスクの両方を整理してストーリーを組み立てる。',
        checkPoints: [
          '成長ドライバー（新製品？海外展開？M&A？コスト削減？）',
          'ベースシナリオ、ブルシナリオ、ベアシナリオの3パターン',
          '各シナリオでの業績・株価の想定',
        ],
      },
      {
        id: 'valuation_judgment',
        title: '株価評価（判断）',
        description: '割安・割高の最終評価',
        recommendedDepth: 'standard',
        whyItMatters: 'すべての分析を統合して「今の株価は買い/様子見/売り」の最終判断を下す。根拠と共に記録しておけば、後で振り返って学びになる。',
        checkPoints: [
          'ファンダメンタルズに基づく目標株価',
          '現在株価との乖離率',
          '投資判断（買い/様子見/売り）とその根拠',
          '投資スパン（短期/中期/長期）',
        ],
      },
      {
        id: 'risk_summary',
        title: 'リスクサマリー',
        description: '投資を阻むリスク要因の整理',
        recommendedDepth: 'standard',
        whyItMatters: '投資ストーリーが崩れるシナリオを事前に想定しておく。「何が起きたら撤退するか」を決めておかないと、損失が膨らんでからパニック売りしてしまう。',
        checkPoints: [
          '投資ストーリーが崩れるトリガーは何か',
          'ロスカットの基準（例: -15%で撤退）',
          '最大ダウンサイドの想定',
          'リスクが顕在化した場合の対応方針',
        ],
      },
    ],
  },
];

/** 分析深度に応じた推奨カテゴリ */
export function getRecommendedCategories(depth: 'quick' | 'standard' | 'deep'): string[] {
  const depthOrder = { quick: 0, standard: 1, deep: 2 };
  const targetLevel = depthOrder[depth];

  return ANALYSIS_FRAMEWORK
    .filter((cat) => cat.subItems.some((sub) => depthOrder[sub.recommendedDepth] <= targetLevel))
    .map((cat) => cat.id);
}

/** 分析深度に応じた推奨サブ項目を取得 */
export function getRecommendedSubItems(
  categoryId: string,
  depth: 'quick' | 'standard' | 'deep'
): string[] {
  const depthOrder = { quick: 0, standard: 1, deep: 2 };
  const targetLevel = depthOrder[depth];
  const category = ANALYSIS_FRAMEWORK.find((c) => c.id === categoryId);
  if (!category) return [];

  return category.subItems
    .filter((sub) => depthOrder[sub.recommendedDepth] <= targetLevel)
    .map((sub) => sub.id);
}
