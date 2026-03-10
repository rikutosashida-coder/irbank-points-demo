export type AnnotationTool = 'pen' | 'highlighter' | 'eraser';

export interface AnnotationStroke {
  id: string;
  tool: AnnotationTool;
  color: string;
  lineWidth: number;
  opacity: number;
  points: { x: number; y: number }[];
}

export interface PdfViewerModalProps {
  pdfUrl?: string;
  stockCode: string;
  stockName: string;
  fiscalYear: string;
  onClose: () => void;
  onInsertBlocks: (blocks: unknown[], label: string) => void;
}
