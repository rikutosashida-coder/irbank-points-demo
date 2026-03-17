import { useState } from 'react';
import { FiUser, FiShield, FiEdit2 } from 'react-icons/fi';

type Tab = 'account' | 'security';

export function SettingsPage() {
  const [activeTab, setActiveTab] = useState<Tab>('account');

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
                  <div className="w-20 h-20 bg-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-3xl font-bold text-white">H</span>
                  </div>
                  <button className="absolute bottom-0 right-0 w-7 h-7 bg-gray-800 rounded-full flex items-center justify-center hover:bg-gray-700 transition-colors">
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
                  <button className="text-gray-400 hover:text-gray-600 transition-colors">
                    <FiEdit2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="text-gray-800 font-medium">horis_crypto</div>
                <p className="text-sm text-gray-500 mt-1">ユーザー名は変更可能ですが公開されます</p>
              </div>

              <div className="border-t border-gray-200" />

              {/* XID連携 */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-gray-700">X ID 連携</label>
                  <button className="text-gray-400 hover:text-gray-600 transition-colors">
                    <FiEdit2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="text-gray-800 font-medium">@horis_crypto</div>
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
                  <button className="text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors">
                    変更する
                  </button>
                </div>
                <div className="text-gray-400">• • • • • • • •</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
