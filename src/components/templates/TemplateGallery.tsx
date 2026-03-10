import { useState } from 'react';
import { NoteTemplate } from '../../features/notes/types/template.types';
import { useTemplateStore } from '../../features/notes/store/templateStore';
import { AnalysisDepthSelector } from './AnalysisDepthSelector';
import { AnalysisDepth } from '../../features/notes/types/note.types';

interface TemplateGalleryProps {
  onSelect: (template: NoteTemplate, depth: AnalysisDepth) => void;
  onClose: () => void;
}

type Step = 'template' | 'depth';

export function TemplateGallery({ onSelect, onClose }: TemplateGalleryProps) {
  const templates = useTemplateStore(state => state.templates);
  const [category, setCategory] = useState<string>('all');
  const [step, setStep] = useState<Step>('template');
  const [selectedTemplate, setSelectedTemplate] = useState<NoteTemplate | null>(null);

  const filtered = category === 'all'
    ? templates
    : templates.filter(t => t.category === category);

  const categories = [
    { value: 'all', label: 'すべて' },
    { value: 'stock_analysis', label: '銘柄分析' },
    { value: 'industry_research', label: '業界調査' },
    { value: 'thesis', label: '投資テーゼ' },
    { value: 'review', label: '振り返り' },
    { value: 'custom', label: 'カスタム' },
  ];

  const handleTemplateClick = (template: NoteTemplate) => {
    // 空白テンプレートは分析深度選択をスキップ
    if (template.id === 'blank-template') {
      onSelect(template, 'standard');
      onClose();
      return;
    }
    setSelectedTemplate(template);
    setStep('depth');
  };

  const handleDepthSelect = (depth: AnalysisDepth) => {
    if (selectedTemplate) {
      onSelect(selectedTemplate, depth);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-2xl max-w-4xl w-full max-h-[80vh] overflow-hidden flex flex-col">
        {step === 'template' ? (
          <>
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">テンプレートを選択</h2>
              <div className="flex gap-2 flex-wrap">
                {categories.map(cat => (
                  <button
                    key={cat.value}
                    onClick={() => setCategory(cat.value)}
                    className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                      category === cat.value
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              <div className="grid grid-cols-2 gap-4">
                {filtered.map(template => (
                  <button
                    key={template.id}
                    onClick={() => handleTemplateClick(template)}
                    className="text-left p-6 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:shadow-lg transition-all"
                  >
                    <div className="text-4xl mb-3">{template.icon}</div>
                    <h3 className="font-bold text-lg mb-2">{template.name}</h3>
                    <p className="text-sm text-gray-600 mb-3">{template.description}</p>
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>{template.sections.length}セクション</span>
                      <span>{template.usageCount}回使用</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
            <div className="p-4 border-t flex justify-end">
              <button onClick={onClose} className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg">
                キャンセル
              </button>
            </div>
          </>
        ) : (
          <div className="p-6">
            <AnalysisDepthSelector
              onSelect={handleDepthSelect}
              onBack={() => setStep('template')}
            />
          </div>
        )}
      </div>
    </div>
  );
}
