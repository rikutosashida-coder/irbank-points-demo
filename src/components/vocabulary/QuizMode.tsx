import { useState, useCallback, useMemo } from 'react';
import { FiCheck, FiX, FiArrowRight, FiShuffle, FiAward } from 'react-icons/fi';
import { VocabularyEntry } from '../../features/notes/types/note.types';
import { useVocabularyStore } from '../../features/notes/store/vocabularyStore';

interface QuizModeProps {
  entries: VocabularyEntry[];
}

interface QuizQuestion {
  entry: VocabularyEntry;
  choices: string[];
  correctIndex: number;
}

function generateQuestions(entries: VocabularyEntry[]): QuizQuestion[] {
  const shuffled = [...entries].sort(() => Math.random() - 0.5);

  return shuffled.map((entry) => {
    // 他のエントリからダミー選択肢を生成
    const otherMeanings = entries
      .filter((e) => e.id !== entry.id)
      .map((e) => e.meaning)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3);

    // 選択肢が足りない場合のフォールバック
    while (otherMeanings.length < 3) {
      otherMeanings.push(`（選択肢${otherMeanings.length + 2}）`);
    }

    // 正解を含めてシャッフル
    const allChoices = [entry.meaning, ...otherMeanings];
    const shuffledChoices = allChoices.sort(() => Math.random() - 0.5);
    const correctIndex = shuffledChoices.indexOf(entry.meaning);

    return {
      entry,
      choices: shuffledChoices,
      correctIndex,
    };
  });
}

