import { useState, useCallback } from 'react';
import { FiRotateCw, FiCheck, FiX, FiChevronLeft, FiChevronRight, FiShuffle } from 'react-icons/fi';
import { VocabularyEntry } from '../../features/notes/types/note.types';
import { useVocabularyStore } from '../../features/notes/store/vocabularyStore';

interface FlashcardModeProps {
  entries: VocabularyEntry[];
}

const MASTERY_LABELS = ['未学習', '認識', '理解', '記憶', '応用', '習得'];
const MASTERY_COLORS = [
  'bg-gray-200 text-gray-600',
  'bg-red-100 text-red-700',
  'bg-orange-100 text-orange-700',
  'bg-yellow-100 text-yellow-700',
  'bg-blue-100 text-blue-700',
  'bg-green-100 text-green-700',
];

export function FlashcardMode({ entries }: FlashcardModeProps) {
  const recordReview = useVocabularyStore(state => state.recordReview);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [shuffled, setShuffled] = useState<VocabularyEntry[]>([...entries]);
  const [sessionStats, setSessionStats] = useState({ reviewed: 0, correct: 0 });
  const [isFinished, setIsFinished] = useState(false);

  const currentCard = shuffled[currentIndex];

  const handleShuffle = useCallback(() => {
    const shuffledArr = [...entries].sort(() => Math.random() - 0.5);
    setShuffled(shuffledArr);
    setCurrentIndex(0);
    setIsFlipped(false);
    setSessionStats({ reviewed: 0, correct: 0 });
    setIsFinished(false);
  }, [entries]);

  const handleAnswer = async (isCorrect: boolean) => {
    if (!currentCard) return;
    await recordReview(currentCard.id, isCorrect);

    const newStats = {
      reviewed: sessionStats.reviewed + 1,
      correct: sessionStats.correct + (isCorrect ? 1 : 0),
    };
    setSessionStats(newStats);

    if (currentIndex < shuffled.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setIsFlipped(false);
    } else {
      setIsFinished(true);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setIsFlipped(false);
    }
  };

  const handleNext = () => {
    if (currentIndex < shuffled.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setIsFlipped(false);
    }
  };

  if (entries.length === 0) {
    return (
      <div className="text-center py-16 text-gray-500">
        <FiRotateCw className="w-12 h-12 mx-auto mb-3 text-gray-400" />
        <p>フラッシュカードに使える単語がありません</p>
        <p className="text-sm mt-1">分析ノートでテキストを選択して単語を登録してください</p>
      </div>
    );
  }

  if (isFinished) {
    const accuracy = sessionStats.reviewed > 0
      ? Math.round((sessionStats.correct / sessionStats.reviewed) * 100)
      : 0;

    return (
      <div className="max-w-lg mx-auto text-center py-12">
        <div className="text-6xl mb-4">
          {accuracy >= 80 ? '🎉' : accuracy >= 50 ? '💪' : '📚'}
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-2">セッション完了!</h3>
        <div className="grid grid-cols-3 gap-4 mt-6 mb-8">
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="text-2xl font-bold text-gray-900">{sessionStats.reviewed}</div>
            <div className="text-xs text-gray-500">復習数</div>
          </div>
          <div className="bg-green-50 rounded-lg p-4">
            <div className="text-2xl font-bold text-green-600">{sessionStats.correct}</div>
            <div className="text-xs text-gray-500">正解数</div>
          </div>
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="text-2xl font-bold text-blue-600">{accuracy}%</div>
            <div className="text-xs text-gray-500">正答率</div>
          </div>
        </div>
        <button
          onClick={handleShuffle}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
        >
          もう一度学習する
        </button>
      </div>
    );
  }

  if (!currentCard) return null;

  const mastery = currentCard.masteryLevel || 0;

  return (
    <div className="max-w-2xl mx-auto">
      {/* Progress */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm text-gray-500">
          {currentIndex + 1} / {shuffled.length}
        </span>
        <button
          onClick={handleShuffle}
          className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
        >
          <FiShuffle className="w-3 h-3" />
          シャッフル
        </button>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-gray-200 rounded-full h-1.5 mb-6">
        <div
          className="bg-blue-600 h-1.5 rounded-full transition-all"
          style={{ width: `${((currentIndex + 1) / shuffled.length) * 100}%` }}
        />
      </div>

      {/* Card */}
      <div
        onClick={() => setIsFlipped(!isFlipped)}
        className="relative min-h-[300px] bg-white border-2 border-gray-200 rounded-2xl shadow-lg cursor-pointer hover:shadow-xl transition-all select-none"
      >
        {/* Mastery Badge */}
        <div className="absolute top-4 right-4">
          <span className={`text-xs font-medium px-2 py-1 rounded-full ${MASTERY_COLORS[mastery]}`}>
            {MASTERY_LABELS[mastery]}
          </span>
        </div>

        <div className="flex flex-col items-center justify-center h-full p-8 min-h-[300px]">
          {!isFlipped ? (
            // 表面: 単語
            <>
              <p className="text-sm text-gray-400 mb-4">用語</p>
              <h2 className="text-3xl font-bold text-gray-900 text-center">{currentCard.word}</h2>
              {currentCard.tags && currentCard.tags.length > 0 && (
                <div className="flex gap-1 mt-4">
                  {currentCard.tags.map(tag => (
                    <span key={tag} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                      {tag}
                    </span>
                  ))}
                </div>
              )}
              <p className="text-xs text-gray-400 mt-8">タップで意味を表示</p>
            </>
          ) : (
            // 裏面: 意味
            <>
              <p className="text-sm text-gray-400 mb-2">{currentCard.word}</p>
              <p className="text-xl text-gray-800 text-center leading-relaxed mb-4">
                {currentCard.meaning}
              </p>
              {currentCard.formula && (
                <div className="mt-2 px-4 py-2 bg-amber-50 border border-amber-200 rounded-lg font-mono text-sm text-gray-700">
                  {currentCard.formula}
                </div>
              )}
              {currentCard.context && (
                <p className="mt-4 text-xs text-gray-500 text-center max-w-md">
                  文脈: {currentCard.context}
                </p>
              )}
            </>
          )}
        </div>
      </div>

      {/* Navigation & Answer */}
      <div className="mt-6">
        {isFlipped ? (
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={() => handleAnswer(false)}
              className="flex items-center gap-2 px-6 py-3 bg-red-50 text-red-700 border border-red-200 rounded-xl hover:bg-red-100 transition-colors font-medium"
            >
              <FiX className="w-5 h-5" />
              わからなかった
            </button>
            <button
              onClick={() => handleAnswer(true)}
              className="flex items-center gap-2 px-6 py-3 bg-green-50 text-green-700 border border-green-200 rounded-xl hover:bg-green-100 transition-colors font-medium"
            >
              <FiCheck className="w-5 h-5" />
              覚えていた
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <button
              onClick={handlePrev}
              disabled={currentIndex === 0}
              className="p-3 text-gray-400 hover:text-gray-600 disabled:opacity-30"
            >
              <FiChevronLeft className="w-6 h-6" />
            </button>
            <p className="text-sm text-gray-400">タップして意味を確認</p>
            <button
              onClick={handleNext}
              disabled={currentIndex === shuffled.length - 1}
              className="p-3 text-gray-400 hover:text-gray-600 disabled:opacity-30"
            >
              <FiChevronRight className="w-6 h-6" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
