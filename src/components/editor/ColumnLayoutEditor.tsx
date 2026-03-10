import { useState, useEffect } from 'react';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
  DragOverEvent,
  useDroppable,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable';
import { BlockEditor } from './BlockEditor';
import { SortableBlock } from './SortableBlock';

interface BlockWithColumn {
  id: string;
  column: number; // 0-based: 0, 1, 2 (カラム1, 2, 3)
  row: number; // 同じカラム内での順序
  content: any;
}

interface ColumnLayoutEditorProps {
  initialContent: any[];
  onChange: (content: any[]) => void;
  editable: boolean;
}

// ドロップ可能なカラムコンポーネント
function DroppableColumn({
  column,
  blocks,
  editable
}: {
  column: number;
  blocks: BlockWithColumn[];
  editable: boolean;
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: `column-${column}`,
  });

  return (
    <div
      ref={setNodeRef}
      className={`min-h-[200px] p-3 rounded-lg border-2 border-dashed transition-all ${
        isOver
          ? 'bg-blue-50 border-blue-400'
          : 'bg-gray-50/50 border-gray-200'
      }`}
    >
      <SortableContext
        items={blocks.map(b => b.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="space-y-2">
          {blocks.length === 0 ? (
            <div className="text-center py-12 text-gray-400 text-xs">
              ドロップしてカラムを追加
            </div>
          ) : (
            blocks.map((block) => (
              <SortableBlock
                key={block.id}
                id={block.id}
                content={block.content}
                editable={editable}
              />
            ))
          )}
        </div>
      </SortableContext>
    </div>
  );
}

export function ColumnLayoutEditor({ initialContent, onChange, editable }: ColumnLayoutEditorProps) {
  const [blocks, setBlocks] = useState<BlockWithColumn[]>([]);
  const [, setActiveId] = useState<string | null>(null);
  const [activeBlock, setActiveBlock] = useState<BlockWithColumn | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  // 初期コンテンツをブロックに変換
  useEffect(() => {
    if (initialContent && initialContent.length > 0) {
      const blocksWithColumn = initialContent.map((block, index) => {
        const column = block.props?.column ?? 0;
        const row = block.props?.row ?? index;
        return {
          id: block.id || `block-${index}`,
          column: typeof column === 'number' ? column : 0,
          row: typeof row === 'number' ? row : index,
          content: block,
        };
      });
      setBlocks(blocksWithColumn);
    } else if (initialContent && initialContent.length === 0) {
      setBlocks([]);
    }
  }, [initialContent]);

  // ブロックの変更を親に通知
  const handleBlocksChange = (newBlocks: BlockWithColumn[]) => {
    setBlocks(newBlocks);
    const updatedContent = newBlocks.map(b => ({
      ...b.content,
      props: {
        ...b.content.props,
        column: b.column,
        row: b.row,
      },
    }));
    onChange(updatedContent);
  };

  // ドラッグ開始
  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    setActiveId(active.id as string);

    const draggedBlock = blocks.find(b => b.id === active.id);
    setActiveBlock(draggedBlock || null);
  };

  // ドラッグ中
  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    // カラムへのドロップの場合
    const overColumnMatch = overId.match(/^column-(\d)$/);
    if (overColumnMatch) {
      const targetColumn = parseInt(overColumnMatch[1]);
      const activeBlock = blocks.find(b => b.id === activeId);

      if (activeBlock && activeBlock.column !== targetColumn) {
        const columnBlocks = blocks.filter(b => b.column === targetColumn);
        const maxRow = columnBlocks.length > 0
          ? Math.max(...columnBlocks.map(b => b.row)) + 1
          : 0;

        const updatedBlocks = blocks.map(block =>
          block.id === activeId
            ? { ...block, column: targetColumn, row: maxRow }
            : block
        );
        setBlocks(updatedBlocks);
      }
    }

    // 同じカラム内での並び替え
    else {
      const activeBlock = blocks.find(b => b.id === activeId);
      const overBlock = blocks.find(b => b.id === overId);

      if (activeBlock && overBlock && activeBlock.column === overBlock.column) {
        const columnBlocks = blocks
          .filter(b => b.column === activeBlock.column)
          .sort((a, b) => a.row - b.row);

        const oldIndex = columnBlocks.findIndex(b => b.id === activeId);
        const newIndex = columnBlocks.findIndex(b => b.id === overId);

        if (oldIndex !== newIndex) {
          const reorderedColumnBlocks = arrayMove(columnBlocks, oldIndex, newIndex)
            .map((block, index) => ({ ...block, row: index }));

          const otherBlocks = blocks.filter(b => b.column !== activeBlock.column);
          const newBlocks = [...otherBlocks, ...reorderedColumnBlocks];
          setBlocks(newBlocks);
        }
      }
      // 別のカラムのブロックの上にドロップ
      else if (activeBlock && overBlock && activeBlock.column !== overBlock.column) {
        const targetColumn = overBlock.column;
        const columnBlocks = blocks
          .filter(b => b.column === targetColumn)
          .sort((a, b) => a.row - b.row);

        const overIndex = columnBlocks.findIndex(b => b.id === overId);

        // 他のブロックのrowを更新
        const updatedBlocks = blocks.map(block => {
          if (block.id === activeId) {
            return { ...block, column: targetColumn, row: overIndex };
          }
          if (block.column === targetColumn && block.row >= overIndex) {
            return { ...block, row: block.row + 1 };
          }
          return block;
        });

        setBlocks(updatedBlocks);
      }
    }
  };

  // ドラッグ終了
  const handleDragEnd = (_event: DragEndEvent) => {
    setActiveId(null);
    setActiveBlock(null);

    // rowを正規化（0から連番にする）
    const normalizedBlocks = [...blocks];
    for (let col = 0; col < 3; col++) {
      const columnBlocks = normalizedBlocks
        .filter(b => b.column === col)
        .sort((a, b) => a.row - b.row);

      columnBlocks.forEach((block, index) => {
        const blockIndex = normalizedBlocks.findIndex(b => b.id === block.id);
        if (blockIndex !== -1) {
          normalizedBlocks[blockIndex] = { ...block, row: index };
        }
      });
    }

    handleBlocksChange(normalizedBlocks);
  };

  // カラムごとにブロックをグループ化してソート
  const getBlocksByColumn = (column: number) => {
    return blocks
      .filter(b => b.column === column)
      .sort((a, b) => a.row - b.row);
  };

  // BlockEditorが空の場合のフォールバック
  if (!blocks || blocks.length === 0) {
    return (
      <div className="space-y-3">
        <BlockEditor
          initialContent={initialContent}
          onChange={onChange}
          editable={editable}
        />
      </div>
    );
  }

  // カラムレイアウト表示
  return (
    <div className="space-y-3">
      {editable && (
        <div className="text-xs text-blue-600 bg-blue-50 p-2 rounded border border-blue-200">
          💡 ブロック左の ⊕ アイコンをドラッグして、横に並べることができます（最大3カラム）
        </div>
      )}

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="grid grid-cols-3 gap-3">
          {[0, 1, 2].map((columnNum) => (
            <DroppableColumn
              key={columnNum}
              column={columnNum}
              blocks={getBlocksByColumn(columnNum)}
              editable={editable}
            />
          ))}
        </div>

        <DragOverlay>
          {activeBlock ? (
            <div className="bg-white p-3 rounded-lg shadow-xl border-2 border-blue-400 opacity-90">
              <SortableBlock
                id={activeBlock.id}
                content={activeBlock.content}
                editable={false}
              />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
