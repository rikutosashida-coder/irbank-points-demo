import { FiClock } from 'react-icons/fi';

export function ComingSoonPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full text-center">
        {/* アイコン */}
        <div className="flex justify-center mb-8">
          <div className="w-32 h-32 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center shadow-2xl">
            <FiClock className="w-16 h-16 text-white" />
          </div>
        </div>

        {/* メッセージ */}
        <h1 className="text-4xl font-bold text-gray-800 mb-4">
          Coming Soon
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          この機能は現在未公開です。
        </p>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          <p className="text-gray-700 leading-relaxed">
            より良い投資体験をお届けするため、しばらくお待ちください。
          </p>
        </div>
      </div>
    </div>
  );
}
