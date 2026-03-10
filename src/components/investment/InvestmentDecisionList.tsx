import { useState, useEffect } from 'react';
import { FiPlus, FiBarChart2 } from 'react-icons/fi';
import { useInvestmentDecisionStore } from '../../features/notes/store/investmentDecisionStore';
import { InvestmentDecisionForm } from './InvestmentDecisionForm';
import { InvestmentDecisionCard } from './InvestmentDecisionCard';

interface InvestmentDecisionListProps {
  noteId: string;
  autoOpenForm?: boolean; // 外部からフォームを自動展開
}

export function InvestmentDecisionList({ noteId, autoOpenForm }: InvestmentDecisionListProps) {
  const [showForm, setShowForm] = useState(false);
  const [editingDecisionId, setEditingDecisionId] = useState<string | undefined>(undefined);
  const getDecisionsByNoteId = useInvestmentDecisionStore(
    (state) => state.getDecisionsByNoteId
  );

  const decisions = getDecisionsByNoteId(noteId);

  // 外部からの自動展開
  useEffect(() => {
    if (autoOpenForm) {
      setShowForm(true);
    }
  }, [autoOpenForm]);

  const handleEdit = (decisionId: string) => {
    setEditingDecisionId(decisionId);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingDecisionId(undefined);
  };

  return (
    <div className="space-y-4">
      {/* ヘッダー */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FiBarChart2 className="w-5 h-5 text-blue-600" />
          <h2 className="text-lg font-bold text-gray-900">投資判断記録</h2>
          <span className="text-sm text-gray-500">({decisions.length}件)</span>
        </div>

        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
          >
            <FiPlus className="w-4 h-4" />
            判断を記録
          </button>
        )}
      </div>

      {/* 判断記録フォーム */}
      {showForm && (
        <InvestmentDecisionForm
          noteId={noteId}
          onClose={handleCloseForm}
          editingDecisionId={editingDecisionId}
        />
      )}

      {/* 判断リスト */}
      <div className="space-y-3">
        {decisions.length === 0 && !showForm ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
            <FiBarChart2 className="w-12 h-12 mx-auto mb-3 text-gray-400" />
            <p className="text-sm text-gray-600 mb-1">
              まだ投資判断が記録されていません
            </p>
            <p className="text-xs text-gray-500">
              分析結果に基づいた意思決定を記録しましょう
            </p>
          </div>
        ) : (
          decisions
            .sort((a, b) => b.decisionDate.getTime() - a.decisionDate.getTime())
            .map((decision) => (
              <InvestmentDecisionCard
                key={decision.id}
                decision={decision}
                onEdit={handleEdit}
              />
            ))
        )}
      </div>
    </div>
  );
}
