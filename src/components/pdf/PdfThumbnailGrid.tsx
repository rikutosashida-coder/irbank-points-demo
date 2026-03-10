import { useEffect, useRef } from 'react';
import { FiCheck, FiEdit3 } from 'react-icons/fi';

interface PdfThumbnailGridProps {
  totalPages: number;
  thumbnails: Map<number, string>;
  selectedPages: Set<number>;
  annotatedPages: Map<number, string>;
  onToggleSelect: (pageNumber: number) => void;
  onOpenAnnotate: (pageNumber: number) => void;
  onLoadThumbnail: (pageNumber: number) => void;
}

export function PdfThumbnailGrid({
  totalPages,
  thumbnails,
  selectedPages,
  annotatedPages,
  onToggleSelect,
  onOpenAnnotate,
  onLoadThumbnail,
}: PdfThumbnailGridProps) {
  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4 p-4 overflow-auto">
      {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
        <ThumbnailCell
          key={pageNum}
          pageNumber={pageNum}
          thumbnailUrl={annotatedPages.get(pageNum) || thumbnails.get(pageNum)}
          isSelected={selectedPages.has(pageNum)}
          isAnnotated={annotatedPages.has(pageNum)}
          onToggleSelect={() => onToggleSelect(pageNum)}
          onOpenAnnotate={() => onOpenAnnotate(pageNum)}
          onLoadThumbnail={() => onLoadThumbnail(pageNum)}
        />
      ))}
    </div>
  );
}

function ThumbnailCell({
  pageNumber,
  thumbnailUrl,
  isSelected,
  isAnnotated,
  onToggleSelect,
  onOpenAnnotate,
  onLoadThumbnail,
}: {
  pageNumber: number;
  thumbnailUrl?: string;
  isSelected: boolean;
  isAnnotated: boolean;
  onToggleSelect: () => void;
  onOpenAnnotate: () => void;
  onLoadThumbnail: () => void;
}) {
  const cellRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (thumbnailUrl) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          onLoadThumbnail();
          observer.disconnect();
        }
      },
      { rootMargin: '200px' },
    );
    if (cellRef.current) observer.observe(cellRef.current);
    return () => observer.disconnect();
  }, [thumbnailUrl, onLoadThumbnail]);

  return (
    <div
      ref={cellRef}
      className={`relative group rounded-lg border-2 overflow-hidden transition-colors cursor-pointer ${
        isSelected
          ? 'border-blue-500 ring-2 ring-blue-200'
          : 'border-gray-200 hover:border-gray-300'
      }`}
    >
      {/* サムネイル画像 or プレースホルダー */}
      <div className="aspect-[3/4] bg-gray-100 flex items-center justify-center" onClick={onOpenAnnotate}>
        {thumbnailUrl ? (
          <img
            src={thumbnailUrl}
            alt={`ページ ${pageNumber}`}
            className="w-full h-full object-contain"
            draggable={false}
          />
        ) : (
          <div className="flex flex-col items-center gap-1">
            <div className="w-5 h-5 border-2 border-gray-300 border-t-gray-500 rounded-full animate-spin" />
          </div>
        )}
      </div>

      {/* チェックボックス */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onToggleSelect();
        }}
        className={`absolute top-1.5 left-1.5 w-6 h-6 rounded flex items-center justify-center transition-colors ${
          isSelected
            ? 'bg-blue-600 text-white'
            : 'bg-white/80 border border-gray-300 text-transparent hover:border-blue-400'
        }`}
      >
        <FiCheck className="w-3.5 h-3.5" />
      </button>

      {/* 注釈済みバッジ */}
      {isAnnotated && (
        <div className="absolute top-1.5 right-1.5 w-6 h-6 bg-green-500 text-white rounded flex items-center justify-center">
          <FiEdit3 className="w-3 h-3" />
        </div>
      )}

      {/* ページ番号 */}
      <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs text-center py-1">
        {pageNumber}
      </div>
    </div>
  );
}
