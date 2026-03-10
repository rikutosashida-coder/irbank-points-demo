import { useState, useEffect, useRef } from 'react';
import { FiBook, FiHelpCircle } from 'react-icons/fi';
import { BlockEditor } from './BlockEditor';
import { VocabularyPopup } from '../vocabulary/VocabularyPopup';
import { VocabularyTooltip } from '../vocabulary/VocabularyTooltip';
import { useVocabularyStore } from '../../features/notes/store/vocabularyStore';
import { VocabularyEntry } from '../../features/notes/types/note.types';

interface BlockEditorWithVocabularyProps {
  initialContent: any[];
  onChange: (content: any[]) => void;
  editable: boolean;
  noteId?: string;
}

interface WordMarker {
  word: string;
  entry: VocabularyEntry;
  position: { x: number; y: number };
}

export function BlockEditorWithVocabulary({
  initialContent,
  onChange,
  editable,
  noteId,
}: BlockEditorWithVocabularyProps) {
  const [showPopup, setShowPopup] = useState(false);
  const [selectedText, setSelectedText] = useState('');
  const [popupPosition, setPopupPosition] = useState({ x: 0, y: 0 });
  const [hoveredWord, setHoveredWord] = useState<VocabularyEntry | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [wordMarkers, setWordMarkers] = useState<WordMarker[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const editorRef = useRef<HTMLDivElement>(null);

  const entries = useVocabularyStore((state) => state.entries);

  // テキスト選択を検出
  useEffect(() => {
    if (!editable) return;

    const handleMouseUp = () => {
      const selection = window.getSelection();
      const text = selection?.toString().trim();

      if (text && text.length > 0 && text.length < 100) {
        const range = selection?.getRangeAt(0);
        const rect = range?.getBoundingClientRect();

        if (rect) {
          setSelectedText(text);
          setPopupPosition({
            x: rect.left + rect.width / 2,
            y: rect.bottom,
          });
        }
      }
    };

    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [editable]);

  // 登録済み単語の位置を検出（読み取り専用モードのみ）
  useEffect(() => {
    if (editable || !editorRef.current || entries.length === 0) {
      setWordMarkers([]);
      return;
    }

    const detectWords = () => {
      const editorElement = editorRef.current;
      if (!editorElement) return;

      const markers: WordMarker[] = [];
      const editorText = editorElement.innerText || '';

      entries.forEach((entry) => {
        const word = entry.word;
        let index = 0;

        while ((index = editorText.indexOf(word, index)) !== -1) {
          // テキストノードと範囲を使って位置を取得
          const range = document.createRange();
          const walker = document.createTreeWalker(
            editorElement,
            NodeFilter.SHOW_TEXT,
            null
          );

          let currentOffset = 0;
          let foundNode: Text | null = null;
          let nodeStartOffset = 0;

          let node: Node | null;
          while ((node = walker.nextNode())) {
            const textNode = node as Text;
            const textLength = textNode.textContent?.length || 0;

            if (currentOffset + textLength > index) {
              foundNode = textNode;
              nodeStartOffset = index - currentOffset;
              break;
            }

            currentOffset += textLength;
          }

          if (foundNode) {
            try {
              range.setStart(foundNode, nodeStartOffset);
              range.setEnd(foundNode, nodeStartOffset + word.length);

              const rect = range.getBoundingClientRect();
              const editorRect = editorElement.getBoundingClientRect();

              if (rect.width > 0 && rect.height > 0) {
                markers.push({
                  word,
                  entry,
                  position: {
                    x: rect.right - editorRect.left,
                    y: rect.top - editorRect.top,
                  },
                });
              }
            } catch (e) {
              // エラーが発生した場合は無視
            }
          }

          index += word.length;
        }
      });

      setWordMarkers(markers);
    };

    // 初回実行
    setTimeout(detectWords, 300);

    // コンテンツ変更時に再実行
    const observer = new MutationObserver(() => {
      setTimeout(detectWords, 300);
    });

    if (editorRef.current) {
      observer.observe(editorRef.current, {
        childList: true,
        subtree: true,
        characterData: true,
      });
    }

    return () => observer.disconnect();
  }, [entries, editable]);

  const handleShowVocabularyPopup = () => {
    setShowPopup(true);
  };

  const handleClosePopup = () => {
    setShowPopup(false);
    setSelectedText('');
    window.getSelection()?.removeAllRanges();
  };

  // ドラッグオーバー処理
  const handleDragOver = (e: React.DragEvent) => {
    if (!editable) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (_e: React.DragEvent) => {
    setIsDragOver(false);
    // BlockNoteのデフォルトのドロップ処理に任せる
  };

  return (
    <div
      className="relative"
      ref={editorRef}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* BlockEditor */}
      <div className={`relative transition-all ${isDragOver && editable ? 'bg-blue-50 ring-2 ring-blue-400 ring-offset-2 rounded-lg' : ''}`}>
        {isDragOver && editable && (
          <div className="absolute inset-0 flex items-center justify-center bg-blue-50/50 rounded-lg z-10 pointer-events-none">
            <div className="bg-white px-4 py-2 rounded-lg shadow-lg border-2 border-blue-400">
              <p className="text-sm text-blue-700 font-medium">AIの回答をドロップ</p>
            </div>
          </div>
        )}
        <BlockEditor
          initialContent={initialContent}
          onChange={onChange}
          editable={editable}
        />

        {/* 登録済み単語の❓マーク（読み取り専用モードのみ） */}
        {!editable && wordMarkers.map((marker, index) => (
          <div
            key={`${marker.word}-${index}`}
            className="absolute cursor-help"
            style={{
              left: `${marker.position.x}px`,
              top: `${marker.position.y - 2}px`,
              transform: 'translateX(2px)',
            }}
            onMouseEnter={(e) => {
              const rect = (e.target as HTMLElement).getBoundingClientRect();
              setHoveredWord(marker.entry);
              setTooltipPosition({
                x: rect.left + rect.width / 2,
                y: rect.top,
              });
            }}
            onMouseLeave={() => {
              setHoveredWord(null);
            }}
          >
            <FiHelpCircle className="w-3.5 h-3.5 text-blue-600 hover:text-blue-700" />
          </div>
        ))}

        {/* テキスト選択時の単語登録ボタン（編集モードのみ） */}
        {editable && selectedText && !showPopup && (
          <button
            onClick={handleShowVocabularyPopup}
            className="fixed z-30 flex items-center gap-2 px-3 py-2 bg-blue-600 text-white text-sm rounded-lg shadow-lg hover:bg-blue-700 transition-colors"
            style={{
              top: `${popupPosition.y + 10}px`,
              left: `${popupPosition.x}px`,
              transform: 'translateX(-50%)',
            }}
          >
            <FiBook className="w-4 h-4" />
            単語帳に登録
          </button>
        )}
      </div>

      {/* 単語登録ポップアップ */}
      {showPopup && selectedText && (
        <VocabularyPopup
          selectedText={selectedText}
          noteId={noteId}
          onClose={handleClosePopup}
          position={popupPosition}
        />
      )}

      {/* 登録済み単語のホバーツールチップ */}
      {hoveredWord && (
        <VocabularyTooltip entry={hoveredWord} position={tooltipPosition} />
      )}
    </div>
  );
}
