import { ReactNode, useState, useRef, useCallback, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  FiHome, FiStar, FiArchive, FiSearch, FiPlus,
  FiBarChart2, FiClock, FiSettings, FiBook,
  FiDatabase, FiFilter, FiColumns, FiFileText, FiUser, FiUsers,
  FiChevronsLeft, FiChevronsRight, FiBell, FiAward, FiZap,
} from 'react-icons/fi';
import { useNotesStore } from '../features/notes/store/notesStore';
import { useTemplateStore } from '../features/notes/store/templateStore';
import { useUserSettingsStore } from '../features/settings/store/userSettingsStore';
import { AINavigatorButton } from '../components/ai-chat/AINavigatorButton';
import { AIChatDockedPanel, AIChatFloatingPopups } from '../components/ai-chat/AIChatPanel';
import { TextSelectionAIPopup } from '../components/ai-chat/TextSelectionAIPopup';
import { TemplateGallery } from '../components/templates/TemplateGallery';
import { NoteTemplate } from '../features/notes/types/template.types';
import { AnalysisDepth } from '../features/notes/types/note.types';
import { SidebarItemKey } from '../features/settings/types/settings.types';

const SIDEBAR_MIN = 64;
const SIDEBAR_DEFAULT = 256;
const SIDEBAR_MAX = 400;

// サイドバー項目定義
interface SidebarNavItem {
  key: SidebarItemKey;
  label: string;
  icon: React.ReactNode;
  path?: string;        // navigate先
  action?: 'newNote';   // 特殊アクション
  group: 'irbank' | 'mypage' | 'system';
  special?: boolean;    // 特殊スタイル（新しいノートボタン）
}

const NAV_ITEMS: SidebarNavItem[] = [
  { key: 'top', label: 'トップ', icon: <FiHome className="w-4 h-4 flex-shrink-0" />, path: '/', group: 'irbank' },
  { key: 'companies', label: '銘柄一覧', icon: <FiDatabase className="w-4 h-4 flex-shrink-0" />, path: '/companies', group: 'irbank' },
  { key: 'screening', label: 'スクリーニング', icon: <FiFilter className="w-4 h-4 flex-shrink-0" />, path: '/screening', group: 'irbank' },
  { key: 'compare', label: '競合比較', icon: <FiColumns className="w-4 h-4 flex-shrink-0" />, path: '/compare', group: 'irbank' },
  { key: 'investors', label: '投資家検索', icon: <FiUsers className="w-4 h-4 flex-shrink-0" />, path: '/investors', group: 'irbank' },
  { key: 'newNote', label: '新しいノート', icon: <FiPlus className="w-4 h-4 flex-shrink-0" />, action: 'newNote', group: 'mypage', special: true },
  { key: 'mypage', label: 'マイページホーム', icon: <FiUser className="w-4 h-4 flex-shrink-0" />, path: '/mypage', group: 'mypage' },
  { key: 'points', label: 'ポイント', icon: <FiZap className="w-4 h-4 flex-shrink-0" />, path: '/mypage/points', group: 'mypage' },
  { key: 'notes', label: 'ノート', icon: <FiFileText className="w-4 h-4 flex-shrink-0" />, path: '/mypage/notes', group: 'mypage' },
  { key: 'favorites', label: 'お気に入り', icon: <FiStar className="w-4 h-4 flex-shrink-0" />, path: '/mypage/favorites', group: 'mypage' },
  { key: 'archived', label: 'アーカイブ', icon: <FiArchive className="w-4 h-4 flex-shrink-0" />, path: '/mypage/archived', group: 'mypage' },
  { key: 'dashboard', label: 'ダッシュボード', icon: <FiBarChart2 className="w-4 h-4 flex-shrink-0" />, path: '/mypage/dashboard', group: 'mypage' },
  { key: 'timeline', label: 'タイムライン', icon: <FiClock className="w-4 h-4 flex-shrink-0" />, path: '/mypage/timeline', group: 'mypage' },
  { key: 'vocabulary', label: '単語帳', icon: <FiBook className="w-4 h-4 flex-shrink-0" />, path: '/mypage/vocabulary', group: 'mypage' },
  { key: 'badges', label: '賞状一覧', icon: <FiAward className="w-4 h-4 flex-shrink-0" />, path: '/mypage/badges', group: 'mypage' },
  { key: 'notifications', label: 'お知らせ', icon: <FiBell className="w-4 h-4 flex-shrink-0" />, path: '/mypage/notifications', group: 'mypage' },
  { key: 'settings', label: '設定', icon: <FiSettings className="w-4 h-4 flex-shrink-0" />, path: '/mypage/settings', group: 'system' },
];

