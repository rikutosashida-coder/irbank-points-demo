import { useState, useMemo } from 'react';
import { FiX, FiChevronDown, FiChevronRight, FiCheck, FiZap, FiLayers, FiTarget, FiHelpCircle, FiEye, FiEyeOff } from 'react-icons/fi';
import {
  ANALYSIS_FRAMEWORK,
  ANALYSIS_GOALS,
  type AnalysisCategory,
  type AnalysisSubItem,
  type AnalysisGoal,
} from '../../features/analysis/analysisFramework';
import type { AnalysisDepth } from '../../features/notes/types/note.types';

interface AnalysisTemplateSelectorDialogProps {
  analysisDepth?: AnalysisDepth;
  onSelect: (items: { categoryTitle: string; subTitle: string; subDescription: string }[]) => void;
  onClose: () => void;
}

const DEPTH_CONFIG: Record<string, { label: string; icon: React.ReactNode; color: string; depthKey: 'quick' | 'standard' | 'deep' }> = {
  quick: { label: 'クイック', icon: <FiZap className="w-3.5 h-3.5" />, color: 'bg-green-100 text-green-700 border-green-300', depthKey: 'quick' },
  standard: { label: 'スタンダード', icon: <FiLayers className="w-3.5 h-3.5" />, color: 'bg-blue-100 text-blue-700 border-blue-300', depthKey: 'standard' },
  deep: { label: 'ディープ', icon: <FiTarget className="w-3.5 h-3.5" />, color: 'bg-purple-100 text-purple-700 border-purple-300', depthKey: 'deep' },
};

const DEPTH_ORDER: Record<string, number> = { quick: 0, standard: 1, deep: 2 };

