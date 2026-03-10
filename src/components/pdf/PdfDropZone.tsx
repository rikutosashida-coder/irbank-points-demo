import { useState, useRef, useCallback } from 'react';
import { FiUploadCloud, FiExternalLink, FiFile } from 'react-icons/fi';

interface PdfDropZoneProps {
  onFileSelected: (file: File) => void;
  onUrlLoad: () => void;
  defaultUrl?: string;
  isLoading: boolean;
  error: string | null;
}

export function PdfDropZone({
  onFileSelected,
  onUrlLoad,
  defaultUrl,
  isLoading,
  error,
}: PdfDropZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file && file.type === 'application/pdf') {
        onFileSelected(file);
      }
    },
    [onFileSelected],
  );

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) onFileSelected(file);
    },
    [onFileSelected],
  );

  return (
    <div className="flex flex-col items-center justify-center h-full gap-6 p-8">
      {/* URL読込ボタン */}
      {defaultUrl && !error && (
        <button
          onClick={onUrlLoad}
          disabled={isLoading}
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
          {isLoading ? (
            <>
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              読み込み中...
            </>
          ) : (
            <>
              <FiFile className="w-4 h-4" />
              URLからPDFを読み込む
            </>
          )}
        </button>
      )}

      {/* CORS エラー時のメッセージ */}
      {error && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 max-w-md text-center">
          <p className="text-sm text-amber-800 mb-3">{error}</p>
          {defaultUrl && (
            <a
              href={defaultUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              <FiExternalLink className="w-3.5 h-3.5" />
              有報をダウンロード
            </a>
          )}
        </div>
      )}

      {/* ドラッグ&ドロップエリア */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={`w-full max-w-lg border-2 border-dashed rounded-xl p-12 text-center transition-colors ${
          isDragging
            ? 'border-blue-400 bg-blue-50'
            : 'border-gray-300 hover:border-gray-400'
        }`}
      >
        <FiUploadCloud className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className="text-sm text-gray-600 mb-2">
          PDFファイルをドラッグ&ドロップ
        </p>
        <p className="text-xs text-gray-400 mb-4">または</p>
        <button
          onClick={() => fileInputRef.current?.click()}
          className="px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
        >
          ファイルを選択
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="application/pdf"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>
    </div>
  );
}
