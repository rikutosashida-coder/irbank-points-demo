import { useState, useCallback, useEffect, useRef } from 'react';
import { FiX } from 'react-icons/fi';
import type { PDFDocumentProxy } from 'pdfjs-dist';
import type { PdfViewerModalProps } from '../../features/pdf/types/pdf.types';
import { loadPdfFromUrl, loadPdfFromFile, renderPageToDataUrl } from '../../features/pdf/utils/pdfLoader';
import { PdfDropZone } from './PdfDropZone';
import { PdfThumbnailGrid } from './PdfThumbnailGrid';
import { PdfAnnotationCanvas } from './PdfAnnotationCanvas';

const THUMBNAIL_SCALE = 0.3;
const FULL_RES_SCALE = 2.0;
const MAX_SELECTION = 20;

export function PdfViewerModal({
  pdfUrl,
  stockCode: _stockCode,
  stockName,
  fiscalYear,
  onClose,
  onInsertBlocks,
}: PdfViewerModalProps) {
  const [pdfDoc, setPdfDoc] = useState<PDFDocumentProxy | null>(null);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [selectedPages, setSelectedPages] = useState<Set<number>>(new Set());
  const [thumbnails, setThumbnails] = useState<Map<number, string>>(new Map());
  const [annotatedPages, setAnnotatedPages] = useState<Map<number, string>>(new Map());

  const [activeView, setActiveView] = useState<'grid' | 'annotate'>('grid');
  const [activePageNumber, setActivePageNumber] = useState<number>(1);
  const [activePageImage, setActivePageImage] = useState<{ dataUrl: string; width: number; height: number } | null>(null);

  const pdfDocRef = useRef<PDFDocumentProxy | null>(null);

  // クリーンアップ
  useEffect(() => {
    return () => {
      pdfDocRef.current?.destroy();
    };
  }, []);

  // PDF読込後のセットアップ
  const setupPdf = useCallback((doc: PDFDocumentProxy) => {
    pdfDocRef.current?.destroy();
    pdfDocRef.current = doc;
    setPdfDoc(doc);
    setTotalPages(doc.numPages);
    setThumbnails(new Map());
    setAnnotatedPages(new Map());
    setSelectedPages(new Set());
    setLoadError(null);
  }, []);

  // URLから読み込み
  const handleUrlLoad = useCallback(async () => {
    if (!pdfUrl) return;
    setIsLoading(true);
    setLoadError(null);
    const doc = await loadPdfFromUrl(pdfUrl);
    setIsLoading(false);
    if (doc) {
      setupPdf(doc);
    } else {
      setLoadError(
        'URLからの直接読み込みに失敗しました（CORSの制限）。下のリンクからPDFをダウンロードし、ファイルをアップロードしてください。',
      );
    }
  }, [pdfUrl, setupPdf]);

  // ファイルから読み込み
  const handleFileSelected = useCallback(
    async (file: File) => {
      setIsLoading(true);
      setLoadError(null);
      try {
        const doc = await loadPdfFromFile(file);
        setupPdf(doc);
      } catch {
        setLoadError('PDFファイルの読み込みに失敗しました。');
      } finally {
        setIsLoading(false);
      }
    },
    [setupPdf],
  );

  // サムネイル遅延レンダリング
  const handleLoadThumbnail = useCallback(
    async (pageNumber: number) => {
      if (!pdfDoc || thumbnails.has(pageNumber)) return;
      const result = await renderPageToDataUrl(pdfDoc, pageNumber, THUMBNAIL_SCALE);
      setThumbnails((prev) => new Map(prev).set(pageNumber, result.dataUrl));
    },
    [pdfDoc, thumbnails],
  );

  // ページ選択トグル
  const handleToggleSelect = useCallback((pageNumber: number) => {
    setSelectedPages((prev) => {
      const next = new Set(prev);
      if (next.has(pageNumber)) {
        next.delete(pageNumber);
      } else if (next.size < MAX_SELECTION) {
        next.add(pageNumber);
      }
      return next;
    });
  }, []);

  // 注釈モードへ
  const handleOpenAnnotate = useCallback(
    async (pageNumber: number) => {
      if (!pdfDoc) return;
      setActivePageNumber(pageNumber);
      // フル解像度レンダリング
      const result = await renderPageToDataUrl(pdfDoc, pageNumber, FULL_RES_SCALE);
      setActivePageImage(result);
      setActiveView('annotate');
    },
    [pdfDoc],
  );

  // 注釈保存
  const handleAnnotationSave = useCallback(
    (mergedDataUrl: string, pageNumber: number) => {
      setAnnotatedPages((prev) => new Map(prev).set(pageNumber, mergedDataUrl));
      // サムネイルも更新（注釈付き版を表示する）
      setActiveView('grid');
      setActivePageImage(null);
    },
    [],
  );

  // ノートに挿入
  const handleInsertToNote = useCallback(async () => {
    if (!pdfDoc || selectedPages.size === 0) return;

    const sortedPages = Array.from(selectedPages).sort((a, b) => a - b);
    const blocks: unknown[] = [];

    for (const pageNum of sortedPages) {
      let dataUrl = annotatedPages.get(pageNum);
      if (!dataUrl) {
        // 注釈がないページはフル解像度でレンダリング
        const result = await renderPageToDataUrl(pdfDoc, pageNum, FULL_RES_SCALE);
        dataUrl = result.dataUrl;
      }

      blocks.push({
        type: 'image',
        props: {
          url: dataUrl,
          caption: `${stockName} ${fiscalYear} 有価証券報告書 p.${pageNum}`,
          name: `${stockName}_${fiscalYear}_p${pageNum}.png`,
          previewWidth: 700,
          showPreview: true,
        },
      });
    }

    onInsertBlocks(blocks, `有価証券報告書（${sortedPages.length}ページ）`);
    onClose();
  }, [pdfDoc, selectedPages, annotatedPages, stockName, fiscalYear, onInsertBlocks, onClose]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-white">
      {/* ヘッダー */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-gray-200 bg-white shrink-0">
        <h2 className="text-base font-semibold text-gray-900">
          有価証券報告書ビューワー
          {totalPages > 0 && (
            <span className="text-sm font-normal text-gray-500 ml-2">
              ({totalPages}ページ)
            </span>
          )}
        </h2>
        <div className="flex items-center gap-3">
          {selectedPages.size > 0 && (
            <button
              onClick={handleInsertToNote}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
            >
              ノートに挿入（{selectedPages.size}件）
            </button>
          )}
          {selectedPages.size >= MAX_SELECTION && (
            <span className="text-xs text-amber-600">上限{MAX_SELECTION}ページ</span>
          )}
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* コンテンツ */}
      <div className="flex-1 overflow-hidden">
        {!pdfDoc ? (
          <PdfDropZone
            onFileSelected={handleFileSelected}
            onUrlLoad={handleUrlLoad}
            defaultUrl={pdfUrl}
            isLoading={isLoading}
            error={loadError}
          />
        ) : activeView === 'annotate' && activePageImage ? (
          <PdfAnnotationCanvas
            pageImageDataUrl={activePageImage.dataUrl}
            pageWidth={activePageImage.width}
            pageHeight={activePageImage.height}
            pageNumber={activePageNumber}
            onSave={handleAnnotationSave}
            onBack={() => {
              setActiveView('grid');
              setActivePageImage(null);
            }}
          />
        ) : (
          <PdfThumbnailGrid
            totalPages={totalPages}
            thumbnails={thumbnails}
            selectedPages={selectedPages}
            annotatedPages={annotatedPages}
            onToggleSelect={handleToggleSelect}
            onOpenAnnotate={handleOpenAnnotate}
            onLoadThumbnail={handleLoadThumbnail}
          />
        )}
      </div>
    </div>
  );
}
