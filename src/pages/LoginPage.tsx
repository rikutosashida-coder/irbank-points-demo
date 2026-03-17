import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiMail, FiLock, FiEye, FiEyeOff } from 'react-icons/fi';

interface LoginPageProps {
  onLogin: () => void;
}

export function LoginPage({ onLogin }: LoginPageProps) {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === 'points' && password === 'note2026') {
      sessionStorage.setItem('basicAuth', 'authenticated');
      onLogin();
    } else {
      setError('IDまたはパスワードが正しくありません');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-8 items-center">
        {/* 左側：ブランドメッセージ */}
        <div className="hidden lg:block">
          <div className="space-y-6">
            <div>
              <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-4">
                新IRBANK
              </h1>
              <p className="text-xl text-gray-700 font-medium">
                あなたと一緒に成長する<br />
                投資プラットフォーム
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-xl">📊</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800 mb-1">投資を学べる</h3>
                  <p className="text-sm text-gray-600">初心者から上級者まで、あなたのペースで投資知識を深められます</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-xl">🎯</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800 mb-1">成長を実感</h3>
                  <p className="text-sm text-gray-600">活動がポイントとして評価され、役職も上がっていきます</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-xl">🤝</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800 mb-1">仲間と繋がる</h3>
                  <p className="text-sm text-gray-600">同じ志を持つ仲間と共に、IRBANKを育てていきましょう</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 右側：ログインフォーム */}
        <div className="w-full">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 lg:p-10">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">ログイン</h2>
              <p className="text-gray-600">アカウントにログインしてください</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* ID入力 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ID
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    <FiMail className="w-5 h-5" />
                  </div>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="IDを入力"
                    required
                  />
                </div>
              </div>

              {/* パスワード入力 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  パスワード
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    <FiLock className="w-5 h-5" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-11 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="パスワードを入力"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <FiEyeOff className="w-5 h-5" /> : <FiEye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* エラーメッセージ */}
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              {/* ログインボタン */}
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl"
              >
                ログイン
              </button>
            </form>

            {/* 新規登録リンク */}
            <div className="mt-6 text-center">
              <p className="text-gray-600 text-sm">
                アカウントをお持ちでない方は{' '}
                <button
                  onClick={() => navigate('/signup')}
                  className="text-blue-600 hover:text-blue-700 font-semibold"
                >
                  新規登録
                </button>
              </p>
            </div>
          </div>

          {/* デモ用情報 */}
          <div className="mt-4 text-center">
            <p className="text-xs text-gray-500">
              デモ用 - ID: points / PW: note2026
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
