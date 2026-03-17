import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiMail, FiLock, FiEye, FiEyeOff, FiCheck, FiUser } from 'react-icons/fi';
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
    if (formData.username.length < 3) {
      alert('ユーザー名は3文字以上で設定してください');
      return;
    }

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
        {/* 左側：ブランドメッセージ */}
        <div className="hidden lg:block">
          <div className="space-y-6">
            <div>
              <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-4">
                IRBANKへようこそ
              </h1>
              <p className="text-xl text-gray-700 font-medium">
                創業メンバーとして<br />
                一緒に未来を創りましょう
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center flex-shrink-0">
                  <FiCheck className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800 mb-1">役職が付与される</h3>
                  <p className="text-sm text-gray-600">貢献に応じて特別な役職を獲得できます</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center flex-shrink-0">
                  <FiCheck className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800 mb-1">活動が評価される</h3>
                  <p className="text-sm text-gray-600">すべての行動がポイントとして可視化されます</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center flex-shrink-0">
                  <FiCheck className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800 mb-1">創業参加功労賞</h3>
                  <p className="text-sm text-gray-600">β版参加者限定の賞状を授与します</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center flex-shrink-0">
                  <FiCheck className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800 mb-1">アロケーション構想</h3>
                  <p className="text-sm text-gray-600">将来的な利益配分の仕組みを計画中</p>
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
                  ユーザー名
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
                <p className="text-xs text-gray-500 mt-1">3文字以上で設定してください</p>
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
                  <a href="#" className="text-blue-600 hover:text-blue-700">利用規約</a>と
                  <a href="#" className="text-blue-600 hover:text-blue-700">プライバシーポリシー</a>に同意する
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
