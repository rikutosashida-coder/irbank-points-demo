import { FiMoreVertical } from 'react-icons/fi';

interface ResizeHandleProps {
  onMouseDown: (e: React.MouseEvent) => void;
}

export function ResizeHandle({ onMouseDown }: ResizeHandleProps) {
  return (
    <div
      className="absolute left-0 top-0 bottom-0 w-1 bg-gray-200 hover:bg-blue-500 cursor-col-resize group transition-colors"
      onMouseDown={onMouseDown}
    >
      {/* ドラッグハンドルアイコン */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="bg-blue-500 text-white rounded-full p-1">
          <FiMoreVertical className="w-3 h-3" />
        </div>
      </div>
    </div>
  );
}
