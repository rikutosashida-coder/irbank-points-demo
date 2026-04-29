import { useEffect, useState } from 'react';
import { FiCheck, FiZap, FiX } from 'react-icons/fi';

interface PointsRewardPopupProps {
  taskTitle: string;
  points: number;
  onClose: () => void;
}

export function PointsRewardPopup({ taskTitle, points, onClose }: PointsRewardPopupProps) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    // アニメーション開始
    setTimeout(() => setShow(true), 100);

    // 3秒後に自動クローズ
    const timer = setTimeout(() => {
      setShow(false);
      setTimeout(onClose, 300);
    }, 3000);

    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div
      className={`fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 transition-opacity duration-300 ${
        show ? 'opacity-100' : 'opacity-0'
      }`}
      onClick={onClose}
    >
      <div
        className={`bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden transform transition-all duration-500 ${
          show ? 'scale-100 rotate-0' : 'scale-50 rotate-12'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* ヘッダー */}
        <div className="bg-gradient-to-r from-emerald-500 to-green-600 p-6 text-white relative overflow-hidden">
          {/* 背景アニメーション */}
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-0 left-0 w-32 h-32 bg-white rounded-full blur-3xl animate-pulse" />
            <div className="absolute bottom-0 right-0 w-40 h-40 bg-white rounded-full blur-3xl animate-pulse" style={{ animationDelay: '0.5s' }} />
          </div>

          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors z-10"
          >
            <FiX className="w-5 h-5" />
          </button>

          <div className="relative z-10">
            <div className="flex items-center justify-center mb-4">
              <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center animate-bounce">
                <FiCheck className="w-10 h-10 text-white" strokeWidth={3} />
              </div>
            </div>

            <h2 className="text-2xl font-black text-center mb-2">タスク達成！</h2>
            <p className="text-sm text-emerald-50 text-center">{taskTitle}</p>
          </div>
        </div>

        {/* ポイント表示 */}
        <div className="p-8">
          <div className="bg-gradient-to-br from-yellow-50 to-amber-50 border-2 border-yellow-200 rounded-2xl p-6 mb-6">
            <div className="flex items-center justify-center gap-3 mb-2">
              <FiZap className="w-8 h-8 text-yellow-600 animate-pulse" />
              <div className="text-center">
                <div className="text-sm text-gray-600 mb-1">獲得ポイント</div>
                <div className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-600 to-amber-600 animate-pulse">
                  +{points}
                </div>
                <div className="text-xl font-bold text-yellow-700">pt</div>
              </div>
            </div>
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-600 mb-4">
              おめでとうございます！<br />
              ポイントがアカウントに追加されました
            </p>
            <button
              onClick={onClose}
              className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-green-600 text-white font-bold rounded-lg hover:from-emerald-600 hover:to-green-700 transition-all transform hover:scale-105"
            >
              閉じる
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
