import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { FiMove } from 'react-icons/fi';

interface SortableBlockProps {
  id: string;
  content: any;
  editable: boolean;
}

export function SortableBlock({ id, content, editable }: SortableBlockProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  // ブロックの内容をレンダリング
  const renderBlockContent = () => {
    if (!content) return <div className="text-gray-400 text-sm">空のブロック</div>;

    const blockType = content.type || 'paragraph';
    const blockContent = content.content || [];

    // テキストコンテンツを抽出
    const extractText = (items: any): string => {
      if (!items) return '';
      if (typeof items === 'string') return items;
      if (!Array.isArray(items)) {
        if (items.text) return items.text;
        if (items.content) return extractText(items.content);
        return '';
      }
      return items
        .map(item => {
          if (typeof item === 'string') return item;
          if (item.text) return item.text;
          if (item.content) return extractText(item.content);
          return '';
        })
        .join('');
    };

    const text = extractText(blockContent);

    // ブロックタイプに応じた表示
    switch (blockType) {
      case 'heading':
        const level = content.props?.level || 1;
        return (
          <div className={`font-bold text-gray-900 ${
            level === 1 ? 'text-2xl' : level === 2 ? 'text-xl' : 'text-lg'
          }`}>
            {text || '見出し'}
          </div>
        );
      case 'bulletListItem':
        return (
          <div className="flex gap-2 text-gray-700">
            <span>•</span>
            <span>{text || 'リスト項目'}</span>
          </div>
        );
      case 'numberedListItem':
        return (
          <div className="flex gap-2 text-gray-700">
            <span>1.</span>
            <span>{text || 'リスト項目'}</span>
          </div>
        );
      case 'image':
        return (
          <div className="bg-gray-100 p-4 rounded text-center text-gray-500 text-sm">
            🖼️ 画像ブロック
          </div>
        );
      default:
        return (
          <div className="text-gray-700">
            {text || 'テキストブロック'}
          </div>
        );
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="bg-white border border-gray-200 rounded-lg p-3 hover:border-gray-300 transition-colors"
    >
      <div className="flex gap-2">
        {editable && (
          <button
            {...attributes}
            {...listeners}
            className="flex-shrink-0 p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded cursor-move"
            title="ドラッグして移動"
          >
            <FiMove className="w-4 h-4" />
          </button>
        )}
        <div className="flex-1 min-w-0">
          {renderBlockContent()}
        </div>
      </div>
    </div>
  );
}