export function AnalysisTemplateSelectorDialog({
  analysisDepth = 'standard',
  onSelect,
  onClose,
}: AnalysisTemplateSelectorDialogProps) {
  // 選択状態: Set<subItemId>
  const [selected, setSelected] = useState<Set<string>>(new Set());
  // 展開中のカテゴリ
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  // 選択中の目的プリセット
  const [activeGoal, setActiveGoal] = useState<string | null>(null);
  // ガイド表示モード
  const [showGuides, setShowGuides] = useState(true);

  // analysisDepth is used to keep interface compatible
  void analysisDepth;

  const toggleExpand = (catId: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(catId)) next.delete(catId);
      else next.add(catId);
      return next;
    });
  };

  const toggleSubItem = (subId: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(subId)) next.delete(subId);
      else next.add(subId);
      return next;
    });
    setActiveGoal(null);
  };

  const toggleCategory = (cat: AnalysisCategory) => {
    const allIds = cat.subItems.map((s) => s.id);
    const allSelected = allIds.every((id) => selected.has(id));
    setSelected((prev) => {
      const next = new Set(prev);
      if (allSelected) {
        allIds.forEach((id) => next.delete(id));
      } else {
        allIds.forEach((id) => next.add(id));
      }
      return next;
    });
    setActiveGoal(null);
  };

  // 目的プリセット適用
  const applyGoal = (goal: AnalysisGoal) => {
    if (activeGoal === goal.id) {
      setSelected(new Set());
      setActiveGoal(null);
      setExpanded(new Set());
    } else {
      const ids = new Set(goal.subItemIds);
      setSelected(ids);
      setActiveGoal(goal.id);
      const expandCats = new Set<string>();
      for (const cat of ANALYSIS_FRAMEWORK) {
        if (cat.subItems.some(sub => ids.has(sub.id))) {
          expandCats.add(cat.id);
        }
      }
      setExpanded(expandCats);
    }
  };

  // 深度プリセット適用
  const applyDepthPreset = (depth: 'quick' | 'standard' | 'deep') => {
    const targetLevel = DEPTH_ORDER[depth];
    const next = new Set<string>();
    for (const cat of ANALYSIS_FRAMEWORK) {
      for (const sub of cat.subItems) {
        if (DEPTH_ORDER[sub.recommendedDepth] <= targetLevel) {
          next.add(sub.id);
        }
      }
    }
    setSelected(next);
    setActiveGoal(null);
    setExpanded(new Set(ANALYSIS_FRAMEWORK.map(c => c.id)));
  };

  const selectedCount = selected.size;

  const selectedItems = useMemo(() => {
    const items: { categoryTitle: string; subTitle: string; subDescription: string }[] = [];
    for (const cat of ANALYSIS_FRAMEWORK) {
      for (const sub of cat.subItems) {
        if (selected.has(sub.id)) {
          items.push({
            categoryTitle: cat.title,
            subTitle: sub.title,
            subDescription: sub.description,
          });
        }
      }
    }
    return items;
  }, [selected]);

  const handleConfirm = () => {
    onSelect(selectedItems);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 flex-shrink-0">
          <div>
            <h3 className="text-lg font-bold text-gray-900">分析項目を選ぶ</h3>
            <p className="text-xs text-gray-500 mt-0.5">
              まず「何を知りたいか」を選ぶと、必要な分析項目が自動で選択されます
            </p>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-lg">
            <FiX className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Goal Presets */}
        <div className="px-5 py-4 border-b border-gray-100 flex-shrink-0">
          <div className="text-xs font-medium text-gray-500 mb-2.5">何を知りたいですか？</div>
          <div className="grid grid-cols-3 gap-2">
            {ANALYSIS_GOALS.map((goal) => (
              <button
                key={goal.id}
                onClick={() => applyGoal(goal)}
                className={`text-left px-3 py-2.5 rounded-xl border-2 transition-all ${
                  activeGoal === goal.id
                    ? 'border-primary-500 bg-primary-50 shadow-sm'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <span className="text-base">{goal.emoji}</span>
                  <span className={`text-sm font-medium ${activeGoal === goal.id ? 'text-primary-700' : 'text-gray-800'}`}>
                    {goal.title}
                  </span>
                </div>
                <p className="text-[11px] text-gray-500 mt-0.5 line-clamp-1">{goal.description}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Depth Presets + Guide Toggle */}
        <div className="px-5 py-2.5 border-b border-gray-100 flex-shrink-0 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400">深度別:</span>
            {(['quick', 'standard', 'deep'] as const).map((d) => {
              const cfg = DEPTH_CONFIG[d];
              return (
                <button
                  key={d}
                  onClick={() => applyDepthPreset(d)}
                  className={`flex items-center gap-1 px-2 py-1 text-[11px] font-medium rounded-md border transition-colors ${cfg.color} hover:opacity-80`}
                >
                  {cfg.icon}
                  {cfg.label}
                </button>
              );
            })}
            <button
              onClick={() => { setSelected(new Set()); setActiveGoal(null); }}
              className="text-[11px] text-gray-400 hover:text-gray-600 ml-1"
            >
              全解除
            </button>
          </div>
          <button
            onClick={() => setShowGuides(!showGuides)}
            className={`flex items-center gap-1 text-[11px] px-2 py-1 rounded-md transition-colors ${
              showGuides ? 'text-primary-600 bg-primary-50' : 'text-gray-500 hover:bg-gray-100'
            }`}
          >
            {showGuides ? <FiEye className="w-3 h-3" /> : <FiEyeOff className="w-3 h-3" />}
            ガイド{showGuides ? 'ON' : 'OFF'}
          </button>
        </div>

        {/* Category List */}
        <div className="flex-1 overflow-y-auto px-5 py-3">
          {selectedCount === 0 && !activeGoal ? (
            <div className="text-center py-8">
              <div className="text-4xl mb-3">👆</div>
              <p className="text-sm text-gray-600 font-medium">上の目的ボタンから選んでみましょう</p>
              <p className="text-xs text-gray-400 mt-1">
                例:「初めての銘柄分析」なら最低限の10項目が自動選択されます
              </p>
            </div>
          ) : (
            <div className="space-y-1">
              {ANALYSIS_FRAMEWORK.map((cat) => (
                <CategoryRow
                  key={cat.id}
                  category={cat}
                  isExpanded={expanded.has(cat.id)}
                  selectedIds={selected}
                  showGuides={showGuides}
                  onToggleExpand={() => toggleExpand(cat.id)}
                  onToggleCategory={() => toggleCategory(cat)}
                  onToggleSubItem={toggleSubItem}
                />
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-gray-200 flex-shrink-0">
          <span className="text-sm text-gray-500">
            {selectedCount > 0 ? (
              <>
                <span className="font-medium text-primary-600">{selectedCount}項目</span>を追加
                {activeGoal && (
                  <span className="ml-2 text-xs text-gray-400">
                    ({ANALYSIS_GOALS.find(g => g.id === activeGoal)?.title})
                  </span>
                )}
              </>
            ) : (
              '項目を選択してください'
            )}
          </span>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              キャンセル
            </button>
            <button
              onClick={handleConfirm}
              disabled={selectedCount === 0}
              className="px-4 py-2 text-sm text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              追加する
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================
// Category Row
// ============================================

function CategoryRow({
  category,
  isExpanded,
  selectedIds,
  showGuides,
  onToggleExpand,
  onToggleCategory,
  onToggleSubItem,
}: {
  category: AnalysisCategory;
  isExpanded: boolean;
  selectedIds: Set<string>;
  showGuides: boolean;
  onToggleExpand: () => void;
  onToggleCategory: () => void;
  onToggleSubItem: (id: string) => void;
}) {
  const allIds = category.subItems.map((s) => s.id);
  const selectedCount = allIds.filter((id) => selectedIds.has(id)).length;
  const allSelected = selectedCount === allIds.length;
  const someSelected = selectedCount > 0 && !allSelected;

  return (
    <div className="rounded-lg border border-gray-100 overflow-hidden">
      {/* Category Header */}
      <div className="flex items-center gap-2 px-3 py-2.5 bg-gray-50 hover:bg-gray-100 transition-colors">
        <button
          onClick={onToggleCategory}
          className={`w-5 h-5 rounded flex items-center justify-center flex-shrink-0 border transition-colors ${
            allSelected
              ? 'bg-primary-600 border-primary-600 text-white'
              : someSelected
              ? 'bg-primary-100 border-primary-400 text-primary-600'
              : 'border-gray-300 hover:border-gray-400'
          }`}
        >
          {allSelected && <FiCheck className="w-3 h-3" />}
          {someSelected && <span className="w-2 h-0.5 bg-primary-600 rounded" />}
        </button>

        <button
          onClick={onToggleExpand}
          className="flex items-center gap-2 flex-1 min-w-0 text-left"
        >
          <span className="text-base">{category.emoji}</span>
          <div className="flex-1 min-w-0">
            <span className="text-sm font-medium text-gray-900">{category.title}</span>
            {selectedCount > 0 && (
              <span className="text-xs text-primary-500 ml-2 font-medium">
                {selectedCount}/{allIds.length}
              </span>
            )}
          </div>
          {isExpanded ? (
            <FiChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0" />
          ) : (
            <FiChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
          )}
        </button>
      </div>

      {isExpanded && (
        <div className="px-3 py-1.5 space-y-0.5">
          {category.subItems.map((sub) => (
            <SubItemRow
              key={sub.id}
              subItem={sub}
              isSelected={selectedIds.has(sub.id)}
              showGuide={showGuides}
              onToggle={() => onToggleSubItem(sub.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ============================================
// Sub Item Row (with expandable guide)
// ============================================

function SubItemRow({
  subItem,
  isSelected,
  showGuide,
  onToggle,
}: {
  subItem: AnalysisSubItem;
  isSelected: boolean;
  showGuide: boolean;
  onToggle: () => void;
}) {
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const depthCfg = DEPTH_CONFIG[subItem.recommendedDepth];

  return (
    <div className={`rounded-lg transition-colors ${isSelected ? 'bg-primary-50' : 'hover:bg-gray-50'}`}>
      {/* Main Row */}
      <div className="flex items-center gap-2.5 px-2 py-2">
        <button
          onClick={onToggle}
          className={`w-4 h-4 rounded flex items-center justify-center flex-shrink-0 border transition-colors ${
            isSelected
              ? 'bg-primary-600 border-primary-600 text-white'
              : 'border-gray-300 hover:border-gray-400'
          }`}
        >
          {isSelected && <FiCheck className="w-2.5 h-2.5" />}
        </button>

        <button onClick={onToggle} className="flex-1 min-w-0 text-left">
          <div className="text-sm text-gray-800">{subItem.title}</div>
          {showGuide && (
            <div className="text-xs text-gray-400 mt-0.5 line-clamp-1">
              {subItem.whyItMatters.length > 60 ? subItem.whyItMatters.slice(0, 60) + '...' : subItem.whyItMatters}
            </div>
          )}
        </button>

        {showGuide && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsGuideOpen(!isGuideOpen);
            }}
            className={`p-1 rounded transition-colors flex-shrink-0 ${
              isGuideOpen ? 'text-primary-600 bg-primary-100' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
            }`}
            title="分析ガイドを見る"
          >
            <FiHelpCircle className="w-3.5 h-3.5" />
          </button>
        )}

        <span className={`flex-shrink-0 px-1.5 py-0.5 text-[10px] font-medium rounded border ${depthCfg.color}`}>
          {depthCfg.label}
        </span>
      </div>

      {/* Expandable Guide */}
      {showGuide && isGuideOpen && (
        <div className="mx-2 mb-2 p-3 bg-white border border-gray-200 rounded-lg text-xs space-y-2.5">
          <div>
            <div className="font-semibold text-gray-700 mb-1">
              💡 なぜ重要？
            </div>
            <p className="text-gray-600 leading-relaxed">{subItem.whyItMatters}</p>
          </div>

          <div>
            <div className="font-semibold text-gray-700 mb-1">
              👀 何を見る？
            </div>
            <ul className="space-y-1 text-gray-600">
              {subItem.checkPoints.map((cp, i) => (
                <li key={i} className="flex items-start gap-1.5">
                  <span className="text-primary-500 mt-0.5 flex-shrink-0">•</span>
                  <span>{cp}</span>
                </li>
              ))}
            </ul>
          </div>

          {subItem.example && (
            <div className="bg-amber-50 border border-amber-100 rounded-md px-2.5 py-2 text-amber-800">
              {subItem.example}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
