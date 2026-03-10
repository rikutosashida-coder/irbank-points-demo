import { useRef, useEffect, useCallback, useState } from 'react';
import { FiArrowLeft, FiSave, FiRotateCcw, FiRotateCw, FiTrash2 } from 'react-icons/fi';
import { useAnnotation } from '../../features/pdf/hooks/useAnnotation';
import type { AnnotationStroke, AnnotationTool } from '../../features/pdf/types/pdf.types';

const COLORS = ['#000000', '#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6'];

interface PdfAnnotationCanvasProps {
  pageImageDataUrl: string;
  pageWidth: number;
  pageHeight: number;
  pageNumber: number;
  onSave: (mergedDataUrl: string, pageNumber: number) => void;
  onBack: () => void;
}

export function PdfAnnotationCanvas({
  pageImageDataUrl,
  pageWidth,
  pageHeight,
  pageNumber,
  onSave,
  onBack,
}: PdfAnnotationCanvasProps) {
  const annotation = useAnnotation();
  const drawCanvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const isDrawing = useRef(false);
  const currentPoints = useRef<{ x: number; y: number }[]>([]);
  const [displayScale, setDisplayScale] = useState(1);

  // コンテナサイズに応じた表示スケール計算
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const updateScale = () => {
      const maxW = container.clientWidth - 32;
      const maxH = container.clientHeight - 32;
      const scale = Math.min(maxW / pageWidth, maxH / pageHeight, 1);
      setDisplayScale(scale);
    };
    updateScale();
    const observer = new ResizeObserver(updateScale);
    observer.observe(container);
    return () => observer.disconnect();
  }, [pageWidth, pageHeight]);

  // ストローク再描画
  const redrawStrokes = useCallback(() => {
    const canvas = drawCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (const stroke of annotation.strokes) {
      drawStroke(ctx, stroke);
    }
  }, [annotation.strokes]);

  useEffect(() => {
    redrawStrokes();
  }, [redrawStrokes]);

  // ポインタ座標をcanvas座標に変換
  const getCanvasPos = useCallback(
    (e: React.PointerEvent) => {
      const canvas = drawCanvasRef.current!;
      const rect = canvas.getBoundingClientRect();
      return {
        x: (e.clientX - rect.left) / displayScale,
        y: (e.clientY - rect.top) / displayScale,
      };
    },
    [displayScale],
  );

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      e.preventDefault();
      isDrawing.current = true;
      currentPoints.current = [getCanvasPos(e)];
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
    },
    [getCanvasPos],
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!isDrawing.current) return;
      const pos = getCanvasPos(e);
      currentPoints.current.push(pos);

      // リアルタイムプレビュー
      const canvas = drawCanvasRef.current!;
      const ctx = canvas.getContext('2d')!;
      redrawStrokes();
      const previewStroke: AnnotationStroke = {
        id: '',
        tool: annotation.tool,
        color: annotation.tool === 'highlighter' ? '#facc15' : annotation.color,
        lineWidth: annotation.tool === 'highlighter' ? 20 : annotation.tool === 'eraser' ? 16 : annotation.lineWidth,
        opacity: annotation.tool === 'highlighter' ? 0.3 : 1,
        points: currentPoints.current,
      };
      drawStroke(ctx, previewStroke);
    },
    [getCanvasPos, annotation.tool, annotation.color, annotation.lineWidth, redrawStrokes],
  );

  const handlePointerUp = useCallback(() => {
    if (!isDrawing.current) return;
    isDrawing.current = false;
    if (currentPoints.current.length < 2) return;

    const stroke: AnnotationStroke = {
      id: crypto.randomUUID(),
      tool: annotation.tool,
      color: annotation.tool === 'highlighter' ? '#facc15' : annotation.color,
      lineWidth: annotation.tool === 'highlighter' ? 20 : annotation.tool === 'eraser' ? 16 : annotation.lineWidth,
      opacity: annotation.tool === 'highlighter' ? 0.3 : 1,
      points: [...currentPoints.current],
    };
    annotation.addStroke(stroke);
    currentPoints.current = [];
  }, [annotation]);

  // 保存: PDFページ画像 + 注釈を合成
  const handleSave = useCallback(async () => {
    const mergeCanvas = document.createElement('canvas');
    mergeCanvas.width = pageWidth;
    mergeCanvas.height = pageHeight;
    const ctx = mergeCanvas.getContext('2d')!;

    // 1. PDFページ画像を描画
    const img = new Image();
    await new Promise<void>((resolve) => {
      img.onload = () => {
        ctx.drawImage(img, 0, 0, pageWidth, pageHeight);
        resolve();
      };
      img.src = pageImageDataUrl;
    });

    // 2. 注釈ストロークを上に描画
    for (const stroke of annotation.strokes) {
      drawStroke(ctx, stroke);
    }

    onSave(mergeCanvas.toDataURL('image/png'), pageNumber);
  }, [pageImageDataUrl, pageWidth, pageHeight, annotation.strokes, onSave, pageNumber]);

  const displayW = pageWidth * displayScale;
  const displayH = pageHeight * displayScale;

  return (
    <div className="flex flex-col h-full">
      {/* ヘッダー */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-white shrink-0">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-gray-900"
        >
          <FiArrowLeft className="w-4 h-4" />
          戻る
        </button>
        <span className="text-sm font-medium text-gray-700">ページ {pageNumber}</span>
        <button
          onClick={handleSave}
          className="flex items-center gap-1.5 px-4 py-1.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
        >
          <FiSave className="w-3.5 h-3.5" />
          保存して戻る
        </button>
      </div>

      {/* ツールバー */}
      <div className="flex items-center gap-3 px-4 py-2.5 border-b border-gray-200 bg-gray-50 shrink-0 flex-wrap">
        {/* ツール選択 */}
        <div className="flex gap-1">
          {([
            { id: 'pen' as AnnotationTool, label: 'ペン' },
            { id: 'highlighter' as AnnotationTool, label: '蛍光ペン' },
            { id: 'eraser' as AnnotationTool, label: '消しゴム' },
          ]).map((t) => (
            <button
              key={t.id}
              onClick={() => annotation.setTool(t.id)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                annotation.tool === t.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-600 border border-gray-300 hover:bg-gray-100'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="w-px h-6 bg-gray-300" />

        {/* カラー選択 */}
        {annotation.tool === 'pen' && (
          <div className="flex gap-1.5">
            {COLORS.map((c) => (
              <button
                key={c}
                onClick={() => annotation.setColor(c)}
                className={`w-6 h-6 rounded-full border-2 transition-transform ${
                  annotation.color === c ? 'border-blue-500 scale-110' : 'border-gray-300'
                }`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
        )}

        {/* 太さ */}
        {annotation.tool === 'pen' && (
          <>
            <div className="w-px h-6 bg-gray-300" />
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500">太さ:</span>
              <input
                type="range"
                min={1}
                max={10}
                value={annotation.lineWidth}
                onChange={(e) => annotation.setLineWidth(Number(e.target.value))}
                className="w-20 h-1 accent-blue-600"
              />
            </div>
          </>
        )}

        <div className="w-px h-6 bg-gray-300" />

        {/* 操作ボタン */}
        <div className="flex gap-1">
          <button
            onClick={annotation.undo}
            disabled={!annotation.canUndo}
            className="p-1.5 text-gray-500 hover:text-gray-700 disabled:opacity-30"
            title="元に戻す"
          >
            <FiRotateCcw className="w-4 h-4" />
          </button>
          <button
            onClick={annotation.redo}
            disabled={!annotation.canRedo}
            className="p-1.5 text-gray-500 hover:text-gray-700 disabled:opacity-30"
            title="やり直し"
          >
            <FiRotateCw className="w-4 h-4" />
          </button>
          <button
            onClick={annotation.clearAll}
            disabled={annotation.strokes.length === 0}
            className="p-1.5 text-gray-500 hover:text-red-600 disabled:opacity-30"
            title="全消去"
          >
            <FiTrash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* キャンバスエリア */}
      <div
        ref={containerRef}
        className="flex-1 overflow-auto flex items-start justify-center bg-gray-200 p-4"
      >
        <div
          className="relative shadow-lg"
          style={{ width: displayW, height: displayH }}
        >
          {/* PDFページ画像 */}
          <img
            src={pageImageDataUrl}
            alt={`ページ ${pageNumber}`}
            className="absolute inset-0 w-full h-full"
            draggable={false}
          />
          {/* 描画キャンバス */}
          <canvas
            ref={drawCanvasRef}
            width={pageWidth}
            height={pageHeight}
            style={{
              width: displayW,
              height: displayH,
              cursor: annotation.tool === 'eraser' ? 'cell' : 'crosshair',
            }}
            className="absolute inset-0 touch-none"
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
          />
        </div>
      </div>
    </div>
  );
}

// ストローク描画ユーティリティ
function drawStroke(ctx: CanvasRenderingContext2D, stroke: AnnotationStroke) {
  if (stroke.points.length < 2) return;
  ctx.save();
  ctx.strokeStyle = stroke.color;
  ctx.lineWidth = stroke.lineWidth;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.globalAlpha = stroke.opacity;

  if (stroke.tool === 'eraser') {
    ctx.globalCompositeOperation = 'destination-out';
  }

  ctx.beginPath();
  const pts = stroke.points;
  ctx.moveTo(pts[0].x, pts[0].y);
  for (let i = 1; i < pts.length; i++) {
    const mid = {
      x: (pts[i - 1].x + pts[i].x) / 2,
      y: (pts[i - 1].y + pts[i].y) / 2,
    };
    ctx.quadraticCurveTo(pts[i - 1].x, pts[i - 1].y, mid.x, mid.y);
  }
  ctx.lineTo(pts[pts.length - 1].x, pts[pts.length - 1].y);
  ctx.stroke();
  ctx.restore();
}
