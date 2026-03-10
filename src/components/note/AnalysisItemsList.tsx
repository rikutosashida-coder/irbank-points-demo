import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { FiPlus, FiAlertTriangle, FiBookOpen, FiCpu, FiLoader, FiTrash2 } from 'react-icons/fi';
import { AnalysisItem, AnalysisVersion, AnalysisDepth, CheckPointItem } from '../../features/notes/types/note.types';
import { AnalysisItemComponent } from './AnalysisItemComponent';
import { AnalysisTemplateSelectorDialog } from '../analysis/AnalysisTemplateSelectorDialog';
import { useUxMode } from '../../hooks/useUxMode';
import { generateBulkAnalysis } from '../../services/ai/analysisAiGenerator';

interface AnalysisItemsListProps {
  items: AnalysisItem[];
  noteId: string;
  stockCode?: string;
  analysisDepth?: AnalysisDepth;
  onUpdate: (items: AnalysisItem[]) => void;
}

export function AnalysisItemsList({ items, noteId, stockCode, analysisDepth = 'standard', onUpdate }: AnalysisItemsListProps) {
  const { isBeginner } = useUxMode();
  const [newItemTitle, setNewItemTitle] = useState('');
  const isQuick = analysisDepth === 'quick';
  const isDeep = analysisDepth === 'deep';
  const isAddDisabled = isQuick && items.length >= 2;
  const [showAddForm, setShowAddForm] = useState(false);
  const [showTemplateSelector, setShowTemplateSelector] = useState(false);
  const [isBulkGenerating, setIsBulkGenerating] = useState(false);
  const [bulkProgress, setBulkProgress] = useState({ done: 0, total: 0 });

  const handleAddFromTemplate = (templateItems: { categoryTitle: string; subTitle: string; subDescription: string }[]) => {
    const existingTitles = new Set(items.map((i) => i.title));
    const newItems: AnalysisItem[] = [];

    for (const tmpl of templateItems) {
      const title = `${tmpl.subTitle}`;
      if (existingTitles.has(title)) continue; // 重複スキップ

      const version: AnalysisVersion = {
        id: uuidv4(),
        content: [],
        createdAt: new Date(),
        createdBy: 'template',
        citations: [],
      };

      newItems.push({
        id: uuidv4(),
        noteId,
        title,
        order: items.length + newItems.length,
        createdAt: new Date(),
        updatedAt: new Date(),
        weight: 5,
        versions: [version],
        currentVersionId: version.id,
      });
    }

    if (newItems.length > 0) {
      onUpdate([...items, ...newItems]);
    }
  };

  const handleAddItem = () => {
    if (!newItemTitle.trim()) return;

    const newVersion: AnalysisVersion = {
      id: uuidv4(),
      content: [],
      createdAt: new Date(),
      createdBy: 'user',
      citations: [],
    };

    const newItem: AnalysisItem = {
      id: uuidv4(),
      noteId,
      title: newItemTitle.trim(),
      order: items.length,
      createdAt: new Date(),
      updatedAt: new Date(),
      weight: 5,
      versions: [newVersion],
      currentVersionId: newVersion.id,
    };

    onUpdate([...items, newItem]);
    setNewItemTitle('');
    setShowAddForm(false);
  };

  const handleUpdateItem = (itemId: string, title: string, content: any[], rating?: number, weight?: number) => {
    const MAX_VERSIONS = 10; // 最大保持バージョン数

    const updatedItems = items.map(item => {
      if (item.id !== itemId) return item;

      // 新しいバージョンを作成
      const newVersion: AnalysisVersion = {
        id: uuidv4(),
        content,
        createdAt: new Date(),
        createdBy: 'user',
        citations: [],
      };

      // 最新のMAX_VERSIONS件のみ保持（古いものから削除）
      const allVersions = [...item.versions, newVersion];
      const limitedVersions = allVersions.length > MAX_VERSIONS
        ? allVersions.slice(-MAX_VERSIONS)
        : allVersions;

      return {
        ...item,
        title,
        rating,
        weight: weight !== undefined ? weight : item.weight || 5,
        updatedAt: new Date(),
        versions: limitedVersions,
        currentVersionId: newVersion.id,
      };
    });

    onUpdate(updatedItems);
  };

  const handleDeleteItem = (itemId: string) => {
    const updatedItems = items.filter(item => item.id !== itemId);
    onUpdate(updatedItems);
  };

  const handleUpdateCheckPoints = (itemId: string, checkPoints: CheckPointItem[]) => {
    const updatedItems = items.map(item => {
      if (item.id !== itemId) return item;
      return { ...item, checkPoints, updatedAt: new Date() };
    });
    onUpdate(updatedItems);
  };

  const handleBulkAiGenerate = async () => {
    if (!stockCode || items.length === 0) return;
    // コンテンツが空の項目のみ対象
    const emptyItems = items.filter(item => {
      const cv = item.versions.find(v => v.id === item.currentVersionId);
      return !cv || cv.content.length === 0 || !cv.content.some((b: any) => b.content && b.content.length > 0);
    });
    if (emptyItems.length === 0) {
      alert('すべての分析項目にはすでにコンテンツがあります。');
      return;
    }

    setIsBulkGenerating(true);
    setBulkProgress({ done: 0, total: emptyItems.length });
    try {
      const results = await generateBulkAnalysis(stockCode, emptyItems.map(i => i.title));
      const resultMap = new Map(results.map(r => [r.itemTitle, r.blocks]));

      const updatedItems = items.map(item => {
        const blocks = resultMap.get(item.title);
        if (!blocks) return item;

        const newVersion: AnalysisVersion = {
          id: uuidv4(),
          content: blocks,
          createdAt: new Date(),
          createdBy: 'ai',
          citations: [],
        };

        return {
          ...item,
          updatedAt: new Date(),
          versions: [...item.versions, newVersion],
          currentVersionId: newVersion.id,
        };
      });

      setBulkProgress({ done: emptyItems.length, total: emptyItems.length });
      onUpdate(updatedItems);
    } catch (err) {
      console.error('[Bulk AI Generate] Failed:', err);
      alert('AI分析の生成に失敗しました。もう一度お試しください。');
    } finally {
      setIsBulkGenerating(false);
    }
  };

  // AI分析コンテンツを一括削除
  const handleBulkAiClear = () => {
    const itemsWithContent = items.filter(item => {
      const cv = item.versions.find(v => v.id === item.currentVersionId);
      return cv && cv.content.length > 0 && cv.content.some((b: any) => b.content && b.content.length > 0);
    });
    if (itemsWithContent.length === 0) {
      alert('削除対象のコンテンツがありません。');
      return;
    }
    if (!confirm(`${itemsWithContent.length}件の分析項目のコンテンツを削除しますか？\nこの操作は取り消せません。`)) return;

    const emptyVersion = (): AnalysisVersion => ({
      id: uuidv4(),
      content: [],
      createdAt: new Date(),
      createdBy: 'user',
      citations: [],
    });

    const updatedItems = items.map(item => {
      const cv = item.versions.find(v => v.id === item.currentVersionId);
      const hasContent = cv && cv.content.length > 0 && cv.content.some((b: any) => b.content && b.content.length > 0);
      if (!hasContent) return item;

      const newVer = emptyVersion();
      return {
        ...item,
        updatedAt: new Date(),
        versions: [...item.versions, newVer],
        currentVersionId: newVer.id,
      };
    });

    onUpdate(updatedItems);
  };

  // コンテンツがある項目数
  const itemsWithContentCount = items.filter(item => {
    const cv = item.versions.find(v => v.id === item.currentVersionId);
    return cv && cv.content.length > 0 && cv.content.some((b: any) => b.content && b.content.length > 0);
  }).length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">分析項目</h2>
          {isBeginner && (
            <p className="text-sm text-gray-500 mt-1">まずは感覚で★をつけてみましょう</p>
          )}
        </div>
        <div className="flex items-center gap-3">
          {items.length > 0 && (
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => {
                  if (!stockCode) {
                    alert('一括AI分析を使うには、先にアンカータグで銘柄を設定してください。');
                    return;
                  }
                  handleBulkAiGenerate();
                }}
                disabled={isBulkGenerating}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  isBulkGenerating
                    ? 'bg-purple-100 text-purple-400 cursor-wait'
                    : 'bg-purple-600 text-white hover:bg-purple-700'
                }`}
                title="全項目をAIで一括分析"
              >
                {isBulkGenerating ? (
                  <>
                    <FiLoader className="w-4 h-4 animate-spin" />
                    一括分析中... ({bulkProgress.done}/{bulkProgress.total})
                  </>
                ) : (
                  <>
                    <FiCpu className="w-4 h-4" />
                    一括AI分析
                  </>
                )}
              </button>
              {itemsWithContentCount > 0 && (
                <button
                  onClick={handleBulkAiClear}
                  disabled={isBulkGenerating}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
                  title="全項目のAI分析コンテンツを一括削除"
                >
                  <FiTrash2 className="w-3.5 h-3.5" />
                  一括削除
                </button>
              )}
            </div>
          )}
          <button
            onClick={() => setShowTemplateSelector(true)}
            className="flex items-center gap-1.5 text-sm text-primary-600 hover:underline"
          >
            <FiBookOpen className="w-4 h-4" />
            テンプレートから追加
          </button>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            disabled={isAddDisabled}
            className={`flex items-center gap-2 text-sm ${
              isAddDisabled
                ? 'text-gray-400 cursor-not-allowed'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <FiPlus className="w-4 h-4" />
            {isAddDisabled ? 'クイック: 最大2項目' : '手動で追加'}
          </button>
        </div>
      </div>

      {showAddForm && (
        <div className="p-4 bg-gray-50 rounded-lg">
          <input
            type="text"
            value={newItemTitle}
            onChange={(e) => setNewItemTitle(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleAddItem()}
            placeholder="分析項目のタイトル（例: 財務分析、競合分析）"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 mb-3"
            autoFocus
          />
          <div className="flex gap-2">
            <button
              onClick={handleAddItem}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
            >
              追加
            </button>
            <button
              onClick={() => {
                setShowAddForm(false);
                setNewItemTitle('');
              }}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
            >
              キャンセル
            </button>
          </div>
        </div>
      )}

      {items.length === 0 ? (
        <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <p>{isBeginner ? '気になるポイントを分析項目として追加してみましょう' : '分析項目がありません'}</p>
          <div className="flex items-center justify-center gap-4 mt-3">
            <button
              onClick={() => setShowTemplateSelector(true)}
              className="flex items-center gap-1.5 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 text-sm font-medium"
            >
              <FiBookOpen className="w-4 h-4" />
              テンプレートから選ぶ
            </button>
            <button
              onClick={() => setShowAddForm(true)}
              className="text-sm text-primary-600 hover:underline"
            >
              手動で追加
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {isDeep && items.some(item => !item.weight || item.weight === 5) && (
            <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800">
              <FiAlertTriangle className="w-4 h-4 flex-shrink-0" />
              <span>ディープ分析: すべての分析項目に適切な重み付けを設定してください</span>
            </div>
          )}
          {items.map((item) => (
            <AnalysisItemComponent
              key={item.id}
              item={item}
              analysisDepth={analysisDepth}
              stockCode={stockCode}
              onUpdate={handleUpdateItem}
              onDelete={handleDeleteItem}
              onUpdateCheckPoints={handleUpdateCheckPoints}
            />
          ))}
        </div>
      )}

      {/* Template Selector Dialog */}
      {showTemplateSelector && (
        <AnalysisTemplateSelectorDialog
          analysisDepth={analysisDepth}
          onSelect={handleAddFromTemplate}
          onClose={() => setShowTemplateSelector(false)}
        />
      )}
    </div>
  );
}
