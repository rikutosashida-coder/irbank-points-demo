import { useState } from 'react';
import { Sidebar } from './Sidebar';
import { FiMenu } from 'react-icons/fi';

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden">
      {/* デスクトップ用サイドバー */}
      <div className="hidden lg:block">
        <Sidebar />
      </div>

      {/* モバイル用オーバーレイ */}
      {isMobileMenuOpen && (
        <>
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <div className="fixed inset-y-0 left-0 z-50 lg:hidden">
            <Sidebar onClose={() => setIsMobileMenuOpen(false)} />
          </div>
        </>
      )}

      <main className="flex-1 overflow-y-auto">
        {/* モバイル用ハンバーガーメニューボタン */}
        <div className="lg:hidden fixed top-4 left-4 z-30">
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="p-2 bg-white rounded-lg shadow-lg border border-gray-200 hover:bg-gray-50 transition-colors"
          >
            <FiMenu className="w-6 h-6 text-gray-700" />
          </button>
        </div>

        {children}
      </main>
    </div>
  );
}