export function QuizMode({ entries }: QuizModeProps) {
  const recordReview = useVocabularyStore((state) => state.recordReview);
  const [questions, setQuestions] = useState<QuizQuestion[]>(() =>
    generateQuestions(entries)
  );
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [sessionStats, setSessionStats] = useState({ correct: 0, total: 0 });
  const [isFinished, setIsFinished] = useState(false);

  const currentQuestion = questions[currentIndex];

  const handleRestart = useCallback(() => {
    setQuestions(generateQuestions(entries));
    setCurrentIndex(0);
    setSelectedIndex(null);
    setIsAnswered(false);
    setSessionStats({ correct: 0, total: 0 });
    setIsFinished(false);
  }, [entries]);

  const handleSelect = async (choiceIndex: number) => {
    if (isAnswered || !currentQuestion) return;

    setSelectedIndex(choiceIndex);
    setIsAnswered(true);

    const isCorrect = choiceIndex === currentQuestion.correctIndex;
    await recordReview(currentQuestion.entry.id, isCorrect);

    setSessionStats((prev) => ({
      correct: prev.correct + (isCorrect ? 1 : 0),
      total: prev.total + 1,
    }));
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setSelectedIndex(null);
      setIsAnswered(false);
    } else {
      setIsFinished(true);
    }
  };

  const accuracy = useMemo(() => {
    if (sessionStats.total === 0) return 0;
    return Math.round((sessionStats.correct / sessionStats.total) * 100);
  }, [sessionStats]);

  if (entries.length < 2) {
    return (
      <div className="text-center py-16 text-gray-500">
        <FiAward className="w-12 h-12 mx-auto mb-3 text-gray-400" />
        <p>クイズには2つ以上の単語が必要です</p>
        <p className="text-sm mt-1">
          分析ノートでテキストを選択して単語を登録してください
        </p>
      </div>
    );
  }

  if (isFinished) {
    return (
      <div className="max-w-lg mx-auto text-center py-12">
        <div className="text-6xl mb-4">
          {accuracy >= 80 ? '🎉' : accuracy >= 50 ? '💪' : '📚'}
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-2">
          クイズ完了!
        </h3>
        <div className="grid grid-cols-3 gap-4 mt-6 mb-8">
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="text-2xl font-bold text-gray-900">
              {sessionStats.total}
            </div>
            <div className="text-xs text-gray-500">出題数</div>
          </div>
          <div className="bg-green-50 rounded-lg p-4">
            <div className="text-2xl font-bold text-green-600">
              {sessionStats.correct}
            </div>
            <div className="text-xs text-gray-500">正解数</div>
          </div>
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="text-2xl font-bold text-blue-600">{accuracy}%</div>
            <div className="text-xs text-gray-500">正答率</div>
          </div>
        </div>

        {/* 習熟度別の結果一覧 */}
        <div className="text-left mb-8">
          <h4 className="text-sm font-medium text-gray-700 mb-3">回答結果</h4>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {questions.map((q) => (
              <div
                key={q.entry.id}
                className="flex items-center gap-3 p-2 rounded-lg bg-gray-50"
              >
                <span className="text-sm font-medium text-gray-900 flex-1">
                  {q.entry.word}
                </span>
                <span className="text-xs text-gray-500 truncate max-w-[200px]">
                  {q.entry.meaning}
                </span>
              </div>
            ))}
          </div>
        </div>

        <button
          onClick={handleRestart}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
        >
          もう一度チャレンジ
        </button>
      </div>
    );
  }

  if (!currentQuestion) return null;

  return (
    <div className="max-w-2xl mx-auto">
      {/* Progress */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm text-gray-500">
          {currentIndex + 1} / {questions.length}
        </span>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-500">
            正解: {sessionStats.correct}/{sessionStats.total}
          </span>
          <button
            onClick={handleRestart}
            className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
          >
            <FiShuffle className="w-3 h-3" />
            リセット
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-gray-200 rounded-full h-1.5 mb-6">
        <div
          className="bg-blue-600 h-1.5 rounded-full transition-all"
          style={{
            width: `${((currentIndex + 1) / questions.length) * 100}%`,
          }}
        />
      </div>

      {/* Question Card */}
      <div className="bg-white border-2 border-gray-200 rounded-2xl shadow-lg p-8 mb-6">
        <p className="text-sm text-gray-400 mb-2">この用語の意味は？</p>
        <h2 className="text-3xl font-bold text-gray-900 text-center mb-2">
          {currentQuestion.entry.word}
        </h2>
        {currentQuestion.entry.tags && currentQuestion.entry.tags.length > 0 && (
          <div className="flex justify-center gap-1 mt-3">
            {currentQuestion.entry.tags.map((tag) => (
              <span
                key={tag}
                className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Choices */}
      <div className="space-y-3">
        {currentQuestion.choices.map((choice, index) => {
          let className =
            'w-full text-left p-4 rounded-xl border-2 transition-all font-medium ';

          if (!isAnswered) {
            className +=
              'border-gray-200 hover:border-blue-300 hover:bg-blue-50 cursor-pointer';
          } else if (index === currentQuestion.correctIndex) {
            className += 'border-green-500 bg-green-50 text-green-800';
          } else if (index === selectedIndex) {
            className += 'border-red-500 bg-red-50 text-red-800';
          } else {
            className += 'border-gray-200 opacity-50';
          }

          return (
            <button
              key={index}
              onClick={() => handleSelect(index)}
              disabled={isAnswered}
              className={className}
            >
              <div className="flex items-center gap-3">
                <span className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 text-sm font-bold text-gray-600">
                  {String.fromCharCode(65 + index)}
                </span>
                <span className="flex-1">{choice}</span>
                {isAnswered && index === currentQuestion.correctIndex && (
                  <FiCheck className="w-5 h-5 text-green-600" />
                )}
                {isAnswered &&
                  index === selectedIndex &&
                  index !== currentQuestion.correctIndex && (
                    <FiX className="w-5 h-5 text-red-600" />
                  )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Answer Feedback & Next */}
      {isAnswered && (
        <div className="mt-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {selectedIndex === currentQuestion.correctIndex ? (
              <span className="text-green-600 font-medium flex items-center gap-1">
                <FiCheck className="w-4 h-4" /> 正解！
              </span>
            ) : (
              <span className="text-red-600 font-medium flex items-center gap-1">
                <FiX className="w-4 h-4" /> 不正解
              </span>
            )}
          </div>
          <button
            onClick={handleNext}
            className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
          >
            {currentIndex < questions.length - 1 ? '次の問題' : '結果を見る'}
            <FiArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
