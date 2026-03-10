import { useState, useEffect, ReactNode } from 'react';
import { FiStar, FiTrendingUp, FiList, FiActivity, FiBookOpen } from 'react-icons/fi';
import { OverallRating } from '../note/OverallRating';
import { AnalysisItemsSummary } from '../note/AnalysisItemsSummary';
import { InvestmentDecisionList } from './InvestmentDecisionList';
import { PerformanceView } from './PerformanceView';
import { BacktestPanel } from '../backtest/BacktestPanel';
import { AnalysisItemsList } from '../note/AnalysisItemsList';
import { AnalysisItem, AnalysisDepth, AnchorTag, AnalysisTag } from '../../features/notes/types/note.types';

type TabType = 'overview' | 'performance' | 'history' | 'backtest' | 'template';

interface InvestmentTabsProps {
  noteId: string;
  analysisItems: AnalysisItem[];
  stockCode?: string;
  analysisDepth?: AnalysisDepth;
  anchorTags?: AnchorTag[];
  analysisTags?: AnalysisTag[];
  freeTags?: string[];
  openDecisionForm?: boolean;
  onDecisionFormOpened?: () => void;
  onUpdateWeight?: (itemId: string, weight: number) => void;
  onUpdateAnalysisItems?: (items: AnalysisItem[]) => void;
  onAnchorTagClick?: (stockCode: string) => void;
  tagEditor?: ReactNode;
}

export function InvestmentTabs({ noteId, analysisItems, stockCode, analysisDepth, anchorTags, analysisTags, freeTags, openDecisionForm, onDecisionFormOpened, onUpdateWeight, onUpdateAnalysisItems, onAnchorTagClick, tagEditor }: InvestmentTabsProps) {
  const [activeTab, setActiveTab] = useState<TabType>('overview');

  // 外部から投資判断フォームを開く要求があったら、売買記録タブに切り替え
  useEffect(() => {
    if (openDecisionForm) {
      setActiveTab('history');
      onDecisionFormOpened?.();
    }
  }, [openDecisionForm, onDecisionFormOpened]);

  const tabs = [
    { id: 'overview' as TabType, label: '総合評価', icon: FiStar },
    { id: 'performance' as TabType, label: 'パフォーマンス', icon: FiTrendingUp },
    { id: 'history' as TabType, label: '売買記録', icon: FiList },
    { id: 'backtest' as TabType, label: 'バックテスト', icon: FiActivity },
    { id: 'template' as TabType, label: '項目分析', icon: FiBookOpen },
  ];

  return (
    <div className="space-y-6">
      {/* タブナビゲーション */}
      <div className="border-b border-gray-200">
        <nav className="flex gap-8" aria-label="Tabs">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-1 py-3 text-sm font-medium border-b-2 transition-colors ${
                  isActive
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* タブコンテンツ */}
      <div className="py-4">
        {activeTab === 'overview' && (
          <div>
            {/* 総合評価 */}
            {analysisItems.length > 0 ? (
              <>
                <OverallRating
                  analysisItems={analysisItems}
                  onUpdateWeight={onUpdateWeight}
                  anchorTags={anchorTags}
                  analysisTags={analysisTags}
                  freeTags={freeTags}
                  onAnchorTagClick={onAnchorTagClick}
                  tagEditor={tagEditor}
                />
                <AnalysisItemsSummary analysisItems={analysisItems} />
              </>
            ) : (
              <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                <FiStar className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                <p className="text-sm text-gray-600 mb-1">
                  まだ分析項目がありません
                </p>
                <p className="text-xs text-gray-500">
                  分析項目を追加して評価を記録しましょう
                </p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'performance' && (
          <PerformanceView noteId={noteId} />
        )}

        {activeTab === 'history' && (
          <InvestmentDecisionList noteId={noteId} autoOpenForm={openDecisionForm} />
        )}

        {activeTab === 'backtest' && (
          <BacktestPanel stockCode={stockCode} />
        )}

        {activeTab === 'template' && onUpdateAnalysisItems && (
          <AnalysisItemsList
            items={analysisItems}
            noteId={noteId}
            stockCode={stockCode}
            analysisDepth={analysisDepth}
            onUpdate={onUpdateAnalysisItems}
          />
        )}
      </div>
    </div>
  );
}
