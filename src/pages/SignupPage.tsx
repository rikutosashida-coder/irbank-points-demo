import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FiMail, FiLock, FiEye, FiEyeOff, FiUser, FiBarChart2, FiTrendingUp, FiFileText, FiCalendar, FiHome, FiTool } from 'react-icons/fi';
import { WelcomePopup } from '../components/WelcomePopup';

export function SignupPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState<'input' | 'verification'>('input');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // バリデーション
    if (formData.password !== formData.confirmPassword) {
      alert('パスワードが一致しません');
      return;
    }

    if (formData.password.length < 8) {
      alert('パスワードは8文字以上で設定してください');
      return;
    }

    // 認証コード入力画面へ遷移
    setStep('verification');
  };

  const handleVerification = (e: React.FormEvent) => {
    e.preventDefault();

    // 認証コードチェック（モック: 111111）
    if (verificationCode === '111111') {
      setShowWelcome(true);
    } else {
      alert('認証コードが正しくありません');
    }
  };

  const handleWelcomeClose = () => {
    setShowWelcome(false);
    // ユーザー名を保存
    localStorage.setItem('username', formData.username);
    // Welcomeメッセージを閉じたら、ログインして自動的にメインページへ
    sessionStorage.setItem('basicAuth', 'authenticated');
    navigate('/');
    window.location.reload(); // BasicAuthの状態を更新するため
  };

  const handleChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  return (
    <>
      <WelcomePopup isOpen={showWelcome} onClose={handleWelcomeClose} />

      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-8 items-center">
        {/* 左側：サービス概要 */}
        <div className="hidden lg:block">
          <div className="space-y-6">
            <div className="mb-8">
              <img
                src="/service-overview-banner.png"
                alt="Service Overview - プロ投資家が使う本格ツール"
                className="w-full h-auto rounded-lg"
              />
            </div>

            <div className="space-y-3">
              <div className="bg-white/80 backdrop-blur-sm border-l-4 border-blue-600 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3">
                  <FiBarChart2 className="w-6 h-6 text-blue-600" />
                  <span className="font-semibold text-gray-800">企業分析</span>
                </div>
              </div>

              <div className="bg-white/80 backdrop-blur-sm border-l-4 border-blue-600 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3">
                  <FiTrendingUp className="w-6 h-6 text-blue-600" />
                  <span className="font-semibold text-gray-800">マーケット情報</span>
                </div>
              </div>

              <div className="bg-white/80 backdrop-blur-sm border-l-4 border-blue-600 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3">
                  <FiFileText className="w-6 h-6 text-blue-600" />
                  <span className="font-semibold text-gray-800">適時開示情報</span>
                </div>
              </div>

              <div className="bg-white/80 backdrop-blur-sm border-l-4 border-blue-600 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3">
                  <FiCalendar className="w-6 h-6 text-blue-600" />
                  <span className="font-semibold text-gray-800">決算スケジュール</span>
                </div>
              </div>

              <div className="bg-white/80 backdrop-blur-sm border-l-4 border-blue-600 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3">
                  <FiHome className="w-6 h-6 text-blue-600" />
                  <span className="font-semibold text-gray-800">法人情報</span>
                </div>
              </div>

              <div className="bg-white/80 backdrop-blur-sm border-l-4 border-blue-600 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3">
                  <FiTool className="w-6 h-6 text-blue-600" />
                  <span className="font-semibold text-gray-800">便利ツール</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 右側：新規登録フォーム / 認証コード入力 */}
        <div className="w-full">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 lg:p-10">
            {step === 'input' ? (
              <>
                <div className="mb-8">
                  <div className="inline-block bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium mb-3">
                    クラウドファンディング参加者専用
                  </div>
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">新規登録</h2>
                  <p className="text-gray-600">メールアドレスとパスワードで登録</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
              {/* ユーザー名 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  設定するユーザー名を入力
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    <FiUser className="w-5 h-5" />
                  </div>
                  <input
                    type="text"
                    value={formData.username}
                    onChange={(e) => handleChange('username', e.target.value)}
                    className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="ユーザー名を入力"
                    required
                  />
                </div>
              </div>

              {/* メールアドレス */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  メールアドレス
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    <FiMail className="w-5 h-5" />
                  </div>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="メールアドレスを入力"
                    required
                  />
                </div>
              </div>

              {/* パスワード */}
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
                    value={formData.password}
                    onChange={(e) => handleChange('password', e.target.value)}
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
                <p className="text-xs text-gray-500 mt-1">8文字以上で設定してください</p>
              </div>

              {/* パスワード確認 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  パスワード（確認）
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    <FiLock className="w-5 h-5" />
                  </div>
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={formData.confirmPassword}
                    onChange={(e) => handleChange('confirmPassword', e.target.value)}
                    className="w-full pl-11 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="パスワードを再入力"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? <FiEyeOff className="w-5 h-5" /> : <FiEye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* 利用規約 */}
              <div className="flex items-start gap-2">
                <input
                  type="checkbox"
                  id="terms"
                  className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  required
                />
                <label htmlFor="terms" className="text-sm text-gray-600">
                  <Link to="/terms" target="_blank" className="text-blue-600 hover:text-blue-700 hover:underline">利用規約</Link>と
                  <Link to="/privacy-policy" target="_blank" className="text-blue-600 hover:text-blue-700 hover:underline">プライバシーポリシー</Link>に同意する
                </label>
              </div>

              {/* 登録ボタン */}
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl"
              >
                新規登録
              </button>
            </form>

                {/* ログインリンク */}
                <div className="mt-6 text-center">
                  <p className="text-gray-600 text-sm">
                    すでにアカウントをお持ちの方は{' '}
                    <button
                      onClick={() => navigate('/login')}
                      className="text-blue-600 hover:text-blue-700 font-semibold"
                    >
                      ログイン
                    </button>
                  </p>
                </div>
              </>
            ) : (
              <>
                {/* 認証コード入力画面 */}
                <div className="mb-8">
                  <div className="inline-block bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium mb-3">
                    メール認証
                  </div>
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">認証コード入力</h2>
                  <p className="text-gray-600">
                    {formData.email} に送信された6桁の認証コードを入力してください
                  </p>
                </div>

                <form onSubmit={handleVerification} className="space-y-5">
                  {/* 認証コード入力 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      認証コード
                    </label>
                    <input
                      type="text"
                      value={verificationCode}
                      onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-center text-2xl tracking-widest font-mono"
                      placeholder="000000"
                      maxLength={6}
                      required
                    />
                    <p className="text-xs text-gray-500 mt-2 text-center">
                      デモ用コード: 111111
                    </p>
                  </div>

                  {/* 認証ボタン */}
                  <button
                    type="submit"
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl"
                  >
                    認証して登録完了
                  </button>
                </form>

                {/* 戻るリンク */}
                <div className="mt-6 text-center">
                  <button
                    onClick={() => setStep('input')}
                    className="text-gray-600 hover:text-gray-800 text-sm font-medium"
                  >
                    ← 入力画面に戻る
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
      </div>
    </>
  );
}
