import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiPlus, FiX } from 'react-icons/fi';
import { AnchorTag, AnalysisTag, StockData } from '../../features/notes/types/note.types';
import { StockSearchDialog } from './StockSearchDialog';
import { v4 as uuidv4 } from 'uuid';
import { useUxMode } from '../../hooks/useUxMode';

interface TagSelectorProps {
  anchorTags: AnchorTag[];
  analysisTags: AnalysisTag[];
  freeTags: string[];
  onAddAnchorTag: (tag: AnchorTag) => void;
  onRemoveAnchorTag: (tagId: string) => void;
  onAddAnalysisTag: (tag: AnalysisTag) => void;
  onRemoveAnalysisTag: (tagId: string) => void;
  onAddFreeTag: (tag: string) => void;
  onRemoveFreeTag: (tag: string) => void;
}

export function TagSelector({
  anchorTags,
  analysisTags,
  freeTags,
  onAddAnchorTag,
  onRemoveAnchorTag,
  onAddAnalysisTag,
  onRemoveAnalysisTag,
  onAddFreeTag,
  onRemoveFreeTag,
}: TagSelectorProps) {
  const { isBeginner } = useUxMode();
  const navigate = useNavigate();
  const [isStockDialogOpen, setIsStockDialogOpen] = useState(false);
  const [showAnalysisMenu, setShowAnalysisMenu] = useState(false);
  const [newFreeTag, setNewFreeTag] = useState('');
  const [showFreeTagInput, setShowFreeTagInput] = useState(false);

  const handleStockSelect = (stock: StockData) => {
    const newTag: AnchorTag = {
      id: uuidv4(),
      category: 'stock',
      stockCode: stock.code,
      stockName: stock.name,
      sector: stock.sector,
    };
    onAddAnchorTag(newTag);
  };

  const handleAddAnalysisTag = (phase: 'before_investment' | 'after_investment') => {
    const newTag: AnalysisTag = {
      id: uuidv4(),
      phase,
    };
    onAddAnalysisTag(newTag);
    setShowAnalysisMenu(false);
  };

  const handleAddFreeTag = () => {
    if (newFreeTag.trim()) {
      onAddFreeTag(newFreeTag.trim());
      setNewFreeTag('');
    }
  };

  return (
    <div className="space-y-4">
      {/* Anchor Tags (銘柄タグ) */}
      <div className={isBeginner ? 'p-3 rounded-lg border-2 border-blue-300 bg-blue-50' : ''}>
        <div className="flex items-center gap-2 mb-2">
          <span className={`text-sm font-medium ${isBeginner ? 'text-blue-800 font-bold' : 'text-gray-700'}`}>
            {isBeginner ? '銘柄タグ（まず銘柄を紐付けましょう）' : '銘柄タグ'}
          </span>
          <button
            onClick={() => setIsStockDialogOpen(true)}
            className="p-1 hover:bg-blue-50 text-blue-600 rounded transition-colors"
          >
            <FiPlus className="w-4 h-4" />
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {anchorTags.map((tag) => (
            <span
              key={tag.id}
              className="inline-flex items-center gap-1 px-3 py-1 text-sm rounded-full bg-blue-100 text-blue-800"
            >
              {tag.stockCode ? (
                <button
                  onClick={() => navigate(`/company/${tag.stockCode}`)}
                  className="hover:underline"
                >
                  {tag.stockName} ({tag.stockCode}) →
                </button>
              ) : (
                <>
                  {tag.stockName || tag.industryName || tag.themeName}
                </>
              )}
              <button
                onClick={() => onRemoveAnchorTag(tag.id)}
                className="hover:bg-blue-200 rounded-full p-0.5"
              >
                <FiX className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      </div>

      {/* Analysis Tags (分析タグ) */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <span className="text-sm font-medium text-gray-700">分析タグ</span>
          <div className="relative">
            <button
              onClick={() => setShowAnalysisMenu(!showAnalysisMenu)}
              className="p-1 hover:bg-green-50 text-green-600 rounded transition-colors"
            >
              <FiPlus className="w-4 h-4" />
            </button>
            {showAnalysisMenu && (
              <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                <button
                  onClick={() => handleAddAnalysisTag('before_investment')}
                  className="block w-full text-left px-4 py-2 hover:bg-gray-50 text-sm"
                >
                  投資判断前
                </button>
                <button
                  onClick={() => handleAddAnalysisTag('after_investment')}
                  className="block w-full text-left px-4 py-2 hover:bg-gray-50 text-sm"
                >
                  投資判断後
                </button>
              </div>
            )}
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {analysisTags.map((tag) => (
            <span
              key={tag.id}
              className="inline-flex items-center gap-1 px-3 py-1 text-sm rounded-full bg-green-100 text-green-800"
            >
              {tag.phase === 'before_investment' ? '投資判断前' : '投資判断後'}
              {tag.decision && ` - ${tag.decision}`}
              <button
                onClick={() => onRemoveAnalysisTag(tag.id)}
                className="hover:bg-green-200 rounded-full p-0.5"
              >
                <FiX className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      </div>

      {/* Free Tags (自由タグ) */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <span className="text-sm font-medium text-gray-700">自由タグ</span>
        </div>
        <div className="flex flex-wrap gap-2 mb-2">
          {freeTags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 px-3 py-1 text-sm rounded-full bg-purple-100 text-purple-800"
            >
              {tag}
              <button
                onClick={() => onRemoveFreeTag(tag)}
                className="hover:bg-purple-200 rounded-full p-0.5"
              >
                <FiX className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
        {isBeginner ? (
          showFreeTagInput ? (
            <div className="flex gap-2">
              <input
                type="text"
                value={newFreeTag}
                onChange={(e) => setNewFreeTag(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddFreeTag()}
                placeholder="タグを入力..."
                className="flex-1 px-3 py-1 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                autoFocus
              />
              <button
                onClick={handleAddFreeTag}
                className="px-3 py-1 text-sm bg-purple-600 text-white rounded-lg hover:bg-purple-700"
              >
                追加
              </button>
              <button
                onClick={() => { setShowFreeTagInput(false); setNewFreeTag(''); }}
                className="px-3 py-1 text-sm bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
              >
                閉じる
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowFreeTagInput(true)}
              className="text-sm text-purple-600 hover:underline flex items-center gap-1"
            >
              <FiPlus className="w-3 h-3" />
              タグを追加
            </button>
          )
        ) : (
          <div className="flex gap-2">
            <input
              type="text"
              value={newFreeTag}
              onChange={(e) => setNewFreeTag(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddFreeTag()}
              placeholder="タグを入力..."
              className="flex-1 px-3 py-1 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <button
              onClick={handleAddFreeTag}
              className="px-3 py-1 text-sm bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              追加
            </button>
          </div>
        )}
      </div>

      <StockSearchDialog
        isOpen={isStockDialogOpen}
        onClose={() => setIsStockDialogOpen(false)}
        onSelect={handleStockSelect}
      />
    </div>
  );
}
