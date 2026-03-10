import { useState } from 'react';
import { FiZap, FiFileText, FiSearch, FiArrowLeft } from 'react-icons/fi';
import { AnalysisDepth } from '../../features/notes/types/note.types';

interface AnalysisDepthSelectorProps {
  onSelect: (depth: AnalysisDepth) => void;
  onBack: () => void;
}

const depthOptions: {
  value: AnalysisDepth;
  label: string;
  icon: React.ReactNode;
  description: string;
  details: string[];
}[] = [
  {
    value: 'quick',
    label: 'クイック',
    icon: <FiZap className="w-6 h-6" />,
    description: '素早く直感で記録',
    details: ['分析項目は0〜2つまで', '★評価のみ（重み付け非表示）', 'サクッと記録したいときに'],
  },
  {
    value: 'standard',
    label: 'スタンダード',
    icon: <FiFileText className="w-6 h-6" />,
    description: 'バランスの良い分析',
    details: ['分析項目は自由に追加', '★評価＋重み付け', '通常の分析におすすめ'],
  },
  {
    value: 'deep',
    label: 'ディープ',
    icon: <FiSearch className="w-6 h-6" />,
    description: '徹底的に掘り下げ',
    details: ['分析項目は無制限', '重み付け必須', '30日後に自動レビュー設定'],
  },
];

export function AnalysisDepthSelector({ onSelect, onBack }: AnalysisDepthSelectorProps) {
  const [selected, setSelected] = useState<AnalysisDepth>('standard');

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={onBack}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <FiArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">分析の深さを選択</h2>
          <p className="text-sm text-gray-500 mt-1">ノートの分析レベルを設定します</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        {depthOptions.map((option) => {
          const isSelected = selected === option.value;
          return (
            <button
              key={option.value}
              onClick={() => setSelected(option.value)}
              className={`text-left p-6 rounded-lg border-2 transition-all ${
                isSelected
                  ? 'border-blue-500 bg-blue-50 shadow-md'
                  : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow'
              }`}
            >
              <div className={`p-3 rounded-lg inline-block mb-3 ${
                isSelected ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-500'
              }`}>
                {option.icon}
              </div>
              <h3 className="font-bold text-lg text-gray-900 mb-1">{option.label}</h3>
              <p className="text-sm text-gray-600 mb-4">{option.description}</p>
              <ul className="space-y-1.5">
                {option.details.map((detail, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-gray-500">
                    <span className={`mt-0.5 ${isSelected ? 'text-blue-500' : 'text-gray-400'}`}>&#x2022;</span>
                    {detail}
                  </li>
                ))}
              </ul>
            </button>
          );
        })}
      </div>

      <div className="flex justify-end gap-3">
        <button
          onClick={onBack}
          className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg"
        >
          戻る
        </button>
        <button
          onClick={() => onSelect(selected)}
          className="px-6 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
        >
          作成
        </button>
      </div>
    </div>
  );
}
