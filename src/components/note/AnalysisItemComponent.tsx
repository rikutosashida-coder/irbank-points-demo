import { useState, useEffect, useMemo } from 'react';
import { FiChevronDown, FiChevronRight, FiEdit2, FiTrash2, FiStar, FiX, FiZap, FiCpu, FiLoader, FiBookOpen, FiCheckCircle, FiCircle, FiPlus, FiMessageCircle, FiArrowDown } from 'react-icons/fi';
import { AnalysisItem, AnalysisDepth, CheckPointItem } from '../../features/notes/types/note.types';
import { generateItemSummary } from '../../utils/blockNoteUtils';
import { useUxMode } from '../../hooks/useUxMode';
import { generateAnalysis, generateCheckPointAnalysis, generateDeepDive, generateAiAnswer } from '../../services/ai/analysisAiGenerator';
import { ANALYSIS_FRAMEWORK, type AnalysisSubItem } from '../../features/analysis/analysisFramework';
import { v4 as uuidv4 } from 'uuid';

export interface AnalysisItemComponentProps {
  item: AnalysisItem;
  analysisDepth?: AnalysisDepth;
  stockCode?: string;
  onUpdate: (itemId: string, title: string, content: any[], rating?: number, weight?: number) => void;
  onDelete: (itemId: string) => void;
  onUpdateCheckPoints?: (itemId: string, checkPoints: CheckPointItem[]) => void;
  dragHandleProps?: Record<string, any>;
}

