import { Block } from '../features/notes/types/note.types';

/**
 * BlockNoteのコンテンツをプレーンテキストに変換
 */
export function blocksToPlainText(blocks: Block[]): string {
  const extractText = (block: Block): string => {
    let text = '';

    // ブロックのテキストコンテンツ
    if (block.content?.text) {
      text += block.content.text;
    }

    // 子ブロックを再帰的に処理
    if (block.children && block.children.length > 0) {
      const childText = block.children.map(extractText).join('\n');
      text += (text ? '\n' : '') + childText;
    }

    return text;
  };

  return blocks.map(extractText).filter(t => t.trim()).join('\n');
}

/**
 * プレーンテキストをBlockNote形式に変換（簡易版）
 */
export function plainTextToBlocks(text: string): Block[] {
  const lines = text.split('\n').filter(line => line.trim());

  return lines.map((line, index) => ({
    id: `block-${Date.now()}-${index}`,
    type: 'paragraph' as const,
    content: { text: line },
  }));
}

/**
 * テキストの文字数をカウント
 */
export function countTextLength(blocks: Block[]): number {
  return blocksToPlainText(blocks).length;
}

/**
 * BlockNoteブロック配列からプレーンテキストを抽出（BlockNote形式対応）
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function extractPlainTextFromBNBlocks(blocks: any[]): string {
  if (!Array.isArray(blocks)) return '';

  const lines: string[] = [];
  for (const block of blocks) {
    // BlockNote形式: content が配列 [{ type: 'text', text: '...' }, ...]
    if (Array.isArray(block.content)) {
      const line = block.content
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .map((part: any) => (typeof part === 'string' ? part : part?.text || ''))
        .join('');
      if (line.trim()) lines.push(line.trim());
    }
    // 旧形式: content.text
    else if (block.content?.text) {
      lines.push(block.content.text.trim());
    }
    // children
    if (Array.isArray(block.children) && block.children.length > 0) {
      const childText = extractPlainTextFromBNBlocks(block.children);
      if (childText) lines.push(childText);
    }
  }
  return lines.join('\n');
}

/**
 * 分析項目のAI要約を生成
 * コンテンツからキーデータと結論を抽出し、簡潔な要約を生成する
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function generateItemSummary(title: string, content: any[]): string {
  const text = extractPlainTextFromBNBlocks(content);
  if (!text.trim()) return '';

  const lines = text.split('\n').filter(s => s.trim());
  if (lines.length === 0) return '';

  // 「分析結果」「結論」「まとめ」セクション以降のデータを優先抽出
  const summaryKeywords = ['分析結果', '結論', 'まとめ', '総合評価', '判定', '投資判断'];
  const summaryLines: string[] = [];
  let inSummarySection = false;

  for (const line of lines) {
    if (summaryKeywords.some(kw => line.includes(kw))) {
      inSummarySection = true;
      continue;
    }
    if (inSummarySection) {
      if (line.startsWith('※ユーザー追記')) break;
      summaryLines.push(line);
    }
  }

  if (summaryLines.length > 0) {
    return summaryLines.slice(0, 3).join(' / ');
  }

  // 数値データを含む行を優先抽出
  const dataLines = lines.filter(l =>
    /[0-9０-９]/.test(l) && !l.startsWith('※') && !l.includes('追記')
  );
  if (dataLines.length > 0) {
    return `${title}: ${dataLines.slice(0, 2).join(' / ')}`;
  }

  // フォールバック: 先頭2行
  return lines.slice(0, 2).join(' / ');
}
