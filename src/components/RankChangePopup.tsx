import { useEffect, useState } from 'react';
import { FiX } from 'react-icons/fi';

interface RankChangePopupProps {
  type: 'promotion' | 'demotion';
  onClose: () => void;
}

export function RankChangePopup({ type, onClose }: RankChangePopupProps) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    // アニメーション用に少し遅延
    setTimeout(() => setShow(true), 50);
  }, []);

  const handleClose = () => {
    setShow(false);
    setTimeout(onClose, 300); // フェードアウト後にクローズ
  };

  const imageSrc = type === 'promotion' ? '/certificates/promotion.png' : '/certificates/demotion.png';

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm transition-opacity duration-300 ${
        show ? 'opacity-100' : 'opacity-0'
      }`}
      onClick={handleClose}
    >
      <div
        className={`relative transform transition-all duration-500 ${
          show ? 'scale-100 opacity-100' : 'scale-90 opacity-0'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* 閉じるボタン */}
        <button
          onClick={handleClose}
          className="absolute -top-3 -right-3 w-10 h-10 flex items-center justify-center rounded-full bg-white shadow-lg hover:bg-gray-100 text-gray-700 transition-colors z-10"
          title="閉じる"
        >
          <FiX className="w-6 h-6" />
        </button>

        {/* 証書画像 */}
        <img
          src={imageSrc}
          alt={type === 'promotion' ? '昇進辞令' : '人事異動通知'}
          className="w-[700px] max-w-[85vw] h-auto shadow-2xl rounded-lg"
        />
      </div>
    </div>
  );
}
