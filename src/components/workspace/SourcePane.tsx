import { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { FiFilePlus, FiUpload, FiType, FiArrowRight, FiChevronLeft, FiChevronRight, FiLink } from 'react-icons/fi';
import * as pdfjsLib from 'pdfjs-dist';
import type { PDFDocumentProxy } from 'pdfjs-dist';
import { useWorkspaceStore } from '../../features/workspace/store/workspaceStore';
import type { SourceRef, SourceDocument } from '../../features/workspace/types/workspace.types';

// pdfjs ワーカー設定
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).toString();

// ============================================
// PDF ページビューア（テキスト選択可能）
// ============================================

interface PdfTextItem {
  str: string;
  x: number;
  y: number;
  width: number;
  height: number;
  pageIndex: number;
}

function PdfSourceView({
  source,
  onTextSelected,
}: {
  source: SourceDocument;
  onTextSelected: (text: string, sourceRef: SourceRef) => void;
}) {
  const [pdfDoc, setPdfDoc] = useState<PDFDocumentProxy | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageDataUrl, setPageDataUrl] = useState<string | null>(null);
  const [pageSize, setPageSize] = useState<{ w: number; h: number }>({ w: 0, h: 0 });
  const [textItems, setTextItems] = useState<PdfTextItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [allPagesText, setAllPagesText] = useState<string[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const handleRef = useRef<HTMLDivElement>(null);
  const [extractHandle, setExtractHandle] = useState<{
    x: number; y: number; text: string; sourceRef: SourceRef;
  } | null>(null);

  const PDF_SCALE = 1.5;

  // PDFロード
  useEffect(() => {
    if (!source.pdfDataUrl) return;
    setIsLoading(true);

    const loadPdf = async () => {
      try {
        // dataURLからArrayBufferに変換
        const response = await fetch(source.pdfDataUrl!);
        const buffer = await response.arrayBuffer();
        const doc = await pdfjsLib.getDocument({ data: buffer }).promise;
        setPdfDoc(doc);

        // 全ページのテキストを事前抽出（オフセット計算用）
        const texts: string[] = [];
        for (let i = 1; i <= doc.numPages; i++) {
          const page = await doc.getPage(i);
          const tc = await page.getTextContent();
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const pageText = tc.items.map((item: any) => item.str).join('');
          texts.push(pageText);
        }
        setAllPagesText(texts);
        setIsLoading(false);
      } catch (err) {
        console.error('PDF load error:', err);
        setIsLoading(false);
      }
    };

    loadPdf();
  }, [source.pdfDataUrl]);

  // ページ描画 + テキスト位置抽出
  useEffect(() => {
    if (!pdfDoc) return;

    const renderPage = async () => {
      const page = await pdfDoc.getPage(currentPage);
      const viewport = page.getViewport({ scale: PDF_SCALE });

      // canvas に描画
      const canvas = document.createElement('canvas');
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      await page.render({ canvas, viewport }).promise;

      setPageDataUrl(canvas.toDataURL('image/png'));
      setPageSize({ w: viewport.width, h: viewport.height });

      // テキストアイテム抽出
      const textContent = await page.getTextContent();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const items: PdfTextItem[] = textContent.items.map((item: any) => {
        const tx = pdfjsLib.Util.transform(viewport.transform, item.transform);
        return {
          str: item.str,
          x: tx[4],
          y: tx[5] - item.height * PDF_SCALE,
          width: item.width * PDF_SCALE,
          height: item.height * PDF_SCALE,
          pageIndex: currentPage - 1,
        };
      });
      setTextItems(items);
    };

    renderPage();
  }, [pdfDoc, currentPage]);

  // コンテナ幅にフィットするスケール
  const displayScale = useMemo(() => {
    if (!containerRef.current || pageSize.w === 0) return 1;
    const containerWidth = containerRef.current.clientWidth - 16;
    return Math.min(1, containerWidth / pageSize.w);
  }, [pageSize.w]);

  // テキスト選択ハンドラ
  const handleMouseUp = useCallback(() => {
    setTimeout(() => {
      const selection = window.getSelection();
      const text = selection?.toString().trim();
      if (!text || text.length < 2) {
        setExtractHandle(null);
        return;
      }

      const anchorNode = selection?.anchorNode;
      if (!anchorNode || !containerRef.current?.contains(anchorNode)) {
        setExtractHandle(null);
        return;
      }
      if (handleRef.current?.contains(anchorNode as Node)) return;

      const range = selection?.getRangeAt(0);
      if (!range) return;

      const rect = range.getBoundingClientRect();
      const containerRect = containerRef.current!.getBoundingClientRect();

      // 全ページテキストの累積オフセットを計算
      let cumulativeOffset = 0;
      for (let i = 0; i < currentPage - 1; i++) {
        cumulativeOffset += (allPagesText[i] || '').length;
      }
      const pageText = allPagesText[currentPage - 1] || '';
      const posInPage = pageText.indexOf(text);
      const startOffset = cumulativeOffset + Math.max(0, posInPage);
      const endOffset = startOffset + text.length;

      setExtractHandle({
        x: rect.right - containerRect.left + 8,
        y: rect.top - containerRect.top + rect.height / 2,
        text,
        sourceRef: {
          sourceId: source.id,
          startOffset,
          endOffset,
          pageNumber: currentPage,
        },
      });
    }, 10);
  }, [source.id, currentPage, allPagesText]);

  const handleExtract = useCallback(() => {
    if (!extractHandle) return;
    onTextSelected(extractHandle.text, extractHandle.sourceRef);
    setExtractHandle(null);
    window.getSelection()?.removeAllRanges();
  }, [extractHandle, onTextSelected]);

  // マウスダウンでハンドル解除
  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (handleRef.current?.contains(e.target as Node)) return;
      setExtractHandle(null);
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="flex flex-col items-center gap-2">
          <div className="w-6 h-6 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
          <span className="text-xs text-gray-400">PDF読み込み中...</span>
        </div>
      </div>
    );
  }

  if (!pdfDoc) {
    return <div className="text-sm text-red-500 text-center py-8">PDFを読み込めませんでした</div>;
  }

  return (
    <div className="flex flex-col h-full">
      {/* ページナビ */}
      <div className="flex items-center justify-center gap-2 px-3 py-1.5 border-b border-gray-100 bg-gray-50/50 flex-shrink-0">
        <button
          onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
          disabled={currentPage <= 1}
          className="p-0.5 text-gray-500 hover:text-gray-700 disabled:opacity-30 transition-colors"
        >
          <FiChevronLeft className="w-4 h-4" />
        </button>
        <span className="text-[11px] text-gray-500 tabular-nums">
          {currentPage} / {pdfDoc.numPages}
        </span>
        <button
          onClick={() => setCurrentPage(p => Math.min(pdfDoc.numPages, p + 1))}
          disabled={currentPage >= pdfDoc.numPages}
          className="p-0.5 text-gray-500 hover:text-gray-700 disabled:opacity-30 transition-colors"
        >
          <FiChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* ページ描画 */}
      <div ref={containerRef} className="flex-1 overflow-y-auto p-2 relative" onMouseUp={handleMouseUp}>
        {pageDataUrl && (
          <div
            className="relative mx-auto shadow-sm border border-gray-200"
            style={{
              width: pageSize.w * displayScale,
              height: pageSize.h * displayScale,
            }}
          >
            {/* PDF画像 */}
            <img
              src={pageDataUrl}
              alt={`Page ${currentPage}`}
              className="absolute inset-0 w-full h-full"
              draggable={false}
            />

            {/* テキストレイヤー（選択可能） */}
            <div
              className="absolute inset-0"
              style={{
                transform: `scale(${displayScale})`,
                transformOrigin: '0 0',
                width: pageSize.w,
                height: pageSize.h,
              }}
            >
              {textItems.map((item, i) => (
                <span
                  key={i}
                  className="absolute text-transparent select-text leading-none"
                  style={{
                    left: item.x,
                    top: item.y,
                    fontSize: Math.max(8, item.height * 0.85),
                    width: item.width || 'auto',
                    height: item.height,
                    whiteSpace: 'pre',
                  }}
                >
                  {item.str}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* 切り出しハンドル */}
        {extractHandle && (
          <div
            ref={handleRef}
            className="absolute z-50 flex items-center gap-1"
            style={{ left: extractHandle.x, top: extractHandle.y, transform: 'translateY(-50%)' }}
          >
            <button
              onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); handleExtract(); }}
              className="flex items-center gap-1 px-2.5 py-1.5 bg-blue-600 text-white text-[10px] font-medium rounded-lg shadow-lg hover:bg-blue-700 transition-colors cursor-grab active:cursor-grabbing"
            >
              <FiArrowRight className="w-3 h-3" />
              切り出す
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================
// メインのソースペイン
// ============================================

export function SourcePane() {
  const {
    workspace,
    sources,
    fragments,
    addSource,
    setInteraction,
  } = useWorkspaceStore();

  const [showAddMenu, setShowAddMenu] = useState(false);
  const [textInput, setTextInput] = useState('');
  const [showTextInput, setShowTextInput] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const [urlLoading, setUrlLoading] = useState(false);
  const [urlError, setUrlError] = useState('');
  const [extractHandle, setExtractHandle] = useState<{
    x: number;
    y: number;
    text: string;
    sourceRef: SourceRef;
  } | null>(null);

  const contentRef = useRef<HTMLDivElement>(null);
  const handleRef = useRef<HTMLDivElement>(null);

  const activeSource = workspace?.activeSourceId ? sources[workspace.activeSourceId] : null;

  // このソースから切り出し済みの offset 一覧
  const existingHighlights = useMemo(() => {
    if (!activeSource) return [];
    return Object.values(fragments)
      .filter(f => f.sourceRef.sourceId === activeSource.id)
      .map(f => ({
        fragmentId: f.id,
        startOffset: f.sourceRef.startOffset,
        endOffset: f.sourceRef.endOffset,
      }));
  }, [fragments, activeSource]);

  // テキスト選択 → 抽出ハンドル表示（テキストソース用）
  const handleMouseUp = useCallback(() => {
    if (!activeSource || activeSource.type !== 'text' || !contentRef.current) return;

    setTimeout(() => {
      const selection = window.getSelection();
      const text = selection?.toString().trim();
      if (!text || text.length < 2) {
        setExtractHandle(null);
        return;
      }

      const anchorNode = selection?.anchorNode;
      if (!anchorNode || !contentRef.current?.contains(anchorNode)) {
        setExtractHandle(null);
        return;
      }

      if (handleRef.current?.contains(anchorNode as Node)) return;

      const range = selection?.getRangeAt(0);
      if (!range) return;

      const rect = range.getBoundingClientRect();
      const containerRect = contentRef.current!.getBoundingClientRect();

      const fullText = activeSource.textContent || '';
      const startOffset = fullText.indexOf(text);
      const endOffset = startOffset >= 0 ? startOffset + text.length : text.length;

      setExtractHandle({
        x: rect.right - containerRect.left + 8,
        y: rect.top - containerRect.top + rect.height / 2,
        text,
        sourceRef: {
          sourceId: activeSource.id,
          startOffset: Math.max(0, startOffset),
          endOffset,
        },
      });
    }, 10);
  }, [activeSource]);

  const handleMouseDown = useCallback((e: MouseEvent) => {
    if (handleRef.current?.contains(e.target as Node)) return;
    setExtractHandle(null);
  }, []);

  useEffect(() => {
    document.addEventListener('mousedown', handleMouseDown);
    return () => document.removeEventListener('mousedown', handleMouseDown);
  }, [handleMouseDown]);

  // テキスト用: 切り出しボタン
  const handleStartExtract = useCallback(() => {
    if (!extractHandle) return;
    setInteraction({
      type: 'extracting',
      excerptText: extractHandle.text,
      sourceRef: extractHandle.sourceRef,
    });
    setExtractHandle(null);
    window.getSelection()?.removeAllRanges();
  }, [extractHandle, setInteraction]);

  // PDF用: テキスト選択 → 切り出し
  const handlePdfTextSelected = useCallback((text: string, sourceRef: SourceRef) => {
    setInteraction({
      type: 'extracting',
      excerptText: text,
      sourceRef,
    });
  }, [setInteraction]);

  // テキストソース追加
  const handleAddTextSource = useCallback(async () => {
    if (!textInput.trim()) return;
    await addSource({
      type: 'text',
      title: textInput.slice(0, 30) + (textInput.length > 30 ? '...' : ''),
      textContent: textInput,
    });
    setTextInput('');
    setShowTextInput(false);
    setShowAddMenu(false);
  }, [textInput, addSource]);

  // URL からPDF/テキストを読み込み（CORSプロキシ経由）
  const handleAddUrlSource = useCallback(async () => {
    const url = urlInput.trim();
    if (!url) return;

    setUrlLoading(true);
    setUrlError('');

    try {
      // 開発サーバーのCORSプロキシ経由で取得
      const proxyUrl = `/api/cors-proxy?url=${encodeURIComponent(url)}`;
      const response = await fetch(proxyUrl);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const contentType = response.headers.get('content-type') || '';
      const fileName = url.split('/').pop()?.split('?')[0] || 'source';

      if (contentType.includes('pdf') || fileName.toLowerCase().endsWith('.pdf')) {
        // PDF
        const blob = await response.blob();
        const reader = new FileReader();
        reader.onload = async () => {
          await addSource({
            type: 'pdf',
            title: fileName,
            pdfDataUrl: reader.result as string,
          });
          setUrlInput('');
          setShowUrlInput(false);
          setShowAddMenu(false);
          setUrlLoading(false);
        };
        reader.onerror = () => {
          setUrlError('ファイル読み込みに失敗しました');
          setUrlLoading(false);
        };
        reader.readAsDataURL(blob);
      } else {
        // テキスト
        const text = await response.text();
        await addSource({
          type: 'text',
          title: fileName,
          textContent: text,
        });
        setUrlInput('');
        setShowUrlInput(false);
        setShowAddMenu(false);
        setUrlLoading(false);
      }
    } catch (err) {
      setUrlError(`読み込みエラー: ${(err as Error).message}`);
      setUrlLoading(false);
    }
  }, [urlInput, addSource]);

  // PDFファイルアップロード
  const handleFileUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type === 'application/pdf') {
      const reader = new FileReader();
      reader.onload = async () => {
        const dataUrl = reader.result as string;
        await addSource({
          type: 'pdf',
          title: file.name,
          pdfDataUrl: dataUrl,
        });
        setShowAddMenu(false);
      };
      reader.readAsDataURL(file);
    } else {
      const text = await file.text();
      await addSource({
        type: 'text',
        title: file.name,
        textContent: text,
      });
      setShowAddMenu(false);
    }
  }, [addSource]);

  // ハイライト付きテキスト描画
  const renderHighlightedText = useCallback((source: SourceDocument) => {
    const text = source.textContent || '';
    if (!text) return <p className="text-sm text-gray-400 italic">コンテンツがありません</p>;

    if (existingHighlights.length === 0) {
      return <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{text}</div>;
    }

    const sorted = [...existingHighlights].sort((a, b) => a.startOffset - b.startOffset);
    const segments: React.ReactNode[] = [];
    let cursor = 0;

    sorted.forEach((hl, i) => {
      if (hl.startOffset < 0 || hl.startOffset >= text.length) return;
      if (cursor < hl.startOffset) {
        segments.push(<span key={`t-${i}`}>{text.slice(cursor, hl.startOffset)}</span>);
      }
      const end = Math.min(hl.endOffset, text.length);
      segments.push(
        <mark
          key={`h-${i}`}
          className="bg-yellow-200/70 rounded px-0.5 cursor-pointer hover:bg-orange-200/80 transition-colors"
          title="切り出し済み"
        >
          {text.slice(hl.startOffset, end)}
        </mark>
      );
      cursor = end;
    });

    if (cursor < text.length) {
      segments.push(<span key="tail">{text.slice(cursor)}</span>);
    }

    return <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{segments}</div>;
  }, [existingHighlights]);

  // ソース切替リスト
  const sourceList = useMemo(() => Object.values(sources), [sources]);

  return (
    <div className="flex flex-col h-full bg-white">
      {/* ヘッダー */}
      <div className="flex items-center gap-2 px-3 py-2 border-b border-gray-200 bg-gray-50 flex-shrink-0">
        {/* ソース切替 */}
        {sourceList.length > 1 && (
          <select
            value={activeSource?.id || ''}
            onChange={e => {
              const store = useWorkspaceStore.getState();
              store.setActiveSource(e.target.value);
            }}
            className="text-xs border border-gray-200 rounded px-1.5 py-0.5 bg-white max-w-[140px] truncate"
          >
            {sourceList.map(s => (
              <option key={s.id} value={s.id}>{s.title}</option>
            ))}
          </select>
        )}
        <span className="text-xs font-medium text-gray-600 truncate flex-1">
          {sourceList.length <= 1 ? (activeSource ? activeSource.title : 'ソースを追加') : ''}
        </span>

        <div className="relative">
          <button
            onClick={() => setShowAddMenu(!showAddMenu)}
            className="p-1 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded transition-colors"
            title="ソース追加"
          >
            <FiFilePlus className="w-4 h-4" />
          </button>

          {showAddMenu && (
            <div className="absolute right-0 top-8 z-50 bg-white rounded-lg shadow-xl border w-52">
              <label className="flex items-center gap-2 px-3 py-2.5 text-xs text-gray-700 hover:bg-gray-50 cursor-pointer transition-colors">
                <FiUpload className="w-3.5 h-3.5" />
                ファイルをアップロード
                <input type="file" accept=".pdf,.txt,.md" onChange={handleFileUpload} className="hidden" />
              </label>
              <button
                onClick={() => { setShowUrlInput(true); setShowAddMenu(false); setUrlError(''); }}
                className="w-full flex items-center gap-2 px-3 py-2.5 text-xs text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <FiLink className="w-3.5 h-3.5" />
                URLから読み込み
              </button>
              <button
                onClick={() => { setShowTextInput(true); setShowAddMenu(false); }}
                className="w-full flex items-center gap-2 px-3 py-2.5 text-xs text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <FiType className="w-3.5 h-3.5" />
                テキストを貼り付け
              </button>
            </div>
          )}
        </div>
      </div>

      {/* テキスト入力モーダル */}
      {showTextInput && (
        <div className="p-3 border-b border-gray-200 bg-blue-50">
          <textarea
            value={textInput}
            onChange={e => setTextInput(e.target.value)}
            placeholder="分析対象のテキストを貼り付けてください..."
            className="w-full h-32 text-sm border border-gray-300 rounded-lg p-2 resize-none outline-none focus:ring-1 focus:ring-blue-400"
          />
          <div className="flex gap-2 mt-2">
            <button
              onClick={handleAddTextSource}
              disabled={!textInput.trim()}
              className="px-3 py-1 text-xs bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              追加
            </button>
            <button
              onClick={() => { setShowTextInput(false); setTextInput(''); }}
              className="px-3 py-1 text-xs text-gray-600 hover:bg-gray-200 rounded-lg transition-colors"
            >
              キャンセル
            </button>
          </div>
        </div>
      )}

      {/* URL入力パネル */}
      {showUrlInput && (
        <div className="p-3 border-b border-gray-200 bg-green-50">
          <div className="flex gap-2">
            <input
              type="url"
              value={urlInput}
              onChange={e => { setUrlInput(e.target.value); setUrlError(''); }}
              placeholder="https://example.com/report.pdf"
              className="flex-1 text-sm border border-gray-300 rounded-lg px-2.5 py-1.5 outline-none focus:ring-1 focus:ring-green-400"
              onKeyDown={e => { if (e.key === 'Enter') handleAddUrlSource(); }}
            />
          </div>
          {urlError && (
            <p className="text-[11px] text-red-500 mt-1.5">{urlError}</p>
          )}
          <div className="flex gap-2 mt-2">
            <button
              onClick={handleAddUrlSource}
              disabled={!urlInput.trim() || urlLoading}
              className="flex items-center gap-1.5 px-3 py-1 text-xs bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
            >
              {urlLoading && <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
              {urlLoading ? '読み込み中...' : '読み込む'}
            </button>
            <button
              onClick={() => { setShowUrlInput(false); setUrlInput(''); setUrlError(''); }}
              className="px-3 py-1 text-xs text-gray-600 hover:bg-gray-200 rounded-lg transition-colors"
            >
              キャンセル
            </button>
          </div>
        </div>
      )}

      {/* コンテンツ */}
      {!activeSource && !showTextInput && !showUrlInput && (
        <div className="flex-1 flex flex-col items-center justify-center text-gray-400 p-4">
          <FiFilePlus className="w-8 h-8 mb-2" />
          <p className="text-sm">ソース文書を追加</p>
          <p className="text-xs mt-1">PDF、テキストファイル、URL、</p>
          <p className="text-xs">またはテキストを直接貼り付け</p>
        </div>
      )}

      {/* PDF ソース */}
      {activeSource && activeSource.type === 'pdf' && (
        <div className="flex-1 min-h-0">
          <PdfSourceView source={activeSource} onTextSelected={handlePdfTextSelected} />
        </div>
      )}

      {/* テキストソース */}
      {activeSource && activeSource.type === 'text' && (
        <div ref={contentRef} className="flex-1 overflow-y-auto p-4 relative" onMouseUp={handleMouseUp}>
          {renderHighlightedText(activeSource)}

          {extractHandle && (
            <div
              ref={handleRef}
              className="absolute z-50 flex items-center gap-1"
              style={{ left: extractHandle.x, top: extractHandle.y, transform: 'translateY(-50%)' }}
            >
              <button
                onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); handleStartExtract(); }}
                className="flex items-center gap-1 px-2.5 py-1.5 bg-blue-600 text-white text-[10px] font-medium rounded-lg shadow-lg hover:bg-blue-700 transition-colors cursor-grab active:cursor-grabbing"
              >
                <FiArrowRight className="w-3 h-3" />
                切り出す
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
