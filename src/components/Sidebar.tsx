import { useNavigate, useLocation } from 'react-router-dom';
import {
  FiHome, FiZap, FiFileText, FiLayout, FiGrid, FiPieChart,
  FiClock, FiBell, FiBookOpen, FiUsers, FiCpu, FiSettings,
  FiList, FiFilter, FiBarChart2, FiSearch, FiMap, FiGlobe, FiTrendingUp, FiPlus,
  FiLogOut, FiX,
} from 'react-icons/fi';

interface MenuItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  path: string;
}

interface MenuSection {
  title: string;
  items: MenuItem[];
}

const irbankInfoItems: MenuItem[] = [
  { id: 'top', label: 'トップ', icon: <FiHome className="w-5 h-5" />, path: '/top' },
  { id: 'stocks', label: '銘柄一覧', icon: <FiList className="w-5 h-5" />, path: '/stocks' },
  { id: 'screening', label: 'スクリーニング', icon: <FiFilter className="w-5 h-5" />, path: '/screening' },
  { id: 'screening2', label: 'スクリーニング2', icon: <FiFilter className="w-5 h-5" />, path: '/screening2' },
  { id: 'comparison', label: '競合比較', icon: <FiBarChart2 className="w-5 h-5" />, path: '/comparison' },
  { id: 'investor-search', label: '投資家検索', icon: <FiSearch className="w-5 h-5" />, path: '/investor-search' },
  { id: 'industry-map', label: '業界マップ', icon: <FiMap className="w-5 h-5" />, path: '/industry-map' },
  { id: 'macro', label: 'マクロ経済', icon: <FiGlobe className="w-5 h-5" />, path: '/macro' },
  { id: 'sector-heatmap', label: 'セクターヒートマップ', icon: <FiGrid className="w-5 h-5" />, path: '/sector-heatmap' },
  { id: 'factor-model', label: 'ファクターモデル', icon: <FiTrendingUp className="w-5 h-5" />, path: '/factor-model' },
];

const mypageItems: MenuItem[] = [
  { id: 'mypage', label: 'マイページ', icon: <FiHome className="w-5 h-5" />, path: '/mypage' },
  { id: 'points', label: 'ポイント', icon: <FiZap className="w-5 h-5" />, path: '/' },
  { id: 'notes', label: 'ノート', icon: <FiFileText className="w-5 h-5" />, path: '/notes' },
  { id: 'workspace', label: '思考ワークスペース', icon: <FiLayout className="w-5 h-5" />, path: '/workspace' },
  { id: 'dashboard1', label: 'カスタムダッシュボード', icon: <FiGrid className="w-5 h-5" />, path: '/dashboard' },
  { id: 'dashboard2', label: 'カスタムダッシュボード２', icon: <FiGrid className="w-5 h-5" />, path: '/dashboard2' },
  { id: 'portfolio', label: 'ポートフォリオ', icon: <FiPieChart className="w-5 h-5" />, path: '/portfolio' },
  { id: 'timeline', label: 'タイムライン', icon: <FiClock className="w-5 h-5" />, path: '/timeline' },
  { id: 'notifications', label: '通知', icon: <FiBell className="w-5 h-5" />, path: '/notifications' },
  { id: 'learning', label: '投資学習', icon: <FiBookOpen className="w-5 h-5" />, path: '/learning' },
  { id: 'community', label: 'コミュニティ', icon: <FiUsers className="w-5 h-5" />, path: '/community' },
];

const aiItems: MenuItem[] = [
  { id: 'ai', label: 'AIアナリスト', icon: <FiCpu className="w-5 h-5" />, path: '/ai' },
];

const menuSections: MenuSection[] = [
  { title: 'IRBANK情報', items: irbankInfoItems },
  { title: 'マイページ', items: mypageItems },
  { title: 'AI機能', items: aiItems },
];

interface SidebarProps {
  onClose?: () => void;
}

export function Sidebar({ onClose }: SidebarProps = {}) {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    sessionStorage.removeItem('basicAuth');
    window.location.reload();
  };

  const handleNavigate = (path: string) => {
    navigate(path);
    if (onClose) onClose();
  };

  return (
    <div className="w-64 bg-white border-r border-gray-200 h-screen overflow-y-auto flex flex-col shadow-xl lg:shadow-none">
      {/* ヘッダー */}
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        <img src="/irbank-logo.png" alt="IRBANK" className="h-6 object-contain" />
        {onClose && (
          <button
            onClick={onClose}
            className="lg:hidden p-1 hover:bg-gray-100 rounded transition-colors"
          >
            <FiX className="w-5 h-5 text-gray-600" />
          </button>
        )}
      </div>

      {/* メニュー */}
      <nav className="flex-1 p-4">
        <div className="space-y-6">
          {menuSections.map((section, sectionIdx) => (
            <div key={section.title}>
              {/* セクションタイトル */}
              <div className="px-3 mb-2">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  {section.title}
                </p>
              </div>

              {/* 新しいノートボタン（マイページセクションの最初に表示） */}
              {section.title === 'マイページ' && (
                <button
                  onClick={() => handleNavigate('/new-note')}
                  className={`
                    w-full flex items-center gap-3 px-3 py-2.5 mb-1 rounded-lg text-sm font-medium transition-colors
                    ${location.pathname === '/new-note'
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-700 hover:bg-gray-100'
                    }
                  `}
                >
                  <FiPlus className="w-5 h-5" />
                  <span>新しいノート</span>
                </button>
              )}

              {/* メニュー項目 */}
              <div className="space-y-1">
                {section.items.map((item) => {
                  const isActive = location.pathname === item.path;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleNavigate(item.path)}
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
            </div>
          ))}

          {/* 設定（独立項目） */}
          <div className="space-y-1">
            <button
              onClick={() => handleNavigate('/settings')}
              className={`
                w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
                ${location.pathname === '/settings'
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-700 hover:bg-gray-100'
                }
              `}
            >
              <FiSettings className="w-5 h-5" />
              <span>設定</span>
            </button>

            {/* ログアウト */}
            <button
              onClick={() => {
                handleLogout();
                if (onClose) onClose();
              }}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
            >
              <FiLogOut className="w-5 h-5" />
              <span>ログアウト</span>
            </button>
          </div>
        </div>
      </nav>

      {/* フッター */}
      <div className="p-4 border-t border-gray-200">
        <p className="text-xs text-gray-500 text-center">IRBANK v0.1.0</p>
      </div>
    </div>
  );
}
