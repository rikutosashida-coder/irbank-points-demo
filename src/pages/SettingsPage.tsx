import { useState, useEffect } from 'react';
import { FiUser, FiShield, FiEdit2, FiX, FiEye, FiEyeOff, FiUpload, FiImage } from 'react-icons/fi';

type Tab = 'account' | 'security';

// プリセット画像（後でユーザーから提供される）
const PRESET_AVATARS: string[] = [
  // プリセット画像のパスをここに追加予定
];

export function SettingsPage() {
  const [activeTab, setActiveTab] = useState<Tab>('account');

  // ユーザーデータ
  const [username, setUsername] = useState('');
  const [xId, setXId] = useState('');
  const [profileImage, setProfileImage] = useState<string | null>(null);

  // モーダル状態
  const [showUsernameModal, setShowUsernameModal] = useState(false);
  const [showXIdModal, setShowXIdModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showProfileImageModal, setShowProfileImageModal] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);
  const [imageSelectionTab, setImageSelectionTab] = useState<'preset' | 'upload'>('preset');

  // フォーム状態
  const [newUsername, setNewUsername] = useState('');
  const [newXId, setNewXId] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // 初期データ読み込み
  useEffect(() => {
    const savedUsername = localStorage.getItem('username') || 'horis_crypto';
    const savedXId = localStorage.getItem('xId') || '@horis_crypto';
    const savedProfileImage = localStorage.getItem('profileImage');
    setUsername(savedUsername);
    setXId(savedXId);
    if (savedProfileImage) {
      setProfileImage(savedProfileImage);
    }
  }, []);

  // ユーザーネーム変更
  const handleUsernameChange = () => {
    if (newUsername.trim()) {
      setUsername(newUsername);
      localStorage.setItem('username', newUsername);
      setShowUsernameModal(false);
      setNewUsername('');
    }
  };

  // XID連携
  const handleXIdChange = () => {
    if (newXId.trim()) {
      const formattedXId = newXId.startsWith('@') ? newXId : `@${newXId}`;
      setXId(formattedXId);
      localStorage.setItem('xId', formattedXId);
      setShowXIdModal(false);
      setNewXId('');
    }
  };

  // パスワード変更
  const handlePasswordChange = () => {
    if (!currentPassword) {
      alert('現在のパスワードを入力してください');
      return;
    }
    if (newPassword.length < 8) {
      alert('新しいパスワードは8文字以上で設定してください');
      return;
    }
    if (newPassword !== confirmPassword) {
      alert('新しいパスワードが一致しません');
      return;
    }

    // デモ用：実際はAPIコール
    alert('パスワードが変更されました');
    setShowPasswordModal(false);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  // プロフィール写真アップロード
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // ファイルサイズチェック（2MB）
    if (file.size > 2 * 1024 * 1024) {
      alert('ファイルサイズは2MB以下にしてください');
      return;
    }

    // ファイルタイプチェック
    if (!file.type.startsWith('image/')) {
      alert('画像ファイルを選択してください');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const imageUrl = e.target?.result as string;
      setProfileImage(imageUrl);
      localStorage.setItem('profileImage', imageUrl);
      setShowProfileImageModal(false);
    };
    reader.readAsDataURL(file);
  };

  // プリセット画像選択
  const handlePresetSelect = (presetUrl: string) => {
    setSelectedPreset(presetUrl);
  };

  // プリセット画像を保存
  const handlePresetSave = () => {
    if (selectedPreset) {
      setProfileImage(selectedPreset);
      localStorage.setItem('profileImage', selectedPreset);
      setShowProfileImageModal(false);
      setSelectedPreset(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-6 py-6">
          <h1 className="text-2xl font-bold text-gray-800">設定</h1>
        </div>

        {/* タブナビゲーション */}
        <div className="max-w-4xl mx-auto px-6">
          <div className="flex gap-8 border-b border-gray-200">
            <button
              onClick={() => setActiveTab('account')}
              className={`pb-3 px-1 flex items-center gap-2 font-medium transition-colors relative ${
                activeTab === 'account'
                  ? 'text-blue-600'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <FiUser className="w-4 h-4" />
              <span>アカウント</span>
              {activeTab === 'account' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />
              )}
            </button>

            <button
              onClick={() => setActiveTab('security')}
              className={`pb-3 px-1 flex items-center gap-2 font-medium transition-colors relative ${
                activeTab === 'security'
                  ? 'text-blue-600'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <FiShield className="w-4 h-4" />
              <span>セキュリティ</span>
              {activeTab === 'security' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* コンテンツエリア */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* アカウントタブ */}
        {activeTab === 'account' && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
            <div className="space-y-8">
              {/* プロフィール写真 */}
              <div className="flex items-start gap-6">
                <div className="relative">
                  {profileImage ? (
                    <img
                      src={profileImage}
                      alt="Profile"
                      className="w-20 h-20 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-20 h-20 bg-blue-500 rounded-full flex items-center justify-center">
                      <span className="text-3xl font-bold text-white">H</span>
                    </div>
                  )}
                  <button
                    onClick={() => setShowProfileImageModal(true)}
                    className="absolute bottom-0 right-0 w-7 h-7 bg-gray-800 rounded-full flex items-center justify-center hover:bg-gray-700 transition-colors"
                  >
                    <FiEdit2 className="w-3.5 h-3.5 text-white" />
                  </button>
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-gray-800 mb-1">プロフィール写真</h3>
                  <p className="text-sm text-gray-500">JPG, PNG（最大2MB）</p>
                </div>
              </div>

              <div className="border-t border-gray-200" />

              {/* ユーザーネーム */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-gray-700">ユーザーネーム</label>
                  <button
                    onClick={() => {
                      setNewUsername(username);
                      setShowUsernameModal(true);
                    }}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <FiEdit2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="text-gray-800 font-medium">{username}</div>
                <p className="text-sm text-gray-500 mt-1">ユーザー名は変更可能ですが公開されます</p>
              </div>

              <div className="border-t border-gray-200" />

              {/* XID連携 */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-gray-700">X ID 連携</label>
                  <button
                    onClick={() => {
                      setNewXId(xId);
                      setShowXIdModal(true);
                    }}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <FiEdit2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="text-gray-800 font-medium">{xId}</div>
              </div>
            </div>
          </div>
        )}

        {/* セキュリティタブ */}
        {activeTab === 'security' && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
            <div className="space-y-8">
              {/* パスワード変更 */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-gray-700">パスワード</label>
                  <button
                    onClick={() => setShowPasswordModal(true)}
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors"
                  >
                    変更する
                  </button>
                </div>
                <div className="text-gray-400">• • • • • • • •</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ユーザーネーム変更モーダル */}
      {showUsernameModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-800">ユーザーネーム変更</h3>
              <button
                onClick={() => setShowUsernameModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <FiX className="w-6 h-6" />
              </button>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                新しいユーザーネーム
              </label>
              <input
                type="text"
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="ユーザーネームを入力"
              />
              <p className="text-sm text-gray-500 mt-2">
                ユーザー名は公開されます
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowUsernameModal(false)}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                キャンセル
              </button>
              <button
                onClick={handleUsernameChange}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all"
              >
                保存
              </button>
            </div>
          </div>
        </div>
      )}

      {/* XID連携モーダル */}
      {showXIdModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-800">X ID 連携</h3>
              <button
                onClick={() => setShowXIdModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <FiX className="w-6 h-6" />
              </button>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                X ID（旧Twitter ID）
              </label>
              <input
                type="text"
                value={newXId}
                onChange={(e) => setNewXId(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="@username"
              />
              <p className="text-sm text-gray-500 mt-2">
                @から始まるIDを入力してください
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowXIdModal(false)}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                キャンセル
              </button>
              <button
                onClick={handleXIdChange}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all"
              >
                保存
              </button>
            </div>
          </div>
        </div>
      )}

      {/* パスワード変更モーダル */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-800">パスワード変更</h3>
              <button
                onClick={() => setShowPasswordModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <FiX className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4 mb-6">
              {/* 現在のパスワード */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  現在のパスワード
                </label>
                <div className="relative">
                  <input
                    type={showCurrentPassword ? 'text' : 'password'}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="現在のパスワード"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showCurrentPassword ? <FiEyeOff className="w-5 h-5" /> : <FiEye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* 新しいパスワード */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  新しいパスワード
                </label>
                <div className="relative">
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="新しいパスワード"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showNewPassword ? <FiEyeOff className="w-5 h-5" /> : <FiEye className="w-5 h-5" />}
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">8文字以上で設定してください</p>
              </div>

              {/* パスワード確認 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  新しいパスワード（確認）
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="パスワードを再入力"
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
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowPasswordModal(false);
                  setCurrentPassword('');
                  setNewPassword('');
                  setConfirmPassword('');
                }}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                キャンセル
              </button>
              <button
                onClick={handlePasswordChange}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all"
              >
                変更
              </button>
            </div>
          </div>
        </div>
      )}

      {/* プロフィール写真選択モーダル */}
      {showProfileImageModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full p-6 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-800">プロフィール写真を選択</h3>
              <button
                onClick={() => {
                  setShowProfileImageModal(false);
                  setSelectedPreset(null);
                  setImageSelectionTab('preset');
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <FiX className="w-6 h-6" />
              </button>
            </div>

            {/* タブ切り替え */}
            <div className="flex gap-4 mb-6 border-b border-gray-200">
              <button
                onClick={() => setImageSelectionTab('preset')}
                className={`pb-3 px-1 flex items-center gap-2 font-medium transition-colors relative ${
                  imageSelectionTab === 'preset'
                    ? 'text-blue-600'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                <FiImage className="w-4 h-4" />
                <span>プリセット</span>
                {imageSelectionTab === 'preset' && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />
                )}
              </button>

              <button
                onClick={() => setImageSelectionTab('upload')}
                className={`pb-3 px-1 flex items-center gap-2 font-medium transition-colors relative ${
                  imageSelectionTab === 'upload'
                    ? 'text-blue-600'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                <FiUpload className="w-4 h-4" />
                <span>アップロード</span>
                {imageSelectionTab === 'upload' && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />
                )}
              </button>
            </div>

            {/* プリセットタブ */}
            {imageSelectionTab === 'preset' && (
              <div>
                {PRESET_AVATARS.length > 0 ? (
                  <>
                    <div className="grid grid-cols-4 gap-4 mb-6">
                      {PRESET_AVATARS.map((presetUrl, index) => (
                        <button
                          key={index}
                          onClick={() => handlePresetSelect(presetUrl)}
                          className={`aspect-square rounded-lg overflow-hidden border-2 transition-all hover:scale-105 ${
                            selectedPreset === presetUrl
                              ? 'border-blue-600 ring-2 ring-blue-200'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <img
                            src={presetUrl}
                            alt={`プリセット ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </button>
                      ))}
                    </div>

                    <div className="flex gap-3">
                      <button
                        onClick={() => {
                          setShowProfileImageModal(false);
                          setSelectedPreset(null);
                        }}
                        className="flex-1 px-4 py-3 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        キャンセル
                      </button>
                      <button
                        onClick={handlePresetSave}
                        disabled={!selectedPreset}
                        className={`flex-1 px-4 py-3 rounded-lg font-semibold transition-all ${
                          selectedPreset
                            ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700'
                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        }`}
                      >
                        保存
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-12">
                    <FiImage className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 mb-2">プリセット画像はまだ準備されていません</p>
                    <p className="text-sm text-gray-400">「アップロード」タブから画像をアップロードできます</p>
                  </div>
                )}
              </div>
            )}

            {/* アップロードタブ */}
            {imageSelectionTab === 'upload' && (
              <div>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center hover:border-gray-400 transition-colors">
                  <FiUpload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-700 font-medium mb-2">画像をアップロード</p>
                  <p className="text-sm text-gray-500 mb-4">JPG, PNG（最大2MB）</p>
                  <label className="inline-block px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all cursor-pointer">
                    ファイルを選択
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
