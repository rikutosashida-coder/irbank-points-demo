import { useState, useCallback } from 'react';
import type { AnnotationTool, AnnotationStroke } from '../types/pdf.types';

export interface UseAnnotationReturn {
  tool: AnnotationTool;
  color: string;
  lineWidth: number;
  strokes: AnnotationStroke[];
  setTool: (tool: AnnotationTool) => void;
  setColor: (color: string) => void;
  setLineWidth: (width: number) => void;
  addStroke: (stroke: AnnotationStroke) => void;
  undo: () => void;
  redo: () => void;
  clearAll: () => void;
  canUndo: boolean;
  canRedo: boolean;
}

export function useAnnotation(): UseAnnotationReturn {
  const [tool, setTool] = useState<AnnotationTool>('pen');
  const [color, setColor] = useState('#000000');
  const [lineWidth, setLineWidth] = useState(3);
  const [strokes, setStrokes] = useState<AnnotationStroke[]>([]);
  const [undoStack, setUndoStack] = useState<AnnotationStroke[][]>([]);
  const [redoStack, setRedoStack] = useState<AnnotationStroke[][]>([]);

  const addStroke = useCallback((stroke: AnnotationStroke) => {
    setUndoStack(prev => [...prev, strokes]);
    setRedoStack([]);
    setStrokes(prev => [...prev, stroke]);
  }, [strokes]);

  const undo = useCallback(() => {
    if (undoStack.length === 0) return;
    const prev = undoStack[undoStack.length - 1];
    setRedoStack(r => [...r, strokes]);
    setStrokes(prev);
    setUndoStack(u => u.slice(0, -1));
  }, [undoStack, strokes]);

  const redo = useCallback(() => {
    if (redoStack.length === 0) return;
    const next = redoStack[redoStack.length - 1];
    setUndoStack(u => [...u, strokes]);
    setStrokes(next);
    setRedoStack(r => r.slice(0, -1));
  }, [redoStack, strokes]);

  const clearAll = useCallback(() => {
    if (strokes.length === 0) return;
    setUndoStack(prev => [...prev, strokes]);
    setRedoStack([]);
    setStrokes([]);
  }, [strokes]);

  return {
    tool,
    color,
    lineWidth,
    strokes,
    setTool,
    setColor,
    setLineWidth,
    addStroke,
    undo,
    redo,
    clearAll,
    canUndo: undoStack.length > 0,
    canRedo: redoStack.length > 0,
  };
}
