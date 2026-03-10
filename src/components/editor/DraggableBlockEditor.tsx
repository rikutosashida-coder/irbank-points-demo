import { BlockEditor } from './BlockEditor';

interface DraggableBlockEditorProps {
  initialContent: any[];
  onChange: (content: any[]) => void;
  editable: boolean;
}

export function DraggableBlockEditor({ initialContent, onChange, editable }: DraggableBlockEditorProps) {
  // BlockEditorをそのまま使用
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
