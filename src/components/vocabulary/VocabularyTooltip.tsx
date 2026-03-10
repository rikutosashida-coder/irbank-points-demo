import { VocabularyEntry } from '../../features/notes/types/note.types';

interface VocabularyTooltipProps {
  entry: VocabularyEntry;
  position: { x: number; y: number };
}

export function VocabularyTooltip({ entry, position }: VocabularyTooltipProps) {
  return (
    <div
      className="fixed z-50 bg-white rounded-lg shadow-xl border border-gray-300 p-3 max-w-[300px] pointer-events-none"
      style={{
        top: `${position.y}px`,
        left: `${position.x}px`,
        transform: 'translate(-50%, -100%) translateY(-8px)',
      }}
    >
      {/* 単語 */}
      <div className="font-semibold text-gray-900 mb-1 text-sm">{entry.word}</div>

      {/* 意味 */}
      <div className="text-sm text-gray-700 mb-2">{entry.meaning}</div>

      {/* 数式 */}
      {entry.formula && (
        <div className="text-xs text-gray-600 bg-amber-50 p-2 rounded border border-amber-200 font-mono">
          {entry.formula}
        </div>
      )}

      {/* 三角形の矢印 */}
      <div
        className="absolute left-1/2 bottom-0 transform -translate-x-1/2 translate-y-full"
        style={{
          width: 0,
          height: 0,
          borderLeft: '6px solid transparent',
          borderRight: '6px solid transparent',
          borderTop: '6px solid white',
        }}
      />
    </div>
  );
}