const GROUP_LABELS: Record<string, string> = {
  irbank: 'IRBANK情報',
  mypage: 'マイページ',
};

interface MainLayoutProps {
  children: ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { createNote } = useNotesStore();
  const incrementUsageCount = useTemplateStore(state => state.incrementUsageCount);
  const sidebarItems = useUserSettingsStore(s => s.getSidebarItems());
  const [searchQuery, setSearchQuery] = useState('');
  const [showTemplateGallery, setShowTemplateGallery] = useState(false);

  // サイドバー状態
  const [collapsed, setCollapsed] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(SIDEBAR_DEFAULT);
  const isResizing = useRef(false);
  const prevWidth = useRef(SIDEBAR_DEFAULT);

  const isActive = (path: string) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path === '/mypage' && location.pathname === '/mypage') return true;
    if (path !== '/' && path !== '/mypage' && location.pathname.startsWith(path)) return true;
    return false;
  };

  const handleSelectTemplate = async (template: NoteTemplate, analysisDepth: AnalysisDepth) => {
    const isBlank = template.id === 'blank-template';
    const newNoteId = await createNote({
      title: isBlank ? '' : `${template.name} - ${new Date().toLocaleDateString('ja-JP')}`,
      content: [],
      freeTags: template.suggestedTags?.freeTags || [],
      ...(!isBlank && { analysisDepth }),
    });

    await incrementUsageCount(template.id);
    navigate(`/mypage/note/${newNoteId}`);
  };

  // リサイズハンドラ
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    isResizing.current = true;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing.current) return;
      const newWidth = Math.min(SIDEBAR_MAX, Math.max(SIDEBAR_MIN, e.clientX));
      if (newWidth <= SIDEBAR_MIN + 20) {
        setCollapsed(true);
        setSidebarWidth(SIDEBAR_MIN);
      } else {
        setCollapsed(false);
        setSidebarWidth(newWidth);
        prevWidth.current = newWidth;
      }
    };
    const handleMouseUp = () => {
      if (isResizing.current) {
        isResizing.current = false;
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
      }
    };
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  const toggleCollapse = () => {
    if (collapsed) {
      setCollapsed(false);
      setSidebarWidth(prevWidth.current);
    } else {
      prevWidth.current = sidebarWidth;
      setCollapsed(true);
      setSidebarWidth(SIDEBAR_MIN);
    }
  };

  const currentWidth = collapsed ? SIDEBAR_MIN : sidebarWidth;

  const navItemClass = (path: string) =>
    `w-full flex items-center ${collapsed ? 'justify-center' : 'gap-3'} px-3 py-2 rounded-lg text-sm transition-colors ${
      isActive(path)
        ? 'bg-primary-50 text-primary-700 font-medium'
        : 'text-gray-700 hover:bg-gray-100'
    }`;

  // 表示する項目をフィルタ
  const visibleItems = NAV_ITEMS.filter(item => sidebarItems.includes(item.key));
  const irbankItems = visibleItems.filter(i => i.group === 'irbank');
  const mypageItems = visibleItems.filter(i => i.group === 'mypage');
  const systemItems = visibleItems.filter(i => i.group === 'system');

  const handleItemClick = (item: SidebarNavItem) => {
    if (item.action === 'newNote') {
      setShowTemplateGallery(true);
    } else if (item.path) {
      navigate(item.path);
    }
  };

  const renderNavButton = (item: SidebarNavItem) => {
    if (item.special) {
      return (
        <button
          key={item.key}
          onClick={() => handleItemClick(item)}
          className={`w-full flex items-center ${collapsed ? 'justify-center' : 'gap-3'} px-3 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition-colors mb-1`}
          title={item.label}
        >
          {item.icon}
          {!collapsed && item.label}
        </button>
      );
    }
    return (
      <button
        key={item.key}
        onClick={() => handleItemClick(item)}
        className={navItemClass(item.path || '')}
        title={item.label}
      >
        {item.icon}
        {!collapsed && item.label}
      </button>
    );
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <header className="h-14 bg-white border-b border-gray-200 flex items-center justify-end px-6 z-30">
        <AINavigatorButton />
      </header>

      {/* Main Container */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside
          className="bg-white border-r border-gray-200 flex flex-col flex-shrink-0 relative"
          style={{ width: currentWidth, transition: isResizing.current ? 'none' : 'width 0.2s ease' }}
        >
          {/* Logo + Toggle */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            {!collapsed && <img src="/irbank-logo.png" alt="IRBANK" className="h-6 object-contain" />}
            <button
              onClick={toggleCollapse}
              className={`p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors ${collapsed ? 'mx-auto' : ''}`}
              title={collapsed ? 'サイドバーを開く' : 'サイドバーを閉じる'}
            >
              {collapsed ? <FiChevronsRight className="w-4 h-4" /> : <FiChevronsLeft className="w-4 h-4" />}
            </button>
          </div>

          {/* Search */}
          {!collapsed ? (
            <div className="p-4 border-b border-gray-200">
              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && searchQuery.trim()) {
                      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
                    }
                  }}
                  placeholder="銘柄・ノートを検索..."
                  className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>
          ) : (
            <div className="p-2 border-b border-gray-200 flex justify-center">
              <button
                onClick={() => { setCollapsed(false); setSidebarWidth(prevWidth.current); }}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                title="検索"
              >
                <FiSearch className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-2 space-y-4">
            {/* IRBANK情報 グループ */}
            {irbankItems.length > 0 && (
              <div>
                {!collapsed && <div className="text-[10px] font-bold text-gray-400 tracking-wider uppercase px-3 mb-2">{GROUP_LABELS.irbank}</div>}
                <div className="space-y-0.5">
                  {irbankItems.map(renderNavButton)}
                </div>
              </div>
            )}

            {/* マイページ グループ */}
            {mypageItems.length > 0 && (
              <div>
                {!collapsed && <div className="text-[10px] font-bold text-gray-400 tracking-wider uppercase px-3 mb-2">{GROUP_LABELS.mypage}</div>}
                <div className="space-y-0.5">
                  {mypageItems.map(renderNavButton)}
                </div>
              </div>
            )}

            {/* 設定 */}
            {systemItems.length > 0 && (
              <div className="border-t border-gray-200 pt-3">
                {systemItems.map(renderNavButton)}
              </div>
            )}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200">
            {collapsed
              ? <p className="text-[9px] text-gray-400 text-center">v0.1.0</p>
              : <p className="text-xs text-gray-500 text-center">IRBANK Alpha Note v0.1.0</p>
            }
          </div>

          {/* Resize Handle */}
          <div
            onMouseDown={handleMouseDown}
            className="absolute top-0 right-0 w-1.5 h-full cursor-col-resize hover:bg-primary-300 active:bg-primary-400 transition-colors z-10"
          />
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-auto">
          {children}
        </main>

        {/* AI Chat Docked Panel (右側固定) */}
        <AIChatDockedPanel />
      </div>

      {/* AI Chat Floating Popups (オーバーレイ) */}
      <AIChatFloatingPopups />

      {/* テキスト選択 → AI問い合わせポップアップ */}
      <TextSelectionAIPopup />

      {/* Template Gallery Modal */}
      {showTemplateGallery && (
        <TemplateGallery
          onSelect={handleSelectTemplate}
          onClose={() => setShowTemplateGallery(false)}
        />
      )}
    </div>
  );
}
