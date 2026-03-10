import { useMemo, Component, type ReactNode } from 'react';
import { useCreateBlockNote } from '@blocknote/react';
import { BlockNoteView } from '@blocknote/mantine';
import '@blocknote/core/fonts/inter.css';
import '@blocknote/mantine/style.css';

/** BlockNote が扱えるデフォルトブロックタイプ */
const VALID_BLOCK_TYPES = new Set([
  'paragraph', 'heading', 'bulletListItem', 'numberedListItem',
  'checkListItem', 'codeBlock', 'table', 'image', 'video',
  'audio', 'file', 'divider', 'quote', 'toggleListItem',
]);

/**
 * 単一ブロックがBlockNote互換かチェック
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function isValidBlock(b: any): boolean {
  if (!b || typeof b !== 'object' || !b.type) return false;
  // 未知のブロックタイプは除外
  if (!VALID_BLOCK_TYPES.has(b.type)) return false;
  // content が存在する場合は配列であること（旧形式は { text: "..." }）
  if (b.content != null && !Array.isArray(b.content)) return false;
  return true;
}

/**
 * ブロック配列から不正なブロックを除去して有効なものだけ返す。
 * 子ブロックも再帰的にフィルタリングする。
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function filterValidBlocks(blocks: any[]): any[] {
  return blocks
    .filter(isValidBlock)
    .map((b) => {
      if (Array.isArray(b.children) && b.children.length > 0) {
        return { ...b, children: filterValidBlocks(b.children) };
      }
      return b;
    });
}

// ============================================
// ErrorBoundary: BlockNote のクラッシュを吸収
// ============================================

interface EBProps { children: ReactNode; fallback: ReactNode }
interface EBState { hasError: boolean }

class BlockEditorErrorBoundary extends Component<EBProps, EBState> {
  state: EBState = { hasError: false };
  static getDerivedStateFromError() { return { hasError: true }; }
  componentDidCatch(error: Error) {
    console.error('[BlockEditor] Caught error, falling back to empty editor:', error);
  }
  render() {
    if (this.state.hasError) return this.props.fallback;
    return this.props.children;
  }
}

// ============================================
// メインエディタ
// ============================================

interface BlockEditorProps {
  initialContent?: any[];
  onChange?: (content: any[]) => void;
  editable?: boolean;
}

function BlockEditorInner({ initialContent, onChange, editable = true }: BlockEditorProps) {
  const initial = useMemo(() => {
    if (!initialContent || initialContent.length === 0) {
      return undefined;
    }
    // 不正ブロックだけ除去して有効なブロックは保持
    const valid = filterValidBlocks(initialContent);
    if (valid.length === 0) {
      return undefined;
    }
    return valid;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const editor = useCreateBlockNote({
    initialContent: initial,
  });

  const handleChange = () => {
    if (onChange && editor) {
      const blocks = editor.document;
      onChange(blocks as any);
    }
  };

  return (
    <div className="block-editor">
      <BlockNoteView
        editor={editor}
        editable={editable}
        onChange={handleChange}
        theme="light"
      />
    </div>
  );
}

/** 空エディタのフォールバック */
function BlockEditorFallback({ onChange, editable = true }: Omit<BlockEditorProps, 'initialContent'>) {
  const editor = useCreateBlockNote({});
  const handleChange = () => {
    if (onChange && editor) {
      onChange(editor.document as any);
    }
  };
  return (
    <div className="block-editor">
      <BlockNoteView editor={editor} editable={editable} onChange={handleChange} theme="light" />
    </div>
  );
}

export function BlockEditor(props: BlockEditorProps) {
  return (
    <BlockEditorErrorBoundary
      fallback={<BlockEditorFallback onChange={props.onChange} editable={props.editable} />}
    >
      <BlockEditorInner {...props} />
    </BlockEditorErrorBoundary>
  );
}
