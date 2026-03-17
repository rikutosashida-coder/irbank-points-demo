import { useNavigate, useLocation } from 'react-router-dom';
import {
  FiHome, FiZap, FiFileText, FiLayout, FiGrid, FiPieChart,
  FiClock, FiBell, FiBookOpen, FiUsers, FiCpu, FiSettings,
} from 'react-icons/fi';

interface MenuItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  path: string;
}

const menuItems: MenuItem[] = [
  { id: 'mypage', label: 'マイページ', icon: <FiHome className="w-5 h-5" />, path: '/mypage' },
  { id: 'points', label: 'ポイント', icon: <FiZap className="w-5 h-5" />, path: '/' },
  { id: 'notes', label: 'ノート', icon: <FiFileText className="w-5 h-5" />, path: '/notes' },
  { id: 'workspace', label: '思考ワークスペース', icon: <FiLayout className="w-5 h-5" />, path: '/workspace' },
  { id: 'dashboard1', label: 'カスタムダッシュボード', icon: <FiGrid className="w-5 h-5" />, path: '/dashboard' },
  { id: 'dashboard2', label: 'カスタムダッシュボード2', icon: <FiGrid className="w-5 h-5" />, path: '/dashboard2' },
  { id: 'portfolio', label: 'ポートフォリオ', icon: <FiPieChart className="w-5 h-5" />, path: '/portfolio' },
  { id: 'timeline', label: 'タイムライン', icon: <FiClock className="w-5 h-5" />, path: '/timeline' },
  { id: 'notifications', label: '通知', icon: <FiBell className="w-5 h-5" />, path: '/notifications' },
  { id: 'learning', label: '投資学習', icon: <FiBookOpen className="w-5 h-5" />, path: '/learning' },
  { id: 'community', label: 'コミュニティ', icon: <FiUsers className="w-5 h-5" />, path: '/community' },
  { id: 'ai', label: 'AIアシスト', icon: <FiCpu className="w-5 h-5" />, path: '/ai' },
  { id: 'settings', label: '設定', icon: <FiSettings className="w-5 h-5" />, path: '/settings' },
];

export function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div className="w-64 bg-white border-r border-gray-200 h-screen overflow-y-auto flex flex-col">
      {/* ヘッダー */}
      <div className="p-4 border-b border-gray-200">
        <h1 className="text-xl font-bold text-blue-600">新IRBANK</h1>
      </div>

      {/* メニュー */}
      <nav className="flex-1 p-4">
        <div className="space-y-1">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <button
                key={item.id}
                onClick={() => navigate(item.path)}
                className={`
                  w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
                  ${isActive
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-700 hover:bg-gray-100'
                  }
                `}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* フッター */}
      <div className="p-4 border-t border-gray-200">
        <p className="text-xs text-gray-500 text-center">新IRBANK v0.1.0</p>
      </div>
    </div>
  );
}
