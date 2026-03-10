import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { AnalysisItem } from '../../features/notes/types/note.types';
import { AnalysisItemComponent } from './AnalysisItemComponent';

interface SortableAnalysisItemProps {
  item: AnalysisItem;
  onUpdate: (itemId: string, title: string, content: any[], rating?: number, weight?: number) => void;
  onDelete: (itemId: string) => void;
}

export function SortableAnalysisItem({ item, onUpdate, onDelete }: SortableAnalysisItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      <AnalysisItemComponent
        item={item}
        onUpdate={onUpdate}
        onDelete={onDelete}
        dragHandleProps={listeners}
      />
    </div>
  );
}
