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
    setTimeout(() => setShow(true), 50);

    // 3秒後に自動クローズ
    const timer = setTimeout(() => {
      setShow(false);
      setTimeout(onClose, 250);
    }, 3000);

    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div
      className={`fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-opacity duration-[250ms] ${
        show ? 'opacity-100' : 'opacity-0'
      }`}
      style={{
        transitionTimingFunction: 'cubic-bezier(0.23, 1, 0.32, 1)',
      }}
      onClick={onClose}
    >
      <div
        className={`bg-gradient-to-br from-blue-900 to-blue-950 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden transform transition-all duration-[250ms] ${
          show ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
        }`}
        style={{
          transitionTimingFunction: 'cubic-bezier(0.23, 1, 0.32, 1)',
          transformOrigin: 'center center',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* 背景装飾 */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute right-0 top-0 w-64 h-64 opacity-10">
            <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="reward-grid" width="20" height="20" patternUnits="userSpaceOnUse">
                  <path d="M 20 0 L 0 0 0 20" fill="none" stroke="white" strokeWidth="0.5" opacity="0.5"/>
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#reward-grid)" />
            </svg>
          </div>
          <div className="absolute top-1/4 left-0 w-48 h-48 bg-yellow-400/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-1/4 w-56 h-56 bg-amber-400/5 rounded-full blur-3xl"></div>
        </div>

        {/* メインコンテンツ */}
        <div className="relative z-10 p-8 pt-10">
          {/* チェックアイコン */}
          <div className="flex items-center justify-center mb-6">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-yellow-400 to-amber-500 flex items-center justify-center shadow-lg shadow-yellow-500/30">
              <FiCheck className="w-11 h-11 text-white" strokeWidth={4} />
            </div>
          </div>

          {/* タイトル */}
          <h2 className="text-3xl font-black text-center mb-2 text-white">タスク達成！</h2>
          <p className="text-sm text-blue-100/80 text-center mb-8">{taskTitle}</p>

          {/* ポイントカード */}
          <div className="relative bg-white rounded-2xl p-5 mb-6 overflow-hidden shadow-xl border-2 border-yellow-400">
            {/* カード内装飾 */}
            <div className="absolute right-0 top-0 bottom-0 w-24 opacity-5">
              <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <pattern id="card-dots" width="16" height="16" patternUnits="userSpaceOnUse">
                    <circle cx="8" cy="8" r="2" fill="currentColor"/>
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#card-dots)" />
              </svg>
            </div>

            <div className="relative z-10">
              <div className="text-xs text-gray-600 font-semibold mb-2 text-center">獲得ポイント</div>
              <div className="flex items-center justify-center gap-2">
                <FiZap className="w-7 h-7 text-amber-500" />
                <div className="flex items-baseline gap-1">
                  <span className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-orange-500">
                    +{points}
                  </span>
                  <span className="text-2xl font-bold text-amber-600">pt</span>
                </div>
              </div>
            </div>
          </div>

          {/* お祝いメッセージ */}
          <div className="text-center mb-6">
            <p className="text-sm text-white font-semibold mb-1">おめでとうございます！</p>
            <p className="text-xs text-blue-100/70">ポイントがアカウントに追加されました</p>
          </div>

          {/* 閉じるボタン */}
          <button
            onClick={onClose}
            className="w-full px-6 py-3.5 bg-blue-900 hover:bg-blue-950 text-white font-bold rounded-xl active:scale-[0.97] transition-all duration-[160ms] border border-blue-700/50 shadow-lg"
            style={{
              transitionTimingFunction: 'cubic-bezier(0.23, 1, 0.32, 1)',
            }}
          >
            閉じる
          </button>
        </div>
      </div>
    </div>
  );
}
