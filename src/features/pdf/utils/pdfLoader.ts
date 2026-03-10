import * as pdfjsLib from 'pdfjs-dist';
import type { PDFDocumentProxy } from 'pdfjs-dist';

// ワーカー設定
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).toString();

/**
 * URLからPDFを読み込む（CORS対応）
 * CORSエラーの場合はnullを返す
 */
export async function loadPdfFromUrl(url: string): Promise<PDFDocumentProxy | null> {
  try {
    const response = await fetch(url, { mode: 'cors' });
    if (!response.ok) return null;
    const buffer = await response.arrayBuffer();
    return await pdfjsLib.getDocument({ data: buffer }).promise;
  } catch {
    return null;
  }
}

/**
 * FileオブジェクトからPDFを読み込む
 */
export async function loadPdfFromFile(file: File): Promise<PDFDocumentProxy> {
  const buffer = await file.arrayBuffer();
  return await pdfjsLib.getDocument({ data: buffer }).promise;
}

/**
 * 指定ページをcanvasにレンダリングし、dataURLを返す
 */
export async function renderPageToDataUrl(
  doc: PDFDocumentProxy,
  pageNumber: number,
  scale: number,
): Promise<{ dataUrl: string; width: number; height: number }> {
  const page = await doc.getPage(pageNumber);
  const viewport = page.getViewport({ scale });

  const canvas = document.createElement('canvas');
  canvas.width = viewport.width;
  canvas.height = viewport.height;

  await page.render({ canvas, viewport }).promise;

  return {
    dataUrl: canvas.toDataURL('image/png'),
    width: viewport.width,
    height: viewport.height,
  };
}
