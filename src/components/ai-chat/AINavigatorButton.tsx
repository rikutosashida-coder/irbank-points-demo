import { FiMessageSquare } from 'react-icons/fi';
import { useAIChatStore } from '../../features/ai-chat/store/aiChatStore';

export function AINavigatorButton() {
  const { windows, toggleDockedPanel } = useAIChatStore();
  const hasDocked = windows.some(w => w.mode === 'docked');
  const floatingCount = windows.filter(w => w.mode === 'floating').length;

  return (
    <button
      onClick={() => toggleDockedPanel()}
      className={`relative flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
        hasDocked
          ? 'bg-blue-600 text-white'
          : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
      }`}
      title={hasDocked ? 'AIナビゲーターを閉じる' : 'AIナビゲーターを開く'}
    >
      <FiMessageSquare className="w-4 h-4" />
      <span className="text-sm">AIナビゲーター</span>
      {floatingCount > 0 && (
        <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] flex items-center justify-center bg-red-500 text-white text-[10px] font-bold rounded-full px-1">
          {floatingCount}
        </span>
      )}
    </button>
  );
}
