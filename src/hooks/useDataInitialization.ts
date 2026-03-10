import { useEffect } from 'react';
import { useNotesStore } from '../features/notes/store/notesStore';
import { useInvestmentDecisionStore } from '../features/notes/store/investmentDecisionStore';
import { useVocabularyStore } from '../features/notes/store/vocabularyStore';
import { useTemplateStore } from '../features/notes/store/templateStore';
import { useReviewStore } from '../features/review/store/reviewStore';
import { useUserSettingsStore } from '../features/settings/store/userSettingsStore';
import { personalMemory } from '../services/rag/personalMemory';

/**
 * アプリ起動時にすべてのデータストアを初期化するフック
 *
 * このフックは App コンポーネントで1回だけ呼び出され、
 * IndexedDB からすべてのデータを読み込んでZustandストアに格納します。
 * さらにパーソナルAIメモリのインデックスも構築します。
 */
export function useDataInitialization() {
  const loadNotes = useNotesStore(state => state.loadNotes);
  const loadDecisions = useInvestmentDecisionStore(state => state.loadDecisions);
  const loadVocabulary = useVocabularyStore(state => state.loadEntries);
  const loadTemplates = useTemplateStore(state => state.loadTemplates);
  const loadReviews = useReviewStore(state => state.loadReviews);
  const loadSettings = useUserSettingsStore(state => state.loadSettings);

  useEffect(() => {
    const initializeData = async () => {
      try {
        console.log('データ初期化開始...');

        // 並列で全データを読み込み
        await Promise.all([
          loadNotes(),
          loadDecisions(),
          loadVocabulary(),
          loadTemplates(),
          loadReviews(),
          loadSettings(),
        ]);

        // パーソナルAIメモリのインデックスを構築
        const notes = useNotesStore.getState().notes;
        const decisions = useInvestmentDecisionStore.getState().decisions;
        const reviews = useReviewStore.getState().reviews;
        personalMemory.buildIndex(notes, decisions, reviews);
        console.log(`パーソナルメモリ構築完了: ${personalMemory.chunkCount}チャンク`);

        console.log('データ初期化完了');
      } catch (error) {
        console.error('データ初期化エラー:', error);
      }
    };

    initializeData();
  }, []);
}
