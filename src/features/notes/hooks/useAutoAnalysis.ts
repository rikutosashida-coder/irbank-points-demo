import { useMemo, useCallback } from 'react';
import { Block } from '../types/note.types';
import { analyzeNoteContent } from '../../../services/ai/analysisService';
import { useNotesStore } from '../store/notesStore';
import { countTextLength } from '../../../utils/blockNoteUtils';

/**
 * ノートの自動AI分析フック
 * 
 * 500文字以上のコンテンツで自動的にAI分析を実行し、
 * 要約とキーワードをノートに保存します。
 */
export function useAutoAnalysis(noteId: string) {
  const updateNote = useNotesStore(state => state.updateNote);

  const triggerAnalysis = useCallback(async (content: Block[], title?: string) => {
    // 500文字未満はスキップ
    if (countTextLength(content) < 500) {
      return;
    }

    try {
      const result = await analyzeNoteContent(content, { noteTitle: title });

      await updateNote(noteId, {
        summary: result.summary,
        keywords: result.keywords,
      });
    } catch (error) {
      console.error('自動分析エラー:', error);
    }
  }, [noteId, updateNote]);

  // デバウンス処理（3秒後に実行）
  const debouncedAnalysis = useMemo(() => {
    let timeoutId: ReturnType<typeof setTimeout>;
    
    return (content: Block[], title?: string) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        triggerAnalysis(content, title);
      }, 3000);
    };
  }, [triggerAnalysis]);

  return { 
    triggerAnalysis: debouncedAnalysis,
    triggerImmediately: triggerAnalysis
  };
}