export function AnalysisItemComponent({ item, analysisDepth = 'standard', stockCode, onUpdate, onDelete, onUpdateCheckPoints }: AnalysisItemComponentProps) {
  const { isBeginner } = useUxMode();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(item.title);
  const [editingContent, setEditingContent] = useState<any[]>([]);
  const [isAiGenerating, setIsAiGenerating] = useState(false);
  const [showGuide, setShowGuide] = useState(true);
  const [newCheckPointText, setNewCheckPointText] = useState('');
  const [aiGeneratingCpId, setAiGeneratingCpId] = useState<string | null>(null);
  const [deepDivingCpId, setDeepDivingCpId] = useState<string | null>(null);
  const [askingCpId, setAskingCpId] = useState<string | null>(null);
  const [aiQuestionText, setAiQuestionText] = useState('');
  const [aiQuestionGenerating, setAiQuestionGenerating] = useState(false);

  // フレームワークから該当する分析項目のガイドデータを取得
  const guideData: AnalysisSubItem | undefined = useMemo(() => {
    for (const cat of ANALYSIS_FRAMEWORK) {
      const found = cat.subItems.find(sub => sub.title === item.title);
      if (found) return found;
    }
    return undefined;
  }, [item.title]);

  // フレームワークからフォールバック表示用チェックポイントを生成
  // item.checkPoints が空配列の場合もフレームワークにフォールバック
  const checkPoints: CheckPointItem[] = useMemo(() => {
    if (item.checkPoints && item.checkPoints.length > 0) return item.checkPoints;
    if (!guideData) return [];
    return guideData.checkPoints.map((cp, i) => ({
      id: `fw-${item.id.slice(0, 8)}-${i}`,
      text: cp,
      isChecked: false,
      isCustom: false,
    }));
  }, [item.checkPoints, guideData, item.id]);

  const checkedCount = checkPoints.filter(cp => cp.isChecked).length;

  // 変更時にフレームワークからの仮チェックポイントを永続化（UUID付きで実体化）
  const materializeAndApply = (modifier: (cps: CheckPointItem[]) => CheckPointItem[]) => {
    let base: CheckPointItem[];
    if (item.checkPoints && item.checkPoints.length > 0) {
      base = item.checkPoints;
    } else if (guideData) {
      base = guideData.checkPoints.map(cp => ({
        id: uuidv4(),
        text: cp,
        isChecked: false,
        isCustom: false,
      }));
    } else {
      base = [];
    }
    onUpdateCheckPoints?.(item.id, modifier(base));
  };

  const handleToggleCheckPoint = (cpId: string) => {
    const target = checkPoints.find(cp => cp.id === cpId);
    if (!target) return;
    materializeAndApply(cps => cps.map(cp =>
      cp.text === target.text ? { ...cp, isChecked: !cp.isChecked } : cp
    ));
  };

  const handleDeleteCheckPoint = (cpId: string) => {
    const target = checkPoints.find(cp => cp.id === cpId);
    if (!target) return;
    materializeAndApply(cps => cps.filter(cp => cp.text !== target.text));
  };

  const handleAddCheckPoint = () => {
    if (!newCheckPointText.trim()) return;
    const newCp: CheckPointItem = {
      id: uuidv4(),
      text: newCheckPointText.trim(),
      isChecked: false,
      isCustom: true,
    };
    materializeAndApply(cps => [...cps, newCp]);
    setNewCheckPointText('');
  };

  const handleCpAiAnalysis = async (cpId: string) => {
    if (!stockCode) return;
    const target = checkPoints.find(c => c.id === cpId);
    if (!target) return;
    setAiGeneratingCpId(cpId);
    try {
      const output = await generateCheckPointAnalysis(stockCode, item.title, target.text);
      materializeAndApply(cps => cps.map(c =>
        c.text === target.text ? { ...c, aiOutput: output } : c
      ));
    } catch (err) {
      console.error('[CP AI Analysis] Failed:', err);
    } finally {
      setAiGeneratingCpId(null);
    }
  };

  const handleCpDeepDive = async (cpId: string) => {
    if (!stockCode) return;
    const target = checkPoints.find(c => c.id === cpId);
    if (!target || !target.aiOutput) return;
    setDeepDivingCpId(cpId);
    try {
      const deepOutput = await generateDeepDive(stockCode, item.title, target.text, target.aiOutput);
      materializeAndApply(cps => cps.map(c =>
        c.text === target.text ? { ...c, aiOutput: deepOutput } : c
      ));
    } catch (err) {
      console.error('[CP Deep Dive] Failed:', err);
    } finally {
      setDeepDivingCpId(null);
    }
  };

  const handleCpAiQuestion = async (cpId: string) => {
    if (!stockCode || !aiQuestionText.trim()) return;
    const target = checkPoints.find(c => c.id === cpId);
    if (!target) return;
    setAiQuestionGenerating(true);
    try {
      const answer = await generateAiAnswer(stockCode, item.title, aiQuestionText.trim());
      materializeAndApply(cps => cps.map(c =>
        c.text === target.text ? { ...c, aiOutput: (c.aiOutput ? c.aiOutput + '\n\n' : '') + answer } : c
      ));
      setAiQuestionText('');
      setAskingCpId(null);
    } catch (err) {
      console.error('[CP AI Question] Failed:', err);
    } finally {
      setAiQuestionGenerating(false);
    }
  };

  const currentVersion = item.versions.find(v => v.id === item.currentVersionId);

  useEffect(() => {
    if (currentVersion) {
      setEditingContent(currentVersion.content);
    }
  }, [item.currentVersionId]);

  const handleRatingChange = (newRating: number) => {
    const updatedRating = item.rating === newRating ? 0 : newRating;
    onUpdate(item.id, item.title, editingContent, updatedRating, item.weight);
  };

  const handleWeightChange = (newWeight: number) => {
    onUpdate(item.id, item.title, editingContent, item.rating, newWeight);
  };

  const handleTitleChange = () => {
    if (title.trim() && title !== item.title) {
      onUpdate(item.id, title, editingContent, item.rating, item.weight);
    }
    setIsEditing(false);
  };

  const handleAiGenerate = async () => {
    if (!stockCode) return;
    setIsAiGenerating(true);
    try {
      const blocks = await generateAnalysis(stockCode, item.title);
      // 既存コンテンツがあれば末尾に追加、なければ置き換え
      const existingHasContent = editingContent.length > 0 &&
        editingContent.some((b: any) => b.content && b.content.length > 0);
      const newContent = existingHasContent ? [...editingContent, ...blocks] : blocks;
      setEditingContent(newContent);
      onUpdate(item.id, item.title, newContent, item.rating, item.weight);
      setIsExpanded(true);
    } catch (err) {
      console.error('[AI Generate] Failed:', err);
    } finally {
      setIsAiGenerating(false);
    }
  };

  // AI自動分析のコンテンツを削除（空にリセット）
  const handleAiContentClear = () => {
    if (!confirm(`「${item.title}」のAI分析コンテンツを削除しますか？\nこの操作は取り消せません。`)) return;
    const emptyContent: any[] = [];
    setEditingContent(emptyContent);
    onUpdate(item.id, item.title, emptyContent, item.rating, item.weight);
  };

  // 現在のバージョンにコンテンツがあるか判定
  const hasContent = currentVersion && currentVersion.content.length > 0 &&
    currentVersion.content.some((b: any) => b.content && b.content.length > 0);

  return (
    <div id={`analysis-item-${item.id}`} className="border border-gray-200 rounded-lg bg-white">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-100">
        <div className="flex items-center gap-2 flex-1">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 hover:bg-gray-100 rounded"
          >
            {isExpanded ? (
              <FiChevronDown className="w-4 h-4" />
            ) : (
              <FiChevronRight className="w-4 h-4" />
            )}
          </button>

          {isEditing ? (
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={handleTitleChange}
              onKeyPress={(e) => e.key === 'Enter' && handleTitleChange()}
              className="flex-1 px-2 py-1 border border-primary-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-500"
              autoFocus
            />
          ) : (
            <h3 className="font-semibold text-gray-900 flex-1">{item.title}</h3>
          )}

          {/* Rating Stars */}
          <div className="flex items-center gap-1 px-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => handleRatingChange(star)}
                className="hover:scale-110 transition-transform"
              >
                <FiStar
                  className={`w-4 h-4 ${
                    star <= (item.rating || 0)
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'text-gray-300 hover:text-yellow-300'
                  }`}
                />
              </button>
            ))}
          </div>

          {/* Weight Selector (初心者モード・クイック時は非表示) */}
          {!isBeginner && analysisDepth !== 'quick' && (
            <div className={`flex items-center gap-2 px-2 border-l border-gray-200 ${
              analysisDepth === 'deep' && (!item.weight || item.weight === 5) ? 'ring-2 ring-red-300 rounded' : ''
            }`}>
              <span className="text-xs text-gray-500">重要度:</span>
              <select
                value={item.weight || 5}
                onChange={(e) => handleWeightChange(Number(e.target.value))}
                className="text-sm px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
              >
                <option value={1}>1</option>
                <option value={2}>2</option>
                <option value={3}>3</option>
                <option value={4}>4</option>
                <option value={5}>5</option>
                <option value={6}>6</option>
                <option value={7}>7</option>
                <option value={8}>8</option>
                <option value={9}>9</option>
                <option value={10}>10</option>
              </select>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            <button
              onClick={() => {
                if (!stockCode) {
                  alert('AI自動分析を使うには、先にアンカータグで銘柄を設定してください。');
                  return;
                }
                handleAiGenerate();
              }}
              disabled={isAiGenerating}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                isAiGenerating
                  ? 'bg-purple-100 text-purple-400 cursor-wait'
                  : 'bg-purple-50 text-purple-700 hover:bg-purple-100'
              }`}
              title="AIが財務データから自動分析"
            >
              {isAiGenerating ? (
                <FiLoader className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <FiCpu className="w-3.5 h-3.5" />
              )}
              {isAiGenerating ? 'AI分析中...' : 'AI自動分析'}
            </button>
            {hasContent && (
              <button
                onClick={handleAiContentClear}
                disabled={isAiGenerating}
                className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs font-medium text-red-500 hover:bg-red-50 transition-colors"
                title="AI分析コンテンツを削除"
              >
                <FiTrash2 className="w-3 h-3" />
                削除
              </button>
            )}
          </div>
          <button
            onClick={() => setIsEditing(true)}
            className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg"
            title="タイトル編集"
          >
            <FiEdit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              if (confirm(`「${item.title}」を削除しますか？`)) {
                onDelete(item.id);
              }
            }}
            className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
            title="削除"
          >
            <FiTrash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Content */}
      {isExpanded && (
        <div className="p-4">
          <div className="flex gap-4">
            {/* Left: Main Content */}
            <div className="flex-1 min-w-0">
              {/* Analysis Guide */}
              {showGuide && (guideData || checkPoints.length > 0) && (
                <div className="mb-4 border border-amber-200 rounded-lg overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-2.5 bg-gradient-to-r from-amber-50 to-orange-50">
                    <div className="flex items-center gap-2">
                      <FiBookOpen className="w-4 h-4 text-amber-600" />
                      <span className="text-sm font-semibold text-amber-900">分析ガイド</span>
                    </div>
                    <button
                      onClick={() => setShowGuide(false)}
                      className="text-xs text-amber-600 hover:text-amber-800 hover:underline"
                    >
                      閉じる
                    </button>
                  </div>
                  <div className="px-4 py-3 space-y-3 bg-white">
                    {/* Why it matters */}
                    {guideData && (
                      <div>
                        <div className="text-xs font-semibold text-gray-600 mb-1">💡 なぜ重要？</div>
                        <p className="text-sm text-gray-700 leading-relaxed">{guideData.whyItMatters}</p>
                      </div>
                    )}
                    {/* Checkpoints */}
                    <div>
                      <div className="text-xs font-semibold text-gray-600 mb-1.5">
                        👀 チェックポイント
                        <span className="ml-1.5 text-gray-400 font-normal">
                          ({checkedCount}/{checkPoints.length} 完了)
                        </span>
                      </div>
                      <div className="space-y-1">
                        {checkPoints.map((cp) => (
                          <div key={cp.id}>
                            {/* チェックポイント行 */}
                            <div className={`group flex items-start gap-1.5 px-2.5 py-1.5 rounded-md transition-colors ${
                              cp.isChecked ? 'bg-green-50' : 'hover:bg-gray-50'
                            }`}>
                              <button
                                onClick={() => handleToggleCheckPoint(cp.id)}
                                className="mt-0.5 flex-shrink-0"
                              >
                                {cp.isChecked ? (
                                  <FiCheckCircle className="w-4 h-4 text-green-500" />
                                ) : (
                                  <FiCircle className="w-4 h-4 text-gray-300" />
                                )}
                              </button>
                              <span className={`text-sm flex-1 ${cp.isChecked ? 'line-through text-gray-400' : 'text-gray-700'}`}>
                                {cp.text}
                                {cp.isCustom && (
                                  <span className="ml-1.5 text-[10px] text-purple-500 font-medium">カスタム</span>
                                )}
                              </span>
                              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                                {stockCode && !cp.aiOutput && (
                                  <button
                                    onClick={() => handleCpAiAnalysis(cp.id)}
                                    disabled={aiGeneratingCpId === cp.id}
                                    className="flex items-center gap-1 px-2 py-0.5 text-[11px] text-purple-600 bg-purple-50 hover:bg-purple-100 rounded transition-colors"
                                    title="AIが分析"
                                  >
                                    {aiGeneratingCpId === cp.id ? (
                                      <FiLoader className="w-3 h-3 animate-spin" />
                                    ) : (
                                      <FiCpu className="w-3 h-3" />
                                    )}
                                    AI分析
                                  </button>
                                )}
                                <button
                                  onClick={() => handleDeleteCheckPoint(cp.id)}
                                  className="p-0.5 text-gray-400 hover:text-red-500 rounded transition-colors"
                                  title="削除"
                                >
                                  <FiX className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                            {/* AI分析出力 */}
                            {cp.aiOutput && (
                              <div className="ml-7 mt-1 mb-2 p-3 bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-100 rounded-lg">
                                <div className="flex items-center gap-1.5 mb-1.5">
                                  <FiZap className="w-3.5 h-3.5 text-purple-600" />
                                  <span className="text-[11px] font-semibold text-purple-800">AI分析結果</span>
                                </div>
                                <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">{cp.aiOutput}</p>
                                <div className="flex items-center gap-2 mt-2">
                                  {stockCode && (
                                    <>
                                      <button
                                        onClick={() => handleCpDeepDive(cp.id)}
                                        disabled={deepDivingCpId === cp.id}
                                        className="flex items-center gap-1 px-2 py-1 text-[11px] text-indigo-600 bg-white border border-indigo-200 hover:bg-indigo-50 rounded-md transition-colors"
                                      >
                                        {deepDivingCpId === cp.id ? (
                                          <FiLoader className="w-3 h-3 animate-spin" />
                                        ) : (
                                          <FiArrowDown className="w-3 h-3" />
                                        )}
                                        深掘り
                                      </button>
                                      <button
                                        onClick={() => setAskingCpId(askingCpId === cp.id ? null : cp.id)}
                                        className="flex items-center gap-1 px-2 py-1 text-[11px] text-teal-600 bg-white border border-teal-200 hover:bg-teal-50 rounded-md transition-colors"
                                      >
                                        <FiMessageCircle className="w-3 h-3" />
                                        AIに質問
                                      </button>
                                    </>
                                  )}
                                  <button
                                    onClick={() => handleCpAiAnalysis(cp.id)}
                                    disabled={aiGeneratingCpId === cp.id}
                                    className="flex items-center gap-1 px-2 py-1 text-[11px] text-gray-500 bg-white border border-gray-200 hover:bg-gray-50 rounded-md transition-colors"
                                  >
                                    {aiGeneratingCpId === cp.id ? (
                                      <FiLoader className="w-3 h-3 animate-spin" />
                                    ) : (
                                      <FiCpu className="w-3 h-3" />
                                    )}
                                    再分析
                                  </button>
                                  <button
                                    onClick={() => materializeAndApply(cps => cps.map(c =>
                                      c.text === cp.text ? { ...c, aiOutput: undefined } : c
                                    ))}
                                    className="p-1 text-gray-400 hover:text-red-500 rounded transition-colors ml-auto"
                                    title="AI分析を削除"
                                  >
                                    <FiTrash2 className="w-3 h-3" />
                                  </button>
                                </div>
                                {/* AIへの質問入力 */}
                                {askingCpId === cp.id && (
                                  <div className="mt-2 flex gap-2">
                                    <input
                                      type="text"
                                      value={aiQuestionText}
                                      onChange={(e) => setAiQuestionText(e.target.value)}
                                      onKeyDown={(e) => e.key === 'Enter' && handleCpAiQuestion(cp.id)}
                                      placeholder="AIに質問を入力..."
                                      className="flex-1 px-2.5 py-1.5 text-sm border border-teal-200 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-400"
                                      autoFocus
                                    />
                                    <button
                                      onClick={() => handleCpAiQuestion(cp.id)}
                                      disabled={aiQuestionGenerating || !aiQuestionText.trim()}
                                      className="flex items-center gap-1 px-3 py-1.5 text-xs bg-teal-600 text-white rounded-md hover:bg-teal-700 disabled:bg-gray-300 transition-colors"
                                    >
                                      {aiQuestionGenerating ? (
                                        <FiLoader className="w-3 h-3 animate-spin" />
                                      ) : (
                                        '送信'
                                      )}
                                    </button>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                      {/* チェックポイント追加 */}
                      <div className="mt-2 flex gap-2">
                        <input
                          type="text"
                          value={newCheckPointText}
                          onChange={(e) => setNewCheckPointText(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && handleAddCheckPoint()}
                          placeholder="チェックポイントを追加..."
                          className="flex-1 px-2.5 py-1.5 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-300 bg-gray-50"
                        />
                        <button
                          onClick={handleAddCheckPoint}
                          disabled={!newCheckPointText.trim()}
                          className="flex items-center gap-1 px-2.5 py-1.5 text-xs text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-md transition-colors disabled:opacity-40"
                        >
                          <FiPlus className="w-3 h-3" />
                          追加
                        </button>
                      </div>
                    </div>
                    {/* Example */}
                    {guideData?.example && (
                      <div className="bg-blue-50 border border-blue-100 rounded-md px-3 py-2 text-sm text-blue-800">
                        {guideData.example}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Guide reopen button */}
              {(guideData || checkPoints.length > 0) && !showGuide && (
                <button
                  onClick={() => setShowGuide(true)}
                  className="mb-3 flex items-center gap-1.5 text-xs text-amber-600 hover:text-amber-800 hover:underline"
                >
                  <FiBookOpen className="w-3.5 h-3.5" />
                  分析ガイドを表示
                </button>
              )}

              {/* AI Summary */}
              {currentVersion && currentVersion.content.length > 0 && (
                <div className="mb-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <FiZap className="w-4 h-4 text-blue-600" />
                    <h4 className="text-sm font-semibold text-blue-900">AI要約</h4>
                  </div>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    {generateItemSummary(item.title, currentVersion.content)}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
