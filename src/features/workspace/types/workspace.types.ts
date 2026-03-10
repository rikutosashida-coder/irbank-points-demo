// ============================================
// Thinking Workspace Types
// LiquidText的な「読む→切り出す→空間配置→関係性可視化」
// ============================================

// ── ソース文書 ──

export type SourceType = 'pdf' | 'text';

export interface SourceTextIndex {
  pageNumber: number;
  text: string;
  charOffset: number; // 文書先頭からの累積オフセット
}

export interface SourceDocument {
  id: string;
  workspaceId: string;
  type: SourceType;
  title: string;

  // PDF
  pdfDataUrl?: string;
  totalPages?: number;

  // テキスト / Markdown
  textContent?: string;

  // テキスト位置インデックス（PDF getTextContent() から構築）
  textIndex?: SourceTextIndex[];

  addedAt: Date;
}

// ── 参照アンカー ──

export interface SourceRef {
  sourceId: string;
  startOffset: number; // 文書先頭からの文字オフセット
  endOffset: number;
  pageNumber?: number; // PDF用
}

// ── 断片（Fragment） ──

export type FragmentColor = 'gray' | 'blue' | 'green' | 'yellow' | 'red' | 'purple';

export const FRAGMENT_COLORS: { value: FragmentColor; label: string; bg: string; border: string }[] = [
  { value: 'gray', label: 'グレー', bg: 'bg-gray-50', border: 'border-gray-200' },
  { value: 'blue', label: 'ブルー', bg: 'bg-blue-50', border: 'border-blue-200' },
  { value: 'green', label: 'グリーン', bg: 'bg-green-50', border: 'border-green-200' },
  { value: 'yellow', label: 'イエロー', bg: 'bg-yellow-50', border: 'border-yellow-200' },
  { value: 'red', label: 'レッド', bg: 'bg-red-50', border: 'border-red-200' },
  { value: 'purple', label: 'パープル', bg: 'bg-purple-50', border: 'border-purple-200' },
];

export interface Fragment {
  id: string;
  workspaceId: string;

  // 参照アンカー（コピーではなくリンク）
  sourceRef: SourceRef;

  // 表示キャッシュ
  excerptText: string;

  // キャンバス上の配置
  position: { x: number; y: number };
  size: { width: number; height: number };

  // ユーザー付加情報
  userNote: string;
  color: FragmentColor;

  // 所属グループ
  groupId: string | null;

  createdAt: Date;
  updatedAt: Date;
}

// ── 接続線 ──

export type ConnectionStyle = 'solid' | 'dashed';

export interface Connection {
  id: string;
  workspaceId: string;
  fromFragmentId: string;
  toFragmentId: string;
  label: string;
  style: ConnectionStyle;
  createdAt: Date;
}

// ── グループ ──

export interface FragmentGroup {
  id: string;
  workspaceId: string;
  title: string;
  color: FragmentColor;
  createdAt: Date;
}

// ── ワークスペース本体 ──

export interface Workspace {
  id: string;
  noteId: string; // 親ノートへの紐付け
  title: string;
  splitRatio: number; // 0.3〜0.7
  activeSourceId: string | null;
  savedViewport: { panX: number; panY: number; zoom: number };
  createdAt: Date;
  updatedAt: Date;
}

// ── UI State（永続化しない） ──

export interface CanvasViewport {
  panX: number;
  panY: number;
  zoom: number; // 0.5〜2.0
}

export type InteractionMode =
  | { type: 'idle' }
  | { type: 'panning'; startX: number; startY: number; startPanX: number; startPanY: number }
  | { type: 'dragging-fragment'; fragmentId: string; offsetX: number; offsetY: number }
  | { type: 'resizing-fragment'; fragmentId: string; startWidth: number; startHeight: number; startX: number; startY: number }
  | { type: 'connecting'; fromFragmentId: string; cursorX: number; cursorY: number }
  | { type: 'selecting-rect'; startX: number; startY: number; currentX: number; currentY: number }
  | { type: 'extracting'; excerptText: string; sourceRef: SourceRef };

export type ToolMode = 'select' | 'connect' | 'pan';

// ── DTOs ──

export interface CreateWorkspaceDto {
  noteId: string;
  title: string;
}

export interface CreateFragmentDto {
  sourceRef: SourceRef;
  excerptText: string;
  position: { x: number; y: number };
  color?: FragmentColor;
}
